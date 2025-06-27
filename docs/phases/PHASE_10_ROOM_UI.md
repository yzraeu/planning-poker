# Phase 8: Room UI Components

## Objective
Create room creation form, room joining interface, URL sharing component, and room information display with proper validation and user feedback.

## Prerequisites
- Phase 9 completed (frontend foundation)
- Understanding of React forms and state management

## Estimated Time
**1 hour** (4 tasks × 15 minutes each)

## Tasks Breakdown

### Task 1: Room Creation Form (15 min)
- [ ] Create room creation form component
- [ ] Add form validation for room name (optional)
- [ ] Implement form submission to backend API
- [ ] Add loading states and error handling

### Task 2: Room Joining Interface (15 min)
- [ ] Create room joining form with room ID input
- [ ] Add room ID validation and formatting
- [ ] Implement join room functionality
- [ ] Handle invalid room errors gracefully

### Task 3: URL Sharing Component (15 min)
- [ ] Create shareable URL display component
- [ ] Add copy-to-clipboard functionality
- [ ] Implement QR code generation for mobile sharing
- [ ] Add share button with native sharing API

### Task 4: Room Info Display (15 min)
- [ ] Create room information header component
- [ ] Display room name, ID, and creation time
- [ ] Add participant count and active status
- [ ] Implement room settings (future: name editing)

## Deliverables

### Create Room Page (client/src/pages/CreateRoom.tsx)
```typescript
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Card from '../components/ui/Card'
import { roomService } from '../services/roomService'

const CreateRoom: React.FC = () => {
  const [roomName, setRoomName] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const room = await roomService.createRoom(roomName || undefined)
      navigate(`/room/${room.id}`)
    } catch (err) {
      setError('Failed to create room. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className=\"max-w-md mx-auto\">
      <Card className=\"p-6\">
        <h1 className=\"text-2xl font-bold text-center mb-6\">
          Create New Room
        </h1>
        
        <form onSubmit={handleSubmit} className=\"space-y-4\">
          <div>
            <label htmlFor=\"roomName\" className=\"block text-sm font-medium text-gray-700 mb-1\">
              Room Name (Optional)
            </label>
            <Input
              id=\"roomName\"
              type=\"text\"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              placeholder=\"Enter room name...\"
              maxLength={50}
            />
            <p className=\"text-xs text-gray-500 mt-1\">
              Leave empty for anonymous room
            </p>
          </div>
          
          {error && (
            <div className=\"bg-red-50 border border-red-200 rounded-md p-3\">
              <p className=\"text-sm text-red-600\">{error}</p>
            </div>
          )}
          
          <Button
            type=\"submit\"
            className=\"w-full\"
            disabled={isLoading}
            size=\"lg\"
          >
            {isLoading ? 'Creating Room...' : 'Create Room'}
          </Button>
        </form>
        
        <div className=\"mt-6 pt-6 border-t border-gray-200\">
          <h3 className=\"text-sm font-medium text-gray-700 mb-2\">
            Or join existing room:
          </h3>
          <JoinRoomForm />
        </div>
      </Card>
    </div>
  )
}

const JoinRoomForm: React.FC = () => {
  const [roomId, setRoomId] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!roomId.trim()) return

    setIsLoading(true)
    setError('')

    try {
      // Validate room exists
      await roomService.getRoomById(roomId.trim())
      navigate(`/room/${roomId.trim()}`)
    } catch (err) {
      setError('Room not found. Please check the room ID.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className=\"flex gap-2\">
      <Input
        type=\"text\"
        value={roomId}
        onChange={(e) => setRoomId(e.target.value)}
        placeholder=\"Room ID\"
        className=\"flex-1\"
        maxLength={12}
      />
      <Button
        type=\"submit\"
        disabled={!roomId.trim() || isLoading}
        variant=\"outline\"
      >
        Join
      </Button>
    </form>
  )
}

export default CreateRoom
```

### Room Info Component (client/src/components/room/RoomInfo.tsx)
```typescript
import React from 'react'
import { Room } from '@shared/types/Room'
import ShareRoomButton from './ShareRoomButton'

interface RoomInfoProps {
  room: Room
  participantCount: number
}

const RoomInfo: React.FC<RoomInfoProps> = ({ room, participantCount }) => {
  return (
    <div className=\"bg-white rounded-lg shadow-sm border p-4 mb-6\">
      <div className=\"flex items-center justify-between\">
        <div className=\"flex-1\">
          <h1 className=\"text-xl font-semibold text-gray-900\">
            {room.name || 'Anonymous Room'}
          </h1>
          <div className=\"flex items-center space-x-4 text-sm text-gray-500 mt-1\">
            <span>Room ID: {room.id}</span>
            <span>•</span>
            <span>{participantCount} participant{participantCount !== 1 ? 's' : ''}</span>
            <span>•</span>
            <span>Created {new Date(room.created_at).toLocaleDateString()}</span>
          </div>
        </div>
        
        <div className=\"flex items-center space-x-2\">
          <ShareRoomButton roomId={room.id} roomName={room.name} />
        </div>
      </div>
    </div>
  )
}

export default RoomInfo
```

