import { Server as SocketIOServer } from "socket.io";
import { Server as HTTPServer } from "http";
import type { GameState } from "@/lib/game-logic";

interface GameRoom {
  gameId: string;
  players: Map<string, { userId: string; socketId: string }>;
  gameState: GameState | null;
}

const gameRooms = new Map<string, GameRoom>();

export function initializeWebSocket(server: HTTPServer) {
  const io = new SocketIOServer(server, {
    cors: {
      origin: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
      methods: ["GET", "POST"],
    },
    path: "/api/ws/socket.io",
  });

  io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);

    socket.on("join-game", (data: { gameId: string; userId: string }) => {
      const { gameId, userId } = data;

      // Join the game room
      socket.join(`game:${gameId}`);

      // Get or create game room
      let room = gameRooms.get(gameId);
      if (!room) {
        room = {
          gameId,
          players: new Map(),
          gameState: null,
        };
        gameRooms.set(gameId, room);
      }

      // Add player to room
      room.players.set(socket.id, { userId, socketId: socket.id });

      // Notify other players
      socket.to(`game:${gameId}`).emit("player-joined", {
        userId,
        socketId: socket.id,
        playerCount: room.players.size,
      });

      // Send current game state to new player
      if (room.gameState) {
        socket.emit("game-state-update", room.gameState);
      }

      console.log(`Player ${userId} joined game ${gameId}`);
    });

    socket.on("game-state-update", (data: { gameId: string; gameState: GameState }) => {
      const { gameId, gameState } = data;

      const room = gameRooms.get(gameId);
      if (!room) {
        return;
      }

      // Update game state
      room.gameState = gameState;

      // Broadcast to all players in the room (except sender)
      socket.to(`game:${gameId}`).emit("game-state-update", gameState);
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);

      // Remove player from all rooms
      for (const [gameId, room] of gameRooms.entries()) {
        if (room.players.has(socket.id)) {
          room.players.delete(socket.id);

          // Notify other players
          io.to(`game:${gameId}`).emit("player-left", {
            socketId: socket.id,
            playerCount: room.players.size,
          });

          // Clean up empty rooms
          if (room.players.size === 0) {
            gameRooms.delete(gameId);
          }
        }
      }
    });
  });

  return io;
}

