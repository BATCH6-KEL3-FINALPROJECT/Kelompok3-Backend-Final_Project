const apiError = require("../utils/apiError");
const { v4: uuidv4 } = require('uuid');
require("dotenv").config();
const { Flight, Price, Booking, payment, Seat, Ticket, Passenger, sequelize } = require('../models');
const midtransClient = require('midtrans-client');
const { UUIDV4 } = require("sequelize");
const { object } = require("joi");
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
        const { totalAmount, departureFlightId, returnFlightId, passengerId, noOfPassenger, departureSeats, returnSeats } = req.body
        const { user_id, name, email, phone_number } = req.user

        const paymentId = uuidv4();
        const seatIdsDeparture = Object.values(departureSeats);
        const seatIdsReturn = returnSeats ? Object.values(returnSeats) : null;
        const departureSeatData = await Seat.findOne({ where: { seat_id: seatIdsDeparture[0] } })
        if (!departureSeatData) return next(new apiError("Seat yang dipilih tidak ada", 400));
        const departureSeatPrice = await Price.findOne({ where: { flight_id: departureSeatData.flight_id, seat_class: departureSeatData.seat_class } })
        let totalPrice = (noOfPassenger * departureSeatPrice.price);
        let returnSeatData, returnSeatPrice, returnBookingResult;
        let isRoundTrip = false;

        let checkSeatStatus = await checkSeatAvailability(seatIdsDeparture)

        if (seatIdsReturn) {
            checkSeatStatus = checkSeatStatus.concat(await checkSeatAvailability(seatIdsReturn));
            returnSeatData = await Seat.findOne({ where: { seat_id: seatIdsReturn[0] } })
            returnSeatPrice = await Price.findOne({ where: { flight_id: returnSeatData.flight_id, seat_class: returnSeatData.seat_class } });
            totalPrice += noOfPassenger * returnSeatPrice.price;
            isRoundTrip = true
        }
        console.log("Seat Status", checkSeatStatus)
        if (checkSeatStatus.some(status => status === false)) {
            return next(new apiError("Seat yang dipilih tidak tersedia", 400));
        }
        if (seatIdsDeparture[0] === seatIdsDeparture[1] || (seatIdsReturn && seatIdsReturn[0] === seatIdsReturn[1])) {
            return next(new apiError("Seat yang dipilih tidak bisa sama", 400));
        }
        if (noOfPassenger !== Object.keys(passengerId).length || noOfPassenger !== Object.keys(departureSeats).length || (returnSeats && noOfPassenger !== Object.keys(returnSeats).length)) {
            return next(new apiError("Jumlah Passenger dengan Data yang dikirim tidak sama", 400));
        }
        if (departureFlightId !== departureSeatData.flight_id || (seatIdsReturn && returnFlightId !== returnSeatData.flight_id)) {
            return next(new apiError("Flight Data dengan Data Seats yang dikirim tidak cocok", 400));
        }

        // if (totalAmount !== totalPrice) {
        //     return next(new apiError("Total Harga dengan harga Kursi tidak cocok", 400));
        // }
        let passengerData = await getPassengerData(passengerId, seatIdsDeparture, seatIdsReturn)
        const paymentResult = await createPayment(transaction, paymentId, user_id, totalPrice);
        const bookingResult = await createBooking(transaction, user_id, paymentId, departureFlightId, totalPrice, noOfPassenger, isRoundTrip);
        const updatedFlight = await updateFlightCapacity(departureFlightId, noOfPassenger, transaction)
        const updatedSeats = await updateSeatsAvailability(seatIdsDeparture, transaction)

        let terminal = "Terminal 2 cicaheum"
        for (let i = 0; i < seatIdsDeparture.length; i++) {
            const ticketData = await createTicket(departureFlightId, seatIdsDeparture[i], passengerData[i].passenger.passenger_id, bookingResult.booking_id, passengerData[i].departureSeat.seat_number, passengerData[i].first_name, terminal, transaction)
        }
        if (returnSeatData) {
            returnBookingResult = await createBooking(transaction, user_id, paymentId, returnFlightId, totalPrice, noOfPassenger, isRoundTrip);
            const updatedFlightReturn = await updateFlightCapacity(returnFlightId, noOfPassenger, transaction)
            const updateSeatsReturn = await updateSeatsAvailability(seatIdsReturn, transaction)
            for (let i = 0; i < seatIdsReturn.length; i++) {
                const ticketData = await createTicket(returnFlightId, seatIdsReturn[i], passengerData[i].passenger.passenger_id, returnBookingResult.booking_id, passengerData[i].returnSeat.seat_number, passengerData[i].first_name, terminal, transaction)
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
                "first_name": name,
                "email": email,
                "phone": phone_number
            }
        };
        let transactionToken
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

        await transaction.commit();
        res.status(201).json({
            is_success: true,
            code: 201,
            data: bookingResult, returnBookingResult,
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
    const seatsStatus = []
    for (let i = 0; i < seatsId.length; i++) {
        const SeatData = await Seat.findOne({ where: { seat_id: seatsId[i] } })
        if (SeatData) {
            seatsStatus.push(SeatData.is_available);
        } else {
            seatsStatus.push(false); // or any default value you want to use
        }
    }
    return seatsStatus;
}
async function getPassengerData(passengerId, seatIdsDeparture, seatIdsReturn) {
    const passengerData = await Promise.all(
        Object.keys(passengerId).map(async (key, i) => {
            try {
                const data = await Passenger.findOne({ where: { passenger_id: passengerId[key] } });
                const departureSeat = await Seat.findOne({ where: { seat_id: seatIdsDeparture[i] } });
                let returnSeat = null; // Initialize returnSeat to null
                if (seatIdsReturn && seatIdsReturn[i]) { // Check if seatIdsReturn is not null and has enough elements
                    returnSeat = await Seat.findOne({ where: { seat_id: seatIdsReturn[i] } });
                } return {
                    passenger: data ? data.dataValues : null,
                    departureSeat: departureSeat ? departureSeat.dataValues : null,
                    returnSeat: returnSeat ? returnSeat.dataValues : null
                };
            } catch (error) {
                console.error(`Error fetching data for passenger ${key}: ${error.message}`);
                return null; // or handle the error as needed
            }
        })
    );

    return passengerData;
}
async function updateFlightCapacity(flightId, totalPassenger, transaction) {
    try {
        const [numOfAffectedRows, updatedFlight] = await Flight.update(
            { seats_available: sequelize.literal(`seats_available - ${totalPassenger}`) },
            { where: { flight_id: flightId } }, { transaction }
        );

        if (numOfAffectedRows > 0) {
            console.log(`Flight with ID ${flightId} updated successfully.`);
        } else {
            console.log(`Flight with ID ${flightId} not found or no changes were made.`);
        }
        return updatedFlight;
    } catch (error) {
        console.error(`Error updating flight: ${error.message}`);
        throw error; // Re-throw the error to be handled by the caller
    }
}

async function updateSeatsAvailability(seatsId, transaction) {
    try {
        for (let k = 0; k < seatsId.length; k++) {
            const [numOfAffectedRows, updatedSeats] = await Seat.update(
                { is_available: false, },
                { where: { seat_id: seatsId[k] } }, transaction
            )
        }
    } catch (error) {
        console.error(`Error updating flight: ${error.message}`);
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

async function createTicket(flightId, seatId, passengerId, bookingId, seatNumber, passengerName, terminal, transaction) {
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
        TERMINAL: terminal,
        ticket_status: 'pending'
    }, { transaction })
}
module.exports = {
    createTransactions,
    createTransactionsWithFlight
}