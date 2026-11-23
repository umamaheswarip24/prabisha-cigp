/**
 * Prabisha Content Intelligence & Growth Platform (PCIGP)
 * Performance & Production CSV Export Engine
 * Aligned with PRD Requirements PUB-05 & PUB-06
 */

import { prisma } from '@/lib/db/prisma';

export interface PerformanceExportRow {
  campaignName: string;
  market: string;
  funnelStage: string;
  assetId: string;
  channel: string;
  format: string;
  status: string;
  versionNumber: number;
  headline: string;
  wordCount: number;
  scheduledDate: string;
  publishedAt: string;
  targetCtaUrl: string;
  impressions: string | number; // "UNAVAILABLE" if not synced per PUB-05
  clicks: string | number;
  qualifiedLeads: string | number;
  pipelineValueUsd: string | number;
}

export class PerformanceExportEngine {
  /**
   * Escapes a string cell value according to RFC-4180
   */
  public static escapeCsvCell(val: unknown): string {
    if (val === null || val === undefined) return '';
    const str = String(val);
    if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  }

  /**
   * Generates a complete RFC-4180 compliant CSV string for workspace campaign assets
   */
  public static async generateCsvExport(
    workspaceId = 'prabisha-hq',
    actorId = 'user-mktg-lead',
    actorRole = 'MARKETING_LEAD'
  ): Promise<string> {
    const assets = await prisma.contentAsset.findMany({
      where: {
        campaign: { workspaceId },
      },
      include: {
        campaign: true,
        versions: { orderBy: { versionNumber: 'desc' }, take: 1 },
        metricSnapshots: { orderBy: { createdAt: 'desc' }, take: 1 },
      },
      orderBy: { createdAt: 'desc' },
    });

    const headers = [
      'Campaign Name',
      'Market Jurisdiction',
      'Funnel Stage',
      'Asset ID',
      'Channel',
      'Format',
      'Status',
      'Version',
      'Headline',
      'Word Count',
      'Scheduled Date',
      'Published Date',
      'CTA Destination URL',
      'Impressions (GA4/Platform)',
      'Clicks',
      'Qualified Leads (CRM)',
      'Pipeline Value (USD)',
    ];

    const rows: string[] = [headers.map(this.escapeCsvCell).join(',')];

    for (const asset of assets) {
      const version = asset.versions[0];
      const metrics = asset.metricSnapshots[0];
      const metadata = version?.metadataJson ? JSON.parse(version.metadataJson) : {};

      // PRD Requirement PUB-05: Unavailable data shown as "UNAVAILABLE", not zero
      const row: (string | number)[] = [
        asset.campaign.name,
        asset.campaign.market,
        asset.campaign.funnelStage,
        asset.id,
        asset.channel,
        asset.format,
        asset.status,
        version?.versionNumber || 1,
        version?.headline || asset.campaign.name,
        metadata.wordCount || (version?.body ? version.body.split(/\s+/).length : 0),
        asset.scheduledDate ? asset.scheduledDate.toISOString().split('T')[0] : 'UNSCHEDULED',
        asset.publishedAt ? asset.publishedAt.toISOString().split('T')[0] : 'UNPUBLISHED',
        asset.targetCtaUrl,
        metrics ? metrics.impressions : 'UNAVAILABLE',
        metrics ? metrics.clicks : 'UNAVAILABLE',
        metrics ? metrics.qualifiedLeads : 'UNAVAILABLE',
        metrics ? `$${metrics.pipelineValueUsd.toFixed(2)}` : 'UNAVAILABLE',
      ];

      rows.push(row.map(this.escapeCsvCell).join(','));
    }

    // Record Audit Event for Export (PRD PUB-06)
    await prisma.auditEvent.create({
      data: {
        workspaceId,
        actorId,
        actorRole,
        action: 'PERFORMANCE_CSV_EXPORTED',
        entityType: 'Workspace',
        entityId: workspaceId,
        afterSnapshot: JSON.stringify({ exportedAssetCount: assets.length }),
      },
    });

    return rows.join('\r\n');
  }
}
