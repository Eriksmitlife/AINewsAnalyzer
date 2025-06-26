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

export const nftService = new NFTService();
