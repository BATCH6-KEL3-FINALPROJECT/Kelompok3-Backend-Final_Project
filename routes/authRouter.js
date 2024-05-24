const router = require('express').Router();

const Auth = require("../controllers/AuthController");
const OTP = require("../controllers/OTPController");

router.post('/register', Auth.register);
router.post('/verify', Auth.verifyAccount);
router.post('/login', Auth.login)
router.post('/resend-otp', OTP.resendOtp)
router.post('/sent-otp', OTP.resendOtp)

module.exports = router;