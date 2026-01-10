import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { setupSocketServer } from './socket-server';
import { attachApi } from './attachApi';
import { startAnchorWorker } from './workers/anchors';

const PORT = process.env.PORT || 4000;

async function main() {
  const app = express();
  
  // Middleware
  app.use(cors());
  app.use(express.json());
  
  // Create HTTP server
  const httpServer = createServer(app);
  
  // Setup Socket.IO
  const io = setupSocketServer(httpServer);
  
  // Attach API routes
  attachApi(app, io);
  
  // Start anchor worker
  startAnchorWorker();
  
  // Start server
  httpServer.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📡 WebSocket server ready`);
    console.log(`⚓ Anchor worker started`);
  });
}

main().catch((error) => {
  console.error('Fatal error starting server:', error);
  process.exit(1);
});
