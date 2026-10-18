const express = require('express');
const router = express.Router();
const { getEmailConfigStatus, sendTestEmail } = require('../controllers/emailController');

// Status route (public diagnostic endpoint for health and setup verification)
router.get('/status', getEmailConfigStatus);

// Test email route
router.post('/send-test', sendTestEmail);

module.exports = router;
