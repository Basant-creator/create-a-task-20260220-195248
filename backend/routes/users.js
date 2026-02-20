const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const auth = require('../middleware/auth'); // JWT authentication middleware
const { validateProfileUpdate, validatePasswordChange, validateTask } = require('../utils/validation');

const router = express.Router();

// @route   PUT /api/users/:id
// @desc    Update user profile (name)
// @access  Private
router.put('/:id', auth, async (req, res, next) => {
    try {
        // Ensure user is updating their own profile
        if (req.user.id !== req.params.id) {
            return res.status(403).json({ success: false, message: 'Not authorized to update this user' });
        }

        const { error } = validateProfileUpdate(req.body);
        if (error) {
            return res.status(400).json({ success: false, message: error.details[0].message });
        }

        const { name } = req.body;

        let user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        user.name = name || user.name;
        user.updatedAt = Date.now(); // Manually update updatedAt if not using Mongoose timestamps

        await user.save();

        res.json({
            success: true,
            message: 'User profile updated successfully',
            data: { user: { id: user.id, name: user.name, email: user.email } }
        });
    } catch (err) {
        console.error(err.message);
        next(err);
    }
});

// @route   PUT /api/users/:id/password
// @desc    Change user password
// @access  Private
router.put('/:id/password', auth, async (req, res, next) => {
    try {
        if (req.user.id !== req.params.id) {
            return res.status(403).json({ success: false, message: 'Not authorized to change this user\'s password' });
        }

        const { error } = validatePasswordChange(req.body);
        if (error) {
            return res.status(400).json({ success: false, message: error.details[0].message });
        }

        const { currentPassword, newPassword } = req.body;

        let user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: 'Current password is incorrect' });
        }

        // Hash new password and save
        user.password = newPassword; // Pre-save hook will hash this
        user.updatedAt = Date.now();
        await user.save();

        res.json({ success: true, message: 'Password updated successfully' });
    } catch (err) {
        console.error(err.message);
        next(err);
    }
});

// @route   DELETE /api/users/:id
// @desc    Delete user account
// @access  Private
router.delete('/:id', auth, async (req, res, next) => {
    try {
        if (req.user.id !== req.params.id) {
            return res.status(403).json({ success: false, message: 'Not authorized to delete this user' });
        }

        const user = await User.findByIdAndDelete(req.user.id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        res.json({ success: true, message: 'User account deleted successfully' });
    } catch (err) {
        console.error(err.message);
        next(err);
    }
});

// --- Task Management Routes (nested within users since no separate task file) ---

// @route   GET /api/users/me/tasks
// @desc    Get all tasks for the authenticated user
// @access  Private
router.get('/me/tasks', auth, async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id).select('tasks'); // Only retrieve tasks
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        res.json({
            success: true,
            message: 'Tasks fetched successfully',
            data: { tasks: user.tasks.sort((a, b) => b.createdAt - a.createdAt) } // Sort by newest first
        });
    } catch (err) {
        console.error(err.message);
        next(err);
    }
});

// @route   POST /api/users/me/tasks
// @desc    Create a new task for the authenticated user
// @access  Private
router.post('/me/tasks', auth, async (req, res, next) => {
    try {
        const { error } = validateTask(req.body);
        if (error) {
            return res.status(400).json({ success: false, message: error.details[0].message });
        }

        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const newTask = {
            title: req.body.title,
            description: req.body.description,
            dueDate: req.body.dueDate || null,
            status: req.body.status || 'pending'
        };

        user.tasks.push(newTask);
        await user.save();

        // Return the newly created task (which will have _id generated by Mongoose)
        res.status(201).json({
            success: true,
            message: 'Task created successfully',
            data: { task: user.tasks[user.tasks.length - 1] }
        });
    } catch (err) {
        console.error(err.message);
        next(err);
    }
});

// @route   PUT /api/users/me/tasks/:task_id
// @desc    Update a specific task for the authenticated user
// @access  Private
router.put('/me/tasks/:task_id', auth, async (req, res, next) => {
    try {
        const { error } = validateTask(req.body); // Use same validation for update
        if (error) {
            return res.status(400).json({ success: false, message: error.details[0].message });
        }

        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const task = user.tasks.id(req.params.task_id);
        if (!task) {
            return res.status(404).json({ success: false, message: 'Task not found' });
        }

        // Update task fields
        task.title = req.body.title || task.title;
        task.description = req.body.description || task.description;
        task.dueDate = req.body.dueDate || task.dueDate;
        task.status = req.body.status || task.status;
        task.updatedAt = Date.now();

        await user.save();

        res.json({
            success: true,
            message: 'Task updated successfully',
            data: { task }
        });
    } catch (err) {
        console.error(err.message);
        next(err);
    }
});

// @route   DELETE /api/users/me/tasks/:task_id
// @desc    Delete a specific task for the authenticated user
// @access  Private
router.delete('/me/tasks/:task_id', auth, async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Remove task using Mongoose subdocument method
        user.tasks.pull(req.params.task_id);

        await user.save();

        res.json({ success: true, message: 'Task deleted successfully' });
    } catch (err) {
        console.error(err.message);
        next(err);
    }
});


module.exports = router;