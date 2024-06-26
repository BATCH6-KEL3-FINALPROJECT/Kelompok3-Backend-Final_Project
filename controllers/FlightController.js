const ApiError = require("../utils/apiError");
const uuid = require('uuid');
const { Op } = require('sequelize');
// const { v4: uuidv4, validate: uuidValidate } = require('uuid');
const { Flight, Airport, Airline, Price } = require('../models');
const { query } = require("express");
const { Sequelize, QueryTypes } = require('sequelize');
const airport = require("../models/airport");
require("dotenv").config();

const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USERNAME,
    process.env.DB_PASSWORD, {
    host: process.env.DB_HOST,
    dialect: 'postgres'
});
const createFlight = async (req, res, next) => {
    const {
        airline_code,
        flight_duration,
        flight_description,
        flight_status,
        flight_code,
        plane_type,
        seats_available,
        departure_date,
        departure_time,
        arrival_date,
        arrival_time,
        departure_iata_code,
        arrival_iata_code,
    } = req.body;
    const flightId = uuid.v4();

    try {
        // Check if related entities exist
        // const departingAirport = await Airport.findByPk(departure_airport_id)
        // const arrivingAirport = await Airport.findByPk(arrival_airport_id);
        // const airline = await Airline.findByPk(airline_id);

        const departingAirport = await Airport.findOne({ where: { iata_code: departure_iata_code } });
        const arrivingAirport = await Airport.findOne({ where: { iata_code: arrival_iata_code } });
        const airline = await Airline.findOne({ where: { airline_code: airline_code } });

        if (!departingAirport) {
            return next(new ApiError("Departing Airport not found", 404));
        }
        if (!arrivingAirport) {
            return next(new ApiError("Arriving Airport not found", 404));
        }
        if (!airline) {
            return next(new ApiError("Airline not found", 404));
        }

        // Check UUID Format
        // if (!uuidValidate(airline || departingAirport || arrivingAirport)) {
        //     throw new ApiError('Invalid UUID format', 400);
        // }

        // Create Flight
        const flight = await Flight.create({
            flight_id: flightId,
            airline_id: airline.airline_id,
            flight_duration,
            flight_description,
            flight_status,
            flight_code,
            plane_type,
            seats_available,
            departure_airport: departingAirport.airport_name,
            arrival_airport: arrivingAirport.airport_name,
            departure_date,
            departure_time,
            arrival_date,
            arrival_time,
            departure_airport_id: departingAirport.airport_id,
            arrival_airport_id: arrivingAirport.airport_id
        });

        res.status(201).json({
            is_success: true,
            code: 201,
            data: {
                flight,
            },
            message: 'Create flight success'
        });
    } catch (error) {
        next(new ApiError(error.message, 400));
    }
};

const getAllFlights = async (req, res, next) => {
    try {
        const { airline_id,
            departure_city,
            arrival_city,
            departure_date,
            arrival_date,
            departure_time,
            arrival_time,
            seat_class,
            flight_duration,
            departure_airport,
            arrival_airport,
            seats_available,
            departure_continent,
            arrival_continent,
            page,
            limit } = req.query;

        // Pagination
        const pageNum = parseInt(page) || 1;
        const pageSize = parseInt(limit) || 10;
        const offset = (pageNum - 1) * pageSize;
        const seatClassLower = seat_class.toLowerCase();

        // Construct the raw SQL query
        let sqlQuery = `SELECT f.flight_id, f.flight_code, f.flight_duration, f.flight_description, f.flight_status, f.plane_type, f.seats_available, f.terminal, f.departure_date, f.departure_time, f.arrival_date, f.arrival_time, 
             da.airport_name AS departure_airport_name, da.city AS departure_city, da.iata_code AS departure_iata_code, 
             aa.airport_name AS arrival_airport_name, aa.city AS arrival_city, aa.iata_code AS arrival_iata_code, 
             p.seat_class, p.price, p.price_for_child, p.price_for_infant, al.airline_name, al.airline_code
            FROM public."Flights" f
            JOIN public."Airports" da ON f.departure_airport_id = da.airport_id
            JOIN public."Airports" aa ON f.arrival_airport_id = aa.airport_id
            JOIN public."Prices" p ON f.flight_id = p.flight_id
            JOIN public."Airlines" al on f.airline_id = al.airline_id
            WHERE 1 = 1`;

        // Add filter conditions to the SQL query based on query parameters
        if (departure_airport) sqlQuery += ` AND f.departure_airport = '${departure_airport}'`;
        if (departure_date) sqlQuery += ` AND f.departure_date = '${departure_date}'`;
        if (arrival_airport) sqlQuery += ` AND f.arrival_airport = '${arrival_airport}'`;
        // if (arrival_date) sqlQuery += ` AND f.arrival_date = '${arrival_date}'`;
        if (airline_id) sqlQuery += ` AND f.airline_id = '${airline_id}'`;
        if (departure_time) sqlQuery += ` AND f.departure_time = '${departure_time}'`;
        if (arrival_time) sqlQuery += ` AND f.arrival_time = '${arrival_time}'`;
        // if (flight_duration) sqlQuery += ` AND f.flight_duration = '${flight_duration}'`;
        // if (seats_available) sqlQuery += ` AND f.seats_available >= ${seats_available}`;
        if (seatClassLower) sqlQuery += ` AND p.seat_class = '${seatClassLower}'`;
        if (departure_city) sqlQuery += ` AND da.city = '${departure_city}'`;
        if (arrival_city) sqlQuery += ` AND aa.city = '${arrival_city}'`;

        // Execute the raw SQL query
        const flights = await sequelize.query(sqlQuery, { type: QueryTypes.SELECT });
        flights.forEach(flight => {
            flight.seat_class = flight.seat_class.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
        });

        if (flights.length === 0) {
            res.status(404).json({
                is_success: true,
                code: 404,
                data: {

                },
                message: "No Flight found for the requested date",

            });
        }
        // Calculate pagination details
        const totalCount = flights.length;
        const totalPages = Math.ceil(totalCount / pageSize);

        // Paginate the results
        const paginatedFlights = flights.slice(offset, offset + pageSize);

        // Send response
        res.status(200).json({
            is_success: true,
            code: 200,
            data: {
                flights: paginatedFlights,
                pagination: {
                    totalData: totalCount,
                    totalPages,
                    pageNum,
                    pageSize,
                },
            },
            message: 'get flight data success'
        });
    } catch (error) {
        console.log(error);
        next(new ApiError(error.message, 400));
    }
};


