# Design Document - Appwrite Backend Integration

## Overview

ClarityFlow will leverage Appwrite.io as the Backend-as-a-Service (BaaS) platform, utilizing its built-in features for authentication, database, storage, and real-time capabilities. This approach significantly reduces development time while providing enterprise-grade infrastructure.

### Design Goals

1. **Leverage Appwrite Services**: Use Appwrite's built-in features (Auth, Databases, Storage, Functions, Realtime)
2. **Minimize Custom Backend**: Only build custom logic where Appwrite doesn't provide the functionality
3. **Offline-First**: Maintain existing offline capabilities with Appwrite sync
4. **Performance**: Sub-200ms operations with Appwrite's optimized infrastructure
5. **Scalability**: Let Appwrite handle scaling automatically
6. **Security**: Use Appwrite's built-in security features

### Appwrite Services Used

**Core Services:**
- **Authentication**: User registration, login, sessions, OAuth providers
- **Databases**: Document-based storage with relationships and indexes
- **Storage**: File uploads for attachments and media
- **Functions**: Serverless functions for custom logic (AI, automation, analytics)
- **Realtime**: WebSocket-based real-time updates
- **Teams**: For future collaboration features (optional)

**Additional Features:**
- **Permissions**: Row-level security for data isolation
- **Webhooks**: Event-driven integrations
- **Migrations**: Database schema versioning
- **Backups**: Automated backups

### Technology Stack

**Frontend (Vercel):**
- React 19 + TypeScript + Vite
- Zustand for state management
- Appwrite Web SDK for API calls
- IndexedDB for offline storage
- Service Workers for PWA
- Deployed on Vercel (Free Plan)

