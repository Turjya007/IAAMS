// controllers/notification.controller.js
const notificationModel = require('../models/notification.model');

// ============ নিজের সব Notification আনা ============
async function getMyNotifications(req, res) {
  try {
    const notifications = await notificationModel
      .find({ user: req.user.id })
      .sort({ createdAt: -1 }); // notun gula age dekhabe

    res.status(200).json(notifications);

  } catch (error) {
    res.status(500).json({ message: 'Something went wrong', error: error.message });
  }
}

// ============ সব Notification "read" মার্ক করা ============
async function markNotificationsAsRead(req, res) {
  try {
    // ei user er shob unread notification k ekbare true kore dicchi
    await notificationModel.updateMany(
      { user: req.user.id, isRead: false },
      { isRead: true }
    );

    res.status(200).json({ message: 'Notifications marked as read' });

  } catch (error) {
    res.status(500).json({ message: 'Something went wrong', error: error.message });
  }
}

module.exports = { getMyNotifications, markNotificationsAsRead };