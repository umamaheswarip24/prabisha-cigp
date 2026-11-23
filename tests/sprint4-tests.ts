/**
 * Prabisha Content Intelligence & Growth Platform (PCIGP)
 * Sprint 4 / 5 Automated Acceptance Suite
 * Verifies PUB-01 to PUB-06 (Calendar Scheduling, Distribution, UTM Builder, and CSV Performance Export)
 */

import { UTMBuilder } from '../src/lib/distribution/utmBuilder';
import { DistributionService } from '../src/lib/distribution/distributionService';
import { PerformanceExportEngine } from '../src/lib/analytics/exportEngine';
import { prisma } from '../src/lib/db/prisma';

let passedTests = 0;
let failedTests = 0;

function assert(condition: boolean, testName: string, failureDetails?: string) {
  if (condition) {
    console.log(`  ✅ PASS: ${testName}`);
    passedTests++;
  } else {
    console.error(`  ❌ FAIL: ${testName}`);
    if (failureDetails) console.error(`     Details: ${failureDetails}`);
    failedTests++;
  }
}

async function runSprint4Tests() {
  console.log('\n======================================================');
  console.log('🧪 RUNNING PCIGP SPRINT 4/5 ACCEPTANCE SUITE');
  console.log('======================================================\n');

  // ---------------------------------------------------------
  // TEST GROUP 1: Standardized UTM Parameter Builder (PUB-03)
  // ---------------------------------------------------------
  console.log('--- 1. Standardized UTM Parameter Builder (PRD PUB-03) ---');

  // Test approved domain URL with clean params
  const utmValid = UTMBuilder.buildTrackingUrl('https://prabisha.com/services/ai-automation', {
    source: 'LinkedIn Organic',
    medium: 'Social Post',
    campaign: 'UK SME Automation Q1',
    content: 'Hook Variant B',
  });

  assert(utmValid.valid === true, 'Validates approved destination domain (prabisha.com)');
  assert(
    utmValid.finalUrl.includes('utm_source=linkedin_organic') &&
      utmValid.finalUrl.includes('utm_medium=social_post') &&
      utmValid.finalUrl.includes('utm_campaign=uk_sme_automation_q1'),
    'Sanitizes tokens to lowercase and underscores per naming conventions'
  );
  assert(
    utmValid.finalUrl.includes('utm_content=hook_variant_b'),
    'Includes content creative identifier (utm_content)'
  );

  // Test unapproved third-party destination domain
  const utmUnapproved = UTMBuilder.buildTrackingUrl('https://suspicious-unknown-site.org/phishing', {
    source: 'email',
    campaign: 'test',
  });

  assert(
    utmUnapproved.valid === false &&
      utmUnapproved.warnings.some((w) => w.includes('not in approved brand domain registry')),
    'Warns against unapproved external destination domains'
  );

  // ---------------------------------------------------------
  // TEST GROUP 2: Distribution State Machine & Scheduling (PUB-01, PUB-02)
  // ---------------------------------------------------------
  console.log('\n--- 2. Distribution State Machine & Scheduling (PRD PUB-01, PUB-02) ---');

  // Create an unapproved Draft Asset for negative test
  const campaign = await prisma.campaign.findFirst({ where: { workspaceId: 'prabisha-hq' } });
  if (!campaign) throw new Error('Seeded campaign missing');

  const draftAsset = await prisma.contentAsset.create({
    data: {
      campaignId: campaign.id,
      channel: 'LINKEDIN',
      format: 'SOCIAL_POST',
      status: 'DRAFT',
      targetCtaUrl: 'https://prabisha.com',
    },
  });

  await prisma.contentVersion.create({
    data: {
      assetId: draftAsset.id,
      headline: 'Draft Headline',
      body: 'Draft unapproved body text.',
      callToAction: 'Book Call',
      createdBy: 'AI_GATEWAY',
    },
  });

  // State Machine Guard: Cannot schedule unapproved DRAFT
  let scheduleBlocked = false;
  try {
    await DistributionService.scheduleAsset({
      assetId: draftAsset.id,
      scheduledDate: new Date('2026-11-20'),
      userId: 'user-mktg-lead',
      userRole: 'MARKETING_LEAD',
    });
  } catch (err: any) {
    scheduleBlocked = err.message.includes('Invalid State Transition');
  }

  assert(
    scheduleBlocked,
    'State Machine Guard: Blocks scheduling unapproved DRAFT content'
  );

  // Now approve the asset
  await prisma.contentAsset.update({
    where: { id: draftAsset.id },
    data: { status: 'APPROVED' },
  });

  // Schedule the approved asset
  const scheduleResult = await DistributionService.scheduleAsset({
    assetId: draftAsset.id,
    scheduledDate: new Date('2026-11-25'),
    userId: 'user-mktg-lead',
    userRole: 'MARKETING_LEAD',
  });

  assert(
    scheduleResult.asset.status === 'SCHEDULED' && Boolean(scheduleResult.publication),
    'Successfully scheduled APPROVED asset and recorded publication record (PUB-01)'
  );

  // Publish the scheduled asset & verify copy-ready package
  const publishResult = await DistributionService.publishAsset({
    assetId: draftAsset.id,
    userId: 'user-mktg-lead',
    userRole: 'MARKETING_LEAD',
    externalPostUrl: 'https://linkedin.com/feed/update/urn:li:activity:12345',
  });

  assert(
    publishResult.asset.status === 'PUBLISHED',
    'Successfully transitioned asset state to PUBLISHED'
  );
  assert(
    publishResult.exportPackage.includes('=== LINKEDIN COPY-READY ASSET ===') &&
      publishResult.exportPackage.includes('utm_source=linkedin') &&
      publishResult.exportPackage.includes('Prabisha Consulting'),
    'Generates complete copy-ready package with embedded UTM and regulatory notice (PUB-02)'
  );

  // ---------------------------------------------------------
  // TEST GROUP 3: Performance CSV Export Engine (PUB-05, PUB-06)
  // ---------------------------------------------------------
  console.log('\n--- 3. Performance CSV Export Engine (PRD PUB-05, PUB-06) ---');

  const csvOutput = await PerformanceExportEngine.generateCsvExport('prabisha-hq');

  assert(
    csvOutput.includes('Campaign Name,Market Jurisdiction,Funnel Stage,Asset ID'),
    'Generates RFC-4180 compliant CSV header'
  );
  assert(
    csvOutput.includes('UNAVAILABLE'),
    'Displays "UNAVAILABLE" for un-synced analytics per PRD requirement PUB-05 (never misleading zeros)'
  );
  assert(
    csvOutput.includes('PUBLISHED') || csvOutput.includes('SCHEDULED'),
    'Reflects current asset lifecycle statuses in export'
  );

  // Verify Audit Event logged for export
  const exportAudit = await prisma.auditEvent.findFirst({
    where: {
      workspaceId: 'prabisha-hq',
      action: 'PERFORMANCE_CSV_EXPORTED',
    },
    orderBy: { timestamp: 'desc' },
  });

  assert(
    Boolean(exportAudit),
    'Records immutable audit log for CSV data export action (PUB-06)'
  );

  // Clean up temporary test asset so database stays concise
  await prisma.publication.deleteMany({ where: { assetId: draftAsset.id } });
  await prisma.contentVersion.deleteMany({ where: { assetId: draftAsset.id } });
  await prisma.contentAsset.deleteMany({ where: { id: draftAsset.id } });

  console.log('\n======================================================');
  console.log(`📊 SPRINT 4/5 TEST RESULTS: ${passedTests} PASSED, ${failedTests} FAILED`);
  console.log('======================================================\n');

  if (failedTests > 0) {
    process.exit(1);
  }
}

runSprint4Tests()
  .catch((e) => {
    console.error('Sprint 4/5 tests failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
