# Phase 3: Database Schema & Models

## Objective
Set up SQLite database with proper schema design for rooms, users, votes, and sessions. Create TypeScript models and database utilities.

## Prerequisites
- Phase 4 completed (CI/CD pipeline)
- Understanding of relational database design

## Estimated Time
**1 hour** (4 tasks × 15 minutes each)

## Tasks Breakdown

### Task 1: Set up SQLite Database (15 min)
- [ ] Install `sqlite3` and `better-sqlite3` packages
- [ ] Create database connection utility
- [ ] Set up database initialization script
- [ ] Create `database/` directory structure

### Task 2: Create Room Schema (15 min)
- [ ] Design rooms table structure
- [ ] Create room creation/migration script
- [ ] Add room model with TypeScript types
- [ ] Test room CRUD operations

### Task 3: Create User Schema (15 min)
- [ ] Design users table structure
- [ ] Create user creation/migration script
- [ ] Add user model with TypeScript types
- [ ] Test user CRUD operations

### Task 4: Create Vote Schema (15 min)
- [ ] Design votes and sessions table structure
- [ ] Create vote/session migration scripts
- [ ] Add vote/session models with TypeScript types
- [ ] Test vote CRUD operations

## Deliverables

### Database Structure
```
server/
├── database/
│   ├── schema.sql
│   ├── init.ts
│   └── poker.db (generated)
├── src/
│   ├── models/
│   │   ├── Room.ts
│   │   ├── User.ts
│   │   ├── Vote.ts
│   │   └── Session.ts
│   └── utils/
│       └── database.ts
```

### Schema Design

#### Rooms Table
```sql
CREATE TABLE rooms (
    id TEXT PRIMARY KEY,
    name TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### Users Table
```sql
CREATE TABLE users (
    id TEXT PRIMARY KEY,
    room_id TEXT,
    name TEXT NOT NULL,
    avatar TEXT,
    socket_id TEXT,
    joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT 1,
    FOREIGN KEY (room_id) REFERENCES rooms(id)
);
```

#### Sessions Table
```sql
CREATE TABLE sessions (
    id TEXT PRIMARY KEY,
    room_id TEXT,
    status TEXT DEFAULT 'voting', -- 'voting', 'revealed', 'completed'
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    revealed_at DATETIME,
    FOREIGN KEY (room_id) REFERENCES rooms(id)
);
```

#### Votes Table
```sql
CREATE TABLE votes (
    id TEXT PRIMARY KEY,
    session_id TEXT,
    user_id TEXT,
    value TEXT, -- '0', '1', '2', '3', '5', '8', '13', '21', 'coffee', 'question'
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES sessions(id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    UNIQUE(session_id, user_id)
);
```

### TypeScript Types
```typescript
export interface Room {
  id: string;
  name?: string;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  room_id: string;
  name: string;
  avatar: string;
  socket_id?: string;
  joined_at: string;
  is_active: boolean;
}

export interface Session {
  id: string;
  room_id: string;
  status: 'voting' | 'revealed' | 'completed';
  created_at: string;
  revealed_at?: string;
}

export interface Vote {
  id: string;
  session_id: string;
  user_id: string;
  value: VoteValue;
  created_at: string;
}

export type VoteValue = '0' | '1' | '2' | '3' | '5' | '8' | '13' | '21' | 'coffee' | 'question';
```

### Database Utility (server/src/utils/database.ts)
```typescript
import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(__dirname, '../../database/poker.db');
export const db = new Database(dbPath);

// Initialize database with schema
export function initializeDatabase() {
  // Run schema creation scripts
  const schema = fs.readFileSync(path.join(__dirname, '../../database/schema.sql'), 'utf8');
  db.exec(schema);
}
```

## Success Criteria
- [ ] SQLite database created successfully
- [ ] All tables created with proper schema
- [ ] TypeScript models compile without errors
- [ ] Basic CRUD operations work for all entities
- [ ] Database initialization script runs successfully
- [ ] Foreign key constraints work properly

## Common Issues & Solutions

### Issue: SQLite file permissions
**Solution**: Ensure database directory has write permissions

### Issue: Foreign key constraint errors
**Solution**: Enable foreign keys: `PRAGMA foreign_keys = ON;`

### Issue: TypeScript type mismatches
**Solution**: Ensure database column types match TypeScript interface types

## Testing

### Database Testing Script
```typescript
// Test script to verify database operations
import { db, initializeDatabase } from '../utils/database';

// Initialize database
initializeDatabase();

// Test room creation
const roomId = 'test-room-123';
db.prepare('INSERT INTO rooms (id, name) VALUES (?, ?)').run(roomId, 'Test Room');

// Test user creation
const userId = 'test-user-123';
db.prepare('INSERT INTO users (id, room_id, name, avatar) VALUES (?, ?, ?, ?)').run(
  userId, roomId, 'Test User', 'avatar-1'
);

// Verify data
const room = db.prepare('SELECT * FROM rooms WHERE id = ?').get(roomId);
const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);

console.log('Room:', room);
console.log('User:', user);
```

## Next Steps
After completion, proceed to **Phase 6: Room Management System** to implement room creation, joining, and persistence logic.

## Time Tracking
- Start Time: ___________
- End Time: ___________
- Actual Duration: ___________
- Notes: ___________

## Dependencies
- **Blocks**: Phase 6 (Room Management), Phase 7 (User Management), Phase 8 (Voting Logic)
- **Blocked by**: Phase 4 (CI/CD Pipeline)