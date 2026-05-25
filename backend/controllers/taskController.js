const Task = require('../models/Task');
const { logActivity } = require('../utils/logger');

// @desc    Get all tasks (Admin gets all, User gets own)
// @route   GET /api/tasks
// @access  Private
const getTasks = async (req, res) => {
  try {
    let tasks;
    if (req.user.role === 'Admin') {
      // Admin sees all tasks and populates the user info
      tasks = await Task.find({}).populate('user', 'username email');
    } else {
      // User only sees their own tasks
      tasks = await Task.find({ user: req.user._id }).populate('user', 'username email');
    }
    res.json(tasks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Create a new task
// @route   POST /api/tasks
// @access  Private
const createTask = async (req, res) => {
  try {
    const { title, description } = req.body;

    if (!title) {
      return res.status(400).json({ message: 'Title is required' });
    }

    const task = await Task.create({
      title,
      description,
      user: req.user._id,
      status: 'Pending', // default status
    });

    // Track activity: Task creation
    await logActivity({
      req,
      user: req.user,
      action: 'Task Creation',
      details: `Created task: "${title}"`,
    });

    res.status(201).json(task);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update a task (User updates own, Admin updates any)
// @route   PUT /api/tasks/:id
// @access  Private
const updateTask = async (req, res) => {
  try {
    const { title, description, status } = req.body;
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Verify ownership or admin privilege
    if (task.user.toString() !== req.user._id.toString() && req.user.role !== 'Admin') {
      return res.status(403).json({ message: 'Access denied: Cannot update other users tasks' });
    }

    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (status !== undefined) task.status = status;

    const updatedTask = await task.save();

    // Track activity: Task update
    await logActivity({
      req,
      user: req.user,
      action: 'Task Update',
      details: `Updated task "${task.title}" (ID: ${task._id})`,
    });

    res.json(updatedTask);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete a task (User deletes own, Admin deletes any)
// @route   DELETE /api/tasks/:id
// @access  Private
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Verify ownership or admin privilege
    if (task.user.toString() !== req.user._id.toString() && req.user.role !== 'Admin') {
      return res.status(403).json({ message: 'Access denied: Cannot delete other users tasks' });
    }

    const title = task.title;
    await Task.findByIdAndDelete(req.params.id);

    // Track activity: Task deletion
    await logActivity({
      req,
      user: req.user,
      action: 'Task Deletion',
      details: `Deleted task "${title}" (ID: ${req.params.id})`,
    });

    res.json({ message: 'Task removed successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
};
