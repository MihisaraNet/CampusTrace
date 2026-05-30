const express = require('express');
const router = express.Router();
const {
  createFoundItem,
  getFoundItems,
  getFoundItemById,
  updateFoundItem,
  deleteFoundItem,
  getMyFoundItems,
} = require('../controllers/foundController');
const { protect } = require('../middleware/auth');
const { upload } = require('../middleware/upload');

router.get('/my', protect, getMyFoundItems);
router.route('/').get(getFoundItems).post(protect, upload.single('image'), createFoundItem);
router
  .route('/:id')
  .get(getFoundItemById)
  .put(protect, upload.single('image'), updateFoundItem)
  .delete(protect, deleteFoundItem);

module.exports = router;
