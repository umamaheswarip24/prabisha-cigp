import { NextResponse } from 'next/server';
import { DistributionService } from '@/lib/distribution/distributionService';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(req: Request, { params }: RouteParams) {
  try {
    const { id: assetId } = await params;
    const body = await req.json().catch(() => ({}));
    const {
      userId = 'user-mktg-lead',
      userRole = 'MARKETING_LEAD',
      externalPostUrl,
    } = body;

    const result = await DistributionService.publishAsset({
      assetId,
      userId,
      userRole,
      externalPostUrl,
    });

    return NextResponse.json({
      success: true,
      asset: result.asset,
      publication: result.publication,
      exportPackage: result.exportPackage,
    });
  } catch (error) {
    console.error('Publish error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Publishing failed' },
      { status: 400 }
    );
  }
}
