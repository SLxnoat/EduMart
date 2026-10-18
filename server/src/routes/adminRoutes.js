const express = require('express');
const router = express.Router();
const {
  getMetrics,
  getUsers,
  updateUserStatus,
  updateUserRole,
  getModerationProducts,
  moderateProduct,
  getAdminLogs
} = require('../controllers/adminController');
const { protect, admin } = require('../middleware/authMiddleware');

// All admin routes require authentication and admin role
router.use(protect);
router.use(admin);

router.get('/metrics', getMetrics);
router.get('/users', getUsers);
router.put('/users/:id/status', updateUserStatus);
router.put('/users/:id/role', updateUserRole);
router.get('/products', getModerationProducts);
router.put('/products/:id/moderate', moderateProduct);
router.get('/logs', getAdminLogs);

module.exports = router;
