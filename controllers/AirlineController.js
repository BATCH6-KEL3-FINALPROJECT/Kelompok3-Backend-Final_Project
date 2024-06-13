const ApiError = require("../utils/apiError");
const uuid = require('uuid');
const { Airline } = require('../models');

const createAirline = async (req, res, next) => {
    const {
        airline_name,
        airline_code,
        country
    } = req.body;

    const airlineId = uuid.v4();

    try {
        const newAirline = await Airline.create({
            airline_id: airlineId,
            airline_name,
            airline_code,
            country
        });


        res.status(201).json({
            is_success: true,
            code: 201,
            data: {
                newAirline,
            },
            'message': 'Airline created successfully'
        });
    } catch (error) {
        next(new ApiError(error.message, 500));
    }
};

const getAllAirlines = async (req, res, next) => {
    try {

        const airlines = await Airline.findAll();

        res.status(200).json({
            status: "Success",
            data: {
                airlines
            },
        });
    } catch (err) {
        next(new ApiError(err.message, 400));
    }
};


module.exports = {
    createAirline,
    getAllAirlines
};
