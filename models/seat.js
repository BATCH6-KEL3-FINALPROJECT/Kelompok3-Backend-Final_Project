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
      Seat.hasOne(models.Ticket, { foreignKey: 'seat_id' })
      // Seat.hasOne(models.Promotion, { foreignKey: 'seat_id' })

      Seat.belongsTo(models.Flight, { foreignKey: 'flight_id' })
    }
  }
  Seat.init({
    seat_id: {
      primaryKey: true,
      type: DataTypes.STRING,
      allowNull: false,
    },
    seat_class: DataTypes.ENUM("Economy", "Premium Economy", "Business", "First Class"),
    seat_number: DataTypes.STRING,
    is_available: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    flight_id: DataTypes.UUID
  }, {
    sequelize,
    modelName: 'Seat',
  });
  return Seat;
};