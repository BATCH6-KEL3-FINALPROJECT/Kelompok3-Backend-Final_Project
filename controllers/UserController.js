const { User } = require("../models");
const ApiError = require("../utils/apiError");
const { Op } = require("sequelize");
const handleUploadImage = require("../utils/handleUpload");
const ImageKit = require("../lib/imagekit");

const findUsers = async (req, res, next) => {
  try {
    const { name, email, phone_number, role, is_verified, page, limit } =
      req.query;

    const pageNum = parseInt(page) || 1;
    const limitData = parseInt(limit) || 10;
    const offset = (pageNum - 1) * limitData;

    if (pageNum < 1) {
      return res.status(400).json({
        status: "Failed",
        message: "Invalid page number",
      });
    }

    if (limitData < 1 || limitData > 100) {
      return res.status(401).json({
        status: "Failed",
        message: "Invalid limit number",
      });
    }

    const whereClause = {};
    if (name) whereClause.name = { [Op.iLike]: `%${name}%` };
    if (email) whereClause.email = email;
    if (phone_number)
      whereClause.phone_number = { [Op.iLike]: `%${phone_number}%` };
    if (role) whereClause.role = role;
    if (is_verified)
      whereClause.is_verified = { [Op.iLike]: `%${is_verified}%` };

    if (req.query.search) {
      whereClause[Op.or] = {
        name: { [Op.like]: `%${req.query.search}%` },
        email: { [Op.like]: `%${req.query.search}%` },
        phone_number: { [Op.like]: `%${req.query.search}%` },
        role: { [Op.like]: `%${req.query.search}%` },
        is_verified: { [Op.like]: `%${req.query.search}%` },
      };
    }

    const { count, rows: users } = await User.findAndCountAll({
      where: whereClause,
      offset,
      limit: limitData,
      attributes: { exclude: ["password", "refresh_token"] },
    });

    if (users.length === 0) {
      return res.status(404).json({
        status: "Not Found",
        message: "No users found for the requested page",
      });
    }

    const totalPages = Math.ceil(count / limitData);

    res.status(200).json({
      is_success: true,
      code: 200,
      data: {
        users,
        pagination: {
          totalData: count,
          totalPages,
          pageNum,
          limitData,
        },
      },
      message: "Get users success"

    });
  } catch (err) {
    next(new ApiError(err.message, 400));
  }
};

const findUserById = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: { exclude: ["password", "refresh_token"] },
    });

    if (!user) {
      return next(
        new ApiError(`User with ID: ${req.params.id} not found`, 404)
      );
    }

    res.status(200).json({
      is_success: true,
      code: 200,
      data: {
        user,
      },
      message: 'get user success'
    });
  } catch (err) {
    next(new ApiError(err.message, 400));
  }
};

const updateUser = async (req, res, next) => {
  const { name, phone_number, email } = req.body;
  try {
    const user = await User.findByPk(req.params.id);
    const files = req.files;

    let imageUrl = "" || user.image_url;
    let imageId = "" || user.image_id;

    if (files && files.length > 0) {
      const { imagesUrl, imagesId } = await handleUploadImage(files, 'user');

      imageUrl = imagesUrl[0];
      imageId = imagesId[0];
    }

    if (!user) {
      return next(new ApiError(`User with ID ${req.params.id} not found`, 404));
    }

    await User.update(
      {
        name,
        phone_number,
        email,
        image_url: imageUrl,
        image_id: imageId,
      },
      {
        where: {
          user_id: req.params.id,
        },
      }
    );

    const updatedUser = await User.findByPk(req.params.id);

    res.status(200).json({
      is_success: true,
      code: 200,
      data: { updatedUser },
      message: "User updated successful",

    });
  } catch (err) {
    console.log(err);
    next(new ApiError(err.message, 400));
  }
};

const deleteUser = async (req, res, next) => {
  try {
    const { user_id } = req.user
    const user = await User.findByPk(user_id);

    if (!user) {
      next(new ApiError(`User with ID ${user_id} not found`, 404));
    }

    await User.destroy({
      where: {
        user_id: user_id,
      },
    });

    res.status(200).json({
      is_success: true,
      code: 200,
      data: {},
      message: "Successfully deleted user",
    });
  } catch (err) {
    next(new ApiError(err.message, 400));
  }
};

module.exports = {
  findUsers,
  findUserById,
  updateUser,
  deleteUser,
};
