const apiError = require("../utils/apiError");
const { v4: uuidv4 } = require('uuid');
require("dotenv").config();
const { Flight, Price, Booking, payment, Seat, Ticket, Passenger, Airline, Airport, Notification, sequelize } = require('../models');
const midtransClient = require('midtrans-client');
const { UUIDV4, where } = require("sequelize");
const { object, bool } = require("joi");
const ticket = require("../models/ticket");
const generateCode = require("../utils/generateTicketCode");

let snap = new midtransClient.Snap({
    // Set to true if you want Production Environment (accept real transaction).
    isProduction: false,
    serverKey: process.env.MIDTRANS_SERVER_KEY
});
const createTransakti = async (req, res, next) => {
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

        let transactionToken8
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
        const { totalAmount, departureFlightId, returnFlightId, noOfPassenger, } = req.body
        const { user_id } = req.user
        const { passengersData } = req.body

        let passengersId = [];
        let seatIdsDeparture = []
        let seatIdsReturn = [];

        const passengers = passengersData.map(passengerData => {
            const passengerId = uuidv4();
            const newPassengerData = { ...passengerData, passenger_id: passengerId, user_id: user_id };
            passengersId.push(passengerId);
            seatIdsDeparture.push(passengerData.departureSeats);
            if (passengerData.returnSeats) seatIdsReturn.push(passengerData.returnSeats);
            return newPassengerData;
        });

        await Passenger.bulkCreate(passengers, { transaction });
        const paymentId = uuidv4();
        // const departureSeatData = await Seat.findOne({ where: { seat_id: seatIdsDeparture[0] } })
        // if (!departureSeatData) return next(new apiError("Seat yang dipilih tidak ada", 400));
        let parts = passengersData[0].departureSeats.split('-');
        let seatClassDeparture = parts[5];
        let flightDepartureId = parts.slice(0, 3).join('-');
        if (departureFlightId !== departureFlightId) {
            return next(new apiError("Flight Data dengan Data Seats yang dikirim tidak cocok", 400));
        }
        const departureSeatPrice = await Price.findOne({ where: { flight_id: departureFlightId, seat_class: seatClassDeparture } })
        let totalPrice = 0

        let seatClassReturn, returnSeatPrice, returnBookingResult = {};
        let departureFlightPrice = 0, returnFlightPrice = 0
        let isRoundTrip = false;
        const allSeatIds = [...seatIdsDeparture];


        if (seatIdsReturn !== null && seatIdsReturn.length !== 0) {
            // returnSeatData = await Seat.findOne({ where: { seat_id: seatIdsReturn[0] } })
            parts = passengersData[0].returnSeats.split('-');
            seatClassReturn = parts[5]
            returnSeatPrice = await Price.findOne({ where: { flight_id: returnFlightId, seat_class: seatClassReturn } });
            isRoundTrip = true
            allSeatIds.push(...seatIdsReturn)
            for (let i = 0; i < passengersData.length; i++) {
                if (passengersData[i].passenger_type === 'adult') {
                    totalPrice = returnSeatPrice.price + totalPrice
                    returnFlightPrice = returnSeatPrice.price + returnFlightPrice
                } else if (passengersData[i].passenger_type === 'child') {
                    totalPrice = returnSeatPrice.price_for_child + totalPrice
                    returnFlightPrice = returnSeatPrice.price_for_child + returnFlightPrice
                } else {
                    totalPrice = returnSeatPrice.price_for_infant + totalPrice
                    returnFlightPrice = returnSeatPrice.price_for_infant + returnFlightPrice
                }
            }
        }
        for (let i = 0; i < passengersData.length; i++) {
            if (passengersData[i].passenger_type === 'adult') {
                totalPrice = departureSeatPrice.price + totalPrice
                departureFlightPrice = departureSeatPrice.price + departureFlightPrice
            } else if (passengersData[i].passenger_type === 'child') {
                totalPrice = departureSeatPrice.price_for_child + totalPrice
                departureFlightPrice = departureSeatPrice.price_for_child + departureFlightPrice
            } else {
                totalPrice = departureSeatPrice.price_for_infant + totalPrice
                departureFlightPrice = departureSeatPrice.price_for_infant + departureFlightPrice
            }
        }
        let passengersName = passengersData[0].first_name + passengersData[0].last_name

        let checkSeatStatus = await checkSeatAvailability(allSeatIds)
        const seatsIdSet = new Set(allSeatIds);
        if (checkSeatStatus.some(status => status === false)) {
            return next(new apiError("Seat yang dipilih tidak tersedia", 400));
        }
        if (allSeatIds.length !== seatsIdSet.size) {
            return next(new apiError("Seat yang dipilih tidak bisa sama", 400));
        }
        console.log(`jumlah passenger ${noOfPassenger} jumlah seat Id ${passengersData.length}`)
        console.log("Type dari", typeof noOfPassenger, typeof passengersData.length)
        if (noOfPassenger !== passengersData.length) {
            return next(new apiError("Jumlah Passenger dengan Data yang dikirim tidak sama", 400));
        }

        // if (totalAmount !== totalPrice) {
        //     return next(new apiError("Total Harga dengan harga Kursi tidak cocok", 400));
        // }
        // let passengerData = await getPassengerData(passengersId, seatIdsDeparture, seatIdsReturn)
        const paymentResult = await createPayment(transaction, paymentId, user_id, totalPrice);
        const bookingResult = await createBooking(transaction, user_id, paymentId, departureFlightId, departureFlightPrice, noOfPassenger, isRoundTrip);
        const updatedFlight = await updateFlightCapacity(departureFlightId, noOfPassenger, transaction)
        const updatedSeats = await updateSeatsAvailability(seatIdsDeparture, transaction)

        let terminal = JSON.stringify(updatedFlight.terminal);

        await Promise.all(seatIdsDeparture.map((seatId, index) => createTicket(departureFlightId, seatId, passengersId[index], bookingResult.booking_id, "", passengersData[index].first_name + passengersData[index].last_name, terminal, req.body.buyerData, passengersData[index].passenger_type, transaction)));

        if (seatClassReturn) {
            returnBookingResult = await createBooking(transaction, user_id, paymentId, returnFlightId, returnFlightPrice, noOfPassenger, isRoundTrip);
            const updatedFlightReturn = await updateFlightCapacity(returnFlightId, noOfPassenger, transaction)
            const updateSeatsReturn = await updateSeatsAvailability(seatIdsReturn, transaction)
            await Promise.all(seatIdsReturn.map((seatId, index) => createTicket(returnFlightId, seatId, passengersId[index], returnBookingResult.booking_id, "", passengersData[index].first_name, terminal, req.body.buyerData, passengersData[index].passenger_type, transaction)));

        }
        await Notification.create({
            notification_id: uuidv4(),
            user_id: user_id,
            booking_id: bookingResult.booking_id,
            notification_type: 'booking_confirmation',
            message: "Please Complete your booking for flight " + updatedFlight.flight_code,
            is_read: false,
        }, { transaction });
        await transaction.commit();
        res.status(201).json({
            is_success: true,
            code: 201,
            data: { bookingResult, returnBookingResult },
            message: 'Create payment success'
        })

    } catch (error) {
        if (transaction) await transaction.rollback(); // Rollback transaction if any step fails
        console.error(error);
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
        payment_method: '',
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
    console.log("Nama tiket penumppang", passengerName)

    return await Ticket.create({
        ticket_id: uuidv4(),
        ticket_code: ticketCode,
        flight_id: flightId,
        seat_id: seatId,
        passenger_id: passengerId,
        booking_id: bookingId,
        seat_number: seatNumber,
        passenger_name: passengerName,
        passenger_type: passengerType,
        TERMINAL: terminal,
        ticket_buyer: buyerData,
        ticket_status: 'pending'
    }, { transaction })
}

