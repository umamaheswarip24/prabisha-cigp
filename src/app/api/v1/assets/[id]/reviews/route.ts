import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { canApproveAsset } from '@/lib/rbac/permissions';
import { UserRole } from '@/types';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(req: Request, { params }: RouteParams) {
  try {
    const { id: assetId } = await params;
    const body = await req.json();
    const {
      decision, // 'APPROVED' | 'CHANGES_REQUESTED' | 'REJECTED'
      reviewerId = 'user-compliance',
      reviewerRole = 'COMPLIANCE_REVIEWER' as UserRole,
      reason,
      riskFlags = [],
    } = body;

    const asset = await prisma.contentAsset.findUnique({
      where: { id: assetId },
      include: {
        campaign: true,
        versions: {
          orderBy: { versionNumber: 'desc' },
          take: 1,
        },
      },
    });

    if (!asset) {
      return NextResponse.json({ success: false, error: 'Asset not found' }, { status: 404 });
    }

    const latestVersion = asset.versions[0];
    if (!latestVersion) {
      return NextResponse.json({ success: false, error: 'Asset has no version records' }, { status: 400 });
    }

    // Separation of duties check
    const permitted = canApproveAsset(
      {
        userId: reviewerId,
        workspaceId: asset.campaign.workspaceId,
        role: reviewerRole,
      },
      latestVersion.createdBy
    );

    if (!permitted && decision === 'APPROVED') {
      return NextResponse.json(
        {
          success: false,
          error: 'Separation of Duties Violation: You cannot approve your own drafted asset.',
        },
        { status: 403 }
      );
    }

    // Map decision to next state
    let nextState = asset.status;
    if (decision === 'APPROVED') {
      nextState = 'APPROVED';
    } else if (decision === 'CHANGES_REQUESTED') {
      nextState = 'CHANGES_REQUESTED';
    } else if (decision === 'REJECTED') {
      nextState = 'REJECTED';
    }

    // Update asset status
    const updatedAsset = await prisma.contentAsset.update({
      where: { id: assetId },
      data: { status: nextState },
    });

    // Record Review Decision
    const review = await prisma.reviewDecision.create({
      data: {
        assetVersionId: latestVersion.id,
        reviewerId,
        reviewerName: reviewerRole,
        decision,
        reason: reason || 'Review completed per compliance policy.',
        riskFlagsJson: JSON.stringify(riskFlags),
      },
    });

    // Record Audit Event
    await prisma.auditEvent.create({
      data: {
        workspaceId: asset.campaign.workspaceId,
        actorId: reviewerId,
        actorRole: reviewerRole,
        action: `CONTENT_${decision}`,
        entityType: 'ContentAsset',
        entityId: assetId,
        beforeSnapshot: JSON.stringify({ status: asset.status }),
        afterSnapshot: JSON.stringify({ status: nextState, decision, reason }),
      },
    });

    return NextResponse.json({
      success: true,
      asset: updatedAsset,
      review,
    });
  } catch (error) {
    console.error('Error submitting review:', error);
    return NextResponse.json({ success: false, error: 'Failed to record review' }, { status: 500 });
  }
}

