'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Bookings', {
      booking_id: {
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
      payment_id: {
        type: Sequelize.UUID,
        references: {
          model: 'Payments',
          key: 'payment_id'
        }
      },
      booking_date: {
        type: Sequelize.DATE
      },
      is_round_trip: {
        type: Sequelize.BOOLEAN
      },
      no_of_ticket: {
        type: Sequelize.INTEGER
      },
      status: {
        type: Sequelize.ENUM("booked", "pending", "cancelled", "completed"),
        defaultValue: "pending"
      },
      total_price: {
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
    await queryInterface.dropTable('Bookings');
  }
};