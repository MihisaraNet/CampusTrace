const asyncHandler = require('express-async-handler');
const Claim = require('../models/Claim');
const LostItem = require('../models/LostItem');
const FoundItem = require('../models/FoundItem');
const {
  notifyClaimSubmitted,
  notifyClaimReviewed,
  notifyItemReturned,
} = require('../services/notificationService');

// @desc    Submit a claim for an item
// @route   POST /api/claims
// @access  Private
const submitClaim = asyncHandler(async (req, res) => {
  const { itemId, itemType, claimReason, proofDetails, studentIdProvided } = req.body;

  if (!itemId || !itemType || !claimReason) {
    res.status(400);
    throw new Error('Item ID, item type, and claim reason are required');
  }

  if (!['LostItem', 'FoundItem'].includes(itemType)) {
    res.status(400);
    throw new Error('Invalid item type');
  }

  // Check item exists
  const Model = itemType === 'LostItem' ? LostItem : FoundItem;
  const item = await Model.findById(itemId);
  if (!item) {
    res.status(404);
    throw new Error('Item not found');
  }

  // Prevent claiming items that are already resolved/claimed/returned
  if (item.status === 'returned' || item.status === 'claimed') {
    res.status(400);
    throw new Error(`This item has already been marked as ${item.status}`);
  }

  // Prevent users from claiming items they reported themselves
  if (itemType === 'FoundItem' && item.finderId && item.finderId.toString() === req.user._id.toString()) {
    res.status(400);
    throw new Error('You cannot submit a claim for an item you reported as found');
  }
  if (itemType === 'LostItem' && item.ownerId && item.ownerId.toString() === req.user._id.toString()) {
    res.status(400);
    throw new Error('You are already the owner/reporter of this lost item');
  }

  // Prevent duplicate claims by same user
  const existingClaim = await Claim.findOne({
    itemId,
    userId: req.user._id,
    status: { $in: ['pending', 'approved'] },
  });
  if (existingClaim) {
    res.status(400);
    throw new Error('You already have an active claim for this item');
  }

  const claim = await Claim.create({
    itemId,
    itemType,
    userId: req.user._id,
    claimReason: claimReason.trim(),
    proofDetails: proofDetails ? proofDetails.trim() : '',
    studentIdProvided: studentIdProvided ? studentIdProvided.trim() : '',
  });

  // Trigger claim notifications (admins & finder)
  notifyClaimSubmitted(claim, item, req.user).catch((err) =>
    console.error('Failed to dispatch claim submitted notification:', err)
  );

  res.status(201).json(claim);
});

// @desc    Get current user's claims
// @route   GET /api/claims/my
// @access  Private
const getMyClaims = asyncHandler(async (req, res) => {
  const claims = await Claim.find({ userId: req.user._id })
    .populate({
      path: 'itemId',
      select: 'itemName category image status',
    })
    .sort({ createdAt: -1 });

  res.json(claims);
});

// @desc    Get all claims (admin)
// @route   GET /api/claims
// @access  Private/Admin
const getAllClaims = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));

  const query = status ? { status } : {};
  const skip = (pageNum - 1) * limitNum;

  const [claims, total] = await Promise.all([
    Claim.find(query)
      .populate('userId', 'name email studentId')
      .populate({ path: 'itemId', select: 'itemName category image status' })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum),
    Claim.countDocuments(query),
  ]);

  res.json({ claims, total, page: pageNum, pages: Math.ceil(total / limitNum) });
});

// @desc    Review a claim (approve/reject)
// @route   PUT /api/claims/:id/review
// @access  Private/Admin
const reviewClaim = asyncHandler(async (req, res) => {
  const { status, adminResponse } = req.body;

  if (!['approved', 'rejected'].includes(status)) {
    res.status(400);
    throw new Error('Status must be approved or rejected');
  }

  const claim = await Claim.findById(req.params.id);
  if (!claim) {
    res.status(404);
    throw new Error('Claim not found');
  }

  claim.status = status;
  claim.adminResponse = adminResponse ? adminResponse.trim() : '';
  claim.reviewedBy = req.user._id;
  claim.reviewedAt = new Date();

  // If approved, update item status
  const Model = claim.itemType === 'LostItem' ? LostItem : FoundItem;
  let item = null;
  if (status === 'approved') {
    item = await Model.findByIdAndUpdate(
      claim.itemId,
      {
        status: claim.itemType === 'LostItem' ? 'matched' : 'claimed',
      },
      { new: true }
    );
  } else {
    item = await Model.findById(claim.itemId);
  }

  const updated = await claim.save();

  // Trigger claim reviewed notification to claimant
  notifyClaimReviewed(claim, status, adminResponse, item).catch((err) =>
    console.error('Failed to dispatch claim reviewed notification:', err)
  );

  res.json(updated);
});

// @desc    Mark a claim's item as returned
// @route   PUT /api/claims/:id/return
// @access  Private/Admin
const markReturned = asyncHandler(async (req, res) => {
  const claim = await Claim.findById(req.params.id);
  if (!claim) {
    res.status(404);
    throw new Error('Claim not found');
  }

  if (claim.status !== 'approved') {
    res.status(400);
    throw new Error('Only approved claims can be marked as returned');
  }

  const Model = claim.itemType === 'LostItem' ? LostItem : FoundItem;
  const item = await Model.findByIdAndUpdate(
    claim.itemId,
    { status: 'returned' },
    { new: true }
  );

  // Trigger item returned notification to claimant
  notifyItemReturned(claim, item).catch((err) =>
    console.error('Failed to dispatch item returned notification:', err)
  );

  res.json({ message: 'Item marked as returned successfully' });
});

module.exports = { submitClaim, getMyClaims, getAllClaims, reviewClaim, markReturned };
