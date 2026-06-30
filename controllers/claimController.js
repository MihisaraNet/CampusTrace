const asyncHandler = require('express-async-handler');
const Claim = require('../models/Claim');
const LostItem = require('../models/LostItem');
const FoundItem = require('../models/FoundItem');

// @desc    Submit a claim for a found item
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
    claimReason,
    proofDetails,
    studentIdProvided,
  });

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
  const query = status ? { status } : {};
  const skip = (Number(page) - 1) * Number(limit);

  const [claims, total] = await Promise.all([
    Claim.find(query)
      .populate('userId', 'name email studentId')
      .populate({ path: 'itemId', select: 'itemName category image status' })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    Claim.countDocuments(query),
  ]);

  res.json({ claims, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
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
  claim.adminResponse = adminResponse || '';
  claim.reviewedBy = req.user._id;
  claim.reviewedAt = new Date();

  // If approved, update item status
  if (status === 'approved') {
    const Model = claim.itemType === 'LostItem' ? LostItem : FoundItem;
    await Model.findByIdAndUpdate(claim.itemId, {
      status: claim.itemType === 'LostItem' ? 'matched' : 'claimed',
    });
  }

  const updated = await claim.save();
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
  await Model.findByIdAndUpdate(claim.itemId, { status: 'returned' });

  res.json({ message: 'Item marked as returned successfully' });
});

module.exports = { submitClaim, getMyClaims, getAllClaims, reviewClaim, markReturned };
