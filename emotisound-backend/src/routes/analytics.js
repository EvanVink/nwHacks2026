const express = require('express');
const { runQuery, allQuery, getQuery } = require('../db/database');

const generateId = () => Math.random().toString(36).substr(2, 9);
const router = express.Router();

// Log emotion event
router.post('/emotion', async (req, res) => {
    try {
        const { emotion, confidence } = req.body;

        if (!emotion) {
            return res.status(400).json({ error: 'Emotion required' });
        }

        const eventId = generateId();

        await runQuery(
            'INSERT INTO emotion_events (id, userId, emotion, confidence) VALUES (?, ?, ?, ?)',
            [eventId, req.userId, emotion, confidence || 0]
        );

        res.status(201).json({ id: eventId });
    } catch (error) {
        console.error('Error logging emotion:', error);
        res.status(500).json({ error: 'Failed to log emotion' });
    }
});

// Get emotion statistics for current user
router.get('/stats', async (req, res) => {
    try {
        const stats = await allQuery(
            `SELECT emotion, COUNT(*) as count FROM emotion_events 
       WHERE userId = ? 
       GROUP BY emotion`,
            [req.userId]
        );

        // Format response
        const formatted = {};
        stats.forEach(row => {
            formatted[row.emotion] = row.count;
        });

        // Ensure all emotions are present
        const emotions = ['happy', 'sad', 'angry', 'neutral'];
        emotions.forEach(emotion => {
            if (!formatted[emotion]) {
                formatted[emotion] = 0;
            }
        });

        res.json(formatted);
    } catch (error) {
        console.error('Error getting stats:', error);
        res.status(500).json({ error: 'Failed to get statistics' });
    }
});

// Get session history
router.get('/sessions', async (req, res) => {
    try {
        const sessions = await allQuery(
            `SELECT * FROM sessions 
       WHERE userId = ? 
       ORDER BY startedAt DESC 
       LIMIT 10`,
            [req.userId]
        );

        res.json(sessions);
    } catch (error) {
        console.error('Error getting sessions:', error);
        res.status(500).json({ error: 'Failed to get sessions' });
    }
});

// Start a new session
router.post('/session/start', async (req, res) => {
    try {
        const sessionId = generateId();

        await runQuery(
            'INSERT INTO sessions (id, userId) VALUES (?, ?)',
            [sessionId, req.userId]
        );

        res.status(201).json({ sessionId });
    } catch (error) {
        console.error('Error starting session:', error);
        res.status(500).json({ error: 'Failed to start session' });
    }
});

// End a session
router.post('/session/:sessionId/end', async (req, res) => {
    try {
        const { sessionId } = req.params;

        await runQuery(
            'UPDATE sessions SET endedAt = CURRENT_TIMESTAMP WHERE id = ? AND userId = ?',
            [sessionId, req.userId]
        );

        res.json({ message: 'Session ended' });
    } catch (error) {
        console.error('Error ending session:', error);
        res.status(500).json({ error: 'Failed to end session' });
    }
});

module.exports = router;
