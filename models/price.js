'use strict';
const {
  Model, Sequelize
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Price extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      // Price.belongsTo(models.Flight, { foreignKey: 'flight_id', as: 'flightPrice' });
      Price.belongsTo(models.Flight, { foreignKey: 'flight_id', as: 'flightPrice', targetKey: 'flight_id' }); // Assuming flight_id is the primary key of the Flight model

    }
  }
  Price.init({
    price_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    seat_class: {
      type: DataTypes.ENUM("Economy", "Premium Economy", "Business", "First Class")
    },
    flight_id: DataTypes.UUID,
    price: DataTypes.INTEGER,
    price_for_child: {
      type: DataTypes.INTEGER,

    },
    price_for_infant: {
      type: DataTypes.INTEGER,

    }
  }, {
    sequelize,
    modelName: 'Price',
  });
  return Price;
};