"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class SearchHistory extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      SearchHistory.belongsTo(models.User, { foreignKey: "user_id" });
    }
  }
  SearchHistory.init(
    {
      user_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      history: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      updatedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      modelName: "SearchHistory",
      tableName: "SearchHistories", 
    }
  );
  return SearchHistory;
};
