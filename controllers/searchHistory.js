const ApiError = require("../utils/apiError");
const uuid = require("uuid");
const { SearchHistory } = require("../models");

const createHistory = async (req, res, next) => {
    const user = req.user;
    const { history } = req.body;

    console.log(user);
  
    if (!user) {
      return next(new ApiError("User doesn't exist", 404));
    }
  
    if (!history) {
      return next(new ApiError("History is required", 400));
    }
  

    console.log(user.user_id);
    try {
      const newHistory = await SearchHistory.create({
        user_id: user.user_id,
        history: history,
      });
  
      res.status(201).json({
        is_success: true,
        code: 201,
        data: {
          newHistory,
        },
        message: "History created",
      });
    } catch (error) {
      next(new ApiError(error.message));
    }
  };
  

module.exports = {
  createHistory,
};
