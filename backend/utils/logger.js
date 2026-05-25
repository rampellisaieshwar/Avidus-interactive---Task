const ActivityLog = require('../models/ActivityLog');

const logActivity = async ({ req, user, action, details }) => {
  try {
    const ipAddress = req ? (req.headers['x-forwarded-for'] || req.socket.remoteAddress) : 'Unknown';
    
    const log = new ActivityLog({
      user: user._id,
      username: user.username,
      action,
      details,
      ipAddress,
    });
    
    await log.save();
  } catch (error) {
    console.error(`Error saving activity log: ${error.message}`);
  }
};

module.exports = { logActivity };
