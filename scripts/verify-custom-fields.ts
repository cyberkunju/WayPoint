import { Client, Databases } from 'node-appwrite';
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

async function verifyCustomFieldsSetup() {
  console.log('🔍 Verifying Custom Fields collection setup...\n');

  try {
    // Get collection
    const collection = await databases.getCollection(DATABASE_ID, COLLECTION_ID);
    console.log('✅ Collection exists:', collection.name);
    console.log(`   ID: ${collection.$id}`);
    console.log(`   Document Security: ${collection.documentSecurity ? 'Enabled' : 'Disabled'}`);
    console.log(`   Enabled: ${collection.enabled ? 'Yes' : 'No'}`);

    // Get attributes
    console.log('\n📝 Attributes:');
    const attributes = collection.attributes;
    
    const expectedAttributes = [
      { key: 'userId', type: 'string', required: true },
      { key: 'name', type: 'string', required: true },
      { key: 'fieldType', type: 'string', required: true },
      { key: 'description', type: 'string', required: false },
      { key: 'options', type: 'string', required: false, array: true },
      { key: 'defaultValue', type: 'string', required: false },
      { key: 'isRequired', type: 'boolean', required: true },
      { key: 'isGlobal', type: 'boolean', required: true },
      { key: 'projectId', type: 'string', required: false },
      { key: 'position', type: 'integer', required: true },
    ];

    let allAttributesPresent = true;
    for (const expected of expectedAttributes) {
      const attr = attributes.find((a: { key: string }) => a.key === expected.key);
      if (attr) {
        const arrayInfo = expected.array ? ' (array)' : '';
        console.log(`   ✓ ${expected.key} (${expected.type}${arrayInfo}, ${expected.required ? 'required' : 'optional'})`);
      } else {
        console.log(`   ✗ ${expected.key} - MISSING`);
        allAttributesPresent = false;
      }
    }

    // Get indexes
    console.log('\n🔍 Indexes:');
    const indexes = collection.indexes;
    
    const expectedIndexes = [
      'userId_idx',
      'projectId_idx',
      'isGlobal_idx',
      'position_idx'
    ];

    let allIndexesPresent = true;
    for (const expectedIndex of expectedIndexes) {
      const index = indexes.find((i: { key: string }) => i.key === expectedIndex);
      if (index) {
        console.log(`   ✓ ${expectedIndex}`);
      } else {
        console.log(`   ✗ ${expectedIndex} - MISSING`);
        allIndexesPresent = false;
      }
    }

    // Summary
    console.log('\n📊 Verification Summary:');
    if (allAttributesPresent && allIndexesPresent) {
      console.log('   ✅ All attributes present');
      console.log('   ✅ All indexes present');
      console.log('\n🎉 Custom Fields collection is properly configured!');
    } else {
      if (!allAttributesPresent) {
        console.log('   ⚠️  Some attributes are missing');
      }
      if (!allIndexesPresent) {
        console.log('   ⚠️  Some indexes are missing');
      }
      console.log('\n⚠️  Collection setup is incomplete. Run setup-custom-fields.ts again.');
    }

  } catch (error: unknown) {
    const err = error as { code?: number; message?: string };
    if (err.code === 404) {
      console.error('❌ Custom Fields collection not found!');
      console.error('   Run: npm run setup:custom-fields');
    } else {
      console.error('❌ Error verifying collection:', err.message || error);
    }
    throw error;
  }
}

// Run verification
verifyCustomFieldsSetup()
  .then(() => {
    process.exit(0);
  })
  .catch(() => {
    process.exit(1);
  });
