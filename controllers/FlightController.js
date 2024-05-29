const ApiError = require("../utils/apiError");
const uuid = require('uuid');
const { Op } = require('sequelize');
// const { v4: uuidv4, validate: uuidValidate } = require('uuid');
const { Flight, Airport, Airline, Price } = require('../models');
const { query } = require("express");

const createFlight = async (req, res, next) => {
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
        arrival_airport_id,
    } = req.body;
    const flightId = uuid.v4();

    try {
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
            status: "Success",
            data: {
                flight,
            }
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

        validateQueryParams(req.query)

        //pagination
        const pageNum = parseInt(page) || 1;
        const pageSize = parseInt(limit) || 10;
        const offset = (pageNum - 1) * pageSize;

        //filter
        const includeClause = [];

        const whereClause = {};
        if (departure_airport) whereClause.departure_airport = departure_airport;
        if (departure_date) whereClause.departure_date = departure_date;
        if (arrival_airport) whereClause.arrival_airport = arrival_airport;
        if (arrival_date) whereClause.arrival_date = arrival_date;
        if (airline_id) whereClause.airline_id = airline_id;
        if (departure_time) whereClause.departure_time = departure_time;
        if (arrival_time) whereClause.arrival_time = arrival_time;
        if (flight_duration) whereClause.flight_duration = flight_duration;
        if (seats_available) whereClause.seats_available = { [Op.gte]: parseInt(seats_available) };
        // if (departure_city) {
        //     whereClause['$departingAirport.city$'] = departure_city;
        // }
        // if (arrival_city) {
        //     whereClause['$arrivingAirport.city$'] = arrival_city;
        // }
        // if (departure_continent) {
        //     whereClause['$departingAirport.continent$'] = departure_continent;
        // }
        // if (arrival_continent) {
        //     whereClause['$arrivingAirport.continent$'] = arrival_continent;
        // }
        // if (seat_class) {
        //     whereClause['$Prices.seat_class$'] = seat_class;
        // }

        if (req.query.search) {
            whereClause[Op.or] = {
                departure_airport: { [Op.like]: `%${req.query.search}%` },
                departure_date: { [Op.like]: `%${req.query.search}%` },
                arrival_airport: { [Op.like]: `%${req.query.search}%` },
                arrival_date: { [Op.like]: `%${req.query.search}%` },
                airline_id: { [Op.like]: `%${req.query.search}%` },
                departure_time: { [Op.like]: `%${req.query.search}%` },
                arrival_time: { [Op.like]: `%${req.query.search}%` },
                flight_duration: { [Op.like]: `%${req.query.search}%` },
                seats_available: { [Op.like]: `%${req.query.search}%` },
                // '$flight_description.seat_class$': { [Op.like]: `%${req.query.search}%` },
                '$departingAirport.city$': { [Op.like]: `%${req.query.search}%` },
                '$departingAirport.continent$': { [Op.like]: `%${req.query.search}%` },
                '$arrivingAirport.city$': { [Op.like]: `%${req.query.search}%` },
                '$arrivingAirport.continent$': { [Op.like]: `%${req.query.search}%` },
                '$Prices.seat_class$': { [Op.like]: `%${req.query.search}%` }
            };
        }

        includeClause.push(
            {
                model: Airport,
                as: 'departingAirport',
                attributes: ["city", "iata_code", "continent"]
            },
            {
                model: Airport,
                as: 'arrivingAirport',
                attributes: ["city", "iata_code", "continent"]
            },
            {
                model: Airline,
                attributes: ["airline_name", "airline_code"]
            }
        );

        if (seat_class) {
            includeClause.push({
                model: Price,
                as: 'Prices', // Set alias for the Price model
                where: {
                    seat_class: seat_class // Filter prices by seat class
                },
                attributes: ["price", "price_for_child"]
            });
        }
        const { count, rows: flights } = await Flight.findAndCountAll({
            attributes: ["flight_id", "flight_duration", "flight_description", "flight_status", "flight_code", "plane_type", "terminal", "departure_airport", "arrival_airport", "departure_date", "departure_time", "arrival_date", "arrival_time", "departure_airport_id", "arrival_airport_id"],
            include: includeClause,
            where: whereClause,
            offset,
            limit: pageSize,
        });

        const totalCount = count;
        const totalPages = Math.ceil(totalCount / pageSize);

        res.status(200).json({
            status: "Success",
            data: {
                flights,
            },
            pagination: {
                totalData: totalCount,
                totalPages,
                pageNum,
                pageSize,
            },
        });
    } catch (error) {
        console.log(error)
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
            ]
        });

        //if flight doesnt exist
        if (!flight) {
            return next(new ApiError(`Flight with ID: ${req.params.id} not found`, 404));
        }

        res.status(200).json({
            status: "Success",
            data: {
                flight,
            },
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
            status: "Success",
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
            status: "Success",
            data: updatedFlight
        });
    } catch (err) {
        next(new ApiError(err.message, 400));
    }
};


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
    updateFlight
};
