import { NextRequest, NextResponse } from 'next/server';
import { qualityEvaluationService } from '@/lib/ai/evalService';
import { prisma } from '@/lib/db/prisma';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Mode 1: Run regression benchmark on golden dataset
    if (body.runGoldenDataset) {
      const goldenFilePath = path.join(process.cwd(), 'tests', 'fixtures', 'golden_briefs.json');
      if (!fs.existsSync(goldenFilePath)) {
        return NextResponse.json({ error: 'Golden evaluation dataset fixture not found' }, { status: 404 });
      }
      const rawData = fs.readFileSync(goldenFilePath, 'utf8');
      const goldenBriefs = JSON.parse(rawData);

      const benchmarkSummary = await qualityEvaluationService.evaluateGoldenDataset(goldenBriefs);
      return NextResponse.json({
        success: true,
        type: 'GOLDEN_DATASET_REGRESSION_RUN',
        benchmarkSummary,
      });
    }

    // Mode 2: Evaluate a specific asset or ad-hoc content
    const { headline, contentBody, callToAction, targetCtaUrl, market, campaignId, assetId } = body;

    if (!headline || !contentBody) {
      return NextResponse.json(
        { error: 'Missing required fields: headline and contentBody are mandatory' },
        { status: 400 }
      );
    }

    // Fetch context from database if campaignId provided
    let approvedClaims: any[] = [];
    let evidenceRecords: any[] = [];
    let targetIcp: any = null;
    let offerProduct: any = null;

    if (campaignId) {
      const campaign = await prisma.campaign.findUnique({
        where: { id: campaignId },
        include: { icp: true },
      });
      if (campaign) {
        targetIcp = campaign.icp;
        if (campaign.offerProductId) {
          offerProduct = await prisma.productService.findUnique({
            where: { id: campaign.offerProductId },
          });
        }
        approvedClaims = await prisma.claim.findMany({
          where: { workspaceId: campaign.workspaceId, status: 'APPROVED' },
        });
        evidenceRecords = await prisma.evidenceRecord.findMany({
          where: { workspaceId: campaign.workspaceId },
        });
      }
    }

    const evaluationResult = qualityEvaluationService.evaluate(
      {
        headline,
        body: contentBody,
        callToAction: callToAction || 'Learn More',
        targetCtaUrl,
      },
      {
        campaignId,
        assetId,
        market: (market as any) || 'UK',
        targetIcp,
        offerProduct,
        approvedClaims,
        evidenceRecords,
      }
    );

    return NextResponse.json({
      success: true,
      evaluation: evaluationResult,
    });
  } catch (error: any) {
    console.error('AI Evaluation error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal evaluation failure' },
      { status: 500 }
    );
  }
}
