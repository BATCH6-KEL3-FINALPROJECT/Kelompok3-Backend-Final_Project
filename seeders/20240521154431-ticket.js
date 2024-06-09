'use strict';
const { Airport, Airline, Flight, Seat } = require('../models');
const generateCode = require('../utils/generateTicketCode');

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
    const seats = []
    for (let i = 0; i < flight.length; i++) {
      const seat = await Seat.findOne({
        where: {
          flight_id: flight[i].flight_id
        }
      });
      seats.push(seat)
    }

    console.log(seats);
    const ticketsData = [
      {
        ticket_id: '864b70c9-7555-4e81-95ad-ab9f266316e5',
        ticket_code: await generateCode(flight[0].airline_id),
        flight_id: flight[0].flight_id,
        seat_id: seats[0].seat_id,
        passenger_id: '2b054118-24fc-4c00-8ba2-b1a5e9bb0069',
        booking_id: null,
        seat_number: seats[0].seat_number,
        passenger_name: 'John Doe',
        TERMINAL: 'T1',
        ticket_status: 'confirmed'
        , createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        ticket_id: '0c336553-9410-4009-a566-9895ce231684',
        ticket_code: await generateCode(flight[1].airline_id),
        flight_id: flight[1].flight_id,
        seat_id: seats[1].seat_id,
        passenger_id: '2b054118-24fc-4c00-8ba2-b1a5e9bb0069',
        booking_id: null,
        seat_number: seats[1].seat_number,
        passenger_name: 'Jane Smith',
        TERMINAL: 'T2',
        ticket_status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        ticket_id: '6ea14404-b094-4171-a847-086425cde3c8',
        ticket_code: await generateCode(flight[2].airline_id),
        flight_id: flight[2].flight_id,
        seat_id: seats[2].seat_id,
        passenger_id: 'd1b0bc7c-ae4a-443d-a1a0-b4a442e6f779',
        booking_id: null,
        seat_number: seats[2].seat_number,
        passenger_name: 'Alice Johnson',
        TERMINAL: 'T3',
        ticket_status: 'completed',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        ticket_id: '05fa2950-8a32-446e-899b-743d98522480',
        ticket_code: await generateCode(flight[3].airline_id),
        flight_id: flight[3].flight_id,
        seat_id: seats[3].seat_id,
        passenger_id: '4f725ae7-7d7d-47e2-bffe-76c79bcf1ace',
        booking_id: null,
        seat_number: seats[3].seat_number,
        passenger_name: 'Bob Brown',
        TERMINAL: 'T4',
        ticket_status: 'cancelled',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        ticket_id: '334736c9-a11f-4b68-9a96-26275ec300ea',
        ticket_code: await generateCode(flight[4].airline_id),
        flight_id: flight[4].flight_id,
        seat_id: seats[4].seat_id,
        passenger_id: '1a3055a1-8cf5-4f2b-b7e3-60586ab48c41',
        booking_id: null,
        seat_number: seats[4].seat_number,
        passenger_name: 'Eve Wilson',
        TERMINAL: 'T5',
        ticket_status: 'confirmed',
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ];
    await queryInterface.bulkInsert('Tickets', ticketsData, {});


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
