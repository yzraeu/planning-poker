# Phase 3: Deployment Configuration

## Objective
Set up Vercel configuration, configure environment variables, set up production database, and optimize build settings.

## Prerequisites
- Phase 2 completed (backend foundation)
- Vercel account created
- Production database access (PostgreSQL recommended)

## Estimated Time
**1 hour** (4 tasks × 15 minutes each)

## Tasks Breakdown

### Task 1: Vercel Configuration (15 min)
- [x] Create `vercel.json` configuration file
- [x] Set up build and output directories
- [x] Configure serverless functions for backend
- [x] Set up custom domains (optional)

### Task 2: Environment Variables Setup (15 min)
- [x] Create production environment variables
- [x] Set up development vs production configs
- [x] Configure database connection strings
- [x] Add API keys and secrets securely

### Task 3: Production Database Config (15 min)
- [x] Set up PostgreSQL database (Vercel Postgres or external)
- [x] Create production database schema
- [x] Set up database migrations
- [x] Test database connectivity

### Task 4: Build Optimization (15 min)
- [x] Optimize Vite build settings for production
- [x] Configure code splitting and lazy loading
- [x] Set up asset optimization
- [x] Test production build locally

## Deliverables

### Vercel Configuration (vercel.json)
```json
{
  "version": 2,
  "builds": [
    {
      "src": "client/package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    },
    {
      "src": "server/src/index.ts",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "server/src/index.ts"
    },
    {
      "src": "/(.*)",
      "dest": "client/dist/$1"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  },
  "functions": {
    "server/src/index.ts": {
      "includeFiles": "server/database/**"
    }
  }
}
```

### Environment Configuration

#### Development (.env.development)
```env
# Client
VITE_SERVER_URL=http://localhost:3001
VITE_CLIENT_URL=http://localhost:5173

# Server
PORT=3001
NODE_ENV=development
DATABASE_URL=sqlite:./database/poker.db
CORS_ORIGIN=http://localhost:5173
```

#### Production (.env.production)
```env
# Client
VITE_SERVER_URL=https://your-app.vercel.app
VITE_CLIENT_URL=https://your-app.vercel.app

# Server
NODE_ENV=production
DATABASE_URL=postgresql://username:password@hostname:port/database
CORS_ORIGIN=https://your-app.vercel.app
```

### Database Migration Script (server/scripts/migrate.ts)
```typescript
import Database from 'better-sqlite3'
import { Client } from 'pg'
import fs from 'fs'
import path from 'path'

const isDevelopment = process.env.NODE_ENV === 'development'
const databaseUrl = process.env.DATABASE_URL!

async function runMigrations() {
  console.log('Running database migrations...')
  
  const schemaPath = path.join(__dirname, '../database/schema.sql')
  const schema = fs.readFileSync(schemaPath, 'utf8')
  
  if (isDevelopment || databaseUrl.includes('sqlite')) {
    // SQLite (development)
    const db = new Database(databaseUrl.replace('sqlite:', ''))
    db.exec(schema)
    db.close()
    console.log('SQLite database migrated successfully')
  } else {
    // PostgreSQL (production)
    const client = new Client({ connectionString: databaseUrl })
    await client.connect()
    
    // Convert SQLite schema to PostgreSQL
    const pgSchema = convertSqliteToPostgreSQL(schema)
    await client.query(pgSchema)
    
    await client.end()
    console.log('PostgreSQL database migrated successfully')
  }
}

function convertSqliteToPostgreSQL(sqliteSchema: string): string {
  return sqliteSchema
    .replace(/TEXT PRIMARY KEY/g, 'TEXT PRIMARY KEY')
    .replace(/DATETIME DEFAULT CURRENT_TIMESTAMP/g, 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP')
    .replace(/BOOLEAN DEFAULT 1/g, 'BOOLEAN DEFAULT true')
    .replace(/BOOLEAN DEFAULT 0/g, 'BOOLEAN DEFAULT false')
}

if (require.main === module) {
  runMigrations().catch(console.error)
}

export { runMigrations }
```

### Production Database Schema (server/database/schema-postgresql.sql)
```sql
-- PostgreSQL production schema
CREATE TABLE IF NOT EXISTS rooms (
    id TEXT PRIMARY KEY,
    name TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    room_id TEXT,
    name TEXT NOT NULL,
    avatar TEXT,
    socket_id TEXT,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    FOREIGN KEY (room_id) REFERENCES rooms(id)
);

CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    room_id TEXT,
    status TEXT DEFAULT 'voting',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    revealed_at TIMESTAMP,
    FOREIGN KEY (room_id) REFERENCES rooms(id)
);

CREATE TABLE IF NOT EXISTS votes (
    id TEXT PRIMARY KEY,
    session_id TEXT,
    user_id TEXT,
    value TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES sessions(id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    UNIQUE(session_id, user_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_room_id ON users(room_id);
CREATE INDEX IF NOT EXISTS idx_users_socket_id ON users(socket_id);
CREATE INDEX IF NOT EXISTS idx_sessions_room_id ON sessions(room_id);
CREATE INDEX IF NOT EXISTS idx_votes_session_id ON votes(session_id);
CREATE INDEX IF NOT EXISTS idx_votes_user_id ON votes(user_id);
```

