#!/usr/bin/env tsx

/**
 * Setup script for Recurring Tasks Processor Appwrite Function
 * 
 * This script helps set up the recurring tasks processor function in Appwrite.
 * It provides instructions and verification steps.
 */

import { Client, Functions } from 'node-appwrite';

const FUNCTION_ID = 'recurring-tasks-processor';

async function main() {
  console.log('🔄 Recurring Tasks Processor Function Setup\n');

  // Check environment variables
  const endpoint = process.env.VITE_APPWRITE_ENDPOINT;
  const projectId = process.env.VITE_APPWRITE_PROJECT_ID;
  const apiKey = process.env.APPWRITE_API_KEY;

  if (!endpoint || !projectId) {
    console.error('❌ Missing required environment variables:');
    console.error('   - VITE_APPWRITE_ENDPOINT');
    console.error('   - VITE_APPWRITE_PROJECT_ID');
    console.error('\nPlease set these in your .env.local file');
    process.exit(1);
  }

  if (!apiKey) {
    console.log('⚠️  APPWRITE_API_KEY not found in environment');
    console.log('   This is required for automated setup\n');
    console.log('📋 Manual Setup Instructions:\n');
    printManualInstructions();
    return;
  }

  // Initialize Appwrite client
  const client = new Client()
    .setEndpoint(endpoint)
    .setProject(projectId)
    .setKey(apiKey);

  const functions = new Functions(client);

  try {
    // Check if function exists
    console.log('🔍 Checking if function exists...');
    
    try {
      const existingFunction = await functions.get(FUNCTION_ID);
      console.log('✅ Function already exists:', existingFunction.name);
      console.log('   Function ID:', existingFunction.$id);
      console.log('   Runtime:', existingFunction.runtime);
      console.log('   Enabled:', existingFunction.enabled);
      
      // Check for schedule
      if (existingFunction.schedule) {
        console.log('   Schedule:', existingFunction.schedule);
      } else {
        console.log('   ⚠️  No schedule configured');
      }
      
      console.log('\n✅ Function is set up and ready to use!');
      console.log('\n📝 To update the function code:');
      console.log('   1. Go to Appwrite Console > Functions');
      console.log('   2. Select "recurring-tasks-processor"');
      console.log('   3. Upload the code from functions/recurring-tasks-processor/');
      
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'code' in error && error.code === 404) {
        console.log('❌ Function does not exist\n');
        console.log('📋 Manual Setup Instructions:\n');
        printManualInstructions();
      } else {
        throw error;
      }
    }
    
  } catch (error) {
    console.error('❌ Error checking function:', error);
    console.log('\n📋 Manual Setup Instructions:\n');
    printManualInstructions();
  }
}

function printManualInstructions() {
  console.log('1️⃣  Create Function in Appwrite Console:');
  console.log('   - Go to your Appwrite Console');
  console.log('   - Navigate to Functions');
  console.log('   - Click "Create Function"');
  console.log('   - Function ID: recurring-tasks-processor');
  console.log('   - Name: Recurring Tasks Processor');
  console.log('   - Runtime: Node.js 20');
  console.log('   - Execute: role:all (or specific roles)');
  console.log('');
  
  console.log('2️⃣  Upload Function Code:');
  console.log('   - In the function settings, go to "Deployments"');
  console.log('   - Click "Create Deployment"');
  console.log('   - Upload the entire functions/recurring-tasks-processor/ directory');
  console.log('   - Entrypoint: src/main.js');
  console.log('   - Click "Deploy"');
  console.log('');
  
  console.log('3️⃣  Configure Environment Variables:');
  console.log('   - In function settings, go to "Settings" > "Environment Variables"');
  console.log('   - Add: DATABASE_ID = clarityflow_production (or your database ID)');
  console.log('   - Note: APPWRITE_FUNCTION_* variables are automatically provided');
  console.log('');
  
  console.log('4️⃣  Set Up Schedule:');
  console.log('   - In function settings, go to "Settings" > "Schedule"');
  console.log('   - Enable schedule');
  console.log('   - Cron expression: 0 0 * * * (runs daily at midnight)');
  console.log('   - Or use: 0 */6 * * * (runs every 6 hours)');
  console.log('   - Save changes');
  console.log('');
  
  console.log('5️⃣  Test the Function:');
  console.log('   - Go to "Executions" tab');
  console.log('   - Click "Execute Now" to test manually');
  console.log('   - Check logs for any errors');
  console.log('   - Verify new task instances are created');
  console.log('');
  
  console.log('6️⃣  Monitor Function:');
  console.log('   - Check execution logs regularly');
  console.log('   - Set up alerts for failures (optional)');
  console.log('   - Monitor task creation in your database');
  console.log('');
  
  console.log('📚 For more information, see:');
  console.log('   functions/recurring-tasks-processor/README.md');
  console.log('');
}

main().catch(console.error);
