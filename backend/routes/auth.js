const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { validateSignup, validateLogin } = require('../utils/validation');
const auth = require('../middleware/auth'); // JWT authentication middleware

const router = express.Router();

// @route   POST /api/auth/signup
// @desc    Register new user & return token
// @access  Public
router.post('/signup', async (req, res, next) => {
    try {
        const { error } = validateSignup(req.body);
        if (error) {
            return res.status(400).json({ success: false, message: error.details[0].message });
        }

        const { name, email, password } = req.body;

        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ success: false, message: 'User already exists' });
        }

        user = new User({
            name,
            email,
            password
        });

        await user.save(); // Password hashing happens in User model pre-save hook

        const payload = {
            user: {
                id: user.id
            }
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '1h' }, // Token expires in 1 hour
            (err, token) => {
                if (err) throw err;
                res.status(201).json({
                    success: true,
                    message: 'User registered successfully',
                    data: { token }
                });
            }
        );
    } catch (err) {
        console.error(err.message);
        next(err); // Pass error to the error handling middleware
    }
});

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', async (req, res, next) => {
    try {
        const { error } = validateLogin(req.body);
        if (error) {
            return res.status(400).json({ success: false, message: error.details[0].message });
        }

        const { email, password } = req.body;

        let user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ success: false, message: 'Invalid Credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: 'Invalid Credentials' });
        }

        const payload = {
            user: {
                id: user.id
            }
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '1h' },
            (err, token) => {
                if (err) throw err;
                res.json({
                    success: true,
                    message: 'Logged in successfully',
                    data: { token }
                });
            }
        );
    } catch (err) {
        console.error(err.message);
        next(err);
    }
});

// @route   GET /api/auth/me
// @desc    Get current authenticated user's profile
// @access  Private
router.get('/me', auth, async (req, res, next) => {
    try {
        // req.user.id is set by the auth middleware
        const user = await User.findById(req.user.id).select('-password -tasks'); // Exclude password and tasks array
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        res.json({
            success: true,
            message: 'User profile fetched',
            data: { user }
        });
    } catch (err) {
        console.error(err.message);
        next(err);
    }
});

module.exports = router;