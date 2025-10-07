# Backend Architecture Proposal for WayPoint

## Overview

This document outlines the **recommended backend architecture** to transform WayPoint from a client-only demo into a production-ready, multi-user task management application.

---

## 🎯 Requirements Analysis

### Your Use Case:
1. ✅ Host on subdomain (e.g., tasks.yourportfolio.com)
2. ✅ Access from anywhere (multi-device)
3. ✅ Authentication required
4. ✅ Demo mode for portfolio visitors (24-hour data expiry)
5. ✅ Real user registration and permanent storage
6. ✅ Single primary user (you) + up to 50 users

---

## 🏗️ Recommended Tech Stack

### Backend Framework
```
Node.js + Express (TypeScript)
├── Why: Fast, mature, same language as frontend
├── Alternatives: Fastify (faster), Nest.js (enterprise)
└── Verdict: Express is perfect for your needs
```

### Databases
```
1. PostgreSQL (Primary Database)
   ├── Purpose: Real user data, permanent storage
   ├── Tables: users, tasks, projects, labels
   └── Why: Reliable, ACID compliant, great for structured data

2. Redis (Session Cache + Temp Users)
   ├── Purpose: Demo users with auto-expiry (TTL)
   ├── Session storage
   └── Why: Lightning fast, built-in TTL, perfect for demos
```

### Authentication
```
JWT (JSON Web Tokens)
├── Access Token: 15 minutes (short-lived)
├── Refresh Token: 7 days (rotate on use)
├── Demo Token: 24 hours (auto-expire)
└── Why: Stateless, scalable, secure
```

### Deployment
```
Docker + Docker Compose
├── Containers: Frontend, Backend, PostgreSQL, Redis
├── Orchestration: Simple docker-compose for start
├── Scale: Kubernetes if needed later
└── Why: Portable, consistent environments
```

---

## 📐 System Architecture

### High-Level Diagram
```
┌─────────────┐
│   Browser   │ (React Frontend)
└──────┬──────┘
       │ HTTPS
       ↓
┌─────────────────────────────────────────┐
│         Nginx Reverse Proxy             │
│  (SSL Termination, Load Balancing)      │
└──────┬──────────────────────────────────┘
       │
       ↓
┌──────────────────────────────┐
│     Express API Server       │
│  (REST API, Authentication)  │
└──────┬──────────────────────┬┘
       │                      │
       ↓                      ↓
┌─────────────┐        ┌─────────────┐
│ PostgreSQL  │        │   Redis     │
│(Real Users) │        │(Demo Users) │
└─────────────┘        └─────────────┘
```

### Data Flow
```
1. User visits tasks.yourportfolio.com
2. Frontend loads from CDN/Nginx
3. User chooses "Try Demo" or "Sign Up"

Demo Flow:
4a. POST /api/auth/demo → Creates temp user in Redis (24hr TTL)
4b. Returns JWT token (expires in 24hrs)
4c. Frontend stores token, makes authenticated requests
4d. After 24hrs: Redis auto-deletes, token invalid

Real User Flow:
4a. POST /api/auth/register → Creates user in PostgreSQL
4b. Returns JWT token pair (access + refresh)
4c. Frontend stores tokens, makes authenticated requests
4d. Data persists forever in PostgreSQL
```

---

## 🗄️ Database Schema

### PostgreSQL Schema

```sql
-- Users table (real users only)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tasks table
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  completed BOOLEAN DEFAULT FALSE,
  priority INTEGER CHECK (priority BETWEEN 1 AND 4),
  due_date TIMESTAMP,
  start_date TIMESTAMP,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  parent_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- JSON fields for flexibility
  labels JSONB DEFAULT '[]',
  dependencies JSONB DEFAULT '[]',
  subtasks JSONB DEFAULT '[]',
  metadata JSONB DEFAULT '{}'
);

-- Projects table
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  color VARCHAR(7),
  parent_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  is_expanded BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Labels table
CREATE TABLE labels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  color VARCHAR(7) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(user_id, name)
);

-- User preferences
CREATE TABLE user_preferences (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  theme VARCHAR(20) DEFAULT 'light',
  density VARCHAR(20) DEFAULT 'comfortable',
  primary_color VARCHAR(7) DEFAULT '#2E5AAC',
  font_size VARCHAR(20) DEFAULT 'medium',
  sidebar_collapsed BOOLEAN DEFAULT FALSE,
  default_view VARCHAR(50) DEFAULT 'inbox',
  task_reminders BOOLEAN DEFAULT TRUE,
  daily_summary BOOLEAN DEFAULT TRUE,
  overdue_alerts BOOLEAN DEFAULT TRUE,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);
CREATE INDEX idx_tasks_completed ON tasks(completed);
CREATE INDEX idx_projects_user_id ON projects(user_id);
CREATE INDEX idx_labels_user_id ON labels(user_id);
```

