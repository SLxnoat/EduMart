const asyncHandler = require('express-async-handler');
const { Op } = require('sequelize');
const { User, Product, Order, Review, AdminAction, Notification, SellerEarning, sequelize } = require('../models');
const { createNotification } = require('../utils/notificationHelper');

// @desc    Get system-wide KPI metrics and stats
// @route   GET /api/admin/metrics
// @access  Private/Admin
const getMetrics = asyncHandler(async (req, res) => {
  // Total and active users
  const totalUsers = await User.count();
  const activeUsers = await User.count({ where: { is_active: true } });
  const tutorsCount = await User.count({ where: { role: { [Op.in]: ['tutor', 'institute'] } } });
  const studentsCount = await User.count({ where: { role: 'student' } });

  // Product metrics
  const totalProducts = await Product.count();
  const pendingProducts = await Product.count({ where: { is_approved: false } });
  const approvedProducts = await Product.count({ where: { is_approved: true } });
  const lowStockCount = await Product.count({
    where: {
      format: { [Op.in]: ['physical', 'both'] },
      stock_quantity: { [Op.lte]: 5 }
    }
  });

  // Order & Financial metrics
  const totalOrders = await Order.count();
  let grossRevenue = 0;
  if (Order) {
    const revenueSum = await Order.sum('total_amount', {
      where: {
        payment_status: { [Op.in]: ['paid', 'completed'] }
      }
    });
    grossRevenue = parseFloat(revenueSum || 0);
  }

  // Reviews metrics
  const totalReviews = Review ? await Review.count() : 0;
  const pendingReviews = Review ? await Review.count({ where: { is_approved: false } }) : 0;

  res.json({
    users: {
      total: totalUsers,
      active: activeUsers,
      tutors: tutorsCount,
      students: studentsCount,
    },
    products: {
      total: totalProducts,
      pending: pendingProducts,
      approved: approvedProducts,
      lowStock: lowStockCount,
    },
    orders: {
      total: totalOrders,
      grossRevenue: parseFloat(grossRevenue.toFixed(2)),
    },
    reviews: {
      total: totalReviews,
      pending: pendingReviews,
    }
  });
});

// @desc    Get paginated users with optional search and role filtering
// @route   GET /api/admin/users
// @access  Private/Admin
const getUsers = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const offset = (page - 1) * limit;
  const { role, status, search } = req.query;

  const whereClause = {};

  if (role && role !== 'all') {
    whereClause.role = role;
  }

  if (status !== undefined && status !== 'all') {
    whereClause.is_active = status === 'active' || status === 'true';
  }

  if (search) {
    whereClause[Op.or] = [
      { first_name: { [Op.like]: `%${search}%` } },
      { last_name: { [Op.like]: `%${search}%` } },
      { email: { [Op.like]: `%${search}%` } }
    ];
  }

  const { count, rows: users } = await User.findAndCountAll({
    where: whereClause,
    attributes: { exclude: ['password_hash'] },
    order: [['created_at', 'DESC']],
    limit,
    offset
  });

  res.json({
    users,
    total: count,
    page,
    totalPages: Math.ceil(count / limit) || 1
  });
});

// @desc    Update user status (activate / deactivate / ban)
// @route   PUT /api/admin/users/:id/status
// @access  Private/Admin
const updateUserStatus = asyncHandler(async (req, res) => {
  const user = await User.findByPk(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  // Prevent admin from deactivating themselves
  if (user.id === req.user.id) {
    res.status(400);
    throw new Error('Cannot change status of your own admin account');
  }

  const { is_active, reason } = req.body;
  if (is_active === undefined) {
    res.status(400);
    throw new Error('is_active boolean flag is required');
  }

  user.is_active = Boolean(is_active);
  await user.save();

  // Log admin action
  if (AdminAction) {
    await AdminAction.create({
      admin_id: req.user.id,
      action_type: 'USER_STATUS_UPDATE',
      target_id: user.id,
      target_type: 'user',
      description: `User ${user.email} status changed to ${user.is_active ? 'active' : 'suspended'}. Reason: ${reason || 'Administrative decision'}`,
      metadata: { reason, is_active: user.is_active }
    });
  }

  // Send notification to the user
  await createNotification({
    userId: user.id,
    type: 'security_alert',
    title: user.is_active ? 'Account Reactivated' : 'Account Suspended',
    message: user.is_active
      ? 'Your EduMart account has been reinstated by an administrator.'
      : `Your account has been suspended. Reason: ${reason || 'Violation of platform terms of service.'}`,
    priority: 'urgent'
  });

  res.json({
    message: `User account has been ${user.is_active ? 'activated' : 'suspended'} successfully`,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      is_active: user.is_active
    }
  });
});

