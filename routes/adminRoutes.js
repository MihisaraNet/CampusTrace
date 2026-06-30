const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getAllUsers,
  updateUserRole,
  deleteUser,
  getRecentActivity,
} = require('../controllers/adminController');
const { protect, isAdmin } = require('../middleware/auth');

// All admin routes require auth + admin role
router.use(protect, isAdmin);

router.get('/stats', getDashboardStats);
router.get('/activity', getRecentActivity);
router.get('/users', getAllUsers);
router.put('/users/:id/role', updateUserRole);
router.delete('/users/:id', deleteUser);

module.exports = router;
