/**
 * Prabisha Content Intelligence & Growth Platform (PCIGP)
 * AI Gateway Interface & Abstraction Layer
 * Aligned with PRD Section 7 (Model-Agnostic Architecture)
 */

import { AITaskType, MarketJurisdiction, Claim, EvidenceRecord, BrandProfile, ProductService, ICPPersona } from '@/types';

export interface TaskModelPolicy {
  primaryProvider: 'gemini' | 'openai' | 'anthropic' | 'litellm' | 'mock';
  primaryModel: string;
  fallbackProvider?: 'gemini' | 'openai' | 'anthropic' | 'litellm' | 'mock';
  fallbackModel?: string;
  temperature: number;
  maxTokens: number;
  timeoutMs: number;
}

export interface AIProviderCallParams {
  systemPrompt: string;
  userPrompt: string;
  temperature?: number;
  maxTokens?: number;
  schema?: Record<string, unknown>;
  responseFormat?: 'json' | 'text';
}

export interface RawAIResponse {
  content: string;
  model: string;
  provider: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  latencyMs: number;
}

export interface IAIProviderAdapter {
  providerName: string;
  isAvailable(): boolean;
  complete(params: AIProviderCallParams): Promise<RawAIResponse>;
  embed(texts: string[]): Promise<{ embeddings: number[][]; dimensions: number; tokens: number }>;
}

export interface TaskContextRefs {
  brandProfile?: Partial<BrandProfile>;
  product?: Partial<ProductService>;
  icp?: Partial<ICPPersona>;
  approvedClaims?: Claim[];
  evidence?: EvidenceRecord[];
  market?: MarketJurisdiction;
}

export interface GatewayRequest<T = unknown> {
  task: AITaskType;
  prompt: string;
  contextRefs?: TaskContextRefs;
  customSystemPrompt?: string;
  schema?: Record<string, unknown>;
  parseJson?: boolean;
  validateOutput?: (data: unknown) => { valid: boolean; error?: string };
}

export interface GatewayResponse<T = unknown> {
  success: boolean;
  data: T;
  rawText: string;
  model: string;
  provider: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
    estimatedCostUsd: number;
  };
  latencyMs: number;
  citations: string[];
  warnings: string[];
}

