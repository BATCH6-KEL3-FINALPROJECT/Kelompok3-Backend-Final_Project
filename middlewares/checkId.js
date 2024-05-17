const ApiError = require("../utils/apiError");

const checkId = (Model) => async (req, res, next) => {
  try {
    const instance = await Model.findByPk(req.params.id);

    if (!instance) {
      return next(new ApiError(`${Model.name} not found`, 404));
    }

    next();
  } catch (err) {
    next(new ApiError(err.message, 500));
  }
};

module.exports = checkId;
