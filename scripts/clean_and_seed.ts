import { PrismaClient } from '@prisma/client';
import { INITIAL_COMPLIANCE_RULES } from '../src/lib/compliance/rules';

const prisma = new PrismaClient();

async function cleanAndSeed() {
  console.log('🧹 Cleaning up database...');

  // Delete dependent rows first to prevent FK issues
  await prisma.publication.deleteMany({});
  await prisma.metricSnapshot.deleteMany({});
  await prisma.reviewDecision.deleteMany({});
  await prisma.contentVersion.deleteMany({});
  await prisma.contentAsset.deleteMany({});
  await prisma.campaign.deleteMany({});
  await prisma.iCPPersona.deleteMany({});
  await prisma.claim.deleteMany({});
  await prisma.evidenceRecord.deleteMany({});
  await prisma.productService.deleteMany({});
  await prisma.brandProfile.deleteMany({});
  await prisma.complianceRule.deleteMany({});
  await prisma.auditEvent.deleteMany({});
  await prisma.aIRequestLog.deleteMany({});
  await prisma.historicalContent.deleteMany({});
  await prisma.userMembership.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.workspace.deleteMany({});

  console.log('🌱 Seeding lean, concise mock data for PCIGP...');

  // 1. Workspace
  const workspace = await prisma.workspace.create({
    data: {
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

  // 2. Users (5 key personas for RBAC)
  const users = [
    { id: 'user-admin', name: 'Pratiksha Sharma (Admin)', email: 'admin@prabisha.com', role: 'PLATFORM_ADMIN' },
    { id: 'user-mktg-lead', name: 'Alok Kumar (Marketing Lead)', email: 'marketing.lead@prabisha.com', role: 'MARKETING_LEAD' },
    { id: 'user-creator', name: 'Sneha Patel (Content Creator)', email: 'creator@prabisha.com', role: 'CONTENT_CREATOR' },
    { id: 'user-compliance', name: 'David Wright (Compliance Reviewer)', email: 'compliance@prabisha.co.uk', role: 'COMPLIANCE_REVIEWER' },
    { id: 'user-seo', name: 'Rohan Verma (SEO/GEO Specialist)', email: 'seo@prabisha.com', role: 'SEO_GEO_SPECIALIST' },
  ];

  for (const u of users) {
    const user = await prisma.user.create({
      data: { id: u.id, email: u.email, name: u.name },
    });
    await prisma.userMembership.create({
      data: { userId: user.id, workspaceId: workspace.id, role: u.role, status: 'ACTIVE' },
    });
  }

  // 3. Brand Profile
  await prisma.brandProfile.create({
    data: {
      id: 'brand-prabisha',
      workspaceId: workspace.id,
      companyName: 'Prabisha Consulting',
      websitesJson: JSON.stringify(['https://prabisha.com', 'https://prabisha.co.uk']),
      approvedDescriptions: JSON.stringify({
        short: 'Prabisha Consulting is a global consulting firm delivering custom AI automation and growth operations.',
        long: 'Prabisha Consulting partners with high-growth businesses in the UK and India to modernize operations and implement grounded AI automation.',
        elevatorPitch: 'We turn fragmented business processes into measurable revenue pipelines.',
      }),
      brandVoiceJson: JSON.stringify({
        tone: ['consultative', 'authoritative', 'clear', 'evidence-backed', 'pragmatic'],
        styleRules: ['Lead with business outcomes, not AI hype buzzwords', 'Cite verified client metrics or regulatory standards'],
        vocabularyDo: ['streamlined', 'grounded intelligence', 'compliance-first', 'pipeline growth'],
        vocabularyDont: ['guaranteed #1 ranking', 'instant 10x profits', 'magic autopilot'],
      }),
      marketsJson: JSON.stringify(['UK', 'INDIA']),
      contactDetailsJson: JSON.stringify({ email: 'info@prabisha.com', addressUK: 'London, United Kingdom' }),
      version: 1,
    },
  });

  // 4. Products / Services (Just 2 clean items)
  await prisma.productService.create({
    data: {
      id: 'prod-ai-automation',
      workspaceId: workspace.id,
      name: 'Enterprise AI Workflow & Automation Consulting',
      category: 'Digital Operations',
      capabilitiesJson: JSON.stringify(['Custom AI workflow automation', 'Intelligent document extraction', 'Human-in-the-loop review']),
      limitationsJson: JSON.stringify(['Requires customer-provided API credentials']),
      targetIndustries: JSON.stringify(['Professional Services', 'Fintech']),
      pricingRules: 'Fixed-scope pilot sprints with monthly SLA support.',
      ctaDestinationUrl: 'https://prabisha.com/services/ai-automation',
      ownerEmail: 'solutions@prabisha.com',
    },
  });

  await prisma.productService.create({
    data: {
      id: 'prod-content-seo',
      workspaceId: workspace.id,
      name: 'Content Intelligence & Performance SEO',
      category: 'Growth Marketing',
      capabilitiesJson: JSON.stringify(['GEO search visibility optimization', 'Evidence-backed B2B content packs']),
      limitationsJson: JSON.stringify(['Does not guarantee search ranking positions']),
      targetIndustries: JSON.stringify(['B2B Technology', 'Consulting']),
      pricingRules: 'Monthly retainer covering weekly content packs.',
      ctaDestinationUrl: 'https://prabisha.com/services/content-intelligence',
      ownerEmail: 'marketing@prabisha.com',
    },
  });

  // 5. Evidence Records (Just 2 clean proofs)
  const evidence1 = await prisma.evidenceRecord.create({
    data: {
      id: 'evi-case-study-402',
      workspaceId: workspace.id,
      title: 'UK Legal & Professional Services Workflow Automation Study',
      scope: 'CASE_STUDY',
      sourceUrlOrFile: 'https://prabisha.com/case-studies/uk-legal-intake-automation.pdf',
      verifiedData: 'Delivers an audited 42% reduction in repetitive back-office task cycle times across 6 months.',
      permissionStatus: 'APPROVED_FOR_PUBLIC',
      owner: 'solutions@prabisha.com',
      verifiedAt: new Date('2026-09-15'),
    },
  });

  const evidence2 = await prisma.evidenceRecord.create({
    data: {
      id: 'evi-iso-cert',
      workspaceId: workspace.id,
      title: 'ISO/IEC 27001 Information Security Certification',
      scope: 'CERTIFICATION',
      sourceUrlOrFile: 'https://prabisha.com/compliance/iso-27001-certificate.pdf',
      verifiedData: 'Certified compliance for data protection and encryption at rest.',
      permissionStatus: 'APPROVED_FOR_PUBLIC',
      owner: 'compliance@prabisha.com',
      verifiedAt: new Date('2026-01-10'),
    },
  });

  // 6. Claims Registry (Just 2 verified claims)
  await prisma.claim.create({
    data: {
      id: 'claim-automation-time',
      workspaceId: workspace.id,
      exactWording: 'Delivers an audited 42% reduction in repetitive back-office task cycle times across 6 months.',
      evidenceIdsJson: JSON.stringify([evidence1.id]),
      allowedContextsJson: JSON.stringify(['LinkedIn posts', 'Case study briefs']),
      riskLevel: 'LOW',
      status: 'APPROVED',
      reviewer: 'compliance@prabisha.co.uk',
      reviewDate: new Date('2026-10-01'),
    },
  });

  await prisma.claim.create({
    data: {
      id: 'claim-iso-security',
      workspaceId: workspace.id,
      exactWording: 'Prabisha Consulting maintains certified ISO/IEC 27001 standards for client data privacy and enterprise workflows.',
      evidenceIdsJson: JSON.stringify([evidence2.id]),
      allowedContextsJson: JSON.stringify(['Security disclaimers', 'Web copy']),
      riskLevel: 'LOW',
      status: 'APPROVED',
      reviewer: 'compliance@prabisha.co.uk',
      reviewDate: new Date('2026-10-01'),
    },
  });

  // 7. ICP Personas (Just 2 clean target profiles)
  const icp1 = await prisma.iCPPersona.create({
    data: {
      id: 'icp-uk-sme-md',
      workspaceId: workspace.id,
      title: 'UK SME Managing Director & Founder',
      industry: 'Professional & Business Services',
      subindustry: 'Consulting, Legal, Accounting',
      geographyJson: JSON.stringify(['UK']),
      companySizeRange: '15-150 employees',
      buyerRole: 'Managing Director / Chief Executive',
      painPointsJson: JSON.stringify([
        'Repetitive manual administration and cross-tool data entry',
        'Slow client response times due to fragmented workflows',
      ]),
      desiredOutcomesJson: JSON.stringify([
        'Shorter customer turnaround and improved service margins',
        'Grounded, compliant operational automation without tech debt',
      ]),
      buyingTriggersJson: JSON.stringify(['Growing team headcount without proportional margin gains']),
      objectionsJson: JSON.stringify(['Will AI compromise client confidentiality?']),
      exclusionsJson: JSON.stringify(['Micro-businesses under 5 employees']),
      recommendedProductsJson: JSON.stringify(['prod-ai-automation']),
      version: 1,
    },
  });

  await prisma.iCPPersona.create({
    data: {
      id: 'icp-in-retail-founder',
      workspaceId: workspace.id,
      title: 'Indian Retail & D2C Brand Founder',
      industry: 'Consumer Retail & E-Commerce',
      subindustry: 'Direct-to-Consumer Brands',
      geographyJson: JSON.stringify(['INDIA']),
      companySizeRange: '10-100 employees',
      buyerRole: 'Founder & CEO',
      painPointsJson: JSON.stringify([
        'High marketplace commissions',
        'Lack of owned direct-to-consumer digital channels',
      ]),
      desiredOutcomesJson: JSON.stringify([
        'Direct customer acquisition with automated WhatsApp / CRM engagement',
      ]),
      buyingTriggersJson: JSON.stringify(['Festive season demand spike']),
      exclusionsJson: JSON.stringify(['Physical-only unorganized stores']),
      recommendedProductsJson: JSON.stringify(['prod-content-seo']),
      version: 1,
    },
  });

  // 8. Compliance Rules
  for (const rule of INITIAL_COMPLIANCE_RULES) {
    await prisma.complianceRule.create({
      data: {
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

  // 9. Campaigns (Exactly 2 clean items: 1 Active, 1 Template)
  const campaign = await prisma.campaign.create({
    data: {
      id: 'camp-uk-automation-01',
      workspaceId: workspace.id,
      name: 'UK SME AI Automation — Weekly Lead Generation',
      objective: 'Generate 15+ qualified consultation bookings from UK MDs and Operations Heads',
      icpId: icp1.id,
      market: 'UK',
      locale: 'en-GB',
      channelsJson: JSON.stringify(['LINKEDIN', 'EMAIL', 'BLOG']),
      funnelStage: 'MID_CONSIDERATION',
      offerProductId: 'prod-ai-automation',
      tone: 'consultative, authoritative, evidence-backed',
      targetCta: 'Request a Prabisha Automation Assessment',
      scheduleStart: new Date('2026-11-20'),
      scheduleEnd: new Date('2026-11-27'),
      ownerId: 'user-mktg-lead',
      status: 'ACTIVE',
      isTemplate: false,
    },
  });

  await prisma.campaign.create({
    data: {
      id: 'camp-template-weekly-leadgen',
      workspaceId: workspace.id,
      name: 'Template: UK SME Weekly Lead Gen Brief',
      objective: 'Standardized weekly B2B lead generation campaign template for UK SME market',
      icpId: icp1.id,
      market: 'UK',
      locale: 'en-GB',
      channelsJson: JSON.stringify(['LINKEDIN', 'EMAIL']),
      funnelStage: 'MID_CONSIDERATION',
      offerProductId: 'prod-ai-automation',
      tone: 'consultative, authoritative, evidence-backed',
      targetCta: 'Book an Automation Assessment',
      scheduleStart: new Date('2026-11-20'),
      scheduleEnd: new Date('2026-11-27'),
      ownerId: 'user-mktg-lead',
      status: 'DRAFT',
      isTemplate: true,
      templateName: 'Weekly SME Lead Gen Pack',
    },
  });

  // 10. Exactly 3 Assets under the Active Campaign (1 Approved, 1 Needs Review, 1 Scheduled)
  // Asset 1: Approved LinkedIn Post (Published)
  const asset1 = await prisma.contentAsset.create({
    data: {
      id: 'asset-linkedin-01',
      campaignId: campaign.id,
      channel: 'LINKEDIN',
      format: 'SOCIAL_POST',
      status: 'APPROVED',
      targetCtaUrl: 'https://prabisha.com/services/ai-automation?utm_source=linkedin&utm_campaign=uk_sme_ai_automation',
      scheduledDate: new Date('2026-11-25T10:00:00Z'),
    },
  });

  await prisma.contentVersion.create({
    data: {
      id: 'ver-linkedin-01',
      assetId: asset1.id,
      versionNumber: 1,
      headline: 'Streamline Your Service Workflows With Prabisha AI Automation',
      body: 'Growing UK professional service firms face rising operational overheads. With Prabisha Consulting enterprise workflow automation, our verified client implementation delivered an audited 42% reduction in repetitive back-office task cycle times across 6 months. Request an initial consultation to review your automation roadmap.',
      callToAction: 'Book an Automation Assessment',
      createdBy: 'user-creator',
    },
  });

  // Asset 2: Email Newsletter (NEEDS_REVIEW - ready for demoing compliance approval)
  const asset2 = await prisma.contentAsset.create({
    data: {
      id: 'asset-email-02',
      campaignId: campaign.id,
      channel: 'EMAIL',
      format: 'EMAIL_NEWSLETTER',
      status: 'NEEDS_REVIEW',
      targetCtaUrl: 'https://prabisha.com/services/ai-automation',
    },
  });

  await prisma.contentVersion.create({
    data: {
      id: 'ver-email-02',
      assetId: asset2.id,
      versionNumber: 1,
      headline: 'How UK Service Leaders Are Eliminating 14 Hours of Admin Every Week',
      body: 'Manual reporting and disjointed spreadsheets slow client delivery. Prabisha Consulting enterprise automation solutions enable UK firms to streamline case intake and billing workflows securely.',
      callToAction: 'Schedule a 15-Minute Discovery Call',
      createdBy: 'user-creator',
    },
  });

  // Asset 3: Blog Article (SCHEDULED - for publishing calendar)
  const asset3 = await prisma.contentAsset.create({
    data: {
      id: 'asset-blog-03',
      campaignId: campaign.id,
      channel: 'BLOG',
      format: 'LONG_FORM_ARTICLE',
      status: 'SCHEDULED',
      targetCtaUrl: 'https://prabisha.com/services/ai-automation',
      scheduledDate: new Date('2026-11-26T14:00:00Z'),
    },
  });

  await prisma.contentVersion.create({
    data: {
      id: 'ver-blog-03',
      assetId: asset3.id,
      versionNumber: 1,
      headline: 'The Practical Executive Guide to Grounded B2B Workflow Automation',
      body: 'Why ungrounded AI models pose compliance risks to professional firms, and how evidence-backed architecture delivers measurable ROI without compromising client data.',
      callToAction: 'Download the Executive Automation Whitepaper',
      createdBy: 'user-creator',
    },
  });

  // 11. Historical Content (Just 2 clean reference documents)
  await prisma.historicalContent.create({
    data: {
      workspaceId: workspace.id,
      title: 'Prabisha Q3 Client Results & Automation Impact Brief',
      sourceType: 'CASE_STUDY',
      sourceUrl: 'https://prabisha.com/case-studies/q3-impact.pdf',
      content: 'Case summary: Across 45 deployments in London and Manchester, automated workflows reduced onboarding latency by 3.5x while upholding strict GDPR compliance standards.',
      tagsJson: JSON.stringify(['case-study', 'uk-market', 'automation']),
      checksum: 'sha256-q3-brief-001',
    },
  });

  await prisma.historicalContent.create({
    data: {
      workspaceId: workspace.id,
      title: 'Making Tax Digital & Cloud Practice Modernisation Guide',
      sourceType: 'WHITE_PAPER',
      sourceUrl: 'https://prabisha.co.uk/guides/mtd-modernisation.pdf',
      content: 'Technical overview of cloud migration strategies for mid-market UK accountancy practices navigating HMRC digital compliance mandates.',
      tagsJson: JSON.stringify(['guide', 'uk-accounting', 'mtd']),
      checksum: 'sha256-mtd-guide-002',
    },
  });

  console.log('✨ Clean, concise mock dataset seeded successfully!');
  console.log('- 1 Workspace (prabisha-hq)');
  console.log('- 2 Product/Service items');
  console.log('- 2 Verified Evidence Records & Claims');
  console.log('- 2 Target Audiences (UK & India)');
  console.log('- 2 Campaigns (1 Active, 1 Template)');
  console.log('- 3 Content Assets (1 Approved, 1 Needs Review, 1 Scheduled)');
  console.log('- 2 Historical documents');
}

cleanAndSeed()
  .catch((e) => {
    console.error('Failed to clean and seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
