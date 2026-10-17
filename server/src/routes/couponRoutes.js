const express = require('express');
const router = express.Router();
const { validateCoupon, getCoupons } = require('../controllers/couponController');

// Public coupon endpoints
router.get('/', getCoupons);
router.post('/validate', validateCoupon);

module.exports = router;
