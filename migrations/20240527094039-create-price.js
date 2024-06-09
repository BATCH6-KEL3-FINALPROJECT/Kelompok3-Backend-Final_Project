'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Prices', {
      price_id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      seat_class: {
        type: Sequelize.ENUM("economy", "premium economy", "business", "first class")
      },
      flight_id: {
        type: Sequelize.UUID,
        references: {
          model: 'Flights',
          key: 'flight_id'
        },
      },
      price: {
        type: Sequelize.INTEGER
      },
      price_for_child: {
        type: Sequelize.INTEGER
      },
      price_for_infant: {
        type: Sequelize.INTEGER
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Prices');
  }
};