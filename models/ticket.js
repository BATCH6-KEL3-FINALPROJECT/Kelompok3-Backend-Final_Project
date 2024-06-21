"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Ticket extends Model {
    static associate(models) {
      Ticket.belongsTo(models.Booking, { foreignKey: "booking_id" });
      Ticket.belongsTo(models.Passenger, { foreignKey: "passenger_id" });
      Ticket.belongsTo(models.Seat, { foreignKey: "seat_id" });
      Ticket.belongsTo(models.Flight, { foreignKey: "flight_id" });
    }
  }

  Ticket.init(
    {
      ticket_id: {
        type: DataTypes.UUID,
        primaryKey: true,
      },
      ticket_code: {
        type: DataTypes.STRING,
        unique: true,
      },
      flight_id: DataTypes.UUID,
      seat_id: DataTypes.STRING,
      passenger_id: DataTypes.UUID,
      passenger_type: {
        type: DataTypes.ENUM('adult', 'child', 'baby')
      },
      booking_id: DataTypes.UUID,
      seat_number: DataTypes.STRING,
      passenger_name: DataTypes.STRING,
      TERMINAL: DataTypes.STRING,
      ticket_status: {
        type: DataTypes.ENUM("confirmed", "cancelled", "pending", "completed"),
        defaultValue: "pending",
      },
      ticket_buyer: {
        type: DataTypes.JSONB
      }
    },
    {
      sequelize,
      modelName: "Ticket",
    }
  );

  return Ticket;
};
