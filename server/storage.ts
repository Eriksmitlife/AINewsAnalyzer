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
  getUserByWallet(walletAddress: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  createWeb3User(walletAddress: string, chainId: number): Promise<User>;

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

  // MLM System
  updateUser(id: string, updates: Partial<any>): Promise<User>;
  getUserChallenges(userId: string): Promise<any[]>;
  getUserAchievements(userId: string): Promise<any[]>;
  getLevelInfo(level: number): Promise<any>;
  getReferralStats(userId: string): Promise<any>;
  claimChallengeReward(userId: string, challengeId: number): Promise<any>;
  processDailyLogin(userId: string): Promise<any>;
}

export class DatabaseStorage implements IStorage {
  // User operations (mandatory for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByWallet(walletAddress: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.walletAddress, walletAddress));
    return user;
  }

  async createWeb3User(walletAddress: string, chainId: number): Promise<User> {
    const userId = `web3_${walletAddress.toLowerCase()}_${Date.now()}`;
    const [user] = await db
      .insert(users)
      .values({
        id: userId,
        walletAddress: walletAddress.toLowerCase(),
        chainId,
        authMethod: "web3",
        firstName: `User ${walletAddress.slice(0, 6)}`,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();
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

  // MLM System Implementation
  async updateUser(id: string, updates: Partial<any>): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async getUserChallenges(userId: string): Promise<any[]> {
    try {
      // Get basic challenges data with SQL
      const result = await db.execute(sql`
        SELECT 
          uc.id,
          uc.challenge_id as "challengeId",
          uc.status,
          uc.current_value as "currentValue", 
          uc.target_value as "targetValue",
          uc.started_at as "startedAt",
          uc.completed_at as "completedAt",
          uc.claimed_at as "claimedAt",
          c.title,
          c.title_ru as "titleRu",
          c.description,
          c.description_ru as "descriptionRu",
          c.type,
          c.category,
          c.requirements,
          c.rewards,
          c.difficulty,
          c.icon,
          c.color,
          c.is_active as "isActive"
        FROM user_challenges uc
        LEFT JOIN challenges c ON uc.challenge_id = c.id
        WHERE uc.user_id = ${userId} AND c.is_active = true
        ORDER BY uc.started_at DESC
      `);

      return result.rows.map((row: any) => ({
        id: row.id,
        challengeId: row.challengeId,
        status: row.status,
        currentValue: row.currentValue || 0,
        targetValue: row.targetValue || 1,
        startedAt: row.startedAt,
        completedAt: row.completedAt,
        claimedAt: row.claimedAt,
        challenge: {
          id: row.challengeId,
          title: row.title,
          titleRu: row.titleRu,
          description: row.description,
          descriptionRu: row.descriptionRu,
          type: row.type,
          category: row.category,
          requirements: row.requirements,
          rewards: row.rewards,
          difficulty: row.difficulty,
          icon: row.icon,
          color: row.color,
          isActive: row.isActive
        }
      }));
    } catch (error) {
      console.error('Error getting user challenges:', error);
      return [];
    }
  }

  async getUserAchievements(userId: string): Promise<any[]> {
    try {
      const result = await db.execute(sql`
        SELECT 
          ua.id,
          ua.achievement_id as "achievementId",
          ua.unlocked_at as "unlockedAt",
          ua.is_new as "isNew",
          a.title,
          a.title_ru as "titleRu", 
          a.description,
          a.description_ru as "descriptionRu",
          a.category,
          a.rarity,
          a.icon,
          a.color,
          a.requirements,
          a.rewards
        FROM user_achievements ua
        LEFT JOIN achievements a ON ua.achievement_id = a.id
        WHERE ua.user_id = ${userId}
        ORDER BY ua.unlocked_at DESC
      `);

      return result.rows.map((row: any) => ({
        id: row.achievementId,
        title: row.title,
        titleRu: row.titleRu,
        description: row.description,
        descriptionRu: row.descriptionRu,
        category: row.category,
        rarity: row.rarity,
        icon: row.icon,
        color: row.color,
        requirements: row.requirements,
        rewards: row.rewards,
        isNew: row.isNew
      }));
    } catch (error) {
      console.error('Error getting user achievements:', error);
      return [];
    }
  }

  async getLevelInfo(level: number): Promise<any> {
    try {
      const result = await db.execute(sql`
        SELECT * FROM user_levels WHERE level = ${level}
      `);
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error getting level info:', error);
      return null;
    }
  }

  async getReferralStats(userId: string): Promise<any> {
    try {
      const result = await db.execute(sql`
        SELECT 
          COUNT(*)::int as "totalReferrals",
          COUNT(CASE WHEN status = 'active' THEN 1 END)::int as "activeReferrals",
          COALESCE(SUM(total_earned), 0) as "totalEarnings",
          COALESCE(SUM(CASE WHEN DATE_TRUNC('month', created_at) = DATE_TRUNC('month', NOW()) THEN total_earned ELSE 0 END), 0) as "thisMonthEarnings"
        FROM referrals
        WHERE referrer_id = ${userId}
      `);

      const stats = result.rows[0] || {};
      return {
        totalReferrals: stats.totalReferrals || 0,
        activeReferrals: stats.activeReferrals || 0,
        totalEarnings: stats.totalEarnings || '0',
        thisMonthEarnings: stats.thisMonthEarnings || '0',
        referralNetwork: []
      };
    } catch (error) {
      console.error('Error getting referral stats:', error);
      return {
        totalReferrals: 0,
        activeReferrals: 0,
        totalEarnings: '0',
        thisMonthEarnings: '0',
        referralNetwork: []
      };
    }
  }

  async claimChallengeReward(userId: string, challengeId: number): Promise<any> {
    try {
      // Check if challenge is completed and not claimed
      const challengeResult = await db.execute(sql`
        SELECT uc.*, c.rewards, c.title, c.title_ru
        FROM user_challenges uc
        LEFT JOIN challenges c ON uc.challenge_id = c.id
        WHERE uc.user_id = ${userId} AND uc.challenge_id = ${challengeId} AND uc.status = 'completed'
      `);

      if (challengeResult.rows.length === 0) {
        throw new Error('Challenge not completed or already claimed');
      }

      const challenge = challengeResult.rows[0];
      const rewards = challenge.rewards || {};
      const ancReward = parseFloat(rewards.anc || 0);
      const xpReward = parseInt(rewards.xp || 0);

      // Update user challenge status
      await db.execute(sql`
        UPDATE user_challenges 
        SET status = 'claimed', claimed_at = NOW()
        WHERE user_id = ${userId} AND challenge_id = ${challengeId}
      `);

      // Update user balance and experience
      await db.execute(sql`
        UPDATE users 
        SET 
          anc_balance = COALESCE(anc_balance, 0) + ${ancReward},
          experience = COALESCE(experience, 0) + ${xpReward},
          total_earnings = COALESCE(total_earnings, 0) + ${ancReward},
          updated_at = NOW()
        WHERE id = ${userId}
      `);

      // Create reward transaction
      await db.execute(sql`
        INSERT INTO reward_transactions (
          user_id, type, source_id, anc_amount, experience_points,
          description, description_ru, status, processed_at, created_at
        ) VALUES (
          ${userId}, 'challenge_reward', ${challengeId.toString()}, ${ancReward.toString()}, ${xpReward},
          ${`Challenge reward: ${challenge.title}`}, ${`Награда за вызов: ${challenge.title_ru}`}, 
          'completed', NOW(), NOW()
        )
      `);

      return {
        success: true,
        ancReward,
        xpReward,
        message: 'Reward claimed successfully'
      };
    } catch (error) {
      console.error('Error claiming challenge reward:', error);
      throw error;
    }
  }

  async processDailyLogin(userId: string): Promise<any> {
    try {
      const user = await this.getUser(userId);
      if (!user) {
        throw new Error('User not found');
      }

      const today = new Date().toDateString();
      const lastActive = user.lastActive ? new Date(user.lastActive).toDateString() : null;

      // Check if already logged in today
      if (lastActive === today) {
        return {
          success: false,
          message: 'Already claimed daily bonus today'
        };
      }

      // Calculate streak
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const isConsecutive = lastActive === yesterday.toDateString();
      const newStreak = isConsecutive ? (user.dailyLoginStreak || 0) + 1 : 1;

      // Calculate rewards based on streak
      const baseAnc = 5;
      const baseXp = 10;
      const streakMultiplier = Math.min(newStreak / 10 + 1, 3); // Max 3x multiplier
      const ancReward = Math.floor(baseAnc * streakMultiplier);
      const xpReward = Math.floor(baseXp * streakMultiplier);

      // Update user
      await db.execute(sql`
        UPDATE users 
        SET 
          last_active = NOW(),
          daily_login_streak = ${newStreak},
          anc_balance = COALESCE(anc_balance, 0) + ${ancReward},
          experience = COALESCE(experience, 0) + ${xpReward},
          total_earnings = COALESCE(total_earnings, 0) + ${ancReward},
          updated_at = NOW()
        WHERE id = ${userId}
      `);

      // Create reward transaction
      await db.execute(sql`
        INSERT INTO reward_transactions (
          user_id, type, anc_amount, experience_points,
          description, description_ru, metadata, status, processed_at, created_at
        ) VALUES (
          ${userId}, 'daily_login', ${ancReward.toString()}, ${xpReward},
          ${`Daily login bonus (Day ${newStreak})`}, ${`Ежедневный бонус (День ${newStreak})`},
          ${JSON.stringify({ streak: newStreak, multiplier: streakMultiplier })},
          'completed', NOW(), NOW()
        )
      `);

      return {
        success: true,
        ancReward,
        experienceReward: xpReward,
        streak: newStreak,
        multiplier: streakMultiplier,
        message: `Daily bonus claimed! Day ${newStreak} streak`
      };
    } catch (error) {
      console.error('Error processing daily login:', error);
      throw error;
    }
  }
}

export const storage = new DatabaseStorage();
