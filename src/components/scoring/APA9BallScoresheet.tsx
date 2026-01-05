"use client";

import { BaseGameState } from "@/lib/game-types";
import { APA9BallGameState } from "@/lib/game-types/apa9ball";

interface APA9BallScoresheetProps {
  gameState: BaseGameState;
}

export default function APA9BallScoresheet({ gameState }: APA9BallScoresheetProps) {
  const apa9State = gameState as APA9BallGameState;
  const { player1, player2, racks, player1Name, player2Name, matchPoints, gameStatus, breakAndRun } = apa9State.gameData;
  
  const player1Won = gameStatus === 'player1-won';
  const player2Won = gameStatus === 'player2-won';

  return (
    <div className="space-y-6">
      {/* Player Summary */}
      <div className="grid grid-cols-2 gap-4">
        {/* Player 1 */}
        <div className={`
          rounded-lg border-2 p-4
          ${player1Won
            ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
            : "border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
          }
        `}>
          <div className="text-center mb-3">
            <div className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-1">
              {player1Name}
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400">
              Skill Level {player1.skillLevel}
            </div>
          </div>
          <div className="text-center mb-3">
            <div className="text-3xl font-black text-blue-600 dark:text-blue-400">
              {player1.score}
            </div>
            <div className="text-sm text-slate-500 dark:text-slate-500">
              / {player1.targetScore} target
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 text-xs text-slate-600 dark:text-slate-400">
            <div className="text-center">
              <div className="font-semibold">Innings</div>
              <div>{player1.innings}</div>
            </div>
            <div className="text-center">
              <div className="font-semibold">Defensive</div>
              <div>{player1.defensiveShots}</div>
            </div>
            <div className="text-center">
              <div className="font-semibold">Fouls</div>
              <div>{player1.fouls}</div>
            </div>
          </div>
          {player1Won && (
            <div className="mt-2 text-center text-xs font-bold text-blue-600 dark:text-blue-400">
              WINNER
            </div>
          )}
          {matchPoints && (
            <div className="mt-2 text-center text-xs text-slate-600 dark:text-slate-400">
              {matchPoints.player1} match points
            </div>
          )}
        </div>

        {/* Player 2 */}
        <div className={`
          rounded-lg border-2 p-4
          ${player2Won
            ? "border-red-500 bg-red-50 dark:bg-red-900/20"
            : "border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
          }
        `}>
          <div className="text-center mb-3">
            <div className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-1">
              {player2Name}
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400">
              Skill Level {player2.skillLevel}
            </div>
          </div>
          <div className="text-center mb-3">
            <div className="text-3xl font-black text-red-600 dark:text-red-400">
              {player2.score}
            </div>
            <div className="text-sm text-slate-500 dark:text-slate-500">
              / {player2.targetScore} target
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 text-xs text-slate-600 dark:text-slate-400">
            <div className="text-center">
              <div className="font-semibold">Innings</div>
              <div>{player2.innings}</div>
            </div>
            <div className="text-center">
              <div className="font-semibold">Defensive</div>
              <div>{player2.defensiveShots}</div>
            </div>
            <div className="text-center">
              <div className="font-semibold">Fouls</div>
              <div>{player2.fouls}</div>
            </div>
          </div>
          {player2Won && (
            <div className="mt-2 text-center text-xs font-bold text-red-600 dark:text-red-400">
              WINNER
            </div>
          )}
          {matchPoints && (
            <div className="mt-2 text-center text-xs text-slate-600 dark:text-slate-400">
              {matchPoints.player2} match points
            </div>
          )}
        </div>
      </div>

      {/* Break & Run Indicator */}
      {breakAndRun && (
        <div className="text-center">
          <div className="inline-block px-4 py-2 bg-amber-500 text-white text-sm font-bold rounded-full">
            Break & Run!
          </div>
        </div>
      )}

      {/* Racks History */}
      {racks.length > 0 && (
        <div>
          <h3 className="text-md font-bold text-slate-900 dark:text-slate-100 mb-3">
            Racks ({racks.length})
          </h3>
          <div className="space-y-2">
            {racks.map((rack, index) => (
              <div
                key={index}
                className="bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg p-3"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="font-semibold text-slate-900 dark:text-slate-100">
                    Rack {rack.rackNumber}
                  </div>
                  <div className="text-xs text-slate-600 dark:text-slate-400">
                    Break: {rack.breakPlayer === 1 ? player1Name : player2Name}
                    {rack.nineBallOnBreak && " (9-ball on break)"}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="font-semibold text-blue-600 dark:text-blue-400 mb-1">
                      {player1Name}
                    </div>
                    <div className="text-xs text-slate-600 dark:text-slate-400 space-y-0.5">
                      <div>Balls: {rack.player1Balls.length > 0 ? rack.player1Balls.join(', ') : 'None'}</div>
                      <div>Innings: {rack.player1Innings}</div>
                      <div>Fouls: {rack.player1Fouls}</div>
                      <div>Defensive: {rack.player1DefensiveShots}</div>
                    </div>
                  </div>
                  <div>
                    <div className="font-semibold text-red-600 dark:text-red-400 mb-1">
                      {player2Name}
                    </div>
                    <div className="text-xs text-slate-600 dark:text-slate-400 space-y-0.5">
                      <div>Balls: {rack.player2Balls.length > 0 ? rack.player2Balls.join(', ') : 'None'}</div>
                      <div>Innings: {rack.player2Innings}</div>
                      <div>Fouls: {rack.player2Fouls}</div>
                      <div>Defensive: {rack.player2DefensiveShots}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Match Points Summary */}
      {matchPoints && (
        <div className="bg-slate-100 dark:bg-slate-700/50 rounded-lg p-4">
          <div className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-2">
            Match Points
          </div>
          <div className="flex justify-between text-sm text-slate-600 dark:text-slate-400">
            <span>{player1Name}:</span>
            <span className="font-bold">{matchPoints.player1}</span>
          </div>
          <div className="flex justify-between text-sm text-slate-600 dark:text-slate-400">
            <span>{player2Name}:</span>
            <span className="font-bold">{matchPoints.player2}</span>
          </div>
          <div className="flex justify-between text-sm text-slate-600 dark:text-slate-400 pt-2 mt-2 border-t border-slate-300 dark:border-slate-600">
            <span className="font-semibold">Total:</span>
            <span className="font-bold">{matchPoints.player1 + matchPoints.player2} / 20</span>
          </div>
        </div>
      )}
    </div>
  );
}

