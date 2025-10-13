# Technology Stack

## Core Technologies

- **Framework**: React 19 with TypeScript 5.7
- **Build Tool**: Vite 6.3 with SWC compiler
- **Styling**: Tailwind CSS 4.1 with custom design tokens
- **State Management**: Zustand with persist middleware
- **Backend**: Appwrite 21.2 (Authentication, Database, Storage, Functions)
- **Data Fetching**: TanStack Query v5 (React Query)
- **Testing**: Vitest 3.2 with Testing Library and jsdom

## Key Libraries

- **UI Components**: Radix UI primitives, GitHub Spark design system
- **Forms**: React Hook Form 7.54 with Zod 3.25 validation
- **Icons**: Phosphor Icons 2.1, Lucide React, Heroicons
- **Animations**: Framer Motion 12.6
- **Date Handling**: date-fns 3.6, react-day-picker
- **Notifications**: Sonner 2.0
- **Drag & Drop**: embla-carousel-react
- **Virtualization**: react-window for large lists
- **Charts**: Recharts 2.15, D3 7.9
- **Utilities**: clsx, tailwind-merge, class-variance-authority

## Project Configuration

- **Module System**: ESNext with bundler resolution
- **Path Aliases**: `@/*` maps to `src/*`
- **TypeScript**: Strict null checks enabled, no emit mode, target ES2020
- **JSX**: React JSX transform
- **Node Scripts**: tsx for TypeScript execution

## Common Commands

### Development
```bash
npm run dev              # Start dev server (default port 5173)
npm run build            # Build for production (tsc + vite build)
npm run preview          # Preview production build
npm run optimize         # Optimize Vite dependencies
```

### Testing
```bash
npm test                 # Run tests in watch mode
npm run test:ui          # Run tests with Vitest UI
npm run test:coverage    # Generate coverage report
```

### Code Quality
```bash
npm run lint             # Run ESLint v9 with TypeScript rules
```

### Appwrite Setup
```bash
npm run setup:appwrite   # Setup database collections
npm run verify:appwrite  # Verify database setup
npm run setup:storage    # Setup storage buckets
npm run verify:storage   # Verify storage setup
```

## Environment Variables

Required variables in `.env` or `.env.local`:
- `VITE_APPWRITE_ENDPOINT`: Appwrite API endpoint (e.g., https://cloud.appwrite.io/v1)
- `VITE_APPWRITE_PROJECT_ID`: Appwrite project ID
- `VITE_APPWRITE_DATABASE_ID`: Database ID (default: clarityflow_production)

Copy `.env.example` to `.env.local` and configure your credentials.

## Build System

- **Vite Plugins**: 
  - @vitejs/plugin-react-swc for fast refresh
  - @tailwindcss/vite for Tailwind CSS 4
  - @github/spark/spark-vite-plugin for Spark components
  - @github/spark/vitePhosphorIconProxyPlugin for icon optimization
- **Output**: Optimized ES modules with code splitting
- **Dev Server**: Hot module replacement with fast refresh
- **Build Info**: Stored in `node_modules/.tmp/tsconfig.app.tsbuildinfo`

## Appwrite Configuration

- **Database ID**: `clarityflow_production` (configurable via env)
- **Collections**: 19 collections including tasks, projects, epics, labels, notes, goals, habits, etc.
- **Storage Buckets**: `attachments` and `avatars`
- **Functions**: 7 serverless functions for AI, automation, analytics, sync, and calculations
- **SDK**: Both client SDK (appwrite) and server SDK (node-appwrite) for scripts
