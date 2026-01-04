"use client";

import { useState } from "react";
import { GameState, Frame } from "@/lib/game-logic";
import { BaseGameState } from "@/lib/game-types";
import { APA9BallGameState } from "@/lib/game-types/apa9ball";

interface ShareGameProps {
  gameState?: GameState;
  baseGameState?: BaseGameState;
  gameId: number;
  createdAt: string;
  gameMode?: string;
  compact?: boolean;
}

// Generate a text representation of frames for sharing
function generateFrameText(frames: Frame[]): string {
  const frameLines: string[] = [];
  
  // Header
  frameLines.push("Frames:");
  
  frames.forEach((frame) => {
    const shots = frame.ballsPocketed.map((balls, idx) => {
      if (frame.isStrike && idx === 0) return "X";
      if (frame.isSpare && idx === 1) return "/";
      if (balls === 0) return "—";
      return balls.toString();
    });
    
    // For 10th frame, ensure we show all 3 slots
    if (frame.frameNumber === 10) {
      while (shots.length < 3) {
        shots.push("—");
      }
    } else {
      while (shots.length < 2) {
        shots.push("—");
      }
    }
    
    const frameStr = `Frame ${frame.frameNumber}: [${shots.join(", ")}] - Score: ${frame.score}${frame.isStrike ? " (Strike)" : frame.isSpare ? " (Spare)" : ""}`;
    frameLines.push(frameStr);
  });
  
  return frameLines.join("\n");
}

// Generate share text for APA 9-ball
function generateAPA9BallShareText(gameState: APA9BallGameState, gameId: number, createdAt: string, gameMode?: string): string {
  const { player1, player2, racks, player1Name, player2Name, matchPoints, gameStatus, breakAndRun } = gameState.gameData;
  const date = new Date(createdAt);
  const formattedDate = date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric'
  });
  
  const player1Won = gameStatus === 'player1-won';
  const player2Won = gameStatus === 'player2-won';
  const winner = player1Won ? player1Name : player2Won ? player2Name : 'Tie';
  
  let text = `🎱 APA 9-Ball Game Results

${gameId > 0 ? `Game #${gameId}\n` : ""}Date: ${formattedDate}
${gameMode ? `Mode: ${gameMode}\n` : ""}
Winner: ${winner}${breakAndRun ? " (Break & Run!)" : ""}

${player1Name} (SL-${player1.skillLevel}): ${player1.score} / ${player1.targetScore}
${player2Name} (SL-${player2.skillLevel}): ${player2.score} / ${player2.targetScore}

Stats:
${player1Name}: ${player1.innings} innings, ${player1.defensiveShots} defensive, ${player1.fouls} fouls
${player2Name}: ${player2.innings} innings, ${player2.defensiveShots} defensive, ${player2.fouls} fouls`;

  if (matchPoints) {
    text += `\n\nMatch Points: ${player1Name} ${matchPoints.player1} - ${player2Name} ${matchPoints.player2}`;
  }
  
  if (racks.length > 0) {
    text += `\n\nRacks Played: ${racks.length}`;
    racks.forEach((rack) => {
      text += `\n\nRack ${rack.rackNumber}:`;
      text += `\n  Break: ${rack.breakPlayer === 1 ? player1Name : player2Name}${rack.nineBallOnBreak ? " (9-ball on break)" : ""}`;
      text += `\n  ${player1Name}: Balls [${rack.player1Balls.length > 0 ? rack.player1Balls.join(', ') : 'None'}], ${rack.player1Innings} innings, ${rack.player1Fouls} fouls`;
      text += `\n  ${player2Name}: Balls [${rack.player2Balls.length > 0 ? rack.player2Balls.join(', ') : 'None'}], ${rack.player2Innings} innings, ${rack.player2Fouls} fouls`;
    });
  }
  
  text += `\n\nPlayed on Billiards Boss 🎯`;
  return text;
}

// Generate share text
function generateShareText(
  gameState: GameState | undefined, 
  baseGameState: BaseGameState | undefined,
  gameId: number, 
  createdAt: string, 
  gameMode?: string
): string {
  // Handle APA 9-ball
  if (baseGameState && baseGameState.gameType === 'apa9ball') {
    return generateAPA9BallShareText(baseGameState as APA9BallGameState, gameId, createdAt, gameMode);
  }
  
  // Handle Bowlliards (legacy)
  if (gameState) {
    const strikes = gameState.frames.filter(f => f.isStrike).length;
    const spares = gameState.frames.filter(f => f.isSpare && !f.isStrike).length;
    const date = new Date(createdAt);
    const formattedDate = date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric'
    });
    
    const frameText = generateFrameText(gameState.frames);
    
    return `🎱 Billiards Bowling Game Results

${gameId > 0 ? `Game #${gameId}\n` : ""}Date: ${formattedDate}
${gameMode ? `Mode: ${gameMode}\n` : ""}
Total Score: ${gameState.totalScore}
Strikes: ${strikes}
Spares: ${spares}

${frameText}

Played on Billiards Boss 🎯`;
  }
  
  return `🎱 Billiards Game Results\n\nGame #${gameId}\nPlayed on Billiards Boss 🎯`;
}

