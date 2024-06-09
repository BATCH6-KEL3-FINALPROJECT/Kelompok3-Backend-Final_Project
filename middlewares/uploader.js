const multer = require('multer');

const allowedTypes = ['image/jpg', 'image/jpeg', 'image/png'];

const multerConfig = multer({
	fileFilter: (req, file, cb) => {
		if (allowedTypes.includes(file.mimetype)) {
			cb(null, true);
		} else {
			return cb(new Error(`Only ${allowedTypes.join(', ')} are allowed`));
		}
	},
	limits: {
		fileSize: 2 * 1024 * 1024, // 2MB
	},
});

const upload = multerConfig;

module.exports = upload;
