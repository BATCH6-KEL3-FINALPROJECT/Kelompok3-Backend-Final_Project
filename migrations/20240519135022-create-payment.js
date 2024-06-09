'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Payments', {
      payment_id: {
        type: Sequelize.UUID,
        allowNull: false,
        primaryKey: true
      },
      total_amount: {
        type: Sequelize.INTEGER
      },
      transaction_token: {
        type: Sequelize.STRING
      },
      transaction_id: {
        type: Sequelize.STRING
      },
      payment_callback_data: {
        type: Sequelize.TEXT
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