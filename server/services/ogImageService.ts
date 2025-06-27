
interface OGImageOptions {
  title: string;
  description?: string;
  category?: string;
  author?: string;
  publishedAt?: string;
  sentiment?: string;
  isVerified?: boolean;
}

class OGImageService {
  generateImageUrl(options: OGImageOptions): string {
    const {
      title,
      description = '',
      category = 'News',
      author = 'AutoNews.AI',
      publishedAt,
      sentiment = 'neutral',
      isVerified = false
    } = options;

    // Use external service for OG image generation
    const baseUrl = 'https://og-image-service.vercel.app';
    
    // Optimize title for image
    const optimizedTitle = this.optimizeTitleForImage(title);
    const truncatedDescription = description.substring(0, 120);
    
    // Color scheme based on sentiment
    const colorScheme = this.getColorScheme(sentiment);
    
    // Build query parameters
    const params = new URLSearchParams({
      title: optimizedTitle,
      subtitle: truncatedDescription,
      category: category,
      author: author,
      verified: isVerified.toString(),
      color: colorScheme.primary,
      background: colorScheme.background,
      width: '1200',
      height: '630',
      fontSize: '60px',
      fontFamily: 'Inter',
      logo: 'https://autonews.ai/logo.png'
    });
    
    if (publishedAt) {
      const date = new Date(publishedAt);
      params.append('date', date.toLocaleDateString());
    }
    
    return `${baseUrl}/api/og?${params.toString()}`;
  }

  private optimizeTitleForImage(title: string): string {
    // Remove emojis and special characters for better readability
    let optimized = title
      .replace(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]/gu, '')
      .replace(/[^\w\s\-—–.,!?]/g, '')
      .trim();
    
    // Limit length for optimal display
    if (optimized.length > 80) {
      optimized = optimized.substring(0, 77) + '...';
    }
    
    return optimized;
  }

  private getColorScheme(sentiment: string): { primary: string; background: string } {
    switch (sentiment) {
      case 'positive':
        return { primary: '#10b981', background: '#f0fdf4' };
      case 'negative':
        return { primary: '#ef4444', background: '#fef2f2' };
      case 'neutral':
      default:
        return { primary: '#3b82f6', background: '#f8fafc' };
    }
  }

  // Fallback method using simple canvas generation
  generateSimpleImageUrl(options: OGImageOptions): string {
    const {
      title,
      category = 'News',
      sentiment = 'neutral'
    } = options;

    // Use a simple image generation service
    const bgColor = sentiment === 'positive' ? '4ade80' : sentiment === 'negative' ? 'ef4444' : '3b82f6';
    const textColor = 'ffffff';
    
    // Encode title for URL
    const encodedTitle = encodeURIComponent(title.substring(0, 60));
    const encodedCategory = encodeURIComponent(category);
    
    return `https://via.placeholder.com/1200x630/${bgColor}/${textColor}?text=${encodedTitle}+%7C+${encodedCategory}+%7C+AutoNews.AI`;
  }

  // Generate multiple sizes for different social platforms
  generateMultipleSizes(options: OGImageOptions): {
    facebook: string;
    twitter: string;
    linkedin: string;
    telegram: string;
  } {
    const baseParams = new URLSearchParams({
      title: this.optimizeTitleForImage(options.title),
      subtitle: options.description?.substring(0, 100) || '',
      category: options.category || 'News',
      author: options.author || 'AutoNews.AI',
    });

    return {
      facebook: `https://og-image-service.vercel.app/api/og?${baseParams}&width=1200&height=630`,
      twitter: `https://og-image-service.vercel.app/api/og?${baseParams}&width=1200&height=675`,
      linkedin: `https://og-image-service.vercel.app/api/og?${baseParams}&width=1200&height=627`,
      telegram: `https://og-image-service.vercel.app/api/og?${baseParams}&width=800&height=418`,
    };
  }
}

export const ogImageService = new OGImageService();

export function generateOGImageUrl(article: any): string {
  return ogImageService.generateImageUrl({
    title: article.title,
    description: article.summary || article.content?.substring(0, 120),
    category: article.category,
    author: article.author,
    publishedAt: article.publishedAt,
    sentiment: article.sentiment,
    isVerified: article.isVerified,
  });
}
