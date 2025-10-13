# Appwrite Project Setup Guide

This guide walks you through setting up the Appwrite backend for ClarityFlow.

## Step 1: Create Appwrite Cloud Account

1. Go to [Appwrite Cloud](https://cloud.appwrite.io)
2. Sign up for a new account or log in to existing account
3. Upgrade to **Pro Plan** ($15/month) for production features:
   - Unlimited projects
   - 100GB bandwidth
   - 20GB storage
   - Custom domains
   - Advanced security features

## Step 2: Create New Project

1. Click "Create Project" in the Appwrite Console
2. Set project name: **ClarityFlow**
3. Set project ID: `clarityflow-prod` (or your preferred ID)
4. Choose your preferred region (closest to your users)

## Step 3: Configure Project Settings

### Security Settings
1. Go to **Settings** → **Security**
2. Enable **Session Security** (recommended)
3. Set **Session Length** to 30 days
4. Enable **Password History** (prevent reusing last 5 passwords)
5. Set **Password Dictionary** to prevent common passwords

### CORS Configuration
1. Go to **Settings** → **Platforms**
2. Click **Add Platform** → **Web**
3. Add your domains:
   - `http://localhost:5173` (for development)
   - `https://your-vercel-domain.vercel.app` (your Vercel deployment)
   - `https://your-custom-domain.com` (if using custom domain)

### API Keys (Optional - for server-side operations)
1. Go to **Settings** → **API Keys**
2. Create a new API key with appropriate scopes if needed for server operations

## Step 4: Environment Variables

1. Copy `.env.example` to `.env.local`
2. Update the values:
   ```env
   VITE_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
   VITE_APPWRITE_PROJECT_ID=your_actual_project_id
   VITE_APPWRITE_DATABASE_ID=clarityflow_production
   ```

## Step 5: Verify Setup

After completing the setup, you should have:
- ✅ Appwrite Cloud Pro account
- ✅ ClarityFlow project created
- ✅ Database `clarityflow_production` created
- ✅ Storage buckets created (`attachments`, `avatars`)
- ✅ CORS configured for your domains
- ✅ Environment variables set
- ✅ Appwrite SDK configured in `src/lib/appwrite.ts`
- ✅ Appwrite SDK installed (v21.2.1)

### Automated Verification

You can verify your setup programmatically using the verification functions:

```typescript
import { verifyAppwriteSetup, validateEnvironmentVariables } from './src/lib/appwrite-setup-verification';

// Validate environment variables
const envCheck = validateEnvironmentVariables();
if (!envCheck.valid) {
  console.error('Missing environment variables:', envCheck.missing);
}

// Verify Appwrite services
const setupCheck = await verifyAppwriteSetup();
if (!setupCheck.success) {
  console.error('Setup verification failed:', setupCheck.errors);
}
```

## Next Steps

Once this setup is complete, you can proceed to:
1. **Task 2**: Create Database Schema in Appwrite
2. **Task 3**: Create Storage Buckets
3. **Task 4**: Install and Configure Appwrite SDK

## Troubleshooting

### Common Issues

**CORS Errors**
- Ensure your domain is added to Platforms in Appwrite Console
- Check that the domain matches exactly (including protocol)

**Project ID Not Found**
- Verify the project ID in your environment variables
- Check that the project exists in your Appwrite Console

**Authentication Issues**
- Ensure you're using the correct endpoint URL
- Verify your project ID is correct
- Check that your account has access to the project

## Security Considerations

1. **Never commit `.env.local`** - it's already in `.gitignore`
2. **Use different projects** for development and production
3. **Regularly rotate API keys** if using server-side operations
4. **Monitor usage** in the Appwrite Console to avoid unexpected charges
5. **Set up billing alerts** in your Appwrite account

## Cost Estimation

**Appwrite Pro Plan**: $15/month includes:
- 100GB bandwidth
- 20GB storage
- Unlimited projects
- Advanced features

**Additional costs** (if exceeded):
- Bandwidth: $0.10/GB
- Storage: $0.10/GB/month
- Function executions: $0.0000002 per execution

For a typical productivity app with moderate usage, the base Pro plan should be sufficient.