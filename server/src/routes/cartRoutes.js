const express = require('express');
const router = express.Router();
const {
  getCart,
  addItem,
  updateItemQuantity,
  removeItem,
  clearCart,
  toggleSaveForLater,
} = require('../controllers/cartController');
const { protect } = require('../middleware/authMiddleware');

// All cart endpoints require user authentication
router.use(protect);

router.get('/', getCart);
router.post('/items', addItem);
router.put('/items/:id', updateItemQuantity);
router.delete('/items/:id', removeItem);
router.delete('/', clearCart);
router.post('/save-for-later/:id', toggleSaveForLater);

module.exports = router;
