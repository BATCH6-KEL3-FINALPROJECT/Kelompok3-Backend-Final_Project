'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Booking extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Booking.init({
    booking_id: DataTypes.UUID,
    user_id: DataTypes.UUID,
    flight_id: DataTypes.STRING,
    booking_date: DataTypes.DATE,
    is_round_trip: DataTypes.BOOLEAN,
    no_of_ticket: DataTypes.INTEGER,
    status: {
      type: DataTypes.ENUM("booked", "pending", "canceled", "completed"),
      defaultValue: "pending" // Add default value
    }, total_price: DataTypes.STRING,
    payment_status: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Booking',
  });
  return Booking;
};