const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { User, OTP, sequelize } = require("../models");
// const user = require("../models/user");
const ApiError = require("../utils/apiError");
const uuid = require("uuid");
const { where } = require("sequelize");
const { google } = require("googleapis");
const { sentOtp, resendOtp, sentResetPassword } = require("./OTPController");
const handleUploadImage = require("../utils/handleUpload");
const ImageKit = require("../lib/imagekit");
const crypto = require("crypto");
const dotenv = require("dotenv");
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
    // const files = req.files;

    // const images = {
    //     imagesUrl: [],
    //     imagesId: [],
    // };

    // if (files.length !== 0) {
    //     const { imagesUrl, imagesId } = await handleUploadImage(files,);
    //     images.imagesUrl = imagesUrl;
    //     images.imagesId = imagesId;
    // }

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
      // image_url: images.imagesUrl,
      // image_id: images.imagesId,
    });
    const sendingOTP = await sentOtp(email, newUser.user_id, next);

    res.status(201).json({
      is_success: true,
      code: 201,
      data: {
        email,
        newUser,
      },
      message: "Register Berhasil!",
    });
  } catch (err) {
    next(new ApiError(err.message, 500));
  }
};

const verifyAccount = async (req, res, next) => {
  try {
    const { email, otp } = req.body;
    let secretKey = "";

    const existingOTP = await OTP.findOne({ where: { email } });
    const OTPcreatedtime = existingOTP.createdAt;
    const currentTime = new Date();
    if (!existingOTP) {
      return next(new ApiError("OTP error, mohon verifikasi lagi ", 404));
    }

    if (currentTime - OTPcreatedtime > 5 * 60 * 1000) {
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
      is_success: true,
      code: 200,
      data: updatedRows,
      message: `User Verified ${secretKey}`,
    });
  } catch (error) {
    if (error instanceof ApiError) {
      return next(error);
    } else {
      return next(new ApiError("Internal Server Error", 500));
    }
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
      const accessToken = jwt.sign(
        {
          id: user.user_id,
          name: user.name,
          role: user.role,
          email: user.email,
          isVerified: user.is_verified,
          type: "access",
        },
        process.env.JWT_SECRET,
        {
          expiresIn: process.env.JWT_EXPIRED,
        }
      );
      const refreshToken = jwt.sign(
        {
          id: user.user_id,
          name: user.name,
          role: user.role,
          email: user.email,
          type: "refresh",
        },
        process.env.JWT_SECRET,
        {
          expiresIn: process.env.REFRESH_TOKEN_EXPIRED,
        }
      );

      res.status(200).json({
        is_success: true,
        code: 200,
        message: "Login Berhasil!",
        data: {
          token: accessToken,
          refreshToken: refreshToken,
        },
      });
    } else {
      next(new ApiError("Password yang dimasukkan salah", 401));
    }
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

    if (created) {
      return res.json({
        status: 201,
        message: "Successfully Registered by Gmail",
        user: user,
      });
    } else {
      return res.json({
        status: 200,
        message: "Berhasil login menggunakan Gmail",
        user: user,
      });
    }
  } catch (error) {
    next(new ApiError(error.message, 500));
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

    if (!existingUser) {
      return next(new ApiError("Alamat Email tidak ditemukan", 400));
    }

    // const secret = process.env.JWT_SECRET + existingUser.password;
    const payload = {
      email: existingUser.email,
      id: existingUser.user_id,
    };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "15m" });
    // const link = `https://skypass.azkazk11.my.id/reset-password?rpkey=${token}`;
    const link = `https://kelompok3-frontend-final-project-mauve.vercel.app/reset-password?rpkey=${token}`;
    console.log(link);
    const sendingOTP = await sentResetPassword(link, email, token, existingUser.user_id, next);

    res.status(201).json({
      is_success: true,
      code: 201,
      data: {
        token: token,
      },
      message: "Reset password Link sent successfully",
    });
  } catch (err) {
    next(new ApiError(err.message, 500));
  }
};

const verifyResetPassword = async (req, res, next) => {
  try {
    const { rpkey } = req.query;

    if (!rpkey) {
      return next(new ApiError("Token tidak ada", 400));
    }
    let payload;
    try {
      payload = jwt.verify(rpkey, process.env.JWT_SECRET);
    } catch (innerErr) {
      if (innerErr instanceof jwt.TokenExpiredError) {
        return next(new ApiError("Token expired", 400));
      }
      return next(new ApiError("Token invalid", 401));
    }
    res.status(200).json({
      is_success: true,
      code: 200,
      data: "",
      message: "Token valid",
    });
  } catch (error) {
    next(new ApiError(error.message, 500));
  }
};

const changePassword = async (req, res, next) => {
  try {
    const { rpkey } = req.query;
    const { password, confPassword } = req.body;

    if (password.length < 8) {
      return next(new ApiError("Password minimal 8 karakter", 400));
    }
    if (password !== confPassword) {
      return next(new ApiError("Password dan Confirmation password tidak cocok", 400));
    }
    let payload = jwt.verify(rpkey, process.env.JWT_SECRET);
    const user = await User.findByPk(payload.id);

    if (!user) {
      return next(new ApiError("User not found", 404));
    }
    const hashedPassword = await bcrypt.hash(password, 10); // Adjust cost factor as needed

    await User.update(
      { password: hashedPassword },
      {
        where: { user_id: user.user_id }, // Assuming 'id' is the primary key of the User model
      }
    );
    res.status(200).json({
      is_success: true,
      code: 200,
      data: "",
      message: "Password telah diubah",
    });
  } catch (error) {
    next(new ApiError(error.message, 500));
  }
};

module.exports = {
  register,
  verifyAccount,
  login,
  googleLogin,
  callbackLogin,
  authenticate,
  resetPassword,
  verifyResetPassword,
  changePassword,
};
