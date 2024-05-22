const router = require('express').Router();

const Airline = require("../controllers/AirlineController");

router.post('/create', Airline.createAirline);
router.get('/', Airline.getAllAirlines);


module.exports = router;