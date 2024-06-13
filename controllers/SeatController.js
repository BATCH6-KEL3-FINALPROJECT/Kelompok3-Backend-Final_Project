const ApiError = require("../utils/apiError");
const uuid = require('uuid');
const { Op } = require("sequelize");
const { Seat, Flight, Price } = require('../models');

const getAllSeats = async (req, res, next) => {
    try {
        const {
            seat_class,
            seat_number,
            is_available,
            flight_id,
            page,
            limit,
        } = req.query;

        const pageNum = parseInt(page) || 1;
        const limitData = parseInt(limit) || 10;
        const offset = (pageNum - 1) * limitData;

        const whereClause = {};
        if (seat_class) whereClause.seat_class = seat_class;
        if (seat_number) whereClause.seat_number = { [Op.iLike]: `%${seat_number}%` };
        if (typeof is_available !== 'undefined') whereClause.is_available = is_available === 'true';
        if (flight_id) whereClause.flight_id = flight_id;

        if (req.query.search) {
            whereClause[Op.or] = {
                seat_class: { [Op.like]: `%${req.query.search}%` },
                seat_number: { [Op.like]: `%${req.query.search}%` },
                is_available: { [Op.like]: `%${req.query.search}%` },
                flight_id: { [Op.like]: `%${req.query.search}%` },
            };
        }
        const { count, rows: seats } = await Seat.findAndCountAll({
            attributes: { exclude: ['createdAt', 'updatedAt'] },
            where: whereClause,
            offset,
            limit: limitData,
        });
        seats.sort((a, b) => {
            if (a.row !== b.row) {
                return a.row - b.row;
            }
            return a.seat_number.localeCompare(b.seat_number);
        });
        seats.forEach(seat => {
            seat.is_available = seat.is_available === true ? 'A' : 'U';
        });
        const totalPages = Math.ceil(count / limitData);

        res.status(200).json({
            is_success: true,
            code: 200,
            data: {
                seats,
                pagination: {
                    totalData: count,
                    totalPages,
                    pageNum,
                    limitData,
                }
            },
        });
    } catch (err) {
        console.log(err);
        next(new ApiError(err.message, 400));
    }
};

const getSeatById = async (req, res, next) => {
    try {
        const seat = await Seat.findByPk(req.params.id);

        //if seat doesnt exist
        if (!seat) {
            return next(new ApiError(`Seat with ID: ${req.params.id} not found`, 404));
        }

        res.status(200).json({
            is_success: true,
            code: 200,
            data: {
                seat,
            },
        });
    } catch (err) {
        next(new ApiError(err.message, 400));
    }
};

const updateSeat = async (req, res, next) => {
    const {
        seat_class,
        seat_number,
        is_available,
        flight_id
    } = req.body;

    try {
        const seat = await Seat.findByPk(req.params.id);

        //validate if seat not found
        if (!seat) {
            return next(new ApiError(`Seat with ID ${req.params.id} not found`, 404));
        }

        //validate if class invalid name
        const validSeatClasses = ["economy", "premium economy", "business", "first class"];
        if (!validSeatClasses.includes(seat_class)) {
            return next(new ApiError(`Invalid seat class.`, 400));
        }

        //validate if flight not found
        const flight = await Flight.findByPk(flight_id);

        if (!flight) {
            return next(new ApiError("Flight not found", 404));
        }

        // Validate if the seat_class is valid for the given flight_id
        const price = await Price.findOne({
            where: {
                flight_id: flight_id,
                seat_class: seat_class
            }
        });

        if (!price) {
            return next(new ApiError(`Seat class ${seat_class} is not valid for flight ID ${flight_id}`, 400));
        }

        await Seat.update(
            {
                seat_class,
                seat_number,
                is_available,
                flight_id
            },
            {
                where: {
                    seat_id: req.params.id,
                },
            }
        );
        // Retrieve the updated seat data
        const updatedSeat = await Seat.findByPk(req.params.id);

        res.status(200).json({
            is_success: true,
            code: 200,
            data: updatedSeat,
            message: "Seat updated successfully",
        });
    } catch (err) {
        next(new ApiError(err.message, 400));
    }
};

const deleteSeat = async (req, res, next) => {
    try {
        const seat = await Seat.findByPk(req.params.id);

        if (!seat) {
            next(new ApiError(`Seat with ID ${req.params.id} not found`, 404));
        }

        await Seat.destroy({
            where: {
                seat_id: req.params.id,
            },
        });

        res.status(200).json({
            is_success: true,
            code: 200,
            data: null,
            message: "Successfully deleted seat",
        });
    } catch (err) {
        next(new ApiError(err.message, 400));
    }
};

const createSeat = async (req, res, next) => {
    const {
        seat_class,
        seat_number,
        flight_id
    } = req.body;

    const seatId = uuid.v4();

    //validate if class invalid name
    const validSeatClasses = ["Economy", "Premium Economy", "Business", "First Class"];
    if (!validSeatClasses.includes(seat_class)) {
        return next(new ApiError(`Invalid seat class.`, 400));
    }

    //validate if flight not found
    const flight = await Flight.findByPk(flight_id);
    if (!flight) {
        return next(new ApiError("Flight not found", 404));
    }

    // Validate if the seat_class is valid for the given flight_id
    const price = await Price.findOne({
        where: {
            flight_id: flight_id,
            seat_class: seat_class
        }
    });

    if (!price) {
        return next(new ApiError(`Seat class ${seat_class} is not valid for flight ID ${flight_id}`, 400));
    }


    // Check if a seat with the same combination already exists
    const existingSeat = await Seat.findOne({
        where: {
            seat_class,
            seat_number,
            flight_id
        }
    });

    if (existingSeat && existingSeat.seat_id !== req.params.id) {
        return next(new ApiError(`A seat with the same class, number and flight already exists`, 409));
    }




    try {
        const newSeat = await Seat.create({
            seat_id: seatId,
            seat_class,
            seat_number,
            is_available: true,
            flight_id
        });


        res.status(201).json({
            is_success: true,
            code: 200,
            data: {
                newSeat,
            },
        });
    } catch (error) {
        next(new ApiError(error.message, 500));
    }
};


module.exports = {
    getAllSeats,
    getSeatById,
    updateSeat,
    deleteSeat,
    createSeat,
};
