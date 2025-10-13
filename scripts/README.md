# Appwrite Setup Scripts

This directory contains automation scripts for setting up the Appwrite backend infrastructure.

## Available Scripts

### `setup-appwrite-database.ts`

Automated database schema creation script that sets up the complete ClarityFlow database structure.

**What it does:**
- Creates the `clarityflow_production` database
- Creates all 20 collections
- Adds 200+ attributes with proper types and defaults
- Creates 40+ performance indexes
- Configures document-level permissions

**Usage:**
```bash
npm run setup:appwrite
```

**Prerequisites:**
1. Appwrite Cloud account with a project created
2. API key with database permissions (see below)
3. Environment variables configured in `.env.local`

**Required Environment Variables:**
```env
VITE_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
VITE_APPWRITE_PROJECT_ID=your_project_id
APPWRITE_API_KEY=your_api_key
```

**API Key Scopes Required:**
- `databases.read`
- `databases.write`
- `collections.read`
- `collections.write`
- `attributes.read`
- `attributes.write`
- `indexes.read`
- `indexes.write`

**How to get an API Key:**
1. Go to Appwrite Console: https://cloud.appwrite.io
2. Select your project
3. Navigate to Settings → API Keys
4. Click "Create API Key"
5. Name it "Database Setup Script"
6. Select the required scopes listed above
7. Click "Create"
8. Copy the API key (you won't see it again!)
9. Add it to your `.env.local` file

**Output:**
The script provides detailed console output showing:
- Database creation status
- Each collection being created
- Attributes being added
- Indexes being created
- Any errors or conflicts (409 = already exists, which is fine)

**Example Output:**
```
=== Appwrite Database Setup ===

Creating database: clarityflow_production
✓ Database created successfully

Creating collection: User Preferences
✓ Collection User Preferences created
  ✓ Attribute userId created
  ✓ Attribute theme created
  ✓ Attribute density created
  ...
Waiting for attributes to be ready...
  ✓ Index userId_idx created

Creating collection: Projects
...

=== Setup Complete ===
✓ Database: clarityflow_production
✓ Collections: 20

You can now use the Appwrite database in your application.
```

**Idempotency:**
The script is safe to run multiple times. If a resource already exists, it will skip it and continue with the next one. You'll see messages like:
```
✓ Database already exists
✓ Collection Projects already exists
✓ Attribute userId already exists
```

**Troubleshooting:**

**Error: Missing required environment variables**
- Ensure `.env.local` exists and contains all required variables
- Check that variable names are correct (including `VITE_` prefix)

**Error: 401 Unauthorized**
- Verify your API key is correct
- Ensure the API key has all required scopes
- Check that the project ID matches your Appwrite project

**Error: 409 Conflict**
- This is normal! It means the resource already exists
- The script will skip it and continue
- Not an error condition

**Error: Rate limit exceeded**
- Appwrite has rate limits on API calls
- Wait a few minutes and try again
- The script includes delays to minimize this

**Attributes stuck in "processing" status**
- This is normal - attributes take a few seconds to become "available"
- The script includes a 2-second delay between attributes and indexes
- If stuck for more than 30 seconds, check the Appwrite Console

**Manual Verification:**
After running the script, verify in Appwrite Console:
1. Go to Databases → clarityflow_production
2. You should see all 20 collections
3. Click on any collection to see its attributes
4. Check that indexes are in "available" status

**Collections Created:**
1. users_preferences
2. projects
3. epics
4. tasks
5. recurring_tasks
6. labels
7. notes
8. note_links
9. goals
10. goal_links
11. habits
12. habit_completions
13. wellbeing_logs
14. focus_sessions
15. time_entries
16. automation_rules
17. saved_filters
18. templates
19. integrations
20. weekly_reviews

**Next Steps:**
After successful database setup:
1. Verify all collections in Appwrite Console
2. Proceed to Task 4: Install and Configure Appwrite SDK
3. Begin implementing authentication (Task 5)

**Support:**
- See `docs/database-setup.md` for detailed setup guide
- See `docs/task-2-summary.md` for complete task documentation
- Check Appwrite documentation: https://appwrite.io/docs

### `setup-appwrite-storage.ts`

Automated storage bucket creation script that sets up file storage for ClarityFlow.

**What it does:**
- Creates the `attachments` bucket for file uploads
- Creates the `avatars` bucket for user profile pictures
- Configures file security, permissions, and size limits
- Enables compression, encryption, and antivirus scanning

**Usage:**
```bash
npm run setup:storage
```

**Prerequisites:**
Same as database setup script (API key with storage permissions)

**Required API Key Scopes:**
- `buckets.read`
- `buckets.write`

**Buckets Created:**

**1. Attachments Bucket**
- ID: `attachments`
- Max Size: 100MB per file
- File Security: Enabled (user-specific access)
- Compression: gzip
- Encryption: Enabled
- Antivirus: Enabled
- Allowed Types: Documents, images, videos, archives

**2. Avatars Bucket**
- ID: `avatars`
- Max Size: 5MB per file
- File Security: Disabled (public read)
- Compression: gzip
- Encryption: Disabled
- Antivirus: Enabled
- Allowed Types: Images only (jpg, jpeg, png, gif)

**Output:**
```
=== Appwrite Storage Setup ===

Creating bucket: Attachments
✓ Bucket Attachments created successfully

Creating bucket: Avatars
✓ Bucket Avatars created successfully

=== Verifying Buckets ===

✓ Bucket Attachments verified:
  - ID: attachments
  - File Security: true
  - Max File Size: 100.00MB
  - Compression: gzip
  - Encryption: true
  - Antivirus: true
  - Allowed Extensions: pdf, doc, docx, ...

✓ Bucket Avatars verified:
  - ID: avatars
  - File Security: false
  - Max File Size: 5.00MB
  - Compression: gzip
  - Encryption: false
  - Antivirus: true
  - Allowed Extensions: jpg, jpeg, png, gif

=== Setup Complete ===
✓ Storage buckets: 2

You can now upload files to the storage buckets in your application.
```

### `verify-database-setup.ts`

Verification script that checks if the database schema is correctly set up.

**Usage:**
```bash
npm run verify:appwrite
```

**What it checks:**
- Database exists
- All collections exist
- Collections have correct attributes
- Indexes are created

### `verify-storage-setup.ts`

Verification script that checks if storage buckets are correctly configured.

**Usage:**
```bash
npm run verify:storage
```

**What it checks:**
- Both buckets exist
- File security settings
- Maximum file sizes
- Compression settings
- Encryption settings
- Antivirus settings
- Allowed file extensions
- Permissions configuration

**Output:**
```
=== Appwrite Storage Verification ===

✓ Bucket: Attachments (attachments)
  ✓ File Security: true
  ✓ Max File Size: 100.00MB
  ✓ Compression: gzip
  ✓ Encryption: true
  ✓ Antivirus: true
  ✓ Allowed Extensions: 16 types
    pdf, doc, docx, xls, xlsx, ppt, pptx, jpg, jpeg, png, gif, svg, mp4, mov, zip, rar
  ℹ Permissions: read("users"), create("users"), update("users"), delete("users")

✓ Bucket: Avatars (avatars)
  ✓ File Security: false
  ✓ Max File Size: 5.00MB
  ✓ Compression: gzip
  ✓ Encryption: false
  ✓ Antivirus: true
  ✓ Allowed Extensions: 4 types
    jpg, jpeg, png, gif
  ℹ Permissions: read("any"), create("users"), update("users"), delete("users")

=== Verification Summary ===
✓ All storage buckets are correctly configured!
✓ Total buckets verified: 2

Storage buckets are ready for use.
```

## Future Scripts

Additional setup scripts may be added for:
- Appwrite Functions deployment
- Initial data seeding
- Development environment setup
