const router = require('express').Router();
const Notification = require("../controllers/NotificationController");
const authenticate = require("../middlewares/authenticate");

router.post('/create', Notification.createNotification);
router.get('/', authenticate, Notification.getNotification);
router.get('/:id', Notification.getNotificationById);
router.patch('/:id', Notification.updateNotificationStatus);


module.exports = router;