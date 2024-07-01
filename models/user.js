'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      User.hasMany(models.Booking, { foreignKey: 'user_id' });
      User.hasMany(models.payment, { foreignKey: 'user_id' });
      User.hasMany(models.Passenger, { foreignKey: 'user_id' });
      User.hasMany(models.Notification, { foreignKey: 'user_id' });
      User.hasMany(models.SearchHistory, { foreignKey: 'user_id' });

      User.hasOne(models.reset_password_token, { foreignKey: 'user_id' });
      User.hasOne(models.OTP, { foreignKey: 'user_id' });
    }
  }
  User.init({
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false
    },
    phone_number: DataTypes.STRING,
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    refresh_token: DataTypes.TEXT,
    role: {
      type: DataTypes.ENUM("user", "admin"),
      defaultValue: "user"
    },
    image_url: DataTypes.TEXT,
    image_id: DataTypes.TEXT,
    is_verified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
  }, {
    sequelize,
    modelName: 'User',
    paranoid: true
  });
  return User;
};