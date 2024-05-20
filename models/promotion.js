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
      Promotion.belongsTo(models.Seat, { foreignKey: 'seat_id' });
    }
  }
  Promotion.init({
    promotion_id: DataTypes.UUID,
    promotion_code: DataTypes.STRING,
    discount_amount: DataTypes.INTEGER,
    validity_start_date: DataTypes.DATE,
    validity_end_date: DataTypes.DATE,
    conditions: DataTypes.TEXT,
    seat_id: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Promotion',
  });
  return Promotion;
};