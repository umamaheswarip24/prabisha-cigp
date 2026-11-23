import { prisma } from '@/lib/db/prisma';
import { ComplianceView } from './ComplianceView';

export const revalidate = 0;

export default async function CompliancePage() {
  const [rules, auditEvents] = await Promise.all([
    prisma.complianceRule.findMany({ orderBy: { severity: 'asc' } }),
    prisma.auditEvent.findMany({
      take: 15,
      orderBy: { timestamp: 'desc' },
      include: { user: true },
    }),
  ]);

  return <ComplianceView rules={rules} auditEvents={auditEvents} />;
}
