/**
 * Prabisha Content Intelligence & Growth Platform (PCIGP)
 * Automated Test Suite & Acceptance Verification
 * Tests RBAC, Compliance Engine, AI Gateway, and Content Lifecycle
 */

import { hasPermission, canApproveAsset, assertPermission } from '../src/lib/rbac/permissions';
import { ComplianceEngine } from '../src/lib/compliance/engine';
import { aiGateway } from '../src/lib/ai/gateway';
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

async function runTestSuite() {
  console.log('\n======================================================');
  console.log('🧪 RUNNING PCIGP AUTOMATED ACCEPTANCE SUITE (SPRINT 1)');
  console.log('======================================================\n');

  // ---------------------------------------------------------
  // TEST GROUP 1: Role-Based Access Control & Separation of Duties
  // ---------------------------------------------------------
  console.log('--- 1. RBAC & Separation of Duties (PRD Section 3) ---');

  // Platform Admin has all permissions
  assert(
    hasPermission('PLATFORM_ADMIN', 'ai:configure'),
    'Platform Admin can configure AI Gateway'
  );
  assert(
    hasPermission('PLATFORM_ADMIN', 'content:override_compliance'),
    'Platform Admin can override compliance blocks'
  );

  // Content Creator cannot publish or configure AI
  assert(
    !hasPermission('CONTENT_CREATOR', 'ai:configure'),
    'Content Creator cannot configure AI'
  );
  assert(
    !hasPermission('CONTENT_CREATOR', 'content:schedule'),
    'Content Creator cannot schedule publication directly'
  );

  // Separation of duties: Creator cannot approve their own asset
  const creatorContext = { userId: 'user-123', workspaceId: 'ws-1', role: 'CONTENT_CREATOR' as const };
  assert(
    !canApproveAsset(creatorContext, 'user-123'),
    'Separation of Duties: Creator cannot approve their own asset'
  );

  const complianceReviewerContext = {
    userId: 'user-reviewer',
    workspaceId: 'ws-1',
    role: 'COMPLIANCE_REVIEWER' as const,
  };
  assert(
    canApproveAsset(complianceReviewerContext, 'user-123'),
    'Compliance Reviewer can approve creator asset'
  );

  // ---------------------------------------------------------
  // TEST GROUP 2: Compliance Rules Engine (UK & India)
  // ---------------------------------------------------------
  console.log('\n--- 2. Compliance Rules Engine (UK ASA/CAP & India ASCI) ---');
  const engine = new ComplianceEngine();

  // Test UK Misleading Urgency / Fake Scarcity
  const fakeScarcityText = 'Act fast! Only 1 spot remaining for this exclusive UK workshop.';
  const scarcityReport = engine.evaluateContent(fakeScarcityText, 'UK', []);
  assert(
    !scarcityReport.passed && scarcityReport.violations.some((v) => v.ruleCode === 'UK_CAP_SCARCITY'),
    'Detects UK ASA/CAP Fake Scarcity violation'
  );

  // Test UK Unsubstantiated #1 Guarantee
  const unsubstantiatedClaimText = 'Prabisha offers a guaranteed #1 ranking on Google in 30 days.';
  const substantiationReport = engine.evaluateContent(unsubstantiatedClaimText, 'UK', []);
  assert(
    substantiationReport.blocksPublication &&
      substantiationReport.highestSeverity === 'CRITICAL_BLOCK',
    'Blocks publication for unsubstantiated ranking guarantee under UK CAP 3.7'
  );

  // Test India ASCI Honest Representations
  const asciViolationText = 'Enroll in our course for 100% placement guarantee with zero effort.';
  const asciReport = engine.evaluateContent(asciViolationText, 'INDIA', []);
  assert(
    asciReport.blocksPublication &&
      asciReport.violations.some((v) => v.ruleCode === 'IN_ASCI_HONEST_CLAIMS'),
    'Enforces ASCI Chapter I prohibition on deceptive guarantees in India'
  );

  // Test Approved Claim matches registry
  const approvedClaims = [
    {
      id: 'claim-1',
      workspaceId: 'ws-1',
      exactWording: '14 hours of weekly manual reporting eliminated',
      evidenceIds: ['evi-1'],
      allowedContexts: ['all'],
      riskLevel: 'LOW' as const,
      status: 'APPROVED' as const,
      reviewer: 'compliance',
      reviewDate: new Date().toISOString(),
    },
  ];

  const compliantText =
    'According to our verified client deployment, 14 hours of weekly manual reporting eliminated for London firm.';
  const compliantReport = engine.evaluateContent(compliantText, 'UK', approvedClaims as any);
  assert(
    compliantReport.passed,
    'Compliant grounded text with verified claim passes evaluation'
  );

  // ---------------------------------------------------------
  // TEST GROUP 3: Model-Agnostic AI Gateway Engine
  // ---------------------------------------------------------
  console.log('\n--- 3. Model-Agnostic AI Gateway (PRD Section 7) ---');

  const campaignPlanResponse = await aiGateway.execute({
    task: 'CAMPAIGN_PLAN',
    prompt: 'Generate weekly plan for UK SME Managing Directors',
    parseJson: true,
  });

  assert(
    campaignPlanResponse.success,
    'AI Gateway executes CAMPAIGN_PLAN successfully'
  );
  assert(
    Boolean(campaignPlanResponse.model && campaignPlanResponse.provider),
    `AI Gateway reports model metadata (Provider: ${campaignPlanResponse.provider}, Model: ${campaignPlanResponse.model})`
  );
  assert(
    campaignPlanResponse.usage.totalTokens > 0,
    'AI Gateway records token telemetry'
  );

  // ---------------------------------------------------------
  // TEST GROUP 4: Database Persistence & Grounding Integrity
  // ---------------------------------------------------------
  console.log('\n--- 4. Database Seed & Grounding Integrity ---');

  const workspace = await prisma.workspace.findUnique({
    where: { id: 'prabisha-hq' },
    include: {
      brandProfiles: true,
      productsServices: true,
      claims: true,
      evidenceRecords: true,
    },
  });

  assert(Boolean(workspace), 'Workspace "prabisha-hq" exists in database');
  assert(
    (workspace?.claims.length || 0) >= 2,
    `Database has ${workspace?.claims.length} registered substantiated claims`
  );
  assert(
    (workspace?.evidenceRecords.length || 0) >= 2,
    `Database has ${workspace?.evidenceRecords.length} linked evidence records`
  );

  console.log('\n======================================================');
  console.log(`📊 TEST RESULTS: ${passedTests} PASSED, ${failedTests} FAILED`);
  console.log('======================================================\n');

  if (failedTests > 0) {
    process.exit(1);
  }
}

runTestSuite()
  .catch((err) => {
    console.error('Test execution failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

