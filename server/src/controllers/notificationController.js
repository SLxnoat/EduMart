const asyncHandler = require('express-async-handler');
const { Op } = require('sequelize');
const { Notification, User, AdminAction } = require('../models');

// @desc    Get current user's notifications
// @route   GET /api/notifications
// @access  Private
const getNotifications = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const offset = (page - 1) * limit;
  const unreadOnly = req.query.unread === 'true';

  const whereClause = {
    [Op.or]: [
      { user_id: req.user.id },
      { user_id: null } // Global announcements
    ]
  };

  if (unreadOnly) {
    whereClause.is_read = false;
  }

  if (req.query.type && req.query.type !== 'all') {
    whereClause.type = req.query.type;
  }

  const { count, rows: notifications } = await Notification.findAndCountAll({
    where: whereClause,
    order: [['created_at', 'DESC']],
    limit,
    offset
  });

  const unreadCount = await Notification.count({
    where: {
      [Op.or]: [
        { user_id: req.user.id },
        { user_id: null }
      ],
      is_read: false
    }
  });

  res.json({
    notifications,
    total: count,
    unreadCount,
    page,
    totalPages: Math.ceil(count / limit) || 1
  });
});

// @desc    Mark a notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
const markRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findByPk(req.params.id);

  if (!notification) {
    res.status(404);
    throw new Error('Notification not found');
  }

  if (notification.user_id && notification.user_id !== req.user.id) {
    res.status(403);
    throw new Error('Not authorized to access this notification');
  }

  notification.is_read = true;
  notification.read_at = new Date();
  await notification.save();

  res.json({
    message: 'Notification marked as read',
    notification
  });
});

// @desc    Mark all user notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private
const markAllRead = asyncHandler(async (req, res) => {
  await Notification.update(
    { is_read: true, read_at: new Date() },
    {
      where: {
        [Op.or]: [
          { user_id: req.user.id },
          { user_id: null }
        ],
        is_read: false
      }
    }
  );

  res.json({ message: 'All notifications marked as read' });
});

// @desc    Broadcast platform announcement (Admin)
// @route   POST /api/notifications/broadcast
// @access  Private/Admin
const broadcastNotification = asyncHandler(async (req, res) => {
  const { title, message, priority = 'normal', target_role } = req.body;

  if (!title || !message) {
    res.status(400);
    throw new Error('Title and message are required for announcement');
  }

  let createdCount = 0;

  if (target_role && target_role !== 'all') {
    // Deliver to users matching target_role
    const targetUsers = await User.findAll({
      where: { role: target_role, is_active: true },
      attributes: ['id']
    });

    const entries = targetUsers.map((u) => ({
      user_id: u.id,
      type: 'system_announcement',
      title,
      message,
      priority,
      is_read: false
    }));

    if (entries.length > 0) {
      await Notification.bulkCreate(entries);
      createdCount = entries.length;
    }
  } else {
    // Global broadcast (single notification with user_id: null)
    await Notification.create({
      user_id: null,
      type: 'system_announcement',
      title,
      message,
      priority,
      is_read: false
    });
    createdCount = 1;
  }

  if (AdminAction) {
    await AdminAction.create({
      admin_id: req.user.id,
      action_type: 'BROADCAST_ANNOUNCEMENT',
      target_type: 'notification',
      description: `Broadcasted announcement: "${title}" to ${target_role || 'all users'}`
    });
  }

  res.status(201).json({
    message: 'Broadcast announcement dispatched successfully',
    recipientsCount: createdCount
  });
});

// @desc    Delete notification
// @route   DELETE /api/notifications/:id
// @access  Private
const deleteNotification = asyncHandler(async (req, res) => {
  const notification = await Notification.findByPk(req.params.id);

  if (!notification) {
    res.status(404);
    throw new Error('Notification not found');
  }

  if (!notification.user_id && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to delete platform announcements');
  }

  if (notification.user_id && notification.user_id !== req.user.id && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to delete this notification');
  }

  await notification.destroy();

  res.json({ message: 'Notification deleted successfully' });
});

module.exports = {
  getNotifications,
  markRead,
  markAllRead,
  broadcastNotification,
  deleteNotification
};
