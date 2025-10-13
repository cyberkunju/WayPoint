#!/usr/bin/env tsx
/**
 * Task Dependencies Collection Setup Script
 * Creates the task_dependencies collection in Appwrite
 */

import { Client, Databases, Permission, Role } from 'node-appwrite';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const client = new Client()
  .setEndpoint(process.env.VITE_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1')
  .setProject(process.env.VITE_APPWRITE_PROJECT_ID || '')
  .setKey(process.env.APPWRITE_API_KEY || '');

const databases = new Databases(client);
const DATABASE_ID = 'clarityflow_production';
const COLLECTION_ID = 'task_dependencies';

async function setupTaskDependencies() {
  console.log('Setting up Task Dependencies collection...\n');

  try {
    // Create collection
    console.log('Creating collection:', COLLECTION_ID);
    try {
      await databases.createCollection(
        DATABASE_ID,
        COLLECTION_ID,
        'Task Dependencies',
        [
          Permission.read(Role.user('userId')),
          Permission.create(Role.users()),
          Permission.update(Role.user('userId')),
          Permission.delete(Role.user('userId'))
        ],
        true // documentSecurity
      );
      console.log('✓ Collection created successfully');
    } catch (error: any) {
      if (error.code === 409) {
        console.log('✓ Collection already exists');
      } else {
        throw error;
      }
    }

    // Create attributes
    console.log('\nCreating attributes...');
    
    const attributes = [
      { key: 'userId', type: 'string', size: 255, required: true },
      { key: 'taskId', type: 'string', size: 255, required: true },
      { key: 'dependsOnTaskId', type: 'string', size: 255, required: true },
      { key: 'dependencyType', type: 'string', size: 50, required: true },
      { key: 'lag', type: 'integer', required: false },
      { key: 'notes', type: 'string', size: 1000, required: false }
    ];

    for (const attr of attributes) {
      try {
        if (attr.type === 'string') {
          await databases.createStringAttribute(
            DATABASE_ID,
            COLLECTION_ID,
            attr.key,
            attr.size!,
            attr.required
          );
        } else if (attr.type === 'integer') {
          await databases.createIntegerAttribute(
            DATABASE_ID,
            COLLECTION_ID,
            attr.key,
            attr.required
          );
        }
        console.log(`✓ Created attribute: ${attr.key}`);
      } catch (error: any) {
        if (error.code === 409) {
          console.log(`✓ Attribute ${attr.key} already exists`);
        } else {
          console.error(`✗ Error creating attribute ${attr.key}:`, error.message);
        }
      }
    }

    // Wait for attributes to be ready
    console.log('\nWaiting for attributes to be ready...');
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Create indexes
    console.log('\nCreating indexes...');
    
    const indexes = [
      { key: 'userId_idx', type: 'key', attributes: ['userId'] },
      { key: 'taskId_idx', type: 'key', attributes: ['taskId'] },
      { key: 'dependsOnTaskId_idx', type: 'key', attributes: ['dependsOnTaskId'] },
      { key: 'userId_taskId_idx', type: 'key', attributes: ['userId', 'taskId'] }
    ];

    for (const index of indexes) {
      try {
        await databases.createIndex(
          DATABASE_ID,
          COLLECTION_ID,
          index.key,
          index.type as any,
          index.attributes
        );
        console.log(`✓ Created index: ${index.key}`);
      } catch (error: any) {
        if (error.code === 409) {
          console.log(`✓ Index ${index.key} already exists`);
        } else {
          console.error(`✗ Error creating index ${index.key}:`, error.message);
        }
      }
    }

    console.log('\n✓ Task Dependencies collection setup complete!');
    console.log('\nCollection Details:');
    console.log('- Collection ID: task_dependencies');
    console.log('- Attributes: userId, taskId, dependsOnTaskId, dependencyType, lag, notes');
    console.log('- Indexes: userId, taskId, dependsOnTaskId, userId+taskId');
    console.log('\nYou can now use the task dependencies feature in ClarityFlow!');

  } catch (error) {
    console.error('\n✗ Setup failed:', error);
    process.exit(1);
  }
}

// Run setup
setupTaskDependencies()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
