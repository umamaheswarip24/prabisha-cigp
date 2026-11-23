/**
 * Prabisha Content Intelligence & Growth Platform (PCIGP)
 * AI Usage, Cost & Telemetry Ledger
 * Aligned with PRD Section 7.2
 */

import { prisma } from '@/lib/db/prisma';

export interface RecordUsageParams {
  workspaceId: string;
  task: string;
  provider: string;
  model: string;
  latencyMs: number;
  promptTokens: number;
  completionTokens: number;
  estimatedCostUsd: number;
  status: 'SUCCESS' | 'FAILED' | 'RETRY_FALLBACK';
  warnings?: string[];
}

export class AIUsageLedger {
  /**
   * Persists an AI request invocation into the audit/usage ledger
   */
  public static async record(params: RecordUsageParams): Promise<void> {
    try {
      await prisma.aIRequestLog.create({
        data: {
          workspaceId: params.workspaceId,
          task: params.task,
          provider: params.provider,
          model: params.model,
          latencyMs: params.latencyMs,
          promptTokens: params.promptTokens,
          completionTokens: params.completionTokens,
          estimatedCostUsd: params.estimatedCostUsd,
          status: params.status,
          warningsJson: JSON.stringify(params.warnings || []),
        },
      });
    } catch (err) {
      // Non-blocking log failure
      console.error('[AIUsageLedger] Failed to write usage log:', err);
    }
  }

  /**
   * Aggregates usage and spend for a given workspace
   */
  public static async getWorkspaceSummary(workspaceId: string): Promise<{
    totalRequests: number;
    totalTokens: number;
    totalCostUsd: number;
    averageLatencyMs: number;
  }> {
    const logs = await prisma.aIRequestLog.findMany({
      where: { workspaceId },
    });

    if (logs.length === 0) {
      return { totalRequests: 0, totalTokens: 0, totalCostUsd: 0, averageLatencyMs: 0 };
    }

    const totalRequests = logs.length;
    let totalTokens = 0;
    let totalCostUsd = 0;
    let totalLatency = 0;

    for (const log of logs) {
      totalTokens += log.promptTokens + log.completionTokens;
      totalCostUsd += log.estimatedCostUsd;
      totalLatency += log.latencyMs;
    }

    return {
      totalRequests,
      totalTokens,
      totalCostUsd: Number(totalCostUsd.toFixed(4)),
      averageLatencyMs: Math.round(totalLatency / totalRequests),
    };
  }
}

