const asyncHandler = require('express-async-handler');
const path = require('path');
const fs = require('fs');
const { Order, OrderItem, Payment, Product, DigitalAsset, User, Coupon, sequelize } = require('../models');
const { Op } = require('sequelize');
const { createNotification } = require('../utils/notificationHelper');
const { sendOrderConfirmationEmail } = require('../utils/emailService');
const { BUILT_IN_COUPONS } = require('./couponController');

/**
 * Generate a unique human-readable order number
 */
const generateOrderNumber = () => {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomSuffix = Math.floor(100000 + Math.random() * 900000);
  return `EDM-${dateStr}-${randomSuffix}`;
};

/**
 * Generate a unique human-readable invoice number
 */
const generateInvoiceNumber = () => {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `INV-${dateStr}-${randomSuffix}`;
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
    currency = process.env.DEFAULT_CURRENCY || 'LKR',
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
    let unitPrice = item.unit_price !== undefined ? parseFloat(item.unit_price) : (item.price !== undefined ? parseFloat(item.price) : NaN);
    let title = item.product_title || item.title;
    let subject = item.product_subject || item.subject || 'General Education';
    let gradeLevel = item.product_grade_level || item.grade_level || 'All Grades';
    let isDigital = item.is_digital !== undefined ? !!item.is_digital : true;
    let isPhysical = item.is_physical !== undefined ? !!item.is_physical : false;

    const prodId = item.product_id || item.productId;

    // If product_id exists in database, verify or populate details
    if (prodId) {
      try {
        const dbProduct = await Product.findByPk(prodId);
        if (dbProduct) {
          if (isNaN(unitPrice)) unitPrice = parseFloat(dbProduct.price);
          title = title || dbProduct.title;
          subject = dbProduct.subject || subject;
          gradeLevel = dbProduct.grade_level || gradeLevel;
          if (dbProduct.format) {
            isDigital = dbProduct.format === 'digital' || dbProduct.format === 'both';
            isPhysical = dbProduct.format === 'physical' || dbProduct.format === 'both';
          } else if (dbProduct.material_type) {
            isDigital = dbProduct.material_type === 'digital';
            isPhysical = dbProduct.material_type === 'physical';
          }
        }
      } catch (e) {
        // Continue with supplied item details
      }
    }

    if (isNaN(unitPrice) || unitPrice < 0) {
      res.status(400);
      throw new Error(`Invalid price for item: ${title || prodId}`);
    }

    const itemTotal = parseFloat((quantity * unitPrice).toFixed(2));
    calculatedSubtotal += itemTotal;

    processedItems.push({
      product_id: prodId || '00000000-0000-0000-0000-000000000000',
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

  // Authoritative server-side coupon validation & discount calculation
  let numDiscount = 0;
  let normalizedCouponCode = null;
  let appliedCouponModel = null;

  const rawCouponCode = req.body.coupon_code || req.body.couponCode;
  if (rawCouponCode && typeof rawCouponCode === 'string' && rawCouponCode.trim()) {
    normalizedCouponCode = rawCouponCode.trim().toUpperCase();
    let coupon = await Coupon.findOne({ where: { code: normalizedCouponCode } });
    if (!coupon && BUILT_IN_COUPONS && BUILT_IN_COUPONS[normalizedCouponCode]) {
      coupon = BUILT_IN_COUPONS[normalizedCouponCode];
    }

    if (coupon) {
      if (!coupon.is_active) {
        res.status(400);
        throw new Error(`Promotional coupon '${normalizedCouponCode}' is no longer active`);
      }

      const now = new Date();
      if (coupon.start_date && new Date(coupon.start_date) > now) {
        res.status(400);
        throw new Error(`Promotional coupon '${normalizedCouponCode}' is not active yet`);
      }
      if (coupon.end_date && new Date(coupon.end_date) < now) {
        res.status(400);
        throw new Error(`Promotional coupon '${normalizedCouponCode}' has expired`);
      }
      if (coupon.usage_limit && coupon.used_count >= coupon.usage_limit) {
        res.status(400);
        throw new Error(`Promotional coupon '${normalizedCouponCode}' has reached its maximum usage limit`);
      }

      const minPurchase = parseFloat(coupon.min_purchase) || 0;
      if (calculatedSubtotal < minPurchase) {
        res.status(400);
        throw new Error(`Coupon '${normalizedCouponCode}' requires a minimum purchase of LKR ${minPurchase.toFixed(2)}`);
      }

      if (coupon.discount_type === 'percentage') {
        let disc = (calculatedSubtotal * parseFloat(coupon.discount_value)) / 100;
        if (coupon.max_discount && disc > parseFloat(coupon.max_discount)) {
          disc = parseFloat(coupon.max_discount);
        }
        numDiscount = parseFloat(disc.toFixed(2));
      } else {
        numDiscount = parseFloat(Math.min(calculatedSubtotal, parseFloat(coupon.discount_value) || 0).toFixed(2));
      }

      if (coupon.id && typeof coupon.save === 'function') {
        appliedCouponModel = coupon;
      }
    } else {
      res.status(404);
      throw new Error(`Invalid promotional coupon code '${normalizedCouponCode}'`);
    }
  } else if (parseFloat(discount_amount) > 0) {
    numDiscount = 0; // Disallow arbitrary discount injection without valid coupon code
  }

  const totalAmount = parseFloat(
    Math.max(0, calculatedSubtotal + numShipping + numTax - numDiscount).toFixed(2)
  );

  const orderNumber = generateOrderNumber();
  const invoiceNumber = generateInvoiceNumber();

  const hasPhysical = processedItems.some((pi) => pi.is_physical);
  const hasDigital = processedItems.some((pi) => pi.is_digital);

  const paymentMethod = req.body.payment_method || req.body.paymentMethod;
  if (paymentMethod === 'cash_on_delivery' && hasDigital) {
    res.status(400);
    throw new Error('Cash on Delivery (COD) is only permitted for 100% physical goods. Please use an online payment method for orders containing digital materials.');
  }
  const initialMilestones = [
    {
      status: 'pending',
      label: 'Order Placed',
      timestamp: new Date().toISOString(),
      description: 'Order placed, awaiting payment confirmation.',
    },
  ];
  if (hasDigital) {
    initialMilestones.push({
      status: 'paid',
      label: 'Instant Digital Fulfillment',
      timestamp: null,
      description: 'Educational resources unlocked for authenticated instant download upon payment.',
    });
  }
  if (hasPhysical) {
    initialMilestones.push({
      status: 'processing',
      label: 'Packaging & Warehouse',
      timestamp: null,
      description: 'Order details verified, packaging physical study material pack.',
    });
    initialMilestones.push({
      status: 'shipped',
      label: 'Dispatched to Courier',
      timestamp: null,
      description: 'Handed over to delivery carrier.',
    });
    initialMilestones.push({
      status: 'delivered',
      label: 'Delivered',
      timestamp: null,
      description: 'Package delivered to shipping destination.',
    });
  }

  // Create Order and associated OrderItems
  const order = await Order.create({
    user_id: req.user.id,
    order_number: orderNumber,
    invoice_number: invoiceNumber,
    status: 'pending',
    subtotal: calculatedSubtotal,
    tax_amount: numTax,
    shipping_cost: numShipping,
    discount_amount: numDiscount,
    coupon_code: normalizedCouponCode || null,
    total_amount: totalAmount,
    currency: currency.toUpperCase(),
    payment_status: 'pending',
    shipping_address: shipping_address || null,
    billing_address: billing_address || shipping_address || null,
    notes: notes || null,
    carrier: hasPhysical ? 'PromptX Courier' : null,
    tracking_number: hasPhysical ? `PRX-${orderNumber.slice(-8)}` : null,
    estimated_delivery: hasPhysical ? new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) : null,
    delivery_milestones: initialMilestones,
  });

  const orderItemsData = processedItems.map((pi) => ({
    ...pi,
    order_id: order.id,
  }));

  const createdItems = await OrderItem.bulkCreate(orderItemsData);

  // Increment coupon usage count if applied
  if (appliedCouponModel) {
    try {
      appliedCouponModel.used_count = (appliedCouponModel.used_count || 0) + 1;
      await appliedCouponModel.save();
    } catch (_) {}
  }

  // Send notification to the customer
  await createNotification({
    userId: req.user.id,
    type: 'order_status',
    title: 'Order Placed Successfully',
    message: `Your Order #${orderNumber} containing ${processedItems.length} item(s) has been placed and is currently pending payment.`,
    relatedId: order.id,
    relatedType: 'order',
    priority: 'normal',
  });

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
    const payment = await Payment.findOne({ where: { order_id: order.id } });
    if (payment) {
      await payment.update({ status: 'completed' });
    }

    // Add Instant Digital Fulfillment milestone if order has digital items
    const items = await OrderItem.findAll({ where: { order_id: order.id } });
    const hasDigital = items.some((i) => i.is_digital);
    const milestones = Array.isArray(order.delivery_milestones) ? [...order.delivery_milestones] : [];
    if (hasDigital && !milestones.some((m) => m.label === 'Instant Digital Fulfillment')) {
      milestones.push({
        status: 'paid',
        label: 'Instant Digital Fulfillment',
        timestamp: new Date().toISOString(),
        description: 'All purchased digital study materials are authenticated and unlocked for instant download.',
      });
      updateFields.delivery_milestones = milestones;
    }

    // Send confirmation email asynchronously
    Order.findByPk(order.id, {
      include: [
        { model: OrderItem, as: 'items' },
        { model: User, as: 'user' },
      ],
    }).then((fullOrder) => {
      if (fullOrder) {
        sendOrderConfirmationEmail({
          email: fullOrder.user?.email,
          firstName: fullOrder.user?.first_name,
          order: fullOrder,
        }).catch((err) => console.warn('[EMAIL] Failed sending order confirmation:', err.message));
      }
    }).catch((err) => console.warn('[EMAIL] Error finding full order for email:', err.message));
  } else if (status === 'delivered') {
    const payment = await Payment.findOne({ where: { order_id: order.id } });
    if (payment && payment.payment_method === 'cash_on_delivery') {
      updateFields.payment_status = 'paid';
      await payment.update({ status: 'completed' });
    }
  } else if (status === 'refunded') {
    updateFields.payment_status = 'refunded';
  }

  await order.update(updateFields);

  // Send notification to customer
  await createNotification({
    userId: order.user_id,
    type: 'order_status',
    title: `Order Status: ${status.toUpperCase()}`,
    message: `Order #${order.order_number} status has been updated to "${status}".`,
    relatedId: order.id,
    relatedType: 'order',
    priority: status === 'delivered' ? 'normal' : 'high',
  });

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

  // Notify customer
  await createNotification({
    userId: order.user_id,
    type: 'order_status',
    title: 'Order Cancelled',
    message: `Order #${order.order_number} has been cancelled.${reason ? ` Reason: ${reason}` : ''}`,
    relatedId: order.id,
    relatedType: 'order',
    priority: 'normal',
  });

  res.status(200).json({
    success: true,
    message: 'Order successfully cancelled',
    data: order,
  });
});

