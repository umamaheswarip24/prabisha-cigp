/**
 * Prabisha Content Intelligence & Growth Platform (PCIGP)
 * Historical Content Importer & Semantic Knowledge Search Engine
 * Aligned with PRD Requirements BR-05 & BR-06
 */

import crypto from 'crypto';
import { prisma } from '@/lib/db/prisma';

export interface ImportContentParams {
  workspaceId: string;
  title: string;
  sourceType: 'MARKDOWN' | 'CSV' | 'URL' | 'PAST_CAMPAIGN';
  sourceUrl?: string;
  content: string;
  tags?: string[];
  metadata?: Record<string, unknown>;
}

export interface ImportResult {
  success: boolean;
  importedId?: string;
  isDuplicateImport: boolean;
  checksum: string;
  wordCount: number;
  message: string;
}

export interface SearchKnowledgeResult {
  id: string;
  title: string;
  sourceType: string;
  sourceUrl?: string | null;
  relevanceScore: number;
  excerpt: string;
  tags: string[];
  createdAt: string;
}

export class HistoricalContentImporter {
  /**
   * Generates a deterministic SHA256 checksum of raw content
   */
  public static computeChecksum(content: string): string {
    return crypto.createHash('sha256').update(content.trim()).digest('hex');
  }

  /**
   * Imports historical content or past campaigns with duplicate-import detection
   */
  public static async importDocument(params: ImportContentParams): Promise<ImportResult> {
    if (!params.content || params.content.trim().length === 0) {
      throw new Error('Content body cannot be empty.');
    }

    const checksum = this.computeChecksum(params.content);

    // Detect exact duplicate import in this workspace (BR-05)
    const existing = await prisma.historicalContent.findFirst({
      where: {
        workspaceId: params.workspaceId,
        checksum,
      },
    });

    if (existing) {
      return {
        success: false,
        importedId: existing.id,
        isDuplicateImport: true,
        checksum,
        wordCount: existing.content.split(/\s+/).length,
        message: `Duplicate import detected: identical content exists in record "${existing.title}" (${existing.id}).`,
      };
    }

    const doc = await prisma.historicalContent.create({
      data: {
        workspaceId: params.workspaceId,
        title: params.title,
        sourceType: params.sourceType,
        sourceUrl: params.sourceUrl,
        content: params.content,
        tagsJson: JSON.stringify(params.tags || []),
        metadataJson: JSON.stringify(params.metadata || {}),
        checksum,
      },
    });

    // Record audit event
    await prisma.auditEvent.create({
      data: {
        workspaceId: params.workspaceId,
        actorId: 'user-mktg-lead',
        actorRole: 'MARKETING_LEAD',
        action: 'HISTORICAL_CONTENT_IMPORTED',
        entityType: 'HistoricalContent',
        entityId: doc.id,
        afterSnapshot: JSON.stringify({ title: doc.title, sourceType: doc.sourceType }),
      },
    });

    return {
      success: true,
      importedId: doc.id,
      isDuplicateImport: false,
      checksum,
      wordCount: doc.content.split(/\s+/).length,
      message: `Successfully imported "${doc.title}".`,
    };
  }

  /**
   * Keyword & relevance search across approved knowledge and historical assets (BR-06)
   */
  public static async searchKnowledge(
    query: string,
    workspaceId = 'prabisha-hq',
    limit = 10
  ): Promise<SearchKnowledgeResult[]> {
    const rawTokens = query.toLowerCase().split(/\s+/).filter((w) => w.length > 2);
    if (rawTokens.length === 0) return [];

    const documents = await prisma.historicalContent.findMany({
      where: { workspaceId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    const results: SearchKnowledgeResult[] = [];

    for (const doc of documents) {
      const lowerContent = doc.content.toLowerCase();
      const lowerTitle = doc.title.toLowerCase();

      let matchCount = 0;
      for (const token of rawTokens) {
        if (lowerTitle.includes(token)) matchCount += 3; // Title match weighted higher
        if (lowerContent.includes(token)) matchCount += 1;
      }

      if (matchCount > 0) {
        // Find best excerpt window
        let bestIndex = 0;
        for (const token of rawTokens) {
          const idx = lowerContent.indexOf(token);
          if (idx !== -1) {
            bestIndex = idx;
            break;
          }
        }

        const start = Math.max(0, bestIndex - 60);
        const excerpt =
          (start > 0 ? '...' : '') +
          doc.content.slice(start, start + 200).trim() +
          (start + 200 < doc.content.length ? '...' : '');

        results.push({
          id: doc.id,
          title: doc.title,
          sourceType: doc.sourceType,
          sourceUrl: doc.sourceUrl,
          relevanceScore: Math.min(100, matchCount * 15),
          excerpt,
          tags: JSON.parse(doc.tagsJson || '[]'),
          createdAt: doc.createdAt.toISOString(),
        });
      }
    }

    return results.sort((a, b) => b.relevanceScore - a.relevanceScore).slice(0, limit);
  }
}

