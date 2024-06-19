'use strict';
const { v4: uuidv4 } = require('uuid');
const { datesArray, flightTimes } = require('../utils/dateAndTime');
const { Airport, Airline, Flight } = require('../models');


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
    // Total data  = (Number of dates) * (Number of departure airports) * (Number of arrival airports) * (Number of flight times) * (Number of airlines) * (Number of planes)
    // = 10 * 23 * 23 * 3 * 4 * 4
    // = 182,160


    const planesInAsia = [
      { name: "Embraer E190", totalSeats: 120 }, // bisa dibagi 6
      { name: "Airbus A220", totalSeats: 168 },// bisa dibagi 6
      { name: "Boeing 737 MAX 7", totalSeats: 180 }, //bisa dibagi 6
      { name: "Bombardier CRJ900", totalSeats: 90 },
      // { name: "Airbus A319", totalSeats: 124 },
    ];

    const planeDetails = {
      details: [
        {
          id: 1,
          description: "Bagasi kabin 10 kg",
        },
        {
          id: 2,
          description: "ada wifi",
        },
        {
          id: 3,
          description: "ada hiburan di pesawat",
        },
      ],
    }
    const airports = await Airport.findAll()
    const airlines = await Airline.findAll()
    console.log("length of airlines", airlines.length)
    console.log("airline divide by 4", airlines.length / 4)
    const groups = [];

    for (let i = 0; i < airlines.length; i += 4) {
      groups.push(airlines.slice(i, i + 4));
    }
    console.log(groups)
    for (const date of datesArray) {
      const bulkInsertData = [];
      for (const departureAirport of airports) {
        for (const arrivalAirport of airports) {
          if (departureAirport.airport_id !== arrivalAirport.airport_id) {
            for (let timeCounter = 0; timeCounter < flightTimes.length; timeCounter++) {
              let airlineCounter = groups[0];
              if (timeCounter == 1) {
                airlineCounter = groups[1];
              } else if (timeCounter == 2) {
                airlineCounter = groups[2];
              }
              let planeCounter = 0
              for (const airline of airlineCounter) {
                if (planeCounter === 4) {
                  planeCounter = 0
                }
                const randomFlightNumber = Math.floor(Math.random() * 1000) + 100;
                const flightCode = airline.airline_code + randomFlightNumber;
                bulkInsertData.push({
                  flight_id: uuidv4(),
                  airline_id: airline.airline_id,
                  flight_duration: flightTimes[timeCounter].duration,
                  flight_description: planeDetails,
                  flight_status: "on time",
                  flight_code: flightCode,
                  plane_type: planesInAsia[planeCounter].name,
                  seats_available: planesInAsia[planeCounter].totalSeats,
                  departure_airport: departureAirport.airport_name,
                  arrival_airport: arrivalAirport.airport_name,
                  departure_date: date,
                  departure_time: flightTimes[timeCounter].departureTime,
                  arrival_date: date,
                  arrival_time: flightTimes[timeCounter].arrivalTime,
                  departure_airport_id: departureAirport.airport_id,
                  arrival_airport_id: arrivalAirport.airport_id,
                  createdAt: new Date(),
                  updatedAt: new Date(),
                })
                planeCounter += 1;
              }
            }
          }
        }
      }
      try {
        await Flight.bulkCreate(bulkInsertData);
        console.log("Bulk insert successful for flight:", date);
        await new Promise(resolve => setTimeout(resolve, 1000));
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
