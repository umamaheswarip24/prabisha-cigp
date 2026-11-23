/**
 * Prabisha Content Intelligence & Growth Platform (PCIGP)
 * Server-Side Role-Based Access Control (RBAC)
 * Aligned with PRD Section 3 (Users, Roles & Permissions)
 */

import { UserRole, Permission } from '@/types';

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  PLATFORM_ADMIN: [
    'workspace:manage',
    'workspace:read',
    'brand:manage',
    'brand:read',
    'catalog:manage',
    'catalog:read',
    'evidence:manage',
    'evidence:verify',
    'evidence:read',
    'claims:manage',
    'claims:approve',
    'claims:read',
    'icp:manage',
    'icp:read',
    'campaigns:create',
    'campaigns:edit',
    'campaigns:read',
    'content:generate',
    'content:edit',
    'content:review',
    'content:override_compliance',
    'content:schedule',
    'content:publish',
    'seo:manage',
    'compliance:manage_rules',
    'compliance:review',
    'ai:configure',
    'audit:read',
  ],
  MARKETING_LEAD: [
    'workspace:read',
    'brand:read',
    'brand:manage',
    'catalog:read',
    'catalog:manage',
    'evidence:read',
    'evidence:manage',
    'claims:read',
    'claims:manage',
    'icp:manage',
    'icp:read',
    'campaigns:create',
    'campaigns:edit',
    'campaigns:read',
    'content:generate',
    'content:edit',
    'content:review',
    'content:schedule',
    'content:publish',
    'seo:manage',
    'compliance:review',
    'audit:read',
  ],
  CONTENT_CREATOR: [
    'workspace:read',
    'brand:read',
    'catalog:read',
    'evidence:read',
    'claims:read',
    'icp:read',
    'campaigns:read',
    'content:generate',
    'content:edit',
  ],
  SEO_GEO_SPECIALIST: [
    'workspace:read',
    'brand:read',
    'catalog:read',
    'evidence:read',
    'claims:read',
    'icp:read',
    'campaigns:read',
    'content:edit',
    'seo:manage',
  ],
  COMPLIANCE_REVIEWER: [
    'workspace:read',
    'brand:read',
    'catalog:read',
    'evidence:read',
    'claims:read',
    'claims:approve',
    'campaigns:read',
    'content:review',
    'compliance:manage_rules',
    'compliance:review',
    'audit:read',
  ],
  SALES_CRM: [
    'workspace:read',
    'catalog:read',
    'icp:read',
    'campaigns:read',
    'audit:read',
  ],
  READ_ONLY_EXEC: [
    'workspace:read',
    'brand:read',
    'catalog:read',
    'evidence:read',
    'claims:read',
    'icp:read',
    'campaigns:read',
    'audit:read',
  ],
};

export interface UserContext {
  userId: string;
  workspaceId: string;
  role: UserRole;
}

/**
 * Checks if a role has the required permission
 */
export function hasPermission(role: UserRole, permission: Permission): boolean {
  const permissions = ROLE_PERMISSIONS[role] || [];
  return permissions.includes(permission);
}

/**
 * Server-side guard to assert permission or throw Authorization Error
 */
export function assertPermission(user: UserContext, permission: Permission): void {
  if (!hasPermission(user.role, permission)) {
    throw new Error(
      `Forbidden: User ${user.userId} with role ${user.role} lacks required permission: ${permission}`
    );
  }
}

/**
 * Enforces Separation of Duties:
 * Content Creators cannot approve or publish their own drafted assets.
 */
export function canApproveAsset(user: UserContext, assetCreatorId: string): boolean {
  if (!hasPermission(user.role, 'content:review')) {
    return false;
  }
  // Separation of duties rule:
  if (user.role === 'CONTENT_CREATOR' || user.userId === assetCreatorId) {
    return false;
  }
  return true;
}

/**
 * Checks if user is permitted to override high-risk compliance blocks.
 * Only PLATFORM_ADMIN can override compliance blocks and must log a justification.
 */
export function canOverrideCompliance(user: UserContext): boolean {
  return user.role === 'PLATFORM_ADMIN';
}

