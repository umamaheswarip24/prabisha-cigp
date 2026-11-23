import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { DuplicateDetector } from '@/lib/content/duplicateDetector';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { content, workspaceId = 'prabisha-hq' } = body;

    if (!content) {
      return NextResponse.json({ success: false, error: 'Content is required' }, { status: 400 });
    }

    // Fetch prior content versions & historical content
    const [historicalDocs, pastVersions] = await Promise.all([
      prisma.historicalContent.findMany({
        where: { workspaceId },
        select: { id: true, title: true, content: true },
      }),
      prisma.contentVersion.findMany({
        select: { id: true, headline: true, body: true },
        take: 50,
      }),
    ]);

    const corpus = [
      ...historicalDocs.map((d) => ({ id: d.id, title: d.title, content: d.content })),
      ...pastVersions.map((v) => ({
        id: v.id,
        title: v.headline || 'Campaign Asset Version',
        content: v.body,
      })),
    ];

    const result = DuplicateDetector.checkDuplicates(content, corpus);

    return NextResponse.json({
      success: true,
      duplicateCheck: result,
    });
  } catch (error) {
    console.error('Duplicate check error:', error);
    return NextResponse.json({ success: false, error: 'Duplicate check failed' }, { status: 500 });
  }
}

