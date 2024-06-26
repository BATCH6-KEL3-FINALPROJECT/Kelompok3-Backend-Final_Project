'use strict';
const { Sequelize } = require('sequelize');

const airportSeeder = require('./20240521153136-airport')
const airlineSeeder = require('./20240521153143-airline')
const seatSeeder = require('./20240521154422-seat')
const ticketSeeder = require('./20240521154431-ticket');
const userSeeder = require('./20240521154439-user');
const flightSeeder = require('./20240522102745-flight');
const priceSeeder = require('./20240527104424-price')
const passengerSeeder = require('./20240606155919-passenger')
const bookingSeeder = require('./20240610121447-booking')
const flightDataSeeder = require('./20240528033556-flightData');
const notificationSeeder = require('./20240612132242-notification');
require("dotenv").config();

const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USERNAME,
    process.env.DB_PASSWORD, {
    host: process.env.DB_HOST,
    dialect: 'postgres'
});
const queryInterface = sequelize.getQueryInterface();

/** @type {import('sequelize-cli').Migration} */
async function createSeed(queryInterface, Sequelize) {
    try {
        console.log("INI")
        // Call the up function of the userSeeder
        await airportSeeder.up(queryInterface, Sequelize)
        await airlineSeeder.up(queryInterface, Sequelize)
        await userSeeder.up(queryInterface, Sequelize);
        await passengerSeeder.up(queryInterface, Sequelize);
        await flightDataSeeder.up(queryInterface, sequelize);
        await priceSeeder.up(queryInterface, Sequelize)
        await seatSeeder.up(queryInterface, Sequelize);
        await bookingSeeder.up(queryInterface, Sequelize)
        await ticketSeeder.up(queryInterface, Sequelize);
        await notificationSeeder.up(queryInterface, Sequelize)
        // await flightSeeder.up(queryInterface, Sequelize);
        console.log('seeder executed successfully.');
    } catch (error) {
        console.error('Error executing user seeder:', error);
    }

    try {
        // Call the down function of the userSeeder
        // await userSeeder.down(queryInterface, Sequelize);
    } catch (error) {
        console.error('Error reverting user seeder:', error);
    }
}

createSeed(queryInterface, sequelize)
