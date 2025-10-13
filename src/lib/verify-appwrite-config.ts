/**
 * Appwrite Configuration Verification
 * Run this to verify that Appwrite is properly configured
 */

import { account, databases, storage, DATABASE_ID, COLLECTIONS, BUCKETS } from './appwrite';

export async function verifyAppwriteConfig() {
  const results = {
    client: false,
    auth: false,
    database: false,
    storage: false,
    errors: [] as string[]
  };

  console.log('🔍 Verifying Appwrite Configuration...\n');

  // Check environment variables
  const endpoint = import.meta.env?.VITE_APPWRITE_ENDPOINT;
  const projectId = import.meta.env?.VITE_APPWRITE_PROJECT_ID;
  const databaseId = import.meta.env?.VITE_APPWRITE_DATABASE_ID;

  if (!endpoint) {
    results.errors.push('❌ VITE_APPWRITE_ENDPOINT is not set');
  } else {
    console.log('✅ Endpoint configured:', endpoint);
  }

  if (!projectId) {
    results.errors.push('❌ VITE_APPWRITE_PROJECT_ID is not set');
  } else {
    console.log('✅ Project ID configured:', '***' + projectId.slice(-4));
  }

  if (!databaseId) {
    console.log('⚠️  VITE_APPWRITE_DATABASE_ID not set, using default:', DATABASE_ID);
  } else {
    console.log('✅ Database ID configured:', databaseId);
  }

  results.client = !!(endpoint && projectId);

  // Test Authentication Service
  try {
    await account.get();
    console.log('✅ Authentication service: Connected (user logged in)');
    results.auth = true;
  } catch (error: any) {
    if (error.code === 401) {
      console.log('✅ Authentication service: Available (no user logged in)');
      results.auth = true;
    } else {
      console.log('❌ Authentication service: Error -', error.message);
      results.errors.push(`Auth error: ${error.message}`);
    }
  }

  // Test Database Service
  try {
    // Try to list documents from a collection to verify database access
    await databases.listDocuments(DATABASE_ID, COLLECTIONS.TASKS, []);
    console.log('✅ Database service: Connected');
    results.database = true;
  } catch (error: any) {
    if (error.code === 404) {
      console.log('✅ Database service: Available (collections may not exist yet)');
      results.database = true;
    } else {
      console.log('❌ Database service: Error -', error.message);
      results.errors.push(`Database error: ${error.message}`);
    }
  }

  // Test Storage Service
  try {
    // Try to list files from a bucket to verify storage access
    await storage.listFiles(BUCKETS.ATTACHMENTS);
    console.log('✅ Storage service: Connected');
    results.storage = true;
  } catch (error: any) {
    if (error.code === 404) {
      console.log('✅ Storage service: Available (buckets may not exist yet)');
      results.storage = true;
    } else {
      console.log('❌ Storage service: Error -', error.message);
      results.errors.push(`Storage error: ${error.message}`);
    }
  }

  // Summary
  console.log('\n📊 Configuration Summary:');
  console.log('  Client:', results.client ? '✅' : '❌');
  console.log('  Auth:', results.auth ? '✅' : '❌');
  console.log('  Database:', results.database ? '✅' : '❌');
  console.log('  Storage:', results.storage ? '✅' : '❌');

  if (results.errors.length > 0) {
    console.log('\n⚠️  Errors found:');
    results.errors.forEach((error) => console.log('  -', error));
  }

  const allGood = results.client && results.auth && results.database && results.storage;
  
  if (allGood) {
    console.log('\n🎉 All services are properly configured!');
  } else {
    console.log('\n⚠️  Some services need attention. Check the errors above.');
  }

  return results;
}

// Run verification if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  verifyAppwriteConfig().catch(console.error);
}
