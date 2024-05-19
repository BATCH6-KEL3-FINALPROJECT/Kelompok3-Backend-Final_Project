'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Seats', {
      seat_id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.STRING
      },
      seat: {
        type: Sequelize.STRING
      },
      class: {
        type: Sequelize.ENUM("Economy", "Premium Economy", "Business", "First Class")
      },
      price: {
        type: Sequelize.INTEGER
      },
      seat_number: {
        type: Sequelize.STRING
      },
      is_available: {
        type: Sequelize.BOOLEAN,
        default: true
      },
      flight_id: {
        type: Sequelize.UUID,
        references: {
          model: 'Flights',
          key: 'flight_id'
        },
        onUpdate: 'CASCADE', // Optional: Define what happens when the referenced Flight is updated
        onDelete: 'CASCADE'
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
    await queryInterface.dropTable('Seats');
  }
};