const express = require('express');
const { getQuery, runQuery, allQuery } = require('../db/database');

const generateId = () => Math.random().toString(36).substr(2, 9);
const router = express.Router();

// Get user preferences
router.get('/preferences', async (req, res) => {
    try {
        const preferences = await getQuery(
            'SELECT * FROM user_preferences WHERE userId = ?',
            [req.userId]
        );

        if (!preferences) {
            return res.status(404).json({ error: 'Preferences not found' });
        }

        res.json(preferences);
    } catch (error) {
        res.status(500).json({ error: 'Failed to get preferences' });
    }
});

// Update user preferences
router.patch('/preferences', async (req, res) => {
    try {
        const { volume, sensitivity, audioEnabled, cameraEnabled } = req.body;

        const updates = [];
        const params = [];

        if (volume !== undefined) {
            updates.push('volume = ?');
            params.push(volume);
        }
        if (sensitivity !== undefined) {
            updates.push('sensitivity = ?');
            params.push(sensitivity);
        }
        if (audioEnabled !== undefined) {
            updates.push('audioEnabled = ?');
            params.push(audioEnabled ? 1 : 0);
        }
        if (cameraEnabled !== undefined) {
            updates.push('cameraEnabled = ?');
            params.push(cameraEnabled ? 1 : 0);
        }

        if (updates.length === 0) {
            return res.status(400).json({ error: 'No preferences to update' });
        }

        updates.push('updatedAt = CURRENT_TIMESTAMP');
        params.push(req.userId);

        await runQuery(
            `UPDATE user_preferences SET ${updates.join(', ')} WHERE userId = ?`,
            params
        );

        // Fetch updated preferences
        const user = await getQuery('SELECT id, email FROM users WHERE id = ?', [req.userId]);
        res.json({
            id: user.id,
            email: user.email,
            createdAt: user.createdAt,
        });
    } catch (error) {
        console.error('Error updating preferences:', error);
        res.status(500).json({ error: 'Failed to update preferences' });
    }
});

module.exports = router;
