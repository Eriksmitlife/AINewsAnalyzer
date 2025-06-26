import {
  users,
  articles,
  nfts,
  newsSources,
  nftTransactions,
  userFavorites,
  aiAnalysisLogs,
  systemMetrics,
  subscriptions,
  type User,
  type UpsertUser,
  type Article,
  type InsertArticle,
  type Nft,
  type InsertNft,
  type NewsSource,
  type InsertNewsSource,
  type NftTransaction,
  type InsertNftTransaction,
  type UserFavorite,
  type InsertUserFavorite,
  type AiAnalysisLog,
  type InsertAiAnalysisLog,
  type SystemMetric,
  type InsertSystemMetric,
  type Subscription,
  type InsertSubscription,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, asc, and, or, like, sql, count, avg, sum } from "drizzle-orm";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;

  // News operations
  getArticles(params?: {
    limit?: number;
    offset?: number;
    category?: string;
    search?: string;
    sortBy?: 'publishedAt' | 'aiScore' | 'viewCount';
    sortOrder?: 'asc' | 'desc';
  }): Promise<Article[]>;
  getArticleById(id: string): Promise<Article | undefined>;
  createArticle(article: InsertArticle): Promise<Article>;
  updateArticle(id: string, updates: Partial<InsertArticle>): Promise<Article>;
  deleteArticle(id: string): Promise<void>;
  getTrendingArticles(limit?: number): Promise<Article[]>;
  getArticlesByCategory(category: string, limit?: number): Promise<Article[]>;

  // News sources
  getNewsSources(activeOnly?: boolean): Promise<NewsSource[]>;
  createNewsSource(source: InsertNewsSource): Promise<NewsSource>;
  updateNewsSource(id: number, updates: Partial<InsertNewsSource>): Promise<NewsSource>;

  // NFT operations
  getNfts(params?: {
    limit?: number;
    offset?: number;
    forSaleOnly?: boolean;
    ownerId?: string;
    creatorId?: string;
  }): Promise<Nft[]>;
  getNftById(id: string): Promise<Nft | undefined>;
  createNft(nft: InsertNft): Promise<Nft>;
  updateNft(id: string, updates: Partial<InsertNft>): Promise<Nft>;
  deleteNft(id: string): Promise<void>;

  // NFT transactions
  createNftTransaction(transaction: InsertNftTransaction): Promise<NftTransaction>;
  getNftTransactions(nftId?: string, userId?: string): Promise<NftTransaction[]>;
  updateNftTransactionStatus(id: string, status: string): Promise<void>;

  // User favorites
  addToFavorites(userId: string, articleId: string): Promise<UserFavorite>;
  removeFromFavorites(userId: string, articleId: string): Promise<void>;
  getUserFavorites(userId: string, limit?: number): Promise<Article[]>;
  isArticleFavorited(userId: string, articleId: string): Promise<boolean>;

  // AI analysis
  createAiAnalysisLog(log: InsertAiAnalysisLog): Promise<AiAnalysisLog>;
  getAiAnalysisLogs(articleId?: string, limit?: number): Promise<AiAnalysisLog[]>;

  // Analytics
  recordSystemMetric(metric: InsertSystemMetric): Promise<SystemMetric>;
  getSystemMetrics(metricName?: string, hours?: number): Promise<SystemMetric[]>;
  getDashboardStats(): Promise<{
    totalArticles: number;
    totalNfts: number;
    totalTransactions: number;
    totalAnalyses: number;
    avgSentimentScore: number;
    avgFactCheckScore: number;
    avgTrendingScore: number;
  }>;

  // Subscriptions
  createSubscription(subscription: InsertSubscription): Promise<Subscription>;
  getUserSubscription(userId: string): Promise<Subscription | undefined>;
  updateSubscription(id: string, updates: Partial<InsertSubscription>): Promise<Subscription>;
}

export class DatabaseStorage implements IStorage {
  // User operations (mandatory for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // News operations
  async getArticles(params?: {
    limit?: number;
    offset?: number;
    category?: string;
    search?: string;
    sortBy?: 'publishedAt' | 'aiScore' | 'viewCount';
    sortOrder?: 'asc' | 'desc';
  }): Promise<Article[]> {
    let query = db.select().from(articles);
    
    const conditions = [];
    
    if (params?.category) {
      conditions.push(eq(articles.category, params.category));
    }
    
    if (params?.search) {
      conditions.push(
        or(
          like(articles.title, `%${params.search}%`),
          like(articles.content, `%${params.search}%`)
        )
      );
    }
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }
    
    // Sorting
    const sortBy = params?.sortBy || 'publishedAt';
    const sortOrder = params?.sortOrder || 'desc';
    const sortColumn = articles[sortBy];
    query = query.orderBy(sortOrder === 'desc' ? desc(sortColumn) : asc(sortColumn));
    
    if (params?.limit) {
      query = query.limit(params.limit);
    }
    
