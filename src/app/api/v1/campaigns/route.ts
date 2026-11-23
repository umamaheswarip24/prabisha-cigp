import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export async function GET() {
  try {
    const campaigns = await prisma.campaign.findMany({
      include: {
        icp: true,
        assets: {
          include: {
            versions: {
              orderBy: { versionNumber: 'desc' },
              take: 1,
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, campaigns });
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch campaigns' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      name,
      objective,
      icpId,
      market = 'UK',
      locale = 'en-GB',
      channels = ['LINKEDIN', 'BLOG'],
      funnelStage = 'MID_CONSIDERATION',
      offerProductId,
      tone = 'consultative, authoritative, evidence-backed',
      targetCta,
      scheduleStart,
      scheduleEnd,
      workspaceId = 'prabisha-hq',
      ownerId = 'user-mktg-lead',
    } = body;

    const campaign = await prisma.campaign.create({
      data: {
        name,
        objective,
        icpId,
        market,
        locale,
        channelsJson: JSON.stringify(channels),
        funnelStage,
        offerProductId,
        tone,
        targetCta,
        scheduleStart: new Date(scheduleStart || Date.now()),
        scheduleEnd: new Date(scheduleEnd || Date.now() + 7 * 24 * 60 * 60 * 1000),
        workspaceId,
        ownerId,
        status: 'ACTIVE',
      },
    });

    // Record Audit Event
    await prisma.auditEvent.create({
      data: {
        workspaceId,
        actorId: ownerId,
        actorRole: 'MARKETING_LEAD',
        action: 'CAMPAIGN_CREATED',
        entityType: 'Campaign',
        entityId: campaign.id,
        afterSnapshot: JSON.stringify({ name, market, channels }),
      },
    });

    return NextResponse.json({ success: true, campaign });
  } catch (error) {
    console.error('Error creating campaign:', error);
    return NextResponse.json({ success: false, error: 'Failed to create campaign' }, { status: 500 });
  }
}

