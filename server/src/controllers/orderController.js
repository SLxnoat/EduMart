const asyncHandler = require('express-async-handler');
const { Order, OrderItem, Payment, Product, sequelize } = require('../models');
const { Op } = require('sequelize');

/**
 * Generate a unique human-readable order number
 */
const generateOrderNumber = () => {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomSuffix = Math.floor(100000 + Math.random() * 900000);
  return `EDM-${dateStr}-${randomSuffix}`;
};

// @desc    Create a new order
// @route   POST /api/orders
// @access  Private
const createOrder = asyncHandler(async (req, res) => {
  const {
    items,
    shipping_address,
    billing_address,
    shipping_cost = 0,
    tax_amount = 0,
    discount_amount = 0,
    currency = 'USD',
    notes,
  } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    res.status(400);
    throw new Error('Order must contain at least one item');
  }

  // Calculate items and subtotal
  let calculatedSubtotal = 0;
  const processedItems = [];

  for (const item of items) {
    const quantity = parseInt(item.quantity, 10) || 1;
    let unitPrice = parseFloat(item.unit_price);
    let title = item.product_title;
    let subject = item.product_subject || 'General Education';
    let gradeLevel = item.product_grade_level || 'All Grades';
    let isDigital = item.is_digital !== undefined ? !!item.is_digital : true;
    let isPhysical = item.is_physical !== undefined ? !!item.is_physical : false;

    // If product_id exists in database, verify or populate details
    if (item.product_id) {
      try {
        const dbProduct = await Product.findByPk(item.product_id);
        if (dbProduct) {
          if (isNaN(unitPrice)) unitPrice = parseFloat(dbProduct.price);
          title = title || dbProduct.title;
          subject = dbProduct.subject || subject;
          gradeLevel = dbProduct.grade_level || gradeLevel;
          isDigital = dbProduct.material_type === 'digital' || isDigital;
          isPhysical = dbProduct.material_type === 'physical' || isPhysical;
        }
      } catch (e) {
        // Continue with supplied item details
      }
    }

    if (isNaN(unitPrice) || unitPrice < 0) {
      res.status(400);
      throw new Error(`Invalid price for item: ${title || item.product_id}`);
    }

    const itemTotal = parseFloat((quantity * unitPrice).toFixed(2));
    calculatedSubtotal += itemTotal;

    processedItems.push({
      product_id: item.product_id || '00000000-0000-0000-0000-000000000000',
      quantity,
      unit_price: unitPrice,
      total_price: itemTotal,
      product_title: title || 'Educational Resource',
      product_subject: subject,
      product_grade_level: gradeLevel,
      is_digital: isDigital,
      is_physical: isPhysical,
    });
  }

  const numShipping = parseFloat(shipping_cost) || 0;
  const numTax = parseFloat(tax_amount) || 0;
  const numDiscount = parseFloat(discount_amount) || 0;
  const totalAmount = parseFloat(
    Math.max(0, calculatedSubtotal + numShipping + numTax - numDiscount).toFixed(2)
  );

  const orderNumber = generateOrderNumber();

  // Create Order and associated OrderItems
  const order = await Order.create({
    user_id: req.user.id,
    order_number: orderNumber,
    status: 'pending',
    subtotal: calculatedSubtotal,
    tax_amount: numTax,
    shipping_cost: numShipping,
    discount_amount: numDiscount,
    total_amount: totalAmount,
    currency: currency.toUpperCase(),
    payment_status: 'pending',
    shipping_address: shipping_address || null,
    billing_address: billing_address || shipping_address || null,
    notes: notes || null,
  });

  const orderItemsData = processedItems.map((pi) => ({
    ...pi,
    order_id: order.id,
  }));

  const createdItems = await OrderItem.bulkCreate(orderItemsData);

  res.status(201).json({
    success: true,
    data: {
      ...order.toJSON(),
      items: createdItems,
    },
  });
});

// @desc    Get logged in user's orders
// @route   GET /api/orders
// @access  Private
const getMyOrders = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.max(1, Math.min(50, parseInt(req.query.limit, 10) || 10));
  const offset = (page - 1) * limit;

  // If user is admin and requests all orders via ?all=true
  const whereClause = req.user.role === 'admin' && req.query.all === 'true'
    ? {}
    : { user_id: req.user.id };

  const { count, rows: orders } = await Order.findAndCountAll({
    where: whereClause,
    include: [
      { model: OrderItem, as: 'items' },
      { model: Payment, as: 'payment' },
    ],
    order: [['created_at', 'DESC']],
    limit,
    offset,
  });

  res.status(200).json({
    success: true,
    data: orders,
    pagination: {
      total: count,
      page,
      limit,
      pages: Math.ceil(count / limit),
    },
  });
});

// @desc    Get single order by ID or order_number
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const order = await Order.findOne({
    where: {
      [Op.or]: [
        { id: id },
        { order_number: id },
      ],
    },
    include: [
      { model: OrderItem, as: 'items' },
      { model: Payment, as: 'payment' },
    ],
  });

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  // Ensure user owns this order or is admin
  if (req.user.role !== 'admin' && order.user_id !== req.user.id) {
    res.status(403);
    throw new Error('Not authorized to view this order');
  }

  res.status(200).json({
    success: true,
    data: order,
  });
});

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private (Admin / Seller)
const updateOrderStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status, notes } = req.body;

  const validStatuses = [
    'pending',
    'processing',
    'paid',
    'shipped',
    'delivered',
    'cancelled',
    'refunded',
    'failed',
  ];

  if (!status || !validStatuses.includes(status)) {
    res.status(400);
    throw new Error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
  }

  const order = await Order.findByPk(id);
  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  const updateFields = { status };
  if (notes) {
    updateFields.notes = order.notes ? `${order.notes}\n${notes}` : notes;
  }
  if (status === 'paid') {
    updateFields.payment_status = 'paid';
  } else if (status === 'refunded') {
    updateFields.payment_status = 'refunded';
  }

  await order.update(updateFields);

  res.status(200).json({
    success: true,
    message: `Order status updated to ${status}`,
    data: order,
  });
});

// @desc    Cancel order (by buyer or admin)
// @route   POST /api/orders/:id/cancel
// @access  Private
const cancelOrder = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;

  const order = await Order.findByPk(id);
  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  // Ensure owner or admin
  if (req.user.role !== 'admin' && order.user_id !== req.user.id) {
    res.status(403);
    throw new Error('Not authorized to cancel this order');
  }

  if (['delivered', 'cancelled', 'refunded'].includes(order.status)) {
    res.status(400);
    throw new Error(`Cannot cancel order in '${order.status}' state`);
  }

  const cancelNote = reason ? `Cancellation reason: ${reason}` : 'Cancelled by customer';
  await order.update({
    status: 'cancelled',
    notes: order.notes ? `${order.notes}\n${cancelNote}` : cancelNote,
  });

  res.status(200).json({
    success: true,
    message: 'Order successfully cancelled',
    data: order,
  });
});

module.exports = {
  createOrder,
  getMyOrders,
  getOrderById,
  updateOrderStatus,
  cancelOrder,
};
