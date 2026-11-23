import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(req: Request, { params }: RouteParams) {
  try {
    const { id: campaignId } = await params;
    const body = await req.json().catch(() => ({}));
    const newName = body.name;

    const source = await prisma.campaign.findUnique({
      where: { id: campaignId },
    });

    if (!source) {
      return NextResponse.json({ success: false, error: 'Campaign not found' }, { status: 404 });
    }

    const cloned = await prisma.campaign.create({
      data: {
        workspaceId: source.workspaceId,
        name: newName || `${source.name} (Copy)`,
        objective: source.objective,
        icpId: source.icpId,
        market: source.market,
        locale: source.locale,
        channelsJson: source.channelsJson,
        funnelStage: source.funnelStage,
        offerProductId: source.offerProductId,
        tone: source.tone,
        targetCta: source.targetCta,
        assetVolume: source.assetVolume,
        theme: source.theme,
        rationale: source.rationale,
        successMetrics: source.successMetrics,
        scheduleStart: new Date(),
        scheduleEnd: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        ownerId: 'user-mktg-lead',
        status: 'DRAFT',
      },
    });

    await prisma.auditEvent.create({
      data: {
        workspaceId: source.workspaceId,
        actorId: 'user-mktg-lead',
        actorRole: 'MARKETING_LEAD',
        action: 'CAMPAIGN_CLONED',
        entityType: 'Campaign',
        entityId: cloned.id,
        beforeSnapshot: JSON.stringify({ sourceId: source.id }),
        afterSnapshot: JSON.stringify({ clonedId: cloned.id, name: cloned.name }),
      },
    });

    return NextResponse.json({ success: true, campaign: cloned });
  } catch (error) {
    console.error('Error cloning campaign:', error);
    return NextResponse.json({ success: false, error: 'Failed to clone campaign' }, { status: 500 });
  }
}

