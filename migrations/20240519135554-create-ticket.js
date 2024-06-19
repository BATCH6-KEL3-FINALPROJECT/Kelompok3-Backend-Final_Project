'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Tickets', {
      ticket_id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID
      },
      ticket_code: {
        type: Sequelize.STRING,
        unique: true,
      },
      flight_id: {
        type: Sequelize.UUID,
        references: {
          model: 'Flights',
          key: 'flight_id'
        },
      },
      seat_id: {
        type: Sequelize.STRING,
        references: {
          model: 'Seats',
          key: 'seat_id'
        }
      },
      passenger_id: {
        type: Sequelize.UUID,
        references: {
          model: 'Passengers',
          key: 'passenger_id'
        },
      },
      passenger_type: {
        type: Sequelize.ENUM('adult', 'child', 'baby')
      },
      booking_id: {
        type: Sequelize.UUID,
        references: {
          model: 'Bookings',
          key: 'booking_id'
        },
      },
      seat_number: {
        type: Sequelize.STRING
      },
      passenger_name: {
        type: Sequelize.STRING
      },
      TERMINAL: {
        type: Sequelize.STRING
      },
      ticket_status: {
        type: Sequelize.ENUM("confirmed", "cancelled", "pending", "completed"),
        defaultValue: "pending"
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
    await queryInterface.dropTable('Tickets');
  }
};