# Phase 10: Real-time Integration

## Objective
Set up Socket.io client, implement real-time vote updates, user presence updates, and session state synchronization.

## Prerequisites
- Phase 9 completed (voting interface)
- Phase 6 completed (voting backend)
- Understanding of Socket.io client-side integration

## Estimated Time
**1 hour** (4 tasks × 15 minutes each)

## Tasks Breakdown

### Task 1: Socket.io Client Setup (15 min)
- [ ] Install and configure Socket.io client
- [ ] Create socket service with connection management
- [ ] Implement connection/disconnection handling
- [ ] Add error handling and reconnection logic

### Task 2: Real-time Vote Updates (15 min)
- [ ] Implement vote submission through Socket.io
- [ ] Add real-time vote statistics updates
- [ ] Handle vote revelation broadcasting
- [ ] Update UI based on vote events

### Task 3: User Presence Updates (15 min)
- [ ] Implement user join/leave event handling
- [ ] Add real-time user list updates
- [ ] Handle user name changes in real-time
- [ ] Show user presence indicators

### Task 4: Session State Synchronization (15 min)
- [ ] Sync session state across all clients
- [ ] Handle new session creation events
- [ ] Implement session status updates
- [ ] Add confetti trigger for unanimous votes

## Deliverables

### Socket Service (client/src/services/socketService.ts)
```typescript
import { io, Socket } from 'socket.io-client'
import { Room } from '@shared/types/Room'
import { User } from '@shared/types/User'
import { Vote, Session, VoteValue } from '@shared/types/Vote'

class SocketService {
  private socket: Socket | null = null
  private currentRoom: string | null = null
  
  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.socket = io(import.meta.env.VITE_SERVER_URL || 'http://localhost:3001')
      
      this.socket.on('connect', () => {
        console.log('Connected to server')
        resolve()
      })
      
      this.socket.on('connect_error', (error) => {
        console.error('Connection error:', error)
        reject(error)
      })
      
      this.socket.on('disconnect', (reason) => {
        console.log('Disconnected:', reason)
      })
    })
  }
  
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
      this.currentRoom = null
    }
  }
  
  joinRoom(roomId: string, userName: string): Promise<{ room: Room; user: User; users: User[] }> {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        reject(new Error('Not connected to server'))
        return
      }
      
      this.currentRoom = roomId
      
      this.socket.emit('join-room', { roomId, userName })
      
      this.socket.once('room-joined', (data) => {
        resolve(data)
      })
      
      this.socket.once('error', (error) => {
        reject(new Error(error.message))
      })
    })
  }
  
  submitVote(value: VoteValue): void {
    if (this.socket) {
      this.socket.emit('submit-vote', { value })
    }
  }
  
  revealVotes(): void {
    if (this.socket) {
      this.socket.emit('reveal-votes')
    }
  }
  
  startNewSession(): void {
    if (this.socket) {
      this.socket.emit('start-new-session')
    }
  }
  
  updateName(name: string): void {
    if (this.socket) {
      this.socket.emit('update-name', { name })
    }
  }
  
  // Event listeners
  onUserJoined(callback: (data: { user: User }) => void): void {
    this.socket?.on('user-joined', callback)
  }
  
  onUserLeft(callback: (data: { user: User }) => void): void {
    this.socket?.on('user-left', callback)
  }
  
  onUsersUpdated(callback: (data: { users: User[] }) => void): void {
    this.socket?.on('users-updated', callback)
  }
  
  onUserUpdated(callback: (data: { user: User }) => void): void {
    this.socket?.on('user-updated', callback)
  }
  
  onVoteSubmitted(callback: (data: { vote: Vote }) => void): void {
    this.socket?.on('vote-submitted', callback)
  }
  
  onVoteStatsUpdated(callback: (data: { stats: any }) => void): void {
    this.socket?.on('vote-stats-updated', callback)
  }
  
  onVotesRevealed(callback: (data: { session: Session; votes: Vote[]; isUnanimous: boolean }) => void): void {
    this.socket?.on('votes-revealed', callback)
  }
  
  onNewSessionStarted(callback: (data: { session: Session }) => void): void {
    this.socket?.on('new-session-started', callback)
  }
  
  onSessionStarted(callback: (data: { session: Session }) => void): void {
    this.socket?.on('session-started', callback)
  }
  
  // Clean up event listeners
  removeAllListeners(): void {
    if (this.socket) {
      this.socket.removeAllListeners()
    }
  }
}

export const socketService = new SocketService()
```

