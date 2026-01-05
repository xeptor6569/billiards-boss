// APA 8 ball game type implementation (rack-based scoring with Equalizer system)

import { GameType, BaseGameState, ScoreInput, GameUIComponents } from './types';

// Rack target matrix based on SL combinations
// Format: [yourSL][opponentSL] = { you: racksYouNeed, opponent: racksOpponentNeeds }
const RACK_TARGET_MATRIX: Record<number, Record<number, { you: number; opponent: number }>> = {
  2: {
    2: { you: 2, opponent: 2 },
    3: { you: 2, opponent: 3 },
    4: { you: 2, opponent: 4 },
    5: { you: 2, opponent: 5 },
    6: { you: 2, opponent: 6 },
    7: { you: 2, opponent: 7 },
  },
  3: {
    2: { you: 3, opponent: 2 },
    3: { you: 2, opponent: 2 },
    4: { you: 2, opponent: 3 },
    5: { you: 2, opponent: 4 },
    6: { you: 2, opponent: 5 },
    7: { you: 2, opponent: 6 },
  },
  4: {
    2: { you: 4, opponent: 2 },
    3: { you: 3, opponent: 2 },
    4: { you: 3, opponent: 3 },
    5: { you: 3, opponent: 4 },
    6: { you: 3, opponent: 5 },
    7: { you: 2, opponent: 5 },
  },
  5: {
    2: { you: 5, opponent: 2 },
    3: { you: 4, opponent: 2 },
    4: { you: 4, opponent: 3 },
    5: { you: 4, opponent: 4 },
    6: { you: 4, opponent: 5 },
    7: { you: 3, opponent: 5 },
  },
  6: {
    2: { you: 6, opponent: 2 },
    3: { you: 5, opponent: 2 },
    4: { you: 5, opponent: 3 },
    5: { you: 5, opponent: 4 },
    6: { you: 5, opponent: 5 },
    7: { you: 4, opponent: 5 },
  },
  7: {
    2: { you: 7, opponent: 2 },
    3: { you: 6, opponent: 2 },
    4: { you: 5, opponent: 2 },
    5: { you: 5, opponent: 3 },
    6: { you: 5, opponent: 4 },
    7: { you: 5, opponent: 5 },
  },
};

// Get rack targets based on skill level combination
function getRackTargets(player1SL: number, player2SL: number): { player1: number; player2: number } {
  const targets = RACK_TARGET_MATRIX[player1SL]?.[player2SL];
  if (!targets) {
    // Default fallback (shouldn't happen with valid SLs 2-7)
    return { player1: 2, player2: 2 };
  }
  return {
    player1: targets.you,
    player2: targets.opponent,
  };
}

