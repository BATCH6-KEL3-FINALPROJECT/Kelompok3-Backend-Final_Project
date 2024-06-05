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
        status: "Success",
        data: {
          newPromotion,
        },
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
            status: "Success",
            data: {
                promotion
            }
        });
    } catch (err) {
        next(new ApiError(err.message, 400));
    }

};

const deletePromotion = async (req, res, next) => {
    try {
        const promotion = await Promotion.findByPk(req.params.id);

        //if flight doesnt exist
        if (!promotion) {
            next(new ApiError(`Promotion with this ID : ${req.params.id} not found`, 404));
        }

        await Promotion.destroy({
            where: {
                promotion_id: req.params.id,
            },
        });

        res.status(200).json({
            status: "Success",
            message: "successfully deleted Promotion",
        });
    } catch (err) {
        next(new ApiError(err.message, 400));
    }
};

module.exports = {
  createPromotion,
  getPromotion,
  deletePromotion
};
