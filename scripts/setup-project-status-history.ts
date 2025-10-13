#!/usr/bin/env tsx

/**
 * Setup script for Project Status History collection
 * 
 * This script creates the project_status_history collection in Appwrite
 * to track status changes for projects.
 * 
 * Run: npm run tsx scripts/setup-project-status-history.ts
 */

import { Client, Databases, Permission, Role, IndexType } from 'node-appwrite';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });
dotenv.config();

const client = new Client()
  .setEndpoint(process.env.VITE_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1')
  .setProject(process.env.VITE_APPWRITE_PROJECT_ID || '')
  .setKey(process.env.APPWRITE_API_KEY || '');

const databases = new Databases(client);
const DATABASE_ID = process.env.VITE_APPWRITE_DATABASE_ID || 'clarityflow_production';
const COLLECTION_ID = 'project_status_history';

async function setupProjectStatusHistoryCollection() {
  console.log('🚀 Setting up Project Status History collection...\n');

  try {
    // Try to get existing collection
    try {
      const existing = await databases.getCollection(DATABASE_ID, COLLECTION_ID);
      console.log(`✅ Collection "${COLLECTION_ID}" already exists`);
      console.log(`   ID: ${existing.$id}`);
      console.log(`   Name: ${existing.name}`);
      console.log(`   Attributes: ${existing.attributes.length}`);
      return;
    } catch (error: any) {
      if (error.code !== 404) {
        throw error;
      }
      // Collection doesn't exist, create it
    }

    // Create collection
    console.log(`📦 Creating collection: ${COLLECTION_ID}`);
    const collection = await databases.createCollection(
      DATABASE_ID,
      COLLECTION_ID,
      'Project Status History',
      [
        Permission.read(Role.users()),
        Permission.create(Role.users()),
        Permission.update(Role.users()),
        Permission.delete(Role.users()),
      ],
      true, // Document security enabled
      true  // Enabled
    );
    console.log(`✅ Collection created: ${collection.$id}\n`);

    // Create attributes
    console.log('📝 Creating attributes...\n');

    // projectId - string (required)
    await databases.createStringAttribute(
      DATABASE_ID,
      COLLECTION_ID,
      'projectId',
      255,
      true
    );
    console.log('✅ Created attribute: projectId (string, 255)');

    // userId - string (required)
    await databases.createStringAttribute(
      DATABASE_ID,
      COLLECTION_ID,
      'userId',
      255,
      true
    );
    console.log('✅ Created attribute: userId (string, 255)');

    // fromStatus - string (required)
    await databases.createStringAttribute(
      DATABASE_ID,
      COLLECTION_ID,
      'fromStatus',
      50,
      true
    );
    console.log('✅ Created attribute: fromStatus (string, 50)');

    // toStatus - string (required)
    await databases.createStringAttribute(
      DATABASE_ID,
      COLLECTION_ID,
      'toStatus',
      50,
      true
    );
    console.log('✅ Created attribute: toStatus (string, 50)');

    // notes - string (optional)
    await databases.createStringAttribute(
      DATABASE_ID,
      COLLECTION_ID,
      'notes',
      5000,
      false
    );
    console.log('✅ Created attribute: notes (string, 5000, optional)');

    // changedAt - datetime (required)
    await databases.createDatetimeAttribute(
      DATABASE_ID,
      COLLECTION_ID,
      'changedAt',
      true
    );
    console.log('✅ Created attribute: changedAt (datetime)');

    // changedBy - string (required)
    await databases.createStringAttribute(
      DATABASE_ID,
      COLLECTION_ID,
      'changedBy',
      255,
      true
    );
    console.log('✅ Created attribute: changedBy (string, 255)');

    // Wait for attributes to be available
    console.log('\n⏳ Waiting for attributes to be available...');
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Create indexes
    console.log('\n📊 Creating indexes...\n');

    // Index on projectId for querying history by project
    await databases.createIndex(
      DATABASE_ID,
      COLLECTION_ID,
      'projectId_idx',
      IndexType.Key,
      ['projectId'],
      ['asc']
    );
    console.log('✅ Created index: projectId_idx');

    // Index on userId for querying history by user
    await databases.createIndex(
      DATABASE_ID,
      COLLECTION_ID,
      'userId_idx',
      IndexType.Key,
      ['userId'],
      ['asc']
    );
    console.log('✅ Created index: userId_idx');

    // Index on changedAt for sorting by date
    await databases.createIndex(
      DATABASE_ID,
      COLLECTION_ID,
      'changedAt_idx',
      IndexType.Key,
      ['changedAt'],
      ['desc']
    );
    console.log('✅ Created index: changedAt_idx');

    // Composite index for project + user queries
    await databases.createIndex(
      DATABASE_ID,
      COLLECTION_ID,
      'projectId_userId_idx',
      IndexType.Key,
      ['projectId', 'userId'],
      ['asc', 'asc']
    );
    console.log('✅ Created index: projectId_userId_idx');

    console.log('\n✨ Project Status History collection setup complete!\n');
    console.log('Collection Details:');
    console.log(`  - ID: ${COLLECTION_ID}`);
    console.log(`  - Name: Project Status History`);
    console.log(`  - Attributes: 7`);
    console.log(`  - Indexes: 4`);
    console.log(`  - Document Security: Enabled`);

  } catch (error: any) {
    console.error('\n❌ Error setting up collection:', error.message);
    if (error.response) {
      console.error('Response:', error.response);
    }
    process.exit(1);
  }
}

// Run setup
setupProjectStatusHistoryCollection()
  .then(() => {
    console.log('\n✅ Setup completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Setup failed:', error);
    process.exit(1);
  });
