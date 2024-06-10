const bookingController = require("../controllers/BookingController");
const authenticate = require("../middlewares/authenticate");
const router = require('express').Router();

router.post('/create', bookingController.createTransactions)
router.post('/booking', authenticate, bookingController.createTransactionsWithFlight)

module.exports = router;
