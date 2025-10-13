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
const COLLECTION_ID = 'sprints';

async function setupSprintsCollection() {
  try {
    console.log('🚀 Setting up sprints collection...\n');

    // Try to get the collection first
    try {
      await databases.getCollection(DATABASE_ID, COLLECTION_ID);
      console.log('✅ Sprints collection already exists');
      return;
    } catch (error: any) {
      if (error.code !== 404) {
        throw error;
      }
      // Collection doesn't exist, create it
    }

    // Create sprints collection
    console.log('📦 Creating sprints collection...');
    await databases.createCollection(
      DATABASE_ID,
      COLLECTION_ID,
      'Sprints',
      [
        Permission.read(Role.users()),
        Permission.create(Role.users()),
        Permission.update(Role.users()),
        Permission.delete(Role.users())
      ],
      true, // Document security enabled
      true  // Enabled
    );
    console.log('✅ Collection created');

    // Create attributes
    const attributes: Array<{
      key: string;
      type: 'string' | 'datetime' | 'double';
      size?: number;
      required: boolean;
      default?: string | number;
      array?: boolean;
    }> = [
      { key: 'userId', type: 'string', size: 255, required: true },
      { key: 'projectId', type: 'string', size: 255, required: false },
      { key: 'name', type: 'string', size: 255, required: true },
      { key: 'description', type: 'string', size: 5000, required: false },
      { key: 'startDate', type: 'datetime', required: true },
      { key: 'endDate', type: 'datetime', required: true },
      { key: 'goals', type: 'string', size: 5000, required: false },
      { key: 'status', type: 'string', size: 50, required: false, default: 'planning' },
      { key: 'velocity', type: 'double', required: false, default: 0 },
      { key: 'completedPoints', type: 'double', required: false, default: 0 },
      { key: 'totalPoints', type: 'double', required: false, default: 0 },
      { key: 'taskIds', type: 'string', size: 255, array: true, required: false }
    ];

    for (const attr of attributes) {
      try {
        if (attr.type === 'string' && attr.size) {
          await databases.createStringAttribute(
            DATABASE_ID,
            COLLECTION_ID,
            attr.key,
            attr.size,
            attr.required,
            typeof attr.default === 'string' ? attr.default : undefined,
            attr.array || false
          );
        } else if (attr.type === 'datetime') {
          await databases.createDatetimeAttribute(
            DATABASE_ID,
            COLLECTION_ID,
            attr.key,
            attr.required
          );
        } else if (attr.type === 'double') {
          await databases.createFloatAttribute(
            DATABASE_ID,
            COLLECTION_ID,
            attr.key,
            attr.required,
            undefined,
            undefined,
            typeof attr.default === 'number' ? attr.default : undefined
          );
        }
        console.log(`✓ Created attribute: ${attr.key}`);
        
        // Wait a bit between attribute creations
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error: any) {
        if (error.code === 409) {
          console.log(`  Attribute ${attr.key} already exists`);
        } else {
          console.error(`  Error creating attribute ${attr.key}:`, error.message);
        }
      }
    }

    // Wait for attributes to be ready
    console.log('Waiting for attributes to be ready...');
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Create indexes
    const indexes = [
      { key: 'userId_idx', type: IndexType.Key, attributes: ['userId'] },
      { key: 'projectId_idx', type: IndexType.Key, attributes: ['projectId'] },
      { key: 'status_idx', type: IndexType.Key, attributes: ['status'] },
      { key: 'startDate_idx', type: IndexType.Key, attributes: ['startDate'] },
      { key: 'endDate_idx', type: IndexType.Key, attributes: ['endDate'] }
    ];

    for (const index of indexes) {
      try {
        await databases.createIndex(
          DATABASE_ID,
          COLLECTION_ID,
          index.key,
          index.type,
          index.attributes
        );
        console.log(`✓ Created index: ${index.key}`);
        
        // Wait between index creations
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error: any) {
        if (error.code === 409) {
          console.log(`  Index ${index.key} already exists`);
        } else {
          console.error(`  Error creating index ${index.key}:`, error.message);
        }
      }
    }

    console.log('\n✅ Sprints collection setup complete!');
  } catch (error) {
    console.error('Error setting up sprints collection:', error);
    throw error;
  }
}

// Run setup
setupSprintsCollection()
  .then(() => {
    console.log('Setup completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Setup failed:', error);
    process.exit(1);
  });
