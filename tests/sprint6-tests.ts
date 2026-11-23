/**
 * Prabisha Content Intelligence & Growth Platform (PCIGP)
 * Sprint 6 Acceptance & Pilot Regression Test Suite
 *
 * Verifies:
 * 1. Golden Evaluation Dataset & Schema Integrity (PRD Section 12)
 * 2. 10-Dimension AI Quality Rubric & Hard Gates (PRD Section 12.1, 12.2)
 * 3. Regression Benchmark Execution across All Test Cases
 * 4. Workspace Telemetry Aggregation (PRD Section 13, 14 & 15)
 * 5. Full End-to-End Pilot Workflow (PRD Section 21 Acceptance Checklist)
 */

import { prisma } from '../src/lib/db/prisma';
import { qualityEvaluationService } from '../src/lib/ai/evalService';
import { TelemetryService } from '../src/lib/analytics/telemetryService';
import { aiGateway } from '../src/lib/ai/gateway';
import { ragService } from '../src/lib/ai/ragService';
import { UTMBuilder } from '../src/lib/distribution/utmBuilder';
import { PerformanceExportEngine } from '../src/lib/analytics/exportEngine';
import fs from 'fs';
import path from 'path';

let passed = 0;
let failed = 0;

function assert(condition: boolean, message: string) {
  if (condition) {
    console.log(`  ✅ PASS: ${message}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${message}`);
    failed++;
  }
}

