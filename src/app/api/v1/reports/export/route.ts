import { NextResponse } from 'next/server';
import { PerformanceExportEngine } from '@/lib/analytics/exportEngine';

export async function GET() {
  try {
    const csvContent = await PerformanceExportEngine.generateCsvExport(
      'prabisha-hq',
      'user-mktg-lead',
      'MARKETING_LEAD'
    );

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="pcigp-performance-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });
  } catch (error) {
    console.error('CSV Export error:', error);
    return NextResponse.json({ success: false, error: 'Export failed' }, { status: 500 });
  }
}
