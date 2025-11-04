/**
 * Tavily API Client
 * Fetches best-practice data for Telco categories with caching
 */
import axios, { AxiosInstance } from 'axios';
import { LRUCache } from 'lru-cache';
import { config } from '../config';
import { logger } from '../utils/logger';
import { TavilyResponse, TavilyEvidence, TelcoCategory } from '../types';

export class TavilyClient {
  private client: AxiosInstance;
  private cache: LRUCache<string, TavilyResponse>;
  private enabled: boolean;

  constructor() {
    this.enabled = config.tavilyEnabled;
    
    this.client = axios.create({
      baseURL: 'https://api.tavily.com',
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Initialize LRU cache
    this.cache = new LRUCache<string, TavilyResponse>({
      max: 100,
      ttl: config.cacheTTL * 1000, // Convert to milliseconds
    });

    logger.info('Tavily client initialized', { 
      enabled: this.enabled,
      cacheTTL: config.cacheTTL 
    });
  }

  /**
   * Search for best practices for a given category
   */
  async searchBestPractices(category: TelcoCategory): Promise<TavilyEvidence[]> {
    if (!this.enabled) {
      logger.warn('Tavily is disabled, returning empty results');
      return [];
    }

    try {
      const queries = this.buildQueries(category);
      const allResults: TavilyEvidence[] = [];

      for (const query of queries) {
        const results = await this.search(query);
        allResults.push(...results);
      }

      // Deduplicate by URL
      const uniqueResults = this.deduplicateByUrl(allResults);

      // Sort by relevance
      uniqueResults.sort((a, b) => b.relevance - a.relevance);

      // Return top 10
      return uniqueResults.slice(0, 10);
    } catch (error) {
      logger.error('Tavily search failed', { category, error });
      return []; // Graceful fallback
    }
  }

  /**
   * Perform a search query with caching
   */
  private async search(query: string): Promise<TavilyEvidence[]> {
    // Check cache first
    if (config.useCache) {
      const cached = this.cache.get(query);
      if (cached) {
        logger.debug('Cache hit for query', { query });
        return this.transformResponse(cached);
      }
    }

    try {
      logger.info('Executing Tavily search', { query });

      const response = await this.client.post<TavilyResponse>('/search', {
        api_key: config.tavilyApiKey,
        query,
        search_depth: 'advanced',
        max_results: 5,
        include_domains: [
          'itu.int',
          'gsma.com',
          '3gpp.org',
          'tmforum.org',
          'etsi.org',
          'ieee.org',
        ],
      });

      const data = response.data;

      // Cache the response
      if (config.useCache) {
        this.cache.set(query, data);
      }

      return this.transformResponse(data);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        logger.error('Tavily API error', {
          query,
          status: error.response?.status,
          message: error.message,
        });
      } else {
        logger.error('Tavily search error', { query, error });
      }
      return [];
    }
  }

  /**
   * Transform Tavily response to evidence format
   */
  private transformResponse(response: TavilyResponse): TavilyEvidence[] {
    if (!response.results || response.results.length === 0) {
      return [];
    }

    return response.results.map(result => ({
      title: result.title,
      link: result.url,
      snippet: result.content.substring(0, 300) + (result.content.length > 300 ? '...' : ''),
      relevance: result.score || 0.5,
      usedInScoring: false, // Will be updated by scoring engine
    }));
  }

  /**
   * Build search queries for a category
   */
  private buildQueries(category: TelcoCategory): string[] {
    return [
      `${category} MOP best practices telecom`,
      `${category} change management procedure ITIL`,
      `${category} rollback strategy best practices`,
    ];
  }

  /**
   * Deduplicate results by URL
   */
  private deduplicateByUrl(results: TavilyEvidence[]): TavilyEvidence[] {
    const seen = new Set<string>();
    const unique: TavilyEvidence[] = [];

    for (const result of results) {
      if (!seen.has(result.link)) {
        seen.add(result.link);
        unique.push(result);
      }
    }

    return unique;
  }

  /**
   * Clear cache (for testing)
   */
  clearCache(): void {
    this.cache.clear();
    logger.info('Tavily cache cleared');
  }
}
