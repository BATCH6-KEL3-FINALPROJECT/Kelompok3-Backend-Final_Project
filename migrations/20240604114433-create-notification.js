'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Notifications', {
      notification_id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID
      },
      user_id: {
        type: Sequelize.UUID,
        references: {
          model: 'Users',
          key: 'user_id'
        },
      },
      flight_id: {
        type: Sequelize.UUID,
        references: {
          model: 'Flights',
          key: 'flight_id'
        },
      },
      booking_id: {
        type: Sequelize.UUID,
        references: {
          model: 'Bookings',
          key: 'booking_id'
        },
      },
      promotion_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Promotions',
          key: 'promotion_id'
        },
      },
      notification_type: {
        type: Sequelize.ENUM('flight_update', 'booking_confirmation', 'payment_reminder', 'promo'),
      },
      message: {
        type: Sequelize.TEXT
      },
      is_read: {
        type: Sequelize.BOOLEAN
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
    await queryInterface.dropTable('Notifications');
  }
};