const { Ticket, Booking, Flight, Airport, Airline, Passenger, Seat, User } = require("../models"); // Adjust the path to your models folder
const ApiError = require("../utils/apiError");
const { v4: uuidv4 } = require("uuid");
const fs = require('fs');
const playwright = require('playwright');
const path = require('path');
const { mailSender, printTicket } = require("../utils/mailSender");

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

const sentTicket = async (req, res, next) => {
  try {
    let { email } = req.body;
    const { id } = req.params;
    const { user_id } = req.user;

    const user = await User.findOne({ where: { user_id: user_id } })
    if (!email) {
      email = user.email
    }
    const path = await generateTicket(id, email, next)
    const mailResponse = await printTicket(
      email,
      "Your Ticket ",
      `<div style="font-family: Arial, sans-serif; color: #333; background-color: #f7f7f7; padding: 20px;">
          <img src="https://ik.imagekit.io/ib9lfahbz/finalProject/logo%20skypass%202.png?updatedAt=1717246290829" alt="Logo" style="max-width: 40%; height: auto; margin-bottom: 20px;">
          <h1 style="color: #333; font-size: 2rem; margin-bottom: 20px;">Halo</h1>
          <h2 style="color: #333; font-size: 1.5rem; margin-bottom: 20px;">Ini adalah Tiket anda untuk penerbangan {nanti diisi} untuk akun dengan email ${email}.</h2>
          <h2 style="color: #333; font-size: 1.rem; margin-bottom: 20px;">Jika anda tidak merasa melakukan request ini mohon abaikan email ini.</h2>
        </div>
        `, path
    );
    res.status(200).json({
      is_success: true,
      code: 200,
      data: {},
      message: "Ticket sent successfully, please check your email",

    });
  } catch (error) {
    console.log(error.message);
    // await transaction.rollback(); 
    return next(new ApiError("failed to sent OTP", 400));
  }
};
const generateTicket = async (id, email, next) => {
  try {
    // const { email } = req.body;
    // const { id } = req.params;

    const bookingData = await Booking.findOne({
      attributes: { exclude: ['updatedAt'] },
      where: { booking_id: id },
      include: [{
        model: Flight,
        attributes: { exclude: ['airline_id', 'plane_type', 'seats_available', 'is_promo', 'is_available', 'createdAt', 'updatedAt'] },
        include: [{
          model: Airport,
          as: 'departingAirport',
          attributes: ['city', 'iata_code']
        }, {
          model: Airport,
          as: 'arrivingAirport',
          attributes: ['city', 'iata_code']
        }, {
          model: Airline,
        }]
      },
      {
        model: Ticket,
        attributes: ['seat_number', 'passenger_name', 'ticket_code', 'ticket_buyer', 'ticket_code'],
        include: [{
          model: Seat,
          attributes: ['seat_class']
        }, {
          model: Passenger,
          attributes: ['first_name', 'last_name', 'passenger_id', 'passenger_type']
        }]
      }]
    });
    const [year, month, day] = bookingData.Flight.departure_date.split('-');
    const dateObj = new Date(year, month - 1, day);
    const dayOfWeek = dateObj.getDay();
    const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const reversedDate = `${day}-${month}-${year}`;
    const dayName = weekdays[dayOfWeek];

    const hours = Math.floor(bookingData.Flight.flight_duration / 60);
    const minutes = bookingData.Flight.flight_duration % 60;

    const formattedDuration = `${hours} hours ${minutes} minutes`;

    let ticketsHtml;
    bookingData.Tickets.forEach((ticket, index) => {
      // Generate HTML for each ticket
      ticketsHtml += `
        <div class="bg-white rounded-lg shadow-md p-12 mt-4">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div class="flex justify-center items-center rounded-lg p-4">
              <p class="text-gray-600"><span class="font-bold">#${index + 1}</span></p>
            </div>
    
            <div class="bg-white rounded-lg p-4">
              <div class="flex flex-col justify-center items-center">
                <p class="text-gray-600"><span class="font-bold">Traveller</span></p>
                <p class="text-gray-600">${ticket.passenger_name}</p>
              </div>
            </div>
    
            <div class="bg-white rounded-lg p-4">
              <div class="flex flex-col justify-center items-center">
                <p class="text-gray-600"><span class="font-bold">Ticket</span></p>
                <p class="text-gray-600">${ticket.ticket_code}</p>
              </div>
            </div>
          </div>
        </div>
      `;
    });

    // const totalCostFormatted = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(transactionData.totalcost);
    // const bookedSeatsObject = JSON.parse(transactionData.booked_seat);
    // const bookedSeats = Object.keys(bookedSeatsObject);
    const htmlContent = `
   <!DOCTYPE html>
<html>
<head>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css">
</head>
<body>
  <div class="container mx-auto px-10 py-4 border-b border-black">
    <div class="flex justify-between">
      <div class="flex-grow">
        <h2 class="text-2xl font-bold text-gray-800 mb-3">E-Ticket</h2>
        <p class="text-gray-900 mb-3">SkyPass Order ID: ${bookingData.booking_code}</p>
        <p class="text-gray-900 mb-3">Booked on: ${bookingData.booking_date}</p>
      </div>
      <div>
        <span class="text-4xl font-bold">
          <span style="color:#0b3d91;">Sky</span><span style="color:#00aaff;">Pass</span>
        </span>
      </div>
    </div>
  </div>
  
  <div class="container mx-auto px-10 py-4">
    <p class="text-gray-600">Onward Flight Details</p>
    <div class="flex justify-between items-center mb-4">
      <div class="flex flex-row">
        <p class="text-xl mr-4">${bookingData.Flight.departingAirport.city} to ${bookingData.Flight.arrivingAirport.city}</p>
        <p class="text-gray-500">${reversedDate}</p>
      </div>
      <button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
        Refundable
      </button>
    </div>

    <div class="bg-gray rounded-lg shadow-md p-6 flex items-center justify-between space-x-4 gap-10">
      <div class="flex flex-col items-center">
        <img src="https://ik.imagekit.io/ib9lfahbz/finalProject/logo%20skypass%202.png?updatedAt=1717246290829" alt="SkyPass" class="w-20 h-20 mb-2">
        <p class="font-bold">SkyPass</p>
        <p class="text-sm text-gray-600">6E-834</p>
      </div>
      
      <div class="flex-1">
        <h5 class="text-lg font-bold">${bookingData.Flight.departingAirport.iata_code} ${bookingData.Flight.departure_time.slice(0, 5)} </h5>
        <p class="text-gray-600">${dayName} ${reversedDate}</p>
        <p class="text-gray-600">${bookingData.Flight.departure_airport} </p>
        <p class="text-gray-600">Terminal 1</p>
      </div>
      
      <div class="flex-1 flex items-center justify-center">
        <div class="flex flex-col items-center text-center">
          <img src="Images/clockpng.png" alt="Clock" class="w-5 h-5 mb-2">
          <p class="text-gray-600">${formattedDuration}</p>
          <p class="text-gray-600">${bookingData.Tickets[0].Seat.seat_class}</p>
        </div>
      </div>
      
      <div class="flex-1">
        <h5 class="text-lg font-bold">${bookingData.Flight.departingAirport.iata_code} ${bookingData.Flight.arrival_time.slice(0, 5)}</h5>
        <p class="text-gray-600">${dayName} ${bookingData.Flight.arrival_date} </p>
        <p class="text-gray-600">${bookingData.Flight.arrival_airport}</p>
      </div>
    </div>

    ${ticketsHtml}
    <div class="container mx-auto p-4">
      <h1 class="text-2xl font-bold text-gray-800 mb-6 mt-6">Baggage Policy : </h1>
      <table class="w-full border-collapse rounded-lg overflow-hidden shadow-md">
        <tbody>
          <tr class="border-b border-gray-200 shadow-md">
            <td class="px-4 py-4 text-gray-800 font-bold w-1/4" style="box-shadow: 4px 0 2px -2px rgba(0, 0, 0, 0.1), -4px 0 2px -2px rgba(0, 0, 0, 0.1);">Check-In (Adult & Child)</td>
            <td class="px-4 py-4 text-gray-800 w-1/2" style="box-shadow: 4px 0 2px -2px rgba(0, 0, 0, 0.1), -4px 0 2px -2px rgba(0, 0, 0, 0.1);">15 KG / person</td>
          </tr>
          <tr class="border-b border-gray-200 shadow-md">
            <td class="px-4 py-4 text-gray-800 font-bold" style="box-shadow: 4px 0 2px -2px rgba(0, 0, 0, 0.1), -4px 0 2px -2px rgba(0, 0, 0, 0.1);">Cabin (Adult & Child)</td>
            <td class="px-4 py-4 text-gray-800" style="box-shadow: 4px 0 2px -2px rgba(0, 0, 0, 0.1), -4px 0 2px -2px rgba(0, 0, 0, 0.1);">7 KG / person</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
  <div class="container mx-auto px-10 py-4">
    <div class="flex justify-end">
        <span class="text-4xl font-bold">
          <span style="color:#0b3d91;">Sky</span><span style="color:#00aaff;">Pass</span>
        </span>
      </div>
    </div>
  </div>
</body>
</html>
`
    const browser = await playwright.chromium.launch();
    const page = await browser.newPage();
    await page.setContent(htmlContent);
    const fileName = `ticket-${bookingData.booking_code}`
    const path = `tickets/user/${bookingData.user_id}/${fileName}.pdf`
    await page.pdf({ path: path });
    await browser.close();

    return path;

  } catch (error) {
    console.log(error);
    next(new ApiError(error.message, 400));
  }
}

const downloadTicket = async (req, res, next) => {
  try {
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
  downloadTicket,
  generateTicket,
  sentTicket
};
