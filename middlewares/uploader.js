const multer = require("multer");
const ApiError = require("../utils/apiError");

const multerFiltering = (req, file, cb) => {
  if (
    file.mimetype == "image/png" ||
    file.mimetype == "image/jpg" ||
    file.mimetype == "image/jpeg" ||
    file.mimetype == "image/webp"
  ) {
    cb(null, true);
  } else {
    return cb(
      new ApiError("Only Accept Image Type .png .jpg .webp and .jpeg", 400)
    );
  }
};

const upload = multer({
  fileFilter: multerFiltering,
});

module.exports = upload;