**Backend (Appwrite Pro):**
- Appwrite Cloud (Pro Plan - $15/month)
- Node.js Functions for custom logic
- PostgreSQL (Appwrite's database)
- S3-compatible storage (Appwrite's storage)
- Realtime (WebSocket)

**External Services:**
- OpenAI API for AI features
- SendGrid/Resend for emails
- Calendar APIs (Google, Outlook)

## Architecture

### High-Level Architecture with Vercel + Appwrite

```
┌─────────────────────────────────────────────────────────────────┐
│                    Vercel (Frontend Hosting)                     │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              React 19 + Vite PWA                          │  │
│  │  - Static assets served via Vercel Edge CDN              │  │
│  │  - Automatic deployments from Git                        │  │
│  │  - Preview deployments for PRs                           │  │
│  │  - Custom domain support                                 │  │
│  │  - Environment variables                                 │  │
│  └──────────────────────────────────────────────────────────┘  │
│                    Cost: $0/month (Free Plan)                   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ HTTPS/WSS (Appwrite SDK)
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Appwrite Platform                           │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                    Appwrite API Gateway                   │  │
│  │  - Rate Limiting                                          │  │
│  │  - SSL/TLS                                                │  │
│  │  - Request Routing                                        │  │
│  └──────────────────────────────────────────────────────────┘  │
│                              │                                   │
│  ┌──────────────┬────────────┬────────────┬──────────────┐    │
│  │              │            │            │              │    │
│  ▼              ▼            ▼            ▼              ▼    │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────┐ │
│  │   Auth   │ │ Database │ │ Storage  │ │ Realtime │ │Func│ │
│  │  Service │ │  Service │ │ Service  │ │ Service  │ │tions│ │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └────┘ │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │              Appwrite Database (PostgreSQL)               │ │
│  │  - Collections (Tasks, Projects, Notes, Goals, etc.)     │ │
│  │  - Indexes & Relationships                               │ │
│  │  - Row-level Permissions                                 │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │              Appwrite Storage (S3-compatible)             │ │
│  │  - Buckets for attachments                               │ │
│  │  - Image optimization                                     │ │
│  │  - CDN delivery                                           │ │
│  └──────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Appwrite Functions (Serverless)               │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐          │
│  │    AI    │ │Analytics │ │Automation│ │  Sync    │          │
│  │ Assistant│ │ Generator│ │  Rules   │ │ Resolver │          │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    External Services                             │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐          │
│  │  OpenAI  │ │ SendGrid │ │  Google  │ │  GitHub  │          │
│  │   API    │ │  Email   │ │ Calendar │ │   API    │          │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘          │
└─────────────────────────────────────────────────────────────────┘
```

### Architecture Patterns

**1. Appwrite-First Architecture**
- Use Appwrite's built-in services wherever possible
- Custom logic only in Appwrite Functions
- Client-side SDK for direct database access
- Permissions-based security model

**2. Offline-First with Appwrite Realtime**
- IndexedDB for local storage (existing)
- Appwrite Realtime for live updates
- Sync queue for offline changes
- Conflict resolution with timestamps

**3. Function-as-a-Service for Custom Logic**
- AI processing (natural language, insights)
- Analytics generation
- Automation rule execution
- Complex calculations (goal progress, streaks)

**4. Permission-Based Security**
- Document-level permissions
- User can only access their own data
- No need for custom authorization logic

## Data Models (Appwrite Collections)

### Appwrite Database Structure

**Database: `clarityflow_production`**

**Collection: `users_preferences`**
```json
{
  "name": "users_preferences",
  "attributes": [
    { "key": "userId", "type": "string", "size": 255, "required": true },
    { "key": "theme", "type": "string", "size": 20, "default": "light" },
    { "key": "density", "type": "string", "size": 20, "default": "comfortable" },
    { "key": "primaryColor", "type": "string", "size": 7, "default": "#2E5AAC" },
    { "key": "fontSize", "type": "string", "size": 20, "default": "medium" },
    { "key": "sidebarCollapsed", "type": "boolean", "default": false },
    { "key": "defaultView", "type": "string", "size": 50, "default": "list" },
    { "key": "taskReminders", "type": "boolean", "default": true },
    { "key": "dailySummary", "type": "boolean", "default": true },
    { "key": "overdueAlerts", "type": "boolean", "default": true },
    { "key": "quietHoursStart", "type": "string", "size": 5 },
    { "key": "quietHoursEnd", "type": "string", "size": 5 }
  ],
  "indexes": [
    { "key": "userId", "type": "unique", "attributes": ["userId"] }
  ],
  "permissions": {
    "read": ["user:{userId}"],
    "write": ["user:{userId}"],
    "create": ["users"],
    "delete": ["user:{userId}"]
  }
}
```

**Collection: `projects`**
```json
{
  "name": "projects",
  "attributes": [
    { "key": "userId", "type": "string", "size": 255, "required": true },
    { "key": "name", "type": "string", "size": 255, "required": true },
    { "key": "description", "type": "string", "size": 10000 },
    { "key": "color", "type": "string", "size": 7, "default": "#2E5AAC" },
    { "key": "status", "type": "string", "size": 50, "default": "active" },
    { "key": "parentId", "type": "string", "size": 255 },
    { "key": "isExpanded", "type": "boolean", "default": true },
    { "key": "startDate", "type": "datetime" },
    { "key": "endDate", "type": "datetime" },
    { "key": "labels", "type": "string", "size": 1000, "array": true },
    { "key": "position", "type": "integer", "default": 0 }
  ],
  "indexes": [
    { "key": "userId_idx", "type": "key", "attributes": ["userId"] },
    { "key": "parentId_idx", "type": "key", "attributes": ["parentId"] },
    { "key": "status_idx", "type": "key", "attributes": ["status"] }
  ],
  "permissions": {
    "read": ["user:{userId}"],
    "write": ["user:{userId}"],
    "create": ["users"],
    "delete": ["user:{userId}"]
  }
}
```

**Collection: `epics`**
```json
{
  "name": "epics",
  "attributes": [
    { "key": "userId", "type": "string", "size": 255, "required": true },
    { "key": "projectId", "type": "string", "size": 255 },
    { "key": "name", "type": "string", "size": 255, "required": true },
    { "key": "description", "type": "string", "size": 10000 },
    { "key": "parentEpicId", "type": "string", "size": 255 },
    { "key": "startDate", "type": "datetime" },
    { "key": "endDate", "type": "datetime" },
    { "key": "status", "type": "string", "size": 50, "default": "planning" },
    { "key": "progressPercentage", "type": "integer", "default": 0 }
  ],
  "indexes": [
    { "key": "userId_idx", "type": "key", "attributes": ["userId"] },
    { "key": "projectId_idx", "type": "key", "attributes": ["projectId"] }
  ],
  "permissions": {
    "read": ["user:{userId}"],
    "write": ["user:{userId}"],
    "create": ["users"],
    "delete": ["user:{userId}"]
  }
}
```

**Collection: `tasks`**
```json
{
  "name": "tasks",
  "attributes": [
    { "key": "userId", "type": "string", "size": 255, "required": true },
    { "key": "title", "type": "string", "size": 500, "required": true },
    { "key": "description", "type": "string", "size": 10000 },
    { "key": "completed", "type": "boolean", "default": false },
    { "key": "priority", "type": "integer", "default": 4, "min": 1, "max": 4 },
    { "key": "dueDate", "type": "datetime" },
    { "key": "startDate", "type": "datetime" },
    { "key": "completedAt", "type": "datetime" },
    { "key": "projectId", "type": "string", "size": 255 },
    { "key": "epicId", "type": "string", "size": 255 },
    { "key": "parentId", "type": "string", "size": 255 },
    { "key": "assignee", "type": "string", "size": 255 },
    { "key": "labels", "type": "string", "size": 100, "array": true },
    { "key": "dependencies", "type": "string", "size": 255, "array": true },
    { "key": "estimatedTime", "type": "integer" },
    { "key": "actualTime", "type": "integer" },
    { "key": "position", "type": "integer", "default": 0 },
    { "key": "customFields", "type": "string", "size": 5000 }
  ],
  "indexes": [
    { "key": "userId_idx", "type": "key", "attributes": ["userId"] },
    { "key": "projectId_idx", "type": "key", "attributes": ["projectId"] },
    { "key": "epicId_idx", "type": "key", "attributes": ["epicId"] },
    { "key": "dueDate_idx", "type": "key", "attributes": ["dueDate"] },
    { "key": "completed_idx", "type": "key", "attributes": ["completed"] },
    { "key": "priority_idx", "type": "key", "attributes": ["priority"] },
    { "key": "userId_completed", "type": "key", "attributes": ["userId", "completed"] }
  ],
  "permissions": {
    "read": ["user:{userId}"],
    "write": ["user:{userId}"],
    "create": ["users"],
    "delete": ["user:{userId}"]
  }
}
```

**Collection: `recurring_tasks`**
```json
{
  "name": "recurring_tasks",
  "attributes": [
    { "key": "taskId", "type": "string", "size": 255, "required": true },
    { "key": "userId", "type": "string", "size": 255, "required": true },
    { "key": "recurrencePattern", "type": "string", "size": 2000, "required": true },
    { "key": "nextOccurrence", "type": "datetime" },
    { "key": "endDate", "type": "datetime" },
    { "key": "maxOccurrences", "type": "integer" },
    { "key": "occurrencesCount", "type": "integer", "default": 0 }
  ],
  "indexes": [
    { "key": "taskId_idx", "type": "unique", "attributes": ["taskId"] },
    { "key": "userId_idx", "type": "key", "attributes": ["userId"] }
  ],
  "permissions": {
    "read": ["user:{userId}"],
    "write": ["user:{userId}"],
    "create": ["users"],
    "delete": ["user:{userId}"]
  }
}
```

**Collection: `labels`**
```json
{
  "name": "labels",
  "attributes": [
    { "key": "userId", "type": "string", "size": 255, "required": true },
    { "key": "name", "type": "string", "size": 100, "required": true },
    { "key": "color", "type": "string", "size": 7, "default": "#F2994A" }
  ],
  "indexes": [
    { "key": "userId_idx", "type": "key", "attributes": ["userId"] },
    { "key": "userId_name", "type": "unique", "attributes": ["userId", "name"] }
  ],
  "permissions": {
    "read": ["user:{userId}"],
    "write": ["user:{userId}"],
    "create": ["users"],
    "delete": ["user:{userId}"]
  }
}
```

**Collection: `notes`**
```json
{
  "name": "notes",
  "attributes": [
    { "key": "userId", "type": "string", "size": 255, "required": true },
    { "key": "title", "type": "string", "size": 500, "required": true },
    { "key": "content", "type": "string", "size": 100000 },
    { "key": "contentHtml", "type": "string", "size": 100000 },
    { "key": "parentId", "type": "string", "size": 255 },
    { "key": "projectId", "type": "string", "size": 255 },
    { "key": "isTemplate", "type": "boolean", "default": false },
    { "key": "templateType", "type": "string", "size": 50 },
    { "key": "tags", "type": "string", "size": 100, "array": true }
  ],
  "indexes": [
    { "key": "userId_idx", "type": "key", "attributes": ["userId"] },
    { "key": "projectId_idx", "type": "key", "attributes": ["projectId"] },
    { "key": "parentId_idx", "type": "key", "attributes": ["parentId"] }
  ],
  "permissions": {
    "read": ["user:{userId}"],
    "write": ["user:{userId}"],
    "create": ["users"],
    "delete": ["user:{userId}"]
  }
}
```

**Collection: `note_links`**
```json
{
  "name": "note_links",
  "attributes": [
    { "key": "userId", "type": "string", "size": 255, "required": true },
    { "key": "sourceType", "type": "string", "size": 50, "required": true },
    { "key": "sourceId", "type": "string", "size": 255, "required": true },
    { "key": "targetType", "type": "string", "size": 50, "required": true },
    { "key": "targetId", "type": "string", "size": 255, "required": true },
    { "key": "linkText", "type": "string", "size": 255 }
  ],
  "indexes": [
    { "key": "source_idx", "type": "key", "attributes": ["sourceType", "sourceId"] },
    { "key": "target_idx", "type": "key", "attributes": ["targetType", "targetId"] }
  ],
  "permissions": {
    "read": ["user:{userId}"],
    "write": ["user:{userId}"],
    "create": ["users"],
    "delete": ["user:{userId}"]
  }
}
```

**Collection: `goals`**
```json
{
  "name": "goals",
  "attributes": [
    { "key": "userId", "type": "string", "size": 255, "required": true },
    { "key": "title", "type": "string", "size": 500, "required": true },
    { "key": "description", "type": "string", "size": 10000 },
    { "key": "goalType", "type": "string", "size": 50, "default": "objective" },
    { "key": "parentGoalId", "type": "string", "size": 255 },
    { "key": "targetValue", "type": "float" },
    { "key": "currentValue", "type": "float", "default": 0 },
    { "key": "unit", "type": "string", "size": 50 },
    { "key": "startDate", "type": "datetime" },
    { "key": "endDate", "type": "datetime" },
    { "key": "status", "type": "string", "size": 50, "default": "active" },
    { "key": "progressPercentage", "type": "integer", "default": 0 }
  ],
  "indexes": [
    { "key": "userId_idx", "type": "key", "attributes": ["userId"] },
    { "key": "parentGoalId_idx", "type": "key", "attributes": ["parentGoalId"] }
  ],
  "permissions": {
    "read": ["user:{userId}"],
    "write": ["user:{userId}"],
    "create": ["users"],
    "delete": ["user:{userId}"]
  }
}
```

**Collection: `goal_links`**
```json
{
  "name": "goal_links",
  "attributes": [
    { "key": "goalId", "type": "string", "size": 255, "required": true },
    { "key": "userId", "type": "string", "size": 255, "required": true },
    { "key": "entityType", "type": "string", "size": 50, "required": true },
    { "key": "entityId", "type": "string", "size": 255, "required": true },
    { "key": "contributionWeight", "type": "float", "default": 1.0 }
  ],
  "indexes": [
    { "key": "goalId_idx", "type": "key", "attributes": ["goalId"] },
    { "key": "entity_idx", "type": "key", "attributes": ["entityType", "entityId"] }
  ],
  "permissions": {
    "read": ["user:{userId}"],
    "write": ["user:{userId}"],
    "create": ["users"],
    "delete": ["user:{userId}"]
  }
}
```

**Collection: `habits`**
```json
{
  "name": "habits",
  "attributes": [
    { "key": "userId", "type": "string", "size": 255, "required": true },
    { "key": "name", "type": "string", "size": 255, "required": true },
    { "key": "description", "type": "string", "size": 1000 },
    { "key": "frequency", "type": "string", "size": 50, "required": true },
    { "key": "targetCount", "type": "integer", "default": 1 },
    { "key": "customSchedule", "type": "string", "size": 500 },
    { "key": "currentStreak", "type": "integer", "default": 0 },
    { "key": "longestStreak", "type": "integer", "default": 0 },
    { "key": "archived", "type": "boolean", "default": false }
  ],
  "indexes": [
    { "key": "userId_idx", "type": "key", "attributes": ["userId"] }
  ],
  "permissions": {
    "read": ["user:{userId}"],
    "write": ["user:{userId}"],
    "create": ["users"],
    "delete": ["user:{userId}"]
  }
}
```

**Collection: `habit_completions`**
```json
{
  "name": "habit_completions",
  "attributes": [
    { "key": "habitId", "type": "string", "size": 255, "required": true },
    { "key": "userId", "type": "string", "size": 255, "required": true },
    { "key": "completedAt", "type": "datetime", "required": true },
    { "key": "notes", "type": "string", "size": 1000 }
  ],
  "indexes": [
    { "key": "habitId_idx", "type": "key", "attributes": ["habitId"] },
    { "key": "completedAt_idx", "type": "key", "attributes": ["completedAt"] }
  ],
  "permissions": {
    "read": ["user:{userId}"],
    "write": ["user:{userId}"],
    "create": ["users"],
    "delete": ["user:{userId}"]
  }
}
```

**Collection: `wellbeing_logs`**
```json
{
  "name": "wellbeing_logs",
  "attributes": [
    { "key": "userId", "type": "string", "size": 255, "required": true },
    { "key": "logDate", "type": "datetime", "required": true },
    { "key": "sleepQuality", "type": "integer", "min": 1, "max": 5 },
    { "key": "energyLevel", "type": "integer", "min": 1, "max": 5 },
    { "key": "mood", "type": "integer", "min": 1, "max": 5 },
    { "key": "notes", "type": "string", "size": 1000 }
  ],
  "indexes": [
    { "key": "userId_date", "type": "unique", "attributes": ["userId", "logDate"] }
  ],
  "permissions": {
    "read": ["user:{userId}"],
    "write": ["user:{userId}"],
    "create": ["users"],
    "delete": ["user:{userId}"]
  }
}
```

**Collection: `focus_sessions`**
```json
{
  "name": "focus_sessions",
  "attributes": [
    { "key": "userId", "type": "string", "size": 255, "required": true },
    { "key": "taskId", "type": "string", "size": 255 },
    { "key": "startTime", "type": "datetime", "required": true },
    { "key": "endTime", "type": "datetime" },
    { "key": "durationMinutes", "type": "integer" },
    { "key": "sessionType", "type": "string", "size": 50, "default": "pomodoro" },
    { "key": "wasCompleted", "type": "boolean", "default": false },
    { "key": "notes", "type": "string", "size": 1000 }
  ],
  "indexes": [
    { "key": "userId_idx", "type": "key", "attributes": ["userId"] },
    { "key": "taskId_idx", "type": "key", "attributes": ["taskId"] },
    { "key": "startTime_idx", "type": "key", "attributes": ["startTime"] }
  ],
  "permissions": {
    "read": ["user:{userId}"],
    "write": ["user:{userId}"],
    "create": ["users"],
    "delete": ["user:{userId}"]
  }
}
```

**Collection: `time_entries`**
```json
{
  "name": "time_entries",
  "attributes": [
    { "key": "userId", "type": "string", "size": 255, "required": true },
    { "key": "taskId", "type": "string", "size": 255 },
    { "key": "projectId", "type": "string", "size": 255 },
    { "key": "startTime", "type": "datetime", "required": true },
    { "key": "endTime", "type": "datetime" },
    { "key": "durationMinutes", "type": "integer" },
    { "key": "description", "type": "string", "size": 1000 },
    { "key": "isBillable", "type": "boolean", "default": false }
  ],
  "indexes": [
    { "key": "userId_idx", "type": "key", "attributes": ["userId"] },
    { "key": "taskId_idx", "type": "key", "attributes": ["taskId"] },
    { "key": "projectId_idx", "type": "key", "attributes": ["projectId"] },
    { "key": "startTime_idx", "type": "key", "attributes": ["startTime"] }
  ],
  "permissions": {
    "read": ["user:{userId}"],
    "write": ["user:{userId}"],
    "create": ["users"],
    "delete": ["user:{userId}"]
  }
}
```

**Collection: `automation_rules`**
```json
{
  "name": "automation_rules",
  "attributes": [
    { "key": "userId", "type": "string", "size": 255, "required": true },
    { "key": "name", "type": "string", "size": 255, "required": true },
    { "key": "description", "type": "string", "size": 1000 },
    { "key": "triggerType", "type": "string", "size": 100, "required": true },
    { "key": "triggerConditions", "type": "string", "size": 5000 },
    { "key": "actions", "type": "string", "size": 5000, "required": true },
    { "key": "isEnabled", "type": "boolean", "default": true },
    { "key": "priority", "type": "integer", "default": 0 },
    { "key": "executionCount", "type": "integer", "default": 0 },
    { "key": "lastExecutedAt", "type": "datetime" }
  ],
  "indexes": [
    { "key": "userId_idx", "type": "key", "attributes": ["userId"] },
    { "key": "isEnabled_idx", "type": "key", "attributes": ["isEnabled"] }
  ],
  "permissions": {
    "read": ["user:{userId}"],
    "write": ["user:{userId}"],
    "create": ["users"],
    "delete": ["user:{userId}"]
  }
}
```

**Collection: `saved_filters`**
```json
{
  "name": "saved_filters",
  "attributes": [
    { "key": "userId", "type": "string", "size": 255, "required": true },
    { "key": "name", "type": "string", "size": 255, "required": true },
    { "key": "icon", "type": "string", "size": 50 },
    { "key": "filterDefinition", "type": "string", "size": 5000, "required": true },
    { "key": "isFavorite", "type": "boolean", "default": false },
    { "key": "position", "type": "integer", "default": 0 }
  ],
  "indexes": [
    { "key": "userId_idx", "type": "key", "attributes": ["userId"] }
  ],
  "permissions": {
    "read": ["user:{userId}"],
    "write": ["user:{userId}"],
    "create": ["users"],
    "delete": ["user:{userId}"]
  }
}
```

**Collection: `templates`**
```json
{
  "name": "templates",
  "attributes": [
    { "key": "userId", "type": "string", "size": 255 },
    { "key": "name", "type": "string", "size": 255, "required": true },
    { "key": "description", "type": "string", "size": 1000 },
    { "key": "templateType", "type": "string", "size": 50, "required": true },
    { "key": "templateData", "type": "string", "size": 50000, "required": true },
    { "key": "isPublic", "type": "boolean", "default": false },
    { "key": "usageCount", "type": "integer", "default": 0 }
  ],
  "indexes": [
    { "key": "userId_idx", "type": "key", "attributes": ["userId"] },
    { "key": "isPublic_idx", "type": "key", "attributes": ["isPublic"] }
  ],
  "permissions": {
    "read": ["any"],
    "write": ["user:{userId}"],
    "create": ["users"],
    "delete": ["user:{userId}"]
  }
}
```

**Collection: `integrations`**
```json
{
  "name": "integrations",
  "attributes": [
    { "key": "userId", "type": "string", "size": 255, "required": true },
    { "key": "integrationType", "type": "string", "size": 50, "required": true },
    { "key": "config", "type": "string", "size": 10000, "required": true },
    { "key": "isActive", "type": "boolean", "default": true },
    { "key": "lastSyncAt", "type": "datetime" },
    { "key": "syncStatus", "type": "string", "size": 50 },
    { "key": "errorMessage", "type": "string", "size": 1000 }
  ],
  "indexes": [
    { "key": "userId_type", "type": "unique", "attributes": ["userId", "integrationType"] }
  ],
  "permissions": {
    "read": ["user:{userId}"],
    "write": ["user:{userId}"],
    "create": ["users"],
    "delete": ["user:{userId}"]
  }
}
```

**Collection: `weekly_reviews`**
```json
{
  "name": "weekly_reviews",
  "attributes": [
    { "key": "userId", "type": "string", "size": 255, "required": true },
    { "key": "weekStartDate", "type": "datetime", "required": true },
    { "key": "weekEndDate", "type": "datetime", "required": true },
    { "key": "summaryData", "type": "string", "size": 50000, "required": true },
    { "key": "aiInsights", "type": "string", "size": 10000 },
    { "key": "userNotes", "type": "string", "size": 5000 }
  ],
  "indexes": [
    { "key": "userId_week", "type": "unique", "attributes": ["userId", "weekStartDate"] }
  ],
  "permissions": {
    "read": ["user:{userId}"],
    "write": ["user:{userId}"],
    "create": ["users"],
    "delete": ["user:{userId}"]
  }
}
```

### Appwrite Storage Buckets

**Bucket: `attachments`**
```json
{
  "name": "attachments",
  "permissions": {
    "read": ["user:{userId}"],
    "write": ["user:{userId}"],
    "create": ["users"],
    "delete": ["user:{userId}"]
  },
  "fileSecurity": true,
  "enabled": true,
  "maximumFileSize": 104857600,
  "allowedFileExtensions": ["pdf", "doc", "docx", "xls", "xlsx", "ppt", "pptx", "jpg", "jpeg", "png", "gif", "svg", "mp4", "mov", "zip", "rar"],
  "compression": "gzip",
  "encryption": true,
  "antivirus": true
}
```

**Bucket: `avatars`**
```json
{
  "name": "avatars",
  "permissions": {
    "read": ["any"],
    "write": ["user:{userId}"],
    "create": ["users"],
    "delete": ["user:{userId}"]
  },
  "fileSecurity": false,
  "enabled": true,
  "maximumFileSize": 5242880,
  "allowedFileExtensions": ["jpg", "jpeg", "png", "gif"],
  "compression": "gzip",
  "encryption": false,
  "antivirus": true
}
```

## Appwrite Functions (Serverless)

### Function: `ai-assistant`
- **Runtime**: Node.js 20
- **Purpose**: Natural language processing, AI insights, weekly review generation
- **Triggers**: HTTP endpoint, scheduled (weekly reviews)
- **Dependencies**: OpenAI SDK
- **Environment Variables**: `OPENAI_API_KEY`

### Function: `automation-engine`
- **Runtime**: Node.js 20
- **Purpose**: Execute automation rules when triggers fire
- **Triggers**: Appwrite events (document.create, document.update)
- **Dependencies**: Appwrite SDK

### Function: `analytics-generator`
- **Runtime**: Node.js 20
- **Purpose**: Generate analytics reports, calculate metrics
- **Triggers**: HTTP endpoint, scheduled (daily)
- **Dependencies**: Appwrite SDK

### Function: `sync-resolver`
- **Runtime**: Node.js 20
- **Purpose**: Resolve sync conflicts, process offline queue
- **Triggers**: HTTP endpoint
- **Dependencies**: Appwrite SDK

### Function: `recurring-tasks-processor`
- **Runtime**: Node.js 20
- **Purpose**: Create next instances of recurring tasks
- **Triggers**: Scheduled (daily at midnight)
- **Dependencies**: Appwrite SDK

### Function: `goal-progress-calculator`
- **Runtime**: Node.js 20
- **Purpose**: Calculate goal progress based on linked tasks
- **Triggers**: Appwrite events (task.update, task.complete)
- **Dependencies**: Appwrite SDK

### Function: `habit-streak-calculator`
- **Runtime**: Node.js 20
- **Purpose**: Calculate habit streaks and update statistics
- **Triggers**: Appwrite events (habit_completion.create)
- **Dependencies**: Appwrite SDK

## Frontend Integration with Appwrite

### Appwrite SDK Setup

```typescript
import { Client, Account, Databases, Storage, Functions, Realtime } from 'appwrite';

const client = new Client()
  .setEndpoint(import.meta.env.VITE_APPWRITE_ENDPOINT)
  .setProject(import.meta.env.VITE_APPWRITE_PROJECT_ID);

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);
export const functions = new Functions(client);
export const realtime = new Realtime(client);

export const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
export const ATTACHMENTS_BUCKET_ID = import.meta.env.VITE_APPWRITE_ATTACHMENTS_BUCKET_ID;
```

### Realtime Subscriptions

```typescript
// Subscribe to task updates
const unsubscribe = realtime.subscribe(
  `databases.${DATABASE_ID}.collections.tasks.documents`,
  (response) => {
    if (response.events.includes('databases.*.collections.*.documents.*.create')) {
      // Handle task created
    }
    if (response.events.includes('databases.*.collections.*.documents.*.update')) {
      // Handle task updated
    }
    if (response.events.includes('databases.*.collections.*.documents.*.delete')) {
      // Handle task deleted
    }
  }
);
```

### Offline Sync Strategy

1. **Local Storage**: Continue using IndexedDB for offline data
2. **Sync Queue**: Store offline changes in IndexedDB queue
3. **Online Detection**: Listen for online/offline events
4. **Sync on Reconnect**: Process queue when back online
5. **Conflict Resolution**: Use Appwrite's document versioning + timestamps

## Migration from LocalStorage to Appwrite

### Migration Steps

1. **Detect Existing Data**: Check for localStorage data on first login
2. **Prompt User**: Ask if they want to migrate or start fresh
3. **Upload Data**: Batch create documents in Appwrite
4. **Verify**: Confirm all data was uploaded successfully
5. **Switch Mode**: Use Appwrite as source of truth, keep localStorage as cache

### Migration Function

```typescript
async function migrateLocalStorageToAppwrite(userId: string) {
  // 1. Read from localStorage
  const localTasks = JSON.parse(localStorage.getItem('clarity-task-storage') || '{}');
  
  // 2. Transform to Appwrite format
  const appwriteTasks = localTasks.tasks.map(task => ({
    userId,
    title: task.title,
    description: task.description,
    completed: task.completed,
    priority: task.priority,
    dueDate: task.dueDate,
    projectId: task.projectId,
    labels: task.labels,
    // ... other fields
  }));
  
  // 3. Batch upload to Appwrite
  for (const task of appwriteTasks) {
    await databases.createDocument(
      DATABASE_ID,
      'tasks',
      ID.unique(),
      task
    );
  }
  
  // 4. Mark migration complete
  localStorage.setItem('migrated-to-appwrite', 'true');
}
```

## Security & Permissions

### Row-Level Security
- All collections use `user:{userId}` permissions
- Users can only access their own data
- No custom authorization logic needed

### API Key Security
- Store Appwrite credentials in environment variables
- Never expose API keys in client code
- Use Appwrite's built-in session management

### Data Encryption
- Appwrite handles encryption at rest
- HTTPS for all communications
- Sensitive fields can be encrypted client-side before storage

## Performance Optimization

### Appwrite Optimizations
- Use indexes on frequently queried fields
- Implement pagination for large lists
- Use Appwrite's built-in caching
- Leverage CDN for file delivery

### Client-Side Optimizations
- Cache frequently accessed data in IndexedDB
- Debounce search queries
- Lazy load attachments
- Use virtual scrolling for large lists (already implemented)

## Deployment & Configuration

### Vercel Setup

1. **Install Vercel CLI**: `npm i -g vercel`
2. **Login**: `vercel login`
3. **Deploy**: `vercel` (from project root)
4. **Configure Environment Variables** in Vercel Dashboard:
   ```env
   VITE_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
   VITE_APPWRITE_PROJECT_ID=your-project-id
   VITE_APPWRITE_DATABASE_ID=clarityflow_production
   VITE_APPWRITE_ATTACHMENTS_BUCKET_ID=attachments
   VITE_APPWRITE_AVATARS_BUCKET_ID=avatars
   ```
5. **Add Custom Domain** (optional)
6. **Enable Automatic Deployments** from Git

### Appwrite Project Setup

1. Create Appwrite Cloud account (Pro Plan)
2. Create project `clarityflow`
3. **Add Vercel domain to Platforms**:
   - Go to Settings > Platforms
   - Add Web platform
   - Add your Vercel domain (e.g., `clarityflow.vercel.app`)
   - This configures CORS automatically
4. Create database `clarityflow_production`
5. Create all collections with attributes and indexes
6. Create storage buckets (`attachments`, `avatars`)
7. Deploy Appwrite Functions
8. Configure OAuth providers (optional)
9. Set up webhooks for integrations

### CORS Configuration

Appwrite automatically handles CORS when you add your Vercel domain as a platform. No manual CORS configuration needed!

## Conclusion

This design combines Vercel's best-in-class frontend hosting with Appwrite's powerful BaaS features to create an optimal architecture for ClarityFlow. The architecture supports all 49 requirements with:

**Frontend (Vercel - Free):**
- Global Edge CDN for fast loading
- Automatic deployments from Git
- Preview deployments for testing
- Custom domains
- Perfect for React + Vite apps

**Backend (Appwrite - $15/month):**
- Authentication with multiple providers
- Document-based database with relationships
- S3-compatible file storage
- WebSocket-based realtime updates
- Serverless functions for custom logic
- Row-level security and encryption
- Automatic scaling

**Total Cost: $15/month**

The implementation will focus on:
1. Setting up Appwrite collections and permissions
2. Integrating Appwrite SDK into the existing React app
3. Configuring Vercel deployment with environment variables
4. Implementing offline sync with conflict resolution
5. Building Appwrite Functions for AI and automation
6. Migrating existing localStorage data to Appwrite
7. Setting up CI/CD pipeline with Vercel + GitHub
