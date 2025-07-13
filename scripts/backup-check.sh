#!/bin/bash
# Backup Health Check Script
# Usage: ./scripts/backup-check.sh

set -e

echo "🔍 Checking Folyx Backup System Health..."

# Check if backup directory exists
if [ ! -d "./backups" ]; then
    echo "❌ Backup directory not found!"
    echo "💡 Run: mkdir -p backups"
    exit 1
fi

# Check for recent backups (last 24 hours)
RECENT_BACKUPS=$(find ./backups -name "*.sql" -mtime -1 2>/dev/null | wc -l)

if [ "$RECENT_BACKUPS" -eq 0 ]; then
    echo "⚠️  No recent backups found (last 24 hours)!"
    echo "💡 Run: ./scripts/backup-manual.sh"
    exit 1
else
    echo "✅ Found $RECENT_BACKUPS recent backup files"
fi

# Check backup file sizes
echo "📊 Recent backup file sizes:"
find ./backups -name "*.sql" -mtime -1 -exec ls -lh {} \; 2>/dev/null | awk '{print $5, $9}'

# Check GitHub Actions backup status
if [ -f ".github/workflows/backup.yml" ]; then
    echo "✅ GitHub Actions backup workflow configured"
else
    echo "⚠️  GitHub Actions backup not configured"
fi

# Check Supabase CLI
if command -v supabase &> /dev/null; then
    echo "✅ Supabase CLI available"
else
    echo "❌ Supabase CLI not installed"
    echo "💡 Run: npm install -g @supabase/cli"
fi

# Check environment variables
if [ -f ".env" ]; then
    if grep -q "DB_PASSWORD" .env; then
        echo "✅ Database password configured"
    else
        echo "⚠️  Database password not found in .env"
    fi
else
    echo "⚠️  .env file not found"
fi

echo "🎉 Backup health check completed!"