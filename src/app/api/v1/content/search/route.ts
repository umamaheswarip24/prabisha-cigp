import { NextResponse } from 'next/server';
import { HistoricalContentImporter } from '@/lib/content/historicalImporter';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q') || '';
    const workspaceId = searchParams.get('workspaceId') || 'prabisha-hq';

    if (!query || query.trim().length === 0) {
      return NextResponse.json({ success: true, results: [] });
    }

    const results = await HistoricalContentImporter.searchKnowledge(query, workspaceId);

    return NextResponse.json({
      success: true,
      query,
      results,
    });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { success: false, error: 'Search failed' },
      { status: 500 }
    );
  }
}

