"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Notification extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Notification.belongsTo(models.Flight, { foreignKey: "flight_id" });
      Notification.belongsTo(models.User, { foreignKey: "user_id" });
      Notification.belongsTo(models.Booking, { foreignKey: "booking_id" });
      Notification.belongsTo(models.Promotion, { foreignKey: "promotion_id" });
    }
  }
  Notification.init(
    {
      notification_id: { primaryKey: true, type: DataTypes.UUID },
      user_id: DataTypes.INTEGER,
      flight_id: DataTypes.UUID,
      booking_id: DataTypes.UUID,
      promotion_id: DataTypes.UUID,
      notification_type: DataTypes.ENUM("flight_update", "booking_confirmation", "payment_reminder", "promo"),
      message: DataTypes.TEXT,
      is_read: DataTypes.BOOLEAN,
    },
    {
      sequelize,
      modelName: "Notification",
    }
  );
  return Notification;
};
