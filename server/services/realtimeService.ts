
import { WebSocketServer } from 'ws';
import { Server } from 'http';

interface LiveUpdate {
  type: 'news' | 'nft' | 'trading' | 'auction' | 'analysis';
  data: any;
  timestamp: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

class RealtimeService {
  private wss: WebSocketServer | null = null;
  private clients = new Set<any>();
  private updateQueue: LiveUpdate[] = [];

  initialize(server: Server) {
    this.wss = new WebSocketServer({ server });
    
    this.wss.on('connection', (ws) => {
      console.log('New WebSocket connection');
      this.clients.add(ws);
      
      // Send immediate updates
      ws.send(JSON.stringify({
        type: 'system',
        data: { status: 'connected', timestamp: new Date().toISOString() }
      }));
      
      ws.on('close', () => {
        this.clients.delete(ws);
      });
      
      ws.on('message', (message) => {
        try {
          const data = JSON.parse(message.toString());
          this.handleClientMessage(ws, data);
        } catch (error) {
          console.error('WebSocket message error:', error);
        }
      });
    });
  }

  private handleClientMessage(ws: any, data: any) {
    switch (data.type) {
      case 'subscribe':
        ws.subscriptions = data.channels || [];
        break;
      case 'unsubscribe':
        ws.subscriptions = ws.subscriptions?.filter((s: string) => !data.channels?.includes(s)) || [];
        break;
    }
  }

  broadcast(update: LiveUpdate) {
    const message = JSON.stringify(update);
    
    this.clients.forEach((ws) => {
      if (ws.readyState === 1) { // WebSocket.OPEN
        ws.send(message);
      }
    });
  }

  broadcastToChannel(channel: string, update: LiveUpdate) {
    const message = JSON.stringify(update);
    
    this.clients.forEach((ws) => {
      if (ws.readyState === 1 && ws.subscriptions?.includes(channel)) {
        ws.send(message);
      }
    });
  }

  // Live news updates
  broadcastNewsUpdate(article: any) {
    this.broadcast({
      type: 'news',
      data: {
        id: article.id,
        title: article.title,
        category: article.category,
        sentiment: article.sentiment,
        trending: article.trendingScore > 0.7
      },
      timestamp: new Date().toISOString(),
      priority: article.trendingScore > 0.8 ? 'critical' : 'medium'
    });
  }

  // Live NFT updates
  broadcastNFTUpdate(nft: any, action: string) {
    this.broadcast({
      type: 'nft',
      data: {
        id: nft.id,
        action, // 'created', 'sold', 'price_updated'
        price: nft.price,
        rarity: nft.rarity
      },
      timestamp: new Date().toISOString(),
      priority: action === 'sold' ? 'high' : 'medium'
    });
  }

  // Live trading updates
  broadcastTradingUpdate(trade: any) {
    this.broadcast({
      type: 'trading',
      data: trade,
      timestamp: new Date().toISOString(),
      priority: 'high'
    });
  }

  getStats() {
    return {
      connectedClients: this.clients.size,
      queuedUpdates: this.updateQueue.length
    };
  }
}

export const realtimeService = new RealtimeService();
