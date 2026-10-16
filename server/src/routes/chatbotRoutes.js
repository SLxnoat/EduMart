const express = require('express');
const router = express.Router();
const {
  sendMessage,
  getHistory,
  submitFeedback
} = require('../controllers/chatbotController');

// Optional auth: if token present, middleware attaches user, otherwise continues
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const jwt = require('jsonwebtoken');
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = { id: decoded.id };
    } catch (e) {
      // Ignore token failure for public chatbot usage
    }
  }
  next();
};

router.post('/message', optionalAuth, sendMessage);
router.get('/history', optionalAuth, getHistory);
router.post('/feedback', optionalAuth, submitFeedback);

module.exports = router;
