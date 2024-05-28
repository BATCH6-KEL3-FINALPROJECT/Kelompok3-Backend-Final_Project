'use strict';
const { Sequelize } = require('sequelize');

const airportSeeder = require('./20240521153136-airport')
const airlineSeeder = require('./20240521153143-airline')
const bookingSeeder = require('./20240521154324-booking')
const seatSeeder = require('./20240521154422-seat')
const ticketSeeder = require('./20240521154431-ticket');
const userSeeder = require('./20240521154439-user');
const flightSeeder = require('./20240522102745-flight');
const priceSeeder = require('./20240527104424-price')
const flightDataSeeder = require('./20240528033556-flightData');

const sequelize = new Sequelize('db_finalproject', 'postgres', 'admin', {
    host: '127.0.0.1',
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
        // await flightSeeder.up(queryInterface, Sequelize);
        await flightDataSeeder.up(queryInterface, sequelize);
        await userSeeder.up(queryInterface, Sequelize);
        await priceSeeder.up(queryInterface, Sequelize)
        // await seatSeeder.up(queryInterface, Sequelize);
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
