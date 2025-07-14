/**
 * GitHub Integration Module
 * Handles GitHub data fetching and processing
 */

import { GitHubConnector } from '@/libs/content-fetchers/platforms/GitHubConnector.js';
// Lazy import authTokenManager to avoid cookies() issues when not needed

export class GitHubModule {
  constructor(config = {}) {
    this.config = {
      rateLimitWindow: 3600000, // 1 hour
      maxRequests: 5000, // GitHub's rate limit
      cacheEnabled: true,
      ...config
    };
    
    this.connector = new GitHubConnector(this.config);
  }

  /**
   * Check if user has GitHub connection
   */
  async hasConnection(userId) {
    try {
      const { authTokenManager } = await import('@/libs/content-fetchers/utils/authTokenManager.js');
      return await authTokenManager.hasConnection('github', userId);
    } catch (error) {
      console.error('Error checking GitHub connection:', error);
      return false;
    }
  }

  /**
   * Get GitHub connection status and info
   */
  async getConnectionInfo(userId) {
    try {
      const { authTokenManager } = await import('@/libs/content-fetchers/utils/authTokenManager.js');
      const connections = await authTokenManager.getConnectedPlatforms(userId);
      const githubConnection = connections.find(conn => conn.platform === 'github');
      
      if (!githubConnection) {
        return {
          connected: false,
          platform: 'github',
          message: 'No GitHub connection found'
        };
      }

      return {
        connected: true,
        platform: 'github',
        username: githubConnection.platform_username,
        displayName: githubConnection.platform_display_name,
        verifiedAt: githubConnection.verified_at,
        profileData: githubConnection.profile_data
      };
    } catch (error) {
      console.error('Error getting GitHub connection info:', error);
      return {
        connected: false,
        platform: 'github',
        error: error.message
      };
    }
  }

  /**
   * Fetch GitHub data for portfolio generation
   */
  async fetchUserData(userId, options = {}) {
    try {
      // Check if user has GitHub connection
      if (!await this.hasConnection(userId)) {
        throw new Error('No GitHub connection found. Please connect your GitHub account first.');
      }

      // Fetch data using stored OAuth credentials
      const githubData = await this.connector.fetchUserDataWithStoredAuth(userId);
      
      if (!githubData) {
        throw new Error('Failed to fetch GitHub data');
      }

      // Process and format data for portfolio use
      const portfolioData = this.processDataForPortfolio(githubData, options);

      return {
        success: true,
        platform: 'github',
        data: portfolioData,
        metadata: {
          fetchedAt: new Date().toISOString(),
          userId: userId,
          dataSource: 'oauth_connection'
        }
      };

    } catch (error) {
      console.error('GitHub data fetch error:', error);
      return {
        success: false,
        platform: 'github',
        error: error.message,
        metadata: {
          fetchedAt: new Date().toISOString(),
          userId: userId
        }
      };
    }
  }

  /**
   * Fetch GitHub data using username (public data only)
   */
  async fetchPublicUserData(username, options = {}) {
    try {
      console.log('GitHubModule: Fetching PUBLIC data for', username);
      console.log('GitHubModule: Using environment token:', !!process.env.GITHUB_TOKEN);
      
      // For public data fetching, use GitHubConnector directly without authTokenManager
      // This avoids Supabase cookies issues since we don't need user context
      const githubData = await this.connector.fetchUserData(username, process.env.GITHUB_TOKEN);
      
      if (!githubData) {
        throw new Error('Failed to fetch GitHub data from API');
      }
      
      console.log('GitHubModule: Successfully fetched data structure:', Object.keys(githubData));
      console.log('GitHubModule: Profile exists:', !!githubData.profile);
      console.log('GitHubModule: Projects count:', githubData.projects?.length || 0);

      // Process and format data for portfolio use
      const portfolioData = this.processDataForPortfolio(githubData, options);
      
      console.log('GitHubModule: Processed portfolio data:', {
        hasProfile: !!portfolioData.profile,
        projectsCount: portfolioData.projects?.length || 0,
        skillsCount: portfolioData.skills?.length || 0
      });

      return {
        success: true,
        platform: 'github',
        data: portfolioData,
        metadata: {
          fetchedAt: new Date().toISOString(),
          username: username,
          dataSource: 'public_api'
        }
      };

    } catch (error) {
      console.error('GitHub public data fetch error:', error);
      console.error('Error stack:', error.stack);
      return {
        success: false,
        platform: 'github',
        error: error.message,
        metadata: {
          fetchedAt: new Date().toISOString(),
          username: username
        }
      };
    }
  }

