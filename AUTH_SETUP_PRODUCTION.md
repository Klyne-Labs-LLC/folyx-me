# Production Authentication Setup Guide

## Issue
Authentication works in local development but fails in production, redirecting users to `localhost:3000` instead of the production domain.

## Root Cause
OAuth providers (Google/GitHub) still have localhost redirect URIs configured instead of production URLs.

## Required Fixes

### 1. Google OAuth Console Configuration

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Navigate to **APIs & Services** → **Credentials**
3. Find and edit your **OAuth 2.0 Client ID**
4. In **Authorized redirect URIs**, add:
   ```
   https://app.folyx.me/api/auth/callback
   ```
5. Remove any localhost URLs if present
6. Save changes

### 2. GitHub OAuth App Configuration

1. Go to [GitHub](https://github.com) → **Settings** → **Developer settings** → **OAuth Apps**
2. Edit your OAuth application
3. Update **Authorization callback URL** to:
   ```
   https://app.folyx.me/api/auth/callback
   ```
4. Save changes

### 3. Supabase Dashboard Configuration

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Navigate to **Authentication** → **URL Configuration**
3. Add to **Redirect URLs**:
   ```
   https://app.folyx.me/api/auth/callback
   ```
4. Set **Site URL** to:
   ```
   https://app.folyx.me
   ```
5. Save configuration

## Verification Steps

1. Test OAuth login in production
2. Verify redirect goes to `https://app.folyx.me/api/auth/callback` 
3. Confirm successful authentication and redirect to `/dashboard`

## Notes

- The application code is correct - it dynamically constructs URLs using `window.location.origin`
- This issue only affects OAuth providers, not magic link authentication
- Both Google and GitHub OAuth apps need updating if both are used
- Keep localhost URLs for development environment if using separate OAuth apps

## Current Domain Configuration

- **Production Domain**: `app.folyx.me`
- **Auth Callback Route**: `/api/auth/callback`
- **Post-Auth Redirect**: `/dashboard`