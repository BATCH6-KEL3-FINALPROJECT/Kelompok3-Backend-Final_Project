'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Flight extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Flight.belongsTo(models.Airport, { foreignKey: 'departure_airport_id', as: 'departingAirport' });
      Flight.belongsTo(models.Airport, { foreignKey: 'arrival_airport_id', as: 'arrivingAirport' });
      Flight.belongsTo(models.Airline, { foreignKey: 'airline_id' })

      Flight.hasMany(models.Seat, { foreignKey: 'flight_id' });
      Flight.hasMany(models.Booking, { foreignKey: 'flight_id' });
      Flight.hasMany(models.Ticket, { foreignKey: 'flight_id' })
      Flight.hasMany(models.Price, { foreignKey: 'flight_id' });
    }
  }
  Flight.init({
    flight_id: {
      primaryKey: true,
      type: DataTypes.UUID
    },
    airline_id: DataTypes.UUID,
    flight_duration: DataTypes.INTEGER,
    flight_description: DataTypes.JSON,
    flight_status: {
      type: DataTypes.ENUM('on time', 'delayed', 'ongoing', 'en-route', 'missing'),
      defaultValue: "on time"
    },
    flight_code: DataTypes.STRING,
    plane_type: DataTypes.STRING,
    seats_available: {
      type: DataTypes.INTEGER,
      default: 189
    },
    terminal: DataTypes.JSON,
    departure_airport: DataTypes.STRING,
    arrival_airport: DataTypes.STRING,
    departure_date: DataTypes.DATE,
    departure_time: DataTypes.TIME,
    arrival_date: DataTypes.DATE,
    arrival_time: DataTypes.TIME,
    departure_airport_id: DataTypes.UUID,
    arrival_airport_id: DataTypes.UUID,
  }, {
    sequelize,
    modelName: 'Flight',
  });
  return Flight;
};