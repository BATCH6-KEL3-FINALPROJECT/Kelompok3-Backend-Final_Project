'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Ticket extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Ticket.belongsTo(models.Booking, { foreignKey: 'booking_id' });
      Ticket.belongsTo(models.Passenger, { foreignKey: 'passenger_id' });
      Ticket.belongsTo(models.Seat, { foreignKey: 'seat_id' });
      Ticket.belongsTo(models.Flight, { foreignKey: 'flight_id' });
    }
  }
  Ticket.init({
    ticket_id: DataTypes.UUID,
    flight_id: DataTypes.UUID,
    seat_id: DataTypes.STRING,
    passenger_id: DataTypes.UUID,
    booking_id: DataTypes.STRING,
    seat_number: DataTypes.STRING,
    passenger_name: DataTypes.STRING,
    TERMINAL: DataTypes.STRING,
    ticket_status: {
      type: DataTypes.ENUM("confirmed", "cancelled", "pending", "completed"),
      defaultValue: "pending" // Add default value
    }
  }, {
    sequelize,
    modelName: 'Ticket',
  });
  return Ticket;
};