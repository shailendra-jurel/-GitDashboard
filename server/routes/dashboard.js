// routes/dashboard.js
const express = require('express');
const axios = require('axios');
const router = express.Router();

// GitHub API date format helper
const formatDate = (date) => {
  return date.toISOString().split('T')[0];
};

// Get time range based on filter
const getTimeRange = (filter) => {
  const now = new Date();
  let startDate = new Date();
  
  switch (filter) {
    case '1w':
      startDate.setDate(now.getDate() - 7);
      break;
    case '1m':
      startDate.setMonth(now.getMonth() - 1);
      break;
    case '3m':
      startDate.setMonth(now.getMonth() - 3);
      break;
    case '6m':
      startDate.setMonth(now.getMonth() - 6);
      break;
    case '1y':
      startDate.setFullYear(now.getFullYear() - 1);
      break;
    default:
      startDate.setMonth(now.getMonth() - 3); // Default to 3 months
  }
  
  return {
    startDate: formatDate(startDate),
    endDate: formatDate(now)
  };
};

// Get repository metrics
router.get('/:owner/:repo/metrics', async (req, res) => {
  try {
    const { githubToken } = req.user;
    const { owner, repo } = req.params;
    const { timeRange = '3m' } = req.query;
    
    const { startDate, endDate } = getTimeRange(timeRange);
    
    // Fetch pull requests
    const pullRequestsResponse = await axios.get(
      `https://api.github.com/repos/${owner}/${repo}/pulls`,
      {
        headers: {
          Authorization: `token ${githubToken}`
        },
        params: {
          state: 'all',
          sort: 'created',
          direction: 'desc',
          per_page: 100
        }
      }
    );
    
    // Fetch merged pull requests
    const mergedPRsQuery = `repo:${owner}/${repo} is:pr is:merged merged:${startDate}..${endDate}`;
    const mergedPRsResponse = await axios.get(
      'https://api.github.com/search/issues',
      {
        headers: {
          Authorization: `token ${githubToken}`,
          Accept: 'application/vnd.github.v3+json'
        },
        params: {
          q: mergedPRsQuery,
          per_page: 100
        }
      }
    );
    
    // Get detailed PR data for time calculations
    const prDetails = [];
    for (const pr of mergedPRsResponse.data.items.slice(0, 15)) { // Limit to 15 to avoid rate limits
      try {
        const prDetailResponse = await axios.get(
          pr.pull_request.url,
          {
            headers: {
              Authorization: `token ${githubToken}`
            }
          }
        );
        prDetails.push(prDetailResponse.data);
      } catch (err) {
        console.error(`Error fetching PR detail for PR #${pr.number}:`, err.message);
      }
    }
    
    // Calculate metrics
    const pullRequests = pullRequestsResponse.data;
    const mergedPRs = mergedPRsResponse.data.items;
    
    // Calculate time to merge
    const timeToMergeData = prDetails
      .filter(pr => pr.merged_at)
      .map(pr => {
        const createdAt = new Date(pr.created_at);
        const mergedAt = new Date(pr.merged_at);
        const timeToMergeHours = (mergedAt - createdAt) / (1000 * 60 * 60);
        
        return {
          prNumber: pr.number,
          title: pr.title,
          author: pr.user.login,
          createdAt: pr.created_at,
          mergedAt: pr.merged_at,
          timeToMergeHours: timeToMergeHours
        };
      });
    
    // Calculate average time to merge
    const avgTimeToMerge = timeToMergeData.length > 0
      ? timeToMergeData.reduce((sum, pr) => sum + pr.timeToMergeHours, 0) / timeToMergeData.length
      : 0;
    
    // Group PRs by week/month
    const prsByWeek = {};
    const weekMs = 7 * 24 * 60 * 60 * 1000;
    
    mergedPRs.forEach(pr => {
      const mergedAt = new Date(pr.closed_at); // Using closed_at as an approximation
      const weekStart = new Date(Math.floor(mergedAt.getTime() / weekMs) * weekMs);
      const weekKey = formatDate(weekStart);
      
      if (!prsByWeek[weekKey]) {
        prsByWeek[weekKey] = {
          week: weekKey,
          count: 0,
          authors: {}
        };
      }
      
      prsByWeek[weekKey].count++;
      
      // Track author
      const author = pr.user.login;
      if (!prsByWeek[weekKey].authors[author]) {
        prsByWeek[weekKey].authors[author] = 0;
      }
      prsByWeek[weekKey].authors[author]++;
    });
    
    // Format data for charts
    const prTrendData = Object.values(prsByWeek).sort((a, b) => a.week.localeCompare(b.week));
    
    // Get contributor-specific data
    const contributorData = {};
    
    mergedPRs.forEach(pr => {
      const author = pr.user.login;
      if (!contributorData[author]) {
        contributorData[author] = {
          login: author,
          avatarUrl: pr.user.avatar_url,
          totalPRs: 0,
          mergedPRs: 0
        };
      }
      
      contributorData[author].totalPRs++;
      contributorData[author].mergedPRs++;
    });
    
    // Format data for response
    const metrics = {
      summary: {
        totalPRs: pullRequests.length,
        mergedPRs: mergedPRs.length,
        avgTimeToMergeHours: avgTimeToMerge
      },
      trends: {
        prsByWeek: prTrendData
      },
      contributors: Object.values(contributorData).sort((a, b) => b.totalPRs - a.totalPRs),
      timeToMerge: timeToMergeData
    };
    
    res.json(metrics);
  } catch (error) {
    console.error('Error fetching repository metrics:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to fetch repository metrics' });
  }
});

