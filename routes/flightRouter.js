const router = require('express').Router();

const Flight = require("../controllers/FlightController");

router.post('/create', Flight.createFlight);
router.get('/', Flight.getAllFlights);
router.get('/:id', Flight.getFlightById);
router.delete('/:id', Flight.deleteFlight);
router.put('/:id', Flight.updateFlight);


module.exports = router;