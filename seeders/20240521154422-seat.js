'use strict';

const { Flight, Seat } = require('../models');

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
    const seatClass = ["Economy", "Premium Economy", "Business", "First Class"]; //define class untuk Seats
    const alphabet = ["A", "B", "C", "D", "E", "F"]
    const ratioOfSeats = {
      Economy: 0.5,
      "Premium Economy": 0.25,
      Business: 0.15,
      "First Class": 0.1
    }; //ratio dari pembagian Seats
    const flights = await Flight.findAll();

    if (flights.length === 0) {
      console.log("There is no flight Data");
      return
    }

    //looping ke setiap flight
    for (const flight of flights) {
      const totalRows = Math.ceil(flight.seats_available / alphabet.length);
      let remainingSeats = flight.seats_available;
      let seatsByClass = {}

      for (const kelas of Object.keys(ratioOfSeats)) {
        const seats = Math.floor(flight.seats_available * ratioOfSeats[kelas])
        seatsByClass[kelas] = seats
        remainingSeats -= seats
      }
      seatsByClass["Economy"] += remainingSeats

      const bulkInsertData = [];
      let seatRow = totalRows + 1; // Start from the back
      for (const kelas of seatClass) {
        const numOfSeats = seatsByClass[kelas];
        let seatCounter = 1;
        for (let i = 1; i <= numOfSeats; i++) {
          if (seatCounter === 7) {
            seatCounter = 1;
            seatRow -= 1;
          }
          bulkInsertData.push({
            seat_id: `${flight.flight_id}-${kelas}-${i}`,
            seat_class: kelas,
            // seat_number: `${kelas.charAt(0)}${i}`,
            seat_number: `${seatRow}${alphabet[seatCounter - 1]}`,
            flight_id: flight.flight_id,
            createdAt: new Date(),
            updatedAt: new Date()
          });
          seatCounter += 1
        }
        seatRow -= 1;
      }
      try {
        await Seat.bulkCreate(bulkInsertData);
        console.log("Bulk insert successful for seats of flight:", flight.flight_id);
      } catch (error) {
        console.error("Error inserting data into seats:", error);
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
