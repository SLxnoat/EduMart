const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');

module.exports = (sequelize) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    password_hash: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    first_name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    last_name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    phone: {
      type: DataTypes.STRING(20)
    },
    institution: {
      type: DataTypes.STRING(150),
      allowNull: true
    },
    role: {
      type: DataTypes.ENUM('student', 'tutor', 'admin', 'institute'),
      allowNull: false,
      defaultValue: 'student'
    },
    is_verified: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    verification_token: {
      type: DataTypes.STRING(255)
    },
    reset_token: {
      type: DataTypes.STRING(255)
    },
    reset_expires: {
      type: DataTypes.DATE
    },
    last_login: {
      type: DataTypes.DATE
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    }
  }, {
    timestamps: true,
    tableName: 'users',
    underscored: true,
    hooks: {
      beforeSave: async (user) => {
        if (user.changed('password_hash')) {
          const salt = await bcrypt.genSalt(12);
          user.password_hash = await bcrypt.hash(user.password_hash, salt);
        }
      }
    }
  });

  // Password verification method
  User.prototype.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password_hash);
  };

  User.associate = (models) => {
    User.hasMany(models.Order, { foreignKey: 'user_id', as: 'orders' });
    if (models.AiInteraction) {
      User.hasMany(models.AiInteraction, { foreignKey: 'user_id', as: 'aiInteractions' });
    }
    if (models.Session) {
      User.hasMany(models.Session, { foreignKey: 'user_id', as: 'sessions' });
    }
    if (models.Review) {
      User.hasMany(models.Review, { foreignKey: 'user_id', as: 'reviews' });
    }
    if (models.Notification) {
      User.hasMany(models.Notification, { foreignKey: 'user_id', as: 'notifications' });
    }
    if (models.AdminAction) {
      User.hasMany(models.AdminAction, { foreignKey: 'admin_id', as: 'adminActions' });
    }
    if (models.SellerEarning) {
      User.hasMany(models.SellerEarning, { foreignKey: 'seller_id', as: 'sellerEarnings' });
    }
  };

  return User;
};