// Get branch activity
router.get('/:owner/:repo/branch-activity', async (req, res) => {
  try {
    const { githubToken } = req.user;
    const { owner, repo } = req.params;
    
    // Fetch branches
    const branchesResponse = await axios.get(
      `https://api.github.com/repos/${owner}/${repo}/branches`,
      {
        headers: {
          Authorization: `token ${githubToken}`
        },
        params: {
          per_page: 100
        }
      }
    );
    
    const branches = branchesResponse.data;
    
    // Get commits for default branch to analyze branch creation/deletion through merge commits
    const commitsResponse = await axios.get(
      `https://api.github.com/repos/${owner}/${repo}/commits`,
      {
        headers: {
          Authorization: `token ${githubToken}`
        },
        params: {
          per_page: 100
        }
      }
    );
    
    // Analyze commit messages for branch activity
    const commits = commitsResponse.data;
    const branchActivity = {
      activeBranches: branches.length,
      branchList: branches.map(branch => ({
        name: branch.name,
        isDefault: branch.name === branches[0].name, // Assuming first branch is default
        lastCommitSha: branch.commit.sha,
        lastCommitUrl: branch.commit.url
      })),
      // Extract branch creation/deletion from merge commit messages
      recentActivity: commits
        .filter(commit => commit.commit.message.includes('Merge'))
        .map(commit => ({
          sha: commit.sha,
          message: commit.commit.message,
          date: commit.commit.author.date,
          author: commit.commit.author.name,
          type: commit.commit.message.includes('into') ? 'merge' : 'commit'
        }))
    };
    
    res.json(branchActivity);
  } catch (error) {
    console.error('Error fetching branch activity:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to fetch branch activity' });
  }
});

