'use strict';

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

    const passengersData = [
      {
        passenger_id: '2b054118-24fc-4c00-8ba2-b1a5e9bb0069',
        user_id: '2b054118-24fc-4c00-8ba2-b1a5e9bb0069',
        title: 'Mr.',
        first_name: 'John',
        last_name: 'Doe',
        date_of_birth: '1990-05-15',
        email: 'john.doe@example.com',
        phone_number: '1234567890',
        nationality: 'American',
        passport_no: 'AB123456',
        issuing_country: 'USA',
        valid_until: '2025-05-14',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        passenger_id: 'd1b0bc7c-ae4a-443d-a1a0-b4a442e6f779',
        user_id: 'd1b0bc7c-ae4a-443d-a1a0-b4a442e6f779',
        title: 'Ms.',
        first_name: 'Alice',
        last_name: 'Smith',
        date_of_birth: '1985-08-20',
        email: 'alice.smith@example.com',
        phone_number: '0987654321',
        nationality: 'British',
        passport_no: 'CD789012',
        issuing_country: 'UK',
        valid_until: '2024-12-31',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        passenger_id: '4f725ae7-7d7d-47e2-bffe-76c79bcf1ace',
        user_id: '2b054118-24fc-4c00-8ba2-b1a5e9bb0069',
        title: 'Dr.',
        first_name: 'Michael',
        last_name: 'Johnson',
        date_of_birth: '1978-03-10',
        email: 'michael.johnson@example.com',
        phone_number: '9876543210',
        nationality: 'Canadian',
        passport_no: 'EF345678',
        issuing_country: 'Canada',
        valid_until: '2023-11-30',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        passenger_id: '1a3055a1-8cf5-4f2b-b7e3-60586ab48c41',
        user_id: '4f725ae7-7d7d-47e2-bffe-76c79bcf1ace',
        title: 'Mrs.',
        first_name: 'Emily',
        last_name: 'Brown',
        date_of_birth: '1995-12-05',
        email: 'emily.brown@example.com',
        phone_number: '1231231234',
        nationality: 'Australian',
        passport_no: 'GH901234',
        issuing_country: 'Australia',
        valid_until: '2026-09-25',
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ];

    // Insert data into the 'passengers' table
    await queryInterface.bulkInsert('Passengers', passengersData, {});
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