  /**
   * Test GitHub connection
   */
  async testConnection(credentials) {
    try {
      return await this.connector.validateConnection(credentials);
    } catch (error) {
      console.error('GitHub connection test error:', error);
      return {
        valid: false,
        platform: 'github',
        error: error.message
      };
    }
  }

  /**
   * Process raw GitHub data for portfolio generation
   */
  processDataForPortfolio(githubData, options = {}) {
    const {
      maxProjects = 12,
      includeForkedRepos = false,
      minStars = 0,
      sortBy = 'stars' // 'stars', 'updated', 'created'
    } = options;

    // Filter and sort projects
    let projects = githubData.projects || [];
    
    // Apply filters
    if (!includeForkedRepos) {
      projects = projects.filter(project => !project.isFork);
    }
    
    if (minStars > 0) {
      projects = projects.filter(project => project.metrics.stars >= minStars);
    }

    // Sort projects
    projects.sort((a, b) => {
      switch (sortBy) {
        case 'stars':
          return b.metrics.stars - a.metrics.stars;
        case 'updated':
          return new Date(b.dates.updated) - new Date(a.dates.updated);
        case 'created':
          return new Date(b.dates.created) - new Date(a.dates.created);
        default:
          return b.metrics.stars - a.metrics.stars;
      }
    });

    // Limit number of projects
    projects = projects.slice(0, maxProjects);

    // Calculate portfolio metrics
    const metrics = this.calculatePortfolioMetrics(githubData, projects);

    return {
      profile: githubData.profile,
      projects: projects,
      skills: githubData.skills,
      achievements: githubData.achievements,
      socialMetrics: githubData.socialMetrics,
      portfolioMetrics: metrics,
      rawData: {
        totalProjects: githubData.projects?.length || 0,
        selectedProjects: projects.length,
        filterCriteria: {
          maxProjects,
          includeForkedRepos,
          minStars,
          sortBy
        }
      }
    };
  }

  /**
   * Calculate portfolio-specific metrics
   */
  calculatePortfolioMetrics(githubData, selectedProjects) {
    const totalStars = selectedProjects.reduce((sum, project) => sum + project.metrics.stars, 0);
    const totalForks = selectedProjects.reduce((sum, project) => sum + project.metrics.forks, 0);
    
    // Get most used languages from selected projects
    const languageCount = {};
    selectedProjects.forEach(project => {
      if (project.primaryLanguage) {
        languageCount[project.primaryLanguage] = (languageCount[project.primaryLanguage] || 0) + 1;
      }
    });
    
    const topLanguages = Object.entries(languageCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([language, count]) => ({ language, count }));

    // Get most recent activity
    const recentProjects = selectedProjects
      .filter(project => {
        const lastUpdate = new Date(project.dates.updated);
        const sixMonthsAgo = new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000);
        return lastUpdate > sixMonthsAgo;
      });

