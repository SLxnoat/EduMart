const express = require('express');
const router = express.Router();
const {
  getSellerDashboard,
  getSellerInventory,
  updateStock
} = require('../controllers/sellerController');
const { protect, seller } = require('../middleware/authMiddleware');

router.use(protect);
router.use(seller);

router.get('/dashboard', getSellerDashboard);
router.get('/inventory', getSellerInventory);
router.put('/inventory/:productId/stock', updateStock);

module.exports = router;
