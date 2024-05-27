const router = require('express').Router();

const Airport = require("../controllers/AirpotController");

router.post('/create', Airport.createAirport);
router.get('/', Airport.getAllAirport);


module.exports = router;