const asyncHandler = require('express-async-handler');
const { Cart, Product } = require('../models');

/**
 * Safely parse JSON array
 */
const safeParseArray = (val) => {
  if (!val) return [];
  if (typeof val === 'string') {
    try {
      const parsed = JSON.parse(val);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      return [];
    }
  }
  return Array.isArray(val) ? JSON.parse(JSON.stringify(val)) : [];
};

/**
 * Helper to compute cart totals
 */
const computeCartTotals = (items = []) => {
  let subtotal = 0;
  let totalItems = 0;
  let hasPhysical = false;

  items.forEach((item) => {
    const qty = parseInt(item.quantity, 10) || 1;
    const price = parseFloat(item.price) || 0;
    subtotal += qty * price;
    totalItems += qty;
    if (item.is_physical) hasPhysical = true;
  });

  const numSubtotal = parseFloat(subtotal.toFixed(2));
  const estimatedShipping = hasPhysical ? 4.5 : 0.0;
  const estimatedTax = parseFloat((numSubtotal * 0.05).toFixed(2));
  const total = parseFloat((numSubtotal + estimatedShipping + estimatedTax).toFixed(2));

  return {
    subtotal: numSubtotal,
    totalItems,
    estimatedShipping,
    estimatedTax,
    total,
  };
};

// @desc    Get user's active cart
// @route   GET /api/cart
// @access  Private
const getCart = asyncHandler(async (req, res) => {
  const [cart] = await Cart.findOrCreate({
    where: { user_id: req.user.id },
    defaults: {
      user_id: req.user.id,
      items: [],
      saved_for_later: [],
      applied_coupon: null,
    },
  });

  const items = safeParseArray(cart.items);
  const savedForLater = safeParseArray(cart.saved_for_later);
  const totals = computeCartTotals(items);

  res.status(200).json({
    success: true,
    data: {
      id: cart.id,
      items,
      saved_for_later: savedForLater,
      applied_coupon: cart.applied_coupon || null,
      ...totals,
    },
  });
});

// @desc    Add item to cart
// @route   POST /api/cart/items
// @access  Private
const addItem = asyncHandler(async (req, res) => {
  const {
    product_id,
    productId,
    title,
    price,
    quantity = 1,
    is_digital = true,
    is_physical = false,
    subject = 'General',
    grade_level = 'All Grades',
  } = req.body;

  const targetProductId = product_id || productId;

  if (!targetProductId && !title) {
    res.status(400);
    throw new Error('Product ID or Title is required');
  }

  const [cart] = await Cart.findOrCreate({
    where: { user_id: req.user.id },
    defaults: {
      user_id: req.user.id,
      items: [],
      saved_for_later: [],
      applied_coupon: null,
    },
  });

  const currentItems = safeParseArray(cart.items);
  const addQty = Math.max(1, parseInt(quantity, 10) || 1);

  let itemPrice = parseFloat(price);
  let itemTitle = title;
  let itemSubject = subject;
  let itemGrade = grade_level;
  let itemIsDigital = !!is_digital;
  let itemIsPhysical = !!is_physical;

  if (targetProductId) {
    try {
      const dbProduct = await Product.findByPk(targetProductId);
      if (dbProduct) {
        if (isNaN(itemPrice)) itemPrice = parseFloat(dbProduct.price);
        itemTitle = itemTitle || dbProduct.title;
        itemSubject = dbProduct.subject || itemSubject;
        itemGrade = dbProduct.grade_level || itemGrade;
        itemIsDigital = dbProduct.format === 'digital' || dbProduct.format === 'both' || itemIsDigital;
        itemIsPhysical = dbProduct.format === 'physical' || dbProduct.format === 'both' || itemIsPhysical;
      }
    } catch (e) {
      // Continue
    }
  }

  if (isNaN(itemPrice) || itemPrice < 0) {
    itemPrice = 0.0;
  }

  const existingIndex = currentItems.findIndex(
    (item) => (targetProductId && (item.product_id === targetProductId || item.id === targetProductId)) || item.title === itemTitle
  );

  if (existingIndex > -1) {
    currentItems[existingIndex].quantity = (currentItems[existingIndex].quantity || 1) + addQty;
  } else {
    currentItems.push({
      product_id: targetProductId || `temp-${Date.now()}`,
      title: itemTitle || 'Educational Material',
      price: itemPrice,
      quantity: addQty,
      is_digital: itemIsDigital,
      is_physical: itemIsPhysical,
      subject: itemSubject,
      grade_level: itemGrade,
    });
  }

  cart.items = currentItems;
  cart.changed('items', true);
  await cart.save();

  const totals = computeCartTotals(currentItems);

  res.status(200).json({
    success: true,
    message: 'Item added to cart',
    data: {
      id: cart.id,
      items: currentItems,
      ...totals,
    },
  });
});

