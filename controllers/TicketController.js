const { Ticket } = require("../models"); // Adjust the path to your models folder
const ApiError = require("../utils/apiError");
const { v4: uuidv4 } = require("uuid");

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
      status: "Success",
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
      status: "Success",
      data: {
        tickets,
      },
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
      new ApiError(`Ticket with ID: ${req.params.id} not found`, 404);
    }

    res.status(200).json({
      status: "Success",
      data: {
        ticket,
      },
    });
  } catch (err) {
    next(new ApiError(err.message, 400));
  }
};

const updateTicket = async (req, res, next) => {
  try {
    const { id } = req.params;
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

    let ticket = await Ticket.findOne({ where: { ticket_id: id } });

    if (!ticket) {
      new ApiError(`Ticket with ID: ${req.params.id} not found`, 404);
    }

    ticket.ticket_code = ticket_code;
    ticket.flight_id = flight_id;
    ticket.seat_id = seat_id;
    ticket.passenger_id = passenger_id;
    ticket.booking_id = booking_id;
    ticket.seat_number = seat_number;
    ticket.passenger_name = passenger_name;
    ticket.TERMINAL = TERMINAL;
    ticket.ticket_status = ticket_status;

    await ticket.save();

    res.status(200).json({
      status: "Success",
      message: "Successfully update ticket",
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
      status: "Success",
      message: "Successfully deleted Ticket",
    });
  } catch (err) {
    next(new ApiError(err.message, 400));
  }
};

module.exports = {
  createTicket,
  getAllTickets,
  getTicketById,
  updateTicket,
  deleteTicket,
};