### Redis Schema (Demo Users)

```javascript
// Demo user data structure
demo:user:{userId} = {
  id: "demo-uuid",
  email: "demo-xxxxx@temp.com",
  name: "Demo User",
  createdAt: "timestamp"
}
// TTL: 86400 seconds (24 hours)

// Demo user tasks
demo:tasks:{userId} = [
  { id: "task-1", title: "Sample task", ... },
  { id: "task-2", title: "Another task", ... }
]
// TTL: 86400 seconds (24 hours)

// Demo user projects
demo:projects:{userId} = [...]
// TTL: 86400 seconds (24 hours)
```

---

## 🔌 API Endpoints

### Authentication
```typescript
POST   /api/auth/register      // Create real user account
POST   /api/auth/login          // Login with email/password
POST   /api/auth/demo           // Create 24hr demo account
POST   /api/auth/refresh        // Refresh access token
POST   /api/auth/logout         // Invalidate refresh token
GET    /api/auth/me             // Get current user info
```

### Tasks
```typescript
GET    /api/tasks               // Get all user tasks
POST   /api/tasks               // Create new task
GET    /api/tasks/:id           // Get single task
PUT    /api/tasks/:id           // Update task
PATCH  /api/tasks/:id/complete  // Toggle completion
DELETE /api/tasks/:id           // Delete task
```

### Projects
```typescript
GET    /api/projects            // Get all user projects
POST   /api/projects            // Create new project
PUT    /api/projects/:id        // Update project
DELETE /api/projects/:id        // Delete project
```

### Labels
```typescript
GET    /api/labels              // Get all user labels
POST   /api/labels              // Create new label
PUT    /api/labels/:id          // Update label
DELETE /api/labels/:id          // Delete label
```

### User Preferences
```typescript
GET    /api/preferences         // Get user preferences
PUT    /api/preferences         // Update preferences
```

---

## 🔐 Security Implementation

### JWT Authentication

```typescript
// auth.middleware.ts
import jwt from 'jsonwebtoken';

interface JWTPayload {
  userId: string;
  email: string;
  isDemo: boolean;
  exp: number;
}

export const authenticateJWT = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }
  
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET) as JWTPayload;
    
    // Check if demo token expired
    if (payload.isDemo && payload.exp < Date.now() / 1000) {
      return res.status(401).json({ error: 'Demo session expired' });
    }
    
    req.user = payload;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid token' });
  }
};
```

### Password Hashing

```typescript
import bcrypt from 'bcrypt';

// Hash password before storing
const hashPassword = async (password: string): Promise<string> => {
  return await bcrypt.hash(password, 10);
};

// Verify password on login
const verifyPassword = async (password: string, hash: string): Promise<boolean> => {
  return await bcrypt.compare(password, hash);
};
```

### Rate Limiting

```typescript
import rateLimit from 'express-rate-limit';

// Limit login attempts
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts
  message: 'Too many login attempts, please try again later'
});

app.post('/api/auth/login', loginLimiter, loginController);

// General API rate limit
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100, // 100 requests per 15 minutes
});

app.use('/api/', apiLimiter);
```

---

## 🚀 Project Structure

