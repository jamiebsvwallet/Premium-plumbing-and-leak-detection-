// Socket.IO client utility for connecting to the server
let socketServerInstance: any = null;

export function getSocketServer() {
  return socketServerInstance;
}

export function setSocketServer(io: any) {
  socketServerInstance = io;
}
