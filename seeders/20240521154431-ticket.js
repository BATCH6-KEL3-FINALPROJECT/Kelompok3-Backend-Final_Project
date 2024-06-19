'use strict';
const { Airport, Airline, Flight, Seat } = require('../models');
const passenger = require('../models/passenger');
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
        passenger_id: '2b054118-24fc-4c00-8ba2-b1a5e9bb0069', //user rafli round trip 1
        booking_id: '5f01aee8-c265-47a5-a034-6f94ed0ec694',
        seat_number: seats[0].seat_number,
        passenger_name: 'Mr John Doe',
        passenger_type: 'adult',
        TERMINAL: 'T1',
        ticket_status: 'confirmed'
        , createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        ticket_id: '05fa2950-8a32-446e-899b-743d98522480',
        ticket_code: await generateCode(flight[0].airline_id),
        flight_id: flight[0].flight_id,
        seat_id: seats[0].seat_id,
        passenger_id: '4f725ae7-7d7d-47e2-bffe-76c79bcf1ace', //user rafli round trip 1
        booking_id: '5f01aee8-c265-47a5-a034-6f94ed0ec694',
        seat_number: seats[0].seat_number,
        passenger_name: 'Dr Michael Johnson',
        passenger_type: 'adult',
        TERMINAL: 'T2',
        ticket_status: 'confirmed',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        ticket_id: '0c336553-9410-4009-a566-9895ce231684',
        ticket_code: await generateCode(flight[1].airline_id),
        flight_id: flight[1].flight_id,
        seat_id: seats[1].seat_id,
        passenger_id: '2b054118-24fc-4c00-8ba2-b1a5e9bb0069', //user rafli round trip 2
        booking_id: '2439e8e8-e31c-4031-85c6-8721d97c7c16',
        seat_number: seats[1].seat_number,
        passenger_name: 'Mr John Doe',
        passenger_type: 'adult',
        TERMINAL: 'T2',
        ticket_status: 'confirmed',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        ticket_id: 'd9550345-91e5-4a8d-a171-567411823efc',
        ticket_code: await generateCode(flight[1].airline_id),
        flight_id: flight[1].flight_id,
        seat_id: seats[1].seat_id,
        passenger_id: '4f725ae7-7d7d-47e2-bffe-76c79bcf1ace', //user rafli round trip 2
        booking_id: '2439e8e8-e31c-4031-85c6-8721d97c7c16',
        seat_number: seats[1].seat_number,
        passenger_name: 'Dr Michael Johnson',
        passenger_type: 'adult',
        TERMINAL: 'T2',
        ticket_status: 'confirmed',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        ticket_id: '9578917e-1764-4de6-996d-be8602d05a7e',
        ticket_code: await generateCode(flight[2].airline_id),
        flight_id: flight[2].flight_id,
        seat_id: seats[2].seat_id,
        passenger_id: '4f725ae7-7d7d-47e2-bffe-76c79bcf1ace', //user rafli one way
        booking_id: '92d4ade9-f7e8-464f-a2dc-4579d169c0f9',
        seat_number: seats[2].seat_number,
        passenger_name: 'Dr Michael Johnson',
        passenger_type: 'adult',
        TERMINAL: 'T2',
        ticket_status: 'confirmed',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        ticket_id: '6ea14404-b094-4171-a847-086425cde3c8',
        ticket_code: await generateCode(flight[3].airline_id),
        flight_id: flight[3].flight_id,
        seat_id: seats[3].seat_id,
        passenger_id: '1a3055a1-8cf5-4f2b-b7e3-60586ab48c41',
        booking_id: '818e5301-0c2e-42cc-a876-524a8f286ba5',
        seat_number: seats[3].seat_number,
        passenger_name: 'Emily Brown',
        passenger_type: 'child',
        TERMINAL: 'T3',
        ticket_status: 'confirmed',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        ticket_id: '334736c9-a11f-4b68-9a96-26275ec300ea',
        ticket_code: await generateCode(flight[4].airline_id),
        flight_id: flight[4].flight_id,
        seat_id: seats[4].seat_id,
        passenger_id: '4f725ae7-7d7d-47e2-bffe-76c79bcf1ace',
        booking_id: 'a0d22290-6a63-49ca-8399-2ec9c573b6a7',
        seat_number: seats[4].seat_number,
        passenger_name: 'Eve Wilson',
        passenger_type: 'adult',
        TERMINAL: 'T5',
        ticket_status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        ticket_id: 'e303ccb9-1ee2-4f32-a851-2e28bd2574f3',
        ticket_code: await generateCode(flight[4].airline_id),
        flight_id: flight[4].flight_id,
        seat_id: seats[4].seat_id,
        passenger_id: 'd1b0bc7c-ae4a-443d-a1a0-b4a442e6f779',
        booking_id: '715ca8d2-d8d7-42bf-b025-58867a49ea46',
        seat_number: seats[4].seat_number,
        passenger_name: 'Ms Alice Smith',
        passenger_type: 'adult',
        TERMINAL: 'T5',
        ticket_status: 'cancelled',
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
