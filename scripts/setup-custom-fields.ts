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
const COLLECTION_ID = 'custom_fields';

async function setupCustomFieldsCollection() {
  console.log('🚀 Setting up Custom Fields collection...\n');

  try {
    // Try to get the collection first
    try {
      await databases.getCollection(DATABASE_ID, COLLECTION_ID);
      console.log('✅ Custom Fields collection already exists');
      return;
    } catch (error: unknown) {
      const err = error as { code?: number };
      if (err.code !== 404) {
        throw error;
      }
      // Collection doesn't exist, create it
    }

    // Create the collection
    console.log('📦 Creating custom_fields collection...');
    await databases.createCollection(
      DATABASE_ID,
      COLLECTION_ID,
      'Custom Fields',
      [
        Permission.read(Role.users()),
        Permission.create(Role.users()),
        Permission.update(Role.users()),
        Permission.delete(Role.users()),
      ],
      true, // Document security enabled
      true  // Enabled
    );
    console.log('✅ Collection created');

    // Create attributes
    console.log('\n📝 Creating attributes...');

    // userId (string, required)
    await databases.createStringAttribute(
      DATABASE_ID,
      COLLECTION_ID,
      'userId',
      255,
      true
    );
    console.log('  ✓ userId');

    // name (string, required)
    await databases.createStringAttribute(
      DATABASE_ID,
      COLLECTION_ID,
      'name',
      255,
      true
    );
    console.log('  ✓ name');

    // fieldType (string, required)
    await databases.createStringAttribute(
      DATABASE_ID,
      COLLECTION_ID,
      'fieldType',
      50,
      true
    );
    console.log('  ✓ fieldType');

    // description (string, optional)
    await databases.createStringAttribute(
      DATABASE_ID,
      COLLECTION_ID,
      'description',
      1000,
      false
    );
    console.log('  ✓ description');

    // options (string array, optional) - for dropdown/multi-select
    await databases.createStringAttribute(
      DATABASE_ID,
      COLLECTION_ID,
      'options',
      100,
      false,
      undefined,
      true // array
    );
    console.log('  ✓ options');

    // defaultValue (string, optional)
    await databases.createStringAttribute(
      DATABASE_ID,
      COLLECTION_ID,
      'defaultValue',
      500,
      false
    );
    console.log('  ✓ defaultValue');

    // isRequired (boolean, required)
    await databases.createBooleanAttribute(
      DATABASE_ID,
      COLLECTION_ID,
      'isRequired',
      true,
      false
    );
    console.log('  ✓ isRequired');

    // isGlobal (boolean, required)
    await databases.createBooleanAttribute(
      DATABASE_ID,
      COLLECTION_ID,
      'isGlobal',
      true,
      true
    );
    console.log('  ✓ isGlobal');

    // projectId (string, optional)
    await databases.createStringAttribute(
      DATABASE_ID,
      COLLECTION_ID,
      'projectId',
      255,
      false
    );
    console.log('  ✓ projectId');

    // position (integer, required)
    await databases.createIntegerAttribute(
      DATABASE_ID,
      COLLECTION_ID,
      'position',
      true,
      0
    );
    console.log('  ✓ position');

    // Wait for attributes to be available
    console.log('\n⏳ Waiting for attributes to be available...');
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Create indexes
    console.log('\n🔍 Creating indexes...');

    // Index on userId for filtering
    await databases.createIndex(
      DATABASE_ID,
      COLLECTION_ID,
      'userId_idx',
      IndexType.Key,
      ['userId'],
      ['ASC']
    );
    console.log('  ✓ userId_idx');

    // Index on projectId for filtering
    await databases.createIndex(
      DATABASE_ID,
      COLLECTION_ID,
      'projectId_idx',
      IndexType.Key,
      ['projectId'],
      ['ASC']
    );
    console.log('  ✓ projectId_idx');

    // Index on isGlobal for filtering
    await databases.createIndex(
      DATABASE_ID,
      COLLECTION_ID,
      'isGlobal_idx',
      IndexType.Key,
      ['isGlobal'],
      ['ASC']
    );
    console.log('  ✓ isGlobal_idx');

    // Index on position for ordering
    await databases.createIndex(
      DATABASE_ID,
      COLLECTION_ID,
      'position_idx',
      IndexType.Key,
      ['position'],
      ['ASC']
    );
    console.log('  ✓ position_idx');

    console.log('\n✅ Custom Fields collection setup complete!');
    console.log('\n📊 Collection Details:');
    console.log(`   Database ID: ${DATABASE_ID}`);
    console.log(`   Collection ID: ${COLLECTION_ID}`);
    console.log(`   Document Security: Enabled`);
    console.log(`   Permissions: User-based (read/write own documents)`);

  } catch (error) {
    console.error('\n❌ Error setting up Custom Fields collection:', error);
    throw error;
  }
}

// Run the setup
setupCustomFieldsCollection()
  .then(() => {
    console.log('\n🎉 Setup completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Setup failed:', error);
    process.exit(1);
  });
