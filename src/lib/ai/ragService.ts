/**
 * Prabisha Content Intelligence & Growth Platform (PCIGP)
 * Grounded RAG Retrieval Service
 * Aligned with PRD Requirements GEN-04 & GEN-05
 */

import { prisma } from '@/lib/db/prisma';
import { Claim, EvidenceRecord } from '@/types';

export interface GroundedContextPack {
  workspaceId: string;
  matchedClaimIds: string[];
  approvedClaims: Claim[];
  evidenceRecords: EvidenceRecord[];
  historicalExcerpts: Array<{
    id: string;
    title: string;
    sourceType: string;
    excerpt: string;
  }>;
  groundingWarnings: string[];
}

export class RAGRetrievalService {
  /**
   * Retrieves relevant claims, evidence, and historical documents for a target campaign prompt
   */
  public static async assembleContextPack(
    workspaceId: string,
    topicQuery: string,
    market: 'UK' | 'INDIA' = 'UK'
  ): Promise<GroundedContextPack> {
    const warnings: string[] = [];
    const queryTokens = topicQuery.toLowerCase().split(/\s+/).filter((w) => w.length > 2);

    // 1. Fetch Approved Claims for this workspace
    const allClaims = await prisma.claim.findMany({
      where: { workspaceId, status: 'APPROVED' },
    });

    // Score claims by keyword overlap
    const scoredClaims = allClaims.map((claim) => {
      const text = claim.exactWording.toLowerCase();
      let matchCount = 0;
      queryTokens.forEach((t) => {
        if (text.includes(t)) matchCount++;
      });
      return { claim, matchCount };
    });

    // Take top matching claims or top approved claims
    const relevantClaims = scoredClaims
      .sort((a, b) => b.matchCount - a.matchCount)
      .slice(0, 5)
      .map((item) => ({
        id: item.claim.id,
        workspaceId: item.claim.workspaceId,
        exactWording: item.claim.exactWording,
        evidenceIds: JSON.parse(item.claim.evidenceIdsJson || '[]'),
        allowedContexts: JSON.parse(item.claim.allowedContextsJson || '[]'),
        riskLevel: item.claim.riskLevel as 'LOW' | 'MEDIUM' | 'HIGH',
        status: 'APPROVED' as const,
        reviewer: item.claim.reviewer,
        reviewDate: item.claim.reviewDate.toISOString(),
      }));

    if (relevantClaims.length === 0) {
      warnings.push('No matching approved claims found in registry for this topic. Output will lack numerical proof.');
    }

    // 2. Fetch Supporting Evidence Records
    const evidenceIdsToFetch = Array.from(
      new Set(relevantClaims.flatMap((c) => c.evidenceIds))
    );

    const evidenceList = await prisma.evidenceRecord.findMany({
      where: {
        workspaceId,
        id: { in: evidenceIdsToFetch.length > 0 ? evidenceIdsToFetch : undefined },
      },
      take: 5,
    });

    const domainEvidence: EvidenceRecord[] = evidenceList.map((e) => ({
      id: e.id,
      workspaceId: e.workspaceId,
      title: e.title,
      scope: e.scope as any,
      sourceUrlOrFile: e.sourceUrlOrFile,
      verifiedData: e.verifiedData,
      permissionStatus: e.permissionStatus as any,
      owner: e.owner,
      verifiedAt: e.verifiedAt.toISOString(),
    }));

    // 3. Fetch Historical Document Excerpts
    const historicalDocs = await prisma.historicalContent.findMany({
      where: { workspaceId },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    const historicalExcerpts = historicalDocs.map((doc) => ({
      id: doc.id,
      title: doc.title,
      sourceType: doc.sourceType,
      excerpt: doc.content.slice(0, 180).trim() + '...',
    }));

    return {
      workspaceId,
      matchedClaimIds: relevantClaims.map((c) => c.id),
      approvedClaims: relevantClaims,
      evidenceRecords: domainEvidence,
      historicalExcerpts,
      groundingWarnings: warnings,
    };
  }

  /**
   * Helper to retrieve context directly for a campaign ID
   */
  public static async retrieveContextForCampaign(
    campaignId: string
  ): Promise<GroundedContextPack> {
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
    });
    const workspaceId = campaign ? campaign.workspaceId : 'prabisha-hq';
    const query = campaign ? `${campaign.name} ${campaign.objective || ''}` : 'AI automation';
    const market = campaign && campaign.market === 'INDIA' ? 'INDIA' : 'UK';
    return this.assembleContextPack(workspaceId, query, market);
  }
}

export const ragService = RAGRetrievalService;


