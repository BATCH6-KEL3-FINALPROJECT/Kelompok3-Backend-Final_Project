const router = require("express").Router();

const Passenger = require("../controllers/PassengerController");
const authenticate = require("../middlewares/authenticate");

router.get("/", Passenger.findPassengers);
router.post("/", authenticate, Passenger.createPassenger)
router.get("/:id", Passenger.findPassengerById);
router.patch("/:id", authenticate, Passenger.updatePassenger);
router.delete("/:id", authenticate, Passenger.deletePassenger);

module.exports = router;
