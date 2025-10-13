#!/usr/bin/env tsx
/**
 * Appwrite Storage Setup Script
 * Creates storage buckets for ClarityFlow including attachments and avatars
 */

import { Client, Storage, Permission, Role, Compression } from 'node-appwrite';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const client = new Client()
  .setEndpoint(process.env.VITE_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1')
  .setProject(process.env.VITE_APPWRITE_PROJECT_ID || '')
  .setKey(process.env.APPWRITE_API_KEY || '');

const storage = new Storage(client);

interface BucketConfig {
  id: string;
  name: string;
  permissions: string[];
  fileSecurity: boolean;
  enabled: boolean;
  maximumFileSize: number;
  allowedFileExtensions: string[];
  compression: Compression;
  encryption: boolean;
  antivirus: boolean;
}

const buckets: BucketConfig[] = [
  {
    id: 'attachments',
    name: 'Attachments',
    permissions: [
      Permission.read(Role.users()),
      Permission.create(Role.users()),
      Permission.update(Role.users()),
      Permission.delete(Role.users())
    ],
    fileSecurity: true, // Enable file-level permissions
    enabled: true,
    maximumFileSize: 104857600, // 100MB
    allowedFileExtensions: [
      'pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx',
      'jpg', 'jpeg', 'png', 'gif', 'svg',
      'mp4', 'mov',
      'zip', 'rar'
    ],
    compression: Compression.Gzip,
    encryption: true,
    antivirus: true
  },
  {
    id: 'avatars',
    name: 'Avatars',
    permissions: [
      Permission.read(Role.any()),
      Permission.create(Role.users()),
      Permission.update(Role.users()),
      Permission.delete(Role.users())
    ],
    fileSecurity: false, // Public read access
    enabled: true,
    maximumFileSize: 5242880, // 5MB
    allowedFileExtensions: ['jpg', 'jpeg', 'png', 'gif'],
    compression: Compression.Gzip,
    encryption: false, // No encryption for public avatars
    antivirus: true
  }
];

async function createBucket(config: BucketConfig) {
  console.log(`\nCreating bucket: ${config.name}`);
  
  try {
    await storage.createBucket(
      config.id,
      config.name,
      config.permissions,
      config.fileSecurity,
      config.enabled,
      config.maximumFileSize,
      config.allowedFileExtensions,
      config.compression,
      config.encryption,
      config.antivirus
    );
    console.log(`✓ Bucket ${config.name} created successfully`);
  } catch (error: any) {
    if (error.code === 409) {
      console.log(`✓ Bucket ${config.name} already exists`);
      // Try to update the bucket with the correct configuration
      try {
        await storage.updateBucket(
          config.id,
          config.name,
          config.permissions,
          config.fileSecurity,
          config.enabled,
          config.maximumFileSize,
          config.allowedFileExtensions,
          config.compression,
          config.encryption,
          config.antivirus
        );
        console.log(`✓ Bucket ${config.name} updated with correct configuration`);
      } catch (updateError: any) {
        console.log(`  Note: Could not update bucket configuration: ${updateError.message}`);
      }
    } else {
      throw error;
    }
  }
}

async function verifyBucket(bucketId: string) {
  try {
    const bucket = await storage.getBucket(bucketId);
    console.log(`\n✓ Bucket ${bucket.name} verified:`);
    console.log(`  - ID: ${bucket.$id}`);
    console.log(`  - File Security: ${bucket.fileSecurity}`);
    console.log(`  - Max File Size: ${(bucket.maximumFileSize / 1024 / 1024).toFixed(2)}MB`);
    console.log(`  - Compression: ${bucket.compression}`);
    console.log(`  - Encryption: ${bucket.encryption}`);
    console.log(`  - Antivirus: ${bucket.antivirus}`);
    console.log(`  - Allowed Extensions: ${bucket.allowedFileExtensions.join(', ')}`);
    return true;
  } catch (error: any) {
    console.error(`✗ Bucket ${bucketId} not found:`, error.message);
    return false;
  }
}

async function main() {
  console.log('=== Appwrite Storage Setup ===\n');
  
  // Validate environment variables
  if (!process.env.VITE_APPWRITE_ENDPOINT || !process.env.VITE_APPWRITE_PROJECT_ID || !process.env.APPWRITE_API_KEY) {
    console.error('Error: Missing required environment variables');
    console.error('Please ensure the following are set in .env.local:');
    console.error('  - VITE_APPWRITE_ENDPOINT');
    console.error('  - VITE_APPWRITE_PROJECT_ID');
    console.error('  - APPWRITE_API_KEY');
    process.exit(1);
  }

  try {
    // Create all buckets
    for (const bucket of buckets) {
      await createBucket(bucket);
    }

    console.log('\n=== Verifying Buckets ===');
    
    // Verify all buckets
    for (const bucket of buckets) {
      await verifyBucket(bucket.id);
    }

    console.log('\n=== Setup Complete ===');
    console.log(`✓ Storage buckets: ${buckets.length}`);
    console.log('\nYou can now upload files to the storage buckets in your application.');
  } catch (error) {
    console.error('\n✗ Setup failed:', error);
    process.exit(1);
  }
}

main();
