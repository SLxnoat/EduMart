const express = require('express');
const router = express.Router();
const {
  getNotifications,
  markRead,
  markAllRead,
  broadcastNotification,
  deleteNotification
} = require('../controllers/notificationController');
const { protect, admin } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/', getNotifications);
router.put('/read-all', markAllRead);
router.put('/:id/read', markRead);
router.delete('/:id', deleteNotification);

// Admin broadcast
router.post('/broadcast', admin, broadcastNotification);

module.exports = router;
