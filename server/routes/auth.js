// routes/auth.js
const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const router = express.Router();

// GitHub OAuth login route
router.get('/github', passport.authenticate('github', { scope: ['user', 'repo'] }));

// GitHub OAuth callback route
router.get('/github/callback', 
  passport.authenticate('github', { failureRedirect: `${process.env.CLIENT_URL || 'http://localhost:5173'}/login?error=auth_failed` }),
  (req, res) => {
    // Generate JWT token
    const token = jwt.sign(
      { id: req.user.id, username: req.user.username, githubToken: req.user.githubToken },
      process.env.JWT_SECRET || 'github-dashboard-jwt-secret',
      { expiresIn: '24h' }
    );
    
    // Redirect to frontend with token
    res.redirect(`${process.env.CLIENT_URL || 'http://localhost:5173'}/auth/callback?token=${token}`);
  }
);

// Handle frontend OAuth flow with code :::
//  this is helpful for the frontend to get the token and user data with the code so that the frontend can store the token in local storage and use it for future requests
router.post('/callback', async (req, res) => {
  const { code } = req.body;
  
  if (!code) {
    return res.status(400).json({ error: 'Authorization code is required' });
  }
  
  try {
    // Exchange code for access token
    const tokenResponse = await axios.post(
      'https://github.com/login/oauth/access_token',
      {
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code
      },
      {
        headers: {
          Accept: 'application/json'
        }
      }
    );
    
    const { access_token } = tokenResponse.data;
    
    if (!access_token) {
      return res.status(400).json({ error: 'Failed to obtain access token' });
    }
    
    // Get user profile
    const userResponse = await axios.get('https://api.github.com/user', {
      headers: {
        Authorization: `token ${access_token}`
      }
    });
    
    const user = {
      id: userResponse.data.id,
      login: userResponse.data.login,
      avatarUrl: userResponse.data.avatar_url,
      name: userResponse.data.name,
      githubToken: access_token
    };
    
    // Create JWT token
    const token = jwt.sign(
      { id: user.id, login: user.login, githubToken: access_token },
      process.env.JWT_SECRET || 'github-dashboard-jwt-secret',
      { expiresIn: '1d' }
    );
    
    return res.json({ token, user });
  } catch (error) {
    console.error('OAuth error:', error.response?.data || error.message);
    return res.status(500).json({ error: 'Failed to authenticate with GitHub' });
  }
});

// Verify token endpoint
router.get('/verify', (req, res) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return res.status(401).json({ error: 'No token provided' });
  }
  
  const token = authHeader.split(' ')[1];
  
  jwt.verify(token, process.env.JWT_SECRET || 'github-dashboard-jwt-secret', (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    
    res.json({ valid: true, user: {
      id: decoded.id,
      username: decoded.username
    }});
  });
});

// Get user data
router.get('/user', authenticateJWT, async (req, res) => {
  try {
    const { githubToken } = req.user;
    
    const userResponse = await axios.get('https://api.github.com/user', {
      headers: {
        Authorization: `token ${githubToken}`
      }
    });
    
    const userData = {
      id: userResponse.data.id,
      login: userResponse.data.login,
      name: userResponse.data.name,
      avatarUrl: userResponse.data.avatar_url,
      htmlUrl: userResponse.data.html_url,
      email: userResponse.data.email
    };
    
    res.json(userData);
  } catch (error) {
    console.error('Error fetching user data:', error);
    res.status(500).json({ error: 'Failed to fetch user data' });
  }
});

// Logout route
router.post('/logout', (req, res) => {
  req.logout();
  res.json({ success: true });
});

// Middleware function to authenticate JWT token
function authenticateJWT(req, res, next) {
  const authHeader = req.headers.authorization;

  if (authHeader) {
    const token = authHeader.split(' ')[1];

    jwt.verify(token, process.env.JWT_SECRET || 'github-dashboard-jwt-secret', (err, user) => {
      if (err) {
        return res.status(403).json({ error: 'Invalid or expired token' });
      }

      req.user = user;
      next();
    });
  } else {
    res.status(401).json({ error: 'Authorization header required' });
  }
}

module.exports = router;