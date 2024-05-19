'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('payments', {
      payment_id: {
        type: Sequelize.UUID,
        allowNull: false,
        primaryKey: true
      },
      total_amount: {
        type: Sequelize.INTEGER
      },
      payment_method: {
        type: Sequelize.STRING
      },
      payment_date: {
        type: Sequelize.DATE
      },
      payment_status: {
        type: Sequelize.ENUM("completed", "cancelled", "pending", "failed")
      },
      user_id: {
        type: Sequelize.UUID,
        references: {
          model: 'Users',
          key: 'user_id'
        },
      },
      booking_id: {
        type: Sequelize.UUID,
        references: {
          model: 'Bookings',
          key: 'booking_id'
        },
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
    await queryInterface.dropTable('payments');
  }
};