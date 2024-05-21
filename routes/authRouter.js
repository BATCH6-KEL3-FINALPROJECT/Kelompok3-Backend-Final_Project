const router = require('express').Router();

const Auth = require("../controllers/AuthController");

router.post('/register', Auth.register);
router.post('/verify', Auth.verifyAccount);
router.post('/login', Auth.login);

module.exports = router;