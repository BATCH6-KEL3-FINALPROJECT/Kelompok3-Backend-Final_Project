'use strict';
const { Flight } = require('../models');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
    */
    const seatClass = ["Economy", "Premium Economy", "Business", "First Class"];
    const prices = [120000, 3000000, 6000000, 12000000,]
    const flights = await Flight.findAll();

    if (flights.length === 0) {
      console.log("THere is no flight data")
    }
    for (const flight of flights) {
      for (let i = 0; i < seatClass.length; i++) {
        const kelas = seatClass[i];
        const currentPrice = prices[i];
        try {
          await queryInterface.bulkInsert("Prices", [
            {
              seat_class: kelas,
              flight_id: flight.flight_id,
              price: currentPrice,
              price_for_child: Math.round(currentPrice * 0.75),
              price_for_infant: Math.round(currentPrice * 0.1),
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          ])
        }
        catch (e) {
          console.log("Error inserting data into price")
        }
      }
    }
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
  }
};
