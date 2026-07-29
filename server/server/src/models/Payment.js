const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Payment = sequelize.define('Payment', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    order_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: { min: 0 },
    },
    currency: {
      type: DataTypes.STRING(3),
      defaultValue: 'USD',
    },
    payment_method: {
      type: DataTypes.ENUM('credit_card', 'paypal', 'bank_transfer', 'digital_wallet'),
      allowNull: false,
    },
    provider: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    provider_payment_id: {
      type: DataTypes.STRING(255),
      unique: true,
    },
    provider_fee: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
    },
    status: {
      type: DataTypes.ENUM('pending', 'processing', 'completed', 'failed', 'refunded', 'partially_refunded'),
      allowNull: false,
      defaultValue: 'pending',
    },
    gateway_response: {
      type: DataTypes.JSON,
      allowNull: true,
    },
  }, {
    tableName: 'payments',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  });

  Payment.associate = (models) => {
    Payment.belongsTo(models.Order, { foreignKey: 'order_id', as: 'order' });
    Payment.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
  };

  return Payment;
};
