/**
 * PCIGP End-to-End Smoke Test for API Route Handlers
 * Verifies Campaign generation, asset persistence, and review workflow
 */

import { GET as getCampaigns } from '../src/app/api/v1/campaigns/route';
import { POST as generatePack } from '../src/app/api/v1/campaigns/[id]/generate/route';
import { POST as submitReview } from '../src/app/api/v1/assets/[id]/reviews/route';
import { GET as getAiAdmin } from '../src/app/api/v1/admin/ai/route';
import { prisma } from '../src/lib/db/prisma';

async function main() {
  console.log('\n🚀 RUNNING PCIGP END-TO-END WORKFLOW TEST...\n');

  // 1. Fetch seeded campaigns
  const campRes = await getCampaigns();
  const campData = await campRes.json();
  console.log(`[1] Fetched ${campData.campaigns.length} active campaigns.`);

  const campaignId = 'camp-uk-automation-01';

  // 2. Generate a weekly content pack
  console.log(`[2] Triggering content pack generation for campaign: ${campaignId}...`);
  const genReq = new Request('http://localhost:3000/api/v1/campaigns/generate', {
    method: 'POST',
    body: JSON.stringify({ channels: ['LINKEDIN', 'EMAIL'] }),
  });

  const genRes = await generatePack(genReq, {
    params: Promise.resolve({ id: campaignId }),
  });
  const genData = await genRes.json();

  if (!genData.success) {
    throw new Error(`Generation failed: ${genData.error}`);
  }

  console.log(`✅ Generated ${genData.generatedAssets.length} grounded channel assets:`);
  for (const asset of genData.generatedAssets) {
    console.log(`   - [${asset.channel}] Status: ${asset.status} | Model: ${asset.model}`);
    console.log(`     Headline: "${asset.headline}"`);
    console.log(`     Compliance Passed: ${asset.complianceReport.passed}`);
  }

  // 3. Submit a Compliance Review decision on the first generated asset
  const targetAssetId = genData.generatedAssets[0].assetId;
  console.log(`\n[3] Submitting human review decision on asset: ${targetAssetId}...`);

  const reviewReq = new Request('http://localhost:3000/api/v1/assets/reviews', {
    method: 'POST',
    body: JSON.stringify({
      decision: 'APPROVED',
      reviewerId: 'user-compliance',
      reviewerRole: 'COMPLIANCE_REVIEWER',
      reason: 'Verified against ASA/CAP and Claim Registry.',
    }),
  });

  const reviewRes = await submitReview(reviewReq, {
    params: Promise.resolve({ id: targetAssetId }),
  });
  const reviewData = await reviewRes.json();

  if (!reviewData.success) {
    throw new Error(`Review failed: ${reviewData.error}`);
  }
  console.log(`✅ Asset status successfully transitioned to: ${reviewData.asset.status}`);

  // 4. Inspect AI Telemetry
  console.log('\n[4] Inspecting AI Gateway Telemetry Ledger...');
  const aiRes = await getAiAdmin();
  const aiData = await aiRes.json();
  console.log(`✅ Total AI invocations logged: ${aiData.summary.totalRequests}`);
  console.log(`   Total tokens: ${aiData.summary.totalTokens}`);
  console.log(`   Active router policies: ${Object.keys(aiData.policies).length}`);

  console.log('\n🎉 ALL SPRINT 1 WORKFLOWS VERIFIED END-TO-END!\n');
}

main()
  .catch((e) => {
    console.error('Smoke test failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

