'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class OTP extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  OTP.init({
    OTP_code: DataTypes.STRING,
    user_id: DataTypes.STRING,
    expired_in: DataTypes.TIME,
    is_used: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'OTP',
  });
  return OTP;
};