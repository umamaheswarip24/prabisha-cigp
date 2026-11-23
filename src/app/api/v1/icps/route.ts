import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const industry = searchParams.get('industry');
    const market = searchParams.get('market');

    const where: any = {};
    if (industry) {
      where.industry = { contains: industry };
    }

    const icps = await prisma.iCPPersona.findMany({
      where,
      include: {
        campaigns: {
          select: { id: true, name: true, status: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, icps });
  } catch (error) {
    console.error('Error fetching ICPs:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch ICPs' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      title,
      industry,
      subindustry,
      geography = ['UK'],
      companySizeRange,
      revenueBand,
      businessModel,
      maturity,
      buyingCapacity,
      buyerRole,
      painPoints = [],
      desiredOutcomes = [],
      buyingTriggers = [],
      objections = [],
      exclusions = [],
      jobsToBeDone = [],
      recommendedProducts = [],
      workspaceId = 'prabisha-hq',
    } = body;

    if (!title || !industry || !buyerRole) {
      return NextResponse.json(
        { success: false, error: 'Title, industry, and buyerRole are required' },
        { status: 400 }
      );
    }

    const icp = await prisma.iCPPersona.create({
      data: {
        title,
        industry,
        subindustry,
        geographyJson: JSON.stringify(geography),
        companySizeRange: companySizeRange || '15-150 employees',
        revenueBand,
        businessModel,
        maturity,
        buyingCapacity,
        buyerRole,
        painPointsJson: JSON.stringify(painPoints),
        desiredOutcomesJson: JSON.stringify(desiredOutcomes),
        buyingTriggersJson: JSON.stringify(buyingTriggers),
        objectionsJson: JSON.stringify(objections),
        exclusionsJson: JSON.stringify(exclusions),
        jobsToBeDoneJson: JSON.stringify(jobsToBeDone),
        recommendedProductsJson: JSON.stringify(recommendedProducts),
        workspaceId,
        version: 1,
      },
    });

    // Record Audit Event
    await prisma.auditEvent.create({
      data: {
        workspaceId,
        actorId: 'user-mktg-lead',
        actorRole: 'MARKETING_LEAD',
        action: 'ICP_CREATED',
        entityType: 'ICPPersona',
        entityId: icp.id,
        afterSnapshot: JSON.stringify({ title, industry, buyerRole }),
      },
    });

    return NextResponse.json({ success: true, icp });
  } catch (error) {
    console.error('Error creating ICP:', error);
    return NextResponse.json({ success: false, error: 'Failed to create ICP' }, { status: 500 });
  }
}

