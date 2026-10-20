const asyncHandler = require('express-async-handler');
const Notification = require('../models/Notification');

// @desc    Get user notifications
// @route   GET /api/notifications
// @access  Private
const getNotifications = asyncHandler(async (req, res) => {
  const { unreadOnly, page = 1, limit = 20 } = req.query;

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));

  const query = { recipient: req.user._id };
  if (unreadOnly === 'true') {
    query.isRead = false;
  }

  const skip = (pageNum - 1) * limitNum;

  const [notifications, total, unreadCount] = await Promise.all([
    Notification.find(query)
      .populate('sender', 'name studentId')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum),
    Notification.countDocuments(query),
    Notification.countDocuments({ recipient: req.user._id, isRead: false }),
  ]);

  res.json({
    notifications,
    total,
    unreadCount,
    page: pageNum,
    pages: Math.ceil(total / limitNum),
  });
});

// @desc    Get unread notification count
// @route   GET /api/notifications/unread-count
// @access  Private
const getUnreadCount = asyncHandler(async (req, res) => {
  const unreadCount = await Notification.countDocuments({
    recipient: req.user._id,
    isRead: false,
  });

  res.json({ unreadCount });
});

// @desc    Mark a notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
const markAsRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findOne({
    _id: req.params.id,
    recipient: req.user._id,
  });

  if (!notification) {
    res.status(404);
    throw new Error('Notification not found');
  }

  notification.isRead = true;
  await notification.save();

  const unreadCount = await Notification.countDocuments({
    recipient: req.user._id,
    isRead: false,
  });

  res.json({ notification, unreadCount });
});

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private
const markAllAsRead = asyncHandler(async (req, res) => {
  await Notification.updateMany(
    { recipient: req.user._id, isRead: false },
    { $set: { isRead: true } }
  );

  res.json({ message: 'All notifications marked as read', unreadCount: 0 });
});

// @desc    Delete a notification
// @route   DELETE /api/notifications/:id
// @access  Private
const deleteNotification = asyncHandler(async (req, res) => {
  const notification = await Notification.findOneAndDelete({
    _id: req.params.id,
    recipient: req.user._id,
  });

  if (!notification) {
    res.status(404);
    throw new Error('Notification not found');
  }

  const unreadCount = await Notification.countDocuments({
    recipient: req.user._id,
    isRead: false,
  });

  res.json({ message: 'Notification deleted successfully', unreadCount });
});

// @desc    Clear all notifications for user
// @route   DELETE /api/notifications
// @access  Private
const clearAllNotifications = asyncHandler(async (req, res) => {
  await Notification.deleteMany({ recipient: req.user._id });

  res.json({ message: 'All notifications cleared successfully', unreadCount: 0 });
});

module.exports = {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  clearAllNotifications,
};
