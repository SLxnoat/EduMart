const asyncHandler = require('express-async-handler');
const { Coupon } = require('../models');
const { Op } = require('sequelize');

// Built-in promotional discount codes for platform promotions & seed/fallback
const BUILT_IN_COUPONS = {
  EDUMART10: {
    code: 'EDUMART10',
    description: '10% discount on all educational materials',
    discount_type: 'percentage',
    discount_value: 10,
    min_purchase: 0,
    max_discount: 50,
    is_active: true,
  },
  WELCOME20: {
    code: 'WELCOME20',
    description: 'LKR 20 off on orders of LKR 50 or more',
    discount_type: 'fixed',
    discount_value: 20,
    min_purchase: 50,
    max_discount: null,
    is_active: true,
  },
  STUDENT5: {
    code: 'STUDENT5',
    description: 'LKR 5 off on study notes over LKR 15',
    discount_type: 'fixed',
    discount_value: 5,
    min_purchase: 15,
    max_discount: null,
    is_active: true,
  },
};

// @desc    Validate coupon code and calculate discount
// @route   POST /api/coupons/validate
// @access  Public / Private
const validateCoupon = asyncHandler(async (req, res) => {
  const { code, subtotal = 0 } = req.body;

  if (!code || typeof code !== 'string' || !code.trim()) {
    res.status(400);
    throw new Error('Coupon code is required');
  }

  const normalizedCode = code.trim().toUpperCase();
  const currentSubtotal = parseFloat(subtotal) || 0;

  // 1. Search in database
  let coupon = await Coupon.findOne({
    where: {
      code: normalizedCode,
      is_active: true,
    },
  });

  // 2. Check built-in fallback if not in database
  if (!coupon && BUILT_IN_COUPONS[normalizedCode]) {
    coupon = BUILT_IN_COUPONS[normalizedCode];
  }

  if (!coupon) {
    res.status(404);
    throw new Error('Invalid or inactive promotional coupon code');
  }

  const now = new Date();
  if (coupon.start_date && new Date(coupon.start_date) > now) {
    res.status(400);
    throw new Error('This promotional coupon is not active yet');
  }

  if (coupon.end_date && new Date(coupon.end_date) < now) {
    res.status(400);
    throw new Error('This promotional coupon has expired');
  }

  const minPurchase = parseFloat(coupon.min_purchase) || 0;
  if (currentSubtotal < minPurchase) {
    res.status(400);
    throw new Error(
      `Coupon '${normalizedCode}' requires a minimum purchase of LKR ${minPurchase.toFixed(2)}`
    );
  }

  if (coupon.usage_limit && coupon.used_count >= coupon.usage_limit) {
    res.status(400);
    throw new Error('This promotional coupon has reached its maximum usage limit');
  }

  // Calculate discount amount
  let discountAmount = 0;
  const discountVal = parseFloat(coupon.discount_value);

  if (coupon.discount_type === 'percentage') {
    discountAmount = (currentSubtotal * discountVal) / 100;
    if (coupon.max_discount && discountAmount > parseFloat(coupon.max_discount)) {
      discountAmount = parseFloat(coupon.max_discount);
    }
  } else {
    // Fixed amount
    discountAmount = Math.min(currentSubtotal, discountVal);
  }

  discountAmount = parseFloat(discountAmount.toFixed(2));
  const newSubtotal = parseFloat(Math.max(0, currentSubtotal - discountAmount).toFixed(2));

  res.status(200).json({
    success: true,
    valid: true,
    data: {
      code: coupon.code,
      description: coupon.description,
      discount_type: coupon.discount_type,
      discount_value: discountVal,
      discount_amount: discountAmount,
      subtotal_before: currentSubtotal,
      subtotal_after: newSubtotal,
    },
  });
});

// @desc    Get all active public coupons
// @route   GET /api/coupons
// @access  Public
const getCoupons = asyncHandler(async (req, res) => {
  const dbCoupons = await Coupon.findAll({
    where: { is_active: true },
    attributes: ['code', 'description', 'discount_type', 'discount_value', 'min_purchase'],
  });

  const allCoupons = [
    ...Object.values(BUILT_IN_COUPONS),
    ...dbCoupons.map((c) => c.toJSON()),
  ];

  // Unique by code
  const uniqueCoupons = Array.from(
    new Map(allCoupons.map((c) => [c.code, c])).values()
  );

  res.status(200).json({
    success: true,
    data: uniqueCoupons,
  });
});

module.exports = {
  validateCoupon,
  getCoupons,
  BUILT_IN_COUPONS,
};
