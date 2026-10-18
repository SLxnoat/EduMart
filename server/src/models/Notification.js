const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Notification = sequelize.define('Notification', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: true, // Nullable for global platform broadcasts
    },
    type: {
      type: DataTypes.ENUM(
        'order_status',
        'order_update',
        'payment_status',
        'shipping_update',
        'new_product',
        'promotion',
        'review_reply',
        'system_announcement',
        'password_change',
        'security_alert'
      ),
      allowNull: false,
      defaultValue: 'system_announcement',
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    is_read: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    read_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    related_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    related_type: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    priority: {
      type: DataTypes.ENUM('low', 'normal', 'high', 'urgent'),
      allowNull: false,
      defaultValue: 'normal',
    },
  }, {
    tableName: 'notifications',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  });

  Notification.associate = (models) => {
    Notification.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
  };

  return Notification;
};
