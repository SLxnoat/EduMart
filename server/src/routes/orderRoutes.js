const express = require('express');
const router = express.Router();
const {
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
} = require('../controllers/orderController');
const { protect, authorize } = require('../middleware/authMiddleware');

// All order endpoints require authentication
router.use(protect);

router.post('/', createOrder);
router.get('/', getMyOrders);
router.get('/seller', authorize('tutor', 'institute', 'seller', 'admin'), getSellerOrders);
router.get('/:id', getOrderById);
router.get('/:id/invoice', getOrderInvoice);
router.get('/:id/download/:itemId', downloadDigitalItem);
router.put('/:id/status', authorize('admin', 'seller', 'tutor', 'institute'), updateOrderStatus);
router.put('/:id/tracking', authorize('admin', 'seller', 'tutor', 'institute'), updateOrderTracking);
router.post('/:id/cancel', cancelOrder);
router.post('/:id/refund', authorize('admin', 'seller'), refundOrder);

module.exports = router;
