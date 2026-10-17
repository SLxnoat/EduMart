const express = require('express');
const router = express.Router();
const {
  createOrder,
  getMyOrders,
  getOrderById,
  updateOrderStatus,
  cancelOrder,
} = require('../controllers/orderController');
const { protect, authorize } = require('../middleware/authMiddleware');

// All order endpoints require authentication
router.use(protect);

router.post('/', createOrder);
router.get('/', getMyOrders);
router.get('/:id', getOrderById);
router.put('/:id/status', authorize('admin', 'seller'), updateOrderStatus);
router.post('/:id/cancel', cancelOrder);

module.exports = router;
