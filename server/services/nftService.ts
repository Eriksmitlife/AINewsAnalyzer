import { storage } from '../storage';
import { aiService } from './aiService';
import type { Article, InsertNft, InsertNftTransaction } from '@shared/schema';

interface NFTGenerationResult {
  nft: any;
  metadata: any;
  imageUrl?: string;
}

class NFTService {
  async generateNftFromArticle(article: Article, creatorId: string): Promise<NFTGenerationResult> {
    try {
      // Generate NFT metadata using AI
      const metadata = await aiService.generateNftMetadata(article);
      
      // Generate a simple image URL based on article content
      const imageUrl = await this.generateNftImage(article);
      
      // Calculate base price based on article metrics
      const basePrice = this.calculateNftPrice(article);
      
      const nftData: InsertNft = {
        name: metadata.name,
        description: metadata.description,
        imageUrl,
        metadata,
        price: basePrice.toString(),
        chain: 'ethereum',
        ownerId: creatorId,
        creatorId,
        articleId: article.id,
        isForSale: true,
        status: 'active',
      };

      const nft = await storage.createNft(nftData);
      
      // Log NFT creation transaction
      await storage.createNftTransaction({
        nftId: nft.id,
        toUserId: creatorId,
        type: 'mint',
        status: 'completed',
      });

      // Record metrics
      await aiService.recordMetric('nft_generated', 1, {
        articleId: article.id,
        articleCategory: article.category,
        price: basePrice,
        timestamp: new Date().toISOString(),
      });

      return {
        nft,
        metadata,
        imageUrl,
      };
    } catch (error) {
      console.error('Error generating NFT from article:', error);
      throw new Error('Failed to generate NFT');
    }
  }

  async purchaseNft(nftId: string, buyerId: string): Promise<any> {
    try {
      const nft = await storage.getNftById(nftId);
      
      if (!nft) {
        throw new Error('NFT not found');
      }
      
      if (!nft.isForSale) {
        throw new Error('NFT is not for sale');
      }
      
      if (nft.ownerId === buyerId) {
        throw new Error('Cannot purchase your own NFT');
      }

      // Create transaction record
      const transaction = await storage.createNftTransaction({
        nftId: nft.id,
        fromUserId: nft.ownerId!,
        toUserId: buyerId,
        price: nft.price,
        type: 'sale',
        status: 'completed', // In real implementation, this would be 'pending' until blockchain confirmation
      });

      // Update NFT ownership
      await storage.updateNft(nftId, {
        ownerId: buyerId,
        isForSale: false,
      });

      // Record metrics
      await aiService.recordMetric('nft_sale', Number(nft.price) || 0, {
        nftId,
        fromUserId: nft.ownerId,
        toUserId: buyerId,
        timestamp: new Date().toISOString(),
      });

      return transaction;
    } catch (error) {
      console.error('Error purchasing NFT:', error);
      throw error;
    }
  }

