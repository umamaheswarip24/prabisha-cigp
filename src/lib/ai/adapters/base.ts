/**
 * Prabisha Content Intelligence & Growth Platform (PCIGP)
 * Abstract Base Provider Adapter
 */

import { IAIProviderAdapter, AIProviderCallParams, RawAIResponse } from '../types';

export abstract class BaseAIAdapter implements IAIProviderAdapter {
  abstract providerName: string;

  abstract isAvailable(): boolean;

  abstract complete(params: AIProviderCallParams): Promise<RawAIResponse>;

  abstract embed(texts: string[]): Promise<{
    embeddings: number[][];
    dimensions: number;
    tokens: number;
  }>;

  protected calculateCost(
    model: string,
    promptTokens: number,
    completionTokens: number
  ): number {
    // Standard blended pricing rates (USD per 1K tokens)
    const pricing: Record<string, { in: number; out: number }> = {
      'gemini-1.5-pro': { in: 0.00125, out: 0.005 },
      'gemini-1.5-flash': { in: 0.000075, out: 0.0003 },
      'gpt-4o': { in: 0.0025, out: 0.01 },
      'gpt-4o-mini': { in: 0.00015, out: 0.0006 },
      'text-embedding-004': { in: 0.00002, out: 0 },
      'mock': { in: 0, out: 0 },
    };

    const rate = pricing[model] || { in: 0.001, out: 0.003 };
    return (promptTokens / 1000) * rate.in + (completionTokens / 1000) * rate.out;
  }
}

