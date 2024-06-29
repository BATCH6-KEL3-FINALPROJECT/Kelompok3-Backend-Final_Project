const cron = require('node-cron');
require("dotenv").config();
const { Flight, Price, Booking, payment, Seat, Ticket, Passenger, Airline, Airport, Notification, sequelize } = require('../models');
const { Sequelize, QueryTypes } = require('sequelize');

const updateUnpaidBooking = () => {
    cron.schedule('*/45 * * * *', async () => {
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
        try {
            console.log('Running a task every 30 minutes');
            const pendingPayment = await payment.findAll({ where: { payment_status: 'pending', createdAt: { [Sequelize.Op.lt]: oneHourAgo } } });
            await payment.update({
                payment_status: 'failed'
            }, { where: { payment_status: 'pending', createdAt: { [Sequelize.Op.lt]: oneHourAgo } } })
            pendingPayment.forEach(async (payment) => {
                const pendingBooking = await Booking.findAll({ where: { payment_id: payment.payment_id } });
                Booking.update({ status: 'cancelled' }, { where: { payment_id: payment.payment_id } })
                pendingBooking.forEach(async (booking) => {
                    const cancelledTicket = Ticket.update({ ticket_status: 'cancelled' }, { where: { booking_id: booking.booking_id } })
                    let updateSeats = updateSeats + 1;
                    Ticket.update({ ticket_status: 'cancelled' }, { where: { booking_id: booking.booking_id } })
                    Seat.update({ is_available: true }, { where: { seat_id: cancelledTicket.seat_id } })
                    Flight.update({ seats_available: updateSeats }, { where: { flight_id: cancelledTicket.flight_id } })
                })
            })
        } catch (error) {
            console.log("Cron job Error: " + error)
        }
    })
}
module.exports = updateUnpaidBooking;