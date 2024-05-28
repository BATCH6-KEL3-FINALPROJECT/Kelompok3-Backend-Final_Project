const router = require("express").Router();
const swaggerUI = require("swagger-ui-express");
const swaggerDocument = require("../docs/swagger.json");

const Auth = require("./authRouter");
const Flight = require("./flightRouter");
const Airport = require("./airportRouter");
const Airline = require("./airlineRoutes")
router.use("/api-docs", swaggerUI.serve);
router.use("/api-docs", swaggerUI.setup(swaggerDocument));

router.use("/api/v1/auth", Auth)
router.use("/api/v1/flight", Flight)
router.use("/api/v1/airport", Airport)
router.use("/api/v1/airline", Airline)

module.exports = router;
