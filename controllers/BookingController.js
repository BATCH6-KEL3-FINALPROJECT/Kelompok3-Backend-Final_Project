const apiError = require("../utils/apiError");
const { v4: uuidv4 } = require('uuid');
require("dotenv").config();
const { Flight, Price, Booking, payment, Seat, Ticket, Passenger, sequelize } = require('../models');
const midtransClient = require('midtrans-client');
const { UUIDV4 } = require("sequelize");
const { object } = require("joi");
const { Sequelize, QueryTypes } = require('sequelize');
const ticket = require("../models/ticket");

let snap = new midtransClient.Snap({
    // Set to true if you want Production Environment (accept real transaction).
    isProduction: false,
    serverKey: process.env.MIDTRANS_SERVER_KEY
});
const createTransactions = async (req, res, next) => {
    try {
        const { totalAmount, flightName, noOfItems } = req.body

        console.log("Masuk create")
        const paymentId = uuidv4();

        const bayar = await payment.create({
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
const createTransactionsWithFlight = async (req, res, next) => {
    let transaction = await sequelize.transaction();
    try {
        const { totalAmount, flightId, passengerId, noOfPassenger, departureSeats } = req.body
        const { user_id, name, email, phone_number } = req.user
        const paymentId = uuidv4();
        const seatIds = Object.values(departureSeats);
        const seatData = await Seat.findOne({ where: { seat_id: seatIds[0] } })
        const seatPrice = await Price.findOne({ where: { flight_id: seatData.flight_id, seat_class: seatData.seat_class } })
        const totalPrice = noOfPassenger * seatPrice.price;

        if (noOfPassenger !== Object.keys(passengerId).length) {
            return next(new apiError("Jumlah passenger dengan Data Passenger tidak sama", 400));
        }
        // console.log(seatIds[1])
        let passengerData = await Promise.all(
            Object.keys(passengerId).map(async (key, i) => {
                try {
                    const data = await Passenger.findOne({ where: { passenger_id: passengerId[key] } });
                    const seat = await Seat.findOne({ where: { seat_id: seatIds[i] } }); // Adjust this query according to your schema
                    return {
                        passenger: data ? data.dataValues : null,
                        seat: seat ? seat.dataValues : null
                    };
                } catch (error) {
                    console.error(`Error fetching data for passenger ${key}: ${error.message}`);
                    return null; // or handle the error as needed
                }
            })
        );

        // if (totalAmount !== noOfPassenger * seatPrice.price) {
        //     return next(new apiError("Total Harga dengan harga Kursi tidak cocok", 400));
        // }
        console.log("Price", Object.keys(passengerId).length)

        const paymentResult = await createPayment(transaction, paymentId, user_id, totalPrice);

        const bookingResult = await createBooking(transaction, user_id, paymentId, flightId, totalPrice, noOfPassenger);
        let terminal = "Terminal 2 cicaheum"

        for (let i = 0; i < seatIds.length; i++) {
            const ticketData = await createTicket(flightId, seatIds[i], passengerData[i].passenger.passenger_id, bookingResult.booking_id, passengerData[i].seat.seat_number, passengerData[i].first_name, terminal, transaction)
        }

        let parameter = {
            "transaction_details": {
                "order_id": paymentId,
                "gross_amount": seatPrice.price * noOfPassenger
            },
            "credit_card": {
                "secure": true
            },
            "customer_details": {
                "first_name": name,
                "email": email,
                "phone": phone_number
            }
        };

        let transactionToken
        snap.createTransaction(parameter)
            .then((transaction) => {
                // transaction token
                transactionToken = transaction.token;
                console.log('transactionToken:', transactionToken);
                const redirectUrl = transaction.redirect_url;
                res.status(200).json({
                    is_success: true,
                    code: 201,
                    data: {
                        paymentResult,
                        token: transactionToken,
                        url: redirectUrl,

                    },
                    message: 'Create payment success'
                })
            })
        await transaction.commit();
        // res.status(201).json({
        //     is_success: true,
        //     code: 201,
        //     data: {
        //     },
        //     message: 'Create payment success'
        // })

    } catch (error) {
        if (transaction) await transaction.rollback(); // Rollback transaction if any step fails
        console.error(error);
        // console.log(error)
        next(new apiError(error.message, 400));
    }
}



async function createPayment(transaction, paymentId, user_id, totalPrice) {
    return await payment.create({
        payment_id: paymentId,
        user_id: user_id,
        total_amount: totalPrice,
        payment_method: 'gopay',
        payment_date: Date.now(),
        payment_status: 'pending',
    }, { transaction });
}

async function createBooking(transaction, user_id, paymentId, flightId, totalPrice, noOfPassenger) {
    return await Booking.create({
        booking_id: uuidv4(),
        user_id: user_id,
        flight_id: flightId,
        payment_id: paymentId,
        total_price: totalPrice,
        booking_date: Date.now(),
        is_round_trip: false,
        no_of_ticket: noOfPassenger,
        status: 'pending'
    }, { transaction });
}

async function createTicket(flightId, seatId, passengerId, bookingId, seatNumber, passengerName, terminal, transaction) {
    console.log('createTicket');
    return await Ticket.create({
        ticket_id: uuidv4(),
        flight_id: flightId,
        seat_id: seatId,
        passenger_id: passengerId,
        booking_id: bookingId,
        seat_number: seatNumber,
        passsenger_name: passengerName,
        TERMINAL: terminal,
        ticket_status: 'pending'
    }, { transaction })
}
module.exports = {
    createTransactions,
    createTransactionsWithFlight
}