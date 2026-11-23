/**
 * Prabisha Content Intelligence & Growth Platform (PCIGP)
 * Central AI Gateway Engine
 * Enforces Model-Agnostic Routing, Grounding, Validation, and Telemetry
 */

import { TaskRouter } from './router';
import { IAIProviderAdapter, GatewayRequest, GatewayResponse } from './types';
import { MockAIAdapter } from './adapters/mock';
import { GeminiAIAdapter } from './adapters/gemini';
import { OpenAICompatibleAdapter } from './adapters/openai';
import { AIUsageLedger } from './ledger';

export class AIGateway {
  private static instance: AIGateway;
  private router: TaskRouter;
  private adapters: Map<string, IAIProviderAdapter>;

  private constructor() {
    this.router = new TaskRouter();
    this.adapters = new Map();

    // Register built-in adapters
    this.adapters.set('mock', new MockAIAdapter());
    this.adapters.set('gemini', new GeminiAIAdapter());
    this.adapters.set('openai', new OpenAICompatibleAdapter(false));
    this.adapters.set('litellm', new OpenAICompatibleAdapter(true));
  }

  public static getInstance(): AIGateway {
    if (!AIGateway.instance) {
      AIGateway.instance = new AIGateway();
    }
    return AIGateway.instance;
  }

  public getRouter(): TaskRouter {
    return this.router;
  }

  /**
   * Primary entry point for AI tasks across the platform
   */
  public async execute<T = unknown>(
    request: GatewayRequest<T>,
    workspaceId = 'prabisha-hq'
  ): Promise<GatewayResponse<T>> {
    const policy = this.router.getPolicy(request.task);
    const warnings: string[] = [];

    // Compile grounded system prompt including Brand, Claims, and ICP constraints
    const systemPrompt = this.buildGroundedSystemPrompt(request);

    // Resolve provider: check environment override or primary policy
    const defaultEnvProvider = process.env.AI_DEFAULT_PROVIDER || 'mock';
    let targetProviderName = defaultEnvProvider !== 'mock' ? defaultEnvProvider : policy.primaryProvider;
    let adapter = this.adapters.get(targetProviderName);

    // Fallback if target provider is unconfigured or unavailable
    if (!adapter || !adapter.isAvailable()) {
      warnings.push(`Primary provider [${targetProviderName}] not available. Engaging fallback [mock].`);
      targetProviderName = 'mock';
      adapter = this.adapters.get('mock')!;
    }

    const startTime = Date.now();
    try {
      const rawRes = await adapter.complete({
        systemPrompt,
        userPrompt: request.prompt,
        temperature: policy.temperature,
        maxTokens: policy.maxTokens,
        schema: request.schema,
        responseFormat: request.parseJson ? 'json' : 'text',
      });

      let parsedData: unknown = rawRes.content;
      if (request.parseJson) {
        try {
          parsedData = JSON.parse(rawRes.content);
        } catch {
          // Attempt JSON extraction from markdown code fence if present
          const jsonMatch = rawRes.content.match(/```json\n([\s\S]*?)\n```/);
          if (jsonMatch) {
            parsedData = JSON.parse(jsonMatch[1]);
          } else {
            warnings.push('Failed to parse output as valid JSON; returned raw string content.');
          }
        }
      }

      // Run optional custom schema validator
      if (request.validateOutput && parsedData) {
        const validation = request.validateOutput(parsedData);
        if (!validation.valid) {
          warnings.push(`Validation warning: ${validation.error}`);
        }
      }

      // Record to Usage & Cost Ledger
      await AIUsageLedger.record({
        workspaceId,
        task: request.task,
        provider: rawRes.provider,
        model: rawRes.model,
        latencyMs: rawRes.latencyMs,
        promptTokens: rawRes.promptTokens,
        completionTokens: rawRes.completionTokens,
        estimatedCostUsd: 0.0,
        status: 'SUCCESS',
        warnings,
      });

      return {
        success: true,
        data: parsedData as T,
        rawText: rawRes.content,
        model: rawRes.model,
        provider: rawRes.provider,
        usage: {
          promptTokens: rawRes.promptTokens,
          completionTokens: rawRes.completionTokens,
          totalTokens: rawRes.totalTokens,
          estimatedCostUsd: 0.0,
        },
        latencyMs: Date.now() - startTime,
        citations: this.extractCitations(request),
        warnings,
      };
    } catch (err: unknown) {
      // Automatic fallback to mock provider for resilience
      const errorMessage = err instanceof Error ? err.message : String(err);
      warnings.push(`Provider execution failed: ${errorMessage}. Falling back to deterministic mock.`);

      const mockAdapter = this.adapters.get('mock')!;
      const fallbackRes = await mockAdapter.complete({
        systemPrompt,
        userPrompt: request.prompt,
        temperature: policy.temperature,
        maxTokens: policy.maxTokens,
        responseFormat: request.parseJson ? 'json' : 'text',
      });

      let parsedData: unknown = fallbackRes.content;
      if (request.parseJson) {
        try {
          parsedData = JSON.parse(fallbackRes.content);
        } catch {
          // fallback
        }
      }

      await AIUsageLedger.record({
        workspaceId,
        task: request.task,
        provider: fallbackRes.provider,
        model: fallbackRes.model,
        latencyMs: fallbackRes.latencyMs,
        promptTokens: fallbackRes.promptTokens,
        completionTokens: fallbackRes.completionTokens,
        estimatedCostUsd: 0.0,
        status: 'RETRY_FALLBACK',
        warnings,
      });

      return {
        success: true,
        data: parsedData as T,
        rawText: fallbackRes.content,
        model: fallbackRes.model,
        provider: fallbackRes.provider,
        usage: {
          promptTokens: fallbackRes.promptTokens,
          completionTokens: fallbackRes.completionTokens,
          totalTokens: fallbackRes.totalTokens,
          estimatedCostUsd: 0.0,
        },
        latencyMs: Date.now() - startTime,
        citations: this.extractCitations(request),
        warnings,
      };
    }
  }

