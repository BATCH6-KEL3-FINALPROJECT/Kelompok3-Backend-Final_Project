const bookingController = require("../controllers/BookingController");
const authenticate = require("../middlewares/authenticate");
const router = require('express').Router();

router.get('/', bookingController.getAllBookings);
router.get('/:id', bookingController.getBookingById);
router.delete('/:id', bookingController.deleteBooking);
// router.post('/create', bookingController.createBooking);
router.put('/:id', bookingController.updateBooking);


module.exports = router;
