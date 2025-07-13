# Folyx Database Backup System

## Backup Strategy Overview

### 1. Automated Daily Backups (Supabase Native)
**Status**: Already enabled by default
- **Frequency**: Daily at 2 AM UTC
- **Retention**: 7 days (free tier) / 30 days (pro tier)
- **Location**: Supabase Dashboard > Settings > Database > Backups
- **Access**: Manual restore via dashboard

### 2. Manual Export Scripts
Create scheduled exports for critical data

#### A. Waitlist Export Script
```bash
#!/bin/bash
# backup-waitlist.sh
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="./backups/waitlist"
mkdir -p $BACKUP_DIR

npx supabase db dump --data-only --schema public --table waitlist > "$BACKUP_DIR/waitlist_$TIMESTAMP.sql"
```

#### B. Profiles Export Script  
```bash
#!/bin/bash
# backup-profiles.sh
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="./backups/profiles"
mkdir -p $BACKUP_DIR

npx supabase db dump --data-only --schema public --table profiles > "$BACKUP_DIR/profiles_$TIMESTAMP.sql"
```

### 3. GitHub Actions Automated Backups
**File**: `.github/workflows/backup.yml`

```yaml
name: Database Backup
on:
  schedule:
    - cron: '0 6 * * *'  # Daily at 6 AM UTC
  workflow_dispatch:     # Manual trigger

jobs:
  backup:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          
      - name: Install Supabase CLI
        run: npm install -g @supabase/cli
        
      - name: Create backup directory
        run: mkdir -p backups
        
      - name: Export Waitlist Data
        env:
          SUPABASE_DB_PASSWORD: ${{ secrets.SUPABASE_DB_PASSWORD }}
        run: |
          TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
          echo $SUPABASE_DB_PASSWORD | supabase db dump --data-only --schema public --table waitlist > "backups/waitlist_$TIMESTAMP.sql"
          
      - name: Export Profiles Data
        env:
          SUPABASE_DB_PASSWORD: ${{ secrets.SUPABASE_DB_PASSWORD }}
        run: |
          TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
          echo $SUPABASE_DB_PASSWORD | supabase db dump --data-only --schema public --table profiles > "backups/profiles_$TIMESTAMP.sql"
          
      - name: Commit backups
        run: |
          git config --local user.email "action@github.com"
          git config --local user.name "GitHub Action"
          git add backups/
          git commit -m "Daily database backup $(date +"%Y-%m-%d")" || exit 0
          git push
```

### 4. Cloud Storage Backup (AWS S3)
**Enhanced backup with cloud storage**

#### Install AWS CLI:
```bash
npm install aws-sdk
```

#### Backup Script with S3 Upload:
```javascript
// backup-to-s3.js
const AWS = require('aws-sdk');
const { exec } = require('child_process');
const fs = require('fs');

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || 'us-east-1'
});

async function backupToS3() {
  const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
  const fileName = `folyx-backup-${timestamp}.sql`;
  
  // Create full database dump
  exec(`npx supabase db dump > ${fileName}`, async (error, stdout, stderr) => {
    if (error) {
      console.error('Backup failed:', error);
      return;
    }
    
    // Upload to S3
    const fileContent = fs.readFileSync(fileName);
    const params = {
      Bucket: 'folyx-database-backups',
      Key: `daily/${fileName}`,
      Body: fileContent,
      StorageClass: 'STANDARD_IA'
    };
    
    try {
      await s3.upload(params).promise();
      console.log(`Backup uploaded: ${fileName}`);
      fs.unlinkSync(fileName); // Clean up local file
    } catch (uploadError) {
      console.error('S3 upload failed:', uploadError);
    }
  });
}

backupToS3();
```

### 5. Real-time Replication (Advanced)
**For mission-critical data protection**

#### Supabase Edge Functions for Webhook Backups:
```sql
-- Create backup table for critical operations
CREATE TABLE backup_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  table_name TEXT NOT NULL,
  operation TEXT NOT NULL,
  old_data JSONB,
  new_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger function for automatic logging
CREATE OR REPLACE FUNCTION log_changes()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO backup_logs (table_name, operation, old_data, new_data)
  VALUES (
    TG_TABLE_NAME,
    TG_OP,
    CASE WHEN TG_OP = 'DELETE' THEN to_jsonb(OLD) ELSE NULL END,
    CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN to_jsonb(NEW) ELSE NULL END
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Apply to critical tables
CREATE TRIGGER waitlist_backup_trigger
  AFTER INSERT OR UPDATE OR DELETE ON waitlist
  FOR EACH ROW EXECUTE FUNCTION log_changes();

CREATE TRIGGER profiles_backup_trigger
  AFTER INSERT OR UPDATE OR DELETE ON profiles
  FOR EACH ROW EXECUTE FUNCTION log_changes();
```

## Backup Schedule Recommendations

### Immediate (Week 1)
1. ✅ Enable Supabase native backups (already active)
2. 🔄 Set up GitHub Actions daily backup
3. 🔄 Create manual backup scripts

### Short-term (Month 1)
1. 🔄 Implement S3 cloud backup
2. 🔄 Add backup monitoring/alerts
3. 🔄 Test restore procedures

### Long-term (Ongoing)
1. 🔄 Real-time replication for critical tables
2. 🔄 Cross-region backup redundancy
3. 🔄 Automated backup testing

## Recovery Procedures

### Quick Recovery (Same Day Data Loss)
```bash
# From Supabase Dashboard
1. Go to Settings > Database > Backups
2. Select backup timestamp
3. Click "Restore"
```

### Manual Recovery (From Exports)
```bash
# Restore from SQL dump
npx supabase db reset
psql -h your-host -U postgres -d postgres -f backup_file.sql
```

### Critical Data Recovery
```bash
# Restore specific table from backup
psql -h your-host -U postgres -d postgres -c "\\copy waitlist FROM 'waitlist_backup.csv' WITH CSV HEADER"
```

## Monitoring & Alerts

### Backup Health Check Script:
```bash
#!/bin/bash
# check-backups.sh
BACKUP_AGE=$(find ./backups -name "*.sql" -mtime -1 | wc -l)

if [ $BACKUP_AGE -eq 0 ]; then
  echo "⚠️  No recent backups found!"
  # Send alert (email, Slack, etc.)
else
  echo "✅ Backup system healthy - $BACKUP_AGE recent backups found"
fi
```

## Environment Variables Required

```bash
# .env.backup
SUPABASE_DB_PASSWORD=takitajwar17
AWS_ACCESS_KEY_ID=your_aws_key
AWS_SECRET_ACCESS_KEY=your_aws_secret
AWS_REGION=us-east-1
BACKUP_BUCKET=folyx-database-backups
SLACK_WEBHOOK_URL=your_slack_webhook
```

## Cost Analysis

### Current (Free)
- Supabase native: $0 (7-day retention)
- GitHub Actions: $0 (2000 minutes/month free)

### Recommended (Paid)
- Supabase Pro: $25/month (30-day retention)
- AWS S3: ~$5/month (1GB storage)
- **Total**: ~$30/month for enterprise-grade backup

## Next Steps

1. **Immediate**: Set up GitHub Actions backup
2. **This week**: Test manual restore procedure
3. **Next week**: Implement S3 backup with monitoring
4. **Ongoing**: Regular backup testing and monitoring