const getFlightById = async (req, res, next) => {
    try {
        const flight = await Flight.findByPk(req.params.id, {
            include: [
                {
                    model: Airport,
                    as: 'departingAirport',
                    attributes: ["city", "continent"]
                },
                {
                    model: Airport,
                    as: 'arrivingAirport',
                    attributes: ["city", "continent"]
                },
                {
                    model: Airline,
                    attributes: ["airline_name", "airline_code"]
                },
                {
                    model: Price,
                    attributes: { exclude: ['createdAt', 'updatedAt'] }, // Exclude createdAt and updatedAt fields
                }
            ]
        });

        //if flight doesnt exist
        if (!flight) {
            return next(new ApiError(`Flight with ID: ${req.params.id} not found`, 404));
        }

        res.status(200).json({
            is_success: true,
            code: 200,
            data: {
                flight,
            },
            message: 'get flight details success'
        });
    } catch (err) {
        next(new ApiError(err.message, 400));
    }
};

const deleteFlight = async (req, res, next) => {
    try {
        const flight = await Flight.findByPk(req.params.id);

        //if flight doesnt exist
        if (!flight) {
            next(new ApiError(`Flight with this ID : ${req.params.id} not found`, 404));
        }

        await Flight.destroy({
            where: {
                flight_id: req.params.id,
            },
        });

        res.status(200).json({
            is_success: true,
            code: 200,
            data: {

            },
            message: "successfully deleted flight",
        });
    } catch (err) {
        next(new ApiError(err.message, 400));
    }
};

const updateFlight = async (req, res, next) => {
    const {
        airline_id,
        flight_duration,
        flight_description,
        flight_status,
        flight_code,
        plane_type,
        seats_available,
        departure_date,
        departure_time,
        arrival_date,
        arrival_time,
        departure_airport_id,
        arrival_airport_id
    } = req.body;

    try {
        const flight = await Flight.findByPk(req.params.id)

        //if flight doesnt exist
        if (!flight) {
            next(new ApiError(`Flight with this ID : ${req.params.id} not found`, 404));
        }

        // Check if related entities exist
        const departingAirport = await Airport.findByPk(departure_airport_id)
        const arrivingAirport = await Airport.findByPk(arrival_airport_id);
        const airline = await Airline.findByPk(airline_id);

        if (!departingAirport) {
            return next(new ApiError("Departing Airport not found", 404));
        }
        if (!arrivingAirport) {
            return next(new ApiError("Arriving Airport not found", 404));
        }
        if (!airline) {
            return next(new ApiError("Airline not found", 404));
        }


        await Flight.update(
            {
                airline_id,
                flight_duration,
                flight_description,
                flight_status,
                flight_code,
                plane_type,
                seats_available,
                departure_airport: departingAirport.airport_name,
                arrival_airport: arrivingAirport.airport_name,
                departure_date,
                departure_time,
                arrival_date,
                arrival_time,
                departure_airport_id,
                arrival_airport_id
            },
            {
                where: {
                    flight_id: req.params.id,
                },
            }
        );

        const updatedFlight = await Flight.findByPk(req.params.id,
            {
                include: [
                    {
                        model: Airport,
                        as: 'departingAirport',
                        attributes: ["city", "continent"]
                    },
                    {
                        model: Airport,
                        as: 'arrivingAirport',
                        attributes: ["city", "continent"]
                    },
                    {
                        model: Airline,
                        attributes: ["airline_name", "airline_code"]
                    },
                ]
            }
        );

        res.status(200).json({
            is_success: true,
            code: 200,
            data: updatedFlight,
            message: 'Flights updated successfully'
        });
    } catch (err) {
        next(new ApiError(err.message, 400));
    }
};

