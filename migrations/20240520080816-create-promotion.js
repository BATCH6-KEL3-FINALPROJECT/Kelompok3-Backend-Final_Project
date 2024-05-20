'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Promotions', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      promotion_id: {
        type: Sequelize.UUID
      },
      promotion_code: {
        type: Sequelize.STRING
      },
      discount_amount: {
        type: Sequelize.INTEGER
      },
      validity_start_date: {
        type: Sequelize.DATE
      },
      validity_end_date: {
        type: Sequelize.DATE
      },
      conditions: {
        type: Sequelize.TEXT
      },
      seat_id: {
        type: Sequelize.STRING,
        references: {
          model: 'Seats',
          key: 'seat_id'
        }
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
    await queryInterface.dropTable('Promotions');
  }
};