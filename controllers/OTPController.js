const { User, OTP, sequelize, reset_password_token } = require("../models");
const ApiError = require("../utils/apiError");
const otpGenerator = require("otp-generator");
const mailSender = require("../utils/mailSender");
const uuid = require('uuid');
const crypto = require('crypto');


const sentOtp = async (email, idUser, next) => {
    let transaction;
    try {
        transaction = await sequelize.transaction();
        const otp = generateOTP()

        const mailResponse = await mailSender(
            email,
            "Verification Email",
            `<div style="font-family: Arial, sans-serif; color: #333; background-color: #f7f7f7; padding: 20px;">
            <h1 style="color: #333; text-align: center;">warning this OTP only valid for 5 minutes. </h1>
            <p style="color: #333; text-align: center;">Here is your OTP code: </p>
            <h1 style="font-weight: bold;background: #A06ECE;color: white;text-align: center;">${otp}</h1>
            </div>`
        );
        console.log("OTP", otp);
        const currentTime = new Date();

        console.log("Id user new", idUser)
        const newOTP = await OTP.create({
            user_id: idUser,
            email: email,
            OTP_code: otp,
            expired_in: currentTime
        }, { transaction });

        await transaction.commit();
        console.log("email sent successfully");

    } catch (error) {
        console.log(error.message);
        // await transaction.rollback(); 
        return next(new ApiError("failed to sent OTP", 400));
    }
};
const resendOtp = async (req, res, next) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({
            where: {
                email,
            },
        });

        if (!user) {
            return next(new ApiError("User tidak ditemukan, mohon register terlebih dahulu", 404));
        }

        const existingOTP = await OTP.findOne({ where: { email } })
        console.log("OTP existing", existingOTP)
        if (existingOTP) {
            await existingOTP.destroy()
        }

        const otpId = uuid.v4();
        const otp = generateOTP();
        console.log("New OTP", otp);
        const newOTP = await OTP.create({
            user_id: user.user_id,
            email: email,
            OTP_code: otp,
            expired_in: new Date()
        });
        const mailResponse = await mailSender(
            email,
            "Verification Email - OTP",
            `<h1>Your new OTP code is: ${otp}</h1>`
        );

        res.status(200).json({
            status: "Success",
            message: "OTP resent successfully, please check your email",
        });
    } catch (error) {
        console.log(error.message);
        next(new ApiError("Failed to resend OTP", 500));
    }
};
const generateOTP = () => {
    // return otpGenerator.generate(6, { digits: true, alphabets: false, upperCase: false, specialChars: false });
    return crypto.randomInt(100000, 999999).toString();
};
const sentResetPassword = async (link, email, token, idUser, next) => {
    let transaction;
    try {
        transaction = await sequelize.transaction();

        const mailResponse = await mailSender(
            email,
            "Reset Password",
            `<div style="font-family: Arial, sans-serif; color: #333; background-color: #f7f7f7; padding: 20px;">
            <img src="https://ik.imagekit.io/ib9lfahbz/finalProject/logo%20skypass%202.png?updatedAt=1717246290829" alt="Logo" style="max-width: 40%; height: auto; margin-bottom: 20px;">
            <h1 style="color: #333; font-size: 2rem; margin-bottom: 20px;">Halo</h1>
            <h2 style="color: #333; font-size: 1.5rem; margin-bottom: 20px;">Server kami menerima permintaan reset password untuk akun dengan email ${email}.</h2>
            <h2 style="color: #333; font-size: 1.rem; margin-bottom: 20px;">Jika anda tidak merasa melakukan request ini mohon abaikan email ini.</h2>
            <p style="color: #333; margin-bottom: 20px;">perhatian: link ini hanya valid untuk 15 menit.</p>
            <h1 style="font-weight: bold; background: #A06ECE; hover: #9a5ed1; color: white; text-align: center; padding: 10px; margin-bottom: 20px;"><a href=${link}>Password Reset Link</a> </h1>
          </div>
          `
        );

        console.log("Link", link);
        const currentTime = new Date();
        const fifteenMinutesLater = new Date(currentTime.getTime() + 15 * 60000); // 15 minutes in milliseconds

        const newResetPassword = await reset_password_token.create({
            user_id: idUser,
            email: email,
            token: token,
            expired_in: fifteenMinutesLater
        }, { transaction });

        await transaction.commit();
        console.log("email sent successfully");

    } catch (error) {
        console.log(error.message);
        // await transaction.rollback(); 
        return next(new ApiError("failed to sent OTP", 400));
    }
};
module.exports = {
    sentOtp, resendOtp, sentResetPassword
}