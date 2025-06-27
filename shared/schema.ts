import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  integer,
  boolean,
  decimal,
  real,
  uuid,
  primaryKey,
} from "drizzle-orm/pg-core";
import { relations, sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

const uniqueIndex = index;

// Session storage table (mandatory for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table (mandatory for Replit Auth)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: varchar("role").default("user"), // user, admin
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// News sources
export const newsSources = pgTable("news_sources", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  url: varchar("url", { length: 500 }).notNull(),
  rssUrl: varchar("rss_url", { length: 500 }),
  category: varchar("category", { length: 100 }),
  isActive: boolean("is_active").default(true),
  language: varchar("language", { length: 10 }).default("en"),
  lastCrawled: timestamp("last_crawled"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Articles
export const articles = pgTable("articles", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: text("title").notNull(),
  content: text("content"),
  summary: text("summary"),
  url: varchar("url", { length: 1000 }).unique().notNull(),
  imageUrl: varchar("image_url", { length: 1000 }),
  author: varchar("author", { length: 255 }),
  category: varchar("category", { length: 100 }),
  sourceId: integer("source_id").references(() => newsSources.id),
  publishedAt: timestamp("published_at"),
  sentiment: varchar("sentiment", { length: 20 }), // positive, negative, neutral
  sentimentScore: decimal("sentiment_score", { precision: 5, scale: 4 }),
  aiScore: decimal("ai_score", { precision: 5, scale: 4 }),
  factCheckScore: decimal("fact_check_score", { precision: 5, scale: 4 }),
  trendingScore: decimal("trending_score", { precision: 5, scale: 4 }),
  isVerified: boolean("is_verified").default(false),
  viewCount: integer("view_count").default(0),
  // Music generation fields
  musicUrl: varchar("music_url", { length: 1000 }),
  musicPrompt: text("music_prompt"),
  musicStyle: varchar("music_style", { length: 100 }),
  musicMood: varchar("music_mood", { length: 50 }),
  musicGeneratedAt: timestamp("music_generated_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// NFTs
export const nfts = pgTable("nfts", {
  id: uuid("id").defaultRandom().primaryKey(),
  tokenId: varchar("token_id", { length: 100 }),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  imageUrl: varchar("image_url", { length: 1000 }),
  metadata: jsonb("metadata"),
  price: decimal("price", { precision: 18, scale: 8 }),
  chain: varchar("chain", { length: 50 }).default("ethereum"), // ethereum, polygon, solana
  contractAddress: varchar("contract_address", { length: 100 }),
  ownerId: varchar("owner_id").references(() => users.id),
  creatorId: varchar("creator_id").references(() => users.id),
  articleId: uuid("article_id").references(() => articles.id),
  isForSale: boolean("is_for_sale").default(false),
  status: varchar("status", { length: 20 }).default("active"), // active, sold, burned
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// NFT Transactions
export const nftTransactions = pgTable("nft_transactions", {
  id: uuid("id").defaultRandom().primaryKey(),
  nftId: uuid("nft_id").references(() => nfts.id).notNull(),
  fromUserId: varchar("from_user_id").references(() => users.id),
  toUserId: varchar("to_user_id").references(() => users.id).notNull(),
  price: decimal("price", { precision: 18, scale: 8 }),
  transactionHash: varchar("transaction_hash", { length: 100 }),
  type: varchar("type", { length: 20 }).notNull(), // mint, sale, transfer
  status: varchar("status", { length: 20 }).default("pending"), // pending, completed, failed
  createdAt: timestamp("created_at").defaultNow(),
});

// User favorites
export const userFavorites = pgTable("user_favorites", {
  userId: varchar("user_id").references(() => users.id).notNull(),
  articleId: uuid("article_id").references(() => articles.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  pk: primaryKey({ columns: [table.userId, table.articleId] }),
}));

// AI Analysis logs
export const aiAnalysisLogs = pgTable("ai_analysis_logs", {
  id: uuid("id").defaultRandom().primaryKey(),
  articleId: uuid("article_id").references(() => articles.id),
  analysisType: varchar("analysis_type", { length: 50 }).notNull(), // sentiment, fact_check, trending
  input: text("input"),
  output: jsonb("output"),
  model: varchar("model", { length: 100 }),
  duration: integer("duration"), // milliseconds
  cost: decimal("cost", { precision: 10, scale: 6 }),
  status: varchar("status", { length: 20 }).default("completed"), // pending, completed, failed
  createdAt: timestamp("created_at").defaultNow(),
});

// System analytics
export const systemMetrics = pgTable("system_metrics", {
  id: uuid("id").defaultRandom().primaryKey(),
  metricName: varchar("metric_name", { length: 100 }).notNull(),
  value: decimal("value", { precision: 15, scale: 4 }).notNull(),
  metadata: jsonb("metadata"),
  timestamp: timestamp("timestamp").defaultNow(),
});

// Subscriptions
export const subscriptions = pgTable("subscriptions", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  plan: varchar("plan", { length: 50 }).notNull(), // free, premium, enterprise
  status: varchar("status", { length: 20 }).default("active"), // active, cancelled, expired
  startDate: timestamp("start_date").defaultNow(),
  endDate: timestamp("end_date"),
  price: decimal("price", { precision: 10, scale: 2 }),
  paymentMethod: varchar("payment_method", { length: 50 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  ownedNfts: many(nfts, { relationName: "owner" }),
  createdNfts: many(nfts, { relationName: "creator" }),
  favorites: many(userFavorites),
  nftTransactionsFrom: many(nftTransactions, { relationName: "from" }),
  nftTransactionsTo: many(nftTransactions, { relationName: "to" }),
  subscriptions: many(subscriptions),
}));

export const articlesRelations = relations(articles, ({ one, many }) => ({
  source: one(newsSources, {
    fields: [articles.sourceId],
    references: [newsSources.id],
  }),
  nfts: many(nfts),
  favorites: many(userFavorites),
  aiAnalyses: many(aiAnalysisLogs),
}));

export const nftsRelations = relations(nfts, ({ one, many }) => ({
  owner: one(users, {
    fields: [nfts.ownerId],
    references: [users.id],
    relationName: "owner",
  }),
  creator: one(users, {
    fields: [nfts.creatorId],
    references: [users.id],
    relationName: "creator",
  }),
  article: one(articles, {
    fields: [nfts.articleId],
    references: [articles.id],
  }),
  transactions: many(nftTransactions),
}));

export const newsSourcesRelations = relations(newsSources, ({ many }) => ({
  articles: many(articles),
}));

export const nftTransactionsRelations = relations(nftTransactions, ({ one }) => ({
  nft: one(nfts, {
    fields: [nftTransactions.nftId],
    references: [nfts.id],
  }),
  fromUser: one(users, {
    fields: [nftTransactions.fromUserId],
    references: [users.id],
    relationName: "from",
  }),
  toUser: one(users, {
    fields: [nftTransactions.toUserId],
    references: [users.id],
    relationName: "to",
  }),
}));

export const userFavoritesRelations = relations(userFavorites, ({ one }) => ({
  user: one(users, {
    fields: [userFavorites.userId],
    references: [users.id],
  }),
  article: one(articles, {
    fields: [userFavorites.articleId],
    references: [articles.id],
  }),
}));

export const aiAnalysisLogsRelations = relations(aiAnalysisLogs, ({ one }) => ({
  article: one(articles, {
    fields: [aiAnalysisLogs.articleId],
    references: [articles.id],
  }),
}));

export const subscriptionsRelations = relations(subscriptions, ({ one }) => ({
  user: one(users, {
    fields: [subscriptions.userId],
    references: [users.id],
  }),
}));

// User Levels and Tiers
export const userLevels = pgTable("user_levels", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  level: integer("level").notNull().default(1), // 1-100
  tier: varchar("tier").notNull().default("bronze"), // bronze, silver, gold, platinum, diamond, emerald, legendary
  experience: integer("experience").notNull().default(0),
  totalEarnings: real("total_earnings").notNull().default(0),
  challengesCompleted: integer("challenges_completed").notNull().default(0),
  referralCount: integer("referral_count").notNull().default(0),
  achievementPoints: integer("achievement_points").notNull().default(0),
  powerScore: integer("power_score").notNull().default(0),
  weeklyActivity: integer("weekly_activity").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_user_levels_user").on(table.userId),
  index("idx_user_levels_tier").on(table.tier),
  index("idx_user_levels_power_score").on(table.powerScore),
]);

// Challenges and Tasks
export const challenges = pgTable("challenges", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title").notNull(),
  description: text("description").notNull(),
  category: varchar("category").notNull(), // social, content, trading, referral, special
  type: varchar("type").notNull(), // daily, weekly, monthly, achievement
  difficulty: varchar("difficulty").notNull(), // easy, medium, hard, legendary
  reward: real("reward").notNull(), // ANC tokens
  experiencePoints: integer("experience_points").notNull(),
  requirements: jsonb("requirements").notNull(), // JSON with task requirements
  icon: varchar("icon"),
  color: varchar("color"),
  minLevel: integer("min_level").notNull().default(1),
  maxCompletions: integer("max_completions").default(1),
  expiresAt: timestamp("expires_at"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("idx_challenges_category").on(table.category),
  index("idx_challenges_type").on(table.type),
  index("idx_challenges_active").on(table.isActive),
]);

// User Challenge Progress
export const userChallenges = pgTable("user_challenges", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  challengeId: varchar("challenge_id").notNull().references(() => challenges.id, { onDelete: "cascade" }),
  status: varchar("status").notNull().default("in_progress"), // in_progress, completed, claimed
  progress: jsonb("progress").notNull().default(sql`'{}'::jsonb`),
  completions: integer("completions").notNull().default(0),
  completedAt: timestamp("completed_at"),
  claimedAt: timestamp("claimed_at"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("idx_user_challenges_user").on(table.userId),
  index("idx_user_challenges_status").on(table.status),
  uniqueIndex("idx_user_challenge_unique").on(table.userId, table.challengeId),
]);

// Referral System
export const referrals = pgTable("referrals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  referrerId: varchar("referrer_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  referredId: varchar("referred_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  status: varchar("status").notNull().default("pending"), // pending, active, rewarded
  referralCode: varchar("referral_code").notNull(),
  rewardAmount: real("reward_amount").notNull().default(0),
  bonusLevel: integer("bonus_level").notNull().default(1), // MLM bonus levels
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("idx_referrals_referrer").on(table.referrerId),
  index("idx_referrals_code").on(table.referralCode),
  uniqueIndex("idx_referral_unique").on(table.referrerId, table.referredId),
]);

// Achievements
export const achievements = pgTable("achievements", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  description: text("description").notNull(),
  category: varchar("category").notNull(), // milestone, special, seasonal, legendary
  icon: varchar("icon").notNull(),
  rarity: varchar("rarity").notNull(), // common, rare, epic, legendary, mythic
  points: integer("points").notNull(),
  requirements: jsonb("requirements").notNull(),
  reward: real("reward"), // Optional ANC reward
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("idx_achievements_category").on(table.category),
  index("idx_achievements_rarity").on(table.rarity),
]);

// User Achievements
export const userAchievements = pgTable("user_achievements", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  achievementId: varchar("achievement_id").notNull().references(() => achievements.id, { onDelete: "cascade" }),
  unlockedAt: timestamp("unlocked_at").defaultNow(),
  claimed: boolean("claimed").notNull().default(false),
}, (table) => [
  index("idx_user_achievements_user").on(table.userId),
  uniqueIndex("idx_user_achievement_unique").on(table.userId, table.achievementId),
]);

// Reward Transactions
export const rewardTransactions = pgTable("reward_transactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  type: varchar("type").notNull(), // challenge, referral, achievement, bonus, level_up
  amount: real("amount").notNull(),
  status: varchar("status").notNull().default("pending"), // pending, processing, completed, failed
  sourceId: varchar("source_id"), // ID of challenge, referral, etc
  sourceType: varchar("source_type"), // challenge, referral, achievement
  transactionHash: varchar("transaction_hash"),
  metadata: jsonb("metadata").default(sql`'{}'::jsonb`),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("idx_reward_transactions_user").on(table.userId),
  index("idx_reward_transactions_status").on(table.status),
  index("idx_reward_transactions_type").on(table.type),
]);

// Insert schemas
export const insertUserSchema = createInsertSchema(users);
export const insertArticleSchema = createInsertSchema(articles);
export const insertNftSchema = createInsertSchema(nfts);
export const insertNewsSourceSchema = createInsertSchema(newsSources);
export const insertNftTransactionSchema = createInsertSchema(nftTransactions);
export const insertUserFavoriteSchema = createInsertSchema(userFavorites);
export const insertAiAnalysisLogSchema = createInsertSchema(aiAnalysisLogs);
export const insertSystemMetricSchema = createInsertSchema(systemMetrics);
export const insertSubscriptionSchema = createInsertSchema(subscriptions);

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type InsertArticle = z.infer<typeof insertArticleSchema>;
export type Article = typeof articles.$inferSelect;
export type InsertNft = z.infer<typeof insertNftSchema>;
export type Nft = typeof nfts.$inferSelect;
export type InsertNewsSource = z.infer<typeof insertNewsSourceSchema>;
export type NewsSource = typeof newsSources.$inferSelect;
export type InsertNftTransaction = z.infer<typeof insertNftTransactionSchema>;
export type NftTransaction = typeof nftTransactions.$inferSelect;
export type InsertUserFavorite = z.infer<typeof insertUserFavoriteSchema>;
export type UserFavorite = typeof userFavorites.$inferSelect;
export type InsertAiAnalysisLog = z.infer<typeof insertAiAnalysisLogSchema>;
export type AiAnalysisLog = typeof aiAnalysisLogs.$inferSelect;
export type InsertSystemMetric = z.infer<typeof insertSystemMetricSchema>;
export type SystemMetric = typeof systemMetrics.$inferSelect;
export type InsertSubscription = z.infer<typeof insertSubscriptionSchema>;
export type Subscription = typeof subscriptions.$inferSelect;
