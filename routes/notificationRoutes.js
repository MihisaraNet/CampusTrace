const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  clearAllNotifications,
} = require('../controllers/notificationController');

// All notification routes are protected
router.use(protect);

router.route('/')
  .get(getNotifications)
  .delete(clearAllNotifications);

router.get('/unread-count', getUnreadCount);
router.put('/read-all', markAllAsRead);
router.put('/:id/read', markAsRead);
router.delete('/:id', deleteNotification);

module.exports = router;
