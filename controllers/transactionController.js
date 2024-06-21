const apiError = require("../utils/apiError");
const { v4: uuidv4 } = require('uuid');
require("dotenv").config();
const { Flight, Price, Booking, payment, Seat, Ticket, Passenger, Airline, sequelize } = require('../models');
const midtransClient = require('midtrans-client');
const { UUIDV4 } = require("sequelize");
const { object, bool } = require("joi");
const { Sequelize, QueryTypes } = require('sequelize');
const ticket = require("../models/ticket");
const generateCode = require("../utils/generateTicketCode");
const { updateSeat } = require("./SeatController");

let snap = new midtransClient.Snap({
    // Set to true if you want Production Environment (accept real transaction).
    isProduction: false,
    serverKey: process.env.MIDTRANS_SERVER_KEY
});
const createTransactions = async (req, res, next) => {
    try {
        const { totalAmount, flightName, noOfItems } = req.body
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
                const redirectUrl = transaction.redirect_url;
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
        const { fullName, familyName, phoneNumber, email, totalAmount, departureFlightId, returnFlightId, noOfPassenger, departureSeats, returnSeats } = req.body
        const { user_id } = req.user
        const { passengersData } = req.body

        let passengersId = [];
        let seatIdsDeparture = []
        let seatIdsReturn = [];

        const passengers = await Promise.all(passengersData.map(async passengerData => {
            const passengerId = uuidv4();
            const userId = user_id;

            let newPassengerData = { ...passengerData, passenger_id: passengerId }
            newPassengerData = { ...newPassengerData, user_id: userId }
            const passenger = await Passenger.create(newPassengerData);
            if (passengerData.returnSeats !== "" || passengerData.returnSeats) {
                seatIdsReturn.push(passengerData.returnSeats)
            } else {
                seatIdsReturn = null;
            }
            passengersId.push(passengerId)
            seatIdsDeparture.push(passengerData.departureSeats)
        }));

        const paymentId = uuidv4();
        const departureSeatData = await Seat.findOne({ where: { seat_id: seatIdsDeparture[0] } })
        if (!departureSeatData) return next(new apiError("Seat yang dipilih tidak ada", 400));
        const departureSeatPrice = await Price.findOne({ where: { flight_id: departureSeatData.flight_id, seat_class: departureSeatData.seat_class } })
        let totalPrice = (noOfPassenger * departureSeatPrice.price);
        let returnSeatData, returnSeatPrice, returnBookingResult;
        let isRoundTrip = false;
        const allSeatIds = [...seatIdsDeparture];

        let checkSeatStatus = await checkSeatAvailability(seatIdsDeparture)

        console.log("Checking availability seats", seatIdsDeparture, seatIdsReturn)
        if (seatIdsReturn !== null && seatIdsReturn.length !== 0) {
            checkSeatStatus = checkSeatStatus.concat(await checkSeatAvailability(seatIdsReturn));
            returnSeatData = await Seat.findOne({ where: { seat_id: seatIdsReturn[0] } })
            returnSeatPrice = await Price.findOne({ where: { flight_id: returnSeatData.flight_id, seat_class: returnSeatData.seat_class } });
            totalPrice += noOfPassenger * returnSeatPrice.price;
            isRoundTrip = true
            allSeatIds.push(...seatIdsReturn)
        }
        const seatsIdSet = new Set(allSeatIds);
        if (checkSeatStatus.some(status => status === false)) {
            return next(new apiError("Seat yang dipilih tidak tersedia", 400));
        }
        if (allSeatIds.length !== seatsIdSet.size) {
            return next(new apiError("Seat yang dipilih tidak bisa sama", 400));
        }
        if (noOfPassenger !== seatIdsDeparture.length || seatIdsReturn && noOfPassenger !== seatIdsReturn.length) {
            return next(new apiError("Jumlah Passenger dengan Data yang dikirim tidak sama", 400));
        }
        if (departureFlightId !== departureSeatData.flight_id) {
            return next(new apiError("Flight Data dengan Data Seats yang dikirim tidak cocok", 400));
        }

        // if (totalAmount !== totalPrice) {
        //     return next(new apiError("Total Harga dengan harga Kursi tidak cocok", 400));
        // }
        let passengerData = await getPassengerData(passengersId, seatIdsDeparture, seatIdsReturn)
        const paymentResult = await createPayment(transaction, paymentId, user_id, totalPrice);
        const bookingResult = await createBooking(transaction, user_id, paymentId, departureFlightId, totalPrice, noOfPassenger, isRoundTrip);
        const updatedFlight = await updateFlightCapacity(departureFlightId, noOfPassenger, transaction)
        const updatedSeats = await updateSeatsAvailability(seatIdsDeparture, transaction)

        let terminal = JSON.stringify(updatedFlight.terminal);
        for (let i = 0; i < seatIdsDeparture.length; i++) {
            const ticketData = await createTicket(departureFlightId, seatIdsDeparture[i], passengerData[i].passenger.passenger_id, bookingResult.booking_id, passengerData[i].departureSeat.seat_number, passengerData[i].first_name, terminal, req.body.buyerData, passengersData[i].passenger_type, transaction)
        }
        if (returnSeatData) {
            returnBookingResult = await createBooking(transaction, user_id, paymentId, returnFlightId, totalPrice, noOfPassenger, isRoundTrip);
            const updatedFlightReturn = await updateFlightCapacity(returnFlightId, noOfPassenger, transaction)
            const updateSeatsReturn = await updateSeatsAvailability(seatIdsReturn, transaction)
            for (let i = 0; i < seatIdsReturn.length; i++) {
                const ticketData = await createTicket(returnFlightId, seatIdsReturn[i], passengerData[i].passenger.passenger_id, returnBookingResult.booking_id, passengerData[i].returnSeat.seat_number, passengerData[i].first_name, terminal, req.body.buyerData, passengersData[i].passenger_type, transaction)
            }
        }

        let parameter = {
            "transaction_details": {
                "order_id": paymentId,
                "gross_amount": totalPrice
            },
            "credit_card": {
                "secure": true
            },
            "customer_details": {
                "first_name": fullName,
                "email": email,
                // "phone": phone_number
            }
        };
        await transaction.commit();
        // let transactionToken
        // snap.createTransaction(parameter)
        //     .then((transaction) => {
        //         // transaction token
        //         transactionToken = transaction.token;
        //         console.log('transactionToken:', transactionToken);
        //         const redirectUrl = transaction.redirect_url;
        //         res.status(200).json({
        //             is_success: true,
        //             code: 201,
        //             data: {
        //                 paymentResult,
        //                 token: transactionToken,
        //                 url: redirectUrl,

        //             },
        //             message: 'Create payment success'
        //         })
        //     })

        res.status(201).json({
            is_success: true,
            code: 201,
            data: { bookingResult, returnBookingResult },
            message: 'Create payment success'
        })

    } catch (error) {
        if (transaction) await transaction.rollback(); // Rollback transaction if any step fails
        console.error(error);
        // console.log(error)
        next(new apiError(error.message, 400));
    }
}

