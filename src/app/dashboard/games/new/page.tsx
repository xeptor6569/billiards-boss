"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { GameState, createNewGame, addBallToFrame, getRemainingBalls, reconstructGameStateFromFrames } from "@/lib/game-logic";
import GameLayout from "@/components/scoring/GameLayout";
import FrameRibbon from "@/components/scoring/FrameRibbon";
import RackVisualizer from "@/components/scoring/RackVisualizer";
import InputKeypad from "@/components/scoring/InputKeypad";
import FrameEditModal from "@/components/scoring/FrameEditModal";
import GameSaveSuccessModal from "@/components/scoring/GameSaveSuccessModal";
import ThemeSwitcherCompact from "@/components/ThemeSwitcherCompact";
import ShareGame from "@/components/sharing/ShareGame";
import GameTypeSelector from "@/components/scoring/GameTypeSelector";
import { createGame } from "@/lib/game-types/factory";
import { getGameType, BaseGameState } from "@/lib/game-types";
import { createCustomGame } from "@/lib/game-types/custom";
import APA9BallSelector from "@/components/scoring/APA9BallSelector";
import APA9BallScoreDisplay from "@/components/scoring/APA9BallScoreDisplay";
import APA9BallSkillLevelSelector from "@/components/scoring/APA9BallSkillLevelSelector";
import APA9BallMatchPoints from "@/components/scoring/APA9BallMatchPoints";
import APA9BallTurnControls from "@/components/scoring/APA9BallTurnControls";
import { APA9BallGameState } from "@/lib/game-types/apa9ball";

