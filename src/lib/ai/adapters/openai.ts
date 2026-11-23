/**
 * Prabisha Content Intelligence & Growth Platform (PCIGP)
 * OpenAI & LiteLLM-Compatible Provider Adapter
 * Works seamlessly with direct OpenAI or a self-hosted LiteLLM Proxy
 */

import { BaseAIAdapter } from './base';
import { AIProviderCallParams, RawAIResponse } from '../types';

export class OpenAICompatibleAdapter extends BaseAIAdapter {
  providerName: 'openai' | 'litellm';
  private apiKey: string;
  private apiBase: string;

  constructor(
    isLiteLLM = false,
    apiKey?: string,
    apiBase?: string
  ) {
    super();
    this.providerName = isLiteLLM ? 'litellm' : 'openai';
    this.apiKey =
      apiKey ||
      (isLiteLLM ? process.env.LITELLM_API_KEY : process.env.OPENAI_API_KEY) ||
      '';
    this.apiBase =
      apiBase ||
      (isLiteLLM
        ? process.env.LITELLM_API_BASE || 'http://localhost:4000/v1'
        : 'https://api.openai.com/v1');
  }

  isAvailable(): boolean {
    if (this.providerName === 'litellm') {
      return Boolean(process.env.LITELLM_API_BASE || this.apiBase);
    }
    return Boolean(this.apiKey && this.apiKey.length > 5);
  }

  async complete(params: AIProviderCallParams): Promise<RawAIResponse> {
    if (!this.isAvailable()) {
      throw new Error(`${this.providerName.toUpperCase()} API key or endpoint is not configured.`);
    }

    const startTime = Date.now();
    const model = 'gpt-4o-mini';
    const url = `${this.apiBase}/chat/completions`;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (this.apiKey) {
      headers['Authorization'] = `Bearer ${this.apiKey}`;
    }

    const body: Record<string, unknown> = {
      model,
      messages: [
        { role: 'system', content: params.systemPrompt },
        { role: 'user', content: params.userPrompt },
      ],
      temperature: params.temperature ?? 0.7,
      max_tokens: params.maxTokens ?? 2048,
    };

    if (params.responseFormat === 'json') {
      body['response_format'] = { type: 'json_object' };
    }

    const res = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`${this.providerName.toUpperCase()} API Error [${res.status}]: ${errorText}`);
    }

    const data = await res.json();
    const choice = data.choices?.[0];
    const content = choice?.message?.content || '';
    const latencyMs = Date.now() - startTime;

    const usage = data.usage || {};
    const promptTokens = usage.prompt_tokens || Math.ceil(params.userPrompt.length / 4);
    const completionTokens = usage.completion_tokens || Math.ceil(content.length / 4);

    return {
      content,
      model,
      provider: this.providerName,
      promptTokens,
      completionTokens,
      totalTokens: promptTokens + completionTokens,
      latencyMs,
    };
  }

  async embed(texts: string[]): Promise<{
    embeddings: number[][];
    dimensions: number;
    tokens: number;
  }> {
    if (!this.isAvailable()) {
      throw new Error(`${this.providerName.toUpperCase()} is not available for embeddings.`);
    }

    const model = 'text-embedding-3-small';
    const url = `${this.apiBase}/embeddings`;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (this.apiKey) {
      headers['Authorization'] = `Bearer ${this.apiKey}`;
    }

    const res = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        input: texts,
        model,
      }),
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`${this.providerName.toUpperCase()} Embedding Error: ${errorText}`);
    }

    const data = await res.json();
    const embeddings: number[][] = (data.data || []).map(
      (item: { embedding: number[] }) => item.embedding
    );

    return {
      embeddings,
      dimensions: embeddings[0]?.length || 1536,
      tokens: data.usage?.total_tokens || 0,
    };
  }
}

