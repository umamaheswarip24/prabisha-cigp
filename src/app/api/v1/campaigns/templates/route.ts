import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export async function GET() {
  try {
    const templates = await prisma.campaign.findMany({
      where: { isTemplate: true },
      include: { icp: true },
      orderBy: { updatedAt: 'desc' },
    });

    return NextResponse.json({ success: true, templates });
  } catch (error) {
    console.error('Error fetching campaign templates:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch templates' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      name,
      templateName,
      objective,
      icpId,
      market = 'UK',
      locale = 'en-GB',
      channels = ['LINKEDIN', 'BLOG'],
      funnelStage = 'MID_CONSIDERATION',
      offerProductId,
      tone = 'consultative, authoritative, evidence-backed',
      targetCta,
      assetVolume = 3,
      theme,
      rationale,
      successMetrics,
      workspaceId = 'prabisha-hq',
      ownerId = 'user-mktg-lead',
    } = body;

    const template = await prisma.campaign.create({
      data: {
        name,
        templateName: templateName || name,
        isTemplate: true,
        objective,
        icpId,
        market,
        locale,
        channelsJson: JSON.stringify(channels),
        funnelStage,
        offerProductId,
        tone,
        targetCta,
        assetVolume,
        theme,
        rationale,
        successMetrics,
        scheduleStart: new Date(),
        scheduleEnd: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        workspaceId,
        ownerId,
        status: 'DRAFT',
      },
    });

    await prisma.auditEvent.create({
      data: {
        workspaceId,
        actorId: ownerId,
        actorRole: 'MARKETING_LEAD',
        action: 'CAMPAIGN_TEMPLATE_SAVED',
        entityType: 'Campaign',
        entityId: template.id,
        afterSnapshot: JSON.stringify({ name, templateName }),
      },
    });

    return NextResponse.json({ success: true, template });
  } catch (error) {
    console.error('Error saving campaign template:', error);
    return NextResponse.json({ success: false, error: 'Failed to save template' }, { status: 500 });
  }
}

