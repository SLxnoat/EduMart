const express = require('express');
const router = express.Router();
const {
  sendMessage,
  getHistory,
  submitFeedback,
  submitTicket,
  getChatbotAnalytics
} = require('../controllers/chatbotController');
const { chatbotRateLimiter } = require('../middleware/rateLimiter');

// Optional auth: if token present, middleware attaches user, otherwise continues
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const jwt = require('jsonwebtoken');
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = { id: decoded.id, email: decoded.email };
    } catch (e) {
      // Ignore token failure for public chatbot usage
    }
  }
  next();
};

router.post('/message', chatbotRateLimiter(), optionalAuth, sendMessage);
router.get('/history', optionalAuth, getHistory);
router.post('/feedback', optionalAuth, submitFeedback);
router.post('/ticket', optionalAuth, submitTicket);
router.get('/analytics', optionalAuth, getChatbotAnalytics);

module.exports = router;
