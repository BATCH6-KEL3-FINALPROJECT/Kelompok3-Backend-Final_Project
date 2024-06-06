'use strict';
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

    const flight = await Flight.findAll({
      order: Sequelize.literal('RANDOM()'),
      limit: 5
    }).then(flights => {
      console.log(flights)
    }).catch(err => {
      console.error('Error fetching flight data: ' + err)
    });
    // const ticketsData = [
    //   {
    //     ticket_id: '864b70c9-7555-4e81-95ad-ab9f266316e5',
    //     flight_id: 'UUID_flight1',
    //     seat_id: null, // Set to null
    //     passenger_id: '2b054118-24fc-4c00-8ba2-b1a5e9bb0069',
    //     booking_id: null, // Set to null
    //     seat_number: 'A1',
    //     passenger_name: 'John Doe',
    //     TERMINAL: 'T1',
    //     ticket_status: 'confirmed'
    //   },
    //   {
    //     ticket_id: '0c336553-9410-4009-a566-9895ce231684',
    //     flight_id: 'UUID_flight2',
    //     seat_id: null, // Set to null
    //     passenger_id: '2b054118-24fc-4c00-8ba2-b1a5e9bb0069',
    //     booking_id: null, // Set to null
    //     seat_number: 'B2',
    //     passenger_name: 'Jane Smith',
    //     TERMINAL: 'T2',
    //     ticket_status: 'pending'
    //   },
    //   {
    //     ticket_id: '6ea14404-b094-4171-a847-086425cde3c8',
    //     flight_id: 'UUID_flight3',
    //     seat_id: null, // Set to null
    //     passenger_id: 'd1b0bc7c-ae4a-443d-a1a0-b4a442e6f779',
    //     booking_id: null, // Set to null
    //     seat_number: 'C3',
    //     passenger_name: 'Alice Johnson',
    //     TERMINAL: 'T3',
    //     ticket_status: 'completed'
    //   },
    //   {
    //     ticket_id: '05fa2950-8a32-446e-899b-743d98522480',
    //     flight_id: 'UUID_flight4',
    //     seat_id: null, // Set to null
    //     passenger_id: '4f725ae7-7d7d-47e2-bffe-76c79bcf1ace',
    //     booking_id: null, // Set to null
    //     seat_number: 'D4',
    //     passenger_name: 'Bob Brown',
    //     TERMINAL: 'T4',
    //     ticket_status: 'cancelled'
    //   },
    //   {
    //     ticket_id: '334736c9-a11f-4b68-9a96-26275ec300ea',
    //     flight_id: 'UUID_flight5',
    //     seat_id: null, // Set to null
    //     passenger_id: '1a3055a1-8cf5-4f2b-b7e3-60586ab48c41',
    //     booking_id: null, // Set to null
    //     seat_number: 'E5',
    //     passenger_name: 'Eve Wilson',
    //     TERMINAL: 'T5',
    //     ticket_status: 'confirmed'
    //   }
    // ];
    // await queryInterface.bulkInsert('Tickets', ticketsData, {});


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