  async bulkGenerateNfts(limit: number = 10): Promise<{ generated: number; errors: number }> {
    try {
      // Get recent articles without NFTs
      const articles = await storage.getArticles({
        limit: limit * 2, // Get more articles to filter from
        sortBy: 'publishedAt',
        sortOrder: 'desc',
      });

      let generated = 0;
      let errors = 0;
      const systemUserId = 'system'; // Default system user for bulk generation

      for (const article of articles.slice(0, limit)) {
        try {
          // Check if NFT already exists for this article
          const existingNfts = await storage.getNfts({ limit: 1 });
          const hasNft = existingNfts.some(nft => nft.articleId === article.id);
          
          if (hasNft) continue;

          await this.generateNftFromArticle(article, systemUserId);
          generated++;
          
          // Add small delay to avoid overwhelming the AI service
          await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (error) {
          console.error(`Error generating NFT for article ${article.id}:`, error);
          errors++;
        }
      }

      console.log(`Bulk NFT generation completed: ${generated} generated, ${errors} errors`);
      
      return { generated, errors };
    } catch (error) {
      console.error('Error in bulk NFT generation:', error);
      throw new Error('Bulk NFT generation failed');
    }
  }

  private async generateNftImage(article: Article): Promise<string> {
    // For now, use a placeholder image service
    // In production, this would integrate with AI image generation or create custom graphics
    const category = article.category?.toLowerCase().replace(/[^a-z0-9]/g, '') || 'general';
    const seed = this.hashString(article.title + article.id);
    
    // Use a combination of placeholder services and generated patterns
    const imageServices = [
      `https://picsum.photos/seed/${seed}/400/400`,
      `https://source.unsplash.com/400x400/?${category},technology`,
      `https://api.dicebear.com/7.x/shapes/svg?seed=${seed}&size=400`,
    ];

    return imageServices[seed % imageServices.length];
  }

  private calculateNftPrice(article: Article): number {
    // Calculate price based on article metrics
    let basePrice = 0.1; // Base price in ETH
    
    // Adjust based on AI score
    if (article.aiScore) {
      basePrice += Number(article.aiScore) * 0.5;
    }
    
    // Adjust based on trending score
    if (article.trendingScore) {
      basePrice += Number(article.trendingScore) * 0.3;
    }
    
    // Adjust based on fact check score
    if (article.factCheckScore) {
      basePrice += Number(article.factCheckScore) * 0.2;
    }
    
    // Adjust based on view count
    if (article.viewCount && article.viewCount > 100) {
      basePrice += Math.log10(article.viewCount) * 0.1;
    }
    
    // Adjust based on verification status
    if (article.isVerified) {
      basePrice += 0.2;
    }
    
    // Category multipliers
    const categoryMultipliers: Record<string, number> = {
      'AI & Technology': 1.5,
      'Finance & Crypto': 1.3,
      'Startups': 1.2,
      'Science': 1.1,
      'Business': 1.0,
    };
    
    const multiplier = categoryMultipliers[article.category || ''] || 1.0;
    basePrice *= multiplier;
    
    // Round to 4 decimal places and ensure minimum price
    return Math.max(0.05, Math.round(basePrice * 10000) / 10000);
  }

  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  async updateNftPrice(nftId: string, newPrice: number, ownerId: string): Promise<any> {
    try {
      const nft = await storage.getNftById(nftId);
      
      if (!nft) {
        throw new Error('NFT not found');
      }
      
      if (nft.ownerId !== ownerId) {
        throw new Error('Only the owner can update the price');
      }

      const updatedNft = await storage.updateNft(nftId, {
        price: newPrice.toString(),
      });

      return updatedNft;
    } catch (error) {
      console.error('Error updating NFT price:', error);
      throw error;
    }
  }

  async toggleNftSaleStatus(nftId: string, isForSale: boolean, ownerId: string): Promise<any> {
    try {
      const nft = await storage.getNftById(nftId);
      
      if (!nft) {
        throw new Error('NFT not found');
      }
      
      if (nft.ownerId !== ownerId) {
        throw new Error('Only the owner can change sale status');
      }

      const updatedNft = await storage.updateNft(nftId, {
        isForSale,
      });

      return updatedNft;
    } catch (error) {
      console.error('Error updating NFT sale status:', error);
      throw error;
    }
  }

  async getNftsByOwner(ownerId: string, limit: number = 50): Promise<any[]> {
    return await storage.getNfts({
      ownerId,
      limit,
    });
  }

  async getNftsForSale(limit: number = 50, offset: number = 0): Promise<any[]> {
    return await storage.getNfts({
      forSaleOnly: true,
      limit,
      offset,
    });
  }

  async getNftTransactionHistory(nftId: string): Promise<any[]> {
    return await storage.getNftTransactions(nftId);
  }

  async getUserTransactionHistory(userId: string, limit: number = 100): Promise<any[]> {
    return await storage.getNftTransactions(undefined, userId);
  }
}

// Advanced rarity calculation based on multiple factors
  calculateAdvancedRarity(article: any, marketData: any): {
    rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'mythic';
    rarityScore: number;
    factors: string[];
  } {
    let score = 0;
    const factors: string[] = [];

    // Content quality factors (40% weight)
    const factCheckScore = parseFloat(article.factCheckScore || '0.5');
    const sentimentStrength = Math.abs(parseFloat(article.sentimentScore || '0.5') - 0.5) * 2;
    
    if (factCheckScore > 0.8) {
      score += 20;
      factors.push('High Credibility');
    }
    
    if (sentimentStrength > 0.6) {
      score += 15;
      factors.push('Strong Sentiment');
    }

    // Trending and viral factors (30% weight)
    const trendingScore = parseFloat(article.trendingScore || '0.5');
    if (trendingScore > 0.8) {
      score += 25;
      factors.push('Viral Potential');
    }

    // Source reputation (15% weight)
    if (article.source?.includes('Reuters') || article.source?.includes('BBC')) {
      score += 10;
      factors.push('Premium Source');
    }

    // Market timing (10% weight)
    const hoursSincePublished = (Date.now() - new Date(article.publishedAt).getTime()) / (1000 * 60 * 60);
    if (hoursSincePublished < 1) {
      score += 8;
      factors.push('Breaking News');
    }

    // Special events detection (5% weight)
    const specialKeywords = ['breakthrough', 'first', 'record', 'unprecedented', 'historic'];
    const hasSpecialEvent = specialKeywords.some(keyword => 
      article.title.toLowerCase().includes(keyword) || 
      (article.content || '').toLowerCase().includes(keyword)
    );
    
    if (hasSpecialEvent) {
      score += 7;
      factors.push('Historic Event');
    }

    // Determine rarity tier
    let rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'mythic';
    if (score >= 70) rarity = 'mythic';
    else if (score >= 55) rarity = 'legendary';
    else if (score >= 40) rarity = 'epic';
    else if (score >= 25) rarity = 'rare';
    else if (score >= 15) rarity = 'uncommon';
    else rarity = 'common';

    return {
      rarity,
      rarityScore: score / 100,
      factors
    };
  }

