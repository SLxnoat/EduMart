const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Order = sequelize.define('Order', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    order_number: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    status: {
      type: DataTypes.ENUM('pending', 'processing', 'paid', 'shipped', 'delivered', 'cancelled', 'refunded', 'failed'),
      allowNull: false,
      defaultValue: 'pending',
    },
    subtotal: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: { min: 0 },
    },
    tax_amount: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
      validate: { min: 0 },
    },
    shipping_cost: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
      validate: { min: 0 },
    },
    discount_amount: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
      validate: { min: 0 },
    },
    total_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: { min: 0 },
    },
    currency: {
      type: DataTypes.STRING(3),
      defaultValue: 'USD',
    },
    payment_status: {
      type: DataTypes.ENUM('pending', 'processing', 'paid', 'failed', 'refunded', 'partially_refunded'),
      allowNull: false,
      defaultValue: 'pending',
    },
    shipping_address: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    billing_address: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  }, {
    tableName: 'orders',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  });

  Order.associate = (models) => {
    Order.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
    Order.hasMany(models.OrderItem, { foreignKey: 'order_id', as: 'items' });
    Order.hasOne(models.Payment, { foreignKey: 'order_id', as: 'payment' });
  };

  return Order;
};
