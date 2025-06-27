import { pgTable, text, timestamp, decimal, integer, boolean, uuid, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// AutoNews Coin (ANC) - собственная криптовалюта
export const ancWallets = pgTable("anc_wallets", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").notNull(),
  address: text("address").notNull().unique(),
  privateKeyHash: text("private_key_hash").notNull(),
  balance: decimal("balance", { precision: 18, scale: 8 }).notNull().default("0"),
  stakingBalance: decimal("staking_balance", { precision: 18, scale: 8 }).notNull().default("0"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index("anc_wallets_user_id_idx").on(table.userId),
  addressIdx: index("anc_wallets_address_idx").on(table.address),
}));

// Транзакции ANC
export const ancTransactions = pgTable("anc_transactions", {
  id: uuid("id").primaryKey().defaultRandom(),
  hash: text("hash").notNull().unique(),
  fromAddress: text("from_address"),
  toAddress: text("to_address").notNull(),
  amount: decimal("amount", { precision: 18, scale: 8 }).notNull(),
  fee: decimal("fee", { precision: 18, scale: 8 }).notNull().default("0.001"),
  type: text("type").notNull(), // transfer, mint, burn, stake, unstake, reward
  status: text("status").notNull().default("pending"), // pending, confirmed, failed
  blockNumber: integer("block_number"),
  gasUsed: integer("gas_used").default(21000),
  nonce: integer("nonce").notNull(),
  data: text("data"), // дополнительные данные транзакции
  createdAt: timestamp("created_at").defaultNow().notNull(),
  confirmedAt: timestamp("confirmed_at"),
}, (table) => ({
  hashIdx: index("anc_transactions_hash_idx").on(table.hash),
  fromAddressIdx: index("anc_transactions_from_address_idx").on(table.fromAddress),
  toAddressIdx: index("anc_transactions_to_address_idx").on(table.toAddress),
  statusIdx: index("anc_transactions_status_idx").on(table.status),
}));

// Блоки ANC блокчейна
export const ancBlocks = pgTable("anc_blocks", {
  id: uuid("id").primaryKey().defaultRandom(),
  number: integer("number").notNull().unique(),
  hash: text("hash").notNull().unique(),
  parentHash: text("parent_hash").notNull(),
  merkleRoot: text("merkle_root").notNull(),
  stateRoot: text("state_root").notNull(),
  timestamp: timestamp("timestamp").notNull(),
  difficulty: decimal("difficulty", { precision: 78, scale: 0 }).notNull(),
  gasLimit: integer("gas_limit").notNull().default(8000000),
  gasUsed: integer("gas_used").notNull().default(0),
  nonce: text("nonce").notNull(),
  miner: text("miner").notNull(),
  reward: decimal("reward", { precision: 18, scale: 8 }).notNull(),
  transactionCount: integer("transaction_count").notNull().default(0),
  size: integer("size").notNull(),
  extraData: text("extra_data"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  numberIdx: index("anc_blocks_number_idx").on(table.number),
  hashIdx: index("anc_blocks_hash_idx").on(table.hash),
  minerIdx: index("anc_blocks_miner_idx").on(table.miner),
  timestampIdx: index("anc_blocks_timestamp_idx").on(table.timestamp),
}));

// Стейкинг ANC
export const ancStaking = pgTable("anc_staking", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").notNull(),
  walletAddress: text("wallet_address").notNull(),
  amount: decimal("amount", { precision: 18, scale: 8 }).notNull(),
  rewardRate: decimal("reward_rate", { precision: 5, scale: 4 }).notNull().default("0.12"), // 12% годовых
  startDate: timestamp("start_date").defaultNow().notNull(),
  endDate: timestamp("end_date"),
  totalRewards: decimal("total_rewards", { precision: 18, scale: 8 }).notNull().default("0"),
  lastRewardClaim: timestamp("last_reward_claim").defaultNow().notNull(),
  isActive: boolean("is_active").notNull().default(true),
  lockPeriod: integer("lock_period").notNull().default(30), // дни
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index("anc_staking_user_id_idx").on(table.userId),
  walletAddressIdx: index("anc_staking_wallet_address_idx").on(table.walletAddress),
  isActiveIdx: index("anc_staking_is_active_idx").on(table.isActive),
}));

