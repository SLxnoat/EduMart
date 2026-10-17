const asyncHandler = require('express-async-handler');
const { Review, Product, User, Order, OrderItem } = require('../models');
const { createNotification } = require('../utils/notificationHelper');

/**
 * Helper to recalculate and persist average rating & count for a product
 */
const recalculateProductRating = async (productId) => {
  try {
    const reviews = await Review.findAll({
      where: { product_id: productId, is_approved: true },
      attributes: ['rating']
    });

    const count = reviews.length;
    let avg = 0;
    if (count > 0) {
      const sum = reviews.reduce((acc, r) => acc + Number(r.rating), 0);
      avg = parseFloat((sum / count).toFixed(2));
    }

    await Product.update(
      { rating_average: avg, rating_count: count },
      { where: { id: productId } }
    );
  } catch (error) {
    if (process.env.NODE_ENV !== 'test') {
      console.warn('Could not recalculate product rating:', error.message);
    }
  }
};

// @desc    Get reviews for a product with rating statistics
// @route   GET /api/reviews/product/:productId
// @access  Public
const getProductReviews = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const offset = (page - 1) * limit;

  // Retrieve approved reviews
  const { count, rows: reviews } = await Review.findAndCountAll({
    where: { product_id: productId, is_approved: true },
    include: [
      {
        model: User,
        as: 'user',
        attributes: ['id', 'first_name', 'last_name', 'role']
      }
    ],
    order: [['created_at', 'DESC']],
    limit,
    offset
  });

  // Calculate rating breakdown distribution
  const allRatings = await Review.findAll({
    where: { product_id: productId, is_approved: true },
    attributes: ['rating']
  });

  const breakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  let sum = 0;
  allRatings.forEach((r) => {
    const val = Math.round(Number(r.rating));
    if (breakdown[val] !== undefined) {
      breakdown[val] += 1;
    }
    sum += Number(r.rating);
  });

  const totalReviews = allRatings.length;
  const averageRating = totalReviews > 0 ? parseFloat((sum / totalReviews).toFixed(2)) : 0;

  res.json({
    reviews,
    total: count,
    page,
    totalPages: Math.ceil(count / limit) || 1,
    summary: {
      average: averageRating,
      count: totalReviews,
      breakdown
    }
  });
});

// @desc    Submit a review for a product
// @route   POST /api/reviews/product/:productId
// @access  Private
const createReview = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { rating, title, comment } = req.body;

  if (!rating || rating < 1 || rating > 5) {
    res.status(400);
    throw new Error('Rating must be an integer between 1 and 5');
  }

  if (!comment || !comment.trim()) {
    res.status(400);
    throw new Error('Review comment is required');
  }

  const product = await Product.findByPk(productId);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  // Prevent users from reviewing their own product if tutor
  if (product.seller_id && product.seller_id === req.user.id) {
    res.status(400);
    throw new Error('Sellers cannot review their own products');
  }

  // Check if verified purchase (optional verification check)
  let isVerified = false;
  try {
    if (Order && OrderItem) {
      const purchased = await OrderItem.findOne({
        where: { product_id: productId },
        include: [
          {
            model: Order,
            as: 'order',
            where: {
              user_id: req.user.id,
              status: ['delivered', 'completed', 'processing']
            }
          }
        ]
      });
      if (purchased) {
        isVerified = true;
      }
    }
  } catch (e) {
    // Continue if OrderItem association is absent in simple mock
  }

  // Check if user already submitted a review
  let review = await Review.findOne({
    where: {
      product_id: productId,
      user_id: req.user.id
    }
  });

  if (review) {
    // Update existing review
    review.rating = rating;
    review.title = title || review.title;
    review.comment = comment;
    review.is_verified_purchase = isVerified || review.is_verified_purchase;
    await review.save();
  } else {
    // Create new review
    review = await Review.create({
      product_id: productId,
      user_id: req.user.id,
      rating,
      title,
      comment,
      is_verified_purchase: isVerified,
      is_approved: true // Default approved
    });
  }

  // Recalculate average and total count on product
  await recalculateProductRating(productId);

  // Send notification to product seller
  if (product.seller_id) {
    await createNotification({
      userId: product.seller_id,
      type: 'review_reply',
      title: 'New Student Review!',
      message: `${req.user.first_name || 'A student'} left a ${rating}-star review on "${product.title}": "${title || comment.slice(0, 50)}"`,
      relatedId: review.id,
      relatedType: 'review',
      priority: 'normal'
    });
  }

  res.status(201).json({
    message: 'Review submitted successfully',
    review
  });
});

// @desc    Helpful vote on a review
// @route   POST /api/reviews/:id/vote
// @access  Private
const voteReview = asyncHandler(async (req, res) => {
  const review = await Review.findByPk(req.params.id);

  if (!review) {
    res.status(404);
    throw new Error('Review not found');
  }

  review.helpful_votes = (review.helpful_votes || 0) + 1;
  await review.save();

  res.json({
    message: 'Helpful vote recorded',
    helpful_votes: review.helpful_votes
  });
});

// @desc    Get reviews for moderation (Admin)
// @route   GET /api/reviews/moderation
// @access  Private/Admin
const getModerationReviews = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const offset = (page - 1) * limit;
  const { status } = req.query;

  const whereClause = {};
  if (status === 'pending') {
    whereClause.is_approved = false;
  } else if (status === 'approved') {
    whereClause.is_approved = true;
  }

  const { count, rows: reviews } = await Review.findAndCountAll({
    where: whereClause,
    include: [
      {
        model: Product,
        as: 'product',
        attributes: ['id', 'title']
      },
      {
        model: User,
        as: 'user',
        attributes: ['id', 'first_name', 'last_name', 'email']
      }
    ],
    order: [['created_at', 'DESC']],
    limit,
    offset
  });

  res.json({
    reviews,
    total: count,
    page,
    totalPages: Math.ceil(count / limit) || 1
  });
});

// @desc    Moderate review (Approve or hide)
// @route   PUT /api/reviews/:id/moderate
// @access  Private/Admin
const moderateReview = asyncHandler(async (req, res) => {
  const review = await Review.findByPk(req.params.id);

  if (!review) {
    res.status(404);
    throw new Error('Review not found');
  }

  const { is_approved } = req.body;
  if (is_approved === undefined) {
    res.status(400);
    throw new Error('is_approved boolean is required');
  }

  review.is_approved = Boolean(is_approved);
  await review.save();

  await recalculateProductRating(review.product_id);

  res.json({
    message: `Review ${review.is_approved ? 'approved' : 'hidden'} successfully`,
    review
  });
});

// @desc    Delete review
// @route   DELETE /api/reviews/:id
// @access  Private (Owner or Admin)
const deleteReview = asyncHandler(async (req, res) => {
  const review = await Review.findByPk(req.params.id);

  if (!review) {
    res.status(404);
    throw new Error('Review not found');
  }

  if (req.user.role !== 'admin' && review.user_id !== req.user.id) {
    res.status(403);
    throw new Error('Not authorized to delete this review');
  }

  const productId = review.product_id;
  await review.destroy();

  await recalculateProductRating(productId);

  res.json({ message: 'Review removed successfully' });
});

module.exports = {
  getProductReviews,
  createReview,
  voteReview,
  getModerationReviews,
  moderateReview,
  deleteReview
};