  /**
   * Compiles grounded system context from brand, catalogue, claims, and ICP
   */
  private buildGroundedSystemPrompt(request: GatewayRequest): string {
    const parts: string[] = [
      'You are the Prabisha Content Intelligence & Growth Platform (PCIGP) core engine.',
      'STRICT GROUNDING POLICY: Do NOT invent statistics, metrics, client case studies, or capabilities.',
      'All commercial representations must remain strictly factual, ethical, and compliant with UK (ASA/CAP) and India (ASCI) standards.',
    ];

    if (request.customSystemPrompt) {
      parts.push(request.customSystemPrompt);
    }

    if (request.contextRefs) {
      const { brandProfile, product, icp, approvedClaims } = request.contextRefs;

      if (brandProfile) {
        parts.push(`\n[BRAND CONTEXT]\nCompany: ${brandProfile.companyName || 'Prabisha Consulting'}`);
        if (brandProfile.brandVoice?.tone) {
          parts.push(`Approved Tone: ${brandProfile.brandVoice.tone.join(', ')}`);
        }
      }

      if (product) {
        parts.push(
          `\n[OFFER/CATALOGUE CONTEXT]\nService: ${product.name}\nCapabilities: ${(product.capabilities || []).join(', ')}\nLimitations: ${(product.limitations || []).join(', ')}\nDestination CTA: ${product.ctaDestinationUrl || ''}`
        );
      }

      if (icp) {
        parts.push(
          `\n[TARGET AUDIENCE (ICP)]\nTarget Role: ${icp.buyerRole}\nIndustry: ${icp.industry}\nKey Pain Points: ${(icp.painPoints || []).join(', ')}\nBuying Triggers: ${(icp.buyingTriggers || []).join(', ')}`
        );
      }

      if (approvedClaims && approvedClaims.length > 0) {
        parts.push('\n[APPROVED CLAIM REGISTRY (Grounding Anchor)]');
        approvedClaims.forEach((c, idx) => {
          parts.push(`${idx + 1}. "${c.exactWording}" (Risk: ${c.riskLevel})`);
        });
      }
    }

    return parts.join('\n');
  }

  private extractCitations(request: GatewayRequest): string[] {
    const citations: string[] = [];
    if (request.contextRefs?.evidence) {
      request.contextRefs.evidence.forEach((e) => {
        if (e.sourceUrlOrFile) citations.push(e.sourceUrlOrFile);
      });
    }
    return citations;
  }
}

export const aiGateway = AIGateway.getInstance();
