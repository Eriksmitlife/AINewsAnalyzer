import OpenAI from "openai";
import { storage } from "../storage";
import { loggingService } from "./loggingService";

interface MusicGenerationResult {
  musicUrl: string;
  prompt: string;
  style: string;
  duration: number;
  mood: string;
  error?: string;
}

class MusicGenerationService {
  private openai: OpenAI | null = null;
  private riffusionApiUrl = "https://www.riffusion.com";
  
  constructor() {
    if (process.env.OPENAI_API_KEY) {
      this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    }
  }

  // Generate music prompt based on article content
  async generateMusicPrompt(article: {
    title: string;
    description: string;
    content?: string;
    sentimentScore?: number;
    category?: string;
  }): Promise<{
    prompt: string;
    style: string;
    mood: string;
  }> {
    try {
      if (!this.openai) {
        // Fallback prompt generation without AI
        const sentiment = article.sentimentScore || 0.5;
        const mood = sentiment > 0.7 ? "uplifting" : sentiment < 0.3 ? "dark" : "neutral";
        const category = article.category || "general";
        
        const styleMap: Record<string, string> = {
          "AI & Technology": "futuristic electronic synth",
          "Finance & Crypto": "epic orchestral with electronic elements",
          "Startups": "energetic indie rock",
          "Science": "ambient space music",
          "Business": "corporate jazz fusion",
          "Health": "relaxing meditation music",
          "general": "modern cinematic"
        };

        const style = styleMap[category] || styleMap.general;
        const prompt = `${mood} ${style} soundtrack for news about ${article.title.slice(0, 50)}`;
        
        return { prompt, style, mood };
      }

      // Use AI for sophisticated prompt generation
      const response = await this.openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are a music director creating soundtracks for news articles. Generate a detailed music prompt for Riffusion AI that captures the essence of the article. Consider the emotional tone, urgency, and subject matter. Output JSON with: prompt (detailed music description), style (music genre), and mood (emotional tone).`
          },
          {
            role: "user",
            content: `Create a music prompt for this article:
Title: ${article.title}
Description: ${article.description}
Category: ${article.category || 'general'}
Sentiment: ${article.sentimentScore || 0.5}`
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.7,
        max_tokens: 200
      });

      const result = JSON.parse(response.choices[0].message.content || "{}");
      return {
        prompt: result.prompt || `cinematic soundtrack for ${article.title}`,
        style: result.style || "modern electronic",
        mood: result.mood || "neutral"
      };
    } catch (error) {
      loggingService.error("Error generating music prompt", error);
      // Fallback to basic prompt
      return {
        prompt: `news soundtrack for ${article.title}`,
        style: "electronic ambient",
        mood: "neutral"
      };
    }
  }

  // Generate music using Riffusion (simulated since direct API not available)
  async generateMusic(articleId: string, article: any): Promise<MusicGenerationResult> {
    try {
      const { prompt, style, mood } = await this.generateMusicPrompt(article);
      
      // Since Riffusion doesn't have a direct API, we'll create a shareable link
      // that users can use to generate music on Riffusion.com
      const encodedPrompt = encodeURIComponent(prompt);
      const riffusionUrl = `https://www.riffusion.com/?prompt=${encodedPrompt}`;
      
      // For now, we'll store the generation parameters and URL
      const musicData: MusicGenerationResult = {
        musicUrl: riffusionUrl,
        prompt: prompt,
        style: style,
        mood: mood,
        duration: 30 // Default 30 seconds
      };

      // Log the generation
      await storage.recordSystemMetric({
        metricName: "music_generation",
        value: 1,
        metadata: {
          articleId,
          prompt: prompt.slice(0, 100),
          style,
          mood
        }
      });

      loggingService.info(`Music generation prepared for article ${articleId}`, {
        prompt: prompt.slice(0, 100),
        style,
        mood
      });

      return musicData;
    } catch (error) {
      loggingService.error(`Music generation failed for article ${articleId}`, error);
      return {
        musicUrl: "",
        prompt: "",
        style: "",
        mood: "",
        duration: 0,
        error: error instanceof Error ? error.message : "Unknown error"
      };
    }
  }

  // Batch generate music for multiple articles
  async batchGenerateMusic(articles: any[]): Promise<Map<string, MusicGenerationResult>> {
    const results = new Map<string, MusicGenerationResult>();
    
    for (const article of articles) {
      const result = await this.generateMusic(article.id, article);
      results.set(article.id, result);
      
      // Add small delay to avoid overwhelming the service
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    return results;
  }

  // Get music generation statistics
  async getMusicStats(): Promise<{
    totalGenerated: number;
    todayGenerated: number;
    popularStyles: { style: string; count: number }[];
    moodDistribution: { mood: string; percentage: number }[];
  }> {
    try {
      const metrics = await storage.getSystemMetrics("music_generation", 24 * 7);
      const totalGenerated = metrics.length;
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayGenerated = metrics.filter(m => 
        new Date(m.timestamp || 0) >= today
      ).length;

      // Analyze styles and moods
      const styleCount = new Map<string, number>();
      const moodCount = new Map<string, number>();
      
      metrics.forEach(metric => {
        const metadata = metric.metadata as any;
        if (metadata?.style) {
          styleCount.set(metadata.style, (styleCount.get(metadata.style) || 0) + 1);
        }
        if (metadata?.mood) {
          moodCount.set(metadata.mood, (moodCount.get(metadata.mood) || 0) + 1);
        }
      });

      const popularStyles = Array.from(styleCount.entries())
        .map(([style, count]) => ({ style, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      const totalMoods = Array.from(moodCount.values()).reduce((a, b) => a + b, 0);
      const moodDistribution = Array.from(moodCount.entries())
        .map(([mood, count]) => ({
          mood,
          percentage: Math.round((count / totalMoods) * 100)
        }))
        .sort((a, b) => b.percentage - a.percentage);

      return {
        totalGenerated,
        todayGenerated,
        popularStyles,
        moodDistribution
      };
    } catch (error) {
      loggingService.error("Error getting music stats", error);
      return {
        totalGenerated: 0,
        todayGenerated: 0,
        popularStyles: [],
        moodDistribution: []
      };
    }
  }
}

export const musicGenerationService = new MusicGenerationService();