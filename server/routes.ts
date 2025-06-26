import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { aiService } from "./services/aiService";
import { newsService } from "./services/newsService";
import { nftService } from "./services/nftService";
import { analyticsService } from "./services/analyticsService";
import { insertArticleSchema, insertNftSchema, insertNewsSourceSchema } from "@shared/schema";
import { z } from "zod";

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

  // NFT routes
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

  const httpServer = createServer(app);
  return httpServer;
}