// @desc    Update item quantity in cart
// @route   PUT /api/cart/items/:id
// @access  Private
const updateItemQuantity = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { quantity } = req.body;

  const cart = await Cart.findOne({ where: { user_id: req.user.id } });
  if (!cart) {
    res.status(404);
    throw new Error('Cart not found');
  }

  let currentItems = safeParseArray(cart.items);
  const newQty = parseInt(quantity, 10);

  const itemIndex = currentItems.findIndex(
    (item) => item.product_id === id || item.id === id || item.title === id
  );

  if (itemIndex === -1) {
    res.status(404);
    throw new Error('Item not found in cart');
  }

  if (newQty <= 0 || isNaN(newQty)) {
    currentItems.splice(itemIndex, 1);
  } else {
    currentItems[itemIndex].quantity = newQty;
  }

  cart.items = currentItems;
  cart.changed('items', true);
  await cart.save();

  const totals = computeCartTotals(currentItems);

  res.status(200).json({
    success: true,
    message: 'Cart updated',
    data: {
      id: cart.id,
      items: currentItems,
      ...totals,
    },
  });
});

// @desc    Remove item from cart
// @route   DELETE /api/cart/items/:id
// @access  Private
const removeItem = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const cart = await Cart.findOne({ where: { user_id: req.user.id } });
  if (!cart) {
    res.status(404);
    throw new Error('Cart not found');
  }

  let currentItems = safeParseArray(cart.items);
  let savedForLater = safeParseArray(cart.saved_for_later);

  const updatedItems = currentItems.filter(
    (item) => item.product_id !== id && item.id !== id && item.title !== id
  );
  const updatedSaved = savedForLater.filter(
    (item) => item.product_id !== id && item.id !== id && item.title !== id
  );

  cart.items = updatedItems;
  cart.saved_for_later = updatedSaved;
  cart.changed('items', true);
  cart.changed('saved_for_later', true);
  await cart.save();

  const totals = computeCartTotals(updatedItems);

  res.status(200).json({
    success: true,
    message: 'Item removed from cart',
    data: {
      id: cart.id,
      items: updatedItems,
      saved_for_later: updatedSaved,
      ...totals,
    },
  });
});

// @desc    Clear entire cart
// @route   DELETE /api/cart
// @access  Private
const clearCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ where: { user_id: req.user.id } });
  if (cart) {
    cart.items = [];
    cart.applied_coupon = null;
    cart.changed('items', true);
    await cart.save();
  }

  res.status(200).json({
    success: true,
    message: 'Cart cleared successfully',
    data: {
      items: [],
      subtotal: 0,
      totalItems: 0,
      total: 0,
    },
  });
});

// @desc    Save item for later or move back to cart
// @route   POST /api/cart/save-for-later/:id
// @access  Private
const toggleSaveForLater = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const cart = await Cart.findOne({ where: { user_id: req.user.id } });
  if (!cart) {
    res.status(404);
    throw new Error('Cart not found');
  }

  let items = safeParseArray(cart.items);
  let savedForLater = safeParseArray(cart.saved_for_later);

  const inCartIndex = items.findIndex((i) => i.product_id === id || i.id === id || i.title === id);
  if (inCartIndex > -1) {
    const [movedItem] = items.splice(inCartIndex, 1);
    savedForLater.push(movedItem);
  } else {
    const inSavedIndex = savedForLater.findIndex((i) => i.product_id === id || i.id === id || i.title === id);
    if (inSavedIndex > -1) {
      const [movedBack] = savedForLater.splice(inSavedIndex, 1);
      items.push(movedBack);
    } else {
      res.status(404);
      throw new Error('Item not found in cart or saved items');
    }
  }

  cart.items = items;
  cart.saved_for_later = savedForLater;
  cart.changed('items', true);
  cart.changed('saved_for_later', true);
  await cart.save();

  const totals = computeCartTotals(items);

  res.status(200).json({
    success: true,
    data: {
      items,
      saved_for_later: savedForLater,
      ...totals,
    },
  });
});

module.exports = {
  getCart,
  addItem,
  updateItemQuantity,
  removeItem,
  clearCart,
  toggleSaveForLater,
};