### Share Room Component (client/src/components/room/ShareRoomButton.tsx)
```typescript
import React, { useState } from 'react'
import Button from '../ui/Button'

interface ShareRoomButtonProps {
  roomId: string
  roomName?: string
}

const ShareRoomButton: React.FC<ShareRoomButtonProps> = ({ roomId, roomName }) => {
  const [copied, setCopied] = useState(false)
  const [showQR, setShowQR] = useState(false)
  
  const roomUrl = `${window.location.origin}/room/${roomId}`
  
  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(roomUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea')
      textArea.value = roomUrl
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }
  
  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Join ${roomName || 'Planning Poker Room'}`,
          text: 'Join our planning poker session',
          url: roomUrl,
        })
      } catch (error) {
        // User cancelled sharing
      }
    }
  }
  
  return (
    <div className=\"relative\">
      <div className=\"flex items-center space-x-2\">
        <Button
          variant=\"outline\"
          size=\"sm\"
          onClick={handleCopyUrl}
          className={copied ? 'bg-green-50 border-green-200' : ''}
        >
          {copied ? '✓ Copied!' : '📋 Copy Link'}
        </Button>
        
        {navigator.share && (
          <Button
            variant=\"outline\"
            size=\"sm\"
            onClick={handleNativeShare}
          >
            📤 Share
          </Button>
        )}
        
        <Button
          variant=\"outline\"
          size=\"sm\"
          onClick={() => setShowQR(!showQR)}
        >
          📱 QR Code
        </Button>
      </div>
      
      {showQR && (
        <div className=\"absolute right-0 top-full mt-2 bg-white border rounded-lg shadow-lg p-4 z-10\">
          <div className=\"text-center\">
            <div className=\"w-32 h-32 bg-gray-100 rounded-lg flex items-center justify-center mb-2\">
              <QRCodeComponent value={roomUrl} size={128} />
            </div>
            <p className=\"text-xs text-gray-600\">
              Scan to join room
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

// Simple QR Code component (you can use a library like qrcode-generator)
const QRCodeComponent: React.FC<{ value: string; size: number }> = ({ value, size }) => {
  // For now, show placeholder - implement actual QR code generation
  return (
    <div className=\"text-xs text-gray-400 text-center p-4\">
      QR Code<br />
      {value.slice(-8)}
    </div>
  )
}

export default ShareRoomButton
```

### Room Service (client/src/services/roomService.ts)
```typescript
import { Room } from '@shared/types/Room'

const API_BASE = '/api'

export const roomService = {
  async createRoom(name?: string): Promise<Room> {
    const response = await fetch(`${API_BASE}/rooms`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name }),
    })
    
    if (!response.ok) {
      throw new Error('Failed to create room')
    }
    
    return response.json()
  },
  
  async getRoomById(id: string): Promise<Room> {
    const response = await fetch(`${API_BASE}/rooms/${id}`)
    
    if (!response.ok) {
      throw new Error('Room not found')
    }
    
    return response.json()
  },
}
```

### Input Component (client/src/components/ui/Input.tsx)
```typescript
import React from 'react'
import { clsx } from 'clsx'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string
}

const Input: React.FC<InputProps> = ({ className, error, ...props }) => {
  return (
    <div className=\"w-full\">
      <input
        className={clsx(
          'w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm',
          'placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
          error && 'border-red-300 focus:ring-red-500 focus:border-red-500',
          className
        )}
        {...props}
      />
      {error && (
        <p className=\"mt-1 text-sm text-red-600\">{error}</p>
      )}
    </div>
  )
}

export default Input
```

### Card Component (client/src/components/ui/Card.tsx)
```typescript
import React from 'react'
import { clsx } from 'clsx'

interface CardProps {
  children: React.ReactNode
  className?: string
  padding?: boolean
}

const Card: React.FC<CardProps> = ({ children, className, padding = true }) => {
  return (
    <div
      className={clsx(
        'bg-white rounded-lg shadow-sm border',
        padding && 'p-4',
        className
      )}
    >
      {children}
    </div>
  )
}

export default Card
```

## Success Criteria
- [ ] Room creation form works and redirects to new room
- [ ] Room joining validates room existence
- [ ] URL sharing and copying functionality works
- [ ] Room information displays correctly
- [ ] Form validation provides appropriate feedback
- [ ] Loading states show during API calls
- [ ] Error handling displays user-friendly messages

## Common Issues & Solutions

### Issue: API calls failing
**Solution**: Ensure Vite proxy is configured correctly for /api routes

### Issue: Clipboard API not working
**Solution**: Provide fallback using document.execCommand for older browsers

### Issue: Form validation not working
**Solution**: Ensure proper state management and validation logic

## Testing Checklist
- [ ] Create room form submits successfully
- [ ] Room name validation works (optional field)
- [ ] Join room validates room ID format
- [ ] Invalid room ID shows appropriate error
- [ ] Copy URL button works and shows feedback
- [ ] Share button works on mobile devices
- [ ] Room info displays all required information
- [ ] Loading states appear during operations

## Next Steps
After completion, proceed to **Phase 11: Voting Interface** to create voting cards and selection logic.

## Time Tracking
- Start Time: ___________
- End Time: ___________
- Actual Duration: ___________
- Notes: ___________

## Dependencies
- **Blocks**: Phase 11 (Voting Interface)
- **Blocked by**: Phase 9 (Frontend Foundation)