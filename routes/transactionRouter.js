const transaction = require("../controllers/transactionController");
const authenticate = require("../middlewares/authenticate");
const router = require('express').Router();

router.post('/create', transaction.createTransactions)
router.post('/booking', authenticate, transaction.createTransactionsWithFlight)

module.exports = router;
