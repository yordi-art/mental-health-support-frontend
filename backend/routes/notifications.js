const express = require('express');
const NotificationController = require('../controllers/notificationController');
const auth = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');

const router = express.Router();

router.use(auth);

router.get('/', NotificationController.getNotifications);
router.patch('/read', NotificationController.markAsRead);
router.post('/send', roleAuth(['admin']), NotificationController.sendAnnouncement);

module.exports = router;
