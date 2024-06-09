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
      Booking.belongsTo(models.Flight, { foreignKey: 'flight_id' })
      Booking.belongsTo(models.Flight, { foreignKey: 'booking_id' })
      Booking.belongsTo(models.payment, { foreignKey: 'payment_id' })

      Booking.hasMany(models.Ticket, { foreignKey: 'booking_id' })
      Booking.hasMany(models.Notification, { foreignKey: 'booking_id' })
    }
  }
  Booking.init({
    booking_id: {
      primaryKey: true,
      type: DataTypes.UUID
    },
    user_id: DataTypes.UUID,
    flight_id: DataTypes.UUID,
    payment_id: DataTypes.UUID,
    booking_date: DataTypes.DATE,
    is_round_trip: DataTypes.BOOLEAN,
    no_of_ticket: DataTypes.INTEGER,
    status: {
      type: DataTypes.ENUM("booked", "pending", "canceled", "completed"),
      defaultValue: "pending" // Add default value
    },
    total_price: DataTypes.STRING,
  }, {
    sequelize,
    modelName: 'Booking',
  });
  return Booking;
};