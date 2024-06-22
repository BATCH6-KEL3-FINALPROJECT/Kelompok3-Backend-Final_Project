const transaction = require("../controllers/transactionController");
const authenticate = require("../middlewares/authenticate");
const router = require('express').Router();

router.post('/payment/:id', transaction.createTransactions)
router.post('/booking', authenticate, transaction.createTransactionsWithFlight)
router.get('/booking/:id', transaction.getBookingData)
router.post('/notifications', transaction.updatePaymentStatus)

module.exports = router;
