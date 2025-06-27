# Phase 9: Voting Interface

## Objective
Create Fibonacci voting cards, special option cards, vote selection logic, reveal/new session buttons, and vote display components.

## Prerequisites
- Phase 8 completed (room UI components)
- Understanding of card-based UI design

## Estimated Time
**1 hour** (5 tasks × 12 minutes each)

## Tasks Breakdown

### Task 1: Fibonacci Voting Cards (12 min)
- [ ] Create voting card component with Fibonacci values
- [ ] Design card layout and hover states
- [ ] Add card selection and active states
- [ ] Implement card click handling

### Task 2: Special Option Cards (12 min)
- [ ] Create coffee cup (☕) and question mark (❓) cards
- [ ] Style special cards differently from number cards
- [ ] Add proper icons and labels
- [ ] Test special card functionality

### Task 3: Vote Selection Logic (12 min)
- [ ] Implement vote state management
- [ ] Add vote submission validation
- [ ] Handle vote updates and changes
- [ ] Show selected vote feedback

### Task 4: Reveal/New Session Buttons (12 min)
- [ ] Create reveal votes button with proper styling
- [ ] Add new session button (shown after reveal)
- [ ] Implement button state management
- [ ] Add loading states for button actions

### Task 5: Vote Display Components (12 min)
- [ ] Create vote results display component
- [ ] Show individual user votes after reveal
- [ ] Add vote statistics (counts, percentages)
- [ ] Style unanimous vote indication

## Deliverables

### Voting Card Component (client/src/components/voting/VotingCard.tsx)
```typescript
import React from 'react'
import { clsx } from 'clsx'
import { VoteValue } from '@shared/types/Vote'

interface VotingCardProps {
  value: VoteValue
  isSelected: boolean
  isDisabled: boolean
  onClick: (value: VoteValue) => void
}

const VotingCard: React.FC<VotingCardProps> = ({
  value,
  isSelected,
  isDisabled,
  onClick
}) => {
  const isSpecial = value === 'coffee' || value === 'question'
  
  const handleClick = () => {
    if (!isDisabled) {
      onClick(value)
    }
  }
  
  const getCardContent = () => {
    switch (value) {
      case 'coffee':
        return { icon: '☕', label: 'Break' }
      case 'question':
        return { icon: '❓', label: 'Unclear' }
      default:
        return { icon: value, label: value }
    }
  }
  
  const { icon, label } = getCardContent()
  
  return (
    <button
      onClick={handleClick}
      disabled={isDisabled}
      className={clsx(
        'relative w-16 h-20 rounded-lg border-2 transition-all duration-200',
        'flex flex-col items-center justify-center',
        'hover:shadow-lg hover:-translate-y-1',
        'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
        isSelected ? (
          isSpecial
            ? 'bg-orange-500 border-orange-600 text-white shadow-lg transform -translate-y-1'
            : 'bg-blue-500 border-blue-600 text-white shadow-lg transform -translate-y-1'
        ) : (
          isSpecial
            ? 'bg-orange-50 border-orange-200 text-orange-700 hover:bg-orange-100'
            : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
        ),
        isDisabled && 'opacity-50 cursor-not-allowed hover:transform-none hover:shadow-none'
      )}
    >
      <span className={clsx(
        'text-lg font-bold',
        isSpecial ? 'text-2xl' : 'text-xl'
      )}>
        {icon}
      </span>
      {isSpecial && (
        <span className="text-xs mt-1">
          {label}
        </span>
      )}
      
      {isSelected && (
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
          <span className="text-white text-xs">✓</span>
        </div>
      )}
    </button>
  )
}

export default VotingCard
```

