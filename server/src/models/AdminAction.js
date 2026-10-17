const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const AdminAction = sequelize.define('AdminAction', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    admin_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    action_type: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    target_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    target_type: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    metadata: {
      type: DataTypes.JSON,
      allowNull: true,
    },
  }, {
    tableName: 'admin_actions',
    timestamps: true,
    createdAt: 'performed_at',
    updatedAt: false,
  });

  AdminAction.associate = (models) => {
    AdminAction.belongsTo(models.User, { foreignKey: 'admin_id', as: 'admin' });
  };

  return AdminAction;
};