// @desc    Securely download purchased digital educational material
// @route   GET /api/orders/:id/download/:itemId
// @access  Private
const downloadDigitalItem = asyncHandler(async (req, res) => {
  const { id, itemId } = req.params;

  const order = await Order.findOne({
    where: {
      [Op.or]: [{ id }, { order_number: id }],
    },
    include: [{ model: OrderItem, as: 'items' }],
  });

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  if (req.user.role !== 'admin' && order.user_id !== req.user.id) {
    res.status(403);
    throw new Error('Not authorized to download items from this order');
  }

  if (order.payment_status !== 'paid' && order.status !== 'paid') {
    res.status(403);
    throw new Error('Payment required before accessing digital study resources');
  }

  const item = order.items?.find((i) => i.id === itemId);
  if (!item) {
    res.status(404);
    throw new Error('Educational resource not found in this order');
  }

  if (!item.is_digital) {
    res.status(400);
    throw new Error('Selected item is a physical good and cannot be downloaded digitally');
  }

  // Check if a genuine uploaded digital asset exists on disk
  if (item.product_id) {
    try {
      const asset = await DigitalAsset.findOne({
        where: { product_id: item.product_id, is_preview: false }
      });
      if (asset && asset.file_path && fs.existsSync(asset.file_path)) {
        await asset.increment('download_count');
        return res.download(path.resolve(asset.file_path), asset.file_name);
      }
    } catch (err) {
      // In minimal test fixtures or before table sync, fall back to stamped PDF generator
    }
  }

  const safeFilename = `${(item.product_title || 'study_material').replace(/[^a-zA-Z0-9_\-]/g, '_')}.pdf`;
  const pdfBytes = Buffer.from(
    `%PDF-1.4\n% EduMart Authenticated Digital Material Pack\n` +
    `Document: ${item.product_title}\n` +
    `Subject: ${item.product_subject} | Grade Level: ${item.product_grade_level}\n` +
    `Purchased By: ${req.user.email} (Order: #${order.order_number})\n` +
    `Authorized License ID: EDM-LIC-${order.id.slice(0, 8)}-${item.id.slice(0, 8)}\n` +
    `Timestamp: ${new Date().toISOString()}\n%%EOF`
  );

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${safeFilename}"`);
  res.setHeader('Content-Length', pdfBytes.length);
  res.status(200).send(pdfBytes);
});

