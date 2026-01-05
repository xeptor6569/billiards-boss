"use client";

import { useState } from "react";
import { GameState, createNewGame, addBallToFrame, getRemainingBalls } from "@/lib/game-logic";
import GameLayout from "@/components/scoring/GameLayout";
import FrameRibbon from "@/components/scoring/FrameRibbon";
import RackVisualizer from "@/components/scoring/RackVisualizer";
import InputKeypad from "@/components/scoring/InputKeypad";
import FrameEditModal from "@/components/scoring/FrameEditModal";
import ThemeSwitcherCompact from "@/components/ThemeSwitcherCompact";
import FirstTimeGuide, { type GuideStep } from "@/components/scoring/FirstTimeGuide";
import Link from "next/link";
import { trackGameStarted, trackGameCompleted, trackFirstGameGuideDismissed, trackSignupPromptDismissed, trackCTAClick, trackFirstGameGuideStep } from "@/lib/analytics";

// Lazy initialization for first-time guide
function getInitialShowGuide(): boolean {
  if (typeof window === "undefined") return false;
  const hasPlayedBefore = localStorage.getItem("billiards-boss-has-played");
  if (!hasPlayedBefore) {
    localStorage.setItem("billiards-boss-has-played", "true");
    trackGameStarted("anonymous");
    return true;
  }
  return false;
}

