const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Cart = sequelize.define('Cart', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true,
    },
    items: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: [],
    },
    saved_for_later: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: [],
    },
    applied_coupon: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
  }, {
    tableName: 'carts',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  });

  Cart.associate = (models) => {
    Cart.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
  };

  return Cart;
};
