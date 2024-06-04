'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Promotion extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Promotion.belongsTo(models.Flight, { foreignKey: 'flight_id' });

      Promotion.hasMany(models.Notification, { foreignKey: 'notification_id' });
    }
  }
  Promotion.init({
    promotion_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true
    },
    flight_id: DataTypes.UUID,
    promo_message: DataTypes.STRING,
    description: DataTypes.TEXT,
    discount_percentage: DataTypes.INTEGER,
    start_date: DataTypes.DATE,
    end_date: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'Promotion',
  });
  return Promotion;
};