import type { NextApiRequest, NextApiResponse } from 'next';
import { Server as HTTPServer } from 'http';
import { Socket as NetSocket } from 'net';
import { Server as SocketIOServer } from 'socket.io';
import { getSocketIO } from '@/lib/socket';

interface SocketServer extends HTTPServer {
  io?: SocketIOServer;
}

interface SocketWithIO extends NetSocket {
  server: SocketServer;
}

interface NextApiResponseWithSocket extends NextApiResponse {
  socket: SocketWithIO;
}

export default function handler(
  req: NextApiRequest,
  res: NextApiResponseWithSocket
) {
  if (res.socket.server.io) {
    console.log('[Socket.IO] Already initialized');
    res.status(200).json({ success: true, message: 'Socket.IO already initialized' });
    return;
  }

  console.log('[Socket.IO] Initializing...');
  const io = getSocketIO(res.socket.server as HTTPServer);
  res.socket.server.io = io;

  res.status(200).json({ success: true, message: 'Socket.IO initialized' });
}
