#!/bin/bash
# Manual Database Backup Script for Folyx
# Usage: ./scripts/backup-manual.sh

set -e

echo "🚀 Starting Folyx Database Backup..."

# Create backup directory
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="./backups/$TIMESTAMP"
mkdir -p "$BACKUP_DIR"

echo "📁 Created backup directory: $BACKUP_DIR"

# Check if Supabase CLI is available
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI not found. Installing..."
    npm install -g @supabase/cli
fi

# Export waitlist data
echo "📊 Backing up waitlist table..."
npx supabase db dump --data-only --schema public --table waitlist > "$BACKUP_DIR/waitlist.sql"

# Export profiles data
echo "👤 Backing up profiles table..."
npx supabase db dump --data-only --schema public --table profiles > "$BACKUP_DIR/profiles.sql"

# Export full schema
echo "🏗️ Backing up database schema..."
npx supabase db dump --schema-only > "$BACKUP_DIR/schema.sql"

# Create backup summary
cat > "$BACKUP_DIR/backup_info.txt" << EOF
Folyx Database Backup
====================
Timestamp: $(date)
Backup Directory: $BACKUP_DIR

Files Created:
- waitlist.sql (waitlist table data)
- profiles.sql (profiles table data)  
- schema.sql (complete database schema)

To restore:
1. Reset database: npx supabase db reset
2. Apply schema: psql -h host -U user -d db -f schema.sql
3. Import data: psql -h host -U user -d db -f waitlist.sql
4. Import data: psql -h host -U user -d db -f profiles.sql
EOF

echo "✅ Backup completed successfully!"
echo "📁 Location: $BACKUP_DIR"
echo "📊 Files created:"
ls -la "$BACKUP_DIR"

# Optional: Upload to cloud storage (uncomment if needed)
# echo "☁️ Uploading to cloud storage..."
# aws s3 cp "$BACKUP_DIR" s3://folyx-backups/ --recursive

echo "🎉 Backup process finished!"