// Кросс-чейн мосты
export const ancBridges = pgTable("anc_bridges", {
  id: uuid("id").primaryKey().defaultRandom(),
  fromChain: text("from_chain").notNull(), // ANC, ETH, BSC, POLYGON, etc.
  toChain: text("to_chain").notNull(),
  fromAddress: text("from_address").notNull(),
  toAddress: text("to_address").notNull(),
  fromTxHash: text("from_tx_hash").notNull(),
  toTxHash: text("to_tx_hash"),
  amount: decimal("amount", { precision: 18, scale: 8 }).notNull(),
  fee: decimal("fee", { precision: 18, scale: 8 }).notNull(),
  status: text("status").notNull().default("pending"), // pending, processing, completed, failed
  userId: text("user_id").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
}, (table) => ({
  fromTxHashIdx: index("anc_bridges_from_tx_hash_idx").on(table.fromTxHash),
  toTxHashIdx: index("anc_bridges_to_tx_hash_idx").on(table.toTxHash),
  userIdIdx: index("anc_bridges_user_id_idx").on(table.userId),
  statusIdx: index("anc_bridges_status_idx").on(table.status),
}));

// Валидаторы сети ANC
export const ancValidators = pgTable("anc_validators", {
  id: uuid("id").primaryKey().defaultRandom(),
  address: text("address").notNull().unique(),
  publicKey: text("public_key").notNull(),
  stake: decimal("stake", { precision: 18, scale: 8 }).notNull(),
  commission: decimal("commission", { precision: 5, scale: 4 }).notNull().default("0.05"), // 5%
  isActive: boolean("is_active").notNull().default(true),
  blocksProduced: integer("blocks_produced").notNull().default(0),
  missedBlocks: integer("missed_blocks").notNull().default(0),
  lastBlockTime: timestamp("last_block_time"),
  totalRewards: decimal("total_rewards", { precision: 18, scale: 8 }).notNull().default("0"),
  delegators: integer("delegators").notNull().default(0),
  uptime: decimal("uptime", { precision: 5, scale: 4 }).notNull().default("1.0000"), // 100%
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  addressIdx: index("anc_validators_address_idx").on(table.address),
  isActiveIdx: index("anc_validators_is_active_idx").on(table.isActive),
  stakeIdx: index("anc_validators_stake_idx").on(table.stake),
}));

// Схемы для валидации
export const insertAncWalletSchema = createInsertSchema(ancWallets);
export const insertAncTransactionSchema = createInsertSchema(ancTransactions);
export const insertAncBlockSchema = createInsertSchema(ancBlocks);
export const insertAncStakingSchema = createInsertSchema(ancStaking);
export const insertAncBridgeSchema = createInsertSchema(ancBridges);
export const insertAncValidatorSchema = createInsertSchema(ancValidators);

// Типы
export type InsertAncWallet = z.infer<typeof insertAncWalletSchema>;
export type AncWallet = typeof ancWallets.$inferSelect;
export type InsertAncTransaction = z.infer<typeof insertAncTransactionSchema>;
export type AncTransaction = typeof ancTransactions.$inferSelect;
export type InsertAncBlock = z.infer<typeof insertAncBlockSchema>;
export type AncBlock = typeof ancBlocks.$inferSelect;
export type InsertAncStaking = z.infer<typeof insertAncStakingSchema>;
export type AncStaking = typeof ancStaking.$inferSelect;
export type InsertAncBridge = z.infer<typeof insertAncBridgeSchema>;
export type AncBridge = typeof ancBridges.$inferSelect;
export type InsertAncValidator = z.infer<typeof insertAncValidatorSchema>;
export type AncValidator = typeof ancValidators.$inferSelect;