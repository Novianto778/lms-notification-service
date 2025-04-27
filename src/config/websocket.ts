import { Server } from 'socket.io';
import { Server as HttpServer } from 'http';
import { env } from './env';
import logger from './logger';
import * as jwt from 'jsonwebtoken';

interface JWTPayload {
  id: string;
  // Add other fields as needed
}

export class WebSocketManager {
  private io: Server;
  private userSockets: Map<string, Set<string>> = new Map();

  constructor(httpServer: HttpServer) {
    this.io = new Server(httpServer, {
      cors: {
        origin: env.CORS_ORIGIN,
        methods: ['GET', 'POST'],
      },
    });

    this.setupAuthMiddleware();
    this.setupEventHandlers();
  }

  private setupAuthMiddleware() {
    this.io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token;
        if (!token) {
          return next(new Error('Authentication error'));
        }

        const decoded = jwt.verify(token, env.JWT_SECRET) as JWTPayload;
        socket.data.userId = decoded.id;
        next();
      } catch (error) {
        next(new Error('Authentication error'));
      }
    });
  }

  private setupEventHandlers() {
    this.io.on('connection', (socket) => {
      const userId = socket.data.userId;
      logger.info(`User ${userId} connected via WebSocket`);

      // Store socket connection
      if (!this.userSockets.has(userId)) {
        this.userSockets.set(userId, new Set());
      }
      this.userSockets.get(userId)?.add(socket.id);

      // Handle disconnection
      socket.on('disconnect', () => {
        logger.info(`User ${userId} disconnected from WebSocket`);
        this.userSockets.get(userId)?.delete(socket.id);
        if (this.userSockets.get(userId)?.size === 0) {
          this.userSockets.delete(userId);
        }
      });
    });
  }

  public sendToUser(userId: string, event: string, data: any) {
    const userSocketIds = this.userSockets.get(userId);
    if (userSocketIds) {
      userSocketIds.forEach((socketId) => {
        this.io.to(socketId).emit(event, data);
      });
    }
  }

  public broadcastToAll(event: string, data: any) {
    this.io.emit(event, data);
  }
}

let wsManager: WebSocketManager;

export const initializeWebSocket = (httpServer: HttpServer) => {
  wsManager = new WebSocketManager(httpServer);
  return wsManager;
};

export const getWebSocketManager = () => {
  if (!wsManager) {
    throw new Error('WebSocket manager not initialized');
  }
  return wsManager;
};
