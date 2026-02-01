const express = require('express');
const crypto = require('crypto');
const whoopClient = require('../lib/whoopClient');
const router = express.Router();

// Generate secure state parameter
function generateState() {
    return crypto.randomBytes(16).toString('hex');
}

// WHOOP OAuth endpoints
const WHOOP_AUTH_URL = 'https://api.prod.whoop.com/oauth/oauth2/auth';
const WHOOP_TOKEN_URL = 'https://api.prod.whoop.com/oauth/oauth2/token';

// Scopes we need for the dashboard
const SCOPES = [
    'read:recovery',
    'read:cycles', 
    'read:workout',
    'read:sleep',
    'read:profile',
    'read:body_measurement'
].join(' ');

// Initiate WHOOP OAuth flow
router.get('/whoop', (req, res) => {
    const state = generateState();
    
    // Store state for verification
    req.session = { state };
    
    const authUrl = new URL(WHOOP_AUTH_URL);
    authUrl.searchParams.append('client_id', process.env.WHOOP_CLIENT_ID);
    authUrl.searchParams.append('response_type', 'code');
    authUrl.searchParams.append('scope', SCOPES);
    authUrl.searchParams.append('redirect_uri', process.env.WHOOP_REDIRECT_URI);
    authUrl.searchParams.append('state', state);
    
    console.log('Redirecting to WHOOP auth:', authUrl.toString());
    res.redirect(authUrl.toString());
});

// Handle OAuth callback
router.get('/callback', async (req, res) => {
    const { code, state, error } = req.query;
    
    if (error) {
        console.error('OAuth error:', error);
        return res.status(400).send(`Authentication error: ${error}`);
    }
    
    if (!code) {
        return res.status(400).send('Missing authorization code');
    }
    
    // Verify state (in production, check against session)
    if (!state) {
        return res.status(400).send('Missing state parameter');
    }
    
    try {
        // Exchange code for tokens
        const tokenResponse = await fetch(WHOOP_TOKEN_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                grant_type: 'authorization_code',
                code: code,
                client_id: process.env.WHOOP_CLIENT_ID,
                client_secret: process.env.WHOOP_CLIENT_SECRET,
                redirect_uri: process.env.WHOOP_REDIRECT_URI
            })
        });
        
        if (!tokenResponse.ok) {
            throw new Error(`Token exchange failed: ${tokenResponse.status}`);
        }
        
        const tokens = await tokenResponse.json();
        
        // Store tokens using WHOOP client
        const userId = 'default'; // In production, get from user session
        whoopClient.setToken(userId, {
            access_token: tokens.access_token,
            refresh_token: tokens.refresh_token,
            expires_at: Date.now() + (tokens.expires_in * 1000)
        });
        
        console.log('OAuth successful, tokens stored');
        
        // Redirect to dashboard
        res.redirect('/dashboard.html?connected=true');
        
    } catch (error) {
        console.error('Token exchange error:', error);
        res.status(500).send('Failed to complete authentication');
    }
});

// Get current auth status
router.get('/status', (req, res) => {
    const userId = 'default';
    const tokens = whoopClient.getToken(userId);
    
    if (!tokens || Date.now() > tokens.expires_at) {
        return res.json({ authenticated: false });
    }
    
    res.json({ authenticated: true });
});

// Revoke access
router.post('/revoke', (req, res) => {
    const userId = 'default';
    whoopClient.setToken(userId, null);
    res.json({ success: true, message: 'Access revoked' });
});

module.exports = router;