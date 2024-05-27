const { Flight, Airline, Airport } = require("./models");
const { v4: uuidv4 } = require('uuid');
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('db_finalproject', 'postgres', 'admin', {
    host: '127.0.0.1',
    dialect: 'postgres'
});

async function createTestData() {
    let transaction;
    try {
        // Start a transaction
        transaction = await sequelize.transaction();

        // Create airports
        const departureAirport = await Airport.create({
            airport_id: uuidv4(),
            airport_name: 'Departure Airport',
            city: 'Departure City',
            continent: 'Continent',
            iata_code: 'DPA',
            country: 'Country'
        }, { transaction });

        const arrivalAirport = await Airport.create({
            airport_id: uuidv4(),
            airport_name: 'Arrival Airport',
            city: 'Arrival City',
            continent: 'Continent',
            iata_code: 'ARA',
            country: 'Country'
        }, { transaction });

        const bandara1 = await Airport.create({
            airport_id: uuidv4(),
            airport_name: 'Soekarno Hatta',
            city: 'Tangerang',
            continent: 'Asia',
            iata_code: 'CGK',
            country: 'Indonesia'
        }, { transaction });

        const newAirline = await Airline.create({
            airline_id: uuidv4(),
            airline_name: 'New Airline',
            airline_code: 'NA',
            country: 'Country'
        }, { transaction });

        const airAsia = await Airline.create({
            airline_id: uuidv4(),
            airline_name: 'Air Asia',
            airline_code: 'AA',
            country: 'Malaysia'
        }, { transaction });

        const lionAir = await Airline.create({
            airline_id: uuidv4(),
            airline_name: 'Lion Air',
            airline_code: 'LA',
            country: 'indonesia'
        }, { transaction });

        const now = new Date();
        const twoHoursFromNow = new Date(now.getTime() + (2 * 60 * 60 * 1000));

        // Create a flight
        const flight = await Flight.create({
            flight_id: uuidv4(),
            airline_id: newAirline.airline_id,
            flight_duration: 180,
            flight_description: JSON.stringify({ baggage: "20kg", meals: "included" }),
            flight_status: 'on time',
            flight_code: 'JT-220',
            plane_type: 'Boeing 737',
            seats_available: 150,
            departure_airport: 'Departure Airport',
            arrival_airport: 'Arrival Airport',
            departure_date: now,
            departure_time: now.toTimeString().split(' ')[0],
            arrival_date: twoHoursFromNow,
            arrival_time: twoHoursFromNow.toTimeString().split(' ')[0],
            departure_airport_id: departureAirport.airport_id,
            arrival_airport_id: arrivalAirport.airport_id
        }, { transaction });

        const flight1 = await Flight.create({
            flight_id: uuidv4(),
            airline_id: airAsia.airline_id,
            flight_duration: 180,
            flight_description: JSON.stringify({ baggage: "20kg", meals: "included" }),
            flight_status: 'delayed',
            flight_code: 'AA-120',
            plane_type: 'Boeing 737',
            seats_available: 150,
            departure_airport: 'Departure Airport',
            arrival_airport: 'Soekarno Hatta',
            departure_date: now,
            departure_time: now.toTimeString().split(' ')[0],
            arrival_date: twoHoursFromNow,
            arrival_time: twoHoursFromNow.toTimeString().split(' ')[0],
            departure_airport_id: departureAirport.airport_id,
            arrival_airport_id: bandara1.airport_id
        }, { transaction });
        const flight2 = await Flight.create({
            flight_id: uuidv4(),
            airline_id: lionAir.airline_id,
            flight_duration: 180,
            flight_description: JSON.stringify({ baggage: "20kg", meals: "included" }),
            flight_status: 'en-route',
            flight_code: 'LA-330',
            plane_type: 'Boeing 737',
            seats_available: 150,
            departure_airport: 'Soekarno Hatta',
            arrival_airport: 'Arrival Airport',
            departure_date: now,
            departure_time: now.toTimeString().split(' ')[0],
            arrival_date: twoHoursFromNow,
            arrival_time: twoHoursFromNow.toTimeString().split(' ')[0],
            departure_airport_id: bandara1.airport_id,
            arrival_airport_id: arrivalAirport.airport_id
        }, { transaction });

        // Commit the transaction
        await transaction.commit();
        console.log('Test data created');
    } catch (error) {
        // Rollback the transaction if there's an error
        if (transaction) await transaction.rollback();
        console.error('Error creating test data:', error);
    }
}

// Call the function after sync
sequelize.sync({ force: true }).then(async () => {
    console.log("Database synchronized");
    await createTestData();
}).catch(console.error);