```
waypoint-backend/
├── src/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   └── auth.routes.ts
│   │   ├── tasks/
│   │   │   ├── tasks.controller.ts
│   │   │   ├── tasks.service.ts
│   │   │   └── tasks.routes.ts
│   │   ├── projects/
│   │   ├── labels/
│   │   └── preferences/
│   │
│   ├── db/
│   │   ├── postgres.ts          // PostgreSQL connection
│   │   ├── redis.ts             // Redis connection
│   │   └── migrations/          // DB migrations
│   │
│   ├── middleware/
│   │   ├── auth.middleware.ts
│   │   ├── error.middleware.ts
│   │   ├── validation.middleware.ts
│   │   └── logging.middleware.ts
│   │
│   ├── services/
│   │   ├── demo-user.service.ts // Demo user management
│   │   ├── email.service.ts     // (future) Email notifications
│   │   └── cleanup.service.ts   // Demo user cleanup cron
│   │
│   ├── types/
│   │   └── index.ts             // Shared types
│   │
│   ├── utils/
│   │   ├── jwt.utils.ts
│   │   ├── validation.utils.ts
│   │   └── logger.ts
│   │
│   └── server.ts                // Entry point
│
├── docker/
│   ├── Dockerfile.backend
│   └── Dockerfile.frontend
│
├── .env.example
├── docker-compose.yml
├── package.json
├── tsconfig.json
└── README.md
```

---

## 🐳 Docker Configuration

### docker-compose.yml

```yaml
version: '3.8'

services:
  frontend:
    build:
      context: .
      dockerfile: docker/Dockerfile.frontend
    ports:
      - "3000:80"
    environment:
      - VITE_API_URL=http://backend:4000
    depends_on:
      - backend

  backend:
    build:
      context: ./backend
      dockerfile: ../docker/Dockerfile.backend
    ports:
      - "4000:4000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://postgres:password@postgres:5432/waypoint
      - REDIS_URL=redis://redis:6379
      - JWT_SECRET=${JWT_SECRET}
    depends_on:
      - postgres
      - redis

  postgres:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=waypoint
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - frontend
      - backend

volumes:
  postgres_data:
  redis_data:
```

---

## 🔄 Frontend Integration Changes

### Update API Client

```typescript
// src/api/client.ts
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

export class APIClient {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('auth_token');
  }

  async request(endpoint: string, options: RequestInit = {}) {
    const headers = {
      'Content-Type': 'application/json',
      ...(this.token && { 'Authorization': `Bearer ${this.token}` }),
      ...options.headers,
    };

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      if (response.status === 401) {
        // Token expired, try refresh or logout
        await this.refreshToken();
      }
      throw new Error(`API Error: ${response.statusText}`);
    }

    return response.json();
  }

  // Auth methods
  async login(email: string, password: string) {
    const data = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    this.setToken(data.accessToken, data.refreshToken);
    return data.user;
  }

  async registerDemo() {
    const data = await this.request('/auth/demo', { method: 'POST' });
    this.setToken(data.accessToken);
    return data.user;
  }

  async register(email: string, password: string, name: string) {
    const data = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    });
    this.setToken(data.accessToken, data.refreshToken);
    return data.user;
  }

  // Task methods
  async getTasks() {
    return this.request('/tasks');
  }

  async createTask(task: Partial<Task>) {
    return this.request('/tasks', {
      method: 'POST',
      body: JSON.stringify(task),
    });
  }

  // ... other methods
}

export const apiClient = new APIClient();
```

### Update Zustand Store

```typescript
// src/hooks/use-store.ts
import { apiClient } from '../api/client';

export const useTaskStore = create<TaskStore>()(
  (set, get) => ({
    tasks: [],
    isLoading: false,
    
    // Fetch tasks from API
    fetchTasks: async () => {
      set({ isLoading: true });
      try {
        const tasks = await apiClient.getTasks();
        set({ tasks, isLoading: false });
      } catch (error) {
        console.error('Failed to fetch tasks:', error);
        set({ isLoading: false });
      }
    },
    
    // Add task via API
    addTask: async (task) => {
      try {
        const newTask = await apiClient.createTask(task);
        set((state) => ({ tasks: [...state.tasks, newTask] }));
        return newTask;
      } catch (error) {
        console.error('Failed to add task:', error);
        throw error;
      }
    },
    
    // ... other methods use API instead of localStorage
  })
);
```

---

## 📊 Deployment Guide

### Step 1: Setup VPS (DigitalOcean/Linode)

```bash
# Create Droplet (Ubuntu 22.04)
# Size: 2GB RAM, 1 vCPU ($12/month)

# SSH into server
ssh root@your-server-ip

# Install Docker & Docker Compose
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose
```

### Step 2: Clone & Configure

