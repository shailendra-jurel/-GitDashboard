// routes/repositories.js
const express = require('express');
const axios = require('axios');
const router = express.Router();

// Get all repositories for the user
router.get('/', async (req, res) => {
  try {
    const { githubToken } = req.user;
    
    // Fetch user's repositories
    const response = await axios.get('https://api.github.com/user/repos', {
      headers: {
        Authorization: `token ${githubToken}`
      },
      params: {
        per_page: 100,
        sort: 'updated',
        direction: 'desc'
      }
    });
    
    // Format repository data
    const repositories = response.data.map(repo => ({
      id: repo.id,
      name: repo.name,
      fullName: repo.full_name,
      description: repo.description,
      language: repo.language,
      visibility: repo.private ? 'private' : 'public',
      isArchived: repo.archived,
      defaultBranch: repo.default_branch,
      htmlUrl: repo.html_url,
      createdAt: repo.created_at,
      updatedAt: repo.updated_at,
      pushedAt: repo.pushed_at,
      owner: {
        id: repo.owner.id,
        login: repo.owner.login,
        avatarUrl: repo.owner.avatar_url,
        htmlUrl: repo.owner.html_url
      }
    }));
    
    // Load selected repositories from user preferences (if implemented)
    // This is a simplification - in a real app, you'd store this in a database
    let selectedRepositories = [];
    if (req.session && req.session.selectedRepositories) {
      selectedRepositories = repositories.filter(repo => 
        req.session.selectedRepositories.includes(repo.id)
      );
    }
    
    res.json({ repositories, selectedRepositories });
  } catch (error) {
    console.error('Error fetching repositories:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to fetch repositories' });
  }
});

// Save selected repositories
router.post('/selected', (req, res) => {
  try {
    const { repositories } = req.body;
    
    if (!Array.isArray(repositories)) {
      return res.status(400).json({ error: 'Repositories must be an array' });
    }
    
    // Store selected repositories in session
    // In a real app, you'd store these in a database
    req.session.selectedRepositories = repositories.map(repo => repo.id);
    
    res.json({ success: true, repositories });
  } catch (error) {
    console.error('Error saving selected repositories:', error);
    res.status(500).json({ error: 'Failed to save selected repositories' });
  }
});

// Get repository details
router.get('/:owner/:repo', async (req, res) => {
  try {
    const { githubToken } = req.user;
    const { owner, repo } = req.params;
    
    // Fetch repository details
    const repoResponse = await axios.get(`https://api.github.com/repos/${owner}/${repo}`, {
      headers: {
        Authorization: `token ${githubToken}`
      }
    });
    
    const repository = {
      id: repoResponse.data.id,
      name: repoResponse.data.name,
      fullName: repoResponse.data.full_name,
      description: repoResponse.data.description,
      language: repoResponse.data.language,
      visibility: repoResponse.data.private ? 'private' : 'public',
      isArchived: repoResponse.data.archived,
      defaultBranch: repoResponse.data.default_branch,
      htmlUrl: repoResponse.data.html_url,
      createdAt: repoResponse.data.created_at,
      updatedAt: repoResponse.data.updated_at,
      pushedAt: repoResponse.data.pushed_at,
      forksCount: repoResponse.data.forks_count,
      stargazersCount: repoResponse.data.stargazers_count,
      watchersCount: repoResponse.data.watchers_count,
      openIssuesCount: repoResponse.data.open_issues_count,
      owner: {
        id: repoResponse.data.owner.id,
        login: repoResponse.data.owner.login,
        avatarUrl: repoResponse.data.owner.avatar_url,
        htmlUrl: repoResponse.data.owner.html_url
      }
    };
    
    res.json(repository);
  } catch (error) {
    console.error('Error fetching repository details:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to fetch repository details' });
  }
});

// Get contributors for a repository
router.get('/:owner/:repo/contributors', async (req, res) => {
  try {
    const { githubToken } = req.user;
    const { owner, repo } = req.params;
    
    // Fetch contributors
    const response = await axios.get(`https://api.github.com/repos/${owner}/${repo}/contributors`, {
      headers: {
        Authorization: `token ${githubToken}`
      },
      params: {
        per_page: 100
      }
    });
    
    const contributors = response.data.map(contributor => ({
      id: contributor.id,
      login: contributor.login,
      avatarUrl: contributor.avatar_url,
      htmlUrl: contributor.html_url,
      contributions: contributor.contributions
    }));
    
    res.json(contributors);
  } catch (error) {
    console.error('Error fetching contributors:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to fetch contributors' });
  }
});

module.exports = router;