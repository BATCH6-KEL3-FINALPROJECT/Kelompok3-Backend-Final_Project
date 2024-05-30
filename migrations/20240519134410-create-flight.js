'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Flights', {
      flight_id: {
        type: Sequelize.UUID,
        primaryKey: true,
        allowNull: false
      },
      flight_code: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      airline_id: {
        type: Sequelize.UUID,
        references: {
          model: 'Airlines',
          key: 'airline_id'
        }
      },
      flight_duration: { type: Sequelize.INTEGER },
      flight_description: { type: Sequelize.JSON },
      flight_status: { type: Sequelize.ENUM('on time', 'delayed', 'ongoing', 'en-route', 'missing') },
      plane_type: {
        type: Sequelize.STRING
      },
      seats_available: { type: Sequelize.INTEGER },
      terminal: { type: Sequelize.JSON },
      departure_airport: { type: Sequelize.STRING },
      arrival_airport: { type: Sequelize.STRING },
      departure_date: { type: Sequelize.DATEONLY },
      departure_time: { type: Sequelize.TIME },
      arrival_date: { type: Sequelize.DATEONLY },
      arrival_time: { type: Sequelize.TIME },
      departure_airport_id: {
        type: Sequelize.UUID,
        references: {
          model: 'Airports',
          key: 'airport_id'
        }
      },
      arrival_airport_id: {
        type: Sequelize.UUID,
        references: {
          model: 'Airports',
          key: 'airport_id'
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
    await queryInterface.dropTable('Flights');
  }
};