// @desc    Update order physical shipment tracking details
// @route   PUT /api/orders/:id/tracking
// @access  Private (Admin / Seller)
const updateOrderTracking = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { carrier, tracking_number, estimated_delivery, status, milestone_label, milestone_description } = req.body;

  const order = await Order.findByPk(id);
  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  const currentMilestones = Array.isArray(order.delivery_milestones) ? [...order.delivery_milestones] : [];
  if (milestone_label) {
    currentMilestones.push({
      status: status || 'shipped',
      label: milestone_label,
      timestamp: new Date().toISOString(),
      description: milestone_description || `Package handled by ${carrier || order.carrier || 'carrier'}.`,
    });
  }

  const updateData = {
    delivery_milestones: currentMilestones,
  };
  if (carrier) updateData.carrier = carrier;
  if (tracking_number) updateData.tracking_number = tracking_number;
  if (estimated_delivery) updateData.estimated_delivery = new Date(estimated_delivery);
  if (status) {
    updateData.status = status;
    if (status === 'delivered') {
      const payment = await Payment.findOne({ where: { order_id: order.id } });
      if (payment && payment.payment_method === 'cash_on_delivery') {
        updateData.payment_status = 'paid';
        await payment.update({ status: 'completed' });
      }
    }
  }

  await order.update(updateData);

  // Send real-time notification to the customer
  await createNotification({
    userId: order.user_id,
    type: 'order_update',
    title: 'Shipment Tracking Update',
    message: `Order #${order.order_number} tracking updated: ${milestone_label || status || 'In Transit'} via ${order.carrier || carrier || 'Courier'}.`,
    relatedId: order.id,
    relatedType: 'order',
  });

  res.status(200).json({
    success: true,
    message: 'Shipment tracking information updated successfully',
    data: order,
  });
});

