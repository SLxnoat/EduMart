const express = require('express');
const router = express.Router();
const {
  validateCoupon,
  getCoupons,
  getAllAdminCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
} = require('../controllers/couponController');
const { protect, admin } = require('../middleware/authMiddleware');

// Public coupon endpoints
router.get('/', getCoupons);
router.post('/validate', validateCoupon);

// Admin coupon management endpoints
router.get('/admin', protect, admin, getAllAdminCoupons);
router.post('/', protect, admin, createCoupon);
router.put('/:id', protect, admin, updateCoupon);
router.delete('/:id', protect, admin, deleteCoupon);

module.exports = router;