### Voting Panel Component (client/src/components/voting/VotingPanel.tsx)
```typescript
import React, { useState } from 'react'
import VotingCard from './VotingCard'
import Button from '../ui/Button'
import { VoteValue } from '@shared/types/Vote'

interface VotingPanelProps {
  onVoteSubmit: (value: VoteValue) => void
  onRevealVotes: () => void
  onNewSession: () => void
  isVotingPhase: boolean
  isRevealed: boolean
  canReveal: boolean
  userVote?: VoteValue
  isLoading: boolean
}

const FIBONACCI_VALUES: VoteValue[] = ['0', '1', '2', '3', '5', '8', '13', '21']
const SPECIAL_VALUES: VoteValue[] = ['coffee', 'question']

const VotingPanel: React.FC<VotingPanelProps> = ({
  onVoteSubmit,
  onRevealVotes,
  onNewSession,
  isVotingPhase,
  isRevealed,
  canReveal,
  userVote,
  isLoading
}) => {
  const [selectedVote, setSelectedVote] = useState<VoteValue | null>(userVote || null)
  
  const handleVoteSelect = (value: VoteValue) => {
    if (!isVotingPhase) return
    
    setSelectedVote(value)
    onVoteSubmit(value)
  }
  
  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="text-center mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">
          {isVotingPhase ? 'Cast Your Vote' : isRevealed ? 'Votes Revealed' : 'Waiting for Votes'}
        </h2>
        {isVotingPhase && (
          <p className="text-sm text-gray-600">
            Select a card to cast your vote
          </p>
        )}
      </div>
      
      {/* Fibonacci Cards */}
      <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Story Points</h3>
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-3 justify-items-center">
          {FIBONACCI_VALUES.map((value) => (
            <VotingCard
              key={value}
              value={value}
              isSelected={selectedVote === value}
              isDisabled={!isVotingPhase || isLoading}
              onClick={handleVoteSelect}
            />
          ))}
        </div>
      </div>
      
      {/* Special Cards */}
      <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Special Options</h3>
        <div className="grid grid-cols-2 gap-3 justify-items-center">
          {SPECIAL_VALUES.map((value) => (
            <VotingCard
              key={value}
              value={value}
              isSelected={selectedVote === value}
              isDisabled={!isVotingPhase || isLoading}
              onClick={handleVoteSelect}
            />
          ))}
        </div>
      </div>
      
      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        {isVotingPhase && canReveal && (
          <Button
            onClick={onRevealVotes}
            disabled={isLoading}
            size="lg"
          >
            {isLoading ? 'Revealing...' : 'Reveal Cards'}
          </Button>
        )}
        
        {isRevealed && (
          <Button
            onClick={onNewSession}
            disabled={isLoading}
            variant="secondary"
            size="lg"
          >
            {isLoading ? 'Starting...' : 'Start New Session'}
          </Button>
        )}
      </div>
      
      {selectedVote && isVotingPhase && (
        <div className="mt-4 text-center">
          <p className="text-sm text-green-600">
            ✓ Your vote: <strong>{selectedVote === 'coffee' ? '☕ Break' : selectedVote === 'question' ? '❓ Unclear' : selectedVote}</strong>
          </p>
        </div>
      )}
    </div>
  )
}

export default VotingPanel
```

### Vote Results Component (client/src/components/voting/VoteResults.tsx)
```typescript
import React from 'react'
import { Vote } from '@shared/types/Vote'
import { User } from '@shared/types/User'

interface VoteResultsProps {
  votes: (Vote & { user: User })[]
  isUnanimous: boolean
}

const VoteResults: React.FC<VoteResultsProps> = ({ votes, isUnanimous }) => {
  const getVoteStats = () => {
    const stats: Record<string, number> = {}
    votes.forEach(vote => {
      stats[vote.value] = (stats[vote.value] || 0) + 1
    })
    return stats
  }
  
  const getVoteLabel = (value: string) => {
    switch (value) {
      case 'coffee': return '☕ Break'
      case 'question': return '❓ Unclear'
      default: return value
    }
  }
  
  const stats = getVoteStats()
  const mostCommonVote = Object.entries(stats).reduce((a, b) => stats[a[0]] > stats[b[0]] ? a : b)[0]
  
  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">
          Vote Results
        </h2>
        {isUnanimous && (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
            🎉 Unanimous!
          </span>
        )}
      </div>
      
      {/* Vote Statistics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {Object.entries(stats).map(([value, count]) => (
          <div
            key={value}
            className={`text-center p-3 rounded-lg border-2 ${
              value === mostCommonVote && !isUnanimous
                ? 'border-blue-200 bg-blue-50'
                : isUnanimous
                ? 'border-green-200 bg-green-50'
                : 'border-gray-200 bg-gray-50'
            }`}
          >
            <div className="text-lg font-bold text-gray-900">
              {getVoteLabel(value)}
            </div>
            <div className="text-sm text-gray-600">
              {count} vote{count !== 1 ? 's' : ''}
            </div>
          </div>
        ))}
      </div>
      
      {/* Individual Votes */}
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-3">
          Individual Votes
        </h3>
        <div className="space-y-2">
          {votes.map((vote) => {
            const avatar = JSON.parse(vote.user.avatar)
            return (
              <div key={vote.id} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-full ${avatar.color} flex items-center justify-center text-white text-sm font-bold`}>
                    {avatar.initials}
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    {vote.user.name}
                  </span>
                </div>
                <span className="text-sm font-semibold text-gray-700">
                  {getVoteLabel(vote.value)}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default VoteResults
