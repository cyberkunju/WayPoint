# Appwrite Database Setup Guide

This guide explains how to set up the ClarityFlow database schema in Appwrite.

## Prerequisites

1. **Appwrite Cloud Account**: Sign up at [cloud.appwrite.io](https://cloud.appwrite.io)
2. **Appwrite Project**: Create a new project (already done in Task 1)
3. **API Key**: Generate an API key with database permissions

## Step 1: Generate Appwrite API Key

1. Go to your Appwrite Console: https://cloud.appwrite.io
2. Select your ClarityFlow project
3. Navigate to **Settings** → **API Keys**
4. Click **Create API Key**
5. Configure the API key:
   - **Name**: `Database Setup Script`
   - **Expiration**: Never (or set a date after setup)
   - **Scopes**: Select the following:
     - `databases.read`
     - `databases.write`
     - `collections.read`
     - `collections.write`
     - `attributes.read`
     - `attributes.write`
     - `indexes.read`
     - `indexes.write`
6. Click **Create**
7. **Copy the API key** (you won't be able to see it again!)

## Step 2: Configure Environment Variables

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Edit `.env.local` and add your credentials:
   ```env
   VITE_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
   VITE_APPWRITE_PROJECT_ID=your_actual_project_id
   VITE_APPWRITE_DATABASE_ID=clarityflow_production
   APPWRITE_API_KEY=your_actual_api_key
   ```

## Step 3: Run the Setup Script

Execute the database setup script:

```bash
npm run setup:appwrite
```

The script will:
1. Create the `clarityflow_production` database
2. Create all 18 collections
3. Define attributes for each collection
4. Create indexes for performance
5. Configure permissions for user-based access

## What Gets Created

### Database
- **Name**: `clarityflow_production`
- **ID**: `clarityflow_production`

### Collections (18 total)

1. **users_preferences** - User settings and preferences
2. **projects** - Project management
3. **epics** - Epic/initiative tracking
4. **tasks** - Task management
5. **recurring_tasks** - Recurring task patterns
6. **labels** - Task and project labels
7. **notes** - Knowledge management
8. **note_links** - Bi-directional note linking
9. **goals** - OKR and goal tracking
10. **goal_links** - Task-to-goal relationships
11. **habits** - Habit tracking
12. **habit_completions** - Habit completion history
13. **wellbeing_logs** - Daily wellbeing check-ins
14. **focus_sessions** - Focus time and Pomodoro tracking
15. **time_entries** - Time tracking
16. **automation_rules** - Workflow automation
17. **saved_filters** - Custom saved filters
18. **templates** - Project templates
19. **integrations** - Third-party integrations
20. **weekly_reviews** - AI-generated weekly reviews

### Permissions

All collections use document-level security with the following permissions:
- **Read**: User can read their own documents
- **Create**: Any authenticated user can create documents
- **Update**: User can update their own documents
- **Delete**: User can delete their own documents

### Indexes

Performance indexes are created for:
- User ID lookups
- Project and epic relationships
- Date-based queries (due dates, completion dates)
- Status and priority filtering
- Full-text search capabilities

## Verification

After running the setup script, verify in the Appwrite Console:

1. Go to **Databases** → `clarityflow_production`
2. You should see all 18+ collections listed
3. Click on any collection to see its attributes and indexes

## Troubleshooting

### Error: Missing environment variables
- Ensure `.env.local` exists and contains all required variables
- Check that `APPWRITE_API_KEY` is set correctly

### Error: 401 Unauthorized
- Verify your API key is correct
- Ensure the API key has the required scopes
- Check that the project ID matches your Appwrite project

### Error: 409 Conflict
- This means the resource already exists (database or collection)
- The script will skip existing resources and continue
- This is normal if you run the script multiple times

### Error: Rate limit exceeded
- Appwrite has rate limits on API calls
- Wait a few minutes and try again
- The script includes delays between operations to avoid this

## Next Steps

After successful database setup:

1. ✅ Task 1: Appwrite Project Setup (Complete)
2. ✅ Task 2: Create Database Schema (Complete)
3. ⏭️ Task 3: Create Storage Buckets
4. ⏭️ Task 4: Install and Configure Appwrite SDK

## Security Notes

- **Never commit `.env.local`** to version control
- The API key has powerful permissions - keep it secure
- Consider creating a separate API key for production with limited scopes
- Rotate API keys periodically for security

## Manual Setup (Alternative)

If you prefer to set up the database manually through the Appwrite Console:

1. Create database `clarityflow_production`
2. For each collection, create it with the attributes and indexes defined in `scripts/setup-appwrite-database.ts`
3. Configure permissions for each collection

Note: The automated script is recommended as it ensures consistency and saves time.
