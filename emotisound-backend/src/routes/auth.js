const express = require('express');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const { getQuery, runQuery, allQuery } = require('../db/database');
const { generateToken } = require('../utils/jwt');

// Quick UUID generator (uuid package not installed, using simple alternative)
const generateId = () => Math.random().toString(36).substr(2, 9);

const router = express.Router();

// Register
router.post('/register', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password required' });
        }

        // Check if user exists
        const existing = await getQuery('SELECT id FROM users WHERE email = ?', [email]);
        if (existing) {
            return res.status(400).json({ error: 'Email already registered' });
        }

        // Hash password
        const passwordHash = await bcrypt.hash(password, 10);
        const userId = generateId();

        // Create user
        await runQuery(
            'INSERT INTO users (id, email, passwordHash) VALUES (?, ?, ?)',
            [userId, email, passwordHash]
        );

        // Create user preferences
        await runQuery(
            'INSERT INTO user_preferences (userId) VALUES (?)',
            [userId]
        );

        const token = generateToken(userId);

        res.status(201).json({
            token,
            user: {
                id: userId,
                email,
                createdAt: new Date(),
            },
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Registration failed' });
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password required' });
        }

        // Find user
        const user = await getQuery('SELECT * FROM users WHERE email = ?', [email]);
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Check password
        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = generateToken(user.id);

        res.json({
            token,
            user: {
                id: user.id,
                email: user.email,
                createdAt: user.createdAt,
            },
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
});

// Get current user
router.get('/me', (req, res) => {
    // This route should be protected by auth middleware
    if (!req.userId) {
        return res.status(401).json({ error: 'Not authenticated' });
    }

    getQuery('SELECT id, email, createdAt FROM users WHERE id = ?', [req.userId])
        .then(user => {
            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }
            res.json(user);
        })
        .catch(error => {
            res.status(500).json({ error: 'Failed to get user' });
        });
});

// Logout
router.post('/logout', (req, res) => {
    // Token is invalidated on the client side
    res.json({ message: 'Logged out successfully' });
});

module.exports = router;