```

### Vote Statistics Component (client/src/components/voting/VoteStats.tsx)
```typescript
import React from 'react'
import { VoteStats as VoteStatsType } from '@shared/types/Vote'

interface VoteStatsProps {
  stats: VoteStatsType
  totalUsers: number
  isRevealed: boolean
}

const VoteStats: React.FC<VoteStatsProps> = ({ stats, totalUsers, isRevealed }) => {
  const votedCount = stats.total
  const pendingCount = totalUsers - votedCount
  const votedPercentage = totalUsers > 0 ? Math.round((votedCount / totalUsers) * 100) : 0
  
  return (
    <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-gray-700">
          Voting Progress
        </h3>
        <span className="text-sm text-gray-500">
          {votedCount} of {totalUsers} voted
        </span>
      </div>
      
      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
        <div
          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${votedPercentage}%` }}
        ></div>
      </div>
      
      <div className="flex justify-between text-xs text-gray-600">
        <span>{votedPercentage}% complete</span>
        {pendingCount > 0 && (
          <span>{pendingCount} pending</span>
        )}
      </div>
      
      {!isRevealed && votedCount > 0 && (
        <div className="mt-3 text-center">
          <div className="inline-flex items-center space-x-1 text-xs text-gray-500">
            <div className="flex space-x-1">
              {Array.from({ length: Math.min(votedCount, 5) }, (_, i) => (
                <div key={i} className="w-2 h-2 bg-blue-400 rounded-full"></div>
              ))}
              {votedCount > 5 && <span>+{votedCount - 5}</span>}
            </div>
            <span>votes cast</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default VoteStats
```

## Success Criteria
- [ ] Fibonacci cards display correctly with proper styling
- [ ] Special option cards (coffee, question) work properly
- [ ] Vote selection updates state and shows feedback
- [ ] Reveal button triggers vote revelation
- [ ] New session button clears votes and starts fresh
- [ ] Vote results display individual votes correctly
- [ ] Vote statistics show accurate counts
- [ ] Unanimous votes are detected and highlighted

## Common Issues & Solutions

### Issue: Card selection not updating
**Solution**: Ensure proper state management and event handling

### Issue: Special cards not styled correctly
**Solution**: Check conditional CSS classes and icon rendering

### Issue: Vote statistics incorrect
**Solution**: Verify vote counting logic and data processing

## Testing Checklist
- [ ] All voting cards are clickable and show selection
- [ ] Special cards display proper icons and labels
- [ ] Vote submission provides immediate feedback
- [ ] Reveal button shows all votes correctly
- [ ] New session clears all previous votes
- [ ] Vote statistics match actual votes cast
- [ ] Unanimous detection works correctly
- [ ] Mobile responsive layout works

## Next Steps
After completion, proceed to **Phase 10: Real-time Integration** to connect voting UI with Socket.io backend.

## Time Tracking
- Start Time: ___________
- End Time: ___________
- Actual Duration: ___________
- Notes: ___________

## Dependencies
- **Blocks**: Phase 10 (Real-time Integration)
- **Blocked by**: Phase 8 (Room UI Components)