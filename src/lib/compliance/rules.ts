/**
 * Prabisha Content Intelligence & Growth Platform (PCIGP)
 * Compliance Rule Packs for UK and India Jurisdictions
 * Aligned with ASA/CAP, ICO Direct Marketing, ASCI, and DPDP regulations
 */

import { ComplianceRule } from '@/types';

export const INITIAL_COMPLIANCE_RULES: ComplianceRule[] = [
  // --------------------------------------------------------------------------
  // United Kingdom Rule Packs (ASA/CAP & ICO PECR/UK GDPR)
  // --------------------------------------------------------------------------
  {
    id: 'uk-cap-01',
    jurisdiction: 'UK',
    category: 'CLAIMS_SUBSTANTIATION',
    code: 'UK_CAP_SUBSTANTIATION',
    name: 'ASA/CAP Rule 3.7 - Objective Claim Substantiation',
    description: 'Before distributing marketing communications, marketers must hold documentary evidence to substantiate all objective claims, whether direct or implied.',
    sourceUrl: 'https://www.asa.org.uk/codes-and-rulings/advertising-codes.html',
    effectiveDate: '2026-01-01',
    reviewedDate: '2026-10-25',
    severity: 'CRITICAL_BLOCK',
    prohibitedPatterns: [
      'guaranteed #1 ranking',
      'guaranteed #1 google ranking',
      'guarantees your website will rank #1',
      'guarantee 10x ROI',
      '100% success rate without proof',
      'proven to double your leads overnight',
      'double your revenue overnight',
      'the best marketing agency in the world',
      'undisputed market leader',
    ],
    owner: 'Prabisha UK Compliance Officer',
  },
  {
    id: 'uk-cap-02',
    jurisdiction: 'UK',
    category: 'ADVERTISING_STANDARDS',
    code: 'UK_CAP_SCARCITY',
    name: 'ASA/CAP Rule 3.1 - Misleading Omissions & Fake Scarcity',
    description: 'Marketing communications must not mislead consumers by creating false urgency, artificial scarcity, or deceptive countdown timers.',
    sourceUrl: 'https://www.asa.org.uk/codes-and-rulings/advertising-codes.html',
    effectiveDate: '2026-01-01',
    reviewedDate: '2026-10-25',
    severity: 'CRITICAL_BLOCK',
    prohibitedPatterns: [
      'only 1 spot remaining',
      'only 2 spots left',
      'only 2 consultations left',
      'expires in 10 minutes',
      'price doubles in 10 minutes',
      'limited spots available today only',
      'last chance before price increases forever',
    ],
    owner: 'Prabisha UK Compliance Officer',
  },
  {
    id: 'uk-ico-03',
    jurisdiction: 'UK',
    category: 'PRIVACY_DIRECT_MARKETING',
    code: 'UK_ICO_DIRECT_MARKETING',
    name: 'ICO Direct Marketing & PECR Compliance',
    description: 'Direct marketing emails to individual subscribers require prior opt-in consent; B2B marketing must include a clear, free opt-out/unsubscribe mechanism.',
    sourceUrl: 'https://ico.org.uk/for-organisations/direct-marketing-and-privacy-and-electronic-communications/',
    effectiveDate: '2026-01-01',
    reviewedDate: '2026-10-25',
    severity: 'CRITICAL_BLOCK',
    prohibitedPatterns: [
      'purchased contact lists without consent',
      'no-reply unmonitored mailbox',
    ],
    requiredDisclaimers: [
      'To unsubscribe or update your preferences, click here or reply with "UNSUBSCRIBE". Prabisha Consulting Ltd, registered in England & Wales.',
    ],
    owner: 'Prabisha UK DPO',
  },

  // --------------------------------------------------------------------------
  // India Rule Packs (ASCI & Digital Personal Data Protection Act)
  // --------------------------------------------------------------------------
  {
    id: 'in-asci-01',
    jurisdiction: 'INDIA',
    category: 'CLAIMS_SUBSTANTIATION',
    code: 'IN_ASCI_HONEST_CLAIMS',
    name: 'ASCI Chapter I - Honest Representations',
    description: 'Advertisements shall neither distort facts nor mislead the consumer as to the true capabilities or performance of the service offered.',
    sourceUrl: 'https://ascionline.in/',
    effectiveDate: '2026-01-01',
    reviewedDate: '2026-10-25',
    severity: 'CRITICAL_BLOCK',
    prohibitedPatterns: [
      '100% placement guarantee',
      'guaranteed income',
      'zero risk investment',
      'no effort passive revenue',
    ],
    owner: 'Prabisha India Legal Counsel',
  },
  {
    id: 'in-asci-02',
    jurisdiction: 'INDIA',
    category: 'DISCLAIMERS',
    code: 'IN_ASCI_DISCLAIMERS',
    name: 'ASCI Guidelines on Disclaimers in Commercial Communication',
    description: 'Disclaimers must be legible, prominent, in the same language as the advertisement, and must not contradict the main claim.',
    sourceUrl: 'https://ascionline.in/',
    effectiveDate: '2026-01-01',
    reviewedDate: '2026-10-25',
    severity: 'MEDIUM',
    prohibitedPatterns: [
      '*terms apply in illegible font',
      'unsupported asterisk disclaimer',
    ],
    owner: 'Prabisha India Legal Counsel',
  },
  {
    id: 'in-dpdp-03',
    jurisdiction: 'INDIA',
    category: 'PRIVACY_DIRECT_MARKETING',
    code: 'IN_DPDP_CONSENT',
    name: 'DPDP Act - Notice and Purpose Specification',
    description: 'Data principals must be given clear notice regarding the specific purpose for which their personal data is collected during marketing forms or consultation bookings.',
    sourceUrl: 'https://www.meity.gov.in/',
    effectiveDate: '2026-01-01',
    reviewedDate: '2026-10-25',
    severity: 'HIGH',
    prohibitedPatterns: [
      'data will be shared with third parties without notice',
    ],
    requiredDisclaimers: [
      'Information collected is processed in accordance with the Digital Personal Data Protection Act by Prabisha Consulting.',
    ],
    owner: 'Prabisha India Compliance Officer',
  },
];