```bash
# Clone your repo
git clone https://github.com/yourusername/waypoint.git
cd waypoint

# Create environment file
cp .env.example .env
nano .env

# Set variables:
JWT_SECRET=your-super-secret-key
DATABASE_URL=postgresql://postgres:password@postgres:5432/waypoint
REDIS_URL=redis://redis:6379
NODE_ENV=production
```

### Step 3: Setup SSL (Let's Encrypt)

```bash
# Install certbot
sudo apt install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d tasks.yourportfolio.com
```

### Step 4: Deploy

```bash
# Build and start services
docker-compose up -d

# Check logs
docker-compose logs -f

# Visit: https://tasks.yourportfolio.com
```

---

## 💰 Cost Estimate

### Development Time
- Backend API: 2 weeks
- Database setup: 3 days
- Authentication: 1 week
- Frontend integration: 1 week
- Testing: 3 days
- Deployment: 3 days
- **Total: 6-8 weeks** (1 developer)

### Hosting Costs (Monthly)

**Option 1: Minimal (1-10 users)**
```
- VPS (2GB RAM): $12/month
- Domain + SSL: $1/month
- Total: ~$15/month
```

**Option 2: Professional (10-50 users)**
```
- VPS (4GB RAM): $24/month
- Managed PostgreSQL: $15/month
- Redis: $10/month (optional)
- Domain + SSL: $1/month
- Total: ~$50/month
```

**Option 3: Enterprise (50+ users)**
```
- App Server (8GB): $60/month
- Managed DB: $50/month
- Redis: $25/month
- CDN: $20/month
- Monitoring: $26/month
- Total: ~$180/month
```

---

## 📈 Migration Plan

### Week 1: Setup
- [ ] Create backend project structure
- [ ] Setup PostgreSQL schema
- [ ] Setup Redis
- [ ] Configure Docker

### Week 2: Core API
- [ ] Implement authentication endpoints
- [ ] Create task CRUD endpoints
- [ ] Add project endpoints
- [ ] Add label endpoints

### Week 3: Integration
- [ ] Update frontend to use API
- [ ] Replace localStorage with API calls
- [ ] Implement auth flow in frontend
- [ ] Add loading states

### Week 4: Demo Mode
- [ ] Implement demo user creation
- [ ] Setup Redis TTL for demo data
- [ ] Add "Try Demo" button to frontend
- [ ] Test 24-hour expiry

### Week 5: Testing
- [ ] Write backend tests
- [ ] E2E testing
- [ ] Security audit
- [ ] Performance testing

### Week 6: Deployment
- [ ] Setup VPS
- [ ] Configure Docker Compose
- [ ] Setup SSL
- [ ] Deploy to production

---

## ✅ Checklist

### Backend Development
- [ ] Express server with TypeScript
- [ ] PostgreSQL database schema
- [ ] Redis for demo users
- [ ] JWT authentication
- [ ] REST API endpoints
- [ ] Input validation (Zod)
- [ ] Error handling middleware
- [ ] Rate limiting
- [ ] CORS configuration
- [ ] Security headers

### Frontend Updates
- [ ] API client implementation
- [ ] Update Zustand to use API
- [ ] Authentication flow
- [ ] Demo mode UI
- [ ] Registration form
- [ ] Login form
- [ ] Token refresh logic
- [ ] Error handling
- [ ] Loading states

### DevOps
- [ ] Dockerfile for backend
- [ ] Dockerfile for frontend
- [ ] docker-compose.yml
- [ ] nginx configuration
- [ ] SSL certificate
- [ ] GitHub Actions CI/CD
- [ ] Environment variables
- [ ] Backup strategy

### Documentation
- [ ] API documentation (Swagger)
- [ ] Deployment guide
- [ ] Environment setup
- [ ] Database migrations
- [ ] Troubleshooting guide

---

## 🎯 Success Criteria

When complete, you should have:

✅ Multi-user task management app  
✅ Access from any device/browser  
✅ Secure authentication  
✅ Demo mode with 24hr auto-expiry  
✅ Real user registration  
✅ Production-ready deployment  
✅ Scalable architecture  
✅ Portfolio-worthy project  

---

**Next Step:** Start with backend project structure (Week 1) or discuss any questions about this architecture.
