'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Seat extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Seat.belongsTo(models.flight, { foreignKey: 'flight_id' })
    }
  }
  Seat.init({
    seat: DataTypes.STRING,
    class: DataTypes.STRING,
    price: DataTypes.INTEGER,
    seat_number: DataTypes.STRING,
    is_available: DataTypes.BOOLEAN,
    flight_id: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Seat',
  });
  return Seat;
};