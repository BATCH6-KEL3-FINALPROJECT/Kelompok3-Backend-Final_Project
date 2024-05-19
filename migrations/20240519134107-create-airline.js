'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Airlines', {
      airline_id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID
      },
      airline_name: {
        allowNull: false,
        type: Sequelize.STRING
      },
      airline_code: {
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
    await queryInterface.dropTable('Airlines');
  }
};