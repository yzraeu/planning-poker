# Phase 4: Room Management System

## Objective
Implement room creation, unique URL generation, room persistence, and joining functionality with proper error handling.

## Prerequisites
- Phase 5 completed (database schema and models)
- Understanding of UUID generation and URL routing

## Estimated Time
**1 hour** (4 tasks × 15 minutes each)

## Tasks Breakdown

### Task 1: Implement Room Creation (15 min)
- [ ] Create room service with unique ID generation
- [ ] Add room creation API endpoint (`POST /api/rooms`)
- [ ] Implement room name validation (optional field)
- [ ] Add error handling for duplicate rooms

### Task 2: Generate Unique URLs (15 min)
- [ ] Create URL-safe room ID generator (UUID-based)
- [ ] Add room URL generation utility
- [ ] Implement room lookup by ID
- [ ] Test URL uniqueness and collision handling

### Task 3: Room Persistence Logic (15 min)
- [ ] Implement room state persistence in database
- [ ] Add room metadata tracking (creation time, last activity)
- [ ] Create room cleanup utilities (for future use)
- [ ] Test room data persistence across server restarts

### Task 4: Room Joining Functionality (15 min)
- [ ] Create room joining API endpoint (`GET /api/rooms/:id`)
- [ ] Add room existence validation
- [ ] Implement room info retrieval
- [ ] Add Socket.io room joining logic

## Deliverables

### API Endpoints
```typescript
// POST /api/rooms - Create new room
interface CreateRoomRequest {
  name?: string;
}

interface CreateRoomResponse {
  id: string;
  name?: string;
  url: string;
  created_at: string;
}

// GET /api/rooms/:id - Get room info
interface GetRoomResponse {
  id: string;
  name?: string;
  created_at: string;
  active_users: number;
  current_session?: string;
}
```

### Room Service (server/src/services/RoomService.ts)
```typescript
import { v4 as uuidv4 } from 'uuid';
import { db } from '../utils/database';
import { Room } from '../models/Room';

export class RoomService {
  static createRoom(name?: string): Room {
    const id = this.generateRoomId();
    const room = {
      id,
      name: name || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    db.prepare(`
      INSERT INTO rooms (id, name, created_at, updated_at)
      VALUES (?, ?, ?, ?)
    `).run(room.id, room.name, room.created_at, room.updated_at);
    
    return room;
  }
  
  static getRoomById(id: string): Room | null {
    return db.prepare('SELECT * FROM rooms WHERE id = ?').get(id) as Room || null;
  }
  
  private static generateRoomId(): string {
    // Generate URL-safe room ID
    return uuidv4().replace(/-/g, '').substring(0, 12);
  }
}
```

### Room Routes (server/src/routes/rooms.ts)
```typescript
import express from 'express';
import { RoomService } from '../services/RoomService';

const router = express.Router();

router.post('/', (req, res) => {
  try {
    const { name } = req.body;
    const room = RoomService.createRoom(name);
    
    res.json({
      ...room,
      url: `${process.env.CLIENT_URL || 'http://localhost:5173'}/room/${room.id}`
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create room' });
  }
});

router.get('/:id', (req, res) => {
  try {
    const room = RoomService.getRoomById(req.params.id);
    
    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }
    
    res.json(room);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get room' });
  }
});

export default router;
```

### Socket.io Room Handling
```typescript
// server/src/socket/roomHandlers.ts
import { Socket } from 'socket.io';
import { RoomService } from '../services/RoomService';

export function handleRoomJoin(socket: Socket) {
  socket.on('join-room', (roomId: string) => {
    const room = RoomService.getRoomById(roomId);
    
    if (!room) {
      socket.emit('room-error', { message: 'Room not found' });
      return;
    }
    
    socket.join(roomId);
    socket.emit('room-joined', { room });
    socket.to(roomId).emit('user-joined', { socketId: socket.id });
  });
  
  socket.on('leave-room', (roomId: string) => {
    socket.leave(roomId);
    socket.to(roomId).emit('user-left', { socketId: socket.id });
  });
}
```

## Success Criteria
- [ ] Room creation API works and returns unique room ID
- [ ] Room URLs are generated correctly and are unique
- [ ] Room data persists in database correctly
- [ ] Room joining API validates room existence
- [ ] Socket.io room joining/leaving works properly
- [ ] Error handling works for invalid room IDs

## Common Issues & Solutions

### Issue: Room ID collisions
**Solution**: Use UUID with sufficient entropy, add collision detection

### Issue: Room not found errors
**Solution**: Proper validation and error handling in API endpoints

### Issue: Socket.io room management
**Solution**: Ensure proper room joining/leaving in socket handlers

## Testing Checklist
- [ ] Create room via API - returns valid room object
- [ ] Room ID is unique and URL-safe
- [ ] Room persists after server restart
- [ ] Join existing room - returns room data
- [ ] Join non-existent room - returns 404 error
- [ ] Socket.io room joining works
- [ ] Multiple users can join same room

## Next Steps
After completion, proceed to **Phase 7: User Management & Avatars** to implement user joining, avatar generation, and presence tracking.

## Time Tracking
- Start Time: ___________
- End Time: ___________
- Actual Duration: ___________
- Notes: ___________

## Dependencies
- **Blocks**: Phase 7 (User Management), Phase 8 (Room UI)
- **Blocked by**: Phase 5 (Database Schema)