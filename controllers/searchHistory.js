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

      const existingHistory = await SearchHistory.findOne({
        where: {
          user_id: user.user_id,
          history: history,
        },
      });
  
      if (existingHistory) {
        return res.status(200).json({
          is_success: true,
          code: 200,
          data: {
            existingHistory,
          },
          message: "Duplicate history entry ignored",
        });
      }

      
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

const getHistoryByUserToken = async (req, res, next) => {
  const user = req.user;

  if(!user) {
    return next(new ApiError("You need to login first", 400));
  }

  try {
    
    const history = await SearchHistory.findAll({
      where: { user_id: user.user_id}
    })

    if(!history) {
      return next(new ApiError("No history found", 404));
    }

    res.status(201).json({
      is_success: true,
      code: 200,
      data: {
        history,
      },
      message: "History Found",
    });

  } catch (error) {
    next(new ApiError(error.message));
  }
};

const deleteHistory = async (req, res, next) => {
  const user = req.user;
  const { id } = req.params;

  if (!user) {
    return next(new ApiError("User doesn't exist", 404));
  }

  try {
   
    const historyEntry = await SearchHistory.findOne({
      where: {
        id: id,
        user_id: user.user_id,
      },
    });

    if (!historyEntry) {
      return next(new ApiError("History entry not found", 404));
    }

    await historyEntry.destroy();

    res.status(200).json({
      is_success: true,
      code: 200,
      message: "History entry deleted",
    });
  } catch (error) {
    next(new ApiError(error.message, 500));
  }
};
  

module.exports = {
  createHistory,
  getHistoryByUserToken,
  deleteHistory
};
