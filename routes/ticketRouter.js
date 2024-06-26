const router = require("express").Router();

const Ticket = require("../controllers/TicketController");

router.get("/download", Ticket.downloadTicket);
router.post("/generate/:id", Ticket.generateTicket);
router.post("/coba", Ticket.cobaTicket);
router.get("/", Ticket.getAllTickets);
router.post("/", Ticket.createTicket);
router.get("/:id", Ticket.getTicketById);
router.patch("/:id", Ticket.updateTicket);
router.delete("/:id", Ticket.deleteTicket);
// router.delete("/booking/:id", Ticket.deleteBooking);

module.exports = router;
