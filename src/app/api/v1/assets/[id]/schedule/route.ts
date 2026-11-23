import { NextResponse } from 'next/server';
import { DistributionService } from '@/lib/distribution/distributionService';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(req: Request, { params }: RouteParams) {
  try {
    const { id: assetId } = await params;
    const body = await req.json();
    const {
      scheduledDate,
      userId = 'user-mktg-lead',
      userRole = 'MARKETING_LEAD',
    } = body;

    if (!scheduledDate) {
      return NextResponse.json(
        { success: false, error: 'scheduledDate is required' },
        { status: 400 }
      );
    }

    const result = await DistributionService.scheduleAsset({
      assetId,
      scheduledDate: new Date(scheduledDate),
      userId,
      userRole,
    });

    return NextResponse.json({
      success: true,
      asset: result.asset,
      publication: result.publication,
    });
  } catch (error) {
    console.error('Schedule error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Scheduling failed' },
      { status: 400 }
    );
  }
}
