const router = require("express").Router();
const Ticket = require("../controllers/TicketController");
const authenticate = require("../middlewares/authenticate");

router.get("/download", Ticket.downloadTicket);
router.post("/generate/:id", authenticate, Ticket.sentTicket);
router.get("/", Ticket.getAllTickets);
router.post("/", Ticket.createTicket);
router.get("/:id", Ticket.getTicketById);
router.patch("/:id", Ticket.updateTicket);
router.delete("/:id", Ticket.deleteTicket);
// router.delete("/booking/:id", Ticket.deleteBooking);

module.exports = router;
