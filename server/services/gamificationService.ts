
import { storage } from '../storage';

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'bronze' | 'silver' | 'gold' | 'platinum';
  points: number;
  condition: (userStats: any) => boolean;
}

interface UserStats {
  userId: string;
  articlesRead: number;
  nftsCreated: number;
  nftsSold: number;
  totalEarnings: number;
  tradingVolume: number;
  consecutiveDays: number;
  achievementsUnlocked: string[];
  level: number;
  experience: number;
  badges: string[];
}

class GamificationService {
  private achievements: Achievement[] = [
    {
      id: 'first_read',
      name: 'News Explorer',
      description: 'Read your first article',
      icon: '📰',
      rarity: 'bronze',
      points: 10,
      condition: (stats) => stats.articlesRead >= 1
    },
    {
      id: 'news_addict',
      name: 'News Addict',
      description: 'Read 100 articles',
      icon: '📚',
      rarity: 'silver',
      points: 100,
      condition: (stats) => stats.articlesRead >= 100
    },
    {
      id: 'first_nft',
      name: 'NFT Creator',
      description: 'Create your first NFT',
      icon: '🎨',
      rarity: 'bronze',
      points: 25,
      condition: (stats) => stats.nftsCreated >= 1
    },
    {
      id: 'nft_master',
      name: 'NFT Master',
      description: 'Create 50 NFTs',
      icon: '🏆',
      rarity: 'gold',
      points: 500,
      condition: (stats) => stats.nftsCreated >= 50
    },
    {
      id: 'first_sale',
      name: 'First Sale',
      description: 'Sell your first NFT',
      icon: '💰',
      rarity: 'silver',
      points: 50,
      condition: (stats) => stats.nftsSold >= 1
    },
    {
      id: 'whale_trader',
      name: 'Whale Trader',
      description: 'Achieve $1000 in trading volume',
      icon: '🐋',
      rarity: 'platinum',
      points: 1000,
      condition: (stats) => stats.tradingVolume >= 1000
    },
    {
      id: 'streak_week',
      name: 'Weekly Streak',
      description: 'Active for 7 consecutive days',
      icon: '🔥',
      rarity: 'silver',
      points: 75,
      condition: (stats) => stats.consecutiveDays >= 7
    },
    {
      id: 'streak_month',
      name: 'Monthly Legend',
      description: 'Active for 30 consecutive days',
      icon: '⚡',
      rarity: 'platinum',
      points: 300,
      condition: (stats) => stats.consecutiveDays >= 30
    }
  ];

  async getUserStats(userId: string): Promise<UserStats> {
    try {
      // Aggregate user statistics from various sources
      const [articles, nfts, trades] = await Promise.all([
        storage.getUserArticleInteractions(userId),
        storage.getUserNFTs(userId),
        storage.getUserTrades(userId)
      ]);

      const stats: UserStats = {
        userId,
        articlesRead: articles.length,
        nftsCreated: nfts.filter(n => n.creatorId === userId).length,
        nftsSold: nfts.filter(n => n.creatorId === userId && n.soldAt).length,
        totalEarnings: nfts.reduce((sum, n) => sum + (n.soldPrice || 0), 0),
        tradingVolume: trades.reduce((sum, t) => sum + t.amount, 0),
        consecutiveDays: await this.calculateStreakDays(userId),
        achievementsUnlocked: await this.getUnlockedAchievements(userId),
        level: 1,
        experience: 0,
        badges: []
      };

      // Calculate level and experience
      const totalPoints = this.calculateTotalPoints(stats);
      stats.level = Math.floor(totalPoints / 100) + 1;
      stats.experience = totalPoints % 100;

      return stats;
    } catch (error) {
      console.error('Error fetching user stats:', error);
      return this.getDefaultStats(userId);
    }
  }

  private getDefaultStats(userId: string): UserStats {
    return {
      userId,
      articlesRead: 0,
      nftsCreated: 0,
      nftsSold: 0,
      totalEarnings: 0,
      tradingVolume: 0,
      consecutiveDays: 0,
      achievementsUnlocked: [],
      level: 1,
      experience: 0,
      badges: []
    };
  }

  async checkAndUnlockAchievements(userId: string): Promise<Achievement[]> {
    const stats = await this.getUserStats(userId);
    const newAchievements: Achievement[] = [];

    for (const achievement of this.achievements) {
      if (!stats.achievementsUnlocked.includes(achievement.id) && 
          achievement.condition(stats)) {
        
        await this.unlockAchievement(userId, achievement.id);
        newAchievements.push(achievement);
        
        // Award experience points
        await this.awardExperience(userId, achievement.points);
      }
    }

    return newAchievements;
  }

  private async unlockAchievement(userId: string, achievementId: string): Promise<void> {
    try {
      await storage.recordUserAchievement(userId, achievementId);
    } catch (error) {
      console.error('Error unlocking achievement:', error);
    }
  }

  private async awardExperience(userId: string, points: number): Promise<void> {
    try {
      await storage.addUserExperience(userId, points);
    } catch (error) {
      console.error('Error awarding experience:', error);
    }
  }

  private calculateTotalPoints(stats: UserStats): number {
    return stats.achievementsUnlocked.reduce((total, achievementId) => {
      const achievement = this.achievements.find(a => a.id === achievementId);
      return total + (achievement?.points || 0);
    }, 0);
  }

  private async calculateStreakDays(userId: string): Promise<number> {
    // Implementation would check user activity by days
    // For now, return a default value
    return 1;
  }

  private async getUnlockedAchievements(userId: string): Promise<string[]> {
    try {
      return await storage.getUserAchievements(userId);
    } catch (error) {
      return [];
    }
  }

  async getLeaderboard(category: 'level' | 'earnings' | 'nfts_created' = 'level'): Promise<any[]> {
    try {
      return await storage.getLeaderboard(category, 10);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      return [];
    }
  }

  getAchievements(): Achievement[] {
    return this.achievements;
  }

  // Daily rewards system
  async claimDailyReward(userId: string): Promise<{
    success: boolean;
    reward?: { type: 'experience' | 'tokens', amount: number };
    nextClaimTime?: Date;
  }> {
    const lastClaim = await storage.getLastDailyRewardClaim(userId);
    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    if (lastClaim && new Date(lastClaim) > twentyFourHoursAgo) {
      const nextClaimTime = new Date(new Date(lastClaim).getTime() + 24 * 60 * 60 * 1000);
      return {
        success: false,
        nextClaimTime
      };
    }

    // Calculate reward based on user level and streak
    const stats = await this.getUserStats(userId);
    const baseReward = 50;
    const levelBonus = stats.level * 5;
    const streakBonus = Math.min(stats.consecutiveDays * 2, 50);
    
    const totalReward = baseReward + levelBonus + streakBonus;

    await storage.recordDailyRewardClaim(userId, totalReward);
    await this.awardExperience(userId, totalReward);

    return {
      success: true,
      reward: {
        type: 'experience',
        amount: totalReward
      }
    };
  }
}

export const gamificationService = new GamificationService();
