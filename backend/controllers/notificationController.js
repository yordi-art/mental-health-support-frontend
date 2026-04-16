const Notification = require('../models/Notification');
const { notify } = require('../services/notificationService');

class NotificationController {
  // GET /api/notifications
  static async getNotifications(req, res) {
    try {
      const notifications = await Notification.find({ userId: req.user._id })
        .sort({ createdAt: -1 })
        .limit(50);
      const unreadCount = await Notification.countDocuments({ userId: req.user._id, isRead: false });
      res.json({ notifications, unreadCount });
    } catch (error) {
      res.status(500).json({ message: 'Failed to get notifications', error: error.message });
    }
  }

  // PATCH /api/notifications/read
  static async markAsRead(req, res) {
    try {
      const { ids } = req.body; // optional array of ids; if omitted, mark all
      const query = { userId: req.user._id, isRead: false };
      if (ids?.length) query._id = { $in: ids };
      await Notification.updateMany(query, { isRead: true });
      res.json({ message: 'Marked as read' });
    } catch (error) {
      res.status(500).json({ message: 'Failed to mark as read', error: error.message });
    }
  }

  // POST /api/notifications/send  (admin only)
  static async sendAnnouncement(req, res) {
    try {
      const { userIds, message } = req.body;
      if (!userIds?.length || !message) {
        return res.status(400).json({ message: 'userIds and message are required' });
      }
      await Promise.all(userIds.map(id => notify(id, message, 'system')));
      res.json({ message: `Announcement sent to ${userIds.length} user(s)` });
    } catch (error) {
      res.status(500).json({ message: 'Failed to send announcement', error: error.message });
    }
  }
}

module.exports = NotificationController;
