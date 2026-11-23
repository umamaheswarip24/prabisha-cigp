import { prisma } from '@/lib/db/prisma';
import { TelemetryService } from '@/lib/analytics/telemetryService';
import { TelemetryView } from './TelemetryView';
import fs from 'fs';
import path from 'path';

export const revalidate = 0;

export default async function TelemetryPage() {
  const telemetry = await TelemetryService.getWorkspaceTelemetry('prabisha-hq');

  // Load Golden Test Set for interactive regression evaluation runner
  const goldenFilePath = path.join(process.cwd(), 'tests', 'fixtures', 'golden_briefs.json');
  let goldenBriefs = [];
  if (fs.existsSync(goldenFilePath)) {
    try {
      goldenBriefs = JSON.parse(fs.readFileSync(goldenFilePath, 'utf8'));
    } catch (e) {
      console.error('Failed to parse golden_briefs.json', e);
    }
  }

  // Fetch recent audit logs for security & provenance section
  const recentAudits = await prisma.auditEvent.findMany({
    take: 8,
    orderBy: { timestamp: 'desc' },
  });

  return (
    <TelemetryView
      initialTelemetry={telemetry}
      goldenBriefs={goldenBriefs}
      recentAudits={recentAudits as any}
    />
  );
}