async function checkSeatAvailability(seatsId) {
    try {
        const seatsStatus = await Promise.all(seatsId.map(async (seatId) => {
            const SeatData = await Seat.findOne({ where: { seat_id: seatId } });
            return SeatData ? SeatData.is_available : false;
        }));
        return seatsStatus;
    } catch (error) {
        throw error;
    }
}

async function getPassengerData(passengerId, seatIdsDeparture, seatIdsReturn) {
    try {
        const passengerData = await Promise.all(passengerId.map(async (id, i) => {
            const passenger = await Passenger.findOne({ where: { passenger_id: id } });
            const departureSeat = await Seat.findOne({ where: { seat_id: seatIdsDeparture[i] } });
            let returnSeat = null;
            if (seatIdsReturn && seatIdsReturn[i]) {
                returnSeat = await Seat.findOne({ where: { seat_id: seatIdsReturn[i] } });
            }
            return {
                passenger: passenger ? passenger.dataValues : null,
                departureSeat: departureSeat ? departureSeat.dataValues : null,
                returnSeat: returnSeat ? returnSeat.dataValues : null
            };
        }));
        return passengerData;
    } catch (error) {
        throw error;
    }
}

async function updateFlightCapacity(flightId, totalPassenger, transaction) {
    try {
        const [numOfAffectedRows] = await Flight.update(
            { seats_available: sequelize.literal(`seats_available - ${totalPassenger}`) },
            { where: { flight_id: flightId }, transaction }
        );
        if (numOfAffectedRows > 0) {
            console.log(`Flight with ID ${numOfAffectedRows} updated successfully.`);
        } else {
            console.log(`Flight with ID ${flightId} not found or no changes were made.`);
        }
        const updatedFlight = await Flight.findOne({ where: { flight_id: flightId }, transaction });
        return updatedFlight;
    } catch (error) {
        throw error;
    }
}