export default function ShareGame({ gameState, baseGameState, gameId, createdAt, gameMode, compact = false }: ShareGameProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [shareError, setShareError] = useState<string | null>(null);

  const shareText = generateShareText(gameState, baseGameState, gameId, createdAt, gameMode);
  const shareUrl = typeof window !== 'undefined' && gameId && gameId > 0 ? `${window.location.origin}/dashboard/games/${gameId}` : '';
  
  // Get total score for social media sharing
  const totalScore = gameState?.totalScore || baseGameState?.totalScore || 0;
  const gameTypeName = baseGameState?.gameType === 'apa9ball' ? 'APA 9-Ball' : 'Billiards Bowling';

  const handleShare = async () => {
    setShareError(null);
    
    // Try Web Share API first (mobile-friendly)
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${gameTypeName} Game #${gameId}`,
          text: shareText,
          url: shareUrl,
        });
        setIsOpen(false);
        return;
      } catch (error: unknown) {
        // User cancelled or error occurred
        if (error instanceof Error && error.name !== 'AbortError') {
          console.error('Error sharing:', error);
        }
        // Fall through to show manual share options
      }
    }
    
    // Fallback: show share modal
    setIsOpen(true);
  };

  const handleCopy = async () => {
    try {
      const textToCopy = shareUrl ? `${shareText}\n\nView game: ${shareUrl}` : shareText;
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Error copying:', error);
      setShareError('Failed to copy to clipboard');
    }
  };

  const handleEmail = () => {
    const subject = encodeURIComponent(`${gameTypeName} Game ${gameId ? `#${gameId} ` : ''}Results`);
    const body = encodeURIComponent(shareUrl ? `${shareText}\n\nView game: ${shareUrl}` : shareText);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
    setIsOpen(false);
  };

  const handleSMS = () => {
    const text = encodeURIComponent(shareUrl ? `${shareText}\n\nView game: ${shareUrl}` : shareText);
    window.location.href = `sms:?body=${text}`;
    setIsOpen(false);
  };

  const handleTwitter = () => {
    let tweetText: string;
    if (baseGameState?.gameType === 'apa9ball') {
      const apa9State = baseGameState as APA9BallGameState;
      const { player1, player2, player1Name, player2Name, gameStatus } = apa9State.gameData;
      const player1Won = gameStatus === 'player1-won';
      const player2Won = gameStatus === 'player2-won';
      const winner = player1Won ? player1Name : player2Won ? player2Name : 'Tie';
      tweetText = shareUrl 
        ? `🎱 Just won APA 9-Ball! ${winner} won ${player1.score}-${player2.score}${gameId ? ` Game #${gameId}` : ''}\n\n${shareUrl}`
        : `🎱 Just won APA 9-Ball! ${winner} won ${player1.score}-${player2.score}`;
    } else {
      tweetText = shareUrl 
        ? `🎱 Just scored ${totalScore} in Billiards Bowling!${gameId ? ` Game #${gameId}` : ''}\n\n${shareUrl}`
        : `🎱 Just scored ${totalScore} in Billiards Bowling!`;
    }
    const text = encodeURIComponent(tweetText);
    window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank');
    setIsOpen(false);
  };

  const handleFacebook = () => {
    if (shareUrl) {
      const url = encodeURIComponent(shareUrl);
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
    } else {
      // Fallback: share text only
      const text = encodeURIComponent(shareText);
      window.open(`https://www.facebook.com/sharer/sharer.php?quote=${text}`, '_blank');
    }
    setIsOpen(false);
  };

  return (
    <>
      <button
        onClick={handleShare}
        className={`flex items-center gap-2 ${compact ? 'px-2 py-1 text-xs' : 'px-4 py-2'} bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-slate-100 font-semibold rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors`}
        title="Share Game"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          className={compact ? "w-4 h-4" : "w-5 h-5"}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l6.498 10.25m3.671-5.852a2.25 2.25 0 100-2.186 2.25 2.25 0 000 2.186zm0 0l-3.495 5.509a2.25 2.25 0 00-.383 1.25 2.25 2.25 0 002.25 2.25h6.75a2.25 2.25 0 002.25-2.25 2.25 2.25 0 00-.383-1.25l-3.495-5.509z"
          />
        </svg>
        {!compact && "Share Game"}
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm z-50">
          <div className="bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-2xl max-w-md w-full mx-4 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                Share Game
              </h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="w-6 h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {shareError && (
              <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg text-sm">
                {shareError}
              </div>
            )}

            <div className="space-y-3">
              <button
                onClick={handleCopy}
                className="w-full flex items-center justify-center gap-3 py-3 bg-[var(--accent)] text-white font-bold rounded-lg hover:opacity-90 transition-opacity"
              >
                {copied ? (
                  <>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="currentColor"
                      className="w-5 h-5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M4.5 12.75l6 6 9-13.5"
                      />
                    </svg>
                    Copied!
                  </>
                ) : (
                  <>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="currentColor"
                      className="w-5 h-5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184"
                      />
                    </svg>
                    Copy Link
                  </>
                )}
              </button>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleEmail}
                  className="flex items-center justify-center gap-2 py-3 bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-slate-100 font-semibold rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="w-5 h-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
                    />
                  </svg>
                  Email
                </button>

                <button
                  onClick={handleSMS}
                  className="flex items-center justify-center gap-2 py-3 bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-slate-100 font-semibold rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="w-5 h-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z"
                    />
                  </svg>
                  Text
                </button>

                <button
                  onClick={handleTwitter}
                  className="flex items-center justify-center gap-2 py-3 bg-sky-500 text-white font-semibold rounded-lg hover:bg-sky-600 transition-colors"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    className="w-5 h-5"
                  >
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                  Twitter
                </button>

                <button
                  onClick={handleFacebook}
                  className="flex items-center justify-center gap-2 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    className="w-5 h-5"
                  >
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                  Facebook
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}






