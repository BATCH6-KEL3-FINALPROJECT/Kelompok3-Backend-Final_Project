const booking = require("../controllers/BookingController");
const router = require('express').Router();

router.post('/create', booking.createTransactions)

module.exports = router;