async function updateSeatsAvailability(seatsId, transaction) {
    try {
        await Promise.all(seatsId.map(async (seatId) => {
            await Seat.update(
                { is_available: false },
                { where: { seat_id: seatId }, transaction }
            );
        }));
    } catch (error) {
        throw error;
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

async function createBooking(transaction, user_id, paymentId, flightId, totalPrice, noOfPassenger, isRoundTrip) {
    const paymentIdPrefix = paymentId.substring(0, 3); // Get the first 3 letters of the paymentId
    return await Booking.create({
        booking_id: uuidv4(),
        booking_code: `${paymentIdPrefix}-${Date.now()}`,
        user_id: user_id,
        flight_id: flightId,
        payment_id: paymentId,
        total_price: totalPrice,
        booking_date: Date.now(),
        is_round_trip: isRoundTrip,
        no_of_ticket: noOfPassenger,
        status: 'pending'
    }, { transaction });
}

async function createTicket(flightId, seatId, passengerId, bookingId, seatNumber, passengerName, terminal, buyerData, passengerType, transaction) {
    const airline = await Flight.findOne({ where: { flight_id: flightId } })
    const ticketCode = await generateCode(airline.airline_id)
    return await Ticket.create({
        ticket_id: uuidv4(),
        ticket_code: ticketCode,
        flight_id: flightId,
        seat_id: seatId,
        passenger_id: passengerId,
        booking_id: bookingId,
        seat_number: seatNumber,
        passsenger_name: passengerName,
        passenger_type: passengerType,
        TERMINAL: terminal,
        ticket_buyer: buyerData,
        ticket_status: 'pending'
    }, { transaction })
}

const getBookingData = async (req, res, next) => {
    try {
        const paymentId = req.params.id;

        let bookingData = await Booking.findAll({ where: { payment_id: paymentId } })


        let totalPriceSum = 0;
        let flightData = []

        let newBooking = bookingData
        for (let i = 0; i < bookingData.length; i++) {
            totalPriceSum += parseInt(bookingData[i].total_price);

            // Fetch flight data for each booking asynchronously
            newBooking[i].adult = "100"; // Or assign it based on some condition or calculation
            const flight = await Flight.findOne({
                where: { flight_id: bookingData[i].flight_id },
                include: {
                    model: Airline, // Assuming Airline is the name of your model for airlines
                    attributes: { exclude: ['createdAt', 'updatedAt'] }, // Exclude createdAt and updatedAt fields
                }
            });
            flightData.push(flight);
        }
        console.log("Data booking:", newBooking)
        res.status(200).json({
            is_success: true,
            code: 201,
            data: {
                newBooking,
                flightData,
                totalPrice: totalPriceSum
            },
            message: 'Create payment success'
        })
        let parameter = {
            "transaction_details": {
                "order_id": paymentId,
                "gross_amount": totalPriceSum
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
        // snap.createTransaction(parameter)
        //     .then((transaction) => {
        //         // transaction token
        //         transactionToken = transaction.token;
        //         const redirectUrl = transaction.redirect_url;
        //         res.status(200).json({
        //             is_success: true,
        //             code: 201,
        //             data: {
        //                 bayar,
        //                 token: transactionToken,
        //                 url: redirectUrl,

        //             },
        //             message: 'Create payment success'
        //         })
        //     })

    } catch (err) {

    }

}

module.exports = {
    createTransactions,
    createTransactionsWithFlight,
    getBookingData
}