export default function NewGamePage() {
  const router = useRouter();
  const [gameMode] = useState<"single" | "multiplayer" | "tournament">("single");
  const [saving, setSaving] = useState(false);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [baseGameState, setBaseGameState] = useState<BaseGameState | null>(null);
  const [gameType, setGameType] = useState<string | null>(null);
  const [customGameId, setCustomGameId] = useState<number | null>(null);
  const [showGameTypeSelector, setShowGameTypeSelector] = useState(false);
  const [hasPremiumAccess, setHasPremiumAccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editingFrameIndex, setEditingFrameIndex] = useState<number | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [savedGameId, setSavedGameId] = useState<number | null>(null);
  const [savedGameCreatedAt, setSavedGameCreatedAt] = useState<string | null>(null);
  const [showSkillLevelSelector, setShowSkillLevelSelector] = useState(false);
  const [gameHistory, setGameHistory] = useState<BaseGameState[]>([]); // History stack for undo
  const hasShotsRef = useRef(false);
  const autoSaveInProgressRef = useRef(false);
  const gameStateRef = useRef<GameState | null>(null);
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const savedGameIdRef = useRef<number | null>(null);
  const gameModeRef = useRef<"single" | "multiplayer" | "tournament">("single");

  // Check for active game on mount
  useEffect(() => {
    const checkActiveGame = async () => {
      try {
        const response = await fetch("/api/games?status=active&limit=1");
        if (response.ok) {
          const activeGames = await response.json();
          if (activeGames.length > 0) {
            const activeGame = activeGames[0];
            // Fetch full game data with frames
            const gameResponse = await fetch(`/api/games/${activeGame.id}`);
            if (gameResponse.ok) {
              const gameData = await gameResponse.json();
              
              // Set game type from saved game (default to bowlliards for backward compatibility)
              const savedGameType = gameData.gameType || 'bowlliards';
              setGameType(savedGameType);
              setCustomGameId(gameData.customGameId || null);
              
              // For Bowlliards, use existing logic
              if (savedGameType === 'bowlliards' && gameData.frames && gameData.frames.length > 0) {
                const restoredState = reconstructGameStateFromFrames(gameData.frames);
                setGameState(restoredState);
                setSavedGameId(activeGame.id);
                hasShotsRef.current = true;
                setLoading(false);
                return;
              } else if (gameData.gameState) {
                // For other game types (including APA 9-ball), use the reconstructed state
                setBaseGameState(gameData.gameState);
                setSavedGameId(activeGame.id);
                hasShotsRef.current = true;
                // Clear history when loading a saved game (can't undo past loads)
                setGameHistory([]);
                setLoading(false);
                return;
              }
            }
          }
        }
      } catch (error) {
        console.error("Error checking for active game:", error);
      }
      // No active game found, show game type selector
      setGameType(null);
      setShowGameTypeSelector(true);
      setSavedGameId(null);
      savedGameIdRef.current = null;
      hasShotsRef.current = false;
      // Reset auto-save state
      autoSaveInProgressRef.current = false;
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
        autoSaveTimeoutRef.current = null;
      }
      setLoading(false);
    };

    checkActiveGame();
  }, []);

  const handleGameCompletion = async () => {
    if (!gameState || !gameState.isComplete) return;
    
    console.log("Game completed! Auto-saving as completed...", {
      savedGameId,
      totalScore: gameState.totalScore
    });
    
    try {
      if (savedGameId) {
        // Update existing game to completed
        const response = await fetch(`/api/games/${savedGameId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            gameState,
            status: "completed",
            completedAt: new Date().toISOString(),
          }),
        });
        if (response.ok) {
          console.log("Game saved as completed (updated existing)");
          // Clear savedGameId since this game is now completed
          setSavedGameId(null);
          savedGameIdRef.current = null;
        } else {
          const errorText = await response.text();
          console.error("Failed to save completed game:", errorText);
        }
      } else {
        // Create new completed game
        const response = await fetch("/api/games", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            gameMode,
            gameState,
          }),
        });
        if (response.ok) {
          const game = await response.json();
          // Don't set savedGameId for completed games - it should be null for new games
          console.log("Game saved as completed, created new game:", game.id);
          // Clear savedGameId to ensure next game creates a new one
          setSavedGameId(null);
          savedGameIdRef.current = null;
        } else {
          const errorText = await response.text();
          console.error("Failed to create completed game:", errorText);
        }
      }
    } catch (error) {
      console.error("Error saving completed game:", error);
    }
  };

  // Keep refs updated
  useEffect(() => {
    gameStateRef.current = gameState;
    savedGameIdRef.current = savedGameId;
    gameModeRef.current = gameMode;
    
    // If gameState is a fresh new game (no shots), clear savedGameId and reset auto-save state
    if (gameState && gameState.frames.every(f => f.ballsPocketed.length === 0)) {
      if (savedGameId) {
        console.log("Clearing savedGameId - fresh game detected (no shots)");
        setSavedGameId(null);
        savedGameIdRef.current = null;
      }
      // Reset auto-save state for fresh games
      if (autoSaveInProgressRef.current) {
        console.log("Resetting autoSaveInProgress - fresh game detected");
        autoSaveInProgressRef.current = false;
      }
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
        autoSaveTimeoutRef.current = null;
      }
      hasShotsRef.current = false;
    }
  }, [gameState, savedGameId, gameMode]);

  // Keep gameState ref updated and handle completion
  useEffect(() => {
    if (gameState) {
      console.log("GameState updated:", {
        currentFrame: gameState.currentFrame,
        totalScore: gameState.totalScore,
        isComplete: gameState.isComplete,
        framesWithShots: gameState.frames.filter(f => f.ballsPocketed.length > 0).map(f => ({
          frame: f.frameNumber,
          shots: f.ballsPocketed
        }))
      });
      
      // Auto-save when game completes
      if (gameState.isComplete && !showSuccessModal) {
        handleGameCompletion();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameState, showSuccessModal]);

  // Save on component unmount (backup for navigation)
  useEffect(() => {
    return () => {
      // Also save on component unmount if navigating away
      const currentState = gameStateRef.current;
      if (hasShotsRef.current && currentState && !currentState.isComplete && !autoSaveInProgressRef.current) {
        autoSaveInProgressRef.current = true;
        autoSaveGame(currentState);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-save on exit
  useEffect(() => {
    const handleBeforeUnload = async () => {
      const currentState = gameStateRef.current;
      if (hasShotsRef.current && currentState && !currentState.isComplete && !autoSaveInProgressRef.current) {
        autoSaveInProgressRef.current = true;
        await autoSaveGame(currentState);
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const autoSaveGame = async (stateToSave?: GameState | BaseGameState) => {
    // Determine which state to use based on game type
    const currentGameType = gameType || 'bowlliards';
    let state: GameState | BaseGameState | null = null;
    
    if (currentGameType === 'bowlliards') {
      state = stateToSave || gameStateRef.current || gameState;
    } else {
      state = stateToSave || baseGameState;
    }
    
    if (!state || state.isComplete || autoSaveInProgressRef.current) {
      console.log("Auto-save skipped: state check failed", {
        hasState: !!state,
        isComplete: state?.isComplete,
        inProgress: autoSaveInProgressRef.current
      });
      return;
    }
    
    // Check for progress - different for different game types
    let hasProgress = false;
    if (currentGameType === 'bowlliards' && 'frames' in state) {
      hasProgress = state.frames.some((f: any) => f.ballsPocketed.length > 0);
    } else if ('gameData' in state) {
      // For other game types, check if there's any game data
      hasProgress = Object.keys(state.gameData).length > 0;
    }
    
    if (!hasProgress) {
      console.log("Auto-save skipped: no progress");
      return;
    }

    autoSaveInProgressRef.current = true;
    try {
      const currentSavedId = savedGameIdRef.current || savedGameId;
      if (currentSavedId) {
        // Check if the saved game is still active (not completed/abandoned)
        // If it's completed, we should create a new game instead
        try {
          const checkResponse = await fetch(`/api/games/${currentSavedId}`);
          if (checkResponse.ok) {
            const existingGame = await checkResponse.json();
            if (existingGame.status === 'completed' || existingGame.status === 'abandoned') {
              console.log("Auto-saving: Saved game is completed/abandoned, creating new game instead", { 
                gameId: currentSavedId, 
                status: existingGame.status 
              });
              // Clear the savedGameId and create a new game
              setSavedGameId(null);
              savedGameIdRef.current = null;
              // Fall through to create new game
            } else {
              // Update existing active game
              console.log("Auto-saving: Updating existing game", { gameId: currentSavedId });
              const stateToSave = currentGameType === 'bowlliards' ? state : baseGameState;
              const response = await fetch(`/api/games/${currentSavedId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  gameState: stateToSave,
                  status: "active",
                }),
              });
              if (response.ok) {
                console.log("Auto-save successful: Updated game", { gameId: currentSavedId });
                autoSaveInProgressRef.current = false;
                return;
              } else {
                const errorText = await response.text();
                console.error("Auto-save failed: Update error", { gameId: currentSavedId, status: response.status, error: errorText });
                // Fall through to create new game if update failed
              }
            }
          }
        } catch (checkError) {
          console.error("Error checking existing game:", checkError);
          // Fall through to create new game if check failed
        }
      }
      
      // Create new active game (either no savedGameId or saved game is completed)
      console.log("Auto-saving: Creating new game");
      const response = await fetch("/api/games", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gameMode: gameModeRef.current,
          gameState: state,
        }),
      });
      if (response.ok) {
        const game = await response.json();
        console.log("Auto-save successful: Created new game", { gameId: game.id });
        setSavedGameId(game.id);
        savedGameIdRef.current = game.id;
      } else {
        const errorText = await response.text();
        console.error("Auto-save failed: Create error", { status: response.status, error: errorText });
      }
    } catch (error) {
      console.error("Error auto-saving game:", error);
    } finally {
      autoSaveInProgressRef.current = false;
    }
  };

  const handleGameTypeSelect = async (selectedGameType: string, selectedCustomGameId?: number) => {
    setGameType(selectedGameType);
    setCustomGameId(selectedCustomGameId || null);
    setShowGameTypeSelector(false);
    
    // Create new game based on type
    if (selectedGameType === 'bowlliards') {
      // Use existing Bowlliards logic for backward compatibility
      const newState = createNewGame();
      setGameState(newState);
    } else if (selectedGameType === 'apa9ball') {
      // Show skill level selector for APA 9-ball
      setShowSkillLevelSelector(true);
    } else if (selectedGameType === 'custom' && selectedCustomGameId) {
      // Load custom game config and create game
      try {
        const response = await fetch(`/api/custom-games/${selectedCustomGameId}`);
        if (response.ok) {
          const customGame = await response.json();
          const customState = createCustomGame(selectedCustomGameId, customGame.yamlConfig);
          setBaseGameState(customState);
        }
      } catch (error) {
        console.error("Error loading custom game:", error);
        alert("Failed to load custom game");
        setShowGameTypeSelector(true);
      }
    } else {
      // Use game type factory for other game types
      const newState = createGame(selectedGameType);
      setBaseGameState(newState);
    }
  };

  const handleSkillLevelConfirm = (player1SL: number, player2SL: number) => {
    setShowSkillLevelSelector(false);
    const gameTypeHandler = getGameType('apa9ball');
    if (gameTypeHandler) {
      const newState = gameTypeHandler.createNewGame(player1SL, player2SL);
      setBaseGameState(newState);
      // Clear history when starting a new game
      setGameHistory([]);
    }
  };

  const handleScoreInput = (balls: number) => {
    // For Bowlliards, use existing logic
    if (gameType === 'bowlliards' && gameState) {
      if (gameState.isComplete) return;
      const currentFrameIndex = gameState.currentFrame - 1;
      const currentFrame = gameState.frames[currentFrameIndex];
      const remainingBalls = currentFrame ? getRemainingBalls(currentFrame) : 0;

      const ballsToAdd = Math.min(balls, remainingBalls);
      const newGameState = addBallToFrame(gameState, currentFrameIndex, ballsToAdd);
      setGameState(newGameState);
      hasShotsRef.current = true;
      
      // Auto-save after each shot (debounced to avoid too many saves)
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
      autoSaveTimeoutRef.current = setTimeout(() => {
        autoSaveGame(newGameState);
      }, 1000);
    } else if (baseGameState && gameType) {
      // For other game types, use game type system
      const gameTypeHandler = getGameType(gameType);
      if (gameTypeHandler) {
        const newState = gameTypeHandler.addScore(baseGameState, { type: 'balls', count: balls });
        setBaseGameState(newState);
        hasShotsRef.current = true;
        
        // Auto-save
        if (autoSaveTimeoutRef.current) {
          clearTimeout(autoSaveTimeoutRef.current);
        }
        autoSaveTimeoutRef.current = setTimeout(() => {
          autoSaveGame(newState);
        }, 1000);
      }
    }
  };

  // Helper to save state to history before making changes
  const saveToHistory = (state: BaseGameState) => {
    if (gameType === 'apa9ball' && state) {
      // Deep clone the state for history
      const historyEntry = JSON.parse(JSON.stringify(state));
      setGameHistory(prev => [...prev, historyEntry]);
    }
  };

  // Undo last action
  const handleUndo = () => {
    if (gameType !== 'apa9ball' || gameHistory.length === 0 || !baseGameState) return;
    
    // Get the last state from history
    const previousState = gameHistory[gameHistory.length - 1];
    
    // Restore the previous state
    setBaseGameState(previousState);
    
    // Remove from history
    setGameHistory(prev => prev.slice(0, -1));
    
    // Auto-save the restored state
    autoSaveGame(previousState);
  };

  const handleAPA9BallInput = (ballNumber: number) => {
    if (!baseGameState || gameType !== 'apa9ball') return;
    const gameTypeHandler = getGameType('apa9ball');
    if (gameTypeHandler) {
      // Save current state to history before making changes
      saveToHistory(baseGameState);
      
      const newState = gameTypeHandler.addScore(baseGameState, { type: 'ball', ballNumber });
      setBaseGameState(newState);
      hasShotsRef.current = true;
      
      // Auto-save
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
      autoSaveTimeoutRef.current = setTimeout(() => {
        autoSaveGame(newState);
      }, 1000);
    }
  };

  const handleEndTurn = () => {
    if (!baseGameState || gameType !== 'apa9ball') return;
    const gameTypeHandler = getGameType('apa9ball');
    if (gameTypeHandler) {
      // Save current state to history before making changes
      saveToHistory(baseGameState);
      
      const newState = gameTypeHandler.addScore(baseGameState, { type: 'custom', data: { action: 'endTurn' } });
      setBaseGameState(newState);
      hasShotsRef.current = true;
      autoSaveGame(newState);
    }
  };

  const handleFoul = () => {
    if (!baseGameState || gameType !== 'apa9ball') return;
    const gameTypeHandler = getGameType('apa9ball');
    if (gameTypeHandler) {
      // Save current state to history before making changes
      saveToHistory(baseGameState);
      
      const newState = gameTypeHandler.addScore(baseGameState, { type: 'foul' });
      setBaseGameState(newState);
      hasShotsRef.current = true;
      autoSaveGame(newState);
    }
  };

  const handleDefensiveShot = () => {
    if (!baseGameState || gameType !== 'apa9ball') return;
    const gameTypeHandler = getGameType('apa9ball');
    if (gameTypeHandler) {
      // Save current state to history before making changes
      saveToHistory(baseGameState);
      
      const newState = gameTypeHandler.addScore(baseGameState, { type: 'custom', data: { action: 'defensiveShot' } });
      setBaseGameState(newState);
      hasShotsRef.current = true;
      autoSaveGame(newState);
    }
  };

  const handleFrameClick = (frameIndex: number) => {
    if (!gameState || gameState.isComplete) return;
    setEditingFrameIndex(frameIndex);
  };

  const handleModalClose = () => {
    setEditingFrameIndex(null);
  };

  const handleModalSave = (updatedGameState: GameState) => {
    setGameState(updatedGameState);
  };

  const handleSaveGame = async () => {
    const currentGameType = gameType || 'bowlliards';
    const stateToCheck = currentGameType === 'bowlliards' ? gameState : baseGameState;
    
    if (!stateToCheck || !stateToCheck.isComplete) {
      alert("Please complete the game before saving.");
      return;
    }

    setSaving(true);
    try {
      let response;
      const stateToSave = currentGameType === 'bowlliards' ? gameState : baseGameState;
      
      if (savedGameId) {
        // Update existing game to completed
        response = await fetch(`/api/games/${savedGameId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            gameState: stateToSave,
            status: "completed",
            completedAt: new Date().toISOString(),
          }),
        });
      } else {
        // Create new completed game
        const stateToSave = gameType === 'bowlliards' ? gameState : baseGameState;
        response = await fetch("/api/games", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            gameMode,
            gameState: stateToSave,
            gameType: gameType || 'bowlliards',
            customGameId: customGameId,
          }),
        });
      }

      if (!response.ok) {
        const error = await response.json();
        if (error.gamesCount !== undefined) {
          alert(
            `Game limit reached! You have ${error.gamesCount}/${error.maxGames} games saved. Upgrade to Premium for unlimited games.`
          );
        } else {
          alert(error.error || "Failed to save game");
        }
        return;
      }

      const game = await response.json();
      if (!savedGameId) {
        setSavedGameId(game.id);
      }
      setSavedGameCreatedAt(game.createdAt || new Date().toISOString());
      setShowSuccessModal(true);
    } catch (error) {
      console.error("Error saving game:", error);
      alert("Failed to save game. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleNewGame = async () => {
    // Abandon current game if it exists
    const currentSavedId = savedGameIdRef.current || savedGameId;
    if (currentSavedId) {
      try {
        await fetch(`/api/games/${currentSavedId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            status: "abandoned",
          }),
        });
      } catch (error) {
        console.error("Error abandoning game:", error);
      }
    }
    // Clear all game state and start fresh
    setGameState(createNewGame());
    setShowSuccessModal(false);
    setSavedGameId(null);
    savedGameIdRef.current = null;
    hasShotsRef.current = false;
    // Reset auto-save state
    autoSaveInProgressRef.current = false;
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
      autoSaveTimeoutRef.current = null;
    }
    console.log("New game started - cleared all state and refs");
  };

  const handleExit = async () => {
    // Auto-save before exiting - use refs to get latest values
    const currentState = gameStateRef.current || gameState;
    const hasProgress = currentState?.frames.some(f => f.ballsPocketed.length > 0);
    
    console.log("handleExit called", {
      hasShotsRef: hasShotsRef.current,
      hasState: !!currentState,
      isComplete: currentState?.isComplete,
      hasProgress,
      savedGameId: savedGameIdRef.current || savedGameId
    });
    
    if (currentState && !currentState.isComplete && hasProgress) {
      // Clear any pending auto-save
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
        autoSaveTimeoutRef.current = null;
      }
      console.log("handleExit: Triggering auto-save before navigation");
      await autoSaveGame(currentState);
      // Small delay to ensure save completes
      await new Promise(resolve => setTimeout(resolve, 100));
    } else {
      console.log("handleExit: Skipping save", {
        hasState: !!currentState,
        isComplete: currentState?.isComplete,
        hasProgress
      });
    }
    router.push("/dashboard");
  };

  const editingFrame =
    editingFrameIndex !== null && gameState ? gameState.frames[editingFrameIndex] : null;

  // Show game type selector if no game type selected
  if (showGameTypeSelector) {
    return (
      <GameTypeSelector
        onSelect={handleGameTypeSelect}
        onCancel={() => router.push("/dashboard")}
        hasPremiumAccess={hasPremiumAccess}
      />
    );
  }

  // Show skill level selector for APA 9-ball
  if (showSkillLevelSelector) {
    return (
      <APA9BallSkillLevelSelector
        onConfirm={handleSkillLevelConfirm}
        onCancel={() => {
          setShowSkillLevelSelector(false);
          setShowGameTypeSelector(true);
        }}
      />
    );
  }

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white dark:bg-slate-900">
        <div className="text-slate-900 dark:text-slate-100">Loading game...</div>
      </div>
    );
  }

  // Render APA 9-ball UI
  if (gameType === 'apa9ball' && baseGameState) {
    const apa9State = baseGameState as APA9BallGameState;
    const isComplete = apa9State.isComplete;
    
    const HeaderCmp = (
      <div className="flex items-center justify-between w-full">
        <button
          onClick={handleExit}
          className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          <span className="text-sm font-semibold">Back</span>
        </button>
        {savedGameId && (
          <div className="text-center flex-1">
            <div className="text-slate-600 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">Game #{savedGameId}</div>
          </div>
        )}
        <div className="flex items-center gap-4">
          <ThemeSwitcherCompact />
        </div>
      </div>
    );

    return (
      <>
        <div className="flex flex-col h-full w-full bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 fixed inset-0 overflow-hidden">
          {/* Header (10%) */}
          <div className="h-[10%] min-h-[60px] flex items-center px-4 border-b border-slate-200 dark:border-slate-700 z-20 bg-white dark:bg-slate-900">
            {HeaderCmp}
          </div>

          {/* Score Display (20%) - Side by side player cards */}
          <div className="h-[20%] min-h-[100px] bg-white dark:bg-slate-900 relative z-10 shadow-sm overflow-hidden">
            <APA9BallScoreDisplay gameState={apa9State} />
          </div>

          {/* Visualizer Stage (45%) - Ball selector */}
          <div className="h-[45%] min-h-[200px] bg-slate-50 dark:bg-slate-800 relative flex flex-col items-center justify-center p-4 overflow-y-auto">
            {isComplete ? (
              <APA9BallMatchPoints gameState={apa9State} />
            ) : (
              <APA9BallSelector
                gameState={apa9State}
                onBallSelect={handleAPA9BallInput}
                disabled={isComplete || saving}
              />
            )}
          </div>

          {/* Control Pad (25%) - Controls */}
          <div className="h-[25%] min-h-[120px] bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 pb-safe-area">
            {isComplete ? (
              <div className="flex flex-col items-center justify-center h-full gap-2 p-3">
                <div className="text-lg font-bold text-slate-900 dark:text-slate-100">Game Complete!</div>
                <div className="flex gap-2 w-full">
                  <button
                    onClick={handleSaveGame}
                    disabled={saving}
                    className="flex-1 py-2 bg-amber-500 text-white font-bold rounded-lg disabled:opacity-50 hover:opacity-90 transition-opacity text-sm"
                  >
                    {saving ? "Saving..." : "Save"}
                  </button>
                  <button
                    onClick={() => router.push("/dashboard")}
                    className="px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg text-sm"
                  >
                    Dashboard
                  </button>
                </div>
              </div>
            ) : (
              <APA9BallTurnControls
                onEndTurn={handleEndTurn}
                onFoul={handleFoul}
                onDefensiveShot={handleDefensiveShot}
                onUndo={handleUndo}
                canUndo={gameHistory.length > 0 && !apa9State.isComplete}
                disabled={saving}
              />
            )}
          </div>
        </div>
        {baseGameState && (
          <GameSaveSuccessModal
            isOpen={showSuccessModal}
            totalScore={apa9State.totalScore}
            gameId={savedGameId || undefined}
            gameState={apa9State as unknown as GameState}
            createdAt={savedGameCreatedAt || new Date().toISOString()}
            gameMode={gameMode}
            onNewGame={handleNewGame}
            onDashboard={() => router.push("/dashboard")}
          />
        )}
      </>
    );
  }

  // For other game types, show "coming soon" message
  if (gameType && gameType !== 'bowlliards' && gameType !== 'apa9ball') {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white dark:bg-slate-900">
        <div className="text-center p-6">
          <div className="text-slate-900 dark:text-slate-100 mb-4">
            Game type "{gameType}" UI is coming soon!
          </div>
          <button
            onClick={() => {
              setGameType(null);
              setShowGameTypeSelector(true);
            }}
            className="px-4 py-2 bg-[var(--accent)] text-white rounded-lg mr-2"
          >
            Choose Different Game
          </button>
          <button
            onClick={() => router.push("/dashboard")}
            className="px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // If gameType is bowlliards but gameState is not set, show loading or create new
  if (gameType === 'bowlliards' && !gameState) {
    // This shouldn't happen, but if it does, create a new game
    if (!loading) {
      const newState = createNewGame();
      setGameState(newState);
    }
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white dark:bg-slate-900">
        <div className="text-slate-900 dark:text-slate-100">Loading game...</div>
      </div>
    );
  }

  // Calculate derived state after loading check
  const currentFrame = gameState.frames[gameState.currentFrame - 1];
  const remainingBalls = currentFrame ? getRemainingBalls(currentFrame) : 0;
  const totalPocketed = currentFrame
    ? currentFrame.ballsPocketed.reduce((sum, count) => sum + count, 0)
    : 0;
  const isTenthFrame = currentFrame?.frameNumber === 10;
  const shotCount = currentFrame?.ballsPocketed.length || 0;

  // Keypad mode logic (duplicated)
  let keypadMode: "shot1" | "shot2" | "break" = "shot1";
  if (shotCount === 0) {
    keypadMode = "break";
  } else if (!isTenthFrame) {
    keypadMode = "shot2";
  } else {
    if (currentFrame.isStrike || currentFrame.isSpare) {
      keypadMode = "shot1";
    } else {
      keypadMode = "shot2";
    }
  }

  const HeaderCmp = (
    <div className="flex items-center justify-between w-full">
      {/* Back button on left */}
      <button
        onClick={handleExit}
        className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
        </svg>
        <span className="text-sm font-semibold">Back</span>
      </button>

      {/* Game # in center */}
      {savedGameId && (
        <div className="text-center flex-1">
          <div className="text-slate-600 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">Game #{savedGameId}</div>
        </div>
      )}

      {/* Score and theme switcher on right */}
      <div className="flex items-center gap-4">
        <div className="text-right">
          <div className="text-slate-600 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">Score</div>
          <div className="text-3xl font-black text-[var(--accent)]">{gameState.totalScore}</div>
        </div>
        <ThemeSwitcherCompact />
      </div>
    </div>
  );

  return (
    <>
      <GameLayout
        header={HeaderCmp}
        frameStrip={
          <FrameRibbon
            frames={gameState.frames}
            currentFrameIndex={gameState.currentFrame - 1}
            calculateCumulativeScore={() => 0}
            onFrameClick={handleFrameClick}
            isEditable={!gameState.isComplete}
          />
        }
        visualizer={
          <div className="w-full h-full flex flex-col justify-center">
            <RackVisualizer totalPocketed={totalPocketed} remainingBalls={remainingBalls} />
            {gameState.isComplete && !showSuccessModal && (
              <div className="fixed inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm z-[100]" style={{ position: 'fixed' }}>
                <div className="text-center p-6 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-2xl max-w-md mx-4">
                  <h2 className="text-2xl font-bold mb-2 text-slate-900 dark:text-slate-100">Game Complete!</h2>
                  <div className="text-4xl font-black text-[var(--accent)] mb-6">{gameState.totalScore}</div>
                  <div className="mb-4">
                    <ShareGame
                      gameState={gameState}
                      gameId={savedGameId || 0}
                      createdAt={savedGameCreatedAt || new Date().toISOString()}
                      gameMode={gameMode}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleSaveGame}
                    disabled={saving}
                    className="w-full py-3 bg-amber-500 text-white font-bold rounded-lg mb-3 disabled:opacity-50 hover:opacity-90 transition-opacity"
                  >
                    {saving ? "Saving..." : "Save to History"}
                  </button>
                  <button
                    type="button"
                    onClick={() => router.push("/dashboard")}
                    className="block w-full text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 mt-2"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        }
        controls={
          <InputKeypad
            mode={keypadMode}
            remainingBalls={remainingBalls}
            onInput={handleScoreInput}
            disabled={gameState.isComplete || saving}
          />
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
      {gameState && (
        <GameSaveSuccessModal
          isOpen={showSuccessModal}
          totalScore={gameState.totalScore}
          gameId={savedGameId || undefined}
          gameState={gameState}
          createdAt={savedGameCreatedAt || new Date().toISOString()}
          gameMode={gameMode}
          onNewGame={handleNewGame}
          onDashboard={() => router.push("/dashboard")}
        />
      )}
    </>
  );
}