    return {
      totalStars,
      totalForks,
      topLanguages,
      recentActivity: recentProjects.length,
      averageStarsPerRepo: selectedProjects.length > 0 ? Math.round(totalStars / selectedProjects.length) : 0,
      mostPopularRepo: selectedProjects.length > 0 ? selectedProjects[0] : null,
      repositoryCount: selectedProjects.length,
      languageDiversity: Object.keys(languageCount).length
    };
  }

  /**
   * Generate portfolio insights and recommendations
   */
  generateInsights(portfolioData) {
    const insights = [];
    const recommendations = [];

    // Analyze project portfolio
    if (portfolioData.projects.length === 0) {
      insights.push({
        type: 'warning',
        title: 'No Projects Found',
        message: 'No public repositories meet the selection criteria.'
      });
      recommendations.push({
        type: 'action',
        title: 'Add Projects',
        message: 'Consider making some repositories public or creating portfolio projects.'
      });
    } else if (portfolioData.projects.length < 3) {
      insights.push({
        type: 'info',
        title: 'Limited Project Portfolio',
        message: `Only ${portfolioData.projects.length} projects selected for portfolio.`
      });
      recommendations.push({
        type: 'suggestion',
        title: 'Expand Portfolio',
        message: 'Consider adding more projects or adjusting filter criteria.'
      });
    }

    // Analyze technical skills
    if (portfolioData.portfolioMetrics.languageDiversity < 3) {
      recommendations.push({
        type: 'suggestion',
        title: 'Diversify Skills',
        message: 'Consider learning additional programming languages to showcase versatility.'
      });
    }

    // Analyze engagement metrics
    if (portfolioData.portfolioMetrics.totalStars < 10) {
      recommendations.push({
        type: 'tip',
        title: 'Increase Visibility',
        message: 'Add better README files and documentation to attract more stars.'
      });
    }

    // Analyze recent activity
    if (portfolioData.portfolioMetrics.recentActivity === 0) {
      insights.push({
        type: 'warning',
        title: 'No Recent Activity',
        message: 'No repository updates in the last 6 months.'
      });
      recommendations.push({
        type: 'action',
        title: 'Stay Active',
        message: 'Regular commits show ongoing engagement and skill development.'
      });
    }

    return {
      insights,
      recommendations,
      overallScore: this.calculateOverallScore(portfolioData),
      summary: this.generateSummary(portfolioData)
    };
  }

  /**
   * Calculate overall portfolio score
   */
  calculateOverallScore(portfolioData) {
    let score = 0;
    const metrics = portfolioData.portfolioMetrics;

    // Project count (0-30 points)
    score += Math.min(metrics.repositoryCount * 5, 30);

    // Stars (0-25 points)
    score += Math.min(metrics.totalStars * 2, 25);

    // Language diversity (0-20 points)
    score += Math.min(metrics.languageDiversity * 4, 20);

    // Recent activity (0-15 points)
    score += Math.min(metrics.recentActivity * 3, 15);

    // Documentation quality (0-10 points)
    const projectsWithDescription = portfolioData.projects.filter(p => p.description && p.description.length > 10).length;
    score += Math.min(projectsWithDescription * 2, 10);

    return Math.min(score, 100);
  }

  /**
   * Generate portfolio summary
   */
  generateSummary(portfolioData) {
    const metrics = portfolioData.portfolioMetrics;
    const profile = portfolioData.profile;

    return {
      developerType: this.identifyDeveloperType(portfolioData),
      experience: this.estimateExperience(portfolioData),
      strengths: this.identifyStrengths(portfolioData),
      focusAreas: metrics.topLanguages.slice(0, 3).map(lang => lang.language),
      activity: metrics.recentActivity > 0 ? 'Active' : 'Inactive',
      engagement: metrics.totalStars > 50 ? 'High' : metrics.totalStars > 10 ? 'Medium' : 'Low'
    };
  }

  /**
   * Identify developer type based on languages and projects
   */
  identifyDeveloperType(portfolioData) {
    const languages = portfolioData.portfolioMetrics.topLanguages.map(lang => lang.language.toLowerCase());
    
    if (languages.includes('javascript') || languages.includes('typescript')) {
      if (languages.includes('python') || languages.includes('java')) {
        return 'Full-Stack Developer';
      }
      return 'Frontend Developer';
    }
    
    if (languages.includes('python') || languages.includes('java') || languages.includes('go')) {
      return 'Backend Developer';
    }
    
    if (languages.includes('swift') || languages.includes('kotlin') || languages.includes('dart')) {
      return 'Mobile Developer';
    }
    
    if (languages.includes('c++') || languages.includes('c') || languages.includes('rust')) {
      return 'Systems Developer';
    }
    
    return 'Software Developer';
  }

  /**
   * Estimate experience level
   */
  estimateExperience(portfolioData) {
    const accountAge = portfolioData.socialMetrics.accountAge || 0;
    const projectCount = portfolioData.portfolioMetrics.repositoryCount;
    const totalStars = portfolioData.portfolioMetrics.totalStars;

    if (accountAge >= 3 && projectCount >= 10 && totalStars >= 100) {
      return 'Senior';
    } else if (accountAge >= 2 && projectCount >= 5 && totalStars >= 20) {
      return 'Mid-level';
    } else {
      return 'Junior';
    }
  }

  /**
   * Identify key strengths
   */
  identifyStrengths(portfolioData) {
    const strengths = [];
    const metrics = portfolioData.portfolioMetrics;

    if (metrics.totalStars > 100) {
      strengths.push('Popular Projects');
    }

    if (metrics.languageDiversity >= 5) {
      strengths.push('Multi-language Proficiency');
    }

    if (metrics.recentActivity >= 3) {
      strengths.push('Active Development');
    }

    if (metrics.averageStarsPerRepo > 10) {
      strengths.push('Quality Code');
    }

    return strengths.length > 0 ? strengths : ['Developing Portfolio'];
  }
}

export default GitHubModule;