export interface APA8BallRack {
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

export interface APA8BallGameState extends BaseGameState {
  gameType: 'apa8ball';
  gameData: {
    player1: {
      skillLevel: number; // 2-7
      rackTarget: number; // Racks needed to win (from matrix)
      racksWon: number; // Current racks won
      innings: number;
      defensiveShots: number;
      fouls: number;
      timeoutsUsed: number; // Track time-outs used
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
    // Track stats for current rack (will be saved when rack completes)
    currentRackPlayer1Innings: number;
    currentRackPlayer2Innings: number;
    currentRackPlayer1Fouls: number;
    currentRackPlayer2Fouls: number;
    currentRackPlayer1DefensiveShots: number;
    currentRackPlayer2DefensiveShots: number;
  };
}

function createNewAPA8BallGame(
  player1SkillLevel: number = 3,
  player2SkillLevel: number = 3,
  player1Name: string = 'Player 1',
  player2Name: string = 'Player 2',
  breakPlayer?: 1 | 2
): APA8BallGameState {
  const rackTargets = getRackTargets(player1SkillLevel, player2SkillLevel);
  const initialBreakPlayer = breakPlayer ?? null;
  const initialCurrentPlayer = breakPlayer ?? 1;
  
  return {
    gameType: 'apa8ball',
    totalScore: 0,
    isComplete: false,
    gameData: {
      player1: {
        skillLevel: player1SkillLevel,
        rackTarget: rackTargets.player1,
        racksWon: 0,
        innings: 0,
        defensiveShots: 0,
        fouls: 0,
        timeoutsUsed: 0,
        timeoutsRemaining: 2, // Standard is 2 time-outs per game
      },
      player2: {
        skillLevel: player2SkillLevel,
        rackTarget: rackTargets.player2,
        racksWon: 0,
        innings: 0,
        defensiveShots: 0,
        fouls: 0,
        timeoutsUsed: 0,
        timeoutsRemaining: 2,
      },
      currentPlayer: initialCurrentPlayer,
      gameStatus: 'in-progress',
      breakPlayer: initialBreakPlayer,
      currentRack: 1,
      racks: [],
      player1Name,
      player2Name,
      // Current rack stats (reset each rack)
      currentRackPlayer1Innings: 0,
      currentRackPlayer2Innings: 0,
      currentRackPlayer1Fouls: 0,
      currentRackPlayer2Fouls: 0,
      currentRackPlayer1DefensiveShots: 0,
      currentRackPlayer2DefensiveShots: 0,
    },
  };
}

function checkWinCondition(state: APA8BallGameState, player: 1 | 2): boolean {
  const playerData = state.gameData[player === 1 ? 'player1' : 'player2'];
  return playerData.racksWon >= playerData.rackTarget;
}

export const apa8ballGameType: GameType = {
  metadata: {
    id: 'apa8ball',
    name: 'APA 8 Ball',
    description: 'APA 8 ball scoring with The Equalizer® handicap system',
    requiresPayment: false,
    category: 'standard',
  },
  
  createNewGame(...args: unknown[]): BaseGameState {
    // args[0] = player1SkillLevel, args[1] = player2SkillLevel, args[2] = player1Name, args[3] = player2Name, args[4] = breakPlayer (optional)
    const player1SL = (typeof args[0] === 'number' ? args[0] : 3) || 3;
    const player2SL = (typeof args[1] === 'number' ? args[1] : 3) || 3;
    const player1Name = (typeof args[2] === 'string' ? args[2] : 'Player 1') || 'Player 1';
    const player2Name = (typeof args[3] === 'string' ? args[3] : 'Player 2') || 'Player 2';
    const breakPlayer = (typeof args[4] === 'number' && (args[4] === 1 || args[4] === 2)) ? args[4] as 1 | 2 : undefined;
    return createNewAPA8BallGame(player1SL, player2SL, player1Name, player2Name, breakPlayer);
  },
  
  addScore(gameState: BaseGameState, input: ScoreInput): BaseGameState {
    const state = { ...gameState } as APA8BallGameState;
    const currentPlayerData = state.gameData[state.gameData.currentPlayer === 1 ? 'player1' : 'player2'];
    const otherPlayerData = state.gameData[state.gameData.currentPlayer === 1 ? 'player2' : 'player1'];
    
    if (input.type === 'custom') {
      const action = input.data?.action;
      
      if (action === 'endTurn') {
        // End current player's turn, switch to other player
        state.gameData.currentPlayer = state.gameData.currentPlayer === 1 ? 2 : 1;
        // Increment innings for the player who just ended their turn
        currentPlayerData.innings += 1;
        // Also increment current rack innings
        if (state.gameData.currentPlayer === 1) {
          state.gameData.currentRackPlayer2Innings += 1;
        } else {
          state.gameData.currentRackPlayer1Innings += 1;
        }
      } else if (action === 'defensiveShot') {
        // Mark defensive shot
        currentPlayerData.defensiveShots += 1;
        // Also increment current rack defensive shots
        if (state.gameData.currentPlayer === 1) {
          state.gameData.currentRackPlayer1DefensiveShots += 1;
        } else {
          state.gameData.currentRackPlayer2DefensiveShots += 1;
        }
      } else if (action === 'foul') {
        // Record foul
        currentPlayerData.fouls += 1;
        // Also increment current rack fouls
        if (state.gameData.currentPlayer === 1) {
          state.gameData.currentRackPlayer1Fouls += 1;
        } else {
          state.gameData.currentRackPlayer2Fouls += 1;
        }
        // Note: Foul doesn't automatically switch players - user must end turn
      } else if (action === 'timeout') {
        // Start time-out (decrement remaining)
        if (currentPlayerData.timeoutsRemaining > 0) {
          currentPlayerData.timeoutsRemaining -= 1;
          currentPlayerData.timeoutsUsed += 1;
        }
        // Note: Time-out timer is handled in UI component
      } else if (action === 'rackComplete') {
        // Record rack completion and winner
        const winner = input.data?.winner as 1 | 2 | undefined;
        if (winner === 1 || winner === 2) {
          // Increment racks won for winner
          const winnerData = state.gameData[winner === 1 ? 'player1' : 'player2'];
          winnerData.racksWon += 1;
          
          // Save completed rack to history
          const completedRack: APA8BallRack = {
            rackNumber: state.gameData.currentRack,
            winner,
            breakPlayer: state.gameData.breakPlayer || state.gameData.currentPlayer,
            player1Innings: state.gameData.currentRackPlayer1Innings,
            player2Innings: state.gameData.currentRackPlayer2Innings,
            player1Fouls: state.gameData.currentRackPlayer1Fouls,
            player2Fouls: state.gameData.currentRackPlayer2Fouls,
            player1DefensiveShots: state.gameData.currentRackPlayer1DefensiveShots,
            player2DefensiveShots: state.gameData.currentRackPlayer2DefensiveShots,
            completedAt: new Date(),
          };
          state.gameData.racks.push(completedRack);
          
          // Check win condition
          if (checkWinCondition(state, winner)) {
            state.gameData.gameStatus = winner === 1 ? 'player1-won' : 'player2-won';
            state.isComplete = true;
          } else {
            // Start new rack
            state.gameData.currentRack += 1;
            // Reset current rack stats
            state.gameData.currentRackPlayer1Innings = 0;
            state.gameData.currentRackPlayer2Innings = 0;
            state.gameData.currentRackPlayer1Fouls = 0;
            state.gameData.currentRackPlayer2Fouls = 0;
            state.gameData.currentRackPlayer1DefensiveShots = 0;
            state.gameData.currentRackPlayer2DefensiveShots = 0;
            // Winner of previous rack breaks next rack
            state.gameData.breakPlayer = winner;
            state.gameData.currentPlayer = winner;
          }
        }
      }
    } else if (input.type === 'foul') {
      // Handle foul (backward compatibility)
      currentPlayerData.fouls += 1;
      // Also increment current rack fouls
      if (state.gameData.currentPlayer === 1) {
        state.gameData.currentRackPlayer1Fouls += 1;
      } else {
        state.gameData.currentRackPlayer2Fouls += 1;
      }
      // Note: Foul doesn't automatically switch players - user must end turn
    }
    
    // Update total score (sum of racks won)
    state.totalScore = state.gameData.player1.racksWon + state.gameData.player2.racksWon;
    
    return state;
  },
  
  calculateScore(gameState: BaseGameState): number {
    const state = gameState as APA8BallGameState;
    // Return total racks won
    return state.gameData.player1.racksWon + state.gameData.player2.racksWon;
  },
  
  isComplete(gameState: BaseGameState): boolean {
    const state = gameState as APA8BallGameState;
    return state.gameData.gameStatus !== 'in-progress';
  },
  
  reconstructFromData(data: Record<string, unknown>): BaseGameState {
    const gameData = data.gameData as Record<string, unknown> | undefined;
    const player1SL = (gameData?.player1 as Record<string, unknown>)?.skillLevel as number || 3;
    const player2SL = (gameData?.player2 as Record<string, unknown>)?.skillLevel as number || 3;
    const player1Name = (gameData?.player1Name as string) || 'Player 1';
    const player2Name = (gameData?.player2Name as string) || 'Player 2';
    const state = createNewAPA8BallGame(player1SL, player2SL, player1Name, player2Name);
    if (gameData) {
      // Merge game data
      state.gameData = { ...state.gameData, ...gameData } as typeof state.gameData;
      
      // Ensure racks array exists
      if (!state.gameData.racks) {
        state.gameData.racks = [];
      }
      if (!state.gameData.currentRack) {
        state.gameData.currentRack = state.gameData.racks.length + 1;
      }
    }
    if (typeof data.totalScore === 'number') state.totalScore = data.totalScore;
    if (typeof data.isComplete === 'boolean') state.isComplete = data.isComplete;
    return state;
  },
  
  serialize(gameState: BaseGameState): Record<string, unknown> {
    const state = gameState as APA8BallGameState;
    return {
      gameType: 'apa8ball',
      gameData: state.gameData,
      totalScore: state.totalScore,
      isComplete: state.isComplete,
    };
  },
  
  getUIComponents(): GameUIComponents {
    return {};
  },
};
