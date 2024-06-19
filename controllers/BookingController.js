const apiError = require("../utils/apiError");
const { v4: uuidv4 } = require('uuid');
require("dotenv").config();
const { Flight, User, Price, Booking, Payment, Seat, Ticket, Passenger, Airport, sequelize } = require('../models');
const midtransClient = require('midtrans-client');
const { UUIDV4 } = require("sequelize");
const { object } = require("joi");
const { Sequelize, QueryTypes } = require('sequelize');
const ticket = require("../models/ticket");
const { Op } = require('sequelize');

let snap = new midtransClient.Snap({
    // Set to true if you want Production Environment (accept real transaction).
    isProduction: false,
    serverKey: process.env.MIDTRANS_SERVER_KEY
});
const createTransactions = async (req, res, next) => {
    try {
        const { totalAmount, flightName, noOfItems } = req.body

        const paymentId = uuidv4();

        const bayar = await Payment.create({
            payment_id: paymentId,
            total_amount: totalAmount * noOfItems,
            payment_method: 'gopay',
            payment_date: Date.now(),
            payment_status: 'pending',
        })
        let parameter = {
            "transaction_details": {
                "order_id": paymentId,
                "gross_amount": totalAmount * noOfItems
            },
            "credit_card": {
                "secure": true
            },
            "customer_details": {
                "first_name": "budi",
                "last_name": "pratama",
                "email": "budi.pra@example.com",
                "phone": "08111222333"
            }
        };

        let transactionToken
        snap.createTransaction(parameter)
            .then((transaction) => {
                // transaction token
                transactionToken = transaction.token;
                console.log('transactionToken:', transactionToken);
                const redirectUrl = transaction.redirect_url;
                console.log('redirectUrl:', redirectUrl);
                res.status(200).json({
                    is_success: true,
                    code: 201,
                    data: {
                        bayar,
                        token: transactionToken,
                        url: redirectUrl,

                    },
                    message: 'Create payment success'
                })
            })

    } catch (error) {
        console.log(error);
        next(new apiError(error.message, 400));
    }
}

const getAllBookings = async (req, res, next) => {
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


const getUserBooking = async (req, res, next) => {
    try {
        const { user_id } = req.user;
        console.log('masuk user')

        const bookings = await Booking.findAll({
            attributes: { exclude: ['createdAt', 'updatedAt'] },
            where: { user_id: user_id },
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
        console.log(bookings);
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
        const booking = await Booking.findByPk(req.params.id);

        //if booking doesnt exist
        if (!booking) {
            return next(new apiError(`Booking with ID: ${req.params.id} not found`, 404));
        }

        res.status(200).json({
            is_success: true,
            code: 200,
            data: {
                booking,
            },
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
    getAllBookings,
    getBookingById,
    deleteBooking,
    createBooking,
    updateBooking,
    getUserBooking
}



