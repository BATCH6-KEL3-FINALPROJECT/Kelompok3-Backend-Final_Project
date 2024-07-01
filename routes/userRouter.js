const router = require("express").Router();

const { register } = require("../controllers/AuthController");
const Users = require("../controllers/UserController");
const authenticate = require("../middlewares/authenticate");
const { checkUserId } = require("../middlewares/checkUser"); // Fix import
const upload = require("../middlewares/uploader");

router.post('/create', authenticate, upload.array('images'), register);
router.get("/", Users.findUsers);
router.get("/:id", Users.findUserById);
router.patch('/:id', authenticate, upload.array('images'), Users.updateUser);
router.delete("/", authenticate, Users.deleteUser);


module.exports = router;
