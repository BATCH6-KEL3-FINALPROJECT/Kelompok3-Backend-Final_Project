'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Passenger extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Passenger.belongsTo(models.User, { foreignKey: 'user_id' })

      Passenger.hasMany(models.Ticket, { foreignKey: 'passenger_id', as: 'passenger_ticket' })
    }
  }
  Passenger.init({
    passenger_id: {
      primaryKey: true,
      type: DataTypes.UUID
    },
    user_id: DataTypes.UUID,
    title: DataTypes.STRING,
    first_name: DataTypes.STRING,
    last_name: DataTypes.STRING,
    date_of_birth: DataTypes.DATEONLY,
    email: DataTypes.STRING,
    phone_number: DataTypes.STRING,
    nationality: DataTypes.STRING,
    passport_no: DataTypes.STRING,
    issuing_country: DataTypes.STRING,
    valid_until: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'Passenger',
  });
  return Passenger;
};