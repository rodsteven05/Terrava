const db = require('../models');

const createNotification = async ({ user_id, title, message, type = 'system', data = null }) => {
  try {
    return await db.Notification.create({ user_id, title, message, type, data });
  } catch (err) {
    console.error('Failed to create notification:', err);
    return null;
  }
};

exports.createNotification = createNotification;

exports.getMine = async (req, res) => {
  try {
    const notifications = await db.Notification.findAll({
      where: { user_id: req.user.id },
      order: [['created_at', 'DESC']],
      limit: 50
    });
    const unreadCount = await db.Notification.count({
      where: { user_id: req.user.id, is_read: false }
    });
    res.json({ notifications, unread_count: unreadCount });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const notification = await db.Notification.findOne({
      where: { id: req.params.id, user_id: req.user.id }
    });
    if (!notification) return res.status(404).json({ error: 'Notification not found' });
    await notification.update({ is_read: true });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.markAllAsRead = async (req, res) => {
  try {
    await db.Notification.update(
      { is_read: true },
      { where: { user_id: req.user.id, is_read: false } }
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
