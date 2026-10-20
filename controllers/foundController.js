const asyncHandler = require('express-async-handler');
const FoundItem = require('../models/FoundItem');
const { cloudinary } = require('../middleware/upload');
const { notifyNewFoundItemPublished } = require('../services/notificationService');

const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// @desc    Create a found item report
// @route   POST /api/found
// @access  Private
const createFoundItem = asyncHandler(async (req, res) => {
  const { itemName, category, description, foundLocation, dateFound } = req.body;

  if (!itemName || !category || !description || !foundLocation || !dateFound) {
    res.status(400);
    throw new Error('Please fill in all required fields');
  }

  const imageData = req.file
    ? { url: req.file.path, publicId: req.file.filename }
    : { url: '', publicId: '' };

  const foundItem = await FoundItem.create({
    itemName: itemName.trim(),
    category,
    description: description.trim(),
    image: imageData,
    foundLocation: foundLocation.trim(),
    dateFound,
    finderId: req.user._id,
  });

  // Broadcast notification to all campus users & match lost items
  notifyNewFoundItemPublished(foundItem, req.user).catch((err) =>
    console.error('Failed to broadcast found item notification:', err)
  );

  res.status(201).json(foundItem);
});

// @desc    Get all found items (with search & filter)
// @route   GET /api/found
// @access  Public
const getFoundItems = asyncHandler(async (req, res) => {
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
    query.foundLocation = { $regex: escapeRegex(location.trim()), $options: 'i' };
  }

  const skip = (pageNum - 1) * limitNum;

  const [items, total] = await Promise.all([
    FoundItem.find(query)
      .populate('finderId', 'name email studentId')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum),
    FoundItem.countDocuments(query),
  ]);

  res.json({
    items,
    total,
    page: pageNum,
    pages: Math.ceil(total / limitNum),
  });
});

// @desc    Get single found item
// @route   GET /api/found/:id
// @access  Public
const getFoundItemById = asyncHandler(async (req, res) => {
  const item = await FoundItem.findById(req.params.id).populate(
    'finderId',
    'name email studentId'
  );

  if (!item) {
    res.status(404);
    throw new Error('Found item not found');
  }

  res.json(item);
});

// @desc    Update a found item
// @route   PUT /api/found/:id
// @access  Private (finder or admin)
const updateFoundItem = asyncHandler(async (req, res) => {
  const item = await FoundItem.findById(req.params.id);

  if (!item) {
    res.status(404);
    throw new Error('Found item not found');
  }

  if (
    item.finderId.toString() !== req.user._id.toString() &&
    req.user.role !== 'admin'
  ) {
    res.status(403);
    throw new Error('Not authorized to update this item');
  }

  if (req.file) {
    if (item.image && item.image.publicId) {
      await cloudinary.uploader.destroy(item.image.publicId);
    }
    item.image = { url: req.file.path, publicId: req.file.filename };
  }

  if (req.body.itemName) item.itemName = req.body.itemName.trim();
  if (req.body.category) item.category = req.body.category;
  if (req.body.description) item.description = req.body.description.trim();
  if (req.body.foundLocation) item.foundLocation = req.body.foundLocation.trim();
  if (req.body.dateFound) item.dateFound = req.body.dateFound;
  if (req.body.status) item.status = req.body.status;

  const updated = await item.save();
  res.json(updated);
});

// @desc    Delete a found item
// @route   DELETE /api/found/:id
// @access  Private (finder or admin)
const deleteFoundItem = asyncHandler(async (req, res) => {
  const item = await FoundItem.findById(req.params.id);

  if (!item) {
    res.status(404);
    throw new Error('Found item not found');
  }

  if (
    item.finderId.toString() !== req.user._id.toString() &&
    req.user.role !== 'admin'
  ) {
    res.status(403);
    throw new Error('Not authorized to delete this item');
  }

  if (item.image && item.image.publicId) {
    await cloudinary.uploader.destroy(item.image.publicId);
  }

  await item.deleteOne();
  res.json({ message: 'Found item removed successfully' });
});

// @desc    Get current user's found item reports
// @route   GET /api/found/my
// @access  Private
const getMyFoundItems = asyncHandler(async (req, res) => {
  const items = await FoundItem.find({ finderId: req.user._id }).sort({
    createdAt: -1,
  });
  res.json(items);
});

module.exports = {
  createFoundItem,
  getFoundItems,
  getFoundItemById,
  updateFoundItem,
  deleteFoundItem,
  getMyFoundItems,
};
