# Phase 11: Sound & Animation Features

## Objective
Implement join/leave sound notifications, vote confirmation sounds, confetti animation setup, and unanimous vote detection with proper audio management.

## Prerequisites
- Phase 12 completed (real-time integration)
- Understanding of Web Audio API and animation libraries

## Estimated Time
**1 hour** (4 tasks × 15 minutes each)

## Tasks Breakdown

### Task 1: Join/Leave Sound Notifications (15 min)
- [ ] Implement Web Audio API sound generation
- [ ] Create distinct sounds for join/leave events  
- [ ] Add user preference for sound on/off
- [ ] Test sound playback across browsers

### Task 2: Vote Confirmation Sounds (15 min)
- [ ] Create vote confirmation sound effect
- [ ] Add sound to vote submission feedback
- [ ] Implement volume control
- [ ] Handle audio permissions properly

### Task 3: Confetti Animation Setup (15 min)
- [ ] Install and configure canvas-confetti library
- [ ] Create confetti animation function
- [ ] Add animation customization options
- [ ] Test performance across devices

### Task 4: Unanimous Vote Detection (15 min)
- [ ] Implement unanimous vote detection logic
- [ ] Trigger confetti for unanimous results
- [ ] Add special visual feedback for consensus
- [ ] Test with different vote scenarios

## Deliverables

### Audio Service (client/src/services/audioService.ts)
```typescript
class AudioService {
  private audioContext: AudioContext | null = null
  private isEnabled: boolean = true
  private volume: number = 0.1

  constructor() {
    // Initialize audio context on first user interaction
    this.initializeAudioContext()
  }

  private async initializeAudioContext(): Promise<void> {
    if (!this.audioContext) {
      try {
        this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
        
        // Resume context if suspended (required by some browsers)
        if (this.audioContext.state === 'suspended') {
          await this.audioContext.resume()
        }
      } catch (error) {
        console.warn('Audio context initialization failed:', error)
      }
    }
  }

  private createTone(frequency: number, duration: number, type: OscillatorType = 'sine'): void {
    if (!this.audioContext || !this.isEnabled) return

    try {
      const oscillator = this.audioContext.createOscillator()
      const gainNode = this.audioContext.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(this.audioContext.destination)
      
      oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime)
      oscillator.type = type
      
      // Envelope for smooth sound
      gainNode.gain.setValueAtTime(0, this.audioContext.currentTime)
      gainNode.gain.linearRampToValueAtTime(this.volume, this.audioContext.currentTime + 0.01)
      gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration)
      
      oscillator.start(this.audioContext.currentTime)
      oscillator.stop(this.audioContext.currentTime + duration)
    } catch (error) {
      console.warn('Sound playback failed:', error)
    }
  }

  playUserJoined(): void {
    // Pleasant ascending tone
    this.createTone(523.25, 0.2) // C5
  }

  playUserLeft(): void {
    // Gentle descending tone
    this.createTone(392.00, 0.3) // G4
  }

  playVoteConfirmation(): void {
    // Quick confirmation beep
    this.createTone(659.25, 0.15) // E5
  }

  playVoteRevealed(): void {
    // Drum roll effect with multiple tones
    const frequencies = [200, 250, 300, 350, 400]
    frequencies.forEach((freq, index) => {
      setTimeout(() => {
        this.createTone(freq, 0.1, 'square')
      }, index * 50)
    })
  }

  playUnanimousVote(): void {
    // Celebration chord
    const chord = [523.25, 659.25, 783.99] // C-E-G major chord
    chord.forEach((freq, index) => {
      setTimeout(() => {
        this.createTone(freq, 1.0)
      }, index * 100)
    })
  }

  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled
    localStorage.setItem('audio-enabled', enabled.toString())
  }

  setVolume(volume: number): void {
    this.volume = Math.max(0, Math.min(1, volume))
    localStorage.setItem('audio-volume', this.volume.toString())
  }

  getEnabled(): boolean {
    return this.isEnabled
  }

  getVolume(): number {
    return this.volume
  }

  // Load preferences from localStorage
  loadPreferences(): void {
    const savedEnabled = localStorage.getItem('audio-enabled')
    const savedVolume = localStorage.getItem('audio-volume')
    
    if (savedEnabled !== null) {
      this.isEnabled = savedEnabled === 'true'
    }
    if (savedVolume !== null) {
      this.volume = parseFloat(savedVolume)
    }
  }
}

export const audioService = new AudioService()
```

