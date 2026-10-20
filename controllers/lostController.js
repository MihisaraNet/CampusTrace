const asyncHandler = require('express-async-handler');
const LostItem = require('../models/LostItem');
const { cloudinary } = require('../middleware/upload');
const { notifyNewLostItemPublished } = require('../services/notificationService');

const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// @desc    Create a lost item report
// @route   POST /api/lost
// @access  Private
const createLostItem = asyncHandler(async (req, res) => {
  const { itemName, category, description, location, dateLost } = req.body;

  if (!itemName || !category || !description || !location || !dateLost) {
    res.status(400);
    throw new Error('Please fill in all required fields');
  }

  const imageData = req.file
    ? { url: req.file.path, publicId: req.file.filename }
    : { url: '', publicId: '' };

  const lostItem = await LostItem.create({
    itemName: itemName.trim(),
    category,
    description: description.trim(),
    image: imageData,
    location: location.trim(),
    dateLost,
    ownerId: req.user._id,
  });

  // Broadcast notification to all campus users asynchronously
  notifyNewLostItemPublished(lostItem, req.user).catch((err) =>
    console.error('Failed to broadcast lost item notification:', err)
  );

  res.status(201).json(lostItem);
});

// @desc    Get all lost items (with search & filter)
// @route   GET /api/lost
// @access  Public
const getLostItems = asyncHandler(async (req, res) => {
  const { search, category, status, location, page = 1, limit = 12 } = req.query;

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 12));

  const query = {};

  if (search && search.trim()) {
    query.$text = { $search: search.trim() };
  }
  if (category) query.category = category;
  if (status) query.status = status;
  if (location && location.trim()) {
    query.location = { $regex: escapeRegex(location.trim()), $options: 'i' };
  }

  const skip = (pageNum - 1) * limitNum;

  const [items, total] = await Promise.all([
    LostItem.find(query)
      .populate('ownerId', 'name email studentId')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum),
    LostItem.countDocuments(query),
  ]);

  res.json({
    items,
    total,
    page: pageNum,
    pages: Math.ceil(total / limitNum),
  });
});

// @desc    Get single lost item
// @route   GET /api/lost/:id
// @access  Public
const getLostItemById = asyncHandler(async (req, res) => {
  const item = await LostItem.findById(req.params.id).populate(
    'ownerId',
    'name email studentId'
  );

  if (!item) {
    res.status(404);
    throw new Error('Lost item not found');
  }

  res.json(item);
});

// @desc    Update a lost item
// @route   PUT /api/lost/:id
// @access  Private (owner or admin)
const updateLostItem = asyncHandler(async (req, res) => {
  const item = await LostItem.findById(req.params.id);

  if (!item) {
    res.status(404);
    throw new Error('Lost item not found');
  }

  // Only owner or admin can update
  if (
    item.ownerId.toString() !== req.user._id.toString() &&
    req.user.role !== 'admin'
  ) {
    res.status(403);
    throw new Error('Not authorized to update this item');
  }

  // Handle image update
  if (req.file) {
    // Delete old image from Cloudinary
    if (item.image && item.image.publicId) {
      await cloudinary.uploader.destroy(item.image.publicId);
    }
    item.image = { url: req.file.path, publicId: req.file.filename };
  }

  if (req.body.itemName) item.itemName = req.body.itemName.trim();
  if (req.body.category) item.category = req.body.category;
  if (req.body.description) item.description = req.body.description.trim();
  if (req.body.location) item.location = req.body.location.trim();
  if (req.body.dateLost) item.dateLost = req.body.dateLost;
  if (req.body.status) item.status = req.body.status;

  const updated = await item.save();
  res.json(updated);
});

// @desc    Delete a lost item
// @route   DELETE /api/lost/:id
// @access  Private (owner or admin)
const deleteLostItem = asyncHandler(async (req, res) => {
  const item = await LostItem.findById(req.params.id);

  if (!item) {
    res.status(404);
    throw new Error('Lost item not found');
  }

  if (
    item.ownerId.toString() !== req.user._id.toString() &&
    req.user.role !== 'admin'
  ) {
    res.status(403);
    throw new Error('Not authorized to delete this item');
  }

  // Remove image from Cloudinary
  if (item.image && item.image.publicId) {
    await cloudinary.uploader.destroy(item.image.publicId);
  }

  await item.deleteOne();
  res.json({ message: 'Lost item removed successfully' });
});

// @desc    Get current user's lost items
// @route   GET /api/lost/my
// @access  Private
const getMyLostItems = asyncHandler(async (req, res) => {
  const items = await LostItem.find({ ownerId: req.user._id }).sort({
    createdAt: -1,
  });
  res.json(items);
});

module.exports = {
  createLostItem,
  getLostItems,
  getLostItemById,
  updateLostItem,
  deleteLostItem,
  getMyLostItems,
};
