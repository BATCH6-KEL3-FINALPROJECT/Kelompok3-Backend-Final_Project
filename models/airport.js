'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Airport extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Airport.hasMany(models.Flight, { foreignKey: 'departure_airport_id', as: 'departingFlights' });
      Airport.hasMany(models.Flight, { foreignKey: 'arrival_airport_id', as: 'arrivingFlights' });
    }
  }
  Airport.init({
    airport_id: {
      primaryKey: true,
      type: DataTypes.UUID,
    },
    airport_name: DataTypes.STRING,
    city: DataTypes.STRING,
    city_code: DataTypes.STRING,
    continent: DataTypes.STRING,
    iata_code: DataTypes.STRING,
    country: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Airport',
  });
  return Airport;
};