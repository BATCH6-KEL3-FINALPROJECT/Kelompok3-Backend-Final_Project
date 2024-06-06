const router = require("express").Router();

const Passenger = require("../controllers/PassengerController");

router.get("/", Passenger.findPassengers);
router.get("/:id", Passenger.findPassengerById);
router.patch("/:id", Passenger.updatePassenger);
router.delete("/:id", Passenger.deletePassenger);

module.exports = router;
