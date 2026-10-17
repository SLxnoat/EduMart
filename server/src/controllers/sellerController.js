const asyncHandler = require('express-async-handler');
const { Op } = require('sequelize');
const { Product, Order, OrderItem, Review, User, SellerEarning, DigitalAsset } = require('../models');

// @desc    Get seller/tutor dashboard metrics and recent sales
// @route   GET /api/seller/dashboard
// @access  Private/Seller
const getSellerDashboard = asyncHandler(async (req, res) => {
  const sellerId = req.user.id;

  // Products authored by this seller
  const totalProducts = await Product.count({ where: { seller_id: sellerId } });
  const approvedProducts = await Product.count({ where: { seller_id: sellerId, is_approved: true } });
  const pendingProducts = await Product.count({ where: { seller_id: sellerId, is_approved: false } });
  const lowStockCount = await Product.count({
    where: {
      seller_id: sellerId,
      format: { [Op.in]: ['physical', 'both'] },
      stock_quantity: { [Op.lte]: 5 }
    }
  });

  // Calculate earnings and order count
  let netEarnings = 0;
  let grossSales = 0;
  let totalSalesCount = 0;

  // If SellerEarning table has records for this seller
  if (SellerEarning) {
    const earningsSum = await SellerEarning.sum('net_earnings', { where: { seller_id: sellerId } });
    const grossSum = await SellerEarning.sum('sale_amount', { where: { seller_id: sellerId } });
    const count = await SellerEarning.count({ where: { seller_id: sellerId } });
    if (count > 0) {
      netEarnings = parseFloat(earningsSum || 0);
      grossSales = parseFloat(grossSum || 0);
      totalSalesCount = count;
    }
  }

  // If no SellerEarning entries yet, calculate directly from OrderItem where product.seller_id == sellerId
  if (totalSalesCount === 0 && OrderItem) {
    try {
      const sellerProducts = await Product.findAll({
        where: { seller_id: sellerId },
        attributes: ['id']
      });
      const productIds = sellerProducts.map((p) => p.id);

      if (productIds.length > 0) {
        const soldItems = await OrderItem.findAll({
          where: { product_id: { [Op.in]: productIds } }
        });
        totalSalesCount = soldItems.length;
        grossSales = soldItems.reduce((acc, item) => acc + parseFloat(item.total_price || 0), 0);
        // Default platform fee 10%, tutor keeps 90%
        netEarnings = grossSales * 0.90;
      }
    } catch (e) {
      // Continue safely
    }
  }

  // Recent reviews on seller's products
  let recentReviews = [];
  try {
    const sellerProducts = await Product.findAll({
      where: { seller_id: sellerId },
      attributes: ['id']
    });
    const productIds = sellerProducts.map((p) => p.id);

    if (productIds.length > 0) {
      recentReviews = await Review.findAll({
        where: { product_id: { [Op.in]: productIds } },
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'first_name', 'last_name']
          },
          {
            model: Product,
            as: 'product',
            attributes: ['id', 'title']
          }
        ],
        order: [['created_at', 'DESC']],
        limit: 5
      });
    }
  } catch (e) {
    // Continue safely
  }

  res.json({
    metrics: {
      totalProducts,
      approvedProducts,
      pendingProducts,
      lowStockCount,
      totalSalesCount,
      grossSales: parseFloat(grossSales.toFixed(2)),
      netEarnings: parseFloat(netEarnings.toFixed(2))
    },
    recentReviews
  });
});

// @desc    Get inventory list for current seller
// @route   GET /api/seller/inventory
// @access  Private/Seller
const getSellerInventory = asyncHandler(async (req, res) => {
  const sellerId = req.user.id;
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const offset = (page - 1) * limit;

  let queryResult;
  try {
    queryResult = await Product.findAndCountAll({
      where: { seller_id: sellerId },
      include: [
        {
          model: DigitalAsset,
          as: 'digitalAssets',
          attributes: ['id', 'file_name', 'file_size', 'mime_type', 'is_preview', 'download_count']
        }
      ],
      order: [['created_at', 'DESC']],
      limit,
      offset
    });
  } catch (err) {
    queryResult = await Product.findAndCountAll({
      where: { seller_id: sellerId },
      order: [['created_at', 'DESC']],
      limit,
      offset
    });
  }

  const { count, rows: products } = queryResult;

  res.json({
    products,
    total: count,
    page,
    totalPages: Math.ceil(count / limit) || 1
  });
});

// @desc    Update stock quantity for a physical product
// @route   PUT /api/seller/inventory/:productId/stock
// @access  Private/Seller
const updateStock = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { stock_quantity } = req.body;

  if (stock_quantity === undefined || isNaN(stock_quantity) || Number(stock_quantity) < 0) {
    res.status(400);
    throw new Error('A valid non-negative stock_quantity is required');
  }

  const product = await Product.findByPk(productId);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  // Check ownership unless admin
  if (product.seller_id !== req.user.id && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to update inventory for this product');
  }

  product.stock_quantity = parseInt(stock_quantity, 10);
  await product.save();

  res.json({
    message: 'Stock updated successfully',
    product: {
      id: product.id,
      title: product.title,
      stock_quantity: product.stock_quantity
    }
  });
});

module.exports = {
  getSellerDashboard,
  getSellerInventory,
  updateStock
};
