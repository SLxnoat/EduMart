const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const AiInteraction = sequelize.define('AiInteraction', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: true
    },
    session_id: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    message_text: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    response_text: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    intent: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    confidence_score: {
      type: DataTypes.DECIMAL(3, 2),
      allowNull: true
    },
    language: {
      type: DataTypes.STRING(10),
      defaultValue: 'en'
    },
    is_helpful: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    feedback_rating: {
      type: DataTypes.TINYINT,
      allowNull: true
    },
    response_time_ms: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    timestamps: true,
    tableName: 'ai_interactions',
    underscored: true
  });

  AiInteraction.associate = (models) => {
    AiInteraction.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
  };

  return AiInteraction;
};
