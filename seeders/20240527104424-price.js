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
    const seatClass = ["Economy", "Premium Economy", "Business", "First Class"]; //define class di pesawat
    const prices = [120000, 3000000, 6000000, 12000000,] //define harga per kelas, hanya untuk dummy
    const flights = await Flight.findAll();

    if (flights.length === 0) {
      console.log("THere is no flight data")
    }

    //looping dari setiap data flight
    for (const flight of flights) {
      let classCount = 1;

      // Cek apakah  seats_available dibawah  100 seat jika iya maka kelas hanya ada 1
      if (flight.seats_available < 100) {
        classCount = 1;
      } else {
        classCount = seatClass.length;
      }
      for (let i = 0; i < classCount; i++) {
        const kelas = seatClass[i];
        const currentPrice = prices[i];
        try {
          await queryInterface.bulkInsert("Prices", [
            {
              seat_class: kelas,
              flight_id: flight.flight_id,
              price: currentPrice,
              price_for_child: Math.round(currentPrice * 0.75), //harga anak kecil 75% dari harga asli
              price_for_infant: Math.round(currentPrice * 0.1), //harga bayi 10% dari harga asli
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
