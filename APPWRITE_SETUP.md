# ClarityFlow Appwrite Backend Setup

Complete guide for setting up the Appwrite backend infrastructure for ClarityFlow.

## Quick Start

```bash
# 1. Install dependencies (if not already done)
npm install

# 2. Copy environment template
cp .env.example .env.local

# 3. Configure .env.local with your Appwrite credentials
# (See "Getting Credentials" section below)

# 4. Run database setup
npm run setup:appwrite

# 5. Verify setup
npm run verify:appwrite
```

## Getting Credentials

### 1. Create Appwrite Project (Task 1 - Already Done ✅)
- Project ID: `[Your Project ID]`
- Database: `clarityflow_production` ✅
- Storage Buckets: `attachments`, `avatars` ✅

### 2. Generate API Key

1. Go to [Appwrite Console](https://cloud.appwrite.io)
2. Select your ClarityFlow project
3. Navigate to **Settings** → **API Keys**
4. Click **Create API Key**
5. Configure:
   - **Name**: Database Setup Script
   - **Expiration**: Never (or after setup completion)
   - **Scopes**: Select all of these:
     - ✅ databases.read
     - ✅ databases.write
     - ✅ collections.read
     - ✅ collections.write
     - ✅ attributes.read
     - ✅ attributes.write
     - ✅ indexes.read
     - ✅ indexes.write
6. Click **Create**
7. **Copy the API key** (you won't see it again!)

### 3. Configure Environment

Edit `.env.local`:

```env
# Appwrite Configuration
VITE_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
VITE_APPWRITE_PROJECT_ID=your_actual_project_id_here
VITE_APPWRITE_DATABASE_ID=clarityflow_production

# API Key for setup scripts
APPWRITE_API_KEY=your_actual_api_key_here
```

## Database Setup (Task 2)

### Automated Setup (Recommended)

```bash
npm run setup:appwrite
```

This creates:
- ✅ Database: `clarityflow_production`
- ✅ 20 Collections with 200+ attributes
- ✅ 40+ Performance indexes
- ✅ Document-level permissions

### Verify Setup

```bash
npm run verify:appwrite
```

Expected output:
```
=== Appwrite Database Verification ===

✓ Database "ClarityFlow Production" exists
✓ Found 20 collections

Collection Details:
✓ User Preferences (users_preferences)
  Attributes: 12 available, 0 processing
  Indexes: 1 available, 0 processing
  ...

=== Verification Summary ===
✓ All collections created successfully!
```

## Database Schema

### Collections (20 Total)

| Collection | Purpose | Attributes | Indexes |
|------------|---------|------------|---------|
| users_preferences | User settings | 12 | 1 |
| projects | Project management | 11 | 3 |
| epics | Epic tracking | 9 | 2 |
| tasks | Task management | 18 | 6 |
| recurring_tasks | Recurring patterns | 7 | 2 |
| labels | Tags and labels | 3 | 1 |
| notes | Knowledge base | 9 | 3 |
| note_links | Bi-directional links | 6 | 2 |
| goals | OKR tracking | 12 | 2 |
| goal_links | Task-goal relationships | 5 | 2 |
| habits | Habit tracking | 9 | 1 |
| habit_completions | Habit history | 4 | 2 |
| wellbeing_logs | Daily check-ins | 6 | 1 |
| focus_sessions | Pomodoro tracking | 8 | 3 |
| time_entries | Time tracking | 8 | 4 |
| automation_rules | Workflow automation | 10 | 2 |
| saved_filters | Custom filters | 6 | 1 |
| templates | Project templates | 7 | 2 |
| integrations | Third-party integrations | 7 | 1 |
| weekly_reviews | AI-generated reviews | 6 | 1 |

### Permission Model

All collections use document-level security:
- **Read**: User can read their own documents
- **Create**: Any authenticated user can create
- **Update**: User can update their own documents
- **Delete**: User can delete their own documents

## Storage Buckets (Task 3 - Already Done ✅)

### Attachments Bucket
- **ID**: `attachments`
- **Max Size**: 100MB per file
- **Allowed**: pdf, doc, docx, xls, xlsx, ppt, pptx, jpg, jpeg, png, gif, svg, mp4, mov, zip, rar
- **Security**: File-level permissions, encrypted, antivirus enabled
- **Compression**: gzip

### Avatars Bucket
- **ID**: `avatars`
- **Max Size**: 5MB per file
- **Allowed**: jpg, jpeg, png, gif
- **Security**: Public read, user write
- **Compression**: gzip

## Troubleshooting

### Missing Environment Variables
```
Error: Missing required environment variables
```
**Solution**: Ensure `.env.local` exists and contains all required variables.

### 401 Unauthorized
```
Error: 401 Unauthorized
```
**Solution**: 
- Verify API key is correct
- Check API key has required scopes
- Ensure project ID matches

### 409 Conflict
```
✓ Collection already exists
```
**Not an error!** The resource already exists. The script will skip it.

### Rate Limit Exceeded
```
Error: Rate limit exceeded
```
**Solution**: Wait a few minutes and try again. The script includes delays to minimize this.

### Attributes Stuck in "Processing"
**Normal behavior**: Attributes take a few seconds to become "available".
**If stuck >30 seconds**: Check Appwrite Console for errors.

## Manual Verification

1. Go to [Appwrite Console](https://cloud.appwrite.io)
2. Select your project
3. Navigate to **Databases** → `clarityflow_production`
4. Verify:
   - ✅ All 20 collections exist
   - ✅ Each collection has attributes
   - ✅ Indexes are in "available" status
   - ✅ Permissions are configured

## Next Steps

After successful database setup:

1. ✅ **Task 1**: Appwrite Project Setup (Complete)
2. ✅ **Task 2**: Create Database Schema (Complete)
3. ✅ **Task 3**: Create Storage Buckets (Complete)
4. ⏭️ **Task 4**: Install and Configure Appwrite SDK
5. ⏭️ **Task 5**: Implement Authentication Service
6. ⏭️ **Task 6**: Create Authentication UI Components

## Scripts Reference

| Command | Purpose |
|---------|---------|
| `npm run setup:appwrite` | Create database schema |
| `npm run verify:appwrite` | Verify database setup |

## Documentation

- **Setup Guide**: `docs/database-setup.md`
- **Task Summary**: `docs/task-2-summary.md`
- **Manual Guide**: `docs/manual-setup-guide.md`
- **Scripts README**: `scripts/README.md`
- **Setup Status**: `docs/setup-status.md`

## Support

- **Appwrite Docs**: https://appwrite.io/docs
- **Appwrite Discord**: https://appwrite.io/discord
- **Project Issues**: Create an issue in the repository

## Security Notes

- ⚠️ **Never commit `.env.local`** to version control
- ⚠️ Keep API keys secure
- ⚠️ Rotate API keys periodically
- ⚠️ Use separate API keys for production with limited scopes

## Cost Estimate

- **Appwrite Pro Plan**: $15/month
- **Vercel Hosting**: $0/month (Free tier)
- **Total**: $15/month

## Architecture

```
Frontend (Vercel)
    ↓ HTTPS/WSS
Appwrite Cloud ($15/mo)
    ├── Authentication
    ├── Databases (PostgreSQL)
    ├── Storage (S3-compatible)
    ├── Functions (Serverless)
    └── Realtime (WebSocket)
```

---

**Setup Complete!** 🎉

Your Appwrite backend is ready for development. Proceed to Task 4 to configure the SDK and begin implementing features.
