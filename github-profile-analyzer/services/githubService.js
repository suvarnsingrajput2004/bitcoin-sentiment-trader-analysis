const axios = require('axios');
const config = require('../config/config');

class GitHubService {
  constructor() {
    this.client = axios.create({
      baseURL: 'https://api.github.com',
      headers: {
        Accept: 'application/vnd.github.v3+json',
        'User-Agent': 'GitHub-Profile-Analyzer-API'
      }
    });

    // Add authorization header if GitHub PAT token is available
    if (config.github.token) {
      this.client.defaults.headers.common['Authorization'] = `token ${config.github.token}`;
    }
  }

  /**
   * Fetch full user profile and calculate repository insights.
   * @param {string} username
   * @returns {Promise<Object>} Analyzed profile data
   */
  async analyzeProfile(username) {
    try {
      // 1. Fetch main user profile
      let profileResponse;
      try {
        profileResponse = await this.client.get(`/users/${username}`);
      } catch (error) {
        if (error.response && error.response.status === 404) {
          const notFoundError = new Error(`GitHub user '${username}' not found.`);
          notFoundError.statusCode = 404;
          throw notFoundError;
        }
        if (error.response && (error.response.status === 403 || error.response.status === 429)) {
          const rateLimitError = new Error('GitHub API rate limit exceeded. Please configure GITHUB_TOKEN in your environment variables.');
          rateLimitError.statusCode = 403;
          throw rateLimitError;
        }
        throw error;
      }

      const profile = profileResponse.data;

      // 2. Fetch all public repositories (handling pagination)
      let repos = [];
      let page = 1;
      let hasMore = true;

      while (hasMore) {
        const reposResponse = await this.client.get(`/users/${username}/repos`, {
          params: {
            per_page: 100,
            page: page
          }
        });

        const pageRepos = reposResponse.data;
        repos = repos.concat(pageRepos);

        if (pageRepos.length < 100) {
          hasMore = false;
        } else {
          page++;
        }
      }

      // 3. Compute Repository Insights
      const totalRepos = repos.length;
      let totalStars = 0;
      let totalForks = 0;
      let maxStars = -1;
      let mostStarredRepo = null;
      const languageMap = {};

      repos.forEach(repo => {
        totalStars += repo.stargazers_count;
        totalForks += repo.forks_count;

        // Check for most starred
        if (repo.stargazers_count > maxStars) {
          maxStars = repo.stargazers_count;
          mostStarredRepo = repo.name;
        }

        // Tally language
        if (repo.language) {
          languageMap[repo.language] = (languageMap[repo.language] || 0) + 1;
        }
      });

      // Find most used language
      let mostUsedLanguage = null;
      let maxLanguageCount = 0;
      for (const [lang, count] of Object.entries(languageMap)) {
        if (count > maxLanguageCount) {
          maxLanguageCount = count;
          mostUsedLanguage = lang;
        }
      }

      // If no repos have languages
      if (!mostUsedLanguage && totalRepos > 0) {
        mostUsedLanguage = 'None';
      }

      const averageStars = totalRepos > 0 ? (totalStars / totalRepos) : 0.00;

      // Calculate account age in years
      const createdAtDate = new Date(profile.created_at);
      const now = new Date();
      const ageInMs = now - createdAtDate;
      const ageInYears = parseFloat((ageInMs / (1000 * 60 * 60 * 24 * 365.25)).toFixed(2));

      // Combine profile and repository insights
      return {
        username: profile.login,
        name: profile.name || null,
        bio: profile.bio || null,
        avatar_url: profile.avatar_url,
        profile_url: profile.html_url,
        public_repos: profile.public_repos,
        followers: profile.followers,
        following: profile.following,
        created_at: profile.created_at,
        updated_at: profile.updated_at,
        account_age_years: ageInYears,
        
        // Insights
        total_repositories: totalRepos,
        total_stars: totalStars,
        total_forks: totalForks,
        most_starred_repository: mostStarredRepo,
        most_used_programming_language: mostUsedLanguage,
        average_stars_per_repository: parseFloat(averageStars.toFixed(2))
      };
    } catch (error) {
      if (!error.statusCode) {
        error.statusCode = 500;
      }
      throw error;
    }
  }
}

module.exports = new GitHubService();