const getBookingData = async (req, res, next) => {
    try {
        const paymentId = req.params.id;
        let booking = await Booking.findAll({ where: { payment_id: paymentId } })

        if (!booking || booking.length === 0) return next(new apiError("Booking tidak ditemukan", 404));
        let totalPriceSum = 0;
        let bookingData = booking.map(book => ({ ...book.dataValues }));

        for (let i = 0; i < bookingData.length; i++) {
            totalPriceSum += parseInt(bookingData[i].total_price);
            let adultCount = 0, childCount = 0, babyCount = 0, adultTotalPrice = 0, childTotalPrice = 0, infantTotalPrice = 0;
            const ticket = await Ticket.findAll({ where: { booking_id: bookingData[i].booking_id } })

            const flight = await Flight.findOne({
                where: { flight_id: bookingData[i].flight_id },
                include: [{
                    model: Airline,
                    attributes: { exclude: ['createdAt', 'updatedAt'] },
                }, {
                    model: Airport,
                    as: 'departingAirport', // Alias defined in Flight model association
                    attributes: ['city'] // Specify the attributes you want to include from Airport model
                }, {
                    model: Airport,
                    as: 'arrivingAirport', // Alias defined in Flight model association
                    attributes: ['city'] // Specify the attributes you want to include from Airport model
                },]
            });
            const seat = await Seat.findOne({ where: { seat_id: ticket[0].seat_id } })
            let seatPrice = await Price.findOne({ where: { flight_id: booking[i].flight_id, seat_class: seat.seat_class } })

            ticket.forEach(type => {
                if (type.passenger_type === 'adult') {
                    bookingData[i].adultPrice = seatPrice.price;
                    adultCount++;
                    adultTotalPrice += seatPrice.price;
                } else if (type.passenger_type === 'child') {
                    bookingData[i].childPrice = seatPrice.price_for_child;
                    childCount++;
                    childTotalPrice += seatPrice.price_for_child;
                } else {
                    bookingData[i].babyPrice = seatPrice.price_for_infant;
                    babyCount++;
                    infantTotalPrice += seatPrice.price_for_infant;
                }
            });
            bookingData[i].seatClass = seat.seat_class
            bookingData[i].totalAdult = adultCount;
            bookingData[i].totalChild = childCount;
            bookingData[i].totalBaby = babyCount
            bookingData[i].adultTotalPrice = adultTotalPrice;
            bookingData[i].childTotalPrice = childTotalPrice;
            bookingData[i].babyTotalPrice = infantTotalPrice;
            bookingData[i].flightData = flight
        }
        res.status(200).json({
            is_success: true,
            code: 201,
            data: {
                bookingData,
                totalPrice: totalPriceSum
            },
            message: 'Get Booking data success'
        })

    } catch (error) {
        console.log(error)
        next(new apiError(error.message, 400));
    }
}
const createTransactions = async (req, res, next) => {
    try {
        const paymentId = req.params.id;
        let bookingData = await Booking.findAll({ where: { payment_id: paymentId } })
        let totalPriceSum = 0
        let buyerData;
        if (!bookingData) {
            return next(new apiError("Error data booking tidak ditemukan", 400));
        }
        for (let i = 0; i < bookingData.length; i++) {
            totalPriceSum += parseInt(bookingData[i].total_price);

            const ticket = await Ticket.findAll({ where: { booking_id: bookingData[i].booking_id } })

            buyerData = ticket[0].ticket_buyer
        }

        console.log(buyerData)
        let parameter = {
            "transaction_details": {
                "order_id": paymentId,
                "gross_amount": totalPriceSum
            },
            "credit_card": {
                "secure": true
            },
            "customer_details": {
                "first_name": "" || buyerData.fullName,
                "last_name": "" || buyerData.familyName,
                "email": buyerData.email,
                "phone": buyerData.phone
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
                        token: transactionToken,
                        url: redirectUrl,

                    },
                    message: 'Create payment success'
                })
            })

    } catch (error) {
        console.log(error)
        next(new apiError(error.message, 400));
    }
}
const updatePaymentStatus = async (req, res, next) => {
    let transaction = await sequelize.transaction();
    try {
        const { transaction_details, transaction_status, transaction_id, order_id } = req.body;

        const paymentData = await payment.update({ payment_status: 'completed' }, { where: { payment_id: order_id } })
        if (!paymentData) {
            return next(new apiError("Data Payment not found", 404));
        }
        await Booking.update({ status: 'booked' }, { where: { payment_id: order_id } });
        const newBookingData = await Booking.findOne({ where: { payment_id: order_id } });
        const ticketData = await Ticket.update({ ticket_status: 'confirmed' }, { where: { booking_id: newBookingData.booking_id } })

        await transaction.commit()
        res.status(200).json({
            is_success: true,
            code: 200,
            data: paymentData,
            newBookingData,
            ticketData,
            message: 'Update successful'
        })

    } catch (error) {
        if (transaction) await transaction.rollback(); // Rollback transaction if any step fails
        next(new apiError(error.message, 400));
    }
}
module.exports = {
    createTransactions,
    createTransactionsWithFlight,
    getBookingData,
    updatePaymentStatus
}