# Manual Database Setup Guide

## Overview

Due to the large number of collections (20 total) and attributes (200+ total), we've created an automated setup script that uses the Appwrite SDK to create all database schema elements.

## Progress So Far

### Completed ✅
1. **users_preferences** collection - Fully created with all attributes and indexes
2. **projects** collection - Attributes created, indexes pending

### Remaining
- 18 more collections with their attributes and indexes

## Recommended Approach

Use the automated setup script we created:

```bash
npm run setup:appwrite
```

This script will:
1. Create all remaining collections
2. Add all attributes to each collection
3. Create all indexes for performance
4. Configure permissions properly

## Prerequisites

1. **API Key**: You need an Appwrite API key with these scopes:
   - databases.read
   - databases.write
   - collections.read
   - collections.write
   - attributes.read
   - attributes.write
   - indexes.read
   - indexes.write

2. **Environment Variables**: Set in `.env.local`:
   ```env
   VITE_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
   VITE_APPWRITE_PROJECT_ID=your_project_id
   APPWRITE_API_KEY=your_api_key
   ```

## Alternative: Manual Creation via Appwrite Console

If you prefer to create collections manually:

1. Go to Appwrite Console → Databases → clarityflow_production
2. For each collection in `scripts/setup-appwrite-database.ts`:
   - Create the collection
   - Add all attributes
   - Create all indexes
   - Set permissions

This is time-consuming but gives you full control.

## Verification

After running the setup script, verify in Appwrite Console:
- All 20 collections exist
- Each collection has the correct attributes
- Indexes are created and in "available" status
- Permissions are set correctly

## Next Steps

Once database schema is complete:
- ✅ Task 1: Appwrite Project Setup
- ✅ Task 2: Create Database Schema (in progress)
- ⏭️ Task 3: Create Storage Buckets (already done)
- ⏭️ Task 4: Install and Configure Appwrite SDK
