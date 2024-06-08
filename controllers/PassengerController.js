const { Passenger } = require("../models");
const ApiError = require("../utils/apiError");
const { Op } = require("sequelize");
const { v4: uuidv4 } = require('uuid');

const findPassengers = async (req, res, next) => {
  try {
    const {
      user_id,
      title,
      first_name,
      last_name,
      email,
      phone_number,
      passport_no,
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
    if (passport_no)
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
        passport_no: { [Op.like]: `%${req.query.search}%` },
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
      is_success: true,
      code: 200,
      data: {
        passengers,
        pagination: {
          totalData: count,
          totalPages,
          pageNum,
          limitData,
        },
      },
      message: 'Get passenger data success'
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
      is_success: true,
      code: 200,
      data: {
        passenger,
      },
      message: 'Get Passenger By id success'
    });
  } catch (err) {
    next(new ApiError(err.message, 400));
  }
};

const createPassenger = async (req, res, next) => {
  try {
    const passengersData = req.body.passengers;
    console.log(passengersData)
    console.log(req.user)

    // Create passengers in the database
    const passengers = await Promise.all(passengersData.map(async passengerData => {
      const passengerId = uuidv4();
      const userId = req.user.user_id;
      console.log(passengerId)

      let newPassengerData = { ...passengerData, passenger_id: passengerId }
      newPassengerData = { ...newPassengerData, user_id: userId }
      const passenger = await Passenger.create(newPassengerData);
      return passenger;
    }));

    // Send success response with created passengers data
    res.status(201).json({
      is_success: true,
      code: 201,
      data: passengers,
      message: "Passenger created successfully"

    });
  } catch (error) {
    next(new ApiError(error.message, 400));
  }
}

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
    console.log(req.user)

    if (passenger.user_id !== req.user.user_id) {
      return next(
        new ApiError(`Anda tidak bisa mengedit data Passenger ini`, 403));
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
      is_success: true,
      code: 200,
      data: {
        updatedPassenger
      },
      message: "Passenger updated successful",
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

    if (passenger.user_id !== req.user.user_id) {
      return next(
        new ApiError(`Anda tidak bisa mengedit data Passenger ini`, 403));
    }


    await Passenger.destroy({
      where: {
        passenger_id: req.params.id,
      },
    });

    res.status(200).json({
      is_success: true,
      code: 200,
      data: {},
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
  createPassenger
};
