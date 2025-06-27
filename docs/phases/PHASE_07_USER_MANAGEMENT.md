# Phase 5: User Management & Avatars

## Objective
Implement user joining/leaving handlers, avatar generation system, name change functionality, and user presence tracking.

## Prerequisites
- Phase 6 completed (room management)
- Understanding of Socket.io event handling and user sessions

## Estimated Time
**1 hour** (4 tasks × 15 minutes each)

## Tasks Breakdown

### Task 1: User Join/Leave Handlers (15 min)
- [ ] Create user service for join/leave operations
- [ ] Implement Socket.io join/leave event handlers
- [ ] Add user persistence to database
- [ ] Handle user cleanup on disconnect

### Task 2: Avatar Generation System (15 min)
- [ ] Create avatar generator utility (using initials or simple patterns)
- [ ] Add avatar selection/randomization logic
- [ ] Store avatar data with user profile
- [ ] Implement avatar update functionality

### Task 3: Name Change Functionality (15 min)
- [ ] Create name update API endpoint
- [ ] Add name validation (length, characters)
- [ ] Implement real-time name change broadcasting
- [ ] Update user record in database

### Task 4: User Presence Tracking (15 min)
- [ ] Implement active user tracking per room
- [ ] Add user status updates (online/offline)
- [ ] Create user list retrieval for rooms
- [ ] Handle connection state management

## Deliverables

### User Service (server/src/services/UserService.ts)
```typescript
import { v4 as uuidv4 } from 'uuid';
import { db } from '../utils/database';
import { User } from '../models/User';

export class UserService {
  static createUser(roomId: string, name: string, socketId: string): User {
    const user: User = {
      id: uuidv4(),
      room_id: roomId,
      name,
      avatar: this.generateAvatar(name),
      socket_id: socketId,
      joined_at: new Date().toISOString(),
      is_active: true
    };
    
    db.prepare(`
      INSERT INTO users (id, room_id, name, avatar, socket_id, joined_at, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(user.id, user.room_id, user.name, user.avatar, user.socket_id, user.joined_at, 1);
    
    return user;
  }
  
  static getUserBySocketId(socketId: string): User | null {
    return db.prepare('SELECT * FROM users WHERE socket_id = ? AND is_active = 1').get(socketId) as User || null;
  }
  
  static getRoomUsers(roomId: string): User[] {
    return db.prepare('SELECT * FROM users WHERE room_id = ? AND is_active = 1').all(roomId) as User[];
  }
  
  static updateUserName(userId: string, name: string): void {
    db.prepare('UPDATE users SET name = ?, avatar = ? WHERE id = ?')
      .run(name, this.generateAvatar(name), userId);
  }
  
  static deactivateUser(socketId: string): void {
    db.prepare('UPDATE users SET is_active = 0 WHERE socket_id = ?').run(socketId);
  }
  
  private static generateAvatar(name: string): string {
    // Generate simple avatar based on initials
    const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
    const colors = ['bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500', 'bg-pink-500'];
    const colorIndex = name.length % colors.length;
    
    return JSON.stringify({
      initials,
      color: colors[colorIndex],
      style: 'circle'
    });
  }
}
```

### Socket.io User Handlers (server/src/socket/userHandlers.ts)
```typescript
import { Socket } from 'socket.io';
import { UserService } from '../services/UserService';
import { RoomService } from '../services/RoomService';

export function handleUserEvents(socket: Socket) {
  socket.on('join-room', async (data: { roomId: string; userName: string }) => {
    try {
      const { roomId, userName } = data;
      
      // Validate room exists
      const room = RoomService.getRoomById(roomId);
      if (!room) {
        socket.emit('error', { message: 'Room not found' });
        return;
      }
      
      // Create user and join room
      const user = UserService.createUser(roomId, userName, socket.id);
      socket.join(roomId);
      
      // Get all room users
      const roomUsers = UserService.getRoomUsers(roomId);
      
      // Notify user of successful join
      socket.emit('room-joined', { room, user, users: roomUsers });
      
      // Notify other users
      socket.to(roomId).emit('user-joined', { user });
      socket.to(roomId).emit('users-updated', { users: roomUsers });
      
    } catch (error) {
      socket.emit('error', { message: 'Failed to join room' });
    }
  });
  
  socket.on('update-name', (data: { name: string }) => {
    try {
      const user = UserService.getUserBySocketId(socket.id);
      if (!user) return;
      
      UserService.updateUserName(user.id, data.name);
      const updatedUser = { ...user, name: data.name };
      
      // Notify all users in room
      socket.to(user.room_id).emit('user-updated', { user: updatedUser });
      socket.emit('name-updated', { user: updatedUser });
      
    } catch (error) {
      socket.emit('error', { message: 'Failed to update name' });
    }
  });
  
  socket.on('disconnect', () => {
    try {
      const user = UserService.getUserBySocketId(socket.id);
      if (user) {
        UserService.deactivateUser(socket.id);
        
        // Notify room users
        socket.to(user.room_id).emit('user-left', { user });
        
        // Update user list
        const roomUsers = UserService.getRoomUsers(user.room_id);
        socket.to(user.room_id).emit('users-updated', { users: roomUsers });
      }
    } catch (error) {
      console.error('Error handling disconnect:', error);
    }
  });
}
```

### Avatar Types (shared/types/User.ts)
```typescript
export interface Avatar {
  initials: string;
  color: string;
  style: 'circle' | 'square';
}

export interface User {
  id: string;
  room_id: string;
  name: string;
  avatar: string; // JSON string of Avatar object
  socket_id?: string;
  joined_at: string;
  is_active: boolean;
}

export interface UserPresence {
  id: string;
  name: string;
  avatar: Avatar;
  isOnline: boolean;
  joinedAt: string;
}
```

### User API Routes (server/src/routes/users.ts)
```typescript
import express from 'express';
import { UserService } from '../services/UserService';

const router = express.Router();

// GET /api/rooms/:roomId/users - Get all users in room
router.get('/:roomId/users', (req, res) => {
  try {
    const users = UserService.getRoomUsers(req.params.roomId);
    res.json({ users });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get users' });
  }
});

export default router;
```

## Success Criteria
- [ ] Users can join rooms with names and get avatars
- [ ] User presence is tracked and updated in real-time
- [ ] Name changes work and broadcast to all users
- [ ] User avatars are generated consistently
- [ ] Users are removed from active list on disconnect
- [ ] Room user list is maintained accurately

## Common Issues & Solutions

### Issue: Duplicate users on reconnect
**Solution**: Check for existing user before creating new one

### Issue: Avatar generation inconsistency
**Solution**: Use deterministic algorithm based on user name

### Issue: User not removed on disconnect
**Solution**: Ensure proper cleanup in disconnect handler

## Testing Checklist
- [ ] User joins room - gets unique ID and avatar
- [ ] User name appears in room user list
- [ ] Name change updates for all users in real-time
- [ ] Avatar changes when name changes
- [ ] User removed from list when disconnecting
- [ ] Multiple users can join same room
- [ ] User presence status updates correctly

## Next Steps
After completion, proceed to **Phase 8: Voting Backend Logic** to implement vote storage, retrieval, and session management.

## Time Tracking
- Start Time: ___________
- End Time: ___________
- Actual Duration: ___________
- Notes: ___________

## Dependencies
- **Blocks**: Phase 8 (Voting Logic), Phase 12 (Real-time Integration)
- **Blocked by**: Phase 6 (Room Management)