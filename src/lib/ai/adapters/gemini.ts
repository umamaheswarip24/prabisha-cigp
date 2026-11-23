/**
 * Prabisha Content Intelligence & Growth Platform (PCIGP)
 * Google Gemini Provider Adapter (Gemini 1.5 Pro, Flash, Embedding)
 * Communicates directly with Google Gemini REST API
 */

import { BaseAIAdapter } from './base';
import { AIProviderCallParams, RawAIResponse } from '../types';

export class GeminiAIAdapter extends BaseAIAdapter {
  providerName = 'gemini';
  private apiKey: string;
  private apiBase: string;

  constructor(apiKey?: string, apiBase = 'https://generativelanguage.googleapis.com/v1beta') {
    super();
    this.apiKey = apiKey || process.env.GEMINI_API_KEY || '';
    this.apiBase = apiBase;
  }

  isAvailable(): boolean {
    return Boolean(this.apiKey && this.apiKey.length > 5);
  }

  async complete(params: AIProviderCallParams): Promise<RawAIResponse> {
    if (!this.isAvailable()) {
      throw new Error('Gemini API key is not configured.');
    }

    const startTime = Date.now();
    const model = 'gemini-1.5-flash';
    const url = `${this.apiBase}/models/${model}:generateContent?key=${this.apiKey}`;

    const requestBody: Record<string, unknown> = {
      contents: [
        {
          role: 'user',
          parts: [{ text: `${params.systemPrompt}\n\nTask: ${params.userPrompt}` }],
        },
      ],
      generationConfig: {
        temperature: params.temperature ?? 0.7,
        maxOutputTokens: params.maxTokens ?? 2048,
        responseMimeType: params.responseFormat === 'json' ? 'application/json' : 'text/plain',
      },
    };

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Gemini API Error [${res.status}]: ${errorText}`);
    }

    const data = await res.json();
    const candidate = data.candidates?.[0];
    const content = candidate?.content?.parts?.[0]?.text || '';
    const latencyMs = Date.now() - startTime;

    const usageMeta = data.usageMetadata || {};
    const promptTokens = usageMeta.promptTokenCount || Math.ceil(params.userPrompt.length / 4);
    const completionTokens = usageMeta.candidatesTokenCount || Math.ceil(content.length / 4);

    return {
      content,
      model,
      provider: 'gemini',
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
      throw new Error('Gemini API key is not configured for embeddings.');
    }

    const model = 'text-embedding-004';
    const url = `${this.apiBase}/models/${model}:batchEmbedContents?key=${this.apiKey}`;

    const requests = texts.map((t) => ({
      model: `models/${model}`,
      content: { parts: [{ text: t }] },
    }));

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ requests }),
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Gemini Embedding Error [${res.status}]: ${errorText}`);
    }

    const data = await res.json();
    const embeddings: number[][] = (data.embeddings || []).map(
      (e: { values: number[] }) => e.values
    );

    const tokens = texts.reduce((acc, t) => acc + Math.ceil(t.length / 4), 0);
    return {
      embeddings,
      dimensions: embeddings[0]?.length || 768,
      tokens,
    };
  }
}

