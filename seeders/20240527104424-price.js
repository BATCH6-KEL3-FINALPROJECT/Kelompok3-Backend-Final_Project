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
    const seatClass = ["economy", "premium economy", "business", "first class"]; //define class di pesawat
    const priceRanges = [
      { min: 900000, max: 1200000 },      // Range for Economy
      { min: 2000000, max: 4500000 },     // Range for Premium Economy
      { min: 5000000, max: 7500000 },     // Range for Business
      { min: 12000000, max: 18000000 },   // Range for First Class
    ]; const flights = await Flight.findAll();

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
        const { min, max } = priceRanges[i];
        const currentPrice = Math.floor(Math.random() * (max - min + 1)) + min;
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
