import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { aiGateway } from '@/lib/ai/gateway';
import { ComplianceEngine } from '@/lib/compliance/engine';
import { SEOAuditEngine } from '@/lib/seo/auditEngine';
import { DuplicateDetector } from '@/lib/content/duplicateDetector';
import { AssetChannel, AssetFormat } from '@/types';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(req: Request, { params }: RouteParams) {
  try {
    const { id: campaignId } = await params;
    const body = await req.json().catch(() => ({}));
    const requestedChannels: AssetChannel[] = body.channels || ['LINKEDIN', 'BLOG', 'EMAIL'];

    // 1. Fetch Campaign and linked ICP
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
      include: { icp: true, workspace: true },
    });

    if (!campaign) {
      return NextResponse.json({ success: false, error: 'Campaign not found' }, { status: 404 });
    }

    // 2. Fetch Grounding Knowledge
    const brandProfile = await prisma.brandProfile.findFirst({
      where: { workspaceId: campaign.workspaceId },
    });

    const product = await prisma.productService.findUnique({
      where: { id: campaign.offerProductId },
    });

    const approvedClaims = await prisma.claim.findMany({
      where: { workspaceId: campaign.workspaceId, status: 'APPROVED' },
    });

    const evidenceRecords = await prisma.evidenceRecord.findMany({
      where: { workspaceId: campaign.workspaceId },
    });

    const complianceEngine = new ComplianceEngine();
    const generatedAssets = [];

    // 3. Generate channel variants
    for (const channel of requestedChannels) {
      let format: AssetFormat = 'SOCIAL_POST';
      let promptLength = 'under 250 words';

      if (channel === 'BLOG') {
        format = 'LONG_FORM_ARTICLE';
        promptLength = '500-800 words with H2/H3 headings and actionable insights';
      } else if (channel === 'EMAIL') {
        format = 'EMAIL_NEWSLETTER';
        promptLength = 'under 300 words with clear value proposition and single call to action';
      }

      const prompt = `Generate a high-converting, strictly evidence-backed marketing asset for the ${channel} channel.
Format: ${format} (${promptLength}).
Campaign Name: "${campaign.name}"
Campaign Objective: "${campaign.objective}"
Market Jurisdiction: ${campaign.market} (Locale: ${campaign.locale})
Tone: ${campaign.tone}
Target Call to Action: "${campaign.targetCta}"

Constraints:
1. ONLY make claims that are supported by the provided Approved Claims list.
2. Address the specific buyer role (${campaign.icp.buyerRole}) and their documented pain points.
3. Include an engaging hook, credible substantiation, and clear next steps.`;

      const aiResponse = await aiGateway.execute<{
        headline: string;
        body: string;
        callToAction: string;
        citations: string[];
      }>(
        {
          task: 'CONTENT_DRAFT',
          prompt,
          parseJson: true,
          contextRefs: {
            brandProfile: brandProfile
              ? {
                  companyName: brandProfile.companyName,
                  brandVoice: JSON.parse(brandProfile.brandVoiceJson),
                }
              : undefined,
            product: product
              ? {
                  name: product.name,
                  capabilities: JSON.parse(product.capabilitiesJson),
                  limitations: JSON.parse(product.limitationsJson),
                  ctaDestinationUrl: product.ctaDestinationUrl,
                }
              : undefined,
            icp: {
              buyerRole: campaign.icp.buyerRole,
              industry: campaign.icp.industry,
              painPoints: JSON.parse(campaign.icp.painPointsJson),
              buyingTriggers: JSON.parse(campaign.icp.buyingTriggersJson),
            },
            approvedClaims: approvedClaims.map((c) => ({
              id: c.id,
              workspaceId: c.workspaceId,
              exactWording: c.exactWording,
              evidenceIds: JSON.parse(c.evidenceIdsJson),
              allowedContexts: JSON.parse(c.allowedContextsJson),
              riskLevel: c.riskLevel as 'LOW' | 'MEDIUM' | 'HIGH',
              status: 'APPROVED',
              reviewer: c.reviewer,
              reviewDate: c.reviewDate.toISOString(),
            })),
            evidence: evidenceRecords.map((e) => ({
              id: e.id,
              workspaceId: e.workspaceId,
              title: e.title,
              scope: e.scope as any,
              sourceUrlOrFile: e.sourceUrlOrFile,
              verifiedData: e.verifiedData,
              permissionStatus: e.permissionStatus as any,
              owner: e.owner,
              verifiedAt: e.verifiedAt.toISOString(),
            })),
            market: campaign.market as any,
          },
        },
        campaign.workspaceId
      );

      const contentBody =
        typeof aiResponse.data === 'object' && aiResponse.data !== null && 'body' in aiResponse.data
          ? (aiResponse.data as any).body
          : aiResponse.rawText;

      const headline =
        typeof aiResponse.data === 'object' && aiResponse.data !== null && 'headline' in aiResponse.data
          ? (aiResponse.data as any).headline
          : `${campaign.name} - ${channel}`;

      const cta =
        typeof aiResponse.data === 'object' && aiResponse.data !== null && 'callToAction' in aiResponse.data
          ? (aiResponse.data as any).callToAction
          : campaign.targetCta;

      // 4. Automated Compliance, SEO & Duplicate Evaluation
      const complianceReport = complianceEngine.evaluateContent(
        contentBody,
        campaign.market as any,
        approvedClaims as any
      );

      const seoReport = SEOAuditEngine.auditContent({
        headline,
        body: contentBody,
        targetKeyword: campaign.targetKeyword || 'b2b marketing automation',
        searchIntent: campaign.searchIntent || 'INFORMATIONAL_COMMERCIAL',
      });

      // Check duplicates against past assets
      const priorVersions = await prisma.contentVersion.findMany({
        select: { id: true, headline: true, body: true },
        take: 30,
      });
      const duplicateReport = DuplicateDetector.checkDuplicates(
        contentBody,
        priorVersions.map((v) => ({
          id: v.id,
          title: v.headline || 'Prior Asset',
          content: v.body,
        }))
      );

      // Determine initial state based on compliance and duplicate check
      let initialStatus = 'NEEDS_REVIEW';
      if (complianceReport.blocksPublication || duplicateReport.recommendation === 'DOCUMENTED_EXCEPTION_REQUIRED') {
        initialStatus = 'CHANGES_REQUESTED';
      }

      // 5. Store Asset & Version in Database
      const asset = await prisma.contentAsset.create({
        data: {
          campaignId: campaign.id,
          channel,
          format,
          status: initialStatus,
          targetCtaUrl: product?.ctaDestinationUrl || 'https://prabisha.com',
          utmParamsJson: JSON.stringify({
            source: channel.toLowerCase(),
            medium: 'organic_content',
            campaign: campaign.name.toLowerCase().replace(/[^a-z0-9]/g, '_'),
          }),
        },
      });

      const version = await prisma.contentVersion.create({
        data: {
          assetId: asset.id,
          versionNumber: 1,
          headline,
          body: contentBody,
          callToAction: cta,
          metadataJson: JSON.stringify({
            wordCount: contentBody.split(/\s+/).length,
            complianceReport,
            seoReport,
            duplicateReport,
          }),
          groundingJson: JSON.stringify({
            retrievedEvidenceIds: evidenceRecords.map((e) => e.id),
            referencedClaimIds: approvedClaims.map((c) => c.id),
            unverifiedClaims: complianceReport.unverifiedClaims,
          }),
          modelMetadataJson: JSON.stringify({
            provider: aiResponse.provider,
            model: aiResponse.model,
            tokensUsed: aiResponse.usage.totalTokens,
            latencyMs: aiResponse.latencyMs,
          }),
          createdBy: 'AI_GATEWAY',
        },
      });

      generatedAssets.push({
        assetId: asset.id,
        versionId: version.id,
        channel,
        format,
        headline,
        body: contentBody,
        status: initialStatus,
        complianceReport,
        seoReport,
        duplicateReport,
        model: aiResponse.model,
        provider: aiResponse.provider,
      });
    }

    // 6. Fetch fully hydrated campaign with versions for immediate UI rendering
    const updatedCampaign = await prisma.campaign.findUnique({
      where: { id: campaign.id },
      include: {
        icp: true,
        assets: {
          include: {
            versions: {
              orderBy: { versionNumber: 'desc' },
              take: 1,
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    return NextResponse.json({
      success: true,
      campaignId: campaign.id,
      generatedAssets,
      campaign: updatedCampaign,
      pack: {
        assets: updatedCampaign?.assets || [],
      },
    });
  } catch (error) {
    console.error('Error generating campaign content:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Generation failed' },
      { status: 500 }
    );
  }
}