export default function PlayPage() {
  const [gameState, setGameState] = useState<GameState>(createNewGame());
  const [editingFrameIndex, setEditingFrameIndex] = useState<number | null>(null);
  const [showFirstTimeGuide, setShowFirstTimeGuide] = useState(getInitialShowGuide);
  const [guideStep, setGuideStep] = useState<GuideStep>("welcome");
  const [showSignupPrompt, setShowSignupPrompt] = useState(false);
  const [hasTrackedCompletion, setHasTrackedCompletion] = useState(false);


  // Derived state
  const currentFrame = gameState.frames[gameState.currentFrame - 1];
  const remainingBalls = currentFrame ? getRemainingBalls(currentFrame) : 0;
  const totalPocketed = currentFrame
    ? currentFrame.ballsPocketed.reduce((sum, count) => sum + count, 0)
    : 0;

  const isTenthFrame = currentFrame?.frameNumber === 10;
  const shotCount = currentFrame?.ballsPocketed.length || 0;

  // Logic to determine keypad mode
  let keypadMode: "shot1" | "shot2" | "break" = "shot1";
  if (shotCount === 0) {
    keypadMode = "break"; // or shot1
  } else if (!isTenthFrame) {
    keypadMode = "shot2";
  } else {
    // 10th frame logic
    if (currentFrame.isStrike) {
      // if strike, next shots are like new breaks/shot1s unless we want spair logic?
      // bowling: X X X.
      keypadMode = "shot1";
    } else if (currentFrame.isSpare) {
      keypadMode = "shot1"; // Bonus shot
    } else {
      keypadMode = "shot2";
    }
  }

  const handleScoreInput = (balls: number) => {
    if (gameState.isComplete) return;

    const currentFrameIndex = gameState.currentFrame - 1;
    const ballsToAdd = Math.min(balls, remainingBalls); // Safety check

    const newGameState = addBallToFrame(gameState, currentFrameIndex, ballsToAdd);
    setGameState(newGameState);
    
    // Advance guide if on first-shot step
    if (showFirstTimeGuide && guideStep === "first-shot") {
      setGuideStep("complete");
    }
    
    // Track completion and show signup prompt
    if (newGameState.isComplete && !hasTrackedCompletion) {
      setHasTrackedCompletion(true);
      setShowSignupPrompt(true);
      trackGameCompleted(newGameState.totalScore, "anonymous");
    } else if (!newGameState.isComplete) {
      setHasTrackedCompletion(false);
      setShowSignupPrompt(false);
    }
  };

  const handleGuideNext = () => {
    const steps: GuideStep[] = ["welcome", "frame-ribbon", "rack-visualizer", "input-keypad", "first-shot", "complete"];
    const currentIndex = steps.indexOf(guideStep);
    if (currentIndex < steps.length - 1) {
      trackFirstGameGuideStep(guideStep, "next");
      setGuideStep(steps[currentIndex + 1]);
    }
  };

  const handleGuideSkip = () => {
    trackFirstGameGuideStep(guideStep, "skip");
    setShowFirstTimeGuide(false);
    trackFirstGameGuideDismissed();
  };

  const handleGuideComplete = () => {
    trackFirstGameGuideStep(guideStep, "complete");
    setShowFirstTimeGuide(false);
    trackFirstGameGuideDismissed();
  };

  const getGuideTarget = (): string | undefined => {
    switch (guideStep) {
      case "frame-ribbon":
        return "[data-guide='frame-ribbon']";
      case "rack-visualizer":
        return "[data-guide='rack-visualizer']";
      case "input-keypad":
        return "[data-guide='input-keypad']";
      default:
        return undefined;
    }
  };

  const handleFrameClick = (frameIndex: number) => {
    if (gameState.isComplete) return;
    setEditingFrameIndex(frameIndex);
  };

  const handleModalClose = () => {
    setEditingFrameIndex(null);
  };

  const handleModalSave = (updatedGameState: GameState) => {
    setGameState(updatedGameState);
  };


  // Custom Header
  const HeaderCmp = (
    <div className="flex justify-between items-center w-full">
      <div className="flex items-center gap-4">
        <div>
          <div className="text-slate-600 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">Total Score</div>
          <div className="text-3xl font-black text-[var(--accent)]">{gameState.totalScore}</div>
        </div>
        {currentFrame && (
          <div className="hidden sm:block border-l border-slate-200 dark:border-slate-700 pl-4">
            <div className="text-slate-600 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">Frame {currentFrame.frameNumber}</div>
            <div className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              Shot {shotCount + 1} / {isTenthFrame ? "3" : "2"}
            </div>
          </div>
        )}
      </div>
      <div className="flex items-center gap-3">
        <ThemeSwitcherCompact />
        <Link href="/" className="text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100">
          EXIT
        </Link>
      </div>
    </div>
  );

  const editingFrame =
    editingFrameIndex !== null ? gameState.frames[editingFrameIndex] : null;

  return (
    <>
      <GameLayout
        header={HeaderCmp}
        frameStrip={
          <div data-guide="frame-ribbon">
            <FrameRibbon
              frames={gameState.frames}
              currentFrameIndex={gameState.currentFrame - 1}
              calculateCumulativeScore={() => 0}
              onFrameClick={handleFrameClick}
              isEditable={!gameState.isComplete}
            />
          </div>
        }
        visualizer={
          <div className="w-full h-full flex flex-col justify-center">
            <div data-guide="rack-visualizer">
              <RackVisualizer totalPocketed={totalPocketed} remainingBalls={remainingBalls} />
            </div>
            {gameState.isComplete && showSignupPrompt && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm z-50">
                <div className="text-center p-6 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-2xl max-w-md mx-4">
                  <h2 className="text-2xl font-bold mb-2 text-slate-900 dark:text-slate-100">Game Complete!</h2>
                  <div className="text-4xl font-black text-[var(--accent)] mb-4">{gameState.totalScore}</div>
                  <p className="text-slate-600 dark:text-slate-400 mb-6 text-sm">
                    Don&apos;t lose this game! Create a free account to save your history and unlock detailed statistics.
                  </p>
                  <div className="flex flex-col gap-3">
                    <Link 
                      href="/auth/signup" 
                      className="w-full py-3 bg-[var(--accent)] text-white font-bold rounded-lg hover:opacity-90 transition-opacity"
                      onClick={() => {
                        setShowSignupPrompt(false);
                        trackSignupPromptDismissed("signed_up");
                        trackCTAClick("signup", "game_complete_modal");
                      }}
                    >
                      Sign up free to save
                    </Link>
                    <button
                      onClick={() => {
                        setShowSignupPrompt(false);
                        setGameState(createNewGame());
                        trackSignupPromptDismissed("play_again");
                        trackCTAClick("play_again", "game_complete_modal");
                      }}
                      className="w-full py-3 bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-slate-100 font-semibold rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
                    >
                      Play Again
                    </button>
                    <button
                      onClick={() => {
                        setShowSignupPrompt(false);
                        trackSignupPromptDismissed("maybe_later");
                      }}
                      className="text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                    >
                      Maybe later
                    </button>
                  </div>
                </div>
              </div>
            )}
            {showFirstTimeGuide && !gameState.isComplete && (
              <FirstTimeGuide
                currentStep={guideStep}
                onNext={handleGuideNext}
                onSkip={handleGuideSkip}
                onComplete={handleGuideComplete}
                targetElement={getGuideTarget()}
              />
            )}
          </div>
        }
        controls={
          <div data-guide="input-keypad">
            <InputKeypad
              mode={keypadMode}
              remainingBalls={remainingBalls}
              onInput={handleScoreInput}
              disabled={gameState.isComplete}
            />
          </div>
        }
      />
      {editingFrameIndex !== null && editingFrame && (
        <FrameEditModal
          isOpen={editingFrameIndex !== null}
          frame={editingFrame}
          frameIndex={editingFrameIndex}
          gameState={gameState}
          onClose={handleModalClose}
          onSave={handleModalSave}
        />
      )}
    </>
  );
}

