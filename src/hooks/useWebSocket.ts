"use client";

import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import type { GameState } from "@/lib/game-logic";

interface UseWebSocketOptions {
  gameId?: string;
  userId?: string;
  onGameStateUpdate?: (gameState: GameState) => void;
  onPlayerJoined?: (data: { userId: string; socketId: string; playerCount: number }) => void;
  onPlayerLeft?: (data: { socketId: string; playerCount: number }) => void;
}

export function useWebSocket({
  gameId,
  userId,
  onGameStateUpdate,
  onPlayerJoined,
  onPlayerLeft,
}: UseWebSocketOptions) {
  const [connected, setConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!gameId || !userId) {
      return;
    }

    // Initialize socket connection
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 
      (process.env.NODE_ENV === "production" ? "https://billiardsboss.com" : "http://localhost:3000");
    const socket = io(wsUrl, {
      path: "/api/ws/socket.io",
      transports: ["websocket", "polling"],
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("WebSocket connected");
      setConnected(true);

      // Join game room
      socket.emit("join-game", { gameId, userId });
    });

    socket.on("disconnect", () => {
      console.log("WebSocket disconnected");
      setConnected(false);
    });

    socket.on("game-state-update", (gameState: GameState) => {
      onGameStateUpdate?.(gameState);
    });

    socket.on("player-joined", (data) => {
      onPlayerJoined?.(data);
    });

    socket.on("player-left", (data) => {
      onPlayerLeft?.(data);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [gameId, userId, onGameStateUpdate, onPlayerJoined, onPlayerLeft]);

  const sendGameState = (gameState: GameState) => {
    if (socketRef.current && gameId && connected) {
      socketRef.current.emit("game-state-update", { gameId, gameState });
    }
  };

  return {
    connected,
    sendGameState,
  };
}

