const asyncHandler = require('express-async-handler');
const { Coupon, AdminAction } = require('../models');
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
  let dbCoupon = await Coupon.findOne({
    where: {
      code: normalizedCode,
    },
  });

  let coupon = dbCoupon;

  // 2. Check built-in fallback if not in database
  if (!coupon && BUILT_IN_COUPONS[normalizedCode]) {
    coupon = BUILT_IN_COUPONS[normalizedCode];
  }

  if (!coupon) {
    res.status(404);
    throw new Error('Invalid promotional coupon code');
  }

  if (!coupon.is_active) {
    res.status(400);
    throw new Error('This promotional coupon is no longer active');
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

// @desc    Get all coupons for admin management with stats
// @route   GET /api/coupons/admin
// @access  Private/Admin
const getAllAdminCoupons = asyncHandler(async (req, res) => {
  const dbCoupons = await Coupon.findAll({
    order: [['created_at', 'DESC']],
  });

  const now = new Date();
  const couponsList = dbCoupons.map((c) => c.toJSON());

  // Also include built-ins if they don't exist in DB
  Object.values(BUILT_IN_COUPONS).forEach((builtIn) => {
    if (!couponsList.some((c) => c.code === builtIn.code)) {
      couponsList.push({
        id: `builtin-${builtIn.code.toLowerCase()}`,
        ...builtIn,
        used_count: 0,
        usage_limit: null,
        created_at: new Date('2024-01-01T00:00:00Z'),
        is_builtin: true,
      });
    }
  });

  const totalCoupons = couponsList.length;
  const activeCoupons = couponsList.filter(
    (c) => c.is_active && (!c.end_date || new Date(c.end_date) > now)
  ).length;
  const totalRedemptions = couponsList.reduce(
    (acc, curr) => acc + (parseInt(curr.used_count, 10) || 0),
    0
  );

  res.status(200).json({
    success: true,
    summary: {
      total_coupons: totalCoupons,
      active_coupons: activeCoupons,
      total_redemptions: totalRedemptions,
    },
    data: couponsList,
  });
});

// @desc    Generate / Create a new promotional coupon
// @route   POST /api/coupons
// @access  Private/Admin
const createCoupon = asyncHandler(async (req, res) => {
  const {
    code,
    description,
    discount_type = 'percentage',
    discount_value,
    min_purchase = 0,
    max_discount = null,
    start_date = null,
    end_date = null,
    usage_limit = null,
    is_active = true,
  } = req.body;

  if (!code || typeof code !== 'string' || !code.trim()) {
    res.status(400);
    throw new Error('Coupon code is required');
  }

  const normalizedCode = code.trim().toUpperCase().replace(/[^A-Z0-9_\-]/g, '');
  if (!normalizedCode) {
    res.status(400);
    throw new Error('Invalid coupon code format');
  }

  const discountVal = parseFloat(discount_value);
  if (isNaN(discountVal) || discountVal <= 0) {
    res.status(400);
    throw new Error('Discount value must be a positive number');
  }

  if (discount_type === 'percentage' && discountVal > 100) {
    res.status(400);
    throw new Error('Percentage discount cannot exceed 100%');
  }

  // Check code uniqueness
  const existingCoupon = await Coupon.findOne({ where: { code: normalizedCode } });
  if (existingCoupon || BUILT_IN_COUPONS[normalizedCode]) {
    res.status(400);
    throw new Error(`Coupon code '${normalizedCode}' already exists`);
  }

  const newCoupon = await Coupon.create({
    code: normalizedCode,
    description: description ? description.trim() : null,
    discount_type,
    discount_value: discountVal,
    min_purchase: parseFloat(min_purchase) || 0.0,
    max_discount: max_discount ? parseFloat(max_discount) : null,
    start_date: start_date ? new Date(start_date) : null,
    end_date: end_date ? new Date(end_date) : null,
    usage_limit: usage_limit ? parseInt(usage_limit, 10) : null,
    used_count: 0,
    is_active: is_active !== false,
  });

  // Log admin action
  if (AdminAction && req.user) {
    try {
      await AdminAction.create({
        admin_id: req.user.id,
        action_type: 'COUPON_CREATE',
        target_id: newCoupon.id,
        target_type: 'coupon',
        description: `Generated promotional coupon code '${newCoupon.code}' (${newCoupon.discount_type === 'percentage' ? `${newCoupon.discount_value}%` : `LKR ${newCoupon.discount_value}`})`,
        metadata: {
          code: newCoupon.code,
          discount_type: newCoupon.discount_type,
          discount_value: newCoupon.discount_value,
          usage_limit: newCoupon.usage_limit,
        },
      });
    } catch (_) {}
  }

  res.status(201).json({
    success: true,
    message: `Coupon '${newCoupon.code}' generated successfully`,
    data: newCoupon,
  });
});

// @desc    Update coupon details or toggle active status
// @route   PUT /api/coupons/:id
// @access  Private/Admin
const updateCoupon = asyncHandler(async (req, res) => {
  const { id } = req.params;

  let coupon;
  if (id && id.toString().startsWith('builtin-')) {
    const rawCode = id.toString().replace('builtin-', '').toUpperCase();
    const builtIn = Object.values(BUILT_IN_COUPONS).find((c) => c.code.toUpperCase() === rawCode);
    if (!builtIn) {
      res.status(404);
      throw new Error('Coupon not found');
    }
    coupon = await Coupon.findOne({ where: { code: builtIn.code } });
    if (!coupon) {
      coupon = await Coupon.create({
        code: builtIn.code,
        description: builtIn.description,
        discount_type: builtIn.discount_type,
        discount_value: builtIn.discount_value,
        min_purchase: builtIn.min_purchase,
        max_discount: builtIn.max_discount,
        is_active: true,
      });
    }
  } else {
    coupon = await Coupon.findByPk(id);
  }

  if (!coupon) {
    res.status(404);
    throw new Error('Coupon not found');
  }

  const {
    description,
    discount_type,
    discount_value,
    min_purchase,
    max_discount,
    start_date,
    end_date,
    usage_limit,
    is_active,
  } = req.body;

  if (discount_value !== undefined) {
    const val = parseFloat(discount_value);
    if (isNaN(val) || val <= 0) {
      res.status(400);
      throw new Error('Discount value must be a positive number');
    }
    if ((discount_type || coupon.discount_type) === 'percentage' && val > 100) {
      res.status(400);
      throw new Error('Percentage discount cannot exceed 100%');
    }
    coupon.discount_value = val;
  }

  if (discount_type !== undefined) coupon.discount_type = discount_type;
  if (description !== undefined) coupon.description = description;
  if (min_purchase !== undefined) coupon.min_purchase = parseFloat(min_purchase) || 0;
  if (max_discount !== undefined) coupon.max_discount = max_discount ? parseFloat(max_discount) : null;
  if (start_date !== undefined) coupon.start_date = start_date ? new Date(start_date) : null;
  if (end_date !== undefined) coupon.end_date = end_date ? new Date(end_date) : null;
  if (usage_limit !== undefined) coupon.usage_limit = usage_limit ? parseInt(usage_limit, 10) : null;
  if (is_active !== undefined) coupon.is_active = !!is_active;

  await coupon.save();

  // Log admin action
  if (AdminAction && req.user) {
    try {
      await AdminAction.create({
        admin_id: req.user.id,
        action_type: 'COUPON_UPDATE',
        target_id: coupon.id,
        target_type: 'coupon',
        description: `Updated coupon '${coupon.code}'. Status: ${coupon.is_active ? 'Active' : 'Disabled'}`,
        metadata: { is_active: coupon.is_active, discount_value: coupon.discount_value },
      });
    } catch (_) {}
  }

  res.status(200).json({
    success: true,
    message: `Coupon '${coupon.code}' updated successfully`,
    data: coupon,
  });
});

// @desc    Delete coupon
// @route   DELETE /api/coupons/:id
// @access  Private/Admin
const deleteCoupon = asyncHandler(async (req, res) => {
  const { id } = req.params;

  let coupon;
  if (id && id.toString().startsWith('builtin-')) {
    const rawCode = id.toString().replace('builtin-', '').toUpperCase();
    const builtIn = Object.values(BUILT_IN_COUPONS).find((c) => c.code.toUpperCase() === rawCode);
    if (!builtIn) {
      res.status(404);
      throw new Error('Coupon not found');
    }
    coupon = await Coupon.findOne({ where: { code: builtIn.code } });
    if (!coupon) {
      // Mark as inactive in DB to prevent further use
      coupon = await Coupon.create({
        code: builtIn.code,
        description: builtIn.description,
        discount_type: builtIn.discount_type,
        discount_value: builtIn.discount_value,
        min_purchase: builtIn.min_purchase,
        max_discount: builtIn.max_discount,
        is_active: false,
      });
      return res.status(200).json({
        success: true,
        message: `Built-in coupon '${builtIn.code}' disabled successfully`,
      });
    }
  } else {
    coupon = await Coupon.findByPk(id);
  }

  if (!coupon) {
    res.status(404);
    throw new Error('Coupon not found');
  }

  const code = coupon.code;
  await coupon.destroy();

  // Log admin action
  if (AdminAction && req.user) {
    try {
      await AdminAction.create({
        admin_id: req.user.id,
        action_type: 'COUPON_DELETE',
        target_id: id,
        target_type: 'coupon',
        description: `Deleted promotional coupon code '${code}'`,
        metadata: { code },
      });
    } catch (_) {}
  }

  res.status(200).json({
    success: true,
    message: `Coupon '${code}' deleted successfully`,
  });
});

module.exports = {
  validateCoupon,
  getCoupons,
  getAllAdminCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  BUILT_IN_COUPONS,
};