// @desc    Update user role
// @route   PUT /api/admin/users/:id/role
// @access  Private/Admin
const updateUserRole = asyncHandler(async (req, res) => {
  const user = await User.findByPk(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  const { role } = req.body;
  const validRoles = ['student', 'tutor', 'institute', 'admin'];

  if (!role || !validRoles.includes(role)) {
    res.status(400);
    throw new Error(`Invalid role. Valid roles are: ${validRoles.join(', ')}`);
  }

  const oldRole = user.role;
  user.role = role;
  await user.save();

  if (AdminAction) {
    await AdminAction.create({
      admin_id: req.user.id,
      action_type: 'USER_ROLE_UPDATE',
      target_id: user.id,
      target_type: 'user',
      description: `Changed role of ${user.email} from ${oldRole} to ${role}`,
      metadata: { oldRole, newRole: role }
    });
  }

  await createNotification({
    userId: user.id,
    type: 'system_announcement',
    title: 'Account Role Updated',
    message: `Your account role on EduMart has been updated to "${role}".`,
    priority: 'high'
  });

  res.json({
    message: `User role updated successfully to ${role}`,
    user: {
      id: user.id,
      email: user.email,
      role: user.role
    }
  });
});

// @desc    Get products requiring moderation or all products for admin
// @route   GET /api/admin/products
// @access  Private/Admin
const getModerationProducts = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const offset = (page - 1) * limit;
  const { status, search } = req.query;

  const whereClause = {};

  if (status === 'pending') {
    whereClause.is_approved = false;
  } else if (status === 'approved') {
    whereClause.is_approved = true;
  }

  if (search) {
    whereClause[Op.or] = [
      { title: { [Op.like]: `%${search}%` } },
      { subject: { [Op.like]: `%${search}%` } }
    ];
  }

  const { count, rows: products } = await Product.findAndCountAll({
    where: whereClause,
    include: [
      {
        model: User,
        as: 'seller',
        attributes: ['id', 'first_name', 'last_name', 'email', 'role']
      }
    ],
    order: [['created_at', 'DESC']],
    limit,
    offset
  });

  res.json({
    products,
    total: count,
    page,
    totalPages: Math.ceil(count / limit) || 1
  });
});

// @desc    Approve or reject a product listing
// @route   PUT /api/admin/products/:id/moderate
// @access  Private/Admin
const moderateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByPk(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  const { is_approved, feedback } = req.body;
  if (is_approved === undefined) {
    res.status(400);
    throw new Error('is_approved boolean is required');
  }

  product.is_approved = Boolean(is_approved);
  await product.save();

  if (AdminAction) {
    await AdminAction.create({
      admin_id: req.user.id,
      action_type: 'PRODUCT_MODERATION',
      target_id: product.id,
      target_type: 'product',
      description: `Product "${product.title}" ${product.is_approved ? 'approved' : 'rejected'}. Feedback: ${feedback || 'No remarks'}`,
      metadata: { is_approved: product.is_approved, feedback }
    });
  }

  // Notify the seller
  if (product.seller_id) {
    await createNotification({
      userId: product.seller_id,
      type: 'new_product',
      title: product.is_approved ? 'Material Approved!' : 'Material Needs Revision',
      message: product.is_approved
        ? `Your material "${product.title}" has been reviewed and approved for publication on the EduMart marketplace!`
        : `Your material "${product.title}" was not approved. Feedback: ${feedback || 'Does not meet our curriculum quality standards.'}`,
      relatedId: product.id,
      relatedType: 'product',
      priority: product.is_approved ? 'normal' : 'high'
    });
  }

  res.json({
    message: `Product has been ${product.is_approved ? 'approved' : 'rejected'} successfully`,
    product
  });
});

// @desc    Get admin audit logs
// @route   GET /api/admin/logs
// @access  Private/Admin
const getAdminLogs = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const offset = (page - 1) * limit;
  const { action_type } = req.query;

  const whereClause = {};
  if (action_type) {
    whereClause.action_type = action_type;
  }

  if (!AdminAction) {
    return res.json({ logs: [], total: 0, page: 1, totalPages: 1 });
  }

  const { count, rows: logs } = await AdminAction.findAndCountAll({
    where: whereClause,
    include: [
      {
        model: User,
        as: 'admin',
        attributes: ['id', 'first_name', 'last_name', 'email']
      }
    ],
    order: [['performed_at', 'DESC']],
    limit,
    offset
  });

  res.json({
    logs,
    total: count,
    page,
    totalPages: Math.ceil(count / limit) || 1
  });
});

module.exports = {
  getMetrics,
  getUsers,
  updateUserStatus,
  updateUserRole,
  getModerationProducts,
  moderateProduct,
  getAdminLogs
};
