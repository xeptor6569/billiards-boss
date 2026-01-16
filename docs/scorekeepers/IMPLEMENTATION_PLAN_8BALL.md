# APA 8-Ball Scorekeeper Implementation Plan

## Overview
The APA 8-ball scorekeeper is similar to 9-ball in that it uses lag/flip for break determination and the Equalizer® handicap system. However, it differs significantly in scoring: instead of tracking points per ball, it tracks **racks won** based on skill level (SL) combinations.

## Key Requirements

### Similarities to 9-Ball
- ✅ Lag/flip determination before game start
- ✅ Equalizer® handicap system (skill levels 2-7)
- ✅ Player names customization

### Key Differences
- ❌ **No ball selection** - much simpler interaction model
- ✅ **Racks won** instead of points per ball
- ✅ **SL-based target matrix** - different rack targets based on SL combination
- ✅ **Minimal interactions**: Only record:
  - End Turn
  - Defenses
  - Fouls
  - Time-outs (2-minute timer)

## SL-Based Rack Target Matrix

Based on the payoff matrix image, the rack targets are determined by the skill level combination:

| Your SL | Opponent SL | You Need | Opponent Needs |
|---------|-------------|----------|----------------|
| 2       | 2           | 2        | 2              |
| 2       | 3           | 2        | 3              |
| 2       | 4           | 2        | 4              |
| 2       | 5           | 2        | 5              |
| 2       | 6           | 2        | 6              |
| 2       | 7           | 2        | 7              |
| 3       | 2           | 3        | 2              |
| 3       | 3           | 2        | 2              |
| 3       | 4           | 2        | 3              |
| 3       | 5           | 2        | 4              |
| 3       | 6           | 2        | 5              |
| 3       | 7           | 2        | 6              |
| 4       | 2           | 4        | 2              |
| 4       | 3           | 3        | 2              |
| 4       | 4           | 3        | 3              |
| 4       | 5           | 3        | 4              |
| 4       | 6           | 3        | 5              |
| 4       | 7           | 2        | 5              |
| 5       | 2           | 5        | 2              |
| 5       | 3           | 4        | 2              |
| 5       | 4           | 4        | 3              |
| 5       | 5           | 4        | 4              |
| 5       | 6           | 4        | 5              |
| 5       | 7           | 3        | 5              |
| 6       | 2           | 6        | 2              |
| 6       | 3           | 5        | 2              |
| 6       | 4           | 5        | 3              |
| 6       | 5           | 5        | 4              |
| 6       | 6           | 5        | 5              |
| 6       | 7           | 4        | 5              |
| 7       | 2           | 7        | 2              |
| 7       | 3           | 6        | 2              |
| 7       | 4           | 5        | 2              |
| 7       | 5           | 5        | 3              |
| 7       | 6           | 5        | 4              |
| 7       | 7           | 5        | 5              |

**Pattern**: The matrix shows "X/Y" where X is racks you need to win, Y is racks opponent needs to win.

## Game State Structure

```typescript
interface APA8BallGameState extends BaseGameState {
  gameType: 'apa8ball';
  gameData: {
    player1: {
      skillLevel: number; // 2-7
      rackTarget: number; // Racks needed to win (from matrix)
      racksWon: number; // Current racks won
      innings: number;
      defensiveShots: number;
      fouls: number;
      timeoutsUsed: number; // Track time-outs
      timeoutsRemaining: number; // Usually 2 per game
    };
    player2: {
      skillLevel: number; // 2-7
      rackTarget: number; // Racks needed to win (from matrix)
      racksWon: number; // Current racks won
      innings: number;
      defensiveShots: number;
      fouls: number;
      timeoutsUsed: number;
      timeoutsRemaining: number;
    };
    currentPlayer: 1 | 2;
    gameStatus: 'in-progress' | 'player1-won' | 'player2-won';
    breakPlayer: 1 | 2 | null; // Determined by lag/flip
    currentRack: number; // Current rack number
    racks: APA8BallRack[]; // History of completed racks
    player1Name: string;
    player2Name: string;
  };
}

interface APA8BallRack {
  rackNumber: number;
  winner: 1 | 2 | null; // Who won this rack
  breakPlayer: 1 | 2;
  player1Innings: number;
  player2Innings: number;
  player1Fouls: number;
  player2Fouls: number;
  player1DefensiveShots: number;
  player2DefensiveShots: number;
  completedAt?: Date;
}
```

## Simplified Interaction Model

Unlike 9-ball, 8-ball does NOT require:
- ❌ Ball selection UI
- ❌ Tracking which balls were made
- ❌ Complex shot validation

Instead, the scorekeeper only needs to track:
1. **End Turn** - Switch players, increment innings
2. **Defense** - Mark defensive shot
3. **Foul** - Record foul
4. **Time-out** - Start 2-minute timer, decrement time-outs remaining
5. **Rack Complete** - When a rack ends, record winner and increment `racksWon`

## Implementation Steps

