import api from './api';

/**
 * Client Email Service
 * Supports backend-mediated EmailJS dispatch, diagnostic status inspection,
 * and direct browser-side EmailJS integration.
 */

/**
 * Fetch current outbound email diagnostic status from the backend
 */
export const getEmailStatus = async () => {
  const response = await api.get('/email/status');
  return response.data;
};

/**
 * Send a test email via the backend service
 * @param {Object} options
 * @param {string} options.to - Recipient email address
 * @param {string} [options.subject] - Subject line
 * @param {string} [options.message] - Email message body
 * @param {'custom'|'verification'|'reset'|'order'} [options.templateType] - Template type
 * @param {string} [options.firstName] - Recipient name
 */
export const sendTestEmail = async ({ to, subject, message, templateType = 'custom', firstName }) => {
  const response = await api.post('/email/send-test', {
    to,
    subject,
    message,
    templateType,
    firstName
  });
  return response.data;
};

/**
 * Direct browser-side EmailJS API dispatch (zero-dependency native fetch)
 * Useful for client-side forms (e.g. contact form, inquiry modal) when needed.
 *
 * @param {Object} options
 * @param {string} [options.serviceId] - EmailJS Service ID (defaults to env var)
 * @param {string} [options.templateId] - EmailJS Template ID (defaults to env var)
 * @param {string} [options.publicKey] - EmailJS Public Key (defaults to env var)
 * @param {Object} options.templateParams - Dynamic template variables (to_name, to_email, message, etc.)
 */
export const sendDirectEmailJs = async ({
  serviceId = process.env.REACT_APP_EMAILJS_SERVICE_ID,
  templateId = process.env.REACT_APP_EMAILJS_TEMPLATE_ID,
  publicKey = process.env.REACT_APP_EMAILJS_PUBLIC_KEY,
  templateParams = {}
}) => {
  if (!serviceId || !templateId || !publicKey) {
    throw new Error('EmailJS Service ID, Template ID, and Public Key are required');
  }

  const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      service_id: serviceId,
      template_id: templateId,
      user_id: publicKey,
      template_params: templateParams
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`EmailJS failed with HTTP ${response.status}: ${errorText}`);
  }

  return { success: true, status: response.status };
};

const emailService = {
  getEmailStatus,
  sendTestEmail,
  sendDirectEmailJs
};

export default emailService;
