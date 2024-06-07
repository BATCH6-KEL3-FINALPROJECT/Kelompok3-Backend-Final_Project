const router = require("express").Router();

const Users = require("../controllers/UserController");

router.get("/", Users.findUsers);
router.get("/:id", Users.findUserById);
router.patch("/:id", Users.updateUser);
router.delete("/:id", Users.deleteUser);

module.exports = router;