// @desc    Get structured tax invoice / payment receipt for order
// @route   GET /api/orders/:id/invoice
// @access  Private
const getOrderInvoice = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const order = await Order.findOne({
    where: {
      [Op.or]: [{ id }, { order_number: id }],
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

  if (req.user.role !== 'admin' && order.user_id !== req.user.id) {
    res.status(403);
    throw new Error('Not authorized to view invoice for this order');
  }

  const invoice = {
    invoice_number: order.invoice_number || `INV-${order.order_number}`,
    issue_date: order.created_at,
    order_number: order.order_number,
    payment_status: order.payment_status,
    payment_method: order.payment?.payment_method || 'credit_card',
    provider_transaction_id: order.payment?.provider_payment_id || null,
    currency: order.currency || process.env.DEFAULT_CURRENCY || 'LKR',
    seller: {
      company_name: 'EduMart Marketplace Platform Ltd.',
      tax_id: 'LK-VAT-992384',
      email: 'billing@edumart.lk',
      address: 'No. 120, High Level Road, Colombo 06, Sri Lanka',
    },
    customer: {
      email: req.user.email,
      name: order.shipping_address?.fullName || `${req.user.firstName || ''} ${req.user.lastName || ''}`.trim() || req.user.email,
      shipping_address: order.shipping_address,
      billing_address: order.billing_address || order.shipping_address,
    },
    items: order.items?.map((item) => ({
      id: item.id,
      title: item.product_title,
      subject: item.product_subject,
      grade_level: item.product_grade_level,
      type: item.is_digital ? 'Digital E-Material' : 'Physical Printed',
      quantity: item.quantity,
      unit_price: parseFloat(item.unit_price),
      total_price: parseFloat(item.total_price),
    })),
    financials: {
      subtotal: parseFloat(order.subtotal),
      tax_amount: parseFloat(order.tax_amount),
      shipping_cost: parseFloat(order.shipping_cost),
      discount_amount: parseFloat(order.discount_amount),
      total_amount: parseFloat(order.total_amount),
    },
  };

  res.status(200).json({
    success: true,
    data: invoice,
  });
});

// @desc    Process order refund with audit trail
// @route   POST /api/orders/:id/refund
// @access  Private (Admin / Authorized Seller)
const refundOrder = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { reason, amount } = req.body;

  const order = await Order.findByPk(id, {
    include: [{ model: Payment, as: 'payment' }],
  });

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  if (order.status === 'refunded') {
    res.status(400);
    throw new Error('Order has already been refunded');
  }

  const refundAmount = amount ? parseFloat(amount) : parseFloat(order.total_amount);
  const refundNote = `Refund of LKR ${refundAmount.toFixed(2)} processed on ${new Date().toISOString()}. Reason: ${reason || 'Approved customer refund'}`;

  // Update Payment record if present
  if (order.payment) {
    await order.payment.update({
      status: 'refunded',
      gateway_response: {
        ...(order.payment.gateway_response || {}),
        refunded: true,
        refund_amount: refundAmount,
        refund_reason: reason || 'Customer dispute / cancellation approved',
        refund_timestamp: new Date().toISOString(),
      },
    });
  }

  await order.update({
    status: 'refunded',
    payment_status: 'refunded',
    notes: order.notes ? `${order.notes}\n${refundNote}` : refundNote,
  });

  // Notify customer
  await createNotification({
    userId: order.user_id,
    type: 'order_update',
    title: 'Refund Processed',
    message: `A refund of LKR ${refundAmount.toFixed(2)} has been credited for Order #${order.order_number}. Reason: ${reason || 'Refund request approved'}.`,
    relatedId: order.id,
    relatedType: 'order',
  });

  res.status(200).json({
    success: true,
    message: 'Order refund successfully processed',
    data: {
      orderId: order.id,
      orderNumber: order.order_number,
      refundAmount,
      status: 'refunded',
    },
  });
});

