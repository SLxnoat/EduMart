const asyncHandler = require('express-async-handler');
const {
  getEmailStatus,
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendOrderConfirmationEmail,
  sendCustomEmail
} = require('../utils/emailService');

/**
 * @desc    Get current email service configuration and diagnostic status
 * @route   GET /api/email/status
 * @access  Public
 */
const getEmailConfigStatus = asyncHandler(async (req, res) => {
  const status = getEmailStatus();
  res.status(200).json({
    success: true,
    data: status
  });
});

/**
 * @desc    Send a diagnostic test email
 * @route   POST /api/email/send-test
 * @access  Public (in dev/sandbox) or Protected (Admin)
 */
const sendTestEmail = asyncHandler(async (req, res) => {
  const { to, subject, message, templateType, firstName } = req.body;

  if (!to || typeof to !== 'string' || !/^\S+@\S+\.\S+$/.test(to.trim())) {
    res.status(400);
    throw new Error('A valid recipient email address is required');
  }

  const recipient = to.trim();
  const name = firstName || 'EduMart Learner';
  let result;

  switch (templateType) {
    case 'verification':
      result = await sendVerificationEmail(recipient, name, 'test_verification_token_' + Date.now());
      break;

    case 'reset':
      result = await sendPasswordResetEmail(recipient, name, 'test_reset_token_' + Date.now());
      break;

    case 'order':
      result = await sendOrderConfirmationEmail({
        email: recipient,
        firstName: name,
        order: {
          id: 'test-order-uuid-12345',
          order_number: 'ORD-TEST-999',
          total_amount: 3500.00,
          currency: 'LKR',
          items: [
            {
              product_title: 'Combined Mathematics Revision Guide 2026',
              product_subject: 'Mathematics',
              product_grade_level: 'Grade 12/13 A/L',
              is_digital: true,
              quantity: 1,
              total_price: 3500.00
            }
          ]
        }
      });
      break;

    case 'custom':
    default:
      result = await sendCustomEmail({
        to: recipient,
        toName: name,
        subject: subject || 'EduMart Diagnostic Test Notification',
        message: message || 'This is a test notification confirming that the EduMart Outbound Email Service is working.'
      });
      break;
  }

  res.status(200).json({
    success: true,
    message: `Test email (${templateType || 'custom'}) successfully processed`,
    recipient,
    result
  });
});

module.exports = {
  getEmailConfigStatus,
  sendTestEmail
};
