class WhoopClient {
    constructor() {
        this.baseURL = 'https://api.prod.whoop.com/developer';
        this.tokenStore = {}; // In production, this should be a proper database
    }

    // Get stored token for user
    getToken(userId = 'default') {
        return this.tokenStore[userId];
    }

    // Store token for user
    setToken(userId = 'default', tokenData) {
        this.tokenStore[userId] = tokenData;
    }

    // Make authenticated request to WHOOP API
    async request(endpoint, options = {}) {
        const userId = 'default';
        const tokenData = this.getToken(userId);

        if (!tokenData || Date.now() > tokenData.expires_at) {
            throw new Error('No valid access token available');
        }

        const url = `${this.baseURL}${endpoint}`;
        const defaultOptions = {
            headers: {
                'Authorization': `Bearer ${tokenData.access_token}`,
                'Content-Type': 'application/json',
                ...options.headers
            }
        };

        const response = await fetch(url, { ...defaultOptions, ...options });

        if (!response.ok) {
            if (response.status === 401) {
                throw new Error('Unauthorized: Token may be expired');
            }
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        return response.json();
    }

    // Get user profile information
    async getProfile() {
        return this.request('/v2/user/profile/basic');
    }

    // Get user body measurements
    async getBodyMeasurement() {
        return this.request('/v2/user/measurement/body');
    }

    // Get physiological cycles (daily strain data)
    async getCycles(startDate, endDate, limit = 10) {
        const params = new URLSearchParams();
        if (startDate) params.append('start', startDate);
        if (endDate) params.append('end', endDate);
        params.append('limit', limit.toString());

        return this.request(`/v2/cycle?${params.toString()}`);
    }

    // Get sleep data for a specific cycle
    async getSleepForCycle(cycleId) {
        return this.request(`/v2/cycle/${cycleId}/sleep`);
    }

    // Get recovery data
    async getRecovery(startDate, endDate, limit = 10) {
        const params = new URLSearchParams();
        if (startDate) params.append('start', startDate);
        if (endDate) params.append('end', endDate);
        params.append('limit', limit.toString());

        return this.request(`/v2/recovery?${params.toString()}`);
    }

    // Get workout data
    async getWorkouts(startDate, endDate, limit = 10) {
        const params = new URLSearchParams();
        if (startDate) params.append('start', startDate);
        if (endDate) params.append('end', endDate);
        params.append('limit', limit.toString());

        return this.request(`/v2/activity/workout?${params.toString()}`);
    }

    // Get sleep data
    async getSleep(startDate, endDate, limit = 10) {
        const params = new URLSearchParams();
        if (startDate) params.append('start', startDate);
        if (endDate) params.append('end', endDate);
        params.append('limit', limit.toString());

        return this.request(`/v2/activity/sleep?${params.toString()}`);
    }

    // Get recent summary data for dashboard
    async getDashboardData() {
        try {
            const [profile, bodyMeasurement, cycles, recovery] = await Promise.all([
                this.getProfile(),
                this.getBodyMeasurement(),
                this.getCycles(null, null, 7), // Last 7 cycles
                this.getRecovery(null, null, 7) // Last 7 recovery scores
            ]);

            return {
                profile,
                bodyMeasurement,
                recentCycles: cycles.records || [],
                recentRecovery: recovery.records || []
            };
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            throw error;
        }
    }

    // Refresh access token using refresh token
    async refreshToken(userId = 'default') {
        const tokenData = this.getToken(userId);
        
        if (!tokenData?.refresh_token) {
            throw new Error('No refresh token available');
        }

        const response = await fetch('https://api.prod.whoop.com/oauth/oauth2/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                grant_type: 'refresh_token',
                refresh_token: tokenData.refresh_token,
                client_id: process.env.WHOOP_CLIENT_ID,
                client_secret: process.env.WHOOP_CLIENT_SECRET,
                scope: 'offline'
            })
        });

        if (!response.ok) {
            throw new Error(`Token refresh failed: ${response.status}`);
        }

        const newTokens = await response.json();
        
        // Update stored tokens
        this.setToken(userId, {
            access_token: newTokens.access_token,
            refresh_token: newTokens.refresh_token,
            expires_at: Date.now() + (newTokens.expires_in * 1000)
        });

        return newTokens;
    }
}

module.exports = new WhoopClient();