    if (params?.offset) {
      query = query.offset(params.offset);
    }
    
    return await query;
  }

  async getArticleById(id: string): Promise<Article | undefined> {
    const [article] = await db.select().from(articles).where(eq(articles.id, id));
    if (article) {
      // Increment view count
      await db.update(articles)
        .set({ viewCount: sql`${articles.viewCount} + 1` })
        .where(eq(articles.id, id));
    }
    return article;
  }

  async createArticle(article: InsertArticle): Promise<Article> {
    const [newArticle] = await db.insert(articles).values(article).returning();
    return newArticle;
  }

  async updateArticle(id: string, updates: Partial<InsertArticle>): Promise<Article> {
    const [updatedArticle] = await db
      .update(articles)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(articles.id, id))
      .returning();
    return updatedArticle;
  }

  async deleteArticle(id: string): Promise<void> {
    await db.delete(articles).where(eq(articles.id, id));
  }

  async getTrendingArticles(limit = 10): Promise<Article[]> {
    return await db
      .select()
      .from(articles)
      .orderBy(desc(articles.trendingScore))
      .limit(limit);
  }

  async getArticlesByCategory(category: string, limit = 10): Promise<Article[]> {
    return await db
      .select()
      .from(articles)
      .where(eq(articles.category, category))
      .orderBy(desc(articles.publishedAt))
      .limit(limit);
  }

  // News sources
  async getNewsSources(activeOnly = true): Promise<NewsSource[]> {
    let query = db.select().from(newsSources);
    if (activeOnly) {
      query = query.where(eq(newsSources.isActive, true));
    }
    return await query;
  }

  async createNewsSource(source: InsertNewsSource): Promise<NewsSource> {
    const [newSource] = await db.insert(newsSources).values(source).returning();
    return newSource;
  }

  async updateNewsSource(id: number, updates: Partial<InsertNewsSource>): Promise<NewsSource> {
    const [updatedSource] = await db
      .update(newsSources)
      .set(updates)
      .where(eq(newsSources.id, id))
      .returning();
    return updatedSource;
  }

  // NFT operations
  async getNfts(params?: {
    limit?: number;
    offset?: number;
    forSaleOnly?: boolean;
    ownerId?: string;
    creatorId?: string;
  }): Promise<Nft[]> {
    let query = db.select().from(nfts);
    
    const conditions = [];
    
    if (params?.forSaleOnly) {
      conditions.push(eq(nfts.isForSale, true));
    }
    
    if (params?.ownerId) {
      conditions.push(eq(nfts.ownerId, params.ownerId));
    }
    
    if (params?.creatorId) {
      conditions.push(eq(nfts.creatorId, params.creatorId));
    }
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }
    
    query = query.orderBy(desc(nfts.createdAt));
    
    if (params?.limit) {
      query = query.limit(params.limit);
    }
    
    if (params?.offset) {
      query = query.offset(params.offset);
    }
    
    return await query;
  }

  async getNftById(id: string): Promise<Nft | undefined> {
    const [nft] = await db.select().from(nfts).where(eq(nfts.id, id));
    return nft;
  }

  async createNft(nft: InsertNft): Promise<Nft> {
    const [newNft] = await db.insert(nfts).values(nft).returning();
    return newNft;
  }

  async updateNft(id: string, updates: Partial<InsertNft>): Promise<Nft> {
    const [updatedNft] = await db
      .update(nfts)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(nfts.id, id))
      .returning();
    return updatedNft;
  }

  async deleteNft(id: string): Promise<void> {
    await db.delete(nfts).where(eq(nfts.id, id));
  }

  // NFT transactions
  async createNftTransaction(transaction: InsertNftTransaction): Promise<NftTransaction> {
    const [newTransaction] = await db.insert(nftTransactions).values(transaction).returning();
    return newTransaction;
  }

  async getNftTransactions(nftId?: string, userId?: string): Promise<NftTransaction[]> {
    let query = db.select().from(nftTransactions);
    
    const conditions = [];
    
    if (nftId) {
      conditions.push(eq(nftTransactions.nftId, nftId));
    }
    
    if (userId) {
      conditions.push(
        or(
          eq(nftTransactions.fromUserId, userId),
          eq(nftTransactions.toUserId, userId)
        )
      );
    }
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }
    
    return await query.orderBy(desc(nftTransactions.createdAt));
  }

  async updateNftTransactionStatus(id: string, status: string): Promise<void> {
    await db
      .update(nftTransactions)
      .set({ status })
      .where(eq(nftTransactions.id, id));
  }

  // User favorites
  async addToFavorites(userId: string, articleId: string): Promise<UserFavorite> {
    const [favorite] = await db
      .insert(userFavorites)
      .values({ userId, articleId })
      .returning();
    return favorite;
  }

  async removeFromFavorites(userId: string, articleId: string): Promise<void> {
    await db
      .delete(userFavorites)
      .where(
        and(
          eq(userFavorites.userId, userId),
          eq(userFavorites.articleId, articleId)
        )
      );
  }

  async getUserFavorites(userId: string, limit = 50): Promise<Article[]> {
    return await db
      .select({
        id: articles.id,
        title: articles.title,
        content: articles.content,
        summary: articles.summary,
        url: articles.url,
        imageUrl: articles.imageUrl,
        author: articles.author,
        category: articles.category,
        sourceId: articles.sourceId,
        publishedAt: articles.publishedAt,
        sentiment: articles.sentiment,
        sentimentScore: articles.sentimentScore,
        aiScore: articles.aiScore,
        factCheckScore: articles.factCheckScore,
        trendingScore: articles.trendingScore,
        isVerified: articles.isVerified,
        viewCount: articles.viewCount,
        createdAt: articles.createdAt,
        updatedAt: articles.updatedAt,
      })
      .from(userFavorites)
      .innerJoin(articles, eq(userFavorites.articleId, articles.id))
      .where(eq(userFavorites.userId, userId))
      .orderBy(desc(userFavorites.createdAt))
      .limit(limit);
  }

  async isArticleFavorited(userId: string, articleId: string): Promise<boolean> {
    const [favorite] = await db
      .select()
      .from(userFavorites)
      .where(
        and(
          eq(userFavorites.userId, userId),
          eq(userFavorites.articleId, articleId)
        )
      );
    return !!favorite;
  }

  // AI analysis
  async createAiAnalysisLog(log: InsertAiAnalysisLog): Promise<AiAnalysisLog> {
    const [newLog] = await db.insert(aiAnalysisLogs).values(log).returning();
    return newLog;
  }

  async getAiAnalysisLogs(articleId?: string, limit = 100): Promise<AiAnalysisLog[]> {
    let query = db.select().from(aiAnalysisLogs);
    
    if (articleId) {
      query = query.where(eq(aiAnalysisLogs.articleId, articleId));
    }
    
    return await query
      .orderBy(desc(aiAnalysisLogs.createdAt))
      .limit(limit);
  }

  // Analytics
  async recordSystemMetric(metric: InsertSystemMetric): Promise<SystemMetric> {
    const [newMetric] = await db.insert(systemMetrics).values(metric).returning();
    return newMetric;
  }

  async getSystemMetrics(metricName?: string, hours = 24): Promise<SystemMetric[]> {
    let query = db.select().from(systemMetrics);
    
    const conditions = [];
    
    if (metricName) {
      conditions.push(eq(systemMetrics.metricName, metricName));
    }
    
    // Filter by time range
    const timeThreshold = new Date(Date.now() - hours * 60 * 60 * 1000);
    conditions.push(sql`${systemMetrics.timestamp} >= ${timeThreshold}`);
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }
    
    return await query.orderBy(desc(systemMetrics.timestamp));
  }

  async getDashboardStats(): Promise<{
    totalArticles: number;
    totalNfts: number;
    totalTransactions: number;
    totalAnalyses: number;
    avgSentimentScore: number;
    avgFactCheckScore: number;
    avgTrendingScore: number;
  }> {
    const [articleStats] = await db
      .select({
        count: count(),
        avgSentiment: avg(articles.sentimentScore),
        avgFactCheck: avg(articles.factCheckScore),
        avgTrending: avg(articles.trendingScore),
      })
      .from(articles);

    const [nftStats] = await db
      .select({ count: count() })
      .from(nfts);

    const [transactionStats] = await db
      .select({ count: count() })
      .from(nftTransactions);

    const [analysisStats] = await db
      .select({ count: count() })
      .from(aiAnalysisLogs);

    return {
      totalArticles: articleStats.count,
      totalNfts: nftStats.count,
      totalTransactions: transactionStats.count,
      totalAnalyses: analysisStats.count,
      avgSentimentScore: Number(articleStats.avgSentiment) || 0,
      avgFactCheckScore: Number(articleStats.avgFactCheck) || 0,
      avgTrendingScore: Number(articleStats.avgTrending) || 0,
    };
  }

  // Subscriptions
  async createSubscription(subscription: InsertSubscription): Promise<Subscription> {
    const [newSubscription] = await db.insert(subscriptions).values(subscription).returning();
    return newSubscription;
  }

  async getUserSubscription(userId: string): Promise<Subscription | undefined> {
    const [subscription] = await db
      .select()
      .from(subscriptions)
      .where(
        and(
          eq(subscriptions.userId, userId),
          eq(subscriptions.status, 'active')
        )
      )
      .orderBy(desc(subscriptions.createdAt));
    return subscription;
  }

  async updateSubscription(id: string, updates: Partial<InsertSubscription>): Promise<Subscription> {
    const [updatedSubscription] = await db
      .update(subscriptions)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(subscriptions.id, id))
      .returning();
    return updatedSubscription;
  }
}

export const storage = new DatabaseStorage();
