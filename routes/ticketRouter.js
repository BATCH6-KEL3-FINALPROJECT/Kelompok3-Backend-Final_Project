const router = require("express").Router();

const Ticket = require("../controllers/TicketController");

router.get("/", Ticket.getAllTickets);
router.post("/", Ticket.createTicket);
router.get("/:id", Ticket.getTicketById);
router.patch("/:id", Ticket.updateTicket);
router.delete("/:id", Ticket.deleteTicket);

module.exports = router;
