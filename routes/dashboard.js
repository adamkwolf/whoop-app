const express = require('express');
const whoopClient = require('../lib/whoopClient');
const router = express.Router();

// Middleware to check authentication
function requireAuth(req, res, next) {
    const userId = 'default';
    const tokenData = whoopClient.getToken(userId);
    
    if (!tokenData || Date.now() > tokenData.expires_at) {
        return res.status(401).json({ error: 'Authentication required' });
    }
    
    next();
}

// Get user profile
router.get('/profile', requireAuth, async (req, res) => {
    try {
        const profile = await whoopClient.getProfile();
        res.json(profile);
    } catch (error) {
        console.error('Profile API error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get body measurements
router.get('/body', requireAuth, async (req, res) => {
    try {
        const body = await whoopClient.getBodyMeasurement();
        res.json(body);
    } catch (error) {
        console.error('Body measurement API error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get recent recovery data
router.get('/recovery', requireAuth, async (req, res) => {
    try {
        const recovery = await whoopClient.getRecovery();
        res.json(recovery);
    } catch (error) {
        console.error('Recovery API error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get recent cycles (strain data)
router.get('/cycles', requireAuth, async (req, res) => {
    try {
        const cycles = await whoopClient.getCycles();
        res.json(cycles);
    } catch (error) {
        console.error('Cycles API error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get recent workouts
router.get('/workouts', requireAuth, async (req, res) => {
    try {
        const workouts = await whoopClient.getWorkouts();
        res.json(workouts);
    } catch (error) {
        console.error('Workouts API error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get dashboard summary data
router.get('/dashboard', requireAuth, async (req, res) => {
    try {
        const dashboardData = await whoopClient.getDashboardData();
        res.json(dashboardData);
    } catch (error) {
        console.error('Dashboard API error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Check authentication status
router.get('/auth/status', (req, res) => {
    const userId = 'default';
    const tokenData = whoopClient.getToken(userId);

    if (!tokenData || Date.now() > tokenData.expires_at) {
        return res.json({ authenticated: false });
    }

    res.json({ authenticated: true });
});

// Get access token for external use
router.get('/token', requireAuth, (req, res) => {
    const userId = 'default';
    const tokenData = whoopClient.getToken(userId);

    res.json({
        access_token: tokenData.access_token,
        expires_at: tokenData.expires_at,
        expires_in_seconds: Math.max(0, Math.floor((tokenData.expires_at - Date.now()) / 1000))
    });
});

module.exports = router;