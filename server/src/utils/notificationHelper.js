const { Notification } = require('../models');

/**
 * Helper to dispatch multi-channel notification records safely
 */
const createNotification = async ({
  userId = null,
  type = 'system_announcement',
  title,
  message,
  relatedId = null,
  relatedType = null,
  priority = 'normal'
}) => {
  try {
    if (!Notification) return null;
    return await Notification.create({
      user_id: userId,
      type,
      title,
      message,
      related_id: relatedId,
      related_type: relatedType,
      priority,
      is_read: false
    });
  } catch (error) {
    // Non-fatal logging to ensure core operations succeed
    if (process.env.NODE_ENV !== 'test') {
      console.warn('Failed to create notification:', error.message);
    }
    return null;
  }
};

module.exports = {
  createNotification
};
