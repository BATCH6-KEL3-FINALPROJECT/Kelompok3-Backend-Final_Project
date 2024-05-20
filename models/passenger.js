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
      type: DataTypes.STRING
    },
    user_id: DataTypes.UUID,
    title: DataTypes.STRING,
    first_name: DataTypes.STRING,
    last_name: DataTypes.STRING,
    email: DataTypes.STRING,
    phone_number: DataTypes.STRING,
    passportn_no: DataTypes.STRING,
    negara_penerbit: DataTypes.STRING,
    valid_until: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'Passenger',
  });
  return Passenger;
};