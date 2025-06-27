import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { newsService } from "./services/newsService";
import { aiService } from "./services/aiService";
import { nftService } from "./services/nftService";
import { analyticsService } from "./services/analyticsService";
import { insertArticleSchema, insertNftSchema, insertNewsSourceSchema } from "@shared/schema";
import { z } from "zod";
import { generateOGImageUrl } from "./services/ogImageService";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Dashboard and analytics routes
  app.get('/api/dashboard/stats', isAuthenticated, async (req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  app.get('/api/analytics/system-metrics', isAuthenticated, async (req, res) => {
    try {
      const { metricName, hours } = req.query;
      const metrics = await storage.getSystemMetrics(
        metricName as string,
        hours ? parseInt(hours as string) : undefined
      );
      res.json(metrics);
    } catch (error) {
      console.error("Error fetching system metrics:", error);
      res.status(500).json({ message: "Failed to fetch system metrics" });
    }
  });

  // News routes
  app.get('/api/news', async (req, res) => {
    try {
      const { limit, offset, category, search, sortBy, sortOrder } = req.query;
      const articles = await storage.getArticles({
        limit: limit ? parseInt(limit as string) : undefined,
        offset: offset ? parseInt(offset as string) : undefined,
        category: category as string,
        search: search as string,
        sortBy: sortBy as any,
        sortOrder: sortOrder as any,
      });
      res.json(articles);
    } catch (error) {
      console.error("Error fetching articles:", error);
      res.status(500).json({ message: "Failed to fetch articles" });
    }
  });

  app.get('/api/news/trending', async (req, res) => {
    try {
      const { limit } = req.query;
      const articles = await storage.getTrendingArticles(
        limit ? parseInt(limit as string) : undefined
      );
      res.json(articles);
    } catch (error) {
      console.error("Error fetching trending articles:", error);
      res.status(500).json({ message: "Failed to fetch trending articles" });
    }
  });

  app.get('/api/news/category/:category', async (req, res) => {
    try {
      const { category } = req.params;
      const { limit } = req.query;
      const articles = await storage.getArticlesByCategory(
        category,
        limit ? parseInt(limit as string) : undefined
      );
      res.json(articles);
    } catch (error) {
      console.error("Error fetching articles by category:", error);
      res.status(500).json({ message: "Failed to fetch articles by category" });
    }
  });

  app.get('/api/news/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const article = await storage.getArticleById(id);
      if (!article) {
        return res.status(404).json({ message: "Article not found" });
      }
      res.json(article);
    } catch (error) {
      console.error("Error fetching article:", error);
      res.status(500).json({ message: "Failed to fetch article" });
    }
  });

  app.post('/api/news', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);

      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Forbidden: Admin access required" });
      }

      const validatedData = insertArticleSchema.parse(req.body);
      const article = await storage.createArticle(validatedData);
      res.status(201).json(article);
    } catch (error) {
      console.error("Error creating article:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create article" });
    }
  });

  // AI analysis routes
  app.post('/api/ai/analyze/:articleId', isAuthenticated, async (req, res) => {
    try {
      const { articleId } = req.params;
      const article = await storage.getArticleById(articleId);

      if (!article) {
        return res.status(404).json({ message: "Article not found" });
      }

      const analysis = await aiService.analyzeArticle(article);

      // Update article with analysis results
      await storage.updateArticle(articleId, {
        sentiment: analysis.sentiment,
        sentimentScore: analysis.sentimentScore.toString(),
        factCheckScore: analysis.factCheckScore.toString(),
        trendingScore: analysis.trendingScore.toString(),
        isVerified: analysis.isVerified,
      });

      res.json(analysis);
    } catch (error) {
      console.error("Error analyzing article:", error);
      res.status(500).json({ message: "Failed to analyze article" });
    }
  });

  app.post('/api/ai/rewrite/:articleId', isAuthenticated, async (req, res) => {
    try {
      const { articleId } = req.params;
      const article = await storage.getArticleById(articleId);

      if (!article) {
        return res.status(404).json({ message: "Article not found" });
      }

      const rewrittenContent = await aiService.rewriteContent(article.content || '');

      res.json({ 
        original: article.content,
        rewritten: rewrittenContent 
      });
    } catch (error) {
      console.error("Error rewriting content:", error);
      res.status(500).json({ message: "Failed to rewrite content" });
    }
  });

  // NFT routes - specific routes before general ones
  app.get('/api/nfts/available', async (req, res) => {
    try {
      const nfts = await storage.getNfts({ limit: 50, forSaleOnly: true });
      const availableNfts = nfts.map(nft => ({
        id: nft.id,
        title: nft.name || nft.description || 'Untitled NFT',
        currentPrice: parseFloat(nft.price || '0')
      }));
      res.json(availableNfts);
    } catch (error) {
      console.error("Error fetching available NFTs:", error);
      res.status(500).json({ message: "Failed to fetch available NFTs" });
    }
  });

  app.get('/api/nfts/transactions', async (req, res) => {
    try {
      const transactions = await storage.getNftTransactions();
      res.json(transactions);
    } catch (error) {
      console.error("Error fetching NFT transactions:", error);
      res.status(500).json({ message: "Failed to fetch NFT transactions" });
    }
  });

  app.get('/api/nfts', async (req, res) => {
    try {
      const { limit, offset, forSaleOnly, ownerId, creatorId } = req.query;
      const nfts = await storage.getNfts({
        limit: limit ? parseInt(limit as string) : undefined,
        offset: offset ? parseInt(offset as string) : undefined,
        forSaleOnly: forSaleOnly === 'true',
        ownerId: ownerId as string,
        creatorId: creatorId as string,
      });
      res.json(nfts);
    } catch (error) {
      console.error("Error fetching NFTs:", error);
      res.status(500).json({ message: "Failed to fetch NFTs" });
    }
  });

  app.get('/api/nfts/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const nft = await storage.getNftById(id);
      if (!nft) {
        return res.status(404).json({ message: "NFT not found" });
      }
      res.json(nft);
    } catch (error) {
      console.error("Error fetching NFT:", error);
      res.status(500).json({ message: "Failed to fetch NFT" });
    }
  });

  app.post('/api/nfts/generate/:articleId', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { articleId } = req.params;

      const article = await storage.getArticleById(articleId);
      if (!article) {
        return res.status(404).json({ message: "Article not found" });
      }

      const nft = await nftService.generateNftFromArticle(article, userId);
      res.status(201).json(nft);
    } catch (error) {
      console.error("Error generating NFT:", error);
      res.status(500).json({ message: "Failed to generate NFT" });
    }
  });

  app.post('/api/nfts/:id/purchase', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { id } = req.params;

      const transaction = await nftService.purchaseNft(id, userId);
      res.status(201).json(transaction);
    } catch (error) {
      console.error("Error purchasing NFT:", error);
      res.status(500).json({ message: "Failed to purchase NFT" });
    }
  });

  app.patch('/api/nfts/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { id } = req.params;

      const nft = await storage.getNftById(id);
      if (!nft) {
        return res.status(404).json({ message: "NFT not found" });
      }

      if (nft.ownerId !== userId) {
        return res.status(403).json({ message: "Forbidden: You don't own this NFT" });
      }

      const { price, isForSale } = req.body;
      const updates: any = {};

      if (price !== undefined) updates.price = price.toString();
      if (isForSale !== undefined) updates.isForSale = isForSale;

      const updatedNft = await storage.updateNft(id, updates);
      res.json(updatedNft);
    } catch (error) {
      console.error("Error updating NFT:", error);
      res.status(500).json({ message: "Failed to update NFT" });
    }
  });

  // User favorites routes
  app.get('/api/favorites', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { limit } = req.query;
      const favorites = await storage.getUserFavorites(
        userId,
        limit ? parseInt(limit as string) : undefined
      );
      res.json(favorites);
    } catch (error) {
      console.error("Error fetching favorites:", error);
      res.status(500).json({ message: "Failed to fetch favorites" });
    }
  });

  app.post('/api/favorites/:articleId', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { articleId } = req.params;

      const favorite = await storage.addToFavorites(userId, articleId);
      res.status(201).json(favorite);
    } catch (error) {
      console.error("Error adding to favorites:", error);
      res.status(500).json({ message: "Failed to add to favorites" });
    }
  });

  app.delete('/api/favorites/:articleId', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { articleId } = req.params;

      await storage.removeFromFavorites(userId, articleId);
      res.status(204).send();
    } catch (error) {
      console.error("Error removing from favorites:", error);
      res.status(500).json({ message: "Failed to remove from favorites" });
    }
  });

  app.get('/api/favorites/:articleId/check', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { articleId } = req.params;

      const isFavorited = await storage.isArticleFavorited(userId, articleId);
      res.json({ isFavorited });
    } catch (error) {
      console.error("Error checking favorite status:", error);
      res.status(500).json({ message: "Failed to check favorite status" });
    }
  });

  // News collection routes (admin only)
  app.post('/api/admin/collect-news', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);

      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Forbidden: Admin access required" });
      }

      newsService.startNewsCollection();
      res.json({ message: "News collection started" });
    } catch (error) {
      console.error("Error starting news collection:", error);
      res.status(500).json({ message: "Failed to start news collection" });
    }
  });

  app.post('/api/admin/generate-nfts', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);

      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Forbidden: Admin access required" });
      }

      const { limit } = req.body;
      const result = await nftService.bulkGenerateNfts(limit || 10);
      res.json(result);
    } catch (error) {
      console.error("Error bulk generating NFTs:", error);
      res.status(500).json({ message: "Failed to bulk generate NFTs" });
    }
  });

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    try {
      const healthStatus = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        newsCollection: newsService.getHealthStatus(),
        memory: process.memoryUsage(),
        env: process.env.NODE_ENV || 'development',
      };

      res.json(healthStatus);
    } catch (error) {
      console.error("Health check error:", error);
      res.status(500).json({ 
        status: 'unhealthy', 
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  });

  // Restart news collection (admin only)
  app.post('/api/admin/restart-collection', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);

      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Forbidden: Admin access required" });
      }

      newsService.stopNewsCollection();
      await newsService.scheduleNewsCollection();

      res.json({ message: "News collection restarted successfully" });
    } catch (error) {
      console.error("Error restarting news collection:", error);
      res.status(500).json({ message: "Failed to restart news collection" });
    }
  });

  // News sources management (admin only)
  app.get('/api/admin/news-sources', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);

      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Forbidden: Admin access required" });
      }

      const sources = await storage.getNewsSources(false);
      res.json(sources);
    } catch (error) {
      console.error("Error fetching news sources:", error);
      res.status(500).json({ message: "Failed to fetch news sources" });
    }
  });

  app.post('/api/admin/news-sources', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);

      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Forbidden: Admin access required" });
      }

      const validatedData = insertNewsSourceSchema.parse(req.body);
      const source = await storage.createNewsSource(validatedData);
      res.status(201).json(source);
    } catch (error) {
      console.error("Error creating news source:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create news source" });
    }
  });

  // Health check
  app.get('/api/health', async (req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        stats,
      });
    } catch (error) {
      res.status(500).json({
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  // Exchange API endpoints
  app.get('/api/exchange', async (req, res) => {
    try {
      const nfts = await storage.getNfts({ limit: 50, forSaleOnly: true });
      const exchangeData = {
        nfts: nfts.map(nft => ({
          id: nft.id,
          title: nft.name || nft.description || 'Untitled NFT',
          price: parseFloat(nft.price || '0'),
          lastPrice: parseFloat(nft.price || '0') * 0.95,
          change24h: (Math.random() - 0.5) * 20,
          volume24h: Math.floor(Math.random() * 10000),
          category: (nft.metadata as any)?.category || 'General',
          sentiment: (nft.metadata as any)?.sentiment || 'neutral',
          verified: true,
          owner: nft.ownerId || 'unknown',
          image: nft.imageUrl || 'https://via.placeholder.com/400x400?text=NFT',
          bids: Math.floor(Math.random() * 50),
          timeLeft: Math.random() > 0.5 ? `${Math.floor(Math.random() * 24)}h ${Math.floor(Math.random() * 60)}m` : undefined
        })),
        topGainers: nfts.slice(0, 5).map(nft => ({
          id: nft.id,
          title: nft.name || nft.description || 'Untitled NFT',
          price: parseFloat(nft.price || '0'),
          change: Math.random() * 50 + 10
        })),
        topLosers: nfts.slice(5, 10).map(nft => ({
          id: nft.id,
          title: nft.name || nft.description || 'Untitled NFT',
          price: parseFloat(nft.price || '0'),
          change: -(Math.random() * 30 + 5)
        })),
        marketStats: {
          totalVolume24h: 1250000,
          totalListings: nfts.length,
          activeTraders: 3420,
          avgPrice: nfts.reduce((sum, nft) => sum + parseFloat(nft.price || '0'), 0) / nfts.length
        }
      };
      res.json(exchangeData);
    } catch (error) {
      console.error("Error fetching exchange data:", error);
      res.status(500).json({ message: "Failed to fetch exchange data" });
    }
  });

  // Trading API endpoints
  app.get('/api/trading', async (req, res) => {
    try {
      const tradingData = {
        orders: [],
        myOrders: [],
        recentTrades: [],
        orderBook: {
          buyOrders: Array.from({length: 10}, (_, i) => ({
            price: 100 - i * 5,
            quantity: Math.floor(Math.random() * 10) + 1,
            total: (100 - i * 5) * (Math.floor(Math.random() * 10) + 1)
          })),
          sellOrders: Array.from({length: 10}, (_, i) => ({
            price: 105 + i * 5,
            quantity: Math.floor(Math.random() * 10) + 1,
            total: (105 + i * 5) * (Math.floor(Math.random() * 10) + 1)
          }))
        }
      };
      res.json(tradingData);
    } catch (error) {
      console.error("Error fetching trading data:", error);
      res.status(500).json({ message: "Failed to fetch trading data" });
    }
  });

  // Auctions API endpoints
  app.get('/api/auctions', async (req, res) => {
    try {
      const nfts = await storage.getNfts({ limit: 20 });
      const auctionsData = {
        featuredAuctions: nfts.slice(0, 6).map(nft => ({
          id: nft.id,
          title: nft.name || nft.description || 'Untitled NFT',
          description: nft.description || 'No description available',
          image: nft.imageUrl || 'https://via.placeholder.com/400x400?text=NFT',
          currentBid: parseFloat(nft.price || '100'),
          startingBid: parseFloat(nft.price || '100') * 0.5,
          endTime: new Date(Date.now() + Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
          category: (nft.metadata as any)?.category || 'General',
          seller: {
            id: nft.ownerId || 'unknown',
            name: `User_${(nft.ownerId || 'unknown').slice(0, 8)}`,
            avatar: 'https://via.placeholder.com/40x40?text=U',
            verified: true
          },
          bids: Array.from({length: Math.floor(Math.random() * 20)}, (_, i) => ({
            id: `bid_${i}`,
            amount: parseFloat(nft.price || '100') - i * 5,
            bidder: {
              name: `Bidder_${i}`,
              avatar: 'https://via.placeholder.com/40x40?text=B'
            },
            timestamp: new Date(Date.now() - i * 60000).toISOString()
          })),
          totalBids: Math.floor(Math.random() * 50),
          watchers: Math.floor(Math.random() * 200),
          isHot: Math.random() > 0.7,
          sentiment: (nft.metadata as any)?.sentiment || 'neutral',
          aiScore: Math.random()
        })),
        endingSoon: nfts.slice(6, 11).map(nft => ({
          id: nft.id,
          title: nft.name || nft.description || 'Untitled NFT',
          image: nft.imageUrl || 'https://via.placeholder.com/60x60?text=NFT',
          currentBid: parseFloat(nft.price || '100'),
          endTime: new Date(Date.now() + Math.random() * 2 * 60 * 60 * 1000).toISOString(),
          watchers: Math.floor(Math.random() * 50)
        })),
        mostWatched: nfts.slice(11, 16).map(nft => ({
          id: nft.id,
          title: nft.name || nft.description || 'Untitled NFT',
          image: nft.imageUrl || 'https://via.placeholder.com/60x60?text=NFT',
          currentBid: parseFloat(nft.price || '100'),
          watchers: Math.floor(Math.random() * 300) + 50
        })),
        recentlyStarted: nfts.slice(16, 20).map(nft => ({
          id: nft.id,
          title: nft.name || nft.description || 'Untitled NFT',
          image: nft.imageUrl || 'https://via.placeholder.com/60x60?text=NFT',
          currentBid: parseFloat(nft.price || '100'),
          startTime: new Date(Date.now() - Math.random() * 60 * 60 * 1000).toISOString()
        })),
        categories: ['AI & Technology', 'Finance & Crypto', 'Startups', 'Science', 'Business', 'Health']
      };
      res.json(auctionsData);
    } catch (error) {
      console.error("Error fetching auctions data:", error);
      res.status(500).json({ message: "Failed to fetch auctions data" });
    }
  });

  // Portfolio API endpoints
  app.get('/api/portfolio', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const userNfts = await storage.getNfts({ ownerId: userId });
      const userTransactions = await storage.getNftTransactions(undefined, userId);

      const portfolioData = {
        overview: {
          totalValue: userNfts.reduce((sum, nft) => sum + parseFloat(nft.price || '0'), 0),
          totalChange24h: Math.random() * 1000 - 500,
          totalChangePercent24h: (Math.random() - 0.5) * 10,
          totalNfts: userNfts.length,
          totalActiveListings: userNfts.filter(nft => nft.isForSale).length,
          totalEarnings: userTransactions
            .filter(tx => tx.type === 'sale')
            .reduce((sum, tx) => sum + parseFloat(tx.price || '0'), 0)
        },
        holdings: userNfts.map(nft => ({
          id: nft.id,
          title: nft.name || nft.description || 'Untitled NFT',
          image: nft.imageUrl || 'https://via.placeholder.com/80x80?text=NFT',
          category: (nft.metadata as any)?.category || 'General',
          purchasePrice: parseFloat(nft.price || '0') * 0.8,
          currentPrice: parseFloat(nft.price || '0'),
          change: parseFloat(nft.price || '0') * 0.2,
          changePercent: 25,
          quantity: 1,
          totalValue: parseFloat(nft.price || '0'),
          isListed: nft.isForSale,
          listingPrice: nft.isForSale ? parseFloat(nft.price || '0') : undefined,
          lastSaleDate: nft.createdAt
        })),
        transactions: userTransactions.map(tx => ({
          id: tx.id,
          type: tx.type,
          nftTitle: tx.nftId,
          price: parseFloat(tx.price || '0'),
          quantity: 1,
          fee: parseFloat(tx.price || '0') * 0.025,
          total: parseFloat(tx.price || '0') * 1.025,
          counterparty: tx.fromUserId === userId ? tx.toUserId : tx.fromUserId,
          timestamp: tx.createdAt,
          status: tx.status || 'completed'
        })),
        earnings: [
          { date: '2024-01-15', amount: 250, source: 'sale' },
          { date: '2024-01-10', amount: 180, source: 'auction' },
          { date: '2024-01-05', amount: 45, source: 'royalty' }
        ],
        performance: {
          bestPerformer: {
            title: userNfts[0]?.name || userNfts[0]?.description || 'No NFTs',
            gain: 150,
            gainPercent: 25
          },
          worstPerformer: {
            title: userNfts[1]?.name || userNfts[1]?.description || 'No NFTs',
            loss: 50,
            lossPercent: -8.5
          },
          totalProfit: 450,
          totalProfitPercent: 12.5
        }
      };

      res.json(portfolioData);
    } catch (error) {
      console.error("Error fetching portfolio data:", error);
      res.status(500).json({ message: "Failed to fetch portfolio data" });
    }
  });

  // Categories endpoint
  app.get('/api/categories', async (req, res) => {
    try {
      const categories = ['AI & Technology', 'Finance & Crypto', 'Startups', 'Science', 'Business', 'Health', 'Politics', 'Sports'];
      res.json(categories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });



  // Automated NFT creation from trending articles
  app.post('/api/auto-create-nfts', async (req, res) => {
    try {
      const result = await nftService.bulkGenerateNfts(10);
      res.json(result);
    } catch (error) {
      console.error("Error auto-creating NFTs:", error);
      res.status(500).json({ message: "Failed to auto-create NFTs" });
    }
  });

  // OG Image Generation for SEO
  app.get("/api/og-image/:articleId", async (req, res) => {
    try {
      const { articleId } = req.params;
      const articles = await storage.getArticles({ limit: 1, search: articleId });

      if (articles.length === 0) {
        return res.status(404).json({ message: "Article not found" });
      }

      const article = articles[0];

      // Generate OG image URL with dynamic content
      const ogImageUrl = generateOGImageUrl(article);

      // Redirect to the generated image or return image data
      res.redirect(ogImageUrl);
    } catch (error) {
      console.error("Error generating OG image:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // SEO Sitemap
  app.get("/sitemap.xml", async (req, res) => {
    try {
      const articles = await storage.getArticles({ limit: 1000 });
      const baseUrl = `${req.protocol}://${req.get('host')}`;

      let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

      // Add main pages
      const mainPages = ['/', '/news', '/exchange', '/trading', '/auctions', '/analytics'];
      mainPages.forEach(page => {
        sitemap += `
  <url>
    <loc>${baseUrl}${page}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>`;
      });

      // Add article pages
      articles.forEach(article => {
        sitemap += `
  <url>
    <loc>${baseUrl}/news/${article.id}</loc>
    <lastmod>${article.updatedAt || article.publishedAt}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>`;
      });

      sitemap += `
</urlset>`;

      res.set('Content-Type', 'application/xml');
      res.send(sitemap);
    } catch (error) {
      console.error("Error generating sitemap:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Robots.txt for SEO
  app.get("/robots.txt", (req, res) => {
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const robotsTxt = `User-agent: *
Allow: /
Sitemap: ${baseUrl}/sitemap.xml

# Allow all crawlers
User-agent: Googlebot
Allow: /

User-agent: Bingbot
Allow: /

User-agent: Slurp
Allow: /

# Disallow admin areas
Disallow: /api/admin/
Disallow: /api/auth/

# Crawl-delay for all bots
Crawl-delay: 1`;

    res.set('Content-Type', 'text/plain');
    res.send(robotsTxt);
  });

  // Automation control endpoints
  app.get('/api/automation/status', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);

      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Forbidden: Admin access required" });
      }

      const { automationService } = await import('./services/automationService');
      const status = automationService.getStatus();
      res.json(status);
    } catch (error) {
      console.error("Error fetching automation status:", error);
      res.status(500).json({ message: "Failed to fetch automation status" });
    }
  });

  app.get('/api/automation/metrics', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);

      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Forbidden: Admin access required" });
      }

      const { automationService } = await import('./services/automationService');
      const metrics = automationService.getMetrics();
      res.json(metrics);
    } catch (error) {
      console.error("Error fetching automation metrics:", error);
      res.status(500).json({ message: "Failed to fetch automation metrics" });
    }
  });

  app.post('/api/automation/start', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);

      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Forbidden: Admin access required" });
      }

      const { automationService } = await import('./services/automationService');
      await automationService.startAutomation();
      res.json({ message: "Automation started successfully" });
    } catch (error) {
      console.error("Error starting automation:", error);
      res.status(500).json({ message: "Failed to start automation" });
    }
  });

  app.post('/api/automation/stop', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);

      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Forbidden: Admin access required" });
      }

      const { automationService } = await import('./services/automationService');
      await automationService.stopAutomation();
      res.json({ message: "Automation stopped successfully" });
    } catch (error) {
      console.error("Error stopping automation:", error);
      res.status(500).json({ message: "Failed to stop automation" });
    }
  });

  app.post('/api/automation/restart', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);

      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Forbidden: Admin access required" });
      }

      const { automationService } = await import('./services/automationService');
      await automationService.stopAutomation();
      setTimeout(() => {
        automationService.startAutomation();
      }, 2000);
      
      res.json({ message: "Automation restarted successfully" });
    } catch (error) {
      console.error("Error restarting automation:", error);
      res.status(500).json({ message: "Failed to restart automation" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}