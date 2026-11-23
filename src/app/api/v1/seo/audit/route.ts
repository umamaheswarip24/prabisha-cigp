import { NextResponse } from 'next/server';
import { SEOAuditEngine } from '@/lib/seo/auditEngine';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { headline, body: contentBody, metaDescription, targetKeyword, searchIntent, urlSlug } = body;

    if (!contentBody) {
      return NextResponse.json({ success: false, error: 'Content body is required' }, { status: 400 });
    }

    const auditReport = SEOAuditEngine.auditContent({
      headline,
      body: contentBody,
      metaDescription,
      targetKeyword: targetKeyword || '',
      searchIntent,
      urlSlug,
    });

    return NextResponse.json({
      success: true,
      report: auditReport,
    });
  } catch (error) {
    console.error('SEO audit error:', error);
    return NextResponse.json({ success: false, error: 'SEO Audit failed' }, { status: 500 });
  }
}

