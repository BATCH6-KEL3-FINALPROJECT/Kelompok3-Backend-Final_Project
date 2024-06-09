const router = require("express").Router();

const { register } = require("../controllers/AuthController");
const Users = require("../controllers/UserController");

router.post('/create', Authenticate, upload.array('images'), register);
router.get("/", Users.findUsers);
router.get("/:id", Users.findUserById);
router.patch('/:id', Authenticate, upload.array('images'), Users.updateUser);
router.delete("/:id", Users.deleteUser);


module.exports = router;
