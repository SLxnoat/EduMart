const express = require('express');
const router = express.Router();
const {
  getProductReviews,
  createReview,
  voteReview,
  getModerationReviews,
  moderateReview,
  deleteReview
} = require('../controllers/reviewController');
const { protect, admin } = require('../middleware/authMiddleware');

// Public route to get reviews for a product
router.get('/product/:productId', getProductReviews);

// Protected routes for authenticated users
router.post('/product/:productId', protect, createReview);
router.post('/:id/vote', protect, voteReview);
router.delete('/:id', protect, deleteReview);

// Admin-only moderation routes
router.get('/moderation', protect, admin, getModerationReviews);
router.put('/:id/moderate', protect, admin, moderateReview);

module.exports = router;
