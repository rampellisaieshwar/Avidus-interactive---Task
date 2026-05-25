const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  updateUserStatus,
  deleteUser,
  getAllTasksAdmin,
  getActivityLogs,
  getAnalytics,
} = require('../controllers/adminController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// Protect all admin routes - must be logged in and must be an Admin
router.use(authenticateToken);
router.use(requireAdmin);

router.get('/users', getAllUsers);
router.patch('/users/:id/status', updateUserStatus);
router.delete('/users/:id', deleteUser);
router.get('/tasks', getAllTasksAdmin);
router.get('/activity-logs', getActivityLogs);
router.get('/analytics', getAnalytics);

module.exports = router;
