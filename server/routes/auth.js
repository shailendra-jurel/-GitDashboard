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
  passport.authenticate('github', { 
    failureRedirect: `${process.env.CLIENT_URL || 'https://git-dashboard-rho.vercel.app'}/login?error=auth_failed`,
    session: false
  }),
  (req, res) => {
    try {
      // Generate JWT token
      const token = jwt.sign(
        { 
          id: req.user.id, 
          username: req.user.username, 
          github_token: req.user.github_token 
        },
        process.env.JWT_SECRET || 'github-dashboard-jwt-secret',
        { expiresIn: '24h' }
      );
      
      // Redirect to frontend with token
      res.redirect(`${(process.env.CLIENT_URL || 'https://git-dashboard-rho.vercel.app').replace(/\/$/, '')}/auth/callback?token=${token}`); 
    } catch (error) {
      console.error('Token generation error:', error);
      res.redirect(`${process.env.CLIENT_URL || 'https://git-dashboard-rho.vercel.app'}/login?error=token_generation_failed`);
    }
  }
);

// Handle frontend OAuth flow with code
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
    
    const { access_token } = tokenResponse.data; // shailendraF
    
    if (!access_token) {  // shailendraF
      return res.status(400).json({ error: 'Failed to obtain access token' });
    }
    
    // Get user profile
    const userResponse = await axios.get('https://api.github.com/user', {
      headers: {
        Authorization: `token ${access_token}`// shailendraF
      }
    });
    
    const user = {
      id: userResponse.data.id,
      login: userResponse.data.login,
      avatarUrl: userResponse.data.avatar_url,
      name: userResponse.data.name || userResponse.data.login,
      github_token: access_token // shailendraF
    };
    
    // Create JWT token
    const token = jwt.sign(
      { id: user.id, login: user.login, github_token: access_token }, // shailendraF
      process.env.JWT_SECRET || 'your-jwt-secret-key',
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
  
  if (!token) {
    return res.status(401).json({ error: 'Bearer token required' });
  }
  
  jwt.verify(token, process.env.JWT_SECRET || 'your-jwt-secret-key', (err, decoded) => {
    if (err) {
      console.error('Token verification error:', err.message);
      return res.status(401).json({ error: 'Invalid token' });
    }
    
    res.json({ 
      valid: true, 
      user: {
        id: decoded.id,
        username: decoded.username || decoded.login
      }
    });
  });
});

// Get user data
router.get('/user', authenticateJWT, async (req, res) => {
  try {
    const { github_token } = req.user;
    
    if (!github_token) {
      return res.status(400).json({ error: 'GitHub token not found' });
    }
    
    const userResponse = await axios.get('https://api.github.com/user', {
      headers: {
        Authorization: `token ${github_token}`
      }
    });
    
    const userData = {
      id: userResponse.data.id,
      login: userResponse.data.login,
      name: userResponse.data.name || userResponse.data.login,
      avatarUrl: userResponse.data.avatar_url,
      htmlUrl: userResponse.data.html_url,
      email: userResponse.data.email
    };
    
    res.json(userData);
  } catch (error) {
    console.error('Error fetching user data:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to fetch user data' });
  }
});

// Logout route
router.post('/logout', (req, res) => {
  if (req.logout) {
    req.logout(function(err) {
      if (err) {
        return res.status(500).json({ error: 'Logout failed', details: err.message });
      }
      res.json({ success: true });
    });
  } else {
    res.json({ success: true });
  }
});

// Middleware function to authenticate JWT token
function authenticateJWT(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: 'Authorization header required' });
  }

  const token = authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Bearer token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'your-jwt-secret-key', (err, user) => {
    if (err) {
      console.error('JWT verification error:', err.message);
      return res.status(403).json({ error: 'Invalid or expired token' });
    }

    req.user = user;
    next();
  });
}

module.exports = router;