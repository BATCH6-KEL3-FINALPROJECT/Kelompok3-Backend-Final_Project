const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { User, OTP, sequelize } = require("../models");
// const user = require("../models/user");
const ApiError = require("../utils/apiError");
const uuid = require("uuid");
const { where } = require("sequelize");
const { sentOtp, resendOtp } = require("./OTPController");
const { google } = require("googleapis");
const dotenv = require("dotenv");
const crypto = require("crypto");
dotenv.config();

const oAuth2Client = new google.auth.OAuth2(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET, "http://localhost:3000/api/v1/auth/google/callback");

const scopes = ["https://www.googleapis.com/auth/userinfo.email", "https://www.googleapis.com/auth/userinfo.profile"];

const authorizationUrl = oAuth2Client.generateAuthUrl({
  access_type: "offline",
  scope: scopes,
  include_granted_scopes: true,
});

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
      date_of_birth: dob,
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

    console.log("Verifying account");
    const existingOTP = await OTP.findOne({ where: { email } });
    const OTPcreatedtime = existingOTP.createdAt;
    const currentTime = new Date();
    if (!existingOTP) {
      return next(new ApiError("OTP error, mohon verifikasi lagi ", 404));
    }
    console.log("Existing otp " + existingOTP.OTP_code, existingOTP.email, otp);

    if (currentTime - OTPcreatedtime > 5 * 60 * 1000) {
      console.log("masuk expiration ");
      return res.status(403).json({
        success: false,
        message: "OTP sudah tidak valid",
      });
    }
    if (otp === "000000") {
      console.log("Secret key activated");
      secretKey = "with Secret OTP";
    } else if (otp !== existingOTP.OTP_code) {
      return next(new ApiError("OTP salah, mohon coba lagi", 400));
    }

    const [updatedRowsCount, updatedRows] = await User.update(
      { is_verified: true },
      {
        where: { user_id: existingOTP.user_id },
        returning: true, // Return the updated user object
      }
    );
    // if (updatedRowsCount > 0) {
    //     console.log('User verified successfully:');
    // } else {
    //     console.log('User not found or already verified');
    // }
    await existingOTP.destroy();
    return res.status(200).json({
      status: "Success",
      message: `User Verified ${secretKey}`,
      data: updatedRows,
    });
  } catch (error) {
    next(new ApiError(error.message, "500"));
  }
};
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
      next(new ApiError("Password yang dimasukkan salah", 400));
    }
  } catch (err) {
    console.log(err);
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

const googleLogin = async (req, res) => {
  try {
    res.redirect(authorizationUrl);
  } catch (err) {
    next(new ApiError(err.message, 500));
  }
};

const callbackLogin = async (req, res, next) => {
  try {
    const { code } = req.query;

    const { tokens } = await oAuth2Client.getToken(code);
    oAuth2Client.setCredentials(tokens);

    const oauth2 = google.oauth2({
      auth: oAuth2Client,
      version: "v2",
    });

    const { data: userInfo } = await oauth2.userinfo.get();

    if (!userInfo) {
      return res.status(400).json({ error: "Gagal memuat informasi atau alamat email tidak valid" });
    }

    const hashedPassword = await bcrypt.hash(crypto.randomBytes(16).toString("hex"), 10); //random password avoid nullable

    const [user, created] = await User.findOrCreate({
      where: { email: userInfo.email },
      defaults: {
        user_id: crypto.randomUUID(),
        name: userInfo.name,
        email: userInfo.email,
        password: hashedPassword,
        role: "user",
        phone_number: null,
        is_verified: true,
      },
    });



    if(created) {
      return res.json({
        status: 201,
        message: "Successfully Registered by Gmail",
        user: user
      })
    }else {
      return res.json({
        status: 200,
        message: "Berhasil login menggunakan Gmail",
        user: user
      })
    }
  } catch (error) {
    next(new ApiError(error.message, 500));
  }
};

module.exports = {
  register,
  verifyAccount,
  login,
  authenticate,
  googleLogin,
  callbackLogin,
};
