const apiError = require("../utils/apiError");
const { v4: uuidv4 } = require('uuid');
require("dotenv").config();
const { Flight, User, Price, Booking, Payment, Seat, Ticket, Passenger, Airport, Airline, sequelize } = require('../models');
const midtransClient = require('midtrans-client');
const { UUIDV4, where } = require("sequelize");
const { object } = require("joi");
const { Sequelize, QueryTypes } = require('sequelize');
const ticket = require("../models/ticket");
const { Op } = require('sequelize');

let snap = new midtransClient.Snap({
    // Set to true if you want Production Environment (accept real transaction).
    isProduction: false,
    serverKey: process.env.MIDTRANS_SERVER_KEY
});
const getBookings = async (req, res, next) => {
    try {
        const {
            booking_code,
            user_id,
            flight_id,
            payment_id,
            booking_date,
            is_round_trip,
            no_of_ticket,
            status,
            total_price,
            page,
            limit,
            search,
        } = req.query;

        const pageNum = parseInt(page) || 1;
        const limitData = parseInt(limit) || 10;
        const offset = (pageNum - 1) * limitData;

        const whereClause = {};
        if (booking_code) whereClause.booking_code = booking_code;
        if (user_id) whereClause.user_id = user_id;
        if (payment_id) whereClause.payment_id = payment_id;
        if (flight_id) whereClause.flight_id = flight_id;
        if (booking_date) whereClause.booking_date = booking_date;
        if (typeof is_round_trip !== 'undefined') whereClause.is_round_trip = is_round_trip === 'true';
        if (no_of_ticket) whereClause.no_of_ticket = no_of_ticket;
        if (status) whereClause.status = status
        if (total_price) whereClause.total_price = { [Op.iLike]: `%${total_price}%` };

        if (search) {
            whereClause[Op.or] = [
                { booking_code: { [Op.like]: `%${search}%` } },
                { user_id: { [Op.like]: `%${search}%` } },
                { flight_id: { [Op.like]: `%${search}%` } },
                { payment_id: { [Op.like]: `%${search}%` } },
                { no_of_ticket: { [Op.like]: `%${search}%` } },
                { is_round_trip: { [Op.like]: `%${search}%` } },
                { status: { [Op.like]: `%${search}%` } },
                { total_price: { [Op.like]: `%${search}%` } }
            ];
        }

        const { count, rows: bookings } = await Booking.findAndCountAll({
            attributes: { exclude: ['createdAt', 'updatedAt'] },
            where: whereClause,
            offset,
            limit: limitData,
        });

        const totalPages = Math.ceil(count / limitData);

        res.status(200).json({
            is_success: true,
            code: 200,
            data: {
                bookings,
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
        next(new apiError(err.message, 400));
    }
};
const getAllBooking = async (req, res, next) => {
    try {
        const { search, page, limit } = req.query;

        const whereClause = {};
        if (search) {
            whereClause[Op.or] = {
                booking_code: { [Op.iLike]: `%${search}%` }
            }
        }
        const bookings = await Booking.findAll({
            attributes: { exclude: ['createdAt', 'updatedAt'] },
            where: whereClause,
            include: [{
                model: Flight,
                attributes: { exclude: ['flight_code', 'airline_id', 'flight_description', 'plane_type', 'seats_available', 'is_promo', 'is_available', 'createdAt', 'updatedAt'] },
                include: [{
                    model: Airport,
                    as: 'departingAirport', // Alias defined in Flight model association
                    attributes: ['city'] // Specify the attributes you want to include from Airport model
                }, {
                    model: Airport,
                    as: 'arrivingAirport', // Alias defined in Flight model association
                    attributes: ['city'] // Specify the attributes you want to include from Airport model
                }]
            },
            {
                model: Ticket,
                attributes: ['seat_number'],
                include: [{
                    model: Seat,
                    attributes: ['seat_class']
                }]
            }]
        });

        res.status(200).json({
            is_success: true,
            code: 200,
            bookings,
            message: 'get All Bookings success'
        });
    } catch (err) {
        next(new ApiError(err.message, 400));
    }
};
const getUserBooking = async (req, res, next) => {
    try {
        const { user_id } = req.user;
        const { search, page, limit } = req.query;

        const whereClause = {};
        if (search) {
            whereClause[Op.or] = {
                booking_code: { [Op.iLike]: `%${search}` }
            }
        }
        whereClause.user_id = user_id;
        let bookingData = await Booking.findAll({
            attributes: { exclude: ['createdAt', 'updatedAt'] },
            where: whereClause,
            include: [{
                model: Flight,
                attributes: { exclude: ['airline_id', 'plane_type', 'seats_available', 'is_promo', 'is_available', 'updatedAt'] },
                include: [{
                    model: Airport,
                    as: 'departingAirport', // Alias defined in Flight model association
                    attributes: ['city'] // Specify the attributes you want to include from Airport model
                }, {
                    model: Airport,
                    as: 'arrivingAirport', // Alias defined in Flight model association
                    attributes: ['city'] // Specify the attributes you want to include from Airport model
                },
                {
                    model: Airline,
                }]
            },
            {
                model: Ticket,
                attributes: ['seat_number'],
                include: [{
                    model: Seat,
                    attributes: ['seat_class']
                },
                {
                    model: Passenger,
                    attributes: ['first_name', 'last_name', 'passenger_id', 'passenger_type']
                }]
            }]
        });
        if (!bookingData || bookingData.length === 0) return next(new apiError("Data booking not found", 404));
        let bookings = bookingData.map(book => ({ ...book.dataValues }));

        for (let i = 0; i < bookings.length; i++) {
            let seatClass, totalAdult = 0, totalChild = 0, totalBaby = 0
            let tickets = bookings[i].Tickets;
            for (let j = 0; j < tickets.length; j++) {
                seatClass = tickets[j].Seat.seat_class;
                let passengerType = tickets[j].Passenger.passenger_type
                const price = await Price.findOne({ where: { flight_id: bookings[i].flight_id, seat_class: seatClass } })
                if (passengerType === 'adult') {
                    bookings[i].adultPrice = price.price;
                    totalAdult++
                } else if (passengerType === 'child') {
                    bookings[i].childPrice = price.price_for_child;
                    totalChild++
                } else if (passengerType === 'baby') {
                    bookings[i].babyPrice = price.price_for_infant;
                    totalBaby++
                }
                bookings[i].totalAdult = totalAdult
                bookings[i].totalChild = totalChild
                bookings[i].totalBaby = totalBaby
            }
        }
        res.status(200).json({
            is_success: true,
            code: 200,
            data: bookings,
            message: "data booking"
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }

}
const getBookingById = async (req, res, next) => {
    try {
        const { user_id } = req.user;
        const { id } = req.params;

        const bookingData = await Booking.findOne({
            attributes: { exclude: ['updatedAt'] },
            where: { booking_id: id },
            include: [{
                model: Flight,
                attributes: { exclude: ['airline_id', 'plane_type', 'seats_available', 'is_promo', 'is_available', 'createdAt', 'updatedAt'] },
                include: [{
                    model: Airport,
                    as: 'departingAirport',
                    attributes: ['city']
                }, {
                    model: Airport,
                    as: 'arrivingAirport',
                    attributes: ['city']
                }, {
                    model: Airline,
                }]
            },
            {
                model: Ticket,
                attributes: ['seat_number'],
                include: [{
                    model: Seat,
                    attributes: ['seat_class']
                }, {
                    model: Passenger,
                    attributes: ['first_name', 'last_name', 'passenger_id', 'passenger_type']
                }]
            }]
        });
        let totalAdult = 0, totalChild = 0, totalBaby = 0
        const priceData = await Price.findOne({ where: { flight_id: bookingData.flight_id, seat_class: bookingData.Tickets[0].Seat.seat_class } })
        let booking = {
            ...bookingData.dataValues
        }
        console.log("priceData", priceData)
        for (let i = 0; i < booking.Tickets.length; i++) {
            if (booking.Tickets[i].Passenger.passenger_type === 'adult') {
                booking.adultPrice = priceData.price
                totalAdult++
            } else if (booking.Tickets[i].Passenger.passenger_type === 'child') {
                booking.childPrice = priceData.price_for_child
                totalChild++
            } else if (booking.Tickets[i].Passenger.passenger_type === 'child') {
                booking.babyPrice = priceData.price_for_infant
                totalChild++
            }
        }
        booking.totalAdult = totalAdult
        booking.totalChild = totalChild
        booking.totalBaby = totalBaby
        //if booking doesnt exist
        if (!booking) {
            return next(new apiError(`Booking with ID: ${req.params.id} not found`, 404));
        }

        res.status(200).json({
            is_success: true,
            code: 200,
            data: booking,
        });
    } catch (err) {
        next(new apiError(err.message, 400));
    }
};

const deleteBooking = async (req, res, next) => {
    try {
        const booking = await Booking.findByPk(req.params.id);

        if (!booking) {
            next(new apiError(`Booking with ID ${req.params.id} not found`, 404));
        }

        await Booking.destroy({
            where: {
                booking_id: req.params.id,
            },
        });

        res.status(200).json({
            is_success: true,
            code: 200,
            data: null,
            message: "Successfully deleted booking",
        });
    } catch (err) {
        next(new apiError(err.message, 400));
    }
};

const createBooking = async (req, res, next) => {
    const {
        booking_code,
        user_id,
        flight_id,
        payment_id,
        booking_date,
        is_round_trip,
        no_of_ticket,
        total_price,
    } = req.body;

    const bookingId = uuid.v4();

    //validate if flight not found
    const flight = await Flight.findByPk(flight_id);
    if (!flight) {
        return next(new apiError("Flight not found", 404));
    }

    //validate if user not found
    const user = await User.findByPk(user_id);
    if (!user) {
        return next(new apiError("User not found", 404));
    }

    //validate if payment not found
    // const payment = await Payment.findByPk(payment_id);
    // if (!payment) {
    //     return next(new apiError("Payment not found", 404));
    // }

    try {
        const newBooking = await Booking.create({
            booking_id: bookingId,
            booking_code,
            user_id,
            flight_id,
            payment_id: null,
            booking_date,
            is_round_trip,
            no_of_ticket,
            status: "pending",
            total_price
        });


        res.status(201).json({
            is_success: true,
            code: 200,
            data: {
                newBooking
            },
        });
    } catch (error) {
        next(new apiError(error.message, 500));
    }
};

const updateBooking = async (req, res, next) => {
    const {
        booking_code,
        user_id,
        flight_id,
        payment_id,
        booking_date,
        is_round_trip,
        status,
        no_of_ticket,
        total_price,
    } = req.body;

    try {

        //validate if flight not found
        const flight = await Flight.findByPk(flight_id);
        if (!flight) {
            return next(new apiError("Flight not found", 404));
        }

        //validate if user not found
        const user = await User.findByPk(user_id);
        if (!user) {
            return next(new apiError("User not found", 404));
        }

        //validate if payment not found
        // const payment = await Payment.findByPk(payment_id);
        // if (!payment) {
        //     return next(new apiError("Payment not found", 404));
        // }


        await Booking.update(
            {
                booking_code,
                user_id,
                flight_id,
                payment_id: null,
                booking_date,
                is_round_trip,
                no_of_ticket,
                status,
                total_price
            },
            {
                where: {
                    booking_id: req.params.id,
                },
            }
        );

        const updatedBooking = await Booking.findByPk(req.params.id);

        res.status(200).json({
            is_success: true,
            code: 200,
            data: updatedBooking,
            message: 'Booking updated successfully'
        });
    } catch (err) {
        next(new apiError(err.message, 400));
    }
};
module.exports = {
    getAllBooking,
    getBookingById,
    deleteBooking,
    createBooking,
    updateBooking,
    getUserBooking
}



