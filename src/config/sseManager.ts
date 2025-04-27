import { Response } from 'express';
import logger from './logger';

interface SSEClient {
  userId: string;
  response: Response;
}

class SSEManager {
  private clients: Map<string, SSEClient[]>;
  private static instance: SSEManager;

  private constructor() {
    this.clients = new Map();
  }

  public static getInstance(): SSEManager {
    if (!SSEManager.instance) {
      SSEManager.instance = new SSEManager();
    }
    return SSEManager.instance;
  }

  public addClient(userId: string, response: Response): void {
    const userClients = this.clients.get(userId) || [];

    // Setup SSE headers
    response.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    });

    // Add client to the list
    userClients.push({ userId, response });
    this.clients.set(userId, userClients);

    // Setup heartbeat
    const heartbeatInterval = setInterval(() => {
      this.sendHeartbeat(response);
    }, 30000);

    // Handle client disconnect
    response.on('close', () => {
      clearInterval(heartbeatInterval);
      this.removeClient(userId, response);
      logger.debug(`SSE client disconnected for user ${userId}`);
    });

    logger.debug(`New SSE client connected for user ${userId}`);
  }

  private removeClient(userId: string, response: Response): void {
    const userClients = this.clients.get(userId) || [];
    const updatedClients = userClients.filter((client) => client.response !== response);

    if (updatedClients.length === 0) {
      this.clients.delete(userId);
    } else {
      this.clients.set(userId, updatedClients);
    }
  }

  private sendHeartbeat(response: Response): void {
    response.write(`event: heartbeat\ndata: ${new Date().toISOString()}\n\n`);
  }

  public sendToUser(userId: string, eventName: string, data: any): void {
    const userClients = this.clients.get(userId);
    if (!userClients) return;

    const eventData = `event: ${eventName}\ndata: ${JSON.stringify(data)}\n\n`;

    userClients.forEach((client) => {
      try {
        client.response.write(eventData);
      } catch (error) {
        logger.error(`Error sending SSE to user ${userId}:`, error);
        this.removeClient(userId, client.response);
      }
    });
  }

  public broadcastEvent(eventName: string, data: any): void {
    this.clients.forEach((clients, userId) => {
      this.sendToUser(userId, eventName, data);
    });
  }
}

export const sseManager = SSEManager.getInstance();
