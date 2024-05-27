'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class reset_password_token extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  reset_password_token.init({
    user_id: DataTypes.STRING,
    expired_in: DataTypes.DATE,
    is_used: DataTypes.BOOLEAN,
    token: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'reset_password_token',
  });
  return reset_password_token;
};