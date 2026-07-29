const { Sequelize } = require('sequelize');
const sequelize = require('../config/database');

const models = {
  User: require('./User')(sequelize),
  Category: require('./Category')(sequelize),
  Product: require('./Product')(sequelize),
};

// Initialize associations
Object.values(models).forEach(model => {
  if (model.associate) {
    model.associate(models);
  }
});

module.exports = models;
module.exports.sequelize = sequelize;
