const { User, OTP, sequelize } = require("../models");
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
        // return next(new ApiError("failed to sent OTP", 400));
    }
};
const resendOtp = async (req, res, next) => {
    try {
        const { email } = req.body;
        // Check if user exists with the provided email
        const user = await User.findOne({
            where: {
                email,
            },
        });

        if (!user) {
            // User not found with the provided email
            return next(new ApiError("User not found", 404));
        }

        // Generate a new OTP
        const otpId = uuid.v4();
        const otp = generateOTP();
        console.log("New OTP", otp);
        await OTP.update(
            { otp: otp },
            {
                where: {
                    id_user: user.id,
                    email: email,
                },
            });
        const mailResponse = await mailSender(
            email,
            "Verification Email - OTP",
            `<h1>Your new OTP code is: ${otp}</h1>`
        );

        console.log("Resent OTP email successfully", mailResponse);

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

module.exports = {
    sentOtp, resendOtp
}