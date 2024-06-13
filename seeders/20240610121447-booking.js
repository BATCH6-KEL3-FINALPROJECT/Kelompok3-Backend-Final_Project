'use strict';
const { Airport, Airline, Flight, Seat } = require('../models');
const booking = require('../models/booking');

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
    const flight = await Flight.findAll({
      limit: 5
    }).then(flights => {
      console.log("Success Fetching data")
      return flights
    }).catch(err => {
      console.error('Error fetching flight data: ' + err)
    });

    const bookingData = [
      {
        booking_id: '5f01aee8-c265-47a5-a034-6f94ed0ec694',
        user_id: '2b054118-24fc-4c00-8ba2-b1a5e9bb0069',
        booking_code: 'GDG12345',
        flight_id: flight[0].flight_id,
        booking_date: new Date(2024, 5, 6),
        is_round_trip: true,
        no_of_ticket: 2,
        status: 'booked',
        total_price: 550000,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        booking_id: '2439e8e8-e31c-4031-85c6-8721d97c7c16',
        user_id: '2b054118-24fc-4c00-8ba2-b1a5e9bb0069',
        booking_code: 'JKT12345',
        flight_id: flight[1].flight_id,
        booking_date: new Date(2024, 5, 7),
        is_round_trip: true,
        no_of_ticket: 2,
        status: 'booked',
        total_price: 653000,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        booking_id: '92d4ade9-f7e8-464f-a2dc-4579d169c0f9',
        user_id: '2b054118-24fc-4c00-8ba2-b1a5e9bb0069', // user rafli
        booking_code: 'SMR12345',
        flight_id: flight[2].flight_id,
        booking_date: new Date(2024, 5, 9),
        is_round_trip: false,
        no_of_ticket: 1,
        status: 'booked',
        total_price: 323000,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        booking_id: '818e5301-0c2e-42cc-a876-524a8f286ba5',
        user_id: '4f725ae7-7d7d-47e2-bffe-76c79bcf1ace',
        booking_code: 'TER09321',
        flight_id: flight[3].flight_id,
        booking_date: new Date(2024, 5, 9),
        is_round_trip: false,
        no_of_ticket: 1,
        status: 'booked',
        total_price: 123000,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        booking_id: 'a0d22290-6a63-49ca-8399-2ec9c573b6a7',
        user_id: '2b054118-24fc-4c00-8ba2-b1a5e9bb0069',
        booking_code: 'AFT325121s',
        flight_id: flight[4].flight_id,
        booking_date: new Date(2024, 5, 9),
        is_round_trip: false,
        no_of_ticket: 1,
        status: 'pending',
        total_price: 323000,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        booking_id: '715ca8d2-d8d7-42bf-b025-58867a49ea46',
        user_id: 'd1b0bc7c-ae4a-443d-a1a0-b4a442e6f779',
        booking_code: 'PBF35231',
        flight_id: flight[4].flight_id,
        booking_date: new Date(2024, 5, 11),
        is_round_trip: false,
        no_of_ticket: 1,
        status: 'cancelled',
        total_price: 235000,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]
    await queryInterface.bulkInsert('Bookings', bookingData, {});
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
