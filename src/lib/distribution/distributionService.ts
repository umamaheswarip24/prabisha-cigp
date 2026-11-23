/**
 * Prabisha Content Intelligence & Growth Platform (PCIGP)
 * Calendar & Distribution Service
 * Aligned with PRD Requirements PUB-01, PUB-02 & Section 11 State Machine
 */

import { prisma } from '@/lib/db/prisma';
import { UTMBuilder } from './utmBuilder';

export interface ScheduleAssetParams {
  assetId: string;
  scheduledDate: Date;
  userId: string;
  userRole: string;
}

export interface PublishAssetParams {
  assetId: string;
  userId: string;
  userRole: string;
  externalPostUrl?: string;
}

export class DistributionService {
  /**
   * Schedules an approved content asset for publication (PRD PUB-01, Section 11)
   */
  public static async scheduleAsset(params: ScheduleAssetParams) {
    const asset = await prisma.contentAsset.findUnique({
      where: { id: params.assetId },
      include: {
        campaign: true,
        versions: { orderBy: { versionNumber: 'desc' }, take: 1 },
      },
    });

    if (!asset) {
      throw new Error(`Asset not found: ${params.assetId}`);
    }

    // STRICT STATE MACHINE GUARD (PRD Section 11):
    // Only APPROVED assets can be scheduled
    if (asset.status !== 'APPROVED' && asset.status !== 'SCHEDULED') {
      throw new Error(
        `Invalid State Transition: Cannot schedule asset in status "${asset.status}". Asset must be APPROVED by reviewer first.`
      );
    }

    const latestVersion = asset.versions[0];
    if (!latestVersion) {
      throw new Error('Asset has no content version records to schedule.');
    }

    // Update asset status and schedule date
    const updatedAsset = await prisma.contentAsset.update({
      where: { id: asset.id },
      data: {
        status: 'SCHEDULED',
        scheduledDate: params.scheduledDate,
      },
    });

    // Create or update Publication record
    const publication = await prisma.publication.create({
      data: {
        assetId: asset.id,
        versionId: latestVersion.id,
        channel: asset.channel,
        scheduledAt: params.scheduledDate,
        status: 'SCHEDULED',
      },
    });

    // Record Audit Event
    await prisma.auditEvent.create({
      data: {
        workspaceId: asset.campaign.workspaceId,
        actorId: params.userId,
        actorRole: params.userRole,
        action: 'CONTENT_SCHEDULED',
        entityType: 'ContentAsset',
        entityId: asset.id,
        beforeSnapshot: JSON.stringify({ status: asset.status, scheduledDate: asset.scheduledDate }),
        afterSnapshot: JSON.stringify({ status: 'SCHEDULED', scheduledDate: params.scheduledDate }),
      },
    });

    return {
      success: true,
      asset: updatedAsset,
      publication,
    };
  }

  /**
   * Confirms publication of an approved/scheduled asset and generates copy-ready package (PRD PUB-02)
   */
  public static async publishAsset(params: PublishAssetParams) {
    const asset = await prisma.contentAsset.findUnique({
      where: { id: params.assetId },
      include: {
        campaign: true,
        versions: { orderBy: { versionNumber: 'desc' }, take: 1 },
      },
    });

    if (!asset) {
      throw new Error(`Asset not found: ${params.assetId}`);
    }

    // STRICT STATE MACHINE GUARD (PRD Section 11):
    // Only APPROVED or SCHEDULED assets can be published
    if (asset.status !== 'APPROVED' && asset.status !== 'SCHEDULED') {
      throw new Error(
        `Invalid State Transition: Cannot publish asset in status "${asset.status}". Asset must be in APPROVED or SCHEDULED state.`
      );
    }

    const latestVersion = asset.versions[0];
    if (!latestVersion) {
      throw new Error('Asset has no content version records to publish.');
    }

    // Build tracking URL with UTM parameters
    const utmResult = UTMBuilder.buildTrackingUrl(
      asset.targetCtaUrl || 'https://prabisha.com',
      {
        source: asset.channel.toLowerCase(),
        medium: 'organic_content',
        campaign: asset.campaign.name,
      }
    );

    // Build Copy-Ready Distribution Package
    const exportPackage = this.buildCopyReadyPackage({
      channel: asset.channel,
      headline: latestVersion.headline || asset.campaign.name,
      body: latestVersion.body,
      cta: latestVersion.callToAction || asset.campaign.targetCta,
      trackingUrl: utmResult.finalUrl,
      market: asset.campaign.market,
    });

    // Transition state to PUBLISHED
    const publishedAt = new Date();
    const updatedAsset = await prisma.contentAsset.update({
      where: { id: asset.id },
      data: {
        status: 'PUBLISHED',
        publishedAt,
        publishedBy: params.userId,
      },
    });

    // Record Publication Entry
    const publication = await prisma.publication.create({
      data: {
        assetId: asset.id,
        versionId: latestVersion.id,
        channel: asset.channel,
        publishedAt,
        externalId: params.externalPostUrl,
        status: 'PUBLISHED',
        exportPackage,
      },
    });

    // Record Audit Event
    await prisma.auditEvent.create({
      data: {
        workspaceId: asset.campaign.workspaceId,
        actorId: params.userId,
        actorRole: params.userRole,
        action: 'CONTENT_PUBLISHED',
        entityType: 'ContentAsset',
        entityId: asset.id,
        beforeSnapshot: JSON.stringify({ status: asset.status }),
        afterSnapshot: JSON.stringify({ status: 'PUBLISHED', publishedAt }),
      },
    });

    return {
      success: true,
      asset: updatedAsset,
      publication,
      exportPackage,
    };
  }

  /**
   * Assembles formatted, copy-ready text package with embedded UTM tracking & disclaimers
   */
  public static buildCopyReadyPackage(params: {
    channel: string;
    headline: string;
    body: string;
    cta: string;
    trackingUrl: string;
    market: string;
  }): string {
    const parts: string[] = [];

    parts.push(`=== ${params.channel.toUpperCase()} COPY-READY ASSET ===`);
    parts.push(`Headline: ${params.headline}`);
    parts.push('');
    parts.push(params.body);
    parts.push('');
    parts.push(`👉 Next Step: ${params.cta}`);
    parts.push(`Link: ${params.trackingUrl}`);

    if (params.market === 'UK') {
      parts.push('');
      parts.push('--- Regulatory Notice ---');
      parts.push('Prabisha Consulting Ltd. Compliant under UK ASA/CAP rules and ICO PECR direct marketing standards.');
    } else if (params.market === 'INDIA') {
      parts.push('');
      parts.push('--- Statutory Notice ---');
      parts.push('Prabisha Consulting. Information processed in accordance with ASCI standards and DPDP Act.');
    }

    return parts.join('\n');
  }
}
