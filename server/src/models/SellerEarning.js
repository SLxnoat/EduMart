const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const SellerEarning = sequelize.define('SellerEarning', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    seller_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    order_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    product_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      validate: { min: 1 },
    },
    sale_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: { min: 0 },
    },
    platform_fee: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },
    payment_processing_fee: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },
    net_earnings: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: { min: 0 },
    },
    status: {
      type: DataTypes.ENUM('pending', 'available', 'paid', 'held', 'refunded'),
      allowNull: false,
      defaultValue: 'available',
    },
  }, {
    tableName: 'seller_earnings',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  });

  SellerEarning.associate = (models) => {
    SellerEarning.belongsTo(models.User, { foreignKey: 'seller_id', as: 'seller' });
    SellerEarning.belongsTo(models.Order, { foreignKey: 'order_id', as: 'order' });
    SellerEarning.belongsTo(models.Product, { foreignKey: 'product_id', as: 'product' });
  };

  return SellerEarning;
};
