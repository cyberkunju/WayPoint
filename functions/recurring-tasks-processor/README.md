# Recurring Tasks Processor Function

This Appwrite Function processes recurring tasks daily by creating new task instances based on recurrence patterns.

## Features

- Processes recurring tasks where `nextOccurrence` is in the past
- Creates new task instances with updated due dates
- Updates `nextOccurrence` to the next calculated date
- Increments occurrence count
- Respects end conditions (max occurrences or end date)
- Handles multiple recurrence patterns: daily, weekly, monthly, yearly, custom

## Environment Variables

Required environment variables (automatically provided by Appwrite):
- `APPWRITE_FUNCTION_API_ENDPOINT` - Appwrite API endpoint
- `APPWRITE_FUNCTION_PROJECT_ID` - Project ID
- `APPWRITE_API_KEY` - API key with appropriate permissions
- `DATABASE_ID` - Database ID (defaults to 'clarityflow_production')

## Deployment

### Using Appwrite Console

1. Go to your Appwrite Console
2. Navigate to Functions
3. Create a new function with ID: `recurring-tasks-processor`
4. Set runtime to Node.js 20
5. Upload the function code
6. Configure environment variables
7. Set up a schedule trigger: `0 0 * * *` (runs daily at midnight)

### Using Appwrite CLI

```bash
# Deploy function
appwrite functions create \
  --functionId recurring-tasks-processor \
  --name "Recurring Tasks Processor" \
  --runtime node-20.0 \
  --execute role:all \
  --path functions/recurring-tasks-processor

# Create schedule trigger (daily at midnight)
appwrite functions createExecution \
  --functionId recurring-tasks-processor \
  --schedule "0 0 * * *"
```

## Permissions Required

The function requires an API key with the following permissions:
- `databases.read` - Read recurring tasks and original tasks
- `databases.write` - Create new task instances and update recurring tasks
- `databases.delete` - Delete completed recurring tasks (optional)

## Testing

You can manually trigger the function for testing:

```bash
# Using Appwrite CLI
appwrite functions createExecution \
  --functionId recurring-tasks-processor

# Using curl
curl -X POST \
  https://cloud.appwrite.io/v1/functions/recurring-tasks-processor/executions \
  -H "X-Appwrite-Project: YOUR_PROJECT_ID" \
  -H "X-Appwrite-Key: YOUR_API_KEY"
```

## Response Format

```json
{
  "success": true,
  "processed": 5,
  "errors": 0,
  "total": 5
}
```

## Error Handling

- Individual task processing errors are logged but don't stop the batch
- Fatal errors return a 500 status with error details
- All errors are logged to Appwrite Function logs

## Recurrence Pattern Format

The function expects recurrence patterns in the following JSON format:

```json
{
  "frequency": "weekly",
  "interval": 2,
  "daysOfWeek": [1, 3, 5]
}
```

Supported frequencies:
- `daily` - Every N days
- `weekly` - Specific days of the week
- `monthly` - Specific day of the month
- `yearly` - Specific month and day
- `custom` - Custom rules (defaults to daily)

## Monitoring

Monitor function executions in the Appwrite Console:
1. Go to Functions > recurring-tasks-processor
2. View Executions tab
3. Check logs for processing details
4. Set up alerts for failures (optional)
