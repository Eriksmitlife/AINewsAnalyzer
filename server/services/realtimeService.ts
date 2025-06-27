import { Server } from 'socket.io';
import { createServer } from 'http';

class RealtimeService {
  private io: Server | null = null;
  private stats = {
    connections: 0,
    messages: 0,
    uptime: Date.now()
  };

  initialize(server: any) {
    this.io = new Server(server, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"]
      }
    });

    this.io.on('connection', (socket) => {
      this.stats.connections++;
      console.log('User connected:', socket.id);
      
      socket.on('disconnect', () => {
        this.stats.connections--;
        console.log('User disconnected:', socket.id);
      });
    });
  }

  init(server: any) {
    this.initialize(server);
  }

  getStats() {
    return {
      ...this.stats,
      uptime: Date.now() - this.stats.uptime
    };
  }

  broadcastPriceUpdate(nftId: string, price: number) {
    if (this.io) {
      this.stats.messages++;
      this.io.emit('price-update', { nftId, price });
    }
  }

  broadcastNewAuction(auction: any) {
    if (this.io) {
      this.stats.messages++;
      this.io.emit('new-auction', auction);
    }
  }
}

export const realtimeService = new RealtimeService();