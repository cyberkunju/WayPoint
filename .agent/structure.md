# Project Structure

## Directory Organization

```
src/
├── components/          # React components
│   ├── Layout.tsx      # Main three-column layout
│   ├── TaskList.tsx    # List view component
│   ├── KanbanBoard.tsx # Kanban view component
│   └── ...             # Other view and UI components
├── contexts/           # React contexts and state management
│   └── AppContext.tsx  # Global app state (Zustand store)
├── hooks/              # Custom React hooks
│   ├── use-keyboard-shortcuts.ts
│   └── use-initialize-data.ts
├── lib/                # Utility libraries and configurations
│   ├── appwrite.ts     # Appwrite client configuration & constants
│   └── ...             # Other utilities
├── services/           # Backend service wrappers
│   ├── auth.service.ts      # Authentication operations
│   ├── database.service.ts  # Database CRUD operations
│   ├── storage.service.ts   # File storage operations
│   └── functions.service.ts # Serverless functions
├── test/               # Test utilities and setup
├── App.tsx             # Root application component
├── main.tsx            # Application entry point
├── main.css            # Global styles
└── index.css           # Tailwind directives

scripts/                # Setup and verification scripts
├── setup-appwrite-database.ts
├── setup-appwrite-storage.ts
├── verify-database-setup.ts
├── verify-storage-setup.ts
└── README.md

docs/                   # Documentation and setup guides
.kiro/                  # Kiro IDE configuration
├── specs/              # Feature specifications
└── steering/           # AI assistant guidance (this directory)
```

## Architecture Patterns

### State Management
- **Global State**: Zustand store in `AppContext.tsx` with localStorage persistence
- **Server State**: TanStack Query for data fetching and caching
- **Component State**: React hooks for local UI state

### Service Layer
All Appwrite interactions go through service wrappers in `src/services/`:
- Type-safe operations with TypeScript generics
- Consistent error handling and logging
- Singleton instances exported from each service
- Import constants (collection IDs, bucket IDs, function IDs) from `src/lib/appwrite.ts`

**Important**: Always import Appwrite constants from `src/lib/appwrite.ts`:
```typescript
import { DATABASE_ID, COLLECTIONS, BUCKETS, FUNCTIONS_IDS } from '@/lib/appwrite';
```

### Component Structure
- **Layout Components**: Handle application structure (sidebar, panels, navigation)
- **View Components**: Render different task views (List, Kanban, Calendar, etc.)
- **UI Components**: Reusable primitives from Radix UI and custom components
- **Feature Components**: Complex features like AI assistant, analytics dashboard

### Routing
- View-based routing handled by `currentView` state in AppContext
- No traditional router - single-page application with view switching
- Views: inbox, today, kanban, calendar, gantt, mindmap, analytics, settings

## Naming Conventions

- **Files**: kebab-case for utilities, PascalCase for components
- **Components**: PascalCase (e.g., `TaskList.tsx`)
- **Hooks**: camelCase with `use` prefix (e.g., `use-keyboard-shortcuts.ts`)
- **Services**: camelCase with `.service.ts` suffix
- **Types**: PascalCase interfaces and types
- **Constants**: UPPER_SNAKE_CASE for exported constants

## Import Patterns

- Use path alias `@/` for all src imports (configured in tsconfig.json and vite.config.ts)
- Import services from `@/services`
- Import Appwrite constants from `@/lib/appwrite`
- Import types from service files or dedicated type files
- Import UI components from component directories
- Group imports: external libraries, internal modules, types, styles

## Appwrite Constants

All Appwrite IDs are centralized in `src/lib/appwrite.ts`:

- **DATABASE_ID**: `clarityflow_production` (configurable via env)
- **COLLECTIONS**: Object with 19 collection IDs (tasks, projects, epics, labels, notes, goals, habits, etc.)
- **BUCKETS**: Object with 2 bucket IDs (attachments, avatars)
- **FUNCTIONS_IDS**: Object with 7 function IDs (ai-assistant, automation-engine, etc.)

## Service Layer Patterns

### Database Service
- Generic CRUD operations with TypeScript types
- Methods: `createDocument`, `getDocument`, `listDocuments`, `updateDocument`, `deleteDocument`
- Batch operations: `batchCreateDocuments`, `batchUpdateDocuments`, `batchDeleteDocuments`
- Query helpers: `queryDocuments`, `countDocuments`
- Export singleton: `databaseService`

### Storage Service
- File upload/download operations
- Methods: `uploadFile`, `getFile`, `deleteFile`, `getFilePreview`, `getFileDownload`
- Export singleton: `storageService`

### Auth Service
- Authentication operations
- Methods: `login`, `logout`, `register`, `getCurrentUser`, `updatePreferences`
- Export singleton: `authService`

### Functions Service
- Serverless function execution
- Methods: `executeFunction`, `listExecutions`
- Export singleton: `functionsService`

## Performance Considerations

- **Virtualization**: Automatic for lists with 100+ items using react-window
- **Memoization**: Use `useMemo` for expensive computations and view rendering
- **Code Splitting**: Lazy load heavy components (analytics, charts)
- **Optimistic Updates**: Update UI immediately, sync in background
- **Query Caching**: TanStack Query handles caching and invalidation

## Error Handling

- All service methods include try-catch blocks with console.error logging
- Errors are thrown to be handled by calling code
- Use React Error Boundary for component-level error handling (ErrorFallback.tsx)