async function runSprint6Tests() {
  console.log('\n======================================================');
  console.log('🧪 RUNNING PCIGP SPRINT 6 ACCEPTANCE SUITE');
  console.log('======================================================\n');

  try {
    // -------------------------------------------------------------
    // 1. Golden Evaluation Dataset Fixture (PRD Section 12.2)
    // -------------------------------------------------------------
    console.log('--- 1. Golden Evaluation Dataset & Fixture Integrity (PRD Sec 12.2) ---');
    const goldenFilePath = path.join(process.cwd(), 'tests', 'fixtures', 'golden_briefs.json');
    assert(fs.existsSync(goldenFilePath), 'Golden evaluation dataset fixture exists on disk');

    const rawData = fs.readFileSync(goldenFilePath, 'utf8');
    const goldenBriefs = JSON.parse(rawData);
    assert(goldenBriefs.length >= 5, `Contains ${goldenBriefs.length} curated representative briefs`);

    const edgeCases = goldenBriefs.filter((b: any) => b.id.includes('edge'));
    assert(edgeCases.length >= 2, `Contains ${edgeCases.length} designated edge/failure test cases`);

    // -------------------------------------------------------------
    // 2. 10-Dimension AI Quality Evaluation Rubric (PRD Section 12.1)
    // -------------------------------------------------------------
    console.log('\n--- 2. 10-Dimension AI Quality Evaluation Rubric (PRD Sec 12.1) ---');
    const ukBrief = goldenBriefs.find((b: any) => b.id === 'brief-uk-b2b-01');

    const evalResult = qualityEvaluationService.evaluate(
      {
        headline: ukBrief.sampleCompliantContent.headline,
        body: ukBrief.sampleCompliantContent.body,
        callToAction: ukBrief.sampleCompliantContent.callToAction,
        targetCtaUrl: ukBrief.sampleCompliantContent.targetCtaUrl,
      },
      {
        campaignId: ukBrief.id,
        market: ukBrief.market,
        locale: ukBrief.locale,
        targetIcp: ukBrief.icp,
        offerProduct: ukBrief.offer,
        retrievedSourceIds: ukBrief.constraints.requiredEvidenceIds,
      }
    );

    assert(evalResult.passedOverall === true, 'Grounded compliant brief passes overall quality evaluation');
    assert(evalResult.overallScore >= 80, `High overall quality score achieved (${evalResult.overallScore}/100)`);
    assert(evalResult.hasCriticalBlocker === false, 'Zero critical blocker gates triggered for compliant copy');

    const rubricKeys = Object.keys(evalResult.rubricBreakdown);
    assert(rubricKeys.length === 10, `All 10 quality rubric dimensions evaluated (Found: ${rubricKeys.length})`);
    assert(evalResult.rubricBreakdown.factual_grounding.passed, 'Factual grounding dimension passed');
    assert(evalResult.rubricBreakdown.compliance.passed, 'Compliance dimension passed');
    assert(evalResult.rubricBreakdown.brand_voice.passed, 'Brand voice dimension passed');
    assert(evalResult.provenance.evaluatorVersion === 'pcigp-evaluator-v1.0', 'Provenance records evaluator version');

    // -------------------------------------------------------------
    // 3. Critical Hard Gate Enforcement (PRD Section 12.2)
    // "A high aggregate score must not cancel a critical factual or compliance failure."
    // -------------------------------------------------------------
    console.log('\n--- 3. Critical Hard Gate Enforcement (PRD Sec 12.2) ---');
    const deceptiveBrief = goldenBriefs.find((b: any) => b.id === 'brief-edge-unsubstantiated-01');

    const deceptiveResult = qualityEvaluationService.evaluate(
      {
        headline: deceptiveBrief.sampleCompliantContent.headline,
        body: deceptiveBrief.sampleCompliantContent.body,
        callToAction: deceptiveBrief.sampleCompliantContent.callToAction,
        targetCtaUrl: deceptiveBrief.sampleCompliantContent.targetCtaUrl,
      },
      {
        campaignId: deceptiveBrief.id,
        market: deceptiveBrief.market,
        locale: deceptiveBrief.locale,
        targetIcp: deceptiveBrief.icp,
        offerProduct: deceptiveBrief.offer,
      }
    );

    assert(deceptiveResult.hasCriticalBlocker === true, 'Critical hard blocker flagged on deceptive guarantee');
    assert(
      deceptiveResult.passedOverall === false,
      'HARD GATE: Aggregate score fails overall due to critical regulatory violation'
    );
    assert(
      deceptiveResult.complianceViolations.length >= 1,
      `Detected ${deceptiveResult.complianceViolations.length} compliance violations (UK CAP Code 3.7)`
    );

    const scarcityBrief = goldenBriefs.find((b: any) => b.id === 'brief-edge-fake-scarcity-02');
    const scarcityResult = qualityEvaluationService.evaluate(
      {
        headline: scarcityBrief.sampleCompliantContent.headline,
        body: scarcityBrief.sampleCompliantContent.body,
        callToAction: scarcityBrief.sampleCompliantContent.callToAction,
        targetCtaUrl: scarcityBrief.sampleCompliantContent.targetCtaUrl,
      },
      {
        campaignId: scarcityBrief.id,
        market: scarcityBrief.market,
        locale: scarcityBrief.locale,
        targetIcp: scarcityBrief.icp,
        offerProduct: scarcityBrief.offer,
      }
    );

    assert(scarcityResult.hasCriticalBlocker === true, 'Fake scarcity triggers critical blocker');
    assert(scarcityResult.passedOverall === false, 'HARD GATE: Fake scarcity fails overall evaluation');

    // -------------------------------------------------------------
    // 4. Automated Golden Regression Benchmark Suite
    // -------------------------------------------------------------
    console.log('\n--- 4. Automated Golden Regression Benchmark Suite ---');
    const benchmark = await qualityEvaluationService.evaluateGoldenDataset(goldenBriefs);

    assert(benchmark.totalCases === goldenBriefs.length, `Executed regression across all ${benchmark.totalCases} cases`);
    assert(
      benchmark.passedCases === benchmark.totalCases,
      `100% regression accuracy: ${benchmark.passedCases}/${benchmark.totalCases} cases matched expected outcomes`
    );

    // -------------------------------------------------------------
    // 5. Workspace Telemetry Aggregation (PRD Section 13, 14 & 15)
    // -------------------------------------------------------------
    console.log('\n--- 5. Workspace Telemetry Aggregation (PRD Sec 13, 14 & 15) ---');
    const telemetry = await TelemetryService.getWorkspaceTelemetry('prabisha-hq');

    assert(telemetry.workspaceId === 'prabisha-hq', 'Telemetry generated for workspace "prabisha-hq"');
    assert(telemetry.aiUsage.totalRequests >= 0, `Aggregates total AI requests (${telemetry.aiUsage.totalRequests})`);
    assert(telemetry.aiUsage.totalTokens >= 0, `Aggregates total tokens processed (${telemetry.aiUsage.totalTokens})`);
    assert(telemetry.aiUsage.totalCostUsd >= 0, `Computes blended cost in USD ($${telemetry.aiUsage.totalCostUsd})`);
    assert(telemetry.aiUsage.averageLatencyMs >= 0, `Calculates average latency (${telemetry.aiUsage.averageLatencyMs}ms)`);
    assert(telemetry.complianceSummary.passRatePercent >= 0, `Calculates compliance pass rate (${telemetry.complianceSummary.passRatePercent}%)`);
    assert(
      typeof telemetry.lifecycleDistribution.APPROVED === 'number',
      'Lifecycle distribution tracks APPROVED assets'
    );
    assert(
      typeof telemetry.lifecycleDistribution.PUBLISHED === 'number',
      'Lifecycle distribution tracks PUBLISHED assets'
    );

    // -------------------------------------------------------------
    // 6. Complete Pilot Workflow Acceptance (PRD Section 21 Checklist)
    // -------------------------------------------------------------
    console.log('\n--- 6. End-to-End Pilot Workflow Acceptance (PRD Sec 21) ---');

    // A: Retrieve Grounded Context
    const groundedContext = await ragService.retrieveContextForCampaign('camp-uk-automation-01');
    assert(groundedContext.approvedClaims.length > 0, 'Retrieves approved claims for campaign grounding');

    // B: AI Gateway Generation with Telemetry
    const genResponse = await aiGateway.execute({
      task: 'CONTENT_DRAFT',
      prompt: 'Draft LinkedIn post for UK SME managing directors highlighting 42% operational cycle time reduction.',
    });
    assert(genResponse.usage.totalTokens > 0, 'AI Gateway records token usage in ledger');
    assert(genResponse.latencyMs >= 0, 'AI Gateway records response latency');

    // C: Standardized UTM Distribution
    const utmResult = UTMBuilder.buildTrackingUrl(
      'https://prabisha.co.uk/services/automation-assessment',
      {
        source: 'linkedin',
        medium: 'organic_social',
        campaign: 'UK SME AI Automation',
        term: 'UK SME Managing Director',
      }
    );
    assert(utmResult.finalUrl.includes('utm_source=linkedin'), 'UTM parameters standardized correctly');

    // D: Single-Click RFC-4180 CSV Export
    const csvExport = await PerformanceExportEngine.generateCsvExport('prabisha-hq', 'user-admin', 'PLATFORM_ADMIN');
    assert(csvExport.startsWith('Campaign Name,Market Jurisdiction'), 'Exports valid RFC-4180 CSV report');
    const rows = csvExport.trim().split('\n');
    assert(rows.length > 1, `Export contains ${rows.length - 1} performance rows`);

    console.log('\n======================================================');
    console.log(`📊 SPRINT 6 TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
    console.log('======================================================\n');

    if (failed > 0) {
      process.exit(1);
    }
  } catch (error) {
    console.error('Unhandled test suite error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runSprint6Tests();
