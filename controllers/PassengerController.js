const { Passenger } = require("../models");
const ApiError = require("../utils/apiError");
const { Op } = require("sequelize");

const findPassengers = async (req, res, next) => {
  try {
    const {
      user_id,
      title,
      first_name,
      last_name,
      email,
      phone_number,
      passportn_no,
      negara_penerbit,
      valid_until,
      page,
      limit,
    } = req.query;

    const pageNum = parseInt(page) || 1;
    const limitData = parseInt(limit) || 10;
    const offset = (pageNum - 1) * limitData;

    const whereClause = {};
    if (user_id) whereClause.user_id = { [Op.iLike]: `%${user_id}%` };
    if (title) whereClause.title = title;
    if (first_name) whereClause.first_name = { [Op.iLike]: `%${first_name}%` };
    if (last_name) whereClause.last_name = { [Op.iLike]: `%${last_name}%` };
    if (email) whereClause.email = { [Op.iLike]: `%${email}%` };
    if (phone_number)
      whereClause.phone_number = { [Op.iLike]: `%${phone_number}%` };
    if (passportn_no)
      whereClause.passportn_no = { [Op.iLike]: `%${passportn_no}%` };
    if (negara_penerbit)
      whereClause.negara_penerbit = { [Op.iLike]: `%${negara_penerbit}%` };
    if (valid_until)
      whereClause.valid_until = { [Op.iLike]: `%${valid_until}%` };

    if (req.query.search) {
      whereClause[Op.or] = {
        user_id: { [Op.like]: `%${req.query.search}%` },
        title: { [Op.like]: `%${req.query.search}%` },
        first_name: { [Op.like]: `%${req.query.search}%` },
        last_name: { [Op.like]: `%${req.query.search}%` },
        email: { [Op.like]: `%${req.query.search}%` },
        phone_number: { [Op.like]: `%${req.query.search}%` },
        passportn_no: { [Op.like]: `%${req.query.search}%` },
        negara_penerbit: { [Op.like]: `%${req.query.search}%` },
        valid_until: { [Op.like]: `%${req.query.search}%` },
      };
    }

    const { count, rows: passengers } = await Passenger.findAndCountAll({
      where: whereClause,
      offset,
      limit: limitData,
    });

    const totalPages = Math.ceil(count / limitData);

    res.status(200).json({
      status: "Success",
      data: {
        passengers,
      },
      pagination: {
        totalData: count,
        totalPages,
        pageNum,
        limitData,
      },
    });
  } catch (err) {
    next(new ApiError(err.message, 400));
  }
};

const findPassengerById = async (req, res, next) => {
  try {
    const passenger = await Passenger.findByPk(req.params.id);

    if (!passenger) {
      return next(
        new ApiError(`Passenger with ID: ${req.params.id} not found`, 404)
      );
    }

    res.status(200).json({
      status: "Success",
      data: {
        passenger,
      },
    });
  } catch (err) {
    next(new ApiError(err.message, 400));
  }
};

const updatePassenger = async (req, res, next) => {
  const {
    user_id,
    title,
    first_name,
    last_name,
    email,
    phone_number,
    passportn_no,
    negara_penerbit,
    valid_until,
  } = req.body;
  try {
    const passenger = await Passenger.findByPk(req.params.id);

    if (!passenger) {
      return next(
        new ApiError(`Passenger with ID ${req.params.id} not found`, 404)
      );
    }

    await Passenger.update(
      {
        user_id,
        title,
        first_name,
        last_name,
        email,
        phone_number,
        passportn_no,
        negara_penerbit,
        valid_until,
      },
      {
        where: {
          passenger_id: req.params.id,
        },
      }
    );

    const updatedPassenger = await Passenger.findByPk(req.params.id);

    res.status(200).json({
      status: "Success",
      message: "Passenger updated successful",
      updatedPassenger,
    });
  } catch (err) {
    next(new ApiError(err.message, 400));
  }
};

const deletePassenger = async (req, res, next) => {
  try {
    const passenger = await Passenger.findByPk(req.params.id);

    if (!passenger) {
      next(new ApiError(`Passenger with ID ${req.params.id} not found`, 404));
    }

    await Passenger.destroy({
      where: {
        passenger_id: req.params.id,
      },
    });

    res.status(200).json({
      status: "Success",
      message: "Successfully deleted passenger",
    });
  } catch (err) {
    next(new ApiError(err.message, 400));
  }
};

module.exports = {
  findPassengers,
  findPassengerById,
  updatePassenger,
  deletePassenger,
};
