# Phase 6: Voting Backend Logic

## Objective
Implement vote storage system, vote retrieval logic, session management, and vote revelation functionality with proper validation.

## Prerequisites
- Phase 5 completed (user management)
- Understanding of voting session lifecycle and constraints

## Estimated Time
**1 hour** (4 tasks × 15 minutes each)

## Tasks Breakdown

### Task 1: Vote Storage System (15 min)
- [ ] Create vote service with validation logic
- [ ] Implement vote submission API
- [ ] Add vote value validation (Fibonacci + special options)
- [ ] Handle duplicate vote prevention per session

### Task 2: Vote Retrieval Logic (15 min)
- [ ] Create vote retrieval methods by session
- [ ] Implement vote aggregation utilities
- [ ] Add vote statistics calculation
- [ ] Create vote anonymization for hidden state

### Task 3: Session Management (15 min)
- [ ] Implement session creation and state tracking
- [ ] Add session status management (voting/revealed/completed)
- [ ] Create new session initialization logic
- [ ] Handle session transitions and cleanup

### Task 4: Vote Revelation Logic (15 min)
- [ ] Implement reveal votes functionality
- [ ] Add unanimous vote detection
- [ ] Create vote result formatting
- [ ] Handle session completion workflow

## Deliverables

### Vote Service (server/src/services/VoteService.ts)
```typescript
import { v4 as uuidv4 } from 'uuid';
import { db } from '../utils/database';
import { Vote, Session, VoteValue } from '../models/Vote';

export class VoteService {
  static readonly VALID_VOTES: VoteValue[] = ['0', '1', '2', '3', '5', '8', '13', '21', 'coffee', 'question'];
  
  static createSession(roomId: string): Session {
    const session: Session = {
      id: uuidv4(),
      room_id: roomId,
      status: 'voting',
      created_at: new Date().toISOString()
    };
    
    db.prepare(`
      INSERT INTO sessions (id, room_id, status, created_at)
      VALUES (?, ?, ?, ?)
    `).run(session.id, session.room_id, session.status, session.created_at);
    
    return session;
  }
  
  static submitVote(sessionId: string, userId: string, value: VoteValue): Vote {
    // Validate vote value
    if (!this.VALID_VOTES.includes(value)) {
      throw new Error('Invalid vote value');
    }
    
    // Check if session allows voting
    const session = this.getSessionById(sessionId);
    if (!session || session.status !== 'voting') {
      throw new Error('Session not accepting votes');
    }
    
    // Check for existing vote
    const existingVote = db.prepare('SELECT * FROM votes WHERE session_id = ? AND user_id = ?').get(sessionId, userId);
    
    if (existingVote) {
      // Update existing vote
      db.prepare('UPDATE votes SET value = ? WHERE session_id = ? AND user_id = ?').run(value, sessionId, userId);
      return { ...existingVote, value } as Vote;
    } else {
      // Create new vote
      const vote: Vote = {
        id: uuidv4(),
        session_id: sessionId,
        user_id: userId,
        value,
        created_at: new Date().toISOString()
      };
      
      db.prepare(`
        INSERT INTO votes (id, session_id, user_id, value, created_at)
        VALUES (?, ?, ?, ?, ?)
      `).run(vote.id, vote.session_id, vote.user_id, vote.value, vote.created_at);
      
      return vote;
    }
  }
  
  static getSessionVotes(sessionId: string, includeUsers = false): Vote[] {
    if (includeUsers) {
      return db.prepare(`
        SELECT v.*, u.name as user_name, u.avatar as user_avatar
        FROM votes v
        JOIN users u ON v.user_id = u.id
        WHERE v.session_id = ?
        ORDER BY v.created_at
      `).all(sessionId) as Vote[];
    }
    
    return db.prepare('SELECT * FROM votes WHERE session_id = ? ORDER BY created_at').all(sessionId) as Vote[];
  }
  
  static revealVotes(sessionId: string): { session: Session; votes: Vote[]; isUnanimous: boolean } {
    // Update session status
    const revealedAt = new Date().toISOString();
    db.prepare('UPDATE sessions SET status = ?, revealed_at = ? WHERE id = ?').run('revealed', revealedAt, sessionId);
    
    const session = this.getSessionById(sessionId)!;\n    const votes = this.getSessionVotes(sessionId, true);\n    \n    // Check for unanimous vote\n    const voteValues = votes.map(v => v.value);\n    const isUnanimous = voteValues.length > 1 && new Set(voteValues).size === 1;\n    \n    return { session, votes, isUnanimous };\n  }\n  \n  static startNewSession(roomId: string): Session {\n    // Complete current session if exists\n    db.prepare('UPDATE sessions SET status = ? WHERE room_id = ? AND status IN (?, ?)').run('completed', roomId, 'voting', 'revealed');\n    \n    // Create new session\n    return this.createSession(roomId);\n  }\n  \n  static getCurrentSession(roomId: string): Session | null {\n    return db.prepare('SELECT * FROM sessions WHERE room_id = ? AND status IN (?, ?) ORDER BY created_at DESC LIMIT 1').get(roomId, 'voting', 'revealed') as Session || null;\n  }\n  \n  static getSessionById(sessionId: string): Session | null {\n    return db.prepare('SELECT * FROM sessions WHERE id = ?').get(sessionId) as Session || null;\n  }\n  \n  static getVoteStats(sessionId: string): { total: number; byValue: Record<string, number> } {\n    const votes = this.getSessionVotes(sessionId);\n    const byValue: Record<string, number> = {};\n    \n    votes.forEach(vote => {\n      byValue[vote.value] = (byValue[vote.value] || 0) + 1;\n    });\n    \n    return {\n      total: votes.length,\n      byValue\n    };\n  }\n}\n```\n\n### Socket.io Vote Handlers (server/src/socket/voteHandlers.ts)\n```typescript\nimport { Socket } from 'socket.io';\nimport { VoteService } from '../services/VoteService';\nimport { UserService } from '../services/UserService';\n\nexport function handleVoteEvents(socket: Socket) {\n  socket.on('submit-vote', async (data: { value: string }) => {\n    try {\n      const user = UserService.getUserBySocketId(socket.id);\n      if (!user) {\n        socket.emit('error', { message: 'User not found' });\n        return;\n      }\n      \n      // Get or create current session\n      let session = VoteService.getCurrentSession(user.room_id);\n      if (!session) {\n        session = VoteService.createSession(user.room_id);\n        socket.to(user.room_id).emit('session-started', { session });\n      }\n      \n      // Submit vote\n      const vote = VoteService.submitVote(session.id, user.id, data.value as any);\n      \n      // Notify user of successful vote\n      socket.emit('vote-submitted', { vote });\n      \n      // Notify room of vote count (without revealing votes)\n      const stats = VoteService.getVoteStats(session.id);\n      socket.to(user.room_id).emit('vote-stats-updated', { stats });\n      \n    } catch (error) {\n      socket.emit('error', { message: error.message });\n    }\n  });\n  \n  socket.on('reveal-votes', async () => {\n    try {\n      const user = UserService.getUserBySocketId(socket.id);\n      if (!user) return;\n      \n      const session = VoteService.getCurrentSession(user.room_id);\n      if (!session) {\n        socket.emit('error', { message: 'No active session' });\n        return;\n      }\n      \n      const result = VoteService.revealVotes(session.id);\n      \n      // Broadcast to entire room\n      socket.to(user.room_id).emit('votes-revealed', result);\n      socket.emit('votes-revealed', result);\n      \n    } catch (error) {\n      socket.emit('error', { message: 'Failed to reveal votes' });\n    }\n  });\n  \n  socket.on('start-new-session', async () => {\n    try {\n      const user = UserService.getUserBySocketId(socket.id);\n      if (!user) return;\n      \n      const newSession = VoteService.startNewSession(user.room_id);\n      \n      // Broadcast to entire room\n      socket.to(user.room_id).emit('new-session-started', { session: newSession });\n      socket.emit('new-session-started', { session: newSession });\n      \n    } catch (error) {\n      socket.emit('error', { message: 'Failed to start new session' });\n    }\n  });\n}\n```\n\n### Vote API Routes (server/src/routes/votes.ts)\n```typescript\nimport express from 'express';\nimport { VoteService } from '../services/VoteService';\n\nconst router = express.Router();\n\n// GET /api/sessions/:sessionId/votes - Get session votes (for debugging)\nrouter.get('/:sessionId/votes', (req, res) => {\n  try {\n    const votes = VoteService.getSessionVotes(req.params.sessionId, true);\n    const stats = VoteService.getVoteStats(req.params.sessionId);\n    \n    res.json({ votes, stats });\n  } catch (error) {\n    res.status(500).json({ error: 'Failed to get votes' });\n  }\n});\n\n// GET /api/rooms/:roomId/current-session - Get current session\nrouter.get('/:roomId/current-session', (req, res) => {\n  try {\n    const session = VoteService.getCurrentSession(req.params.roomId);\n    \n    if (!session) {\n      return res.status(404).json({ error: 'No active session' });\n    }\n    \n    const stats = VoteService.getVoteStats(session.id);\n    res.json({ session, stats });\n  } catch (error) {\n    res.status(500).json({ error: 'Failed to get session' });\n  }\n});\n\nexport default router;\n```\n\n## Success Criteria\n- [ ] Users can submit votes with valid values\n- [ ] Duplicate votes are handled correctly (update existing)\n- [ ] Vote sessions are created and managed properly\n- [ ] Vote revelation works and shows all votes\n- [ ] Unanimous vote detection works correctly\n- [ ] New session creation clears previous votes\n- [ ] Vote statistics are calculated accurately\n\n## Common Issues & Solutions\n\n### Issue: Duplicate vote handling\n**Solution**: Use UPSERT logic or check for existing votes before inserting\n\n### Issue: Session state consistency\n**Solution**: Ensure proper transaction handling and state validation\n\n### Issue: Vote validation errors\n**Solution**: Validate vote values against allowed list before processing\n\n## Testing Checklist\n- [ ] Submit valid vote - stores correctly\n- [ ] Submit invalid vote - returns error\n- [ ] Submit duplicate vote - updates existing\n- [ ] Reveal votes - returns all votes with user info\n- [ ] Unanimous votes - detected correctly\n- [ ] New session - clears previous votes\n- [ ] Vote statistics - calculated correctly\n- [ ] Session transitions work properly\n\n## Next Steps\nAfter completion, proceed to **Phase 7: Frontend Foundation** to set up React application with Vite and basic routing.\n\n## Time Tracking\n- Start Time: ___________\n- End Time: ___________\n- Actual Duration: ___________\n- Notes: ___________\n\n## Dependencies\n- **Blocks**: Phase 9 (Voting UI), Phase 10 (Real-time Integration)\n- **Blocked by**: Phase 5 (User Management)"