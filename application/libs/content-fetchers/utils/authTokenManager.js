import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

/**
 * Utility class for managing OAuth tokens and platform authentication
 */
export class AuthTokenManager {
  constructor() {
    this.supabase = createServerComponentClient({ cookies });
  }

  /**
   * Get stored OAuth token for a platform
   */
  async getStoredToken(platform, userId = null) {
    try {
      // Get current user if not provided
      if (!userId) {
        const { data: { session } } = await this.supabase.auth.getSession();
        if (!session) {
          throw new Error('No authenticated user');
        }
        userId = session.user.id;
      }

      // Fetch platform connection
      const { data: connection, error } = await this.supabase
        .from('connected_platforms')
        .select('access_token, refresh_token, token_expires_at, profile_data, scope')
        .eq('user_id', userId)
        .eq('platform', platform)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No connection found
          return null;
        }
        throw new Error(`Failed to fetch ${platform} connection: ${error.message}`);
      }

      // Check if token is expired (if expiration is tracked)
      if (connection.token_expires_at) {
        const expiresAt = new Date(connection.token_expires_at);
        const now = new Date();
        
        if (now >= expiresAt) {
          // Token expired - attempt refresh if refresh token is available
          if (connection.refresh_token) {
            return await this.refreshToken(platform, connection.refresh_token, userId);
          } else {
            throw new Error(`${platform} token expired and no refresh token available`);
          }
        }
      }

      return {
        accessToken: connection.access_token,
        refreshToken: connection.refresh_token,
        expiresAt: connection.token_expires_at,
        scope: connection.scope,
        profileData: connection.profile_data
      };

    } catch (error) {
      console.error(`Error getting stored token for ${platform}:`, error);
      return null;
    }
  }

  /**
   * Refresh an expired OAuth token
   */
  async refreshToken(platform, refreshToken, userId) {
    try {
      let refreshResponse;
      
      switch (platform) {
        case 'github':
          // GitHub tokens don't expire, so this shouldn't be needed
          throw new Error('GitHub tokens do not expire');
          
        case 'linkedin':
          refreshResponse = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
              grant_type: 'refresh_token',
              refresh_token: refreshToken,
              client_id: process.env.LINKEDIN_CLIENT_ID,
              client_secret: process.env.LINKEDIN_CLIENT_SECRET
            })
          });
          break;
          
        default:
          throw new Error(`Token refresh not implemented for ${platform}`);
      }

      if (!refreshResponse.ok) {
        throw new Error(`Token refresh failed: ${refreshResponse.status}`);
      }

      const tokenData = await refreshResponse.json();
      
      // Update stored token
      const expiresAt = tokenData.expires_in ? 
        new Date(Date.now() + tokenData.expires_in * 1000).toISOString() : 
        null;

      const { error: updateError } = await this.supabase
        .from('connected_platforms')
        .update({
          access_token: tokenData.access_token,
          refresh_token: tokenData.refresh_token || refreshToken,
          token_expires_at: expiresAt,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .eq('platform', platform);

      if (updateError) {
        throw new Error(`Failed to update refreshed token: ${updateError.message}`);
      }

      return {
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token || refreshToken,
        expiresAt: expiresAt,
        scope: tokenData.scope
      };

    } catch (error) {
      console.error(`Error refreshing ${platform} token:`, error);
      throw error;
    }
  }

  /**
   * Check if a platform connection exists for the current user
   */
  async hasConnection(platform, userId = null) {
    try {
      if (!userId) {
        const { data: { session } } = await this.supabase.auth.getSession();
        if (!session) return false;
        userId = session.user.id;
      }

      const { data, error } = await this.supabase
        .from('connected_platforms')
        .select('id')
        .eq('user_id', userId)
        .eq('platform', platform)
        .single();

      return !error && !!data;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get all connected platforms for a user
   */
  async getConnectedPlatforms(userId = null) {
    try {
      if (!userId) {
        const { data: { session } } = await this.supabase.auth.getSession();
        if (!session) return [];
        userId = session.user.id;
      }

      const { data: connections, error } = await this.supabase
        .from('connected_platforms')
        .select('platform, platform_username, platform_display_name, profile_data, verified_at')
        .eq('user_id', userId);

      if (error) {
        throw new Error(`Failed to fetch connections: ${error.message}`);
      }

      return connections || [];
    } catch (error) {
      console.error('Error getting connected platforms:', error);
      return [];
    }
  }

  /**
   * Validate if a stored token is still valid
   */
  async validateToken(platform, token) {
    try {
      let validationUrl;
      let headers = {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      };

      switch (platform) {
        case 'github':
          validationUrl = 'https://api.github.com/user';
          headers['Accept'] = 'application/vnd.github+json';
          headers['X-GitHub-Api-Version'] = '2022-11-28';
          break;
          
        case 'linkedin':
          validationUrl = 'https://api.linkedin.com/v2/me';
          break;
          
        default:
          throw new Error(`Token validation not implemented for ${platform}`);
      }

      const response = await fetch(validationUrl, { headers });
      
      return response.ok;
    } catch (error) {
      console.error(`Error validating ${platform} token:`, error);
      return false;
    }
  }
}

// Export singleton instance
export const authTokenManager = new AuthTokenManager();