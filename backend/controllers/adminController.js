const User = require('../models/User');
const Task = require('../models/Task');
const ActivityLog = require('../models/ActivityLog');

// @desc    View all users
// @route   GET /api/admin/users
// @access  Private/Admin
const getAllUsers = async (req, res) => {
  try {
    // Return all users, excluding password
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update user status (Active/Inactive)
// @route   PATCH /api/admin/users/:id/status
// @access  Private/Admin
const updateUserStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!status || !['Active', 'Inactive'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status. Must be Active or Inactive.' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent Admin from deactivating themselves
    if (user._id.toString() === req.user._id.toString() && status === 'Inactive') {
      return res.status(400).json({ message: 'You cannot deactivate your own admin account.' });
    }

    user.status = status;
    await user.save();

    res.json({
      message: `User status updated to ${status}`,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        status: user.status,
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete a user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent Admin from deleting themselves
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot delete your own admin account.' });
    }

    // Delete all tasks associated with this user
    await Task.deleteMany({ user: user._id });

    // Delete the user
    await User.findByIdAndDelete(req.params.id);

    res.json({ message: 'User and all associated tasks removed successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    View all tasks created by all users
// @route   GET /api/admin/tasks
// @access  Private/Admin
const getAllTasksAdmin = async (req, res) => {
  try {
    const tasks = await Task.find({}).populate('user', 'username email role status').sort({ createdAt: -1 });
    res.json(tasks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    View all system activity logs
// @route   GET /api/admin/activity-logs
// @access  Private/Admin
const getActivityLogs = async (req, res) => {
  try {
    const logs = await ActivityLog.find({})
      .populate('user', 'username email role')
      .sort({ timestamp: -1 });
    res.json(logs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get dashboard analytics
// @route   GET /api/admin/analytics
// @access  Private/Admin
const getAnalytics = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({});
    const totalTasks = await Task.countDocuments({});
    const completedTasks = await Task.countDocuments({ status: 'Completed' });
    const pendingTasks = await Task.countDocuments({ status: 'Pending' });

    res.json({
      totalUsers,
      totalTasks,
      completedTasks,
      pendingTasks,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getAllUsers,
  updateUserStatus,
  deleteUser,
  getAllTasksAdmin,
  getActivityLogs,
  getAnalytics,
};
