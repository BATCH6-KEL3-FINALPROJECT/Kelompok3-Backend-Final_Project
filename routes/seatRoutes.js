const router = require('express').Router();

const Seat = require("../controllers/SeatController");

router.get('/', Seat.getAllSeats);
router.get('/:id', Seat.getSeatById);
router.put('/:id', Seat.updateSeat);
router.delete('/:id', Seat.deleteSeat);
router.post('/create', Seat.createSeat);


module.exports = router;