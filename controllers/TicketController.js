const { Ticket, Booking, Flight, Airport, Seat } = require("../models"); // Adjust the path to your models folder
const ApiError = require("../utils/apiError");
const { v4: uuidv4 } = require("uuid");
const fs = require('fs');
const path = require('path');

const createTicket = async (req, res, next) => {
  try {
    const {
      ticket_code,
      flight_id,
      seat_id,
      passenger_id,
      booking_id,
      seat_number,
      passenger_name,
      TERMINAL,
      ticket_status,
    } = req.body;
    const ticket_id = uuidv4();

    const newTicket = await Ticket.create({
      ticket_id,
      ticket_code,
      flight_id,
      seat_id,
      passenger_id,
      booking_id,
      seat_number,
      passenger_name,
      TERMINAL,
      ticket_status,
    });

    res.status(201).json({
      is_success: true,
      code: 200,
      data: {
        newTicket,
      },
    });
  } catch (err) {
    next(new ApiError(err.message, 400));
  }
};

const getAllTickets = async (req, res, next) => {
  try {
    const tickets = await Ticket.findAll();
    res.status(200).json({
      is_success: true,
      code: 200,
      data: {
        tickets,
      },
    });
  } catch (err) {
    next(new ApiError(err.message, 400));
  }
};

const deleteBooking = async (req, res, next) => {
  try {
    const { id } = req.params;

    const booking = await Booking.findOne({ where: { booking_id: id } });

    if (!booking) {
      return res.status(404).json({ error: "booking not found" });
    }

    await booking.destroy();

    res.status(200).json({
      is_success: true,
      code: 200,
      data: {},
      message: "Successfully deleted booking",
    });
  } catch (err) {
    next(new ApiError(err.message, 400));
  }
};

const getTicketById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const ticket = await Ticket.findOne({ where: { ticket_id: id } });

    if (!ticket) {
      return next(new ApiError(`Ticket with ID: ${req.params.id} not found`, 404));
    }

    res.status(200).json({
      is_success: true,
      code: 200,
      data: {
        ticket,
      },
      message: 'Success get Ticket by Id'
    });
  } catch (err) {
    next(new ApiError(err.message, 400));
  }
};

const updateTicket = async (req, res, next) => {
  const {
    ticket_code,
    flight_id,
    seat_id,
    passenger_id,
    booking_id,
    seat_number,
    passenger_name,
    TERMINAL,
    ticket_status,
  } = req.body;

  try {
    const ticket = await Ticket.findByPk(req.params.id);

    if (!ticket) {
      return next(
        new ApiError(`Ticket with ID ${req.params.id} not found`, 404)
      );
    }

    await Ticket.update(
      {
        ticket_code,
        flight_id,
        seat_id,
        passenger_id,
        booking_id,
        seat_number,
        passenger_name,
        TERMINAL,
        ticket_status,
      },
      {
        where: {
          ticket_id: req.params.id,
        },
      }
    );

    const updatedTicket = await Ticket.findByPk(req.params.id);

    res.status(200).json({
      is_success: true,
      code: 200,
      data: { updatedTicket },
      message: "Successfully updated ticket",
    });
  } catch (err) {
    next(new ApiError(err.message, 400));
  }
};

const deleteTicket = async (req, res, next) => {
  try {
    const { id } = req.params;

    const ticket = await Ticket.findOne({ where: { ticket_id: id } });

    if (!ticket) {
      return res.status(404).json({ error: "Ticket not found" });
    }

    await ticket.destroy();

    res.status(200).json({
      is_success: true,
      code: 200,
      data: {},
      message: "Successfully deleted Ticket",
    });
  } catch (err) {
    next(new ApiError(err.message, 400));
  }
};

const downloadTicket = async (req, res, next) => {
  try {
    console.log("Downloading Ticket");
    const filePath = path.join(__dirname, '..', 'E_Ticket.pdf');

    fs.access(filePath, fs.constants.F_OK, (err) => {
      if (err) {
        console.error('File not found:', err);
        return res.status(404).send('File not found.');
      }

      res.download(filePath, 'E_Ticket.pdf', (err) => {
        if (err) {
          console.error('Error downloading file:', err);
          return res.status(500).send('Error downloading file.');
        }
      });
    });
  } catch (err) {
    console.error('Error in downloadTicket:', err);
    return res.status(500).send('Internal server error.');
  }
}
module.exports = {
  createTicket,
  getAllTickets,
  getTicketById,
  updateTicket,
  deleteTicket,
  downloadTicket
};
