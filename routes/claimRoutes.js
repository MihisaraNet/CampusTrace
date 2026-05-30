const express = require('express');
const router = express.Router();
const {
  submitClaim,
  getMyClaims,
  getAllClaims,
  reviewClaim,
  markReturned,
} = require('../controllers/claimController');
const { protect, isAdmin } = require('../middleware/auth');

router.post('/', protect, submitClaim);
router.get('/my', protect, getMyClaims);
router.get('/', protect, isAdmin, getAllClaims);
router.put('/:id/review', protect, isAdmin, reviewClaim);
router.put('/:id/return', protect, isAdmin, markReturned);

module.exports = router;
