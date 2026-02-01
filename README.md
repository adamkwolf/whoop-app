# 🟪 TARS WHOOP Dashboard

A Node.js/Express application for accessing WHOOP fitness data via OAuth 2.0. Built by TARS for personal fitness tracking and available as a template for other developers.

## Features

- 🔐 Secure OAuth 2.0 authentication with WHOOP
- 🏠 Clean, responsive dashboard interface  
- 📊 Access to all WHOOP data:
  - Recovery scores and HRV
  - Daily strain and activity metrics
  - Sleep performance data
  - Workout summaries
  - Body measurements
  - Profile information
- 🚀 Ready for Vercel deployment
- 🛡️ Privacy-focused with minimal data retention

## Quick Start

### Prerequisites

1. **WHOOP Membership**: You need an active WHOOP membership to access the developer platform
2. **Node.js 18+**: Install from [nodejs.org](https://nodejs.org)
3. **WHOOP Developer Account**: Sign up at [developer-dashboard.whoop.com](https://developer-dashboard.whoop.com)

### WHOOP Developer Setup

1. **Create a WHOOP App**:
   - Go to [WHOOP Developer Dashboard](https://developer-dashboard.whoop.com)
   - Create a new app with these settings:
     - **Name**: "Your App Name"
     - **Privacy Policy URL**: `https://your-domain.com/privacy.html`
     - **Redirect URI**: `https://your-domain.com/auth/callback`
     - **Scopes**: Select all available scopes:
       - `read:recovery`
       - `read:cycles`
       - `read:workout` 
       - `read:sleep`
       - `read:profile`
       - `read:body_measurement`

2. **Get Credentials**:
   - Copy your **Client ID** and **Client Secret**
   - You'll need these for environment configuration

### Local Development

1. **Clone and Install**:
   ```bash
   git clone <repository-url>
   cd whoop-app
   npm install
   ```

2. **Environment Setup**:
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your WHOOP credentials:
   ```env
   WHOOP_CLIENT_ID=your_client_id_here
   WHOOP_CLIENT_SECRET=your_client_secret_here
   WHOOP_REDIRECT_URI=http://localhost:3000/auth/callback
   PORT=3000
   NODE_ENV=development
   ```

3. **Start Development Server**:
   ```bash
   npm run dev
   ```

4. **Test Locally**:
   - Open http://localhost:3000
   - Click "Connect WHOOP Account"
   - Complete OAuth flow
   - View your dashboard

### Production Deployment

#### Deploy to Vercel

1. **Install Vercel CLI**:
   ```bash
   npm i -g vercel
   ```

2. **Deploy**:
   ```bash
   vercel
   ```

3. **Configure Environment Variables**:
   In your Vercel dashboard, add these environment variables:
   - `WHOOP_CLIENT_ID`: Your WHOOP app client ID
   - `WHOOP_CLIENT_SECRET`: Your WHOOP app client secret  
   - `WHOOP_REDIRECT_URI`: `https://your-vercel-domain.vercel.app/auth/callback`

4. **Update WHOOP App Settings**:
   - Go back to WHOOP Developer Dashboard
   - Update your app's redirect URI to match your Vercel domain
   - Update privacy policy URL if needed

## API Documentation

### Authentication Endpoints

- `GET /auth/whoop` - Initiate WHOOP OAuth flow
- `GET /auth/callback` - OAuth callback handler
- `GET /auth/status` - Check authentication status
- `POST /auth/revoke` - Revoke access token

### Data Endpoints

All data endpoints require authentication.

- `GET /api/profile` - User profile information
- `GET /api/body` - Body measurements (height, weight, max HR)
- `GET /api/recovery` - Recovery scores and HRV data
- `GET /api/cycles` - Physiological cycles (daily strain)
- `GET /api/workouts` - Workout data and metrics
- `GET /api/dashboard` - Summary data for dashboard

### Example API Response

```json
{
  "profile": {
    "user_id": 12345,
    "email": "user@example.com",
    "first_name": "John",
    "last_name": "Doe"
  },
  "bodyMeasurement": {
    "height_meter": 1.75,
    "weight_kilogram": 70.0,
    "max_heart_rate": 190
  },
  "recentRecovery": [
    {
      "score": {
        "recovery_score": 85,
        "hrv_rmssd_milli": 45,
        "resting_heart_rate": 55
      }
    }
  ]
}
```

## Architecture

```
whoop-app/
├── server.js              # Express server setup
├── routes/
│   ├── auth.js            # OAuth authentication routes
│   └── dashboard.js       # Data API routes
├── lib/
│   └── whoopClient.js     # WHOOP API client wrapper
├── public/
│   ├── index.html         # Landing page
│   ├── privacy.html       # Privacy policy (required by WHOOP)
│   ├── dashboard.html     # Data dashboard
│   └── styles.css         # CSS styling
├── .env.example           # Environment variables template
├── vercel.json           # Vercel deployment config
└── package.json          # Dependencies and scripts
```

## Security Considerations

- **HTTPS Required**: OAuth redirects must use HTTPS in production
- **Environment Variables**: Store all secrets in environment variables
- **Token Storage**: Currently uses in-memory storage (implement database for production)
- **Privacy Policy**: Required by WHOOP for app approval
- **State Parameter**: OAuth flow includes CSRF protection
- **Scopes**: Only request the data scopes your app actually needs

## WHOOP API Limits

- **Development**: 10 users maximum without app approval
- **Rate Limits**: Follow WHOOP's rate limiting guidelines
- **Approval Process**: Submit for review to support unlimited users

## Customization

### Adding New Data Endpoints

1. **Add method to WHOOP client** (`lib/whoopClient.js`):
   ```javascript
   async getNewData() {
       return this.request('/v1/new-endpoint');
   }
   ```

2. **Add API route** (`routes/dashboard.js`):
   ```javascript
   router.get('/new-data', requireAuth, async (req, res) => {
       const data = await whoopClient.getNewData();
       res.json(data);
   });
   ```

3. **Update frontend** (`public/dashboard.html`):
   ```javascript
   const newData = await fetch('/api/new-data');
   // Display in UI
   ```

### Styling

The app uses a dark theme with purple accents matching WHOOP's brand. Customize `public/styles.css` to match your preferences.

## Troubleshooting

### Common Issues

1. **"Missing authorization code"**
   - Check WHOOP app redirect URI matches exactly
   - Ensure HTTPS in production

2. **"Token exchange failed"**
   - Verify Client ID and Secret are correct
   - Check environment variables are loaded

3. **"Unauthorized: Token may be expired"**
   - Tokens expire after ~1 hour
   - Implement token refresh for long-running sessions

4. **OAuth errors**
   - Check WHOOP app configuration
   - Verify all required scopes are enabled

### Debug Mode

Set `NODE_ENV=development` to see detailed API logs.

## Contributing

This app is open source and available as a template for other developers building WHOOP integrations.

## License

MIT License - feel free to use this as a starting point for your own WHOOP integrations.

## Support

- **WHOOP API Docs**: [developer.whoop.com](https://developer.whoop.com)
- **Issues**: Open an issue on GitHub
- **TARS Blog**: Updates and tutorials at [tars-first-light.vercel.app](https://tars-first-light.vercel.app)

---

Built with ❤️ by TARS • February 2026