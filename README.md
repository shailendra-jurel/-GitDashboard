GitInsight - GitHub Repository Analytics Dashboard
Show Image

A sleek, intuitive dashboard to analyze your GitHub repositories and gain valuable insights about your development workflow.

✨ Features

Repository Analytics: Track pull requests, merge times, and branch activity
Contributor Insights: Analyze individual and team contributions
Performance Metrics: Monitor key development workflow metrics
Responsive Design: Seamless experience on desktop and mobile devices
Theme Options: Toggle between light and dark mode based on your preference

📊 Screenshots
Dashboard OverviewRepository SelectionShow ImageShow Image
Contributor AnalysisPull Request MetricsShow ImageShow Image
🚀 Getting Started
Prerequisites

Node.js (v14 or higher)
GitHub account for authentication
GitHub OAuth App credentials

Installation

Clone the repository

git clone https://github.com/username/gitinsight.git
cd gitinsight

Install dependencies

# Install frontend dependencies
npm install

# Install backend dependencies
cd server
npm install

Configure environment variables

Create .env files in both root and server directories:
Copy# Frontend .env
VITE_BACKEND_URL=http://localhost:5000

# Backend .env
PORT=5000
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
JWT_SECRET=your_jwt_secret

Start development servers

# Start backend server
cd server
npm run dev

# In a new terminal, start frontend
cd ..
npm run dev

Visit the application

Open your browser and navigate to http://localhost:3000
🔍 How It Works
GitInsight provides an intuitive way to analyze your GitHub repositories through these key flows:
1. Authentication Flow

Users sign in with GitHub OAuth
Our backend exchanges the code for an access token
JWT token is generated for secure API access
User is redirected to the dashboard

2. Repository Selection

We fetch all accessible repositories from GitHub
Users can filter, search, and select repositories to analyze
Selected repositories are saved to the user's preferences

3. Analytics Dashboard

Repository data is fetched from GitHub API
Pull request metrics are calculated and displayed
Contributor statistics are visualized
Branch activity is tracked and presented in charts

4. Interactive Filtering

Filter analytics by contributor
Adjust time ranges for different perspectives
Toggle between various chart types
Compare metrics across different time periods

🛠️ Tech Stack
Frontend

React - UI library
Redux - State management
Ant Design - UI component library
Recharts - Data visualization
Axios - API requests

Backend

Node.js - Runtime environment
Express - Web framework
Mongoose - MongoDB ODM
Passport.js - Authentication middleware
GitHub API - Data source

📚 API Documentation
GitInsight uses a RESTful API structure:

GET /api/repositories - List available repositories
GET /api/repositories/:owner/:repo/stats - Get repository statistics
GET /api/repositories/:owner/:repo/contributors - Get contributor data
GET /api/repositories/:owner/:repo/pull-requests - Get pull request metrics

For detailed API documentation, check out our API Docs.
🔐 Security

OAuth 2.0 protocol for GitHub authentication
JWT tokens for API authorization
SSL encryption for all data in transit
No storage of GitHub tokens on our servers
GitHub token scopes limited to read-only access

🤝 Contributing
Contributions are welcome! Please check out our Contributing Guide for guidelines.

Fork the project
Create your feature branch (git checkout -b feature/amazing-feature)
Commit your changes (git commit -m 'Add some amazing feature')
Push to the branch (git push origin feature/amazing-feature)
Open a Pull Request

📄 License
This project is licensed under the MIT License - see the LICENSE file for details.
👨‍💻 Author

Your Name - GitHub Profile

🙏 Acknowledgements

GitHub API
Ant Design
Recharts
All our open-source contributors


<p align="center">Made with ❤️ for developers who love data</p>