  // Dynamic pricing based on market conditions
  calculateDynamicPrice(rarityData: any, marketConditions: any): number {
    const basePrices = {
      'common': 0.01,
      'uncommon': 0.05,
      'rare': 0.15,
      'epic': 0.5,
      'legendary': 2.0,
      'mythic': 10.0
    };

    let basePrice = basePrices[rarityData.rarity] || 0.01;

    // Market demand multiplier
    const demandMultiplier = 1 + (marketConditions.demand || 0) * 0.5;
    
    // Trending topic multiplier
    if (rarityData.factors.includes('Viral Potential')) {
      basePrice *= 1.5;
    }
    
    // Breaking news premium
    if (rarityData.factors.includes('Breaking News')) {
      basePrice *= 2.0;
    }

    // Apply market conditions
    const finalPrice = basePrice * demandMultiplier;

    // Ensure reasonable bounds
    return Math.max(0.001, Math.min(100, finalPrice));
  }

  // Generate unique visual traits based on article content
  generateNFTTraits(article: any, rarityData: any): any {
    const traits = {
      'Background': this.selectTraitByCategory(article.category),
      'Frame': this.selectTraitByRarity(rarityData.rarity),
      'Effect': this.selectTraitBySentiment(article.sentiment),
      'Badge': rarityData.factors.length > 0 ? rarityData.factors[0] : 'Standard',
      'Timestamp': new Date(article.publishedAt).toISOString().split('T')[0],
      'Source': article.author || 'Unknown',
      'Category': article.category || 'General'
    };

    // Add special traits for high rarity items
    if (rarityData.rarity === 'legendary' || rarityData.rarity === 'mythic') {
      traits['Special'] = 'Holographic';
      traits['Glow'] = 'Enabled';
    }

    return traits;
  }

  private selectTraitByCategory(category: string): string {
    const categoryTraits = {
      'AI & Technology': 'Digital Matrix',
      'Finance & Crypto': 'Golden Coins',
      'Startups': 'Innovation Grid',
      'Science': 'Laboratory',
      'Business': 'Corporate',
      'Health': 'Medical'
    };
    return categoryTraits[category] || 'Standard';
  }

  private selectTraitByRarity(rarity: string): string {
    const rarityFrames = {
      'common': 'Bronze',
      'uncommon': 'Silver',
      'rare': 'Gold',
      'epic': 'Platinum',
      'legendary': 'Diamond',
      'mythic': 'Ethereal'
    };
    return rarityFrames[rarity] || 'Bronze';
  }

  private selectTraitBySentiment(sentiment: string): string {
    const sentimentEffects = {
      'positive': 'Rising Sparkles',
      'negative': 'Red Alert',
      'neutral': 'Steady Pulse'
    };
    return sentimentEffects[sentiment] || 'Steady Pulse';
  }
}

export const nftService = new NFTService();
