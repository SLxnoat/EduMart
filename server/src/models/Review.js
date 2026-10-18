const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Review = sequelize.define('Review', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    product_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    order_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    rating: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: { min: 1, max: 5 },
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    comment: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    is_verified_purchase: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    helpful_votes: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    is_approved: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  }, {
    tableName: 'reviews',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  });

  Review.associate = (models) => {
    Review.belongsTo(models.Product, { foreignKey: 'product_id', as: 'product' });
    Review.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
    if (models.Order) {
      Review.belongsTo(models.Order, { foreignKey: 'order_id', as: 'order' });
    }
  };

  return Review;
};
