const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Product = sequelize.define('Product', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    seller_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    category_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: { min: 0 },
    },
    subject: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    grade_level: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    exam_year: {
      type: DataTypes.INTEGER, // Using INT for YEAR
      allowNull: true,
    },
    product_type: {
      type: DataTypes.ENUM('past_paper', 'ebook', 'model_paper', 'revision_notes', 'lecture_pack', 'other'),
      allowNull: false,
    },
    format: {
      type: DataTypes.ENUM('digital', 'physical', 'both'),
      allowNull: false,
      defaultValue: 'digital',
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    is_approved: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  }, {
    tableName: 'products',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  });

  Product.associate = (models) => {
    Product.belongsTo(models.User, { foreignKey: 'seller_id', as: 'seller' });
    Product.belongsTo(models.Category, { foreignKey: 'category_id', as: 'category' });
  };

  return Product;
};
