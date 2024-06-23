const ApiError = require("../utils/apiError");
const uuid = require("uuid");
const { Notification } = require("../models");

// Unchecked controller wait for booking id

const createNotification = async (req, res, next) => {
  const { user_id, flight_id, booking_id, promotion_id, notification_type, message, is_read } = req.body;
  try {
    const newNotification = await Notification.create({
      user_id,
      flight_id,
      booking_id,
      promotion_id,
      notification_type,
      message,
      is_read,
    });

    res.status(201).json({
      is_succes: true,
      code: 201,
      data: {
        newNotification,
      },
      message: 'Notification created'
    });
  } catch (error) {
    next(new ApiError(error.message));
  }
};

const getNotification = async (req, res, next) => {
  try {
    const { user_id } = req.user

    const notification = await Notification.findAll({ where: { user_id: user_id } });

    if (!notification) {
      return next(new ApiError("Notification is Empty"));
    }

    res.status(201).json({
      is_sucsess: true,
      code: 201,
      data: {
        notification,
      },
      message: "GEt all notif success"
    });
  } catch (error) {
    next(new ApiError(error.message));
  }
};

const getNotificationById = async (req, res, next) => {
  try {
    const notification = await Notification.findByPk(req.params.id);

    if (!notification) {
      return next(new ApiError("Promotion not found", 404));
    }

    res.status(200).json({
      status: "Success",
      data: {
        notification,
      },
    });
  } catch (error) {
    next(new ApiError(error.message));
  }
};

module.exports = {
  createNotification,
  getNotification,
  getNotificationById
};
