import { NextResponse } from 'next/server';
import { UTMBuilder } from '@/lib/distribution/utmBuilder';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { destinationUrl, source, medium, campaign, term, content } = body;

    if (!destinationUrl || !source || !campaign) {
      return NextResponse.json(
        { success: false, error: 'destinationUrl, source, and campaign are required' },
        { status: 400 }
      );
    }

    const result = UTMBuilder.buildTrackingUrl(destinationUrl, {
      source,
      medium,
      campaign,
      term,
      content,
    });

    return NextResponse.json({
      success: result.valid,
      result,
    });
  } catch (error) {
    console.error('UTM builder error:', error);
    return NextResponse.json({ success: false, error: 'Failed to build UTM' }, { status: 500 });
  }
}
