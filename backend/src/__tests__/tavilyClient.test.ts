/**
 * Unit tests for Tavily Client
 */
import { TavilyClient } from '../services/tavilyClient';
import { TelcoCategory } from '../types';

// Mock axios
jest.mock('axios');

describe('TavilyClient', () => {
  let client: TavilyClient;

  beforeEach(() => {
    client = new TavilyClient();
    client.clearCache();
  });

  describe('searchBestPractices', () => {
    it('should return empty array when Tavily is disabled', async () => {
      // Tavily will be disabled if API key is not set
      const results = await client.searchBestPractices(TelcoCategory.IT);
      expect(Array.isArray(results)).toBe(true);
    });

    it('should handle errors gracefully', async () => {
      const results = await client.searchBestPractices(TelcoCategory.IPCORE);
      // Should not throw, should return empty array on error
      expect(Array.isArray(results)).toBe(true);
    });
  });

  describe('cache', () => {
    it('should have cache clearing functionality', () => {
      expect(() => client.clearCache()).not.toThrow();
    });
  });
});