### Confetti Service (client/src/services/confettiService.ts)
```typescript
import confetti from 'canvas-confetti'

class ConfettiService {
  
  triggerUnanimousVote(): void {
    // Main burst
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7']
    })
    
    // Side bursts
    setTimeout(() => {
      confetti({
        particleCount: 50,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#ff6b6b', '#4ecdc4', '#45b7d1']
      })
    }, 250)
    
    setTimeout(() => {
      confetti({
        particleCount: 50,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#96ceb4', '#ffeaa7', '#ff6b6b']
      })
    }, 400)
  }
  
  triggerVoteRevealed(): void {
    // Smaller celebration for regular vote reveals
    confetti({
      particleCount: 30,
      spread: 45,
      origin: { y: 0.7 },
      colors: ['#45b7d1', '#96ceb4']
    })
  }
  
  triggerRoomCreated(): void {
    // Welcome celebration
    confetti({
      particleCount: 60,
      angle: 90,
      spread: 45,
      origin: { y: 0.8 },
      colors: ['#4ecdc4', '#45b7d1']
    })
  }
  
  // Custom confetti with specific settings
  custom(options: confetti.Options): void {
    confetti(options)
  }
}

export const confettiService = new ConfettiService()
```

### Audio Settings Component (client/src/components/settings/AudioSettings.tsx)
```typescript
import React from 'react'
import { audioService } from '../../services/audioService'
import Button from '../ui/Button'

interface AudioSettingsProps {
  isOpen: boolean
  onClose: () => void
}

const AudioSettings: React.FC<AudioSettingsProps> = ({ isOpen, onClose }) => {
  const [isEnabled, setIsEnabled] = React.useState(audioService.getEnabled())
  const [volume, setVolume] = React.useState(audioService.getVolume())
  
  React.useEffect(() => {
    audioService.loadPreferences()
    setIsEnabled(audioService.getEnabled())
    setVolume(audioService.getVolume())
  }, [])
  
  const handleToggleAudio = () => {
    const newEnabled = !isEnabled
    setIsEnabled(newEnabled)
    audioService.setEnabled(newEnabled)
    
    if (newEnabled) {
      audioService.playVoteConfirmation()
    }
  }
  
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value)
    setVolume(newVolume)
    audioService.setVolume(newVolume)
  }
  
  const testSound = () => {
    audioService.playVoteConfirmation()
  }
  
  if (!isOpen) return null
  
  return (
    <div className=\"fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50\">\n      <div className=\"bg-white rounded-lg p-6 w-full max-w-md\">\n        <div className=\"flex items-center justify-between mb-4\">\n          <h2 className=\"text-lg font-semibold\">Audio Settings</h2>\n          <button\n            onClick={onClose}\n            className=\"text-gray-400 hover:text-gray-600\"\n          >\n            ✕\n          </button>\n        </div>\n        \n        <div className=\"space-y-4\">\n          <div className=\"flex items-center justify-between\">\n            <label className=\"text-sm font-medium text-gray-700\">\n              Enable Sound Effects\n            </label>\n            <button\n              onClick={handleToggleAudio}\n              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${\n                isEnabled ? 'bg-blue-600' : 'bg-gray-200'\n              }`}\n            >\n              <span\n                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${\n                  isEnabled ? 'translate-x-6' : 'translate-x-1'\n                }`}\n              />\n            </button>\n          </div>\n          \n          {isEnabled && (\n            <>\n              <div>\n                <label className=\"block text-sm font-medium text-gray-700 mb-2\">\n                  Volume: {Math.round(volume * 100)}%\n                </label>\n                <input\n                  type=\"range\"\n                  min=\"0\"\n                  max=\"1\"\n                  step=\"0.1\"\n                  value={volume}\n                  onChange={handleVolumeChange}\n                  className=\"w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer\"\n                />\n              </div>\n              \n              <Button\n                variant=\"outline\"\n                size=\"sm\"\n                onClick={testSound}\n                className=\"w-full\"\n              >\n                🔊 Test Sound\n              </Button>\n            </>\n          )}\n        </div>\n        \n        <div className=\"mt-6 text-xs text-gray-500\">\n          <p>Sound effects include:</p>\n          <ul className=\"mt-1 space-y-1\">\n            <li>• User join/leave notifications</li>\n            <li>• Vote confirmation feedback</li>\n            <li>• Vote revelation sounds</li>\n          </ul>\n        </div>\n        \n        <div className=\"mt-4 flex justify-end\">\n          <Button onClick={onClose} variant=\"primary\">\n            Done\n          </Button>\n        </div>\n      </div>\n    </div>\n  )\n}\n\nexport default AudioSettings\n```\n\n### Updated Room Hook with Audio/Animation (client/src/hooks/useRoom.ts - additions)\n```typescript\n// Add these imports at the top\nimport { audioService } from '../services/audioService'\nimport { confettiService } from '../services/confettiService'\n\n// Add these to the setupEventListeners function:\nconst setupEventListeners = useCallback(() => {\n  socketService.onUserJoined(({ user }) => {\n    setUsers(prev => [...prev, user])\n    audioService.playUserJoined()\n  })\n  \n  socketService.onUserLeft(({ user }) => {\n    setUsers(prev => prev.filter(u => u.id !== user.id))\n    audioService.playUserLeft()\n  })\n  \n  socketService.onVoteSubmitted(({ vote }) => {\n    audioService.playVoteConfirmation()\n  })\n  \n  socketService.onVotesRevealed(({ session, votes, isUnanimous }) => {\n    setCurrentSession(session)\n    setVotes(votes)\n    setIsUnanimous(isUnanimous)\n    \n    audioService.playVoteRevealed()\n    \n    if (isUnanimous) {\n      setTimeout(() => {\n        audioService.playUnanimousVote()\n        confettiService.triggerUnanimousVote()\n      }, 500)\n    } else {\n      confettiService.triggerVoteRevealed()\n    }\n  })\n  \n  // ... rest of event listeners\n}, [currentUser])\n```\n\n### Unanimous Vote Banner (client/src/components/voting/UnanimousVoteBanner.tsx)\n```typescript\nimport React from 'react'\n\ninterface UnanimousVoteBannerProps {\n  voteValue: string\n  show: boolean\n}\n\nconst UnanimousVoteBanner: React.FC<UnanimousVoteBannerProps> = ({ voteValue, show }) => {\n  if (!show) return null\n  \n  const getVoteLabel = (value: string) => {\n    switch (value) {\n      case 'coffee': return '☕ Break Time!'\n      case 'question': return '❓ Need Clarification!'\n      default: return `${value} Points!`\n    }\n  }\n  \n  return (\n    <div className=\"fixed top-4 left-1/2 transform -translate-x-1/2 z-50 animate-bounce\">\n      <div className=\"bg-gradient-to-r from-green-400 to-blue-500 text-white px-8 py-4 rounded-full shadow-lg\">\n        <div className=\"flex items-center space-x-2\">\n          <span className=\"text-2xl\">🎉</span>\n          <span className=\"font-bold text-lg\">\n            Unanimous! {getVoteLabel(voteValue)}\n          </span>\n          <span className=\"text-2xl\">🎉</span>\n        </div>\n      </div>\n    </div>\n  )\n}\n\nexport default UnanimousVoteBanner\n```\n\n### Package.json Dependencies\n```json\n{\n  \"dependencies\": {\n    \"canvas-confetti\": \"^1.9.0\"\n  },\n  \"devDependencies\": {\n    \"@types/canvas-confetti\": \"^1.6.0\"\n  }\n}\n```\n\n## Success Criteria\n- [ ] Join/leave sounds play correctly for all users\n- [ ] Vote confirmation sound provides immediate feedback\n- [ ] Audio settings allow users to control preferences\n- [ ] Confetti animation triggers for unanimous votes\n- [ ] Animation performance is smooth across devices\n- [ ] Audio permissions are handled gracefully\n- [ ] Sound preferences persist across sessions\n\n## Common Issues & Solutions\n\n### Issue: Audio not playing in some browsers\n**Solution**: Ensure audio context is created after user interaction\n\n### Issue: Confetti animation performance issues\n**Solution**: Optimize particle count and animation settings\n\n### Issue: Audio permissions blocked\n**Solution**: Provide fallback UI feedback when audio fails\n\n## Testing Checklist\n- [ ] Join sound plays when users enter room\n- [ ] Leave sound plays when users exit room\n- [ ] Vote confirmation sound on vote submission\n- [ ] Confetti shows for unanimous votes only\n- [ ] Audio settings toggle works correctly\n- [ ] Volume control affects sound levels\n- [ ] Preferences save and load correctly\n- [ ] Animation performance is acceptable on mobile\n- [ ] Audio works across different browsers\n\n## Next Steps\nAfter completion, proceed to **Phase 14: Responsive Design** to optimize mobile and tablet layouts.\n\n## Time Tracking\n- Start Time: ___________\n- End Time: ___________\n- Actual Duration: ___________\n- Notes: ___________\n\n## Dependencies\n- **Blocks**: Phase 14 (Responsive Design)\n- **Blocked by**: Phase 12 (Real-time Integration)