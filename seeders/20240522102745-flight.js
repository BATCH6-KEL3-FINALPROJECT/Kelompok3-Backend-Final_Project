"use strict";
const { v4: uuidv4 } = require("uuid");
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

    await queryInterface.bulkInsert(
      "Flights",
      [
        {
          flight_id: "3fdf994e-c84c-4930-a225-f90b784e5e2f",
          airline_id: "87d70109-fabb-4626-a854-2da5e9134420",
          flight_duration: 75, // in minutes
          flight_description: JSON.stringify({
            Informasi:
              " Bagasi Kabin 7Kg \n Bagasi 20Kg \n Tidak ada hiburan di pesawat",
          }),
          flight_status: "on time",
          flight_code: "JT-683",
          plane_type: "Boeing 737-900",
          seats_available: 213,
          departure_airport: "Bandar Udara Tjilik Riwut",
          arrival_airport: "Bandar Udara Internasional Juanda",
          departure_date: new Date("2024-06-11"),
          departure_time: "13:35:00",
          arrival_date: new Date("2024-06-11"),
          arrival_time: "14:50:00",
          departure_airport_id: "352f9fc8-bd96-48e2-a99a-cc75a4d10e3f",
          arrival_airport_id: "ebc3ecd6-b01f-418f-8f5d-646d56b17a26",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          flight_id: "f9069f22-e4af-4a90-a139-d9ea5709d6e8",
          airline_id: "cba794f5-b409-46c0-89c2-55e32aef449d",
          flight_duration: 95,
          flight_description: JSON.stringify({
            Informasi:
              " Bagasi Kabin 7Kg \n Bagasi 20Kg \n Tidak ada hiburan di pesawat \n Tidak ada wifi \n",
          }),
          flight_status: "on time",
          flight_code: "QG-719",
          plane_type: "Airbus A320",
          seats_available: 175,
          departure_airport: "Bandar Udara Internasional Juanda",
          arrival_airport: "Bandara Internasional Soekarno Hatta",
          departure_date: new Date("2024-06-12"),
          departure_time: "19:40:00",
          arrival_date: new Date("2024-06-12"),
          arrival_time: "21:15:00",
          departure_airport_id: "ebc3ecd6-b01f-418f-8f5d-646d56b17a26",
          arrival_airport_id: "f22c76ea-a5f7-4c1b-b37f-e559826cf2da",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          flight_id: "09b215d8-91a7-4496-bd35-4a4e3bcf0702",
          airline_id: "bbe24ce4-9188-463c-b8c9-041e865b6412",
          flight_duration: 80,
          flight_description: JSON.stringify({
            Informasi:
              " Bagasi Kabin 7Kg \n Bagasi 20Kg \n Tidak ada hiburan di pesawat \n Tidak ada wifi \n",
          }),
          flight_status: "on time",
          flight_code: "IP-245",
          plane_type: "Airbus A320",
          seats_available: 175,
          departure_airport: "Bandar Udara Internasional Yogyakarta",
          arrival_airport: "Bandara Internasional Soekarno Hatta",
          departure_date: new Date("2024-06-14"),
          departure_time: "08:45:00",
          arrival_date: new Date("2024-06-14"),
          arrival_time: "09:55:00",
          departure_airport_id: "83235340-4a91-426d-8e32-a283dc843d21",
          arrival_airport_id: "f22c76ea-a5f7-4c1b-b37f-e559826cf2da",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          flight_id: "a514de6e-c2b2-4348-afe6-659a97919297",
          airline_id: "20b1d7a6-f38f-408b-aa26-b395cdee5275",
          flight_duration: 65,
          flight_description: JSON.stringify({
            Informasi:
              " Bagasi Kabin 7Kg \n Bagasi 20Kg \n Tidak ada hiburan di pesawat \n Tidak ada wifi \n",
          }),
          flight_status: "on time",
          flight_code: "QZ-627",
          plane_type: "Airbus A320",
          seats_available: 168,
          departure_airport: "Bandar Udara Internasional Juanda",
          arrival_airport: "Bandar Udara Internasional I Gusti Ngurah Rai",
          departure_date: new Date("2024-06-17"),
          departure_time: "11:15:00",
          arrival_date: new Date("2024-06-17"),
          arrival_time: "13:20:00",
          departure_airport_id: "ebc3ecd6-b01f-418f-8f5d-646d56b17a26",
          arrival_airport_id: "3670ded6-a932-4f7b-957c-ad27626a056d",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          flight_id: "f5fe2220-7ea4-4aaf-8078-b8507a124bed",
          airline_id: "ab40b7a9-988d-4e7a-b5e7-e3a33616a2f2",
          flight_duration: 110,
          flight_description: JSON.stringify({
            Informasi:
              " Bagasi Kabin 7Kg \n Bagasi 20Kg \n Tidak ada hiburan di pesawat \n Tidak ada wifi \n",
          }),
          flight_status: "on time",
          flight_code: "IN-280",
          plane_type: "Boeing 737",
          seats_available: 161,
          departure_airport: "Bandara Internasional Soekarno Hatta",
          arrival_airport: "Bandar Udara Internasional I Gusti Ngurah Rai",
          departure_date: new Date("2024-06-17"),
          departure_time: "05:30:00",
          arrival_date: new Date("2024-06-17"),
          arrival_time: "08:20:00",
          departure_airport_id: "f22c76ea-a5f7-4c1b-b37f-e559826cf2da",
          arrival_airport_id: "3670ded6-a932-4f7b-957c-ad27626a056d",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          flight_id: "f9649c01-1e26-43ae-9d73-8e441ccfe136",
          airline_id: "54b90398-00ba-47fb-bea2-3a3aaa4f5241",
          flight_duration: 110,
          flight_description: JSON.stringify({
            Informasi:
              " Bagasi Kabin 7Kg \n Bagasi 20Kg \n Tidak ada hiburan di pesawat \n Tidak ada wifi \n",
          }),
          flight_status: "on time",
          flight_code: "IU-740",
          plane_type: "Airbus A320-200",
          seats_available: 180,
          departure_airport: "Bandara Internasional Soekarno Hatta",
          arrival_airport: "Bandar Udara Internasional I Gusti Ngurah Rai",
          departure_date: new Date("2024-06-17"),
          departure_time: "07:45:00",
          arrival_date: new Date("2024-06-17"),
          arrival_time: "10:35:00",
          departure_airport_id: "f22c76ea-a5f7-4c1b-b37f-e559826cf2da",
          arrival_airport_id: "3670ded6-a932-4f7b-957c-ad27626a056d",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          flight_id: "7df3e3ef-a607-4f9e-b8c1-6a485113b96b",
          airline_id: "aaa6c89c-84fa-485a-8c3f-979b4796743e",
          flight_duration: 140,
          flight_description: JSON.stringify({
            Informasi:
              " Bagasi Kabin 7Kg \n Bagasi 20Kg \n Tidak ada hiburan di pesawat \n Tidak ada wifi \n",
          }),
          flight_status: "on time",
          flight_code: "SJ-580",
          plane_type: "Boeing 737",
          seats_available: 180,
          departure_airport: "Bandara Internasional Soekarno Hatta",
          arrival_airport: "Bandar Udara Internasional Sultan Hasanuddin",
          departure_date: new Date("2024-06-17"),
          departure_time: "14:00:00",
          arrival_date: new Date("2024-06-17"),
          arrival_time: "17:25:00",
          departure_airport_id: "f22c76ea-a5f7-4c1b-b37f-e559826cf2da",
          arrival_airport_id: "8bcb5dcc-a4b8-4aab-91bf-ff766e6fc8ef",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          flight_id: "9a673c8a-f17d-4122-aecb-288537dab0c3",
          airline_id: "cba794f5-b409-46c0-89c2-55e32aef449d",
          flight_duration: 105,
          flight_description: JSON.stringify({
            Informasi:
              " Bagasi Kabin 7Kg \n Bagasi 20Kg \n Tidak ada hiburan di pesawat \n Tidak ada wifi \n",
          }),
          flight_status: "on time",
          flight_code: "QG-452",
          plane_type: "Airbus A320",
          seats_available: 175,
          departure_airport: "Bandara Internasional Soekarno Hatta",
          arrival_airport: "Bandar Udara Tjilik Riwut",
          departure_date: new Date("2024-06-19"),
          departure_time: "12:35:00",
          arrival_date: new Date("2024-06-19"),
          arrival_time: "14:15:00",
          departure_airport_id: "f22c76ea-a5f7-4c1b-b37f-e559826cf2da",
          arrival_airport_id: "352f9fc8-bd96-48e2-a99a-cc75a4d10e3f",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          flight_id: "24f58291-8bc3-4d37-94a8-1948f6a650bb",
          airline_id: "20b1d7a6-f38f-408b-aa26-b395cdee5275",
          flight_duration: 150,
          flight_description: JSON.stringify({
            Informasi:
              " Bagasi Kabin 7Kg \n Bagasi 20Kg \n Tidak ada hiburan di pesawat \n Tidak ada wifi \n",
          }),
          flight_status: "on time",
          flight_code: "QZ-328",
          plane_type: "Airbus A320",
          seats_available: 180,
          departure_airport: "Bandar Udara Internasional Juanda",
          arrival_airport: "Kuala Lumpur International Airport",
          departure_date: new Date("2024-06-15"),
          departure_time: "06:20:00",
          arrival_date: new Date("2024-06-15"),
          arrival_time: "09:50:00",
          departure_airport_id: "ebc3ecd6-b01f-418f-8f5d-646d56b17a26",
          arrival_airport_id: "63d06581-65fa-4cb2-af5b-3293f5440e5a",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          flight_id: "9c673c8a-f17d-4122-aecb-288537dab0c3",
          airline_id: "678ea24a-005a-4aa6-925f-2edabb51f671",
          flight_duration: 100,
          flight_description: JSON.stringify({
            Informasi:
              " Bagasi Kabin 7Kg \n Bagasi 20Kg \n Tidak ada hiburan di pesawat \n Tidak ada wifi \n",
          }),
          flight_status: "on time",
          flight_code: "IW-1804",
          plane_type: "ATR-72",
          seats_available: 76,
          departure_airport: "Bandar Udara Internasional Juanda",
          arrival_airport: "Bandar Udara H. Asan",
          departure_date: new Date("2024-06-17"),
          departure_time: "09:50:00",
          arrival_date: new Date("2024-06-17"),
          arrival_time: "11:30:00",
          departure_airport_id: "ebc3ecd6-b01f-418f-8f5d-646d56b17a26",
          arrival_airport_id: "fc38bd8c-e41a-4380-8a44-e066c2b0198a",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          flight_id: "afdefceb-6eda-46f6-acf5-944c61e8a519",
          airline_id: "8c0b982e-444f-4994-98be-d072a97e2bcc",
          flight_duration: 435,
          flight_description: JSON.stringify({
            Informasi:
              " Bagasi Kabin 7Kg \n Bagasi 20Kg \n Tidak ada hiburan di pesawat \n Tidak ada wifi \n",
          }),
          flight_status: "on time",
          flight_code: "3K-250",
          plane_type: "Airbus A330-900",
          seats_available: 335,
          departure_airport: "Singapore Changi Airport",
          arrival_airport: "Narita International Airport",
          departure_date: new Date("2024-06-20"),
          departure_time: "00:55:00",
          arrival_date: new Date("2024-06-20"),
          arrival_time: "09:10:00",
          departure_airport_id: "13c32fe1-9fa1-4070-aef9-e9bd7070f4ca",
          arrival_airport_id: "a06d9c35-8787-46d9-8778-609ff998d4b2",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      {}
    );
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */

    await queryInterface.bulkDelete("Flights", null, {});
  },
};