### Updated Server Configuration (server/src/config/database.ts)
```typescript
import Database from 'better-sqlite3'
import { Client, Pool } from 'pg'
import path from 'path'

const isDevelopment = process.env.NODE_ENV === 'development'
const databaseUrl = process.env.DATABASE_URL!

if (!databaseUrl) {
  throw new Error('DATABASE_URL environment variable is required')
}

export let db: Database.Database | Pool

if (isDevelopment || databaseUrl.includes('sqlite')) {
  // SQLite for development
  const dbPath = databaseUrl.replace('sqlite:', '')
  db = new Database(dbPath)
  
  // Enable foreign keys
  db.pragma('foreign_keys = ON')
  
  console.log('Connected to SQLite database')
} else {
  // PostgreSQL for production
  db = new Pool({
    connectionString: databaseUrl,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  })
  
  console.log('Connected to PostgreSQL database')
}

// Database helper functions
export const query = async (text: string, params?: any[]): Promise<any> => {
  if (db instanceof Database) {
    // SQLite
    if (text.toLowerCase().startsWith('select')) {
      return db.prepare(text).all(...(params || []))
    } else {
      return db.prepare(text).run(...(params || []))
    }
  } else {
    // PostgreSQL
    const result = await db.query(text, params)
    return result.rows
  }
}

export const closeDatabase = async (): Promise<void> => {
  if (db instanceof Database) {
    db.close()
  } else {
    await db.end()
  }
}
```

### Vite Production Configuration (client/vite.config.ts)
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig(({ command, mode }) => {
  const isDevelopment = mode === 'development'
  
  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        '@shared': path.resolve(__dirname, '../shared'),
      },
    },
    build: {
      outDir: 'dist',
      sourcemap: !isDevelopment,
      minify: !isDevelopment,
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom', 'react-router-dom'],
            socket: ['socket.io-client'],
            ui: ['canvas-confetti']
          }
        }
      },
      chunkSizeWarningLimit: 1000
    },
    server: {
      port: 5173,
      proxy: isDevelopment ? {
        '/api': {
          target: 'http://localhost:3001',
          changeOrigin: true,
        },
      } : undefined,
    },
    preview: {
      port: 5173
    }
  }
})
```

### Package.json Scripts Updates

#### Root package.json
```json
{
  "scripts": {
    "dev": "concurrently \"npm run dev:server\" \"npm run dev:client\"",
    "dev:client": "npm run dev --workspace=client",
    "dev:server": "npm run dev --workspace=server",
    "build": "npm run build --workspace=client && npm run build --workspace=server",
    "build:client": "npm run build --workspace=client",
    "build:server": "npm run build --workspace=server",
    "start": "npm run start --workspace=server",
    "migrate": "npm run migrate --workspace=server",
    "deploy": "npm run build && vercel --prod"
  }
}
```

#### Server package.json
```json
{
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "migrate": "tsx scripts/migrate.ts"
  }
}
```

### Vercel Build Script (build.sh)
```bash
#!/bin/bash

# Build client
echo "Building client..."
cd client
npm ci
npm run build
cd ..

# Build server
echo "Building server..."
cd server
npm ci
npm run build
cd ..

# Run migrations
echo "Running database migrations..."
cd server
npm run migrate
cd ..

echo "Build completed successfully!"
```

## Success Criteria
- [ ] Vercel deployment configuration is complete
- [ ] Environment variables are properly configured
- [ ] Production database is set up and accessible
- [ ] Build optimization improves performance
- [ ] Local production build works correctly
- [ ] Database migrations run successfully
- [ ] All environment-specific configs are working

## Common Issues & Solutions

### Issue: Vercel build failures
**Solution**: Check build logs, ensure all dependencies are listed, verify file paths

### Issue: Database connection errors
**Solution**: Verify connection strings, check firewall settings, ensure SSL configuration

### Issue: Environment variable issues
**Solution**: Check variable names, ensure they're set in Vercel dashboard

## Testing Checklist
- [ ] Local production build works
- [ ] Environment variables load correctly
- [ ] Database connections work in both environments
- [ ] Build optimization reduces bundle size
- [ ] Migrations run without errors
- [ ] All features work in production mode
- [ ] Static assets are served correctly

## Next Steps
After completion, proceed to **Phase 4: CI/CD Pipeline** to automate testing and deployment.

## Time Tracking
- Start Time: ___________
- End Time: ___________
- Actual Duration: ___________
- Notes: ___________

## Dependencies
- **Blocks**: Phase 4 (CI/CD Pipeline)
- **Blocked by**: Phase 2 (Backend Foundation)