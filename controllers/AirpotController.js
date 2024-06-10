const ApiError = require("../utils/apiError");
const uuid = require('uuid');
const { Op } = require("sequelize");
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
            is_success: true,
            code: 201,
            data: {
                newAirport,
            },
            message: 'Airport Berhasil dibikin'
        });
    } catch (error) {
        next(new ApiError(error.message, 500));
    }
};

const getAllAirport = async (req, res, next) => {
    try {
        const { search, page, limit } = req.query;

        const pageNum = parseInt(page) || 1;
        const limitData = parseInt(limit) || 10;
        const offset = (pageNum - 1) * limitData;

        const whereClause = {};
        if (search) {
            whereClause[Op.or] = {
                city: { [Op.iLike]: `%${search}%` },
                country: { [Op.iLike]: `%${search}%` },
                iata_code: { [Op.iLike]: `%${search}%` }
            };
        }

        const { count, rows: airport } = await Airport.findAndCountAll({
            where: whereClause,
            attributes: { exclude: ['createdAt', 'updatedAt'] },
            offset,
            limit: limitData
        });

        const totalPages = Math.ceil(count / limitData);

        res.status(200).json({
            is_success: true,
            code: 200,
            data: {
                airport,
                pagination: {
                    totalData: count,
                    totalPages: totalPages,
                    pageNum,
                    limitData
                }
            },
            message: ''
        });
    } catch (err) {
        next(new ApiError(err.message, 400));
    }
};


module.exports = {
    createAirport,
    getAllAirport
};
