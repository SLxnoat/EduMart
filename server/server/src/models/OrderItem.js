const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const OrderItem = sequelize.define('OrderItem', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
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
      validate: { min: 1 },
    },
    unit_price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: { min: 0 },
    },
    total_price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: { min: 0 },
    },
    product_title: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    product_subject: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    product_grade_level: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    is_digital: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
    is_physical: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
  }, {
    tableName: 'order_items',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
  });

  OrderItem.associate = (models) => {
    OrderItem.belongsTo(models.Order, { foreignKey: 'order_id', as: 'order' });
    OrderItem.belongsTo(models.Product, { foreignKey: 'product_id', as: 'product' });
  };

  return OrderItem;
};