const favoriteDestination = async (req, res, next) => {
    try {
        let favoriteDestination = [
            {
                isRoundTrip: true, //set aja true
                from: 'Jakarta', //city
                to: 'Singapore', //city
                continent: 'Asia',
                departureDate: '2024-06-04', //tanggal kedatangan
                returnDate: '2024-06-04', //tanggal kepulangan
                passengersTotal: 3,
                passengersAdult: 3,
                passengersBaby: 0,
                passengersChild: 0,
                seatClass: 'economy', //kelas penumpang
                discount: '50%', //(bebas mau set berapa, ga juga gapapa.Bisa juga lu set jadi limited statusnya)
                price: 999999,
                imageUrl: 'https://smansasingaraja.sch.id/wp-content/uploads/2021/09/singapore-1-960x600-1.jpg',
                airline: 'Lion air'
            },
            {
                isRoundTrip: true, //set aja true
                from: 'Jakarta', //city
                to: 'Medina', //city
                continent: 'Asia',
                departureDate: '2024-06-05', //tanggal kedatangan
                returnDate: '2024-06-05', //tanggal kepulangan
                passengersTotal: 3,
                passengersAdult: 3,
                passengersBaby: 0,
                passengersChild: 0,
                seatClass: 'economy', //kelas penumpang
                discount: '50%', //(bebas mau set berapa, ga juga gapapa.Bisa juga lu set jadi limited statusnya)
                price: 1500000,
                imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/Madeena_masjid_nabavi_12122008230.jpg/800px-Madeena_masjid_nabavi_12122008230.jpg',
                airline: 'Saudia'
            },
            {
                isRoundTrip: true, //set aja true
                from: 'Bali', //city
                to: 'Lisbon', //city
                continent: 'Europe',
                departureDate: '2024-06-06', //tanggal kedatangan
                returnDate: '2024-06-06', //tanggal kepulangan
                passengersTotal: 3,
                passengersAdult: 3,
                passengersBaby: 0,
                passengersChild: 0,
                seatClass: 'economy', //kelas penumpang
                discount: '10%', //(bebas mau set berapa, ga juga gapapa.Bisa juga lu set jadi limited statusnya)
                price: 1300000,
                imageUrl: 'https://www.oliverstravels.com/blog/wp-content/uploads/2019/05/Sintra-Coast-V2.jpg',
                airline: 'Garuda Indonesia'
            },
            {
                isRoundTrip: true, //set aja true
                from: 'Jakarta', //city
                to: 'Tokyo', //city
                continent: 'Asia',
                departureDate: '2024-06-07', //tanggal kedatangan
                returnDate: '2024-06-07', //tanggal kepulangan
                passengersTotal: 3,
                passengersAdult: 3,
                passengersBaby: 0,
                passengersChild: 0,
                seatClass: 'economy', //kelas penumpang
                discount: '5%', //(bebas mau set berapa, ga juga gapapa.Bisa juga lu set jadi limited statusnya)
                price: 1400000,
                imageUrl: 'https://www.planetware.com/wpimages/2020/06/japan-tokyo-to-mt-fuji-best-ways-to-get-there-by-group-tour.jpg',
                airline: 'Japan Airlines'
            },
            {
                isRoundTrip: true, //set aja true
                from: 'Jakarta', //city
                to: 'Los angeles', //city
                continent: 'America',
                departureDate: '2024-06-09', //tanggal kedatangan
                returnDate: '2024-06-09', //tanggal kepulangan
                passengersTotal: 3,
                passengersAdult: 3,
                passengersBaby: 0,
                passengersChild: 0,
                seatClass: 'economy', //kelas penumpang
                discount: '1%', //(bebas mau set berapa, ga juga gapapa.Bisa juga lu set jadi limited statusnya)
                price: 2000000,
                imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/74/LA_Downtown_View_%28cropped%29.jpg/800px-LA_Downtown_View_%28cropped%29.jpg',
                airline: 'China Eastern Airlines'
            },
        ]

        res.status(200).json({
            is_success: true,
            code: 200,
            data: favoriteDestination,
            message: "Favorite destination"
        });
    } catch (error) {
        console.log(error)
        next(new ApiError(error.message, 500))
    }
}

//code sementara otw refactor 
const validateQueryParams = (params) => {
    const {
        page,
        limit,
        seats_available,
        departure_date,
        arrival_date
    } = params;

    if (page && isNaN(parseInt(page))) throw new ApiError('Invalid page number', 400);
    if (limit && isNaN(parseInt(limit))) throw new ApiError('Invalid limit number', 400);
    if (seats_available && isNaN(parseInt(seats_available))) throw new ApiError('Invalid seats available', 400);
    if (departure_date && isNaN(Date.parse(departure_date))) throw new ApiError('Invalid departure date', 400);
    if (arrival_date && isNaN(Date.parse(arrival_date))) throw new ApiError('Invalid arrival date', 400);
};
module.exports = {
    createFlight,
    getAllFlights,
    getFlightById,
    deleteFlight,
    updateFlight,
    favoriteDestination
};
