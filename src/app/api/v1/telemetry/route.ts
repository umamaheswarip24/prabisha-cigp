import { NextRequest, NextResponse } from 'next/server';
import { TelemetryService } from '@/lib/analytics/telemetryService';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const workspaceId = searchParams.get('workspaceId') || 'prabisha-hq';

    const telemetry = await TelemetryService.getWorkspaceTelemetry(workspaceId);

    return NextResponse.json({
      success: true,
      telemetry,
    });
  } catch (error: any) {
    console.error('Telemetry fetch error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to aggregate workspace telemetry' },
      { status: 500 }
    );
  }
}
