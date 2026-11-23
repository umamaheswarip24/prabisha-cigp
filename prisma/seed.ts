/**
 * Prabisha Content Intelligence & Growth Platform (PCIGP)
 * Database Seed Script - Populates Realistic Prabisha UK & India Data
 * Aligned with Appendix A & PRD Baseline
 */

import { PrismaClient } from '@prisma/client';
import { INITIAL_COMPLIANCE_RULES } from '../src/lib/compliance/rules';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting PCIGP Database Seeding...');

  // 1. Create Workspace
  const workspace = await prisma.workspace.upsert({
    where: { id: 'prabisha-hq' },
    update: {},
    create: {
      id: 'prabisha-hq',
      name: 'Prabisha Consulting UK & India Growth Ops',
      region: 'UK',
      settingsJson: JSON.stringify({
        defaultLocale: 'en-GB',
        allowedMarkets: ['UK', 'INDIA'],
        enforceSeparationOfDuties: true,
      }),
      retentionPolicy: 'STANDARD_1_YEAR',
    },
  });

  console.log(`✅ Created Workspace: ${workspace.name} (${workspace.id})`);

  // 2. Create Users across Roles
  const users = [
    {
      id: 'user-admin',
      name: 'Pratiksha Sharma (Admin)',
      email: 'admin@prabisha.com',
      role: 'PLATFORM_ADMIN',
    },
    {
      id: 'user-mktg-lead',
      name: 'Alok Kumar (Marketing Lead)',
      email: 'marketing.lead@prabisha.com',
      role: 'MARKETING_LEAD',
    },
    {
      id: 'user-creator',
      name: 'Sneha Patel (Content Creator)',
      email: 'creator@prabisha.com',
      role: 'CONTENT_CREATOR',
    },
    {
      id: 'user-compliance',
      name: 'David Wright (Compliance Reviewer)',
      email: 'compliance@prabisha.co.uk',
      role: 'COMPLIANCE_REVIEWER',
    },
    {
      id: 'user-seo',
      name: 'Rohan Verma (SEO/GEO Specialist)',
      email: 'seo@prabisha.com',
      role: 'SEO_GEO_SPECIALIST',
    },
  ];

  for (const u of users) {
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: {
        id: u.id,
        email: u.email,
        name: u.name,
      },
    });

    await prisma.userMembership.upsert({
      where: {
        userId_workspaceId: {
          userId: user.id,
          workspaceId: workspace.id,
        },
      },
      update: { role: u.role },
      create: {
        userId: user.id,
        workspaceId: workspace.id,
        role: u.role,
        status: 'ACTIVE',
      },
    });
  }
  console.log(`✅ Seeded ${users.length} Users with RBAC Memberships`);

  // 3. Brand Profile
  const brandProfile = await prisma.brandProfile.upsert({
    where: { id: 'brand-prabisha' },
    update: {},
    create: {
      id: 'brand-prabisha',
      workspaceId: workspace.id,
      companyName: 'Prabisha Consulting',
      websitesJson: JSON.stringify(['https://prabisha.com', 'https://prabisha.co.uk']),
      approvedDescriptions: JSON.stringify({
        short: 'Prabisha Consulting is a global digital consulting firm delivering custom AI automation, marketing operations, and enterprise software.',
        long: 'Prabisha Consulting partners with high-growth businesses in the UK and India to modernize operations, scale lead generation, and implement enterprise-grade AI automation with grounded compliance.',
        elevatorPitch: 'We turn fragmented business processes and ungrounded marketing into measurable revenue pipelines.',
      }),
      brandVoiceJson: JSON.stringify({
        tone: ['consultative', 'authoritative', 'clear', 'evidence-backed', 'pragmatic'],
        styleRules: [
          'Lead with business outcomes, not AI hype buzzwords',
          'Cite verified client metrics or regulatory standards',
          'Avoid superlative claims unless backed by exact registry evidence',
        ],
        vocabularyDo: ['streamlined', 'grounded intelligence', 'compliance-first', 'pipeline growth'],
        vocabularyDont: ['guaranteed #1 ranking', 'instant 10x profits', 'magic autopilot'],
      }),
      marketsJson: JSON.stringify(['UK', 'INDIA']),
      contactDetailsJson: JSON.stringify({
        email: 'info@prabisha.com',
        phoneUK: '+44 7904 602334',
        addressUK: 'London, United Kingdom',
        addressIN: 'Noida, Uttar Pradesh, India',
      }),
      version: 1,
    },
  });
  console.log(`✅ Seeded Brand Profile: ${brandProfile.companyName}`);

  // 4. Products & Services
  const services = [
    {
      id: 'prod-ai-automation',
      name: 'Enterprise AI Workflow & Automation Consulting',
      category: 'Digital Operations',
      capabilitiesJson: JSON.stringify([
        'Custom AI agent architecture',
        'End-to-end CRM and ERP workflow synchronization',
        'Intelligent document processing and extraction',
        'Human-in-the-loop compliance gateways',
      ]),
      limitationsJson: JSON.stringify([
        'Does not replace regulated statutory legal counsel',
        'Requires customer-provided API credentials for third-party tools',
      ]),
      targetIndustries: JSON.stringify(['Professional Services', 'Healthcare Ops', 'Manufacturing', 'Fintech']),
      pricingRules: 'Tiered fixed-scope sprints with monthly SLA support options.',
      ctaDestinationUrl: 'https://prabisha.com/services/ai-automation',
      ownerEmail: 'solutions@prabisha.com',
    },
    {
      id: 'prod-content-seo',
      name: 'Content Intelligence & Performance SEO',
      category: 'Growth Marketing',
      capabilitiesJson: JSON.stringify([
        'GEO/AI search visibility optimization',
        'Evidence-backed B2B content packs',
        'Technical on-page SEO and structured schema architecture',
      ]),
      limitationsJson: JSON.stringify([
        'Does not guarantee search ranking positions',
      ]),
      targetIndustries: JSON.stringify(['B2B Technology', 'SaaS', 'Consulting Services']),
      pricingRules: 'Monthly retainer covering weekly multi-channel content packs and reporting.',
      ctaDestinationUrl: 'https://prabisha.com/services/content-intelligence',
      ownerEmail: 'marketing@prabisha.com',
    },
  ];

  for (const s of services) {
    await prisma.productService.upsert({
      where: { id: s.id },
      update: {},
      create: { ...s, workspaceId: workspace.id },
    });
  }
  console.log(`✅ Seeded ${services.length} Product/Service Catalog Items`);

  // 5. Evidence Records
  const evidence1 = await prisma.evidenceRecord.upsert({
    where: { id: 'evi-case-study-402' },
    update: {},
    create: {
      id: 'evi-case-study-402',
      workspaceId: workspace.id,
      title: 'UK Legal & Professional Services Workflow Automation Study',
      scope: 'CASE_STUDY',
      sourceUrlOrFile: 'https://prabisha.com/case-studies/uk-legal-intake-automation.pdf',
      verifiedData: 'Eliminated 14 hours of weekly manual reporting and client onboarding overhead for a 45-person London firm.',
      permissionStatus: 'APPROVED_FOR_PUBLIC',
      owner: 'solutions@prabisha.com',
      verifiedAt: new Date('2026-09-15'),
    },
  });

  const evidence2 = await prisma.evidenceRecord.upsert({
    where: { id: 'evi-iso-cert' },
    update: {},
    create: {
      id: 'evi-iso-cert',
      workspaceId: workspace.id,
      title: 'ISO/IEC 27001 Information Security Certification',
      scope: 'CERTIFICATION',
      sourceUrlOrFile: 'https://prabisha.com/compliance/iso-27001-certificate.pdf',
      verifiedData: 'Certified compliance for data protection, encryption at rest, and tenant security practices.',
      permissionStatus: 'APPROVED_FOR_PUBLIC',
      owner: 'compliance@prabisha.com',
      verifiedAt: new Date('2026-01-10'),
    },
  });
  console.log('✅ Seeded Evidence Records');

  // 6. Claim Registry
  await prisma.claim.upsert({
    where: { id: 'claim-automation-time' },
    update: {},
    create: {
      id: 'claim-automation-time',
      workspaceId: workspace.id,
      exactWording: 'Eliminated 14 hours of weekly manual reporting and client onboarding overhead for a 45-person London firm.',
      evidenceIdsJson: JSON.stringify([evidence1.id]),
      allowedContextsJson: JSON.stringify(['LinkedIn posts', 'Case study briefs', 'Pitch decks']),
      riskLevel: 'LOW',
      status: 'APPROVED',
      reviewer: 'compliance@prabisha.co.uk',
      reviewDate: new Date('2026-10-01'),
    },
  });

  await prisma.claim.upsert({
    where: { id: 'claim-iso-security' },
    update: {},
    create: {
      id: 'claim-iso-security',
      workspaceId: workspace.id,
      exactWording: 'Prabisha Consulting maintains certified ISO/IEC 27001 standards for client data privacy and enterprise workflows.',
      evidenceIdsJson: JSON.stringify([evidence2.id]),
      allowedContextsJson: JSON.stringify(['Security disclaimers', 'Enterprise sales proposals', 'Web copy']),
      riskLevel: 'LOW',
      status: 'APPROVED',
      reviewer: 'compliance@prabisha.co.uk',
      reviewDate: new Date('2026-10-01'),
    },
  });
  console.log('✅ Seeded Claim Registry');

  // 7. ICP Persona (Appendix A)
  const icp = await prisma.iCPPersona.upsert({
    where: { id: 'icp-uk-sme-md' },
    update: {},
    create: {
      id: 'icp-uk-sme-md',
      workspaceId: workspace.id,
      title: 'UK SME Managing Director & Founder',
      industry: 'Professional & Business Services',
      subindustry: 'Consulting, Legal, Accounting, Engineering Services',
      geographyJson: JSON.stringify(['UK']),
      companySizeRange: '15-150 employees',
      buyerRole: 'Managing Director / Chief Executive / Operations Director',
      painPointsJson: JSON.stringify([
        'Repetitive manual administration and cross-tool data entry',
        'Slow client response times due to fragmented workflows',
        'Limited internal engineering capacity to build custom automation',
        'Fear of ungrounded or risky AI hallucinations damaging reputation',
      ]),
      desiredOutcomesJson: JSON.stringify([
        'Shorter customer turnaround and improved service margins',
        'Grounded, compliant operational automation without tech debt',
        'Transparent oversight with clear human-in-the-loop review',
      ]),
      buyingTriggersJson: JSON.stringify([
        'Growing team headcount without proportional margin gains',
        'Losing bids to faster, more automated competitors',
      ]),
      objectionsJson: JSON.stringify([
        'Will AI compromise our client confidentiality?',
        'How long before we see positive ROI?',
      ]),
      exclusionsJson: JSON.stringify([
        'Micro-businesses under 5 employees with no budget',
        'Consumer/retail B2C operations',
      ]),
      recommendedProductsJson: JSON.stringify(['prod-ai-automation']),
      version: 1,
    },
  });
  console.log(`✅ Seeded ICP Persona: ${icp.title}`);

  // 8. Compliance Rules
  for (const rule of INITIAL_COMPLIANCE_RULES) {
    await prisma.complianceRule.upsert({
      where: { id: rule.id },
      update: {},
      create: {
        id: rule.id,
        workspaceId: workspace.id,
        jurisdiction: rule.jurisdiction,
        category: rule.category,
        code: rule.code,
        name: rule.name,
        description: rule.description,
        sourceUrl: rule.sourceUrl,
        effectiveDate: new Date(rule.effectiveDate),
        reviewedDate: new Date(rule.reviewedDate),
        severity: rule.severity,
        prohibitedPatternsJson: JSON.stringify(rule.prohibitedPatterns),
        requiredDisclaimersJson: JSON.stringify(rule.requiredDisclaimers || []),
        owner: rule.owner,
      },
    });
  }
  console.log(`✅ Seeded ${INITIAL_COMPLIANCE_RULES.length} Compliance Rules (UK & India)`);

  // 9. Initial Campaign (PRD Appendix A)
  const campaign = await prisma.campaign.upsert({
    where: { id: 'camp-uk-automation-01' },
    update: {},
    create: {
      id: 'camp-uk-automation-01',
      workspaceId: workspace.id,
      name: 'UK SME AI Automation — Weekly Lead Generation',
      objective: 'Generate 15+ qualified consultation bookings from UK MDs and Operations Heads',
      icpId: icp.id,
      market: 'UK',
      locale: 'en-GB',
      channelsJson: JSON.stringify(['LINKEDIN', 'BLOG', 'EMAIL']),
      funnelStage: 'MID_CONSIDERATION',
      offerProductId: 'prod-ai-automation',
      tone: 'consultative, authoritative, evidence-backed',
      targetCta: 'Request a Prabisha Automation Assessment',
      scheduleStart: new Date('2026-11-15'),
      scheduleEnd: new Date('2026-11-22'),
      ownerId: 'user-mktg-lead',
      status: 'ACTIVE',
    },
  });
  console.log(`✅ Seeded Campaign: ${campaign.name}`);

  console.log('\n🚀 PCIGP Database Seeding Completed Successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

