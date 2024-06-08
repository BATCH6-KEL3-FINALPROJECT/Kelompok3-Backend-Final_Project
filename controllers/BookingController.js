const apiError = require("../utils/apiError");
const { v4: uuidv4 } = require('uuid');
require("dotenv").config();
const { Flight, Airport, Airline, Price, Booking, payment } = require('../models');
const midtransClient = require('midtrans-client');
const { UUIDV4 } = require("sequelize");

const createTransactions = async (req, res, next) => {
    try {

        let snap = new midtransClient.Snap({
            // Set to true if you want Production Environment (accept real transaction).
            isProduction: false,
            serverKey: process.env.MIDTRANS_SERVER_KEY
        });
        const { totalAmount, flightName, noOfItems } = req.body

        console.log("Masuk create")
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

        let transactionToken
        snap.createTransaction(parameter)
            .then((transaction) => {
                // transaction token
                transactionToken = transaction.token;
                console.log('transactionToken:', transactionToken);
                const redirectUrl = transaction.redirect_url;
                console.log('redirectUrl:', redirectUrl);
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
        // console.log("Token transaksi", transactionToken)

    } catch (error) {
        console.log(error);
        next(new apiError(error.message, 400));
    }
}

module.exports = { createTransactions }