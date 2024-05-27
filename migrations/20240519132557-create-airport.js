'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Airports', {
      airport_id: {
        type: Sequelize.UUID,
        primaryKey: true,
        allowNull: false,
      },
      airport_name: {
        allowNull: false,
        type: Sequelize.STRING
      },
      city: {
        type: Sequelize.STRING
      },
      city_code: {
        type: Sequelize.STRING
      },
      continent: {
        type: Sequelize.STRING
      },
      iata_code: {
        allowNull: false,
        type: Sequelize.STRING
      },
      country: {
        type: Sequelize.STRING
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
    await queryInterface.dropTable('Airports');
  }
};