const apiError = require("../utils/apiError");
const { User, Auth } = require("../models");

const checkUserId = async (req, res, next) => {
    console.log("Checking user ID")
    if (req.user.user_id !== req.params.id) {
        return next(new apiError("Kamu tidak bisa mengedit user ini", 403))
    }
    next();
}

module.exports = { checkUserId }; // Export as an object with checkUserId property