### 1. Core Game Logic (`src/lib/game-types/apa8ball.ts`)

#### 1.1 SL Matrix Lookup
```typescript
// Matrix: [yourSL][opponentSL] = { you: X, opponent: Y }
const RACK_TARGET_MATRIX: Record<number, Record<number, { you: number; opponent: number }>> = {
  2: { 2: { you: 2, opponent: 2 }, 3: { you: 2, opponent: 3 }, ... },
  3: { 2: { you: 3, opponent: 2 }, 3: { you: 2, opponent: 2 }, ... },
  // ... etc
};

function getRackTargets(player1SL: number, player2SL: number): { player1: number; player2: number } {
  const targets = RACK_TARGET_MATRIX[player1SL]?.[player2SL];
  if (!targets) {
    // Default fallback
    return { player1: 2, player2: 2 };
  }
  return {
    player1: targets.you,
    player2: targets.opponent,
  };
}
```

#### 1.2 Game State Creation
- Accept `player1SL`, `player2SL`, `player1Name`, `player2Name`, `breakPlayer`
- Calculate rack targets from matrix
- Initialize with 2 time-outs per player

#### 1.3 Simplified `addScore` Function
Handle only these inputs:
- `{ type: 'custom', data: { action: 'endTurn' } }` - Switch players, increment innings
- `{ type: 'custom', data: { action: 'defensiveShot' } }` - Increment defensive shots
- `{ type: 'foul' }` - Increment fouls
- `{ type: 'custom', data: { action: 'timeout' } }` - Start timer, decrement timeouts
- `{ type: 'custom', data: { action: 'rackComplete', winner: 1 | 2 } }` - Record rack winner

#### 1.4 Win Condition
```typescript
function checkWinCondition(state: APA8BallGameState, player: 1 | 2): boolean {
  const playerData = state.gameData[player === 1 ? 'player1' : 'player2'];
  return playerData.racksWon >= playerData.rackTarget;
}
```

### 2. UI Components

#### 2.1 `APA8BallScoreDisplay.tsx`
- Show player names, SL, racks won / target
- Progress bar toward rack target
- Stats: Innings, Defenses, Fouls, Time-outs remaining
- **No ball display** (simpler than 9-ball)

#### 2.2 `APA8BallTurnControls.tsx`
Simple button set:
- **End Turn** - Always visible
- **Defense** - Mark defensive shot
- **Foul** - Record foul
- **Time-out** - Only if timeouts remaining > 0
- **Rack Complete** - Only when rack ends (with winner selection)

#### 2.3 `APA8BallSkillLevelSelector.tsx`
- Reuse pattern from 9-ball
- Allow SL selection 2-7 for both players

#### 2.4 `APA8BallBreakDetermination.tsx`
- **Reuse existing component** from 9-ball
- Same lag/flip UI

#### 2.5 Time-out Timer Component
- New component: `TimeoutTimer.tsx`
- 2-minute countdown
- Visual timer display
- Auto-complete when time expires

### 3. Integration with New Game Page

Update `src/app/dashboard/games/new/page.tsx`:
1. Add `apa8ball` case to game type handling
2. Show skill level selector first
3. Show break determination second
4. Render simplified UI (no ball selector)
5. Use `APA8BallScoreDisplay` and `APA8BallTurnControls`

### 4. Data Flow

```
User Flow:
1. Select game type: APA 8-Ball
2. Select skill levels (2-7 each)
3. Lag/flip to determine break
4. Game starts:
   - Display racks won / target
   - Show turn controls
   - Track stats (innings, defenses, fouls, time-outs)
5. When rack ends:
   - User clicks "Rack Complete"
   - Select winner (Player 1 or Player 2)
   - Increment racksWon
   - Check win condition
6. Game ends when player reaches rack target
```

## Key Implementation Notes

1. **No Ball Tracking**: Unlike 9-ball, we don't track individual balls. We only track rack outcomes.

2. **Rack Completion**: User manually indicates when a rack is complete and who won. This is intentional - the scorekeeper is a passive recorder, not an active ball tracker.

3. **Time-out Timer**: Implement a 2-minute countdown timer. When time expires, automatically end the time-out.

4. **Simplified State**: Much simpler than 9-ball - no ball arrays, no dead balls, no current ball tracking.

5. **Reuse Components**: Leverage existing components where possible:
   - `APA9BallBreakDetermination` → `APA8BallBreakDetermination` (or reuse directly)
   - `APA9BallSkillLevelSelector` → `APA8BallSkillLevelSelector` (or reuse directly)

## Testing Considerations

- Test all SL combinations (2-7 vs 2-7 = 36 combinations)
- Verify rack target matrix is correct
- Test time-out timer functionality
- Test win condition at various rack counts
- Test rack completion flow
- Test undo functionality (if implemented)

## Future Enhancements (Not in Initial Implementation)

- Match points calculation (similar to 9-ball)
- Break and run tracking
- Rack history details
- Statistics tracking across multiple games

