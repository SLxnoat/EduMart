const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const DigitalAsset = sequelize.define('DigitalAsset', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    product_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    file_name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    file_path: {
      type: DataTypes.STRING(512),
      allowNull: false,
    },
    file_size: {
      type: DataTypes.INTEGER, // in KB
      allowNull: false,
      defaultValue: 1024,
    },
    mime_type: {
      type: DataTypes.STRING(100),
      allowNull: false,
      defaultValue: 'application/pdf',
    },
    is_preview: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    sort_order: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    download_count: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
  }, {
    tableName: 'digital_assets',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  });

  DigitalAsset.associate = (models) => {
    DigitalAsset.belongsTo(models.Product, { foreignKey: 'product_id', as: 'product' });
  };

  return DigitalAsset;
};
