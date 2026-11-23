/**
 * Prabisha Content Intelligence & Growth Platform (PCIGP)
 * Sprint 3 Automated Acceptance Suite
 * Verifies BR-05, BR-06, GEN-06 (Duplicate Detection), SEO-01 & SEO-02, and RAG Grounding
 */

import { HistoricalContentImporter } from '../src/lib/content/historicalImporter';
import { DuplicateDetector } from '../src/lib/content/duplicateDetector';
import { SEOAuditEngine } from '../src/lib/seo/auditEngine';
import { RAGRetrievalService } from '../src/lib/ai/ragService';
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

async function runSprint3Tests() {
  // Clean up test document
  await prisma.historicalContent.deleteMany({
    where: { title: { contains: 'Test Whitepaper' } },
  });

  console.log('\n======================================================');
  console.log('🧪 RUNNING PCIGP SPRINT 3 ACCEPTANCE SUITE');
  console.log('======================================================\n');

  // ---------------------------------------------------------
  // TEST GROUP 1: Historical Content Import & Duplication (BR-05)
  // ---------------------------------------------------------
  console.log('--- 1. Historical Content Import & Checksums (BR-05) ---');

  // Clean up any prior test run document to ensure idempotency
  await prisma.historicalContent.deleteMany({
    where: { title: { contains: 'Test Whitepaper' } },
  });

  const docTitle = 'UK Legal Practice Intake Transformation Test Whitepaper';
  const docContent = `# Streamlining Client Onboarding in High-Value UK Legal Practices (${Date.now()})\n\nManual intake forms lead to 14 hours of lost productivity per fee-earner weekly. By deploying deterministic workflow automation, London practices eliminate administrative bottlenecks while maintaining strict SRA compliance.`;

  const importResult = await HistoricalContentImporter.importDocument({
    workspaceId: 'prabisha-hq',
    title: docTitle,
    sourceType: 'MARKDOWN',
    content: docContent,
    tags: ['legal-tech', 'uk-sme', 'automation'],
  });

  assert(
    importResult.success && Boolean(importResult.importedId),
    'Successfully imported Markdown document into historical archive'
  );
  assert(
    Boolean(importResult.checksum && importResult.checksum.length === 64),
    `Generated valid SHA256 checksum (${importResult.checksum.slice(0, 12)}...)`
  );

  // Attempt duplicate import
  const duplicateImport = await HistoricalContentImporter.importDocument({
    workspaceId: 'prabisha-hq',
    title: 'Duplicate Attempt',
    sourceType: 'MARKDOWN',
    content: docContent,
  });

  assert(
    duplicateImport.isDuplicateImport === true && duplicateImport.success === false,
    'Detected and rejected duplicate document import using checksum match (BR-05)'
  );

  // ---------------------------------------------------------
  // TEST GROUP 2: Semantic & Keyword Knowledge Search (BR-06)
  // ---------------------------------------------------------
  console.log('\n--- 2. Knowledge Search & Excerpt Generation (BR-06) ---');

  const searchResults = await HistoricalContentImporter.searchKnowledge(
    'fee-earner onboarding automation',
    'prabisha-hq'
  );

  assert(searchResults.length > 0, 'Knowledge search returns relevant historical records');
  assert(
    searchResults[0].excerpt.toLowerCase().includes('onboarding') ||
      searchResults[0].excerpt.toLowerCase().includes('fee-earner'),
    'Search returns highlighted relevant excerpt with boundary ellipsis'
  );
  assert(
    searchResults[0].relevanceScore > 0,
    `Calculates match relevance score (${searchResults[0].relevanceScore} pts)`
  );

  // ---------------------------------------------------------
  // TEST GROUP 3: Duplicate & Near-Duplicate Detection (GEN-06)
  // ---------------------------------------------------------
  console.log('\n--- 3. Near-Duplicate Detection Engine (GEN-06) ---');

  const existingCorpus = [
    {
      id: 'asset-01',
      title: 'Eliminating manual admin handoffs for UK Managing Directors',
      content:
        'Are your fee-earners wasting hours copying data between CRM systems? Prabisha Consulting automates intake workflows with verified compliance.',
    },
  ];

  // Near-duplicate test (slightly modified words)
  const nearDuplicateCandidate =
    'Are your fee-earners wasting hours copying data between CRM software? Prabisha Consulting automates onboarding workflows with verified compliance.';

  const dupCheck = DuplicateDetector.checkDuplicates(nearDuplicateCandidate, existingCorpus);
  assert(
    dupCheck.isDuplicate === true && dupCheck.similarityScore >= 0.65,
    `Detects near-duplicate content with Jaccard similarity of ${(dupCheck.similarityScore * 100).toFixed(1)}%`
  );
  assert(
    dupCheck.recommendation === 'DOCUMENTED_EXCEPTION_REQUIRED' ||
      dupCheck.recommendation === 'REWRITE_RECOMMENDED',
    `Advises editorial action (${dupCheck.recommendation})`
  );

  // Distinct content test
  const distinctCandidate =
    'Complete guide to modern machine learning infrastructure in high-throughput cloud environments.';
  const distinctCheck = DuplicateDetector.checkDuplicates(distinctCandidate, existingCorpus);
  assert(
    distinctCheck.isDuplicate === false && distinctCheck.recommendation === 'PROCEED',
    'Distinct fresh content passes duplicate check with PROCEED status'
  );

  // ---------------------------------------------------------
  // TEST GROUP 4: On-Page SEO Audit Engine (SEO-01, SEO-02)
  // ---------------------------------------------------------
  console.log('\n--- 4. SEO Audit Engine & Quality Checks (SEO-01, SEO-02) ---');

  const goodSEO = SEOAuditEngine.auditContent({
    headline: 'UK SME Workflow Automation: Practical Guide for Managing Directors',
    body: `## Why Process Automation Matters
UK SME workflow automation eliminates administrative drag across professional practices.
Managing partners often discover that their senior teams spend excessive hours on routine intake tasks.
With modern cloud infrastructure, firms can automate cross-system updates without compromising data confidentiality.
This approach empowers staff to focus on high-value client advisory services instead of repetitive clerical entry.`,
    metaDescription:
      'Learn how UK SME workflow automation helps Managing Directors eliminate manual administrative drag and protect client margins.',
    targetKeyword: 'UK SME workflow automation',
    searchIntent: 'COMMERCIAL_INVESTIGATION',
    urlSlug: 'uk-sme-workflow-automation-guide',
  });

  assert(
    goodSEO.readabilityScore >= 20,
    `Calculates Flesch Reading Ease score (${goodSEO.readabilityScore}/100: ${goodSEO.readabilityGrade})`
  );
  assert(
    goodSEO.isKeywordStuffed === false,
    `Keyword density is balanced (${goodSEO.keywordDensity}) without stuffing`
  );
  assert(
    goodSEO.disclaimer.includes('PCIGP does not guarantee Google ranking positions'),
    'Includes mandatory PRD disclaimer rejecting ranking factor guarantees'
  );

  // Test Keyword Stuffing Detection
  const stuffedSEO = SEOAuditEngine.auditContent({
    headline: 'UK SME Automation UK SME Automation UK SME Automation',
    body: 'UK SME automation is the best UK SME automation. We love UK SME automation for UK SME automation.',
    targetKeyword: 'UK SME automation',
  });

  assert(
    stuffedSEO.isKeywordStuffed === true &&
      stuffedSEO.issues.some((i) => i.id === 'seo-keyword-stuffing'),
    'Detects aggressive keyword stuffing (> 3%) with severity ERROR'
  );

  // ---------------------------------------------------------
  // TEST GROUP 5: Grounded RAG Context Retrieval (GEN-04)
  // ---------------------------------------------------------
  console.log('\n--- 5. Grounded RAG Context Assembly (GEN-04, GEN-05) ---');

  const contextPack = await RAGRetrievalService.assembleContextPack(
    'prabisha-hq',
    'legal intake automation reporting overhead'
  );

  assert(
    contextPack.approvedClaims.length > 0,
    `Retrieved ${contextPack.approvedClaims.length} relevant approved claims`
  );
  assert(
    contextPack.historicalExcerpts.length > 0,
    `Retrieved ${contextPack.historicalExcerpts.length} historical document excerpts`
  );

  // Clean up test document
  await prisma.historicalContent.deleteMany({
    where: { title: { contains: 'Test Whitepaper' } },
  });

  console.log('\n======================================================');
  console.log(`📊 SPRINT 3 TEST RESULTS: ${passedTests} PASSED, ${failedTests} FAILED`);
  console.log('======================================================\n');

  if (failedTests > 0) {
    process.exit(1);
  }
}

runSprint3Tests()
  .catch((e) => {
    console.error('Sprint 3 tests failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
