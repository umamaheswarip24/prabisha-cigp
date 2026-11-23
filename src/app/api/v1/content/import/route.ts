import { NextResponse } from 'next/server';
import { HistoricalContentImporter } from '@/lib/content/historicalImporter';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      title,
      sourceType = 'MARKDOWN',
      sourceUrl,
      content,
      tags = [],
      metadata = {},
      workspaceId = 'prabisha-hq',
    } = body;

    if (!title || !content) {
      return NextResponse.json(
        { success: false, error: 'Title and content body are required' },
        { status: 400 }
      );
    }

    const result = await HistoricalContentImporter.importDocument({
      workspaceId,
      title,
      sourceType,
      sourceUrl,
      content,
      tags,
      metadata,
    });

    return NextResponse.json({
      success: result.success,
      result,
    });
  } catch (error) {
    console.error('Import error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Import failed' },
      { status: 500 }
    );
  }
}

