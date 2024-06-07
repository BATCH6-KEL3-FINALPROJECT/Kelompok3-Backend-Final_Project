const router = require('express').Router();

const Notification = require("../controllers/NotificationController");

router.post('/create', Notification.createNotification);
Router.get('/', Notification.getNotification);
router.get('/:id', Notification.getNotificationById);



module.exports = router;