### Room Hook (client/src/hooks/useRoom.ts)
```typescript
import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { socketService } from '../services/socketService'
import { Room } from '@shared/types/Room'
import { User } from '@shared/types/User'
import { Vote, Session, VoteValue } from '@shared/types/Vote'

interface UseRoomReturn {
  room: Room | null
  currentUser: User | null
  users: User[]
  currentSession: Session | null
  votes: Vote[]
  voteStats: any
  isConnected: boolean
  isLoading: boolean
  error: string | null
  isVotingPhase: boolean
  isRevealed: boolean
  isUnanimous: boolean
  joinRoom: (userName: string) => Promise<void>
  submitVote: (value: VoteValue) => void
  revealVotes: () => void
  startNewSession: () => void
  updateUserName: (name: string) => void
}

export const useRoom = (): UseRoomReturn => {
  const { roomId } = useParams<{ roomId: string }>()
  const navigate = useNavigate()
  
  const [room, setRoom] = useState<Room | null>(null)
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [currentSession, setCurrentSession] = useState<Session | null>(null)
  const [votes, setVotes] = useState<Vote[]>([])
  const [voteStats, setVoteStats] = useState<any>({ total: 0, byValue: {} })
  const [isConnected, setIsConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isUnanimous, setIsUnanimous] = useState(false)
  
  const isVotingPhase = currentSession?.status === 'voting'
  const isRevealed = currentSession?.status === 'revealed'
  
  const joinRoom = useCallback(async (userName: string) => {
    if (!roomId) return
    
    setIsLoading(true)
    setError(null)
    
    try {
      await socketService.connect()
      const data = await socketService.joinRoom(roomId, userName)
      
      setRoom(data.room)
      setCurrentUser(data.user)
      setUsers(data.users)
      setIsConnected(true)
      
      // Set up event listeners
      setupEventListeners()
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to join room')
      navigate('/')
    } finally {
      setIsLoading(false)
    }
  }, [roomId, navigate])
  
  const setupEventListeners = useCallback(() => {
    socketService.onUserJoined(({ user }) => {
      setUsers(prev => [...prev, user])
      // Play join sound
      playSound('join')
    })
    
    socketService.onUserLeft(({ user }) => {
      setUsers(prev => prev.filter(u => u.id !== user.id))
      // Play leave sound
      playSound('leave')
    })
    
    socketService.onUsersUpdated(({ users }) => {
      setUsers(users)
    })
    
    socketService.onUserUpdated(({ user }) => {
      setUsers(prev => prev.map(u => u.id === user.id ? user : u))
      if (currentUser?.id === user.id) {
        setCurrentUser(user)
      }
    })
    
    socketService.onVoteSubmitted(({ vote }) => {
      // Play vote confirmation sound
      playSound('vote')
    })
    
    socketService.onVoteStatsUpdated(({ stats }) => {
      setVoteStats(stats)
    })
    
    socketService.onVotesRevealed(({ session, votes, isUnanimous }) => {
      setCurrentSession(session)
      setVotes(votes)
      setIsUnanimous(isUnanimous)
      
      if (isUnanimous) {
        // Trigger confetti animation
        triggerConfetti()
      }
    })
    
    socketService.onNewSessionStarted(({ session }) => {
      setCurrentSession(session)
      setVotes([])
      setVoteStats({ total: 0, byValue: {} })
      setIsUnanimous(false)
    })
    
    socketService.onSessionStarted(({ session }) => {
      setCurrentSession(session)
    })
    
  }, [currentUser])
  
  const submitVote = useCallback((value: VoteValue) => {
    socketService.submitVote(value)
  }, [])
  
  const revealVotes = useCallback(() => {
    socketService.revealVotes()
  }, [])
  
  const startNewSession = useCallback(() => {
    socketService.startNewSession()
  }, [])
  
  const updateUserName = useCallback((name: string) => {
    socketService.updateName(name)
  }, [])
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      socketService.removeAllListeners()
      socketService.disconnect()
    }
  }, [])
  
  return {
    room,
    currentUser,
    users,
    currentSession,
    votes,
    voteStats,
    isConnected,
    isLoading,
    error,
    isVotingPhase,
    isRevealed,
    isUnanimous,
    joinRoom,
    submitVote,
    revealVotes,
    startNewSession,
    updateUserName
  }
}

// Sound utility functions
function playSound(type: 'join' | 'leave' | 'vote') {
  // Create audio context and play appropriate sound
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
  
  const frequencies = {
    join: 523.25, // C5
    leave: 392.00, // G4
    vote: 659.25   // E5
  }
  
  const oscillator = audioContext.createOscillator()
  const gainNode = audioContext.createGain()
  
  oscillator.connect(gainNode)
  gainNode.connect(audioContext.destination)
  
  oscillator.frequency.setValueAtTime(frequencies[type], audioContext.currentTime)
  oscillator.type = 'sine'
  
  gainNode.gain.setValueAtTime(0.1, audioContext.currentTime)
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3)
  
  oscillator.start(audioContext.currentTime)
  oscillator.stop(audioContext.currentTime + 0.3)
}

// Confetti utility function
function triggerConfetti() {
  // Import and use canvas-confetti library
  import('canvas-confetti').then((confetti) => {
    confetti.default({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    })
  })
}
```

### Updated Room Page (client/src/pages/Room.tsx)
```typescript
import React, { useState, useEffect } from 'react'
import { useRoom } from '../hooks/useRoom'
import RoomInfo from '../components/room/RoomInfo'
import VotingPanel from '../components/voting/VotingPanel'
import VoteResults from '../components/voting/VoteResults'
import VoteStats from '../components/voting/VoteStats'
import UserList from '../components/room/UserList'
import JoinRoomModal from '../components/room/JoinRoomModal'

const Room: React.FC = () => {
  const {
    room,
    currentUser,
    users,
    currentSession,
    votes,
    voteStats,
    isConnected,
    isLoading,
    error,
    isVotingPhase,
    isRevealed,
    isUnanimous,
    joinRoom,
    submitVote,
    revealVotes,
    startNewSession,
    updateUserName
  } = useRoom()
  
  const [showJoinModal, setShowJoinModal] = useState(true)
  
  const handleJoinRoom = async (userName: string) => {
    await joinRoom(userName)
    setShowJoinModal(false)
  }
  
  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 text-lg font-semibold mb-2">
          Error: {error}
        </div>
        <p className="text-gray-600">
          Please check the room ID and try again.
        </p>
      </div>
    )
  }
  
  if (!isConnected || showJoinModal) {
    return (
      <JoinRoomModal
        onJoin={handleJoinRoom}
        isLoading={isLoading}
      />
    )
  }
  
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {room && (
        <RoomInfo
          room={room}
          participantCount={users.length}
        />
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <VoteStats
            stats={voteStats}
            totalUsers={users.length}
            isRevealed={isRevealed}
          />
          
          <VotingPanel
            onVoteSubmit={submitVote}
            onRevealVotes={revealVotes}
            onNewSession={startNewSession}
            isVotingPhase={isVotingPhase}
            isRevealed={isRevealed}
            canReveal={voteStats.total > 0}
            userVote={currentUser ? votes.find(v => v.user_id === currentUser.id)?.value : undefined}
            isLoading={isLoading}
          />
          
          {isRevealed && votes.length > 0 && (
            <VoteResults
              votes={votes}
              isUnanimous={isUnanimous}
            />
          )}
        </div>
        
        <div>
          <UserList
            users={users}
            currentUser={currentUser}
            onUpdateName={updateUserName}
          />
        </div>
      </div>
    </div>
  )
}

export default Room
```

## Success Criteria
- [ ] Socket.io client connects to server successfully
- [ ] Users can join rooms and see real-time updates
- [ ] Vote submissions work through Socket.io
- [ ] Vote statistics update in real-time
- [ ] Vote revelation broadcasts to all users
- [ ] New session creation clears votes for everyone
- [ ] User presence updates work correctly
- [ ] Sound notifications play for events
- [ ] Confetti animation triggers for unanimous votes

## Common Issues & Solutions

### Issue: Socket.io connection fails
**Solution**: Check server URL and CORS configuration

### Issue: Events not triggering
**Solution**: Ensure proper event listener setup and cleanup

### Issue: State not syncing
**Solution**: Verify event handling and state updates

## Testing Checklist
- [ ] Socket connection establishes successfully
- [ ] User can join room with name
- [ ] Vote submission updates stats in real-time
- [ ] All users see vote revelation simultaneously
- [ ] New session clears votes for all users
- [ ] User join/leave events work correctly
- [ ] Sound notifications play appropriately
- [ ] Confetti shows for unanimous votes
- [ ] Reconnection works after network issues

## Next Steps
After completion, proceed to **Phase 11: Sound & Animation Features** to enhance the user experience.

## Time Tracking
- Start Time: ___________
- End Time: ___________
- Actual Duration: ___________
- Notes: ___________

## Dependencies
- **Blocks**: Phase 11 (Sound & Animations)
- **Blocked by**: Phase 9 (Voting UI), Phase 6 (Voting Backend)