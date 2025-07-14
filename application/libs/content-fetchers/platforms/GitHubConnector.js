import { PlatformConnector } from '@/libs/content-fetchers/base/PlatformConnector.js';

/**
 * GitHub platform connector for fetching user data, repositories, and activity
 */
export class GitHubConnector extends PlatformConnector {
  constructor(config = {}) {
    super('github', {
      rateLimitWindow: 3600000, // 1 hour
      maxRequests: 5000, // GitHub's rate limit
      ...config
    });
  }

  /**
   * Authenticate with GitHub using personal access token or OAuth
   */
  async authenticate(credentials) {
    this.validateCredentials(credentials, ['token']);
    
    const cacheKey = `auth:${credentials.token.substring(0, 8)}`;
    
    return await this.executeRequest(cacheKey, async () => {
      const response = await fetch('https://api.github.com/user', {
        headers: {
          'Authorization': `Bearer ${credentials.token}`,
          'Accept': 'application/vnd.github+json',
          'X-GitHub-Api-Version': '2022-11-28'
        }
      });

      if (!response.ok) {
        throw new Error(`GitHub authentication failed: ${response.status} ${response.statusText}`);
      }

      const user = await response.json();
      return {
        authenticated: true,
        user: {
          id: user.id,
          username: user.login,
          name: user.name,
          email: user.email
        }
      };
    });
  }

