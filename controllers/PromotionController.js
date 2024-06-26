const ApiError = require("../utils/apiError");
const uuid = require("uuid");
const { Promotion } = require("../models");

const createPromotion = async (req, res, next) => {
  const { flight_id, promo_message, description, discount_percentage, start_date, end_date } = req.body;

  try {
    const newPromotion = await Promotion.create({
      flight_id,
      promo_message,
      description,
      discount_percentage,
      start_date,
      end_date,
    });

    res.status(201).json({
      is_succes: true,
      code: 201,
      data: {
        newPromotion,
      },
      message: "Promotion created",
    });
  } catch (error) {
    next(new ApiError(error.message, 500));
    console.log(error);
  }
};

const getPromotion = async (req, res, next) => {
  try {
    const promotion = await Promotion.findAll();

    res.status(200).json({
      is_succes: true,
      code: 201,
      data: {
        promotion,
      },
      message: "Get all promotion success",
    });
  } catch (err) {
    next(new ApiError(err.message, 400));
  }
};

const getPromotionById = async (req, res, next) => {
  try {
    const promotion = await Promotion.findByPk(req.params.id);

    if (!promotion) {
      return next(new ApiError("Promotion not found", 404));
    }

    res.status(200).json({
      is_succes: true,
      code: 200,
      data: {
        promotion,
      },
      message: "Get promotion success",
    });
  } catch (error) {
    next(new ApiError(error.message, 500));
  }
};

const deletePromotion = async (req, res, next) => {
  try {
    const promotion = await Promotion.findByPk(req.params.id);

    if (!promotion) {
      next(new ApiError(`Promotion with this ID : ${req.params.id} not found`, 404));
    }

    await Promotion.destroy({
      where: {
        promotion_id: req.params.id,
      },
    });

    res.status(200).json({
      is_succes: true,
      code: 200,
      data: {
        promotion,
      },
      message: "Promotion deleted success",
    });
  } catch (err) {
    next(new ApiError(err.message, 400));
  }
};

module.exports = {
  createPromotion,
  getPromotion,
  deletePromotion,
  getPromotionById,
};