// @desc    Get orders for products sold by the tutor / seller
// @route   GET /api/orders/seller
// @access  Private (Tutor, Institute, Seller, Admin)
const getSellerOrders = asyncHandler(async (req, res) => {
  const sellerId = req.user.id;

  // Find all products owned by this seller
  const sellerProducts = await Product.findAll({
    where: { seller_id: sellerId },
    attributes: ['id'],
  });
  const productIds = sellerProducts.map((p) => p.id);

  if (productIds.length === 0 && req.user.role !== 'admin') {
    return res.status(200).json({
      success: true,
      data: [],
      pagination: { total: 0, page: 1, limit: 10, pages: 0 },
    });
  }

  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.max(1, Math.min(50, parseInt(req.query.limit, 10) || 10));
  const offset = (page - 1) * limit;

  const itemWhere = req.user.role === 'admin' ? {} : { product_id: productIds };

  const { count, rows: orders } = await Order.findAndCountAll({
    include: [
      {
        model: OrderItem,
        as: 'items',
        where: itemWhere,
        required: true,
      },
      { model: Payment, as: 'payment' },
    ],
    distinct: true,
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

module.exports = {
  createOrder,
  getMyOrders,
  getOrderById,
  updateOrderStatus,
  cancelOrder,
  downloadDigitalItem,
  updateOrderTracking,
  getOrderInvoice,
  refundOrder,
  getSellerOrders,
};
