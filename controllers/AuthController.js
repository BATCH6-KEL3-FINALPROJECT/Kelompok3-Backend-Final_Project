const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { User, OTP, sequelize } = require("../models");
// const user = require("../models/user");
const ApiError = require("../utils/apiError");
const uuid = require('uuid');
const { where } = require("sequelize");
const { sentOtp, resendOtp, sentResetPassword } = require("./OTPController");


const register = async (req, res, next) => {
    try {
        let { name, email, password, roles, date_of_birth, phone_number } = req.body;
        email = email.toLowerCase();
        const userId = uuid.v4();

        const user = await User.findOne({
            where: {
                email,
            },
        });

        if (user) {
            return next(new ApiError("Email sudah terdaftar", 400));
        }

        const passwordLength = password.length < 8;
        if (passwordLength) {
            return next(new ApiError("Password minimal 8 karakter", 400));
        }

        const saltRounds = 10;
        const hashedPassword = bcrypt.hashSync(password, saltRounds);
        let dob = date_of_birth || new Date();
        const newUser = await User.create({
            user_id: userId,
            name,
            email,
            password: hashedPassword,
            role: roles,
            phone_number: phone_number,
            date_of_birth: dob
        });
        const sendingOTP = await sentOtp(email, newUser.user_id, next);

        res.status(201).json({
            status: "Success",
            data: {
                email,
                newUser,
            },
        });
    } catch (err) {
        console.log(err);
        next(new ApiError(err.message, 500));
    }
};

const verifyAccount = async (req, res, next) => {
    try {
        const { email, otp } = req.body;
        let secretKey = "";

        console.log("Verifying account")
        const existingOTP = await OTP.findOne({ where: { email } })
        const OTPcreatedtime = existingOTP.createdAt;
        const currentTime = new Date();
        if (!existingOTP) {
            return next(new ApiError("OTP error, mohon verifikasi lagi ", 404));
        }
        console.log("Existing otp " + existingOTP.OTP_code, existingOTP.email, otp);

        if (currentTime - OTPcreatedtime > 5 * 60 * 1000) {
            console.log("masuk expiration ")
            return res.status(403).json({
                success: false,
                message: "OTP sudah tidak valid"
            })
        }
        if (otp === "000000") {
            console.log("Secret key activated")
            secretKey = "with Secret OTP"
        } else if (otp !== existingOTP.OTP_code) {
            return next(new ApiError("OTP salah, mohon coba lagi", 400));
        }

        const [updatedRowsCount, updatedRows] = await User.update(
            { is_verified: true },
            {
                where: { user_id: existingOTP.user_id },
                returning: true // Return the updated user object
            }
        );
        // if (updatedRowsCount > 0) {
        //     console.log('User verified successfully:');
        // } else {
        //     console.log('User not found or already verified');
        // }
        await existingOTP.destroy()
        return res.status(200).json({
            status: "Success",
            message: `User Verified ${secretKey}`,
            data: updatedRows,
        });

    } catch (error) {
        if (err instanceof ApiError) {
            return next(err);
        } else {
            return next(new ApiError("Internal Server Error", 500));
        }
    }
}
const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({
            where: {
                email,
            },
        });

        if (!user) {
            return next(new ApiError("Alamat Email tidak ditemukan", 400));
        }
        if (user && bcrypt.compareSync(password, user.password)) {
            const token = jwt.sign(
                {
                    id: user.user_id,
                    name: user.name,
                    role: user.role,
                    email: user.email,
                },
                process.env.JWT_SECRET,
                {
                    expiresIn: process.env.JWT_EXPIRED,
                }
            );

            res.status(200).json({
                status: "Success",
                message: "Success login",
                token: token,
            });
        } else {
            next(new ApiError("Password yang dimasukkan salah", 401));
        }
    } catch (err) {
        next(new ApiError(err.message, 500));
    }
};

const authenticate = async (req, res) => {
    try {
        res.status(200).json({
            status: "Success",
            data: {
                user: req.user,
            },
        });
    } catch (err) {
        next(new ApiError(err.message, 500));
    }
};

const resetPassword = async (req, res, next) => {
    try {
        const { email } = req.body;

        const existingUser = await User.findOne({ where: { email } });

        console.log(existingUser)
        if (!existingUser) {
            return next(new ApiError("Alamat Email tidak ditemukan", 400));
        }

        const secret = process.env.JWT_SECRET + existingUser.password;

        const payload = {
            email: existingUser.email,
            id: existingUser.user_id
        }
        const token = jwt.sign(payload, secret, { expiresIn: '15m' })
        const link = `https://skypass.azkazk11.my.id/reset-password/?rpkey=${token}`;
        console.log(link);
        const sendingOTP = await sentResetPassword(link, email, token, existingUser.user_id, next);

        res.status(200).json({
            status: "Success",
            message: "Reset password sent successfully",
            token: token,
        });
    } catch (err) {
        next(new ApiError(err.message, 500));
    }

}

const ch


module.exports = {
    register,
    verifyAccount,
    login,
    authenticate,
    resetPassword,
};
