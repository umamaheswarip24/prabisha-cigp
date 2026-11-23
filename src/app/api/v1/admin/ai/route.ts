import { NextResponse } from 'next/server';
import { aiGateway } from '@/lib/ai/gateway';
import { AIUsageLedger } from '@/lib/ai/ledger';
import { prisma } from '@/lib/db/prisma';

export async function GET() {
  try {
    const policies = aiGateway.getRouter().getAllPolicies();
    const summary = await AIUsageLedger.getWorkspaceSummary('prabisha-hq');
    const recentLogs = await prisma.aIRequestLog.findMany({
      take: 10,
      orderBy: { timestamp: 'desc' },
    });

    return NextResponse.json({
      success: true,
      policies,
      summary,
      recentLogs,
    });
  } catch (error) {
    console.error('Error fetching AI admin stats:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch AI configuration' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { task, policy } = body;

    if (!task || !policy) {
      return NextResponse.json({ success: false, error: 'Task and policy are required' }, { status: 400 });
    }

    aiGateway.getRouter().updatePolicy(task, policy);

    return NextResponse.json({
      success: true,
      message: `Updated AI policy for task ${task}`,
      updatedPolicies: aiGateway.getRouter().getAllPolicies(),
    });
  } catch (error) {
    console.error('Error updating AI policy:', error);
    return NextResponse.json({ success: false, error: 'Failed to update policy' }, { status: 500 });
  }
}

