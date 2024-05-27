"use strict";
const { v4: uuidv4 } = require("uuid");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert(
      "Users",
      [
        {
          user_id: "2b054118-24fc-4c00-8ba2-b1a5e9bb0069",
          name: "Rafli Kharisma Akbar",
          email: "adjrafli@gmail.com",
          phone_number: "+6281294703072",
          password:
            "$2a$12$Ry6lgjq/hZ1VGJ9zlpH93uIPeoh0sSZRjV3FlpbwfJq7hwgLll3cS",
          role: "admin",
          is_verified: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          user_id: "57955d45-674f-4e68-9621-22fb1e948fd0",
          name: "Azka Zaki",
          email: "azkazaki11@gmail.com",
          phone_number: "+6281221208714",
          password:
            "$2a$12$Ry6lgjq/hZ1VGJ9zlpH93uIPeoh0sSZRjV3FlpbwfJq7hwgLll3cS",
          role: "admin",
          is_verified: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          user_id: "d1b0bc7c-ae4a-443d-a1a0-b4a442e6f779",
          name: "Muhammad Riski",
          email: "mhdrizky32@gmail.com",
          phone_number: "+6282388013330",
          password:
            "$2a$12$Ry6lgjq/hZ1VGJ9zlpH93uIPeoh0sSZRjV3FlpbwfJq7hwgLll3cS",
          role: "admin",
          is_verified: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          user_id: "4f725ae7-7d7d-47e2-bffe-76c79bcf1ace",
          name: "Hafiedz ",
          email: "hasmy41@gmail.com",
          phone_number: "+6285255311529",
          password:
            "$2a$12$Ry6lgjq/hZ1VGJ9zlpH93uIPeoh0sSZRjV3FlpbwfJq7hwgLll3cS",
          role: "admin",
          is_verified: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          user_id: "872c72c3-5dda-48ec-a462-fa823acafbc9",
          name: "Trujillo Reid",
          email: "trujilloreid@bitrex.com",
          phone_number: "+62 (886) 472-2530",
          password:
            "$2a$12$.Rh1oyiWpq5SQRFACgT3IOjIC9pfWxhTsT4SUBGOD.QTUuOEBW.Me",
          role: "user",
          is_verified: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          user_id: "ebd93782-e04e-4c8d-ba31-6facf3141bd3",
          name: "Francis Carson",
          email: "franciscarson@bitrex.com",
          phone_number: "+62 (895) 518-3838",
          password:
            "$2a$12$.Rh1oyiWpq5SQRFACgT3IOjIC9pfWxhTsT4SUBGOD.QTUuOEBW.Me",
          role: "user",
          is_verified: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          user_id: "f7999564-f726-4a85-bb97-d5d891f0eea6",
          name: "Sally Forbes",
          email: "sallyforbes@bitrex.com",
          phone_number: "+62 (934) 567-2600",
          password:
            "$2a$12$.Rh1oyiWpq5SQRFACgT3IOjIC9pfWxhTsT4SUBGOD.QTUuOEBW.Me",
          role: "user",
          is_verified: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          user_id: "d2cc2f92-efb3-411b-9a4e-44adb6398de1",
          name: "Hartman Ashley",
          email: "hartmanashley@bitrex.com",
          phone_number: "+62 (868) 446-2690",
          password:
            "$2a$12$.Rh1oyiWpq5SQRFACgT3IOjIC9pfWxhTsT4SUBGOD.QTUuOEBW.Me",
          role: "user",
          is_verified: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          user_id: "c1f6d709-c4ed-4668-9864-215929193b96",
          name: "Benjamin Stevens",
          email: "benjaminstevens@bitrex.com",
          phone_number: "+62 (806) 460-3037",
          password:
            "$2a$12$.Rh1oyiWpq5SQRFACgT3IOjIC9pfWxhTsT4SUBGOD.QTUuOEBW.Me",
          role: "user",
          is_verified: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          user_id: "20eded2d-e6de-467a-9675-d7736780e238",
          name: "Rowena Curry",
          email: "rowenacurry@bitrex.com",
          phone_number: "+62 (856) 599-2950",
          password:
            "$2a$12$.Rh1oyiWpq5SQRFACgT3IOjIC9pfWxhTsT4SUBGOD.QTUuOEBW.Me",
          role: "user",
          is_verified: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          user_id: "906dd3e4-2429-4af0-a10a-9c2114d33cb5",
          name: "Day Lawrence",
          email: "daylawrence@bitrex.com",
          phone_number: "+62 (997) 420-2519",
          password:
            "$2a$12$.Rh1oyiWpq5SQRFACgT3IOjIC9pfWxhTsT4SUBGOD.QTUuOEBW.Me",
          role: "user",
          is_verified: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      {}
    );
  },

  async down(queryInterface, Sequelize) {
  
    
     await queryInterface.bulkDelete('Users', null, {});
     
  },
};
