/**
 * Prabisha Content Intelligence & Growth Platform (PCIGP)
 * Sprint 2 Automated Acceptance Tests
 * Verifies ICP-01 to ICP-04, CAM-01 (Brief Templates & Cloning), and Section 6 (Filter Engine)
 */

import { ICPFitScorer } from '../src/lib/icp/scoring';
import { FilterEngine } from '../src/lib/filters/engine';
import { prisma } from '../src/lib/db/prisma';
import { ICPPersona } from '../src/types';

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

async function runSprint2Tests() {
  console.log('\n======================================================');
  console.log('🧪 RUNNING PCIGP SPRINT 2 ACCEPTANCE SUITE');
  console.log('======================================================\n');

  // ---------------------------------------------------------
  // TEST GROUP 1: ICP-01 & ICP-02 (ICP Management & Cloning)
  // ---------------------------------------------------------
  console.log('--- 1. ICP Creation & Cloning (PRD ICP-01, ICP-02) ---');

  // 1. Create a new ICP Persona
  const testIcp = await prisma.iCPPersona.create({
    data: {
      workspaceId: 'prabisha-hq',
      title: 'India Fintech Operations Heads',
      industry: 'Financial Technology',
      subindustry: 'Digital Lending & Payments',
      geographyJson: JSON.stringify(['INDIA']),
      companySizeRange: '50-300 employees',
      revenueBand: '₹20Cr - ₹150Cr',
      businessModel: 'B2B Fintech',
      maturity: 'Growth / Scaling',
      buyingCapacity: 'Enterprise Budget (₹50L+)',
      buyerRole: 'VP of Engineering / Operations Head',
      painPointsJson: JSON.stringify([
        'Regulatory reporting delays under RBI and DPDP guidelines',
        'Customer KYC drop-off rates due to manual verification',
      ]),
      desiredOutcomesJson: JSON.stringify([
        'Zero regulatory penalties through automated compliance logging',
        'Sub-1-minute customer onboarding workflow',
      ]),
      buyingTriggersJson: JSON.stringify(['Upcoming statutory compliance deadline']),
      exclusionsJson: JSON.stringify(['Unregulated cryptocurrency brokers']),
      jobsToBeDoneJson: JSON.stringify(['Automate periodic KYC compliance checks']),
      recommendedProductsJson: JSON.stringify(['prod-ai-automation']),
      version: 1,
    },
  });

  assert(Boolean(testIcp.id), 'Successfully created ICP with rich attributes (ICP-01)');
  assert(testIcp.version === 1, 'Initial ICP version is 1');

  // 2. Clone the ICP
  const clonedIcp = await prisma.iCPPersona.create({
    data: {
      workspaceId: testIcp.workspaceId,
      title: `${testIcp.title} (Clone v2)`,
      industry: testIcp.industry,
      subindustry: testIcp.subindustry,
      geographyJson: testIcp.geographyJson,
      companySizeRange: testIcp.companySizeRange,
      revenueBand: testIcp.revenueBand,
      businessModel: testIcp.businessModel,
      maturity: testIcp.maturity,
      buyingCapacity: testIcp.buyingCapacity,
      buyerRole: testIcp.buyerRole,
      painPointsJson: testIcp.painPointsJson,
      desiredOutcomesJson: testIcp.desiredOutcomesJson,
      buyingTriggersJson: testIcp.buyingTriggersJson,
      objectionsJson: testIcp.objectionsJson,
      exclusionsJson: testIcp.exclusionsJson,
      jobsToBeDoneJson: testIcp.jobsToBeDoneJson,
      recommendedProductsJson: testIcp.recommendedProductsJson,
      clonedFromId: testIcp.id,
      version: testIcp.version + 1,
    },
  });

  assert(
    clonedIcp.clonedFromId === testIcp.id,
    'Cloned ICP maintains provenance lineage to source ICP (clonedFromId)'
  );
  assert(clonedIcp.version === 2, 'Cloned ICP increments version to 2 (ICP-01)');

  // ---------------------------------------------------------
  // TEST GROUP 2: ICP-04 (Configurable Heuristic Fit Scoring)
  // ---------------------------------------------------------
  console.log('\n--- 2. Heuristic Fit Scoring Engine (PRD ICP-04) ---');

  const domainIcp: ICPPersona = {
    id: testIcp.id,
    workspaceId: testIcp.workspaceId,
    title: testIcp.title,
    industry: testIcp.industry,
    subindustry: testIcp.subindustry || undefined,
    geography: ['INDIA'],
    companySizeRange: '50-300 employees',
    buyerRole: 'VP of Operations',
    painPoints: ['Regulatory reporting delays', 'Customer KYC drop-off rates'],
    desiredOutcomes: ['Zero regulatory penalties'],
    buyingTriggers: ['Regulatory deadline'],
    objections: ['Will automated extraction comply with RBI statutory audits?'],
    exclusions: ['Unregulated brokers'],
    recommendedProductIds: ['prod-ai-automation'],
    fitScoreWeights: {
      industry: 25,
      companySize: 20,
      painRelevance: 30,
      budgetMatch: 25,
    },
    version: 1,
  };

  // High fit prospect
  const highFitProspect = {
    companyName: 'FinPay Technologies Ltd',
    industry: 'Financial Technology',
    companySize: 120,
    buyerRole: 'VP of Operations',
    statedPains: ['Regulatory reporting delays', 'Customer KYC drop-off rates'],
  };

  const highFitResult = ICPFitScorer.calculateFitScore(highFitProspect, domainIcp);
  assert(
    highFitResult.isHeuristic === true,
    'Fit score is explicitly labelled heuristic per PRD requirement ICP-04'
  );
  assert(
    highFitResult.totalScore >= 80,
    `High-fit prospect scores ${highFitResult.totalScore}/100 and classifies as Tier 1 (${highFitResult.tier})`
  );
  assert(
    highFitResult.components.length === 4,
    'Exposes 4 component weights and scores (Industry, Size, Pains, Authority)'
  );

  // Low fit prospect (Retail industry, 5 employees)
  const lowFitProspect = {
    companyName: 'Local Corner Grocery',
    industry: 'Retail Store',
    companySize: 4,
    buyerRole: 'Clerk',
    statedPains: ['Inventory shelf stocking'],
  };

  const lowFitResult = ICPFitScorer.calculateFitScore(lowFitProspect, domainIcp);
  assert(
    lowFitResult.totalScore < 60,
    `Low-fit prospect scores ${lowFitResult.totalScore}/100 and classifies as Tier 3 (${lowFitResult.tier})`
  );
  assert(
    lowFitResult.recommendations.length > 0,
    'Generates strategic recommendations when fit criteria mismatch'
  );

  // ---------------------------------------------------------
  // TEST GROUP 3: Campaign Brief Templates & Cloning (CAM-01)
  // ---------------------------------------------------------
  console.log('\n--- 3. Campaign Templates & Brief Cloning (PRD CAM-01) ---');

  const templateCampaign = await prisma.campaign.create({
    data: {
      workspaceId: 'prabisha-hq',
      name: 'Template: UK SME Weekly Lead Gen Brief',
      templateName: 'Standard UK SME B2B Brief Template',
      isTemplate: true,
      objective: 'Generate 15+ qualified consultations',
      icpId: testIcp.id,
      market: 'UK',
      locale: 'en-GB',
      channelsJson: JSON.stringify(['LINKEDIN', 'EMAIL', 'BLOG']),
      funnelStage: 'MID_CONSIDERATION',
      offerProductId: 'prod-ai-automation',
      tone: 'consultative, authoritative, evidence-backed',
      targetCta: 'Book an Automation Diagnostic',
      assetVolume: 3,
      theme: 'Operational Automation for Professional Services',
      rationale: 'Addresses proven margin bottlenecks in London firms',
      successMetrics: '15 bookings, £30k pipeline',
      scheduleStart: new Date(),
      scheduleEnd: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      ownerId: 'user-mktg-lead',
      status: 'DRAFT',
    },
  });

  assert(
    templateCampaign.isTemplate === true,
    'Successfully saved campaign brief as reusable template (CAM-01)'
  );

  // Clone from template to live campaign
  const liveCampaign = await prisma.campaign.create({
    data: {
      workspaceId: templateCampaign.workspaceId,
      name: 'Q1 UK SME Campaign (from template)',
      objective: templateCampaign.objective,
      icpId: templateCampaign.icpId,
      market: templateCampaign.market,
      locale: templateCampaign.locale,
      channelsJson: templateCampaign.channelsJson,
      funnelStage: templateCampaign.funnelStage,
      offerProductId: templateCampaign.offerProductId,
      tone: templateCampaign.tone,
      targetCta: templateCampaign.targetCta,
      assetVolume: templateCampaign.assetVolume,
      isTemplate: false,
      scheduleStart: new Date(),
      scheduleEnd: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      ownerId: 'user-mktg-lead',
      status: 'ACTIVE',
    },
  });

  assert(
    liveCampaign.isTemplate === false && liveCampaign.status === 'ACTIVE',
    'Successfully instantiated live campaign from template'
  );

  // ---------------------------------------------------------
  // TEST GROUP 4: Advanced Multi-Dimensional Filter Engine (PRD Section 6)
  // ---------------------------------------------------------
  console.log('\n--- 4. Advanced Multi-Dimensional Filter Engine (PRD Section 6) ---');

  const sampleDataset = [
    { id: '1', market: 'UK', funnelStage: 'MID_CONSIDERATION', status: 'ACTIVE', channel: 'LINKEDIN' },
    { id: '2', market: 'UK', funnelStage: 'TOP_AWARENESS', status: 'DRAFT', channel: 'BLOG' },
    { id: '3', market: 'INDIA', funnelStage: 'BOTTOM_DECISION', status: 'ACTIVE', channel: 'EMAIL' },
    { id: '4', market: 'INDIA', funnelStage: 'MID_CONSIDERATION', status: 'COMPLETED', channel: 'LINKEDIN' },
  ];

  // Test AND group filter
  const andFiltered = FilterEngine.filterRecords(sampleDataset, {
    conjunction: 'AND',
    conditions: [
      { field: 'market', operator: 'EQUALS', value: 'UK' },
      { field: 'status', operator: 'EQUALS', value: 'ACTIVE' },
    ],
  });
  assert(
    andFiltered.length === 1 && andFiltered[0].id === '1',
    'Evaluates AND conjunction filter across market and status'
  );

  // Test IN operator filter
  const inFiltered = FilterEngine.filterRecords(sampleDataset, {
    conjunction: 'AND',
    conditions: [
      { field: 'funnelStage', operator: 'IN', value: ['MID_CONSIDERATION', 'BOTTOM_DECISION'] },
    ],
  });
  assert(
    inFiltered.length === 3,
    'Evaluates IN operator filter across multiple funnel stages'
  );

  // Test Presets
  const presets = FilterEngine.getStandardPresets();
  assert(presets.length >= 3, 'Provides preconfigured workflow presets');

  // Clean up temporary test rows to keep mock database concise
  await prisma.campaign.deleteMany({
    where: { id: { in: [templateCampaign.id, liveCampaign.id] } },
  });
  await prisma.iCPPersona.deleteMany({
    where: { id: { in: [testIcp.id, clonedIcp.id] } },
  });

  console.log('\n======================================================');
  console.log(`📊 SPRINT 2 TEST RESULTS: ${passedTests} PASSED, ${failedTests} FAILED`);
  console.log('======================================================\n');

  if (failedTests > 0) {
    process.exit(1);
  }
}

runSprint2Tests()
  .catch((e) => {
    console.error('Sprint 2 tests failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
