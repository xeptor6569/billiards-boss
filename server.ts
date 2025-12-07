import { createServer } from "http";
import { parse } from "url";
import next from "next";
import { initializeWebSocket } from "./src/lib/websocket/server";

const dev = process.env.NODE_ENV !== "production";
const hostname = process.env.HOSTNAME || "0.0.0.0";  // Default to 0.0.0.0 for Docker
const port = parseInt(process.env.PORT || "3000", 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url!, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error("Error occurred handling", req.url, err);
      res.statusCode = 500;
      res.end("internal server error");
    }
  });

  // Initialize WebSocket server
  initializeWebSocket(server);

  // Explicitly bind to 0.0.0.0 to accept connections from all interfaces (needed for Docker)
  server.listen(port, "0.0.0.0", () => {
    console.log(`> Ready on http://${hostname}:${port}`);
  });
}).catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});