  /**
   * Fetch comprehensive user data from GitHub
   */
  async fetchUserData(username, token = null, userId = null) {
    const cacheKey = `user:${username}`;
    
    return await this.executeRequest(cacheKey, async () => {
      const headers = {
        'Accept': 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
        'User-Agent': 'Folyx-Portfolio-Generator'
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      // Fetch user profile
      const userResponse = await fetch(`https://api.github.com/users/${username}`, { headers });
      if (!userResponse.ok) {
        throw new Error(`Failed to fetch GitHub user: ${userResponse.status}`);
      }
      const userProfile = await userResponse.json();

      // Fetch repositories
      const reposResponse = await fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=100`, { headers });
      if (!reposResponse.ok) {
        throw new Error(`Failed to fetch GitHub repositories: ${reposResponse.status}`);
      }
      const repositories = await reposResponse.json();

      // Fetch recent activity
      const eventsResponse = await fetch(`https://api.github.com/users/${username}/events/public?per_page=100`, { headers });
      const events = eventsResponse.ok ? await eventsResponse.json() : [];

      // Process and structure the data
      const structuredData = this.getDataStructure();
      
      structuredData.profile = {
        id: userProfile.id,
        username: userProfile.login,
        name: userProfile.name,
        bio: userProfile.bio,
        avatar: userProfile.avatar_url,
        location: userProfile.location,
        company: userProfile.company,
        blog: userProfile.blog,
        email: userProfile.email,
        public_repos: userProfile.public_repos,
        followers: userProfile.followers,
        following: userProfile.following,
        created_at: userProfile.created_at,
        updated_at: userProfile.updated_at
      };

      structuredData.projects = await this.processRepositories(repositories, headers);
      structuredData.skills = this.extractSkills(repositories);
      structuredData.socialMetrics = this.calculateMetrics(userProfile, repositories, events);
      structuredData.achievements = this.identifyAchievements(userProfile, repositories);

      return structuredData;
    });
  }

  /**
   * Process repositories into project format
   */
  async processRepositories(repositories, headers) {
    const projects = [];
    
    // Sort by stars, recency, and activity
    const sortedRepos = repositories
      .filter(repo => !repo.fork || repo.stargazers_count > 5) // Include forks only if they have stars
      .sort((a, b) => {
        const aScore = a.stargazers_count * 2 + (a.forks_count || 0) + (new Date(a.updated_at).getTime() / 1000000000);
        const bScore = b.stargazers_count * 2 + (b.forks_count || 0) + (new Date(b.updated_at).getTime() / 1000000000);
        return bScore - aScore;
      })
      .slice(0, 50); // Limit to top 50 repos

    for (const repo of sortedRepos) {
      try {
        // Get languages for the repository
        const languagesResponse = await fetch(repo.languages_url, { headers });
        const languages = languagesResponse.ok ? await languagesResponse.json() : {};

        // Get README content if available
        let readme = null;
        try {
          const readmeResponse = await fetch(`https://api.github.com/repos/${repo.full_name}/readme`, { headers });
          if (readmeResponse.ok) {
            const readmeData = await readmeResponse.json();
            readme = Buffer.from(readmeData.content, 'base64').toString('utf-8');
          }
        } catch (e) {
          // README not available
        }

        projects.push({
          id: `github-${repo.id}`,
          platform: 'github',
          title: repo.name,
          description: repo.description || 'No description provided',
          fullDescription: readme,
          url: repo.html_url,
          githubUrl: repo.html_url,
          demoUrl: repo.homepage || null,
          technologies: Object.keys(languages),
          primaryLanguage: repo.language,
          languageStats: languages,
          metrics: {
            stars: repo.stargazers_count,
            forks: repo.forks_count,
            watchers: repo.watchers_count,
            openIssues: repo.open_issues_count,
            size: repo.size
          },
          dates: {
            created: repo.created_at,
            updated: repo.updated_at,
            pushed: repo.pushed_at
          },
          topics: repo.topics || [],
          isPrivate: repo.private,
          isFork: repo.fork,
          isArchived: repo.archived,
          license: repo.license?.name || null,
          defaultBranch: repo.default_branch
        });
      } catch (error) {
        console.error(`Error processing repository ${repo.name}:`, error);
      }
    }

    return projects;
  }

  /**
   * Extract skills from repositories
   */
  extractSkills(repositories) {
    const languageStats = {};
    const technologies = new Set();

    repositories.forEach(repo => {
      if (repo.language) {
        languageStats[repo.language] = (languageStats[repo.language] || 0) + 1;
      }
      
      // Add topics as technologies
      if (repo.topics) {
        repo.topics.forEach(topic => technologies.add(topic));
      }
    });

    return {
      languages: Object.entries(languageStats)
        .sort(([,a], [,b]) => b - a)
        .map(([language, count]) => ({ name: language, count })),
      technologies: Array.from(technologies),
      totalRepositories: repositories.length
    };
  }

  /**
   * Calculate GitHub metrics
   */
  calculateMetrics(profile, repositories, events) {
    const totalStars = repositories.reduce((sum, repo) => sum + repo.stargazers_count, 0);
    const totalForks = repositories.reduce((sum, repo) => sum + repo.forks_count, 0);
    
    // Recent activity (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const recentEvents = events.filter(event => new Date(event.created_at) > thirtyDaysAgo);
    
    return {
      totalStars,
      totalForks,
      totalRepositories: repositories.length,
      publicRepositories: profile.public_repos,
      followers: profile.followers,
      following: profile.following,
      recentActivity: recentEvents.length,
      accountAge: Math.floor((Date.now() - new Date(profile.created_at).getTime()) / (365 * 24 * 60 * 60 * 1000))
    };
  }

  /**
   * Identify notable achievements
   */
  identifyAchievements(profile, repositories) {
    const achievements = [];
    
    const totalStars = repositories.reduce((sum, repo) => sum + repo.stargazers_count, 0);
    const maxStarsRepo = repositories.reduce((max, repo) => repo.stargazers_count > max.stargazers_count ? repo : max, { stargazers_count: 0 });
    
    if (totalStars > 100) {
      achievements.push({
        type: 'stars',
        title: `${totalStars}+ GitHub Stars`,
        description: `Earned ${totalStars} stars across ${repositories.length} repositories`,
        metric: totalStars
      });
    }
    
    if (maxStarsRepo.stargazers_count > 50) {
      achievements.push({
        type: 'popular_repo',
        title: `Popular Repository: ${maxStarsRepo.name}`,
        description: `${maxStarsRepo.stargazers_count} stars`,
        metric: maxStarsRepo.stargazers_count
      });
    }
    
    if (profile.followers > 100) {
      achievements.push({
        type: 'followers',
        title: `${profile.followers} GitHub Followers`,
        description: 'Building a strong developer community',
        metric: profile.followers
      });
    }
    
    if (repositories.length > 20) {
      achievements.push({
        type: 'prolific',
        title: 'Prolific Developer',
        description: `${repositories.length} public repositories`,
        metric: repositories.length
      });
    }

    return achievements;
  }

  /**
   * Validate GitHub connection
   */
  async validateConnection(credentials) {
    try {
      const auth = await this.authenticate(credentials);
      return {
        valid: true,
        platform: this.platformName,
        user: auth.user
      };
    } catch (error) {
      return {
        valid: false,
        platform: this.platformName,
        error: this.formatError(error, 'connection_validation')
      };
    }
  }
}