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

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://git-dashboard-rho.vercel.app', 'https://git-dashboard-rho.vercel.app/'] // Update with your actual Vercel domain
    : 'https://git-dashboard-rho.vercel.app/',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session config
app.use(session({
  secret: process.env.SESSION_SECRET || 'github-dashboard-secret',
  resave: false,
  saveUninitialized: false
}));

// Initialize passport
app.use(passport.initialize());
app.use(passport.session());

// Passport GitHub strategy
passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL:`${process.env.CLIENT_URL || 'https://git-dashboard-rho.vercel.app'}/api/auth/github/callback` ,// Fixed callback URL to match route
    
    scope: ['user', 'repo']
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      // Store GitHub access token with the user profile
      const user = {
        id: profile.id,
        username: profile.username,
        displayName: profile.displayName || profile.username,
        avatarUrl: profile._json.avatar_url,
        githubToken: accessToken
      };
      
      return done(null, user);
    } catch (error) {
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
  res.status(500).json({ error: 'Server error occurred' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;