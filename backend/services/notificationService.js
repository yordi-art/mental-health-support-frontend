const Notification = require('../models/Notification');

let _io = null;

const setIO = (io) => { _io = io; };

const notify = async (userId, message, type, relatedId = null) => {
  const notification = await Notification.create({ userId, message, type, relatedId });
  if (_io) _io.to(userId.toString()).emit('notification', notification);
  return notification;
};

module.exports = { setIO, notify };
