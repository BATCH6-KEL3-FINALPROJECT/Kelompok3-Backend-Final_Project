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
    const seatClass = ["economy", "premium economy", "business", "first class"]; //define class untuk Seats
    const alphabet = ["A", "B", "C", "D", "E", "F"]
    const ratioOfSeats = {
      economy: 0.5,
      "premium economy": 0.25,
      business: 0.15,
      "first class": 0.1
    }; //ratio dari pembagian Seats
    const flights = await Flight.findAll();

    if (flights.length === 0) {
      console.log("There is no flight Data");
      return
    }

    console.log(flights)
    //looping ke setiap flight
    for (const flight of flights) {
      const totalRows = Math.ceil(flight.seats_available / alphabet.length);
      let remainingSeats = flight.seats_available;
      let seatsByClass = {}
      let seatRow = totalRows + 1; // Start from the back

      if (remainingSeats < 100) {
        seatsByClass['economy'] = remainingSeats
        seatRow -= 1
      } else {
        if (remainingSeats == 172) {
          seatRow += 1
        }
        for (const kelas of Object.keys(ratioOfSeats)) {
          const seats = Math.ceil(flight.seats_available * ratioOfSeats[kelas])
          seatsByClass[kelas] = seats
          remainingSeats -= seats
        }
        seatsByClass["economy"] += remainingSeats
      }

      const bulkInsertData = [];
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
            column: alphabet[seatCounter - 1],
            row: seatRow,
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
        console.log(bulkInsertData)
        await Seat.bulkCreate(bulkInsertData);
        console.log("Bulk insert successful for seats of flight:", flight.flight_id);
        // await new Promise(resolve => setTimeout(resolve, 4000));
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
