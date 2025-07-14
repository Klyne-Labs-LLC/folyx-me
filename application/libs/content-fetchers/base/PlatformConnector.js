/**
 * Base Platform Connector class
 * Provides common functionality for all platform integrations
 */
export class PlatformConnector {
  constructor(platformName, config = {}) {
    this.platformName = platformName;
    this.config = {
      rateLimitWindow: 3600000, // 1 hour default
      maxRequests: 1000,
      cacheEnabled: true,
      cacheTimeout: 300000, // 5 minutes
      ...config
    };
    
    this.requestCache = new Map();
    this.requestCounts = new Map();
  }

  /**
   * Execute a request with rate limiting and caching
   */
  async executeRequest(cacheKey, requestFunction) {
    // Check rate limiting
    if (!this.checkRateLimit()) {
      throw new Error(`Rate limit exceeded for ${this.platformName}`);
    }

    // Check cache if enabled
    if (this.config.cacheEnabled && this.requestCache.has(cacheKey)) {
      const cached = this.requestCache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.config.cacheTimeout) {
        return cached.data;
      } else {
        this.requestCache.delete(cacheKey);
      }
    }

    // Execute request
    const result = await requestFunction();

    // Cache result if enabled
    if (this.config.cacheEnabled) {
      this.requestCache.set(cacheKey, {
        data: result,
        timestamp: Date.now()
      });
    }

    // Update request count
    this.updateRequestCount();

    return result;
  }

  /**
   * Check if we're within rate limits
   */
  checkRateLimit() {
    const now = Date.now();
    const windowStart = now - this.config.rateLimitWindow;
    
    // Clean old request counts
    for (const [timestamp, count] of this.requestCounts.entries()) {
      if (timestamp < windowStart) {
        this.requestCounts.delete(timestamp);
      }
    }

    // Count requests in current window
    const totalRequests = Array.from(this.requestCounts.values()).reduce((sum, count) => sum + count, 0);
    
    return totalRequests < this.config.maxRequests;
  }

  /**
   * Update request count for rate limiting
   */
  updateRequestCount() {
    const now = Math.floor(Date.now() / 60000) * 60000; // Round to minute
    const currentCount = this.requestCounts.get(now) || 0;
    this.requestCounts.set(now, currentCount + 1);
  }

  /**
   * Validate required credentials
   */
  validateCredentials(credentials, requiredFields) {
    if (!credentials) {
      throw new Error('No credentials provided');
    }

    for (const field of requiredFields) {
      if (!credentials[field]) {
        throw new Error(`Missing required credential: ${field}`);
      }
    }
  }

  /**
   * Get standard data structure for platform data
   */
  getDataStructure() {
    return {
      profile: {},
      projects: [],
      skills: {},
      socialMetrics: {},
      achievements: [],
      rawData: {}
    };
  }

  /**
   * Format error for consistent error handling
   */
  formatError(error, context = 'unknown') {
    return {
      message: error.message,
      code: error.code || 'UNKNOWN_ERROR',
      context: context,
      platform: this.platformName,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Clear cache (useful for testing or forced refresh)
   */
  clearCache() {
    this.requestCache.clear();
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return {
      cacheSize: this.requestCache.size,
      requestCounts: Object.fromEntries(this.requestCounts),
      rateLimitStatus: this.checkRateLimit()
    };
  }
}