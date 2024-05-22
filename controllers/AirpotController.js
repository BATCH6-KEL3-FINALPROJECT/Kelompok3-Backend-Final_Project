const ApiError = require("../utils/apiError");
const uuid = require('uuid');
const { Airport } = require('../models');

const createAirport = async (req, res, next) => {
    const {
        airport_name,
        city,
        continent,
        iata_code,
        country
    } = req.body;

    const airportId = uuid.v4();

    try {
        const newAirport = await Airport.create({
            airport_id: airportId,
            airport_name,
            city,
            continent,
            iata_code,
            country
        });


        res.status(201).json({
            status: "Success",
            data: {
                newAirport,
            }
        });
    } catch (error) {
        next(new ApiError(error.message, 500));
    }
};

const getAllAirport = async (req, res, next) => {
    try {

        const airport = await Airport.findAll();

        res.status(200).json({
            status: "Success",
            data: {
                airport
            },
        });
    } catch (err) {
        next(new ApiError(err.message, 400));
    }
};


module.exports = {
    createAirport,
    getAllAirport
};
