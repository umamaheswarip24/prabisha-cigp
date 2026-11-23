import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { ICPFitScorer, ProspectProfile } from '@/lib/icp/scoring';
import { ICPPersona } from '@/types';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { icpId, prospect }: { icpId: string; prospect: ProspectProfile } = body;

    if (!icpId || !prospect) {
      return NextResponse.json(
        { success: false, error: 'icpId and prospect object are required' },
        { status: 400 }
      );
    }

    const icpRecord = await prisma.iCPPersona.findUnique({
      where: { id: icpId },
    });

    if (!icpRecord) {
      return NextResponse.json({ success: false, error: 'ICP not found' }, { status: 404 });
    }

    const domainIcp: ICPPersona = {
      id: icpRecord.id,
      workspaceId: icpRecord.workspaceId,
      title: icpRecord.title,
      industry: icpRecord.industry,
      subindustry: icpRecord.subindustry || undefined,
      geography: JSON.parse(icpRecord.geographyJson),
      companySizeRange: icpRecord.companySizeRange,
      revenueBand: icpRecord.revenueBand || undefined,
      businessModel: icpRecord.businessModel || undefined,
      maturity: icpRecord.maturity || undefined,
      buyingCapacity: icpRecord.buyingCapacity || undefined,
      buyerRole: icpRecord.buyerRole,
      painPoints: JSON.parse(icpRecord.painPointsJson),
      desiredOutcomes: JSON.parse(icpRecord.desiredOutcomesJson),
      buyingTriggers: JSON.parse(icpRecord.buyingTriggersJson),
      objections: JSON.parse(icpRecord.objectionsJson),
      exclusions: JSON.parse(icpRecord.exclusionsJson),
      jobsToBeDone: JSON.parse(icpRecord.jobsToBeDoneJson || '[]'),
      recommendedProductIds: JSON.parse(icpRecord.recommendedProductsJson),
      fitScoreWeights: JSON.parse(icpRecord.fitScoreWeightsJson || '{}'),
      version: icpRecord.version,
    };

    const fitScoreResult = ICPFitScorer.calculateFitScore(prospect, domainIcp);

    return NextResponse.json({
      success: true,
      fitScore: fitScoreResult,
      icpTitle: icpRecord.title,
    });
  } catch (error) {
    console.error('Error calculating ICP score:', error);
    return NextResponse.json({ success: false, error: 'Scoring failed' }, { status: 500 });
  }
}

