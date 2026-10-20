const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const LostItem = require('../models/LostItem');
const FoundItem = require('../models/FoundItem');
const Claim = require('../models/Claim');

const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// @desc    Get dashboard statistics
// @route   GET /api/admin/stats
// @access  Private/Admin
const getDashboardStats = asyncHandler(async (req, res) => {
  const [
    totalUsers,
    totalLost,
    totalFound,
    activeLost,
    availableFound,
    returnedLost,
    returnedFound,
    pendingClaims,
    approvedClaims,
    rejectedClaims,
  ] = await Promise.all([
    User.countDocuments({ role: 'student' }),
    LostItem.countDocuments(),
    FoundItem.countDocuments(),
    LostItem.countDocuments({ status: 'active' }),
    FoundItem.countDocuments({ status: 'available' }),
    LostItem.countDocuments({ status: 'returned' }),
    FoundItem.countDocuments({ status: 'returned' }),
    Claim.countDocuments({ status: 'pending' }),
    Claim.countDocuments({ status: 'approved' }),
    Claim.countDocuments({ status: 'rejected' }),
  ]);

  res.json({
    users: { total: totalUsers },
    lostItems: { total: totalLost, active: activeLost, returned: returnedLost },
    foundItems: { total: totalFound, available: availableFound, returned: returnedFound },
    claims: { pending: pendingClaims, approved: approvedClaims, rejected: rejectedClaims },
  });
});

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
const getAllUsers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, search } = req.query;
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));

  const cleanSearch = search ? escapeRegex(search.trim()) : '';
  const query = cleanSearch
    ? {
        $or: [
          { name: { $regex: cleanSearch, $options: 'i' } },
          { email: { $regex: cleanSearch, $options: 'i' } },
          { studentId: { $regex: cleanSearch, $options: 'i' } },
        ],
      }
    : {};

  const skip = (pageNum - 1) * limitNum;

  const [users, total] = await Promise.all([
    User.find(query).select('-password').sort({ createdAt: -1 }).skip(skip).limit(limitNum),
    User.countDocuments(query),
  ]);

  res.json({ users, total, page: pageNum, pages: Math.ceil(total / limitNum) });
});

// @desc    Update user role
// @route   PUT /api/admin/users/:id/role
// @access  Private/Admin
const updateUserRole = asyncHandler(async (req, res) => {
  const { role } = req.body;

  if (!['student', 'admin'].includes(role)) {
    res.status(400);
    throw new Error('Invalid role');
  }

  const user = await User.findByIdAndUpdate(
    req.params.id,
    { role },
    { new: true }
  ).select('-password');

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  res.json(user);
});

// @desc    Delete a user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  if (user.role === 'admin') {
    res.status(400);
    throw new Error('Cannot delete admin users');
  }

  await user.deleteOne();
  res.json({ message: 'User deleted successfully' });
});

// @desc    Get recent activity (latest reports)
// @route   GET /api/admin/activity
// @access  Private/Admin
const getRecentActivity = asyncHandler(async (req, res) => {
  const [recentLost, recentFound, recentClaims] = await Promise.all([
    LostItem.find().populate('ownerId', 'name').sort({ createdAt: -1 }).limit(5),
    FoundItem.find().populate('finderId', 'name').sort({ createdAt: -1 }).limit(5),
    Claim.find()
      .populate('userId', 'name')
      .populate({ path: 'itemId', select: 'itemName' })
      .sort({ createdAt: -1 })
      .limit(5),
  ]);

  res.json({ recentLost, recentFound, recentClaims });
});

module.exports = { getDashboardStats, getAllUsers, updateUserRole, deleteUser, getRecentActivity };