// Get individual contributor metrics
router.get('/:owner/:repo/contributor/:username', async (req, res) => {
  try {
    const { githubToken } = req.user;
    const { owner, repo, username } = req.params;
    const { timeRange = '3m' } = req.query;
    
    const { startDate, endDate } = getTimeRange(timeRange);
    
    // Fetch PRs created by the user
    const userPRsQuery = `repo:${owner}/${repo} is:pr author:${username} created:${startDate}..${endDate}`;
    const userPRsResponse = await axios.get(
      'https://api.github.com/search/issues',
      {
        headers: {
          Authorization: `token ${githubToken}`,
          Accept: 'application/vnd.github.v3+json'
        },
        params: {
          q: userPRsQuery,
          per_page: 100
        }
      }
    );
    
    // Fetch merged PRs for the user
    const userMergedPRsQuery = `repo:${owner}/${repo} is:pr is:merged author:${username} merged:${startDate}..${endDate}`;
    const userMergedPRsResponse = await axios.get(
      'https://api.github.com/search/issues',
      {
        headers: {
          Authorization: `token ${githubToken}`,
          Accept: 'application/vnd.github.v3+json'
        },
        params: {
          q: userMergedPRsQuery,
          per_page: 100
        }
      }
    );
    
    // Fetch team merged PRs for comparison
    const teamMergedPRsQuery = `repo:${owner}/${repo} is:pr is:merged merged:${startDate}..${endDate}`;
    const teamMergedPRsResponse = await axios.get(
      'https://api.github.com/search/issues',
      {
        headers: {
          Authorization: `token ${githubToken}`,
          Accept: 'application/vnd.github.v3+json'
        },
        params: {
          q: teamMergedPRsQuery,
          per_page: 100
        }
      }
    );
    
    // Group PRs by week
    const userPrsByWeek = {};
    const teamPrsByWeek = {};
    const weekMs = 7 * 24 * 60 * 60 * 1000;
    
    // Process user PRs
    userMergedPRsResponse.data.items.forEach(pr => {
      const mergedAt = new Date(pr.closed_at);
      const weekStart = new Date(Math.floor(mergedAt.getTime() / weekMs) * weekMs);
      const weekKey = formatDate(weekStart);
      
      if (!userPrsByWeek[weekKey]) {
        userPrsByWeek[weekKey] = {
          week: weekKey,
          count: 0
        };
      }
      
      userPrsByWeek[weekKey].count++;
    });
    
    // Process team PRs
    teamMergedPRsResponse.data.items.forEach(pr => {
      const mergedAt = new Date(pr.closed_at);
      const weekStart = new Date(Math.floor(mergedAt.getTime() / weekMs) * weekMs);
      const weekKey = formatDate(weekStart);
      
      if (!teamPrsByWeek[weekKey]) {
        teamPrsByWeek[weekKey] = {
          week: weekKey,
          count: 0
        };
      }
      
      teamPrsByWeek[weekKey].count++;
    });
    
    // Combine data for comparison chart
    const allWeeks = new Set([
      ...Object.keys(userPrsByWeek),
      ...Object.keys(teamPrsByWeek)
    ]);
    
    const comparisonData = Array.from(allWeeks)
      .sort()
      .map(week => ({
        week,
        userPRs: userPrsByWeek[week]?.count || 0,
        teamPRs: teamPrsByWeek[week]?.count || 0,
        teamAvg: teamPrsByWeek[week] 
          ? teamPrsByWeek[week].count / (teamMergedPRsResponse.data.items.length > 0 ? teamMergedPRsResponse.data.items.length : 1)
          : 0
      }));
    
    const metrics = {
      summary: {
        totalPRs: userPRsResponse.data.total_count,
        mergedPRs: userMergedPRsResponse.data.total_count,
        teamTotalMergedPRs: teamMergedPRsResponse.data.total_count,
        prMergeRate: userPRsResponse.data.total_count > 0
          ? (userMergedPRsResponse.data.total_count / userPRsResponse.data.total_count) * 100
          : 0
      },
      recentPRs: userPRsResponse.data.items.slice(0, 5).map(pr => ({
        number: pr.number,
        title: pr.title,
        state: pr.state,
        createdAt: pr.created_at,
        closedAt: pr.closed_at,
        url: pr.html_url
      })),
      comparisonData
    };
    
    res.json(metrics);
  } catch (error) {
    console.error('Error fetching contributor metrics:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to fetch contributor metrics' });
  }
});

// Get repository contributors
router.get('/:owner/:repo/contributors', async (req, res) => {
  try {
    const { githubToken } = req.user;
    const { owner, repo } = req.params;
    
    // Fetch contributors from GitHub API
    const contributorsResponse = await axios.get(
      `https://api.github.com/repos/${owner}/${repo}/contributors`,
      {
        headers: {
          Authorization: `token ${githubToken}`
        },
        params: {
          per_page: 100
        }
      }
    );
    
    const contributors = contributorsResponse.data.map(contributor => ({
      id: contributor.id,
      login: contributor.login,
      avatarUrl: contributor.avatar_url,
      contributions: contributor.contributions
    }));
    
    res.json(contributors);
  } catch (error) {
    console.error('Error fetching contributors:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to fetch contributors' });
  }
});

module.exports = router;