#!/usr/bin/env tsx
/**
 * Appwrite Storage Verification Script
 * Verifies that storage buckets are correctly configured
 */

import { Client, Storage } from 'node-appwrite';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const client = new Client()
  .setEndpoint(process.env.VITE_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1')
  .setProject(process.env.VITE_APPWRITE_PROJECT_ID || '')
  .setKey(process.env.APPWRITE_API_KEY || '');

const storage = new Storage(client);

interface BucketExpectation {
  id: string;
  name: string;
  fileSecurity: boolean;
  maximumFileSize: number;
  compression: string;
  encryption: boolean;
  antivirus: boolean;
  allowedExtensions: string[];
}

const expectedBuckets: BucketExpectation[] = [
  {
    id: 'attachments',
    name: 'Attachments',
    fileSecurity: true,
    maximumFileSize: 104857600, // 100MB
    compression: 'gzip',
    encryption: true,
    antivirus: true,
    allowedExtensions: ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'jpg', 'jpeg', 'png', 'gif', 'svg', 'mp4', 'mov', 'zip', 'rar']
  },
  {
    id: 'avatars',
    name: 'Avatars',
    fileSecurity: false,
    maximumFileSize: 5242880, // 5MB
    compression: 'gzip',
    encryption: false,
    antivirus: true,
    allowedExtensions: ['jpg', 'jpeg', 'png', 'gif']
  }
];

async function verifyBucket(expected: BucketExpectation): Promise<boolean> {
  try {
    const bucket = await storage.getBucket(expected.id);
    
    console.log(`\n✓ Bucket: ${bucket.name} (${bucket.$id})`);
    
    let allChecksPass = true;
    
    // Verify file security
    if (bucket.fileSecurity === expected.fileSecurity) {
      console.log(`  ✓ File Security: ${bucket.fileSecurity}`);
    } else {
      console.log(`  ✗ File Security: Expected ${expected.fileSecurity}, got ${bucket.fileSecurity}`);
      allChecksPass = false;
    }
    
    // Verify max file size
    if (bucket.maximumFileSize === expected.maximumFileSize) {
      console.log(`  ✓ Max File Size: ${(bucket.maximumFileSize / 1024 / 1024).toFixed(2)}MB`);
    } else {
      console.log(`  ✗ Max File Size: Expected ${(expected.maximumFileSize / 1024 / 1024).toFixed(2)}MB, got ${(bucket.maximumFileSize / 1024 / 1024).toFixed(2)}MB`);
      allChecksPass = false;
    }
    
    // Verify compression
    if (bucket.compression === expected.compression) {
      console.log(`  ✓ Compression: ${bucket.compression}`);
    } else {
      console.log(`  ✗ Compression: Expected ${expected.compression}, got ${bucket.compression}`);
      allChecksPass = false;
    }
    
    // Verify encryption
    if (bucket.encryption === expected.encryption) {
      console.log(`  ✓ Encryption: ${bucket.encryption}`);
    } else {
      console.log(`  ✗ Encryption: Expected ${expected.encryption}, got ${bucket.encryption}`);
      allChecksPass = false;
    }
    
    // Verify antivirus
    if (bucket.antivirus === expected.antivirus) {
      console.log(`  ✓ Antivirus: ${bucket.antivirus}`);
    } else {
      console.log(`  ✗ Antivirus: Expected ${expected.antivirus}, got ${bucket.antivirus}`);
      allChecksPass = false;
    }
    
    // Verify allowed extensions
    const missingExtensions = expected.allowedExtensions.filter(ext => !bucket.allowedFileExtensions.includes(ext));
    const extraExtensions = bucket.allowedFileExtensions.filter(ext => !expected.allowedExtensions.includes(ext));
    
    if (missingExtensions.length === 0 && extraExtensions.length === 0) {
      console.log(`  ✓ Allowed Extensions: ${bucket.allowedFileExtensions.length} types`);
      console.log(`    ${bucket.allowedFileExtensions.join(', ')}`);
    } else {
      console.log(`  ✗ Allowed Extensions mismatch:`);
      if (missingExtensions.length > 0) {
        console.log(`    Missing: ${missingExtensions.join(', ')}`);
      }
      if (extraExtensions.length > 0) {
        console.log(`    Extra: ${extraExtensions.join(', ')}`);
      }
      allChecksPass = false;
    }
    
    // Verify permissions
    console.log(`  ℹ Permissions: ${bucket.$permissions.join(', ')}`);
    
    return allChecksPass;
  } catch (error: any) {
    console.error(`\n✗ Bucket ${expected.id} not found or error:`, error.message);
    return false;
  }
}

async function main() {
  console.log('=== Appwrite Storage Verification ===\n');
  
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
    let allBucketsValid = true;
    
    for (const expected of expectedBuckets) {
      const isValid = await verifyBucket(expected);
      if (!isValid) {
        allBucketsValid = false;
      }
    }
    
    console.log('\n=== Verification Summary ===');
    
    if (allBucketsValid) {
      console.log('✓ All storage buckets are correctly configured!');
      console.log(`✓ Total buckets verified: ${expectedBuckets.length}`);
      console.log('\nStorage buckets are ready for use.');
    } else {
      console.log('✗ Some storage buckets have configuration issues.');
      console.log('Please run the setup script to fix: npm run setup:storage');
      process.exit(1);
    }
  } catch (error) {
    console.error('\n✗ Verification failed:', error);
    process.exit(1);
  }
}

main();
