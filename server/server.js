// server.js
const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const axios = require('axios');
const session = require('express-session');
const passport = require('passport');
const GitHubStrategy = require('passport-github2').Strategy;
const jwt = require('jsonwebtoken');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Set up allowed origins - expanded to be more flexible
const allowedOrigins = [
  'https://git-dashboard-rho.vercel.app',
  'https://git-dashboard.vercel.app',
  process.env.CLIENT_URL,
  'http://localhost:5173',
  'http://localhost:3000',
  'https://gitdashboard.onrender.com'
];

// Middleware
app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Check if the origin is allowed or if it's a subdomain of an allowed domain
    const isAllowed = allowedOrigins.some(allowedOrigin => {
      return origin === allowedOrigin || origin.endsWith(`.${allowedOrigin.replace(/^https?:\/\//, '')}`);
    });
    
    if (!isAllowed) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      console.warn(`CORS blocked for origin: ${origin}`);
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session config
app.use(session({
  secret: process.env.SESSION_SECRET || 'github-dashboard-session-secret',
  resave: false,
  saveUninitialized: false
}));

// Initialize passport
app.use(passport.initialize());
app.use(passport.session());

// Enhanced logging for GitHub callback URL
const callbackURL = process.env.GITHUB_CALLBACK_URL || 'https://gitdashboard.onrender.com/api/auth/github/callback';
console.log('Using GitHub callback URL:', callbackURL);

// Passport GitHub strategy
passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: callbackURL,
    scope: ['user', 'repo']
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      console.log('GitHub authentication successful for user:', profile.username);
      // Store GitHub access token with the user profile using consistent naming
      const user = {
        id: profile.id,
        username: profile.username,
        displayName: profile.displayName || profile.username,
        avatarUrl: profile._json.avatar_url,
        githubToken: accessToken // This will be mapped to github_token in the JWT
      };
      
      return done(null, user);
    } catch (error) {
      console.error('GitHub authentication error:', error);
      return done(error, null);
    }
  }
));

// Serialize and deserialize user for sessions
passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

// Verify JWT token middleware
const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: 'Authorization header required' });
  }

  const token = authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Bearer token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'github-dashboard-jwt-secret', (err, user) => {
    if (err) {
      console.error('JWT verification error:', err.message);
      return res.status(403).json({ error: 'Invalid or expired token' });
    }

    req.user = user;
    next();
  });
};

// Import routes
const authRoutes = require('./routes/auth');
const repositoryRoutes = require('./routes/repositories');
const dashboardRoutes = require('./routes/dashboard');

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/repositories', authenticateJWT, repositoryRoutes);
app.use('/api/dashboard', authenticateJWT, dashboardRoutes);

// Pre-flight options for CORS
app.options('*', cors());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Debug route to check environment variables
app.get('/api/debug/env', (req, res) => {
  res.json({
    nodeEnv: process.env.NODE_ENV,
    clientUrl: process.env.CLIENT_URL,
    githubCallbackUrl: process.env.GITHUB_CALLBACK_URL,
    allowedOrigins
  });
});

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'client/build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
  });
}

// Global error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err.stack);
  res.status(500).json({ error: 'Server error occurred', message: err.message });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`NODE_ENV: ${process.env.NODE_ENV}`);
  console.log(`CLIENT_URL: ${process.env.CLIENT_URL}`);
});

module.exports = app;