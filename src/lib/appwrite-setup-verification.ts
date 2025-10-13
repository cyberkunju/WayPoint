import { databases, storage, DATABASE_ID, BUCKETS } from './appwrite';

/**
 * Verifies that the Appwrite setup is working correctly
 * This function should be called during app initialization to ensure
 * all required services are accessible
 * 
 * Note: This is a basic client-side verification. For full verification,
 * use the server-side script: npm run verify:appwrite
 */
export async function verifyAppwriteSetup(): Promise<{
  success: boolean;
  errors: string[];
  details: {
    client: boolean;
    database: boolean;
    storage: boolean;
    buckets: { attachments: boolean; avatars: boolean };
  };
}> {
  const errors: string[] = [];
  const details = {
    client: true, // If we got here, client is initialized
    database: false,
    storage: false,
    buckets: { attachments: false, avatars: false }
  };

  console.log('🔍 Verifying Appwrite setup...');

  try {
    // Test database access by attempting to list documents
    // This will fail gracefully if database doesn't exist or user isn't authenticated
    await databases.listDocuments(DATABASE_ID, 'users_preferences', []);
    details.database = true;
    console.log('✅ Database access successful');
  } catch (error: any) {
    // 404 means database/collection doesn't exist yet (expected during setup)
    // 401 means not authenticated (expected before login)
    if (error.code === 404) {
      errors.push('Database or collections not created yet. Run: npm run setup:appwrite');
    } else if (error.code === 401) {
      // This is actually OK - it means the database exists but user isn't logged in
      details.database = true;
      console.log('✅ Database exists (authentication required for access)');
    } else {
      errors.push(`Database access failed: ${error.message}`);
    }
    console.log('ℹ️ Database check:', error.message);
  }

  try {
    // Test storage access by attempting to list files
    await storage.listFiles(BUCKETS.ATTACHMENTS, []);
    details.storage = true;
    details.buckets.attachments = true;
    console.log('✅ Attachments bucket accessible');
  } catch (error: any) {
    if (error.code === 404) {
      errors.push('Attachments bucket not found');
    } else if (error.code === 401) {
      // Bucket exists but requires authentication
      details.storage = true;
      details.buckets.attachments = true;
      console.log('✅ Attachments bucket exists (authentication required)');
    } else {
      errors.push(`Attachments bucket access failed: ${error.message}`);
    }
  }

  try {
    await storage.listFiles(BUCKETS.AVATARS, []);
    details.buckets.avatars = true;
    console.log('✅ Avatars bucket accessible');
  } catch (error: any) {
    if (error.code === 404) {
      errors.push('Avatars bucket not found');
    } else if (error.code === 401) {
      // Bucket exists but requires authentication
      details.buckets.avatars = true;
      console.log('✅ Avatars bucket exists (authentication required)');
    } else {
      errors.push(`Avatars bucket access failed: ${error.message}`);
    }
  }

  const success = errors.length === 0;
  
  if (success) {
    console.log('🎉 Appwrite setup verification completed successfully!');
  } else {
    console.warn('⚠️ Appwrite setup verification completed with warnings:', errors);
    console.log('ℹ️ Some errors are expected before running setup scripts or logging in');
  }

  return { success, errors, details };
}

/**
 * Environment variables validation
 */
export function validateEnvironmentVariables(): {
  valid: boolean;
  missing: string[];
  warnings: string[];
} {
  const required = ['VITE_APPWRITE_ENDPOINT', 'VITE_APPWRITE_PROJECT_ID'];
  const optional = ['VITE_APPWRITE_DATABASE_ID', 'VITE_APPWRITE_API_KEY'];
  
  const missing: string[] = [];
  const warnings: string[] = [];

  // Check required variables
  required.forEach(varName => {
    if (!import.meta.env[varName]) {
      missing.push(varName);
    }
  });

  // Check optional variables
  optional.forEach(varName => {
    if (!import.meta.env[varName]) {
      warnings.push(`Optional variable ${varName} is not set`);
    }
  });

  // Validate endpoint format
  const endpoint = import.meta.env.VITE_APPWRITE_ENDPOINT;
  if (endpoint && !endpoint.startsWith('https://')) {
    warnings.push('VITE_APPWRITE_ENDPOINT should use HTTPS in production');
  }

  const valid = missing.length === 0;

  if (valid) {
    console.log('✅ Environment variables validation passed');
    if (warnings.length > 0) {
      console.warn('⚠️ Environment warnings:', warnings);
    }
  } else {
    console.error('❌ Environment variables validation failed. Missing:', missing);
  }

  return { valid, missing, warnings };
}