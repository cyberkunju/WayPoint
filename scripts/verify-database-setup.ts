#!/usr/bin/env tsx
/**
 * Appwrite Database Verification Script
 * Verifies that the database schema has been set up correctly
 */

import { Client, Databases } from 'node-appwrite';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const client = new Client()
  .setEndpoint(process.env.VITE_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1')
  .setProject(process.env.VITE_APPWRITE_PROJECT_ID || '')
  .setKey(process.env.APPWRITE_API_KEY || '');

const databases = new Databases(client);
const DATABASE_ID = 'clarityflow_production';

const EXPECTED_COLLECTIONS = [
  'users_preferences',
  'projects',
  'epics',
  'tasks',
  'recurring_tasks',
  'labels',
  'notes',
  'note_links',
  'goals',
  'goal_links',
  'habits',
  'habit_completions',
  'wellbeing_logs',
  'focus_sessions',
  'time_entries',
  'automation_rules',
  'saved_filters',
  'templates',
  'integrations',
  'weekly_reviews'
];

async function verifyDatabase() {
  console.log('=== Appwrite Database Verification ===\n');

  try {
    // Check database exists
    console.log('Checking database...');
    const database = await databases.get(DATABASE_ID);
    console.log(`✓ Database "${database.name}" exists (ID: ${database.$id})`);
    console.log(`  Created: ${database.$createdAt}`);
    console.log(`  Enabled: ${database.enabled}\n`);

    // List all collections
    console.log('Checking collections...');
    const collections = await databases.listCollections(DATABASE_ID);
    console.log(`✓ Found ${collections.total} collections\n`);

    // Check each expected collection
    const foundCollections = collections.collections.map(c => c.$id);
    const missingCollections = EXPECTED_COLLECTIONS.filter(
      id => !foundCollections.includes(id)
    );

    if (missingCollections.length > 0) {
      console.log('⚠ Missing collections:');
      missingCollections.forEach(id => console.log(`  - ${id}`));
      console.log('');
    }

    // Detailed check for each collection
    console.log('Collection Details:\n');
    for (const collectionId of EXPECTED_COLLECTIONS) {
      try {
        const collection = await databases.getCollection(DATABASE_ID, collectionId);
        const attributesReady = collection.attributes.filter(
          (attr: any) => attr.status === 'available'
        ).length;
        const attributesProcessing = collection.attributes.filter(
          (attr: any) => attr.status === 'processing'
        ).length;
        const indexesReady = collection.indexes.filter(
          (idx: any) => idx.status === 'available'
        ).length;
        const indexesProcessing = collection.indexes.filter(
          (idx: any) => idx.status === 'processing'
        ).length;

        console.log(`✓ ${collection.name} (${collectionId})`);
        console.log(`  Attributes: ${attributesReady} available, ${attributesProcessing} processing`);
        console.log(`  Indexes: ${indexesReady} available, ${indexesProcessing} processing`);
        console.log(`  Document Security: ${collection.documentSecurity}`);
        console.log(`  Enabled: ${collection.enabled}\n`);
      } catch (error: any) {
        if (error.code === 404) {
          console.log(`✗ ${collectionId} - NOT FOUND\n`);
        } else {
          console.log(`✗ ${collectionId} - ERROR: ${error.message}\n`);
        }
      }
    }

    // Summary
    console.log('=== Verification Summary ===');
    console.log(`Database: ${database.enabled ? '✓' : '✗'} Enabled`);
    console.log(`Collections: ${collections.total}/${EXPECTED_COLLECTIONS.length} created`);
    
    if (missingCollections.length === 0) {
      console.log('\n✓ All collections created successfully!');
      console.log('\nNext steps:');
      console.log('1. Wait for any "processing" attributes/indexes to become "available"');
      console.log('2. Proceed to Task 4: Install and Configure Appwrite SDK');
      console.log('3. Begin implementing authentication');
    } else {
      console.log(`\n⚠ ${missingCollections.length} collections missing`);
      console.log('Run: npm run setup:appwrite');
    }

  } catch (error: any) {
    console.error('\n✗ Verification failed:', error.message);
    if (error.code === 404) {
      console.error('\nDatabase not found. Run: npm run setup:appwrite');
    } else if (error.code === 401) {
      console.error('\nAuthentication failed. Check your APPWRITE_API_KEY in .env.local');
    }
    process.exit(1);
  }
}

verifyDatabase();
