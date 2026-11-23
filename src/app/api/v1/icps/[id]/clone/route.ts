import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(req: Request, { params }: RouteParams) {
  try {
    const { id: sourceIcpId } = await params;
    const body = await req.json().catch(() => ({}));
    const newTitle = body.title;

    const sourceIcp = await prisma.iCPPersona.findUnique({
      where: { id: sourceIcpId },
    });

    if (!sourceIcp) {
      return NextResponse.json({ success: false, error: 'Source ICP not found' }, { status: 404 });
    }

    const clonedIcp = await prisma.iCPPersona.create({
      data: {
        workspaceId: sourceIcp.workspaceId,
        title: newTitle || `${sourceIcp.title} (Clone v${sourceIcp.version + 1})`,
        industry: sourceIcp.industry,
        subindustry: sourceIcp.subindustry,
        geographyJson: sourceIcp.geographyJson,
        companySizeRange: sourceIcp.companySizeRange,
        revenueBand: sourceIcp.revenueBand,
        businessModel: sourceIcp.businessModel,
        maturity: sourceIcp.maturity,
        buyingCapacity: sourceIcp.buyingCapacity,
        buyerRole: sourceIcp.buyerRole,
        painPointsJson: sourceIcp.painPointsJson,
        desiredOutcomesJson: sourceIcp.desiredOutcomesJson,
        buyingTriggersJson: sourceIcp.buyingTriggersJson,
        objectionsJson: sourceIcp.objectionsJson,
        exclusionsJson: sourceIcp.exclusionsJson,
        jobsToBeDoneJson: sourceIcp.jobsToBeDoneJson,
        recommendedProductsJson: sourceIcp.recommendedProductsJson,
        fitScoreWeightsJson: sourceIcp.fitScoreWeightsJson,
        clonedFromId: sourceIcp.id,
        version: sourceIcp.version + 1,
      },
    });

    await prisma.auditEvent.create({
      data: {
        workspaceId: sourceIcp.workspaceId,
        actorId: 'user-mktg-lead',
        actorRole: 'MARKETING_LEAD',
        action: 'ICP_CLONED',
        entityType: 'ICPPersona',
        entityId: clonedIcp.id,
        beforeSnapshot: JSON.stringify({ sourceIcpId }),
        afterSnapshot: JSON.stringify({ clonedId: clonedIcp.id, version: clonedIcp.version }),
      },
    });

    return NextResponse.json({ success: true, icp: clonedIcp });
  } catch (error) {
    console.error('Error cloning ICP:', error);
    return NextResponse.json({ success: false, error: 'Failed to clone ICP' }, { status: 500 });
  }
}

