/**
 * Prabisha Content Intelligence & Growth Platform (PCIGP)
 * Core Domain Types & Enumerations
 * Aligned with PRD v1.0 specifications
 */

// -------------------------------------------------------------
// 1. Roles & Permissions (PRD Section 3)
// -------------------------------------------------------------
export type UserRole =
  | 'PLATFORM_ADMIN'
  | 'MARKETING_LEAD'
  | 'CONTENT_CREATOR'
  | 'SEO_GEO_SPECIALIST'
  | 'COMPLIANCE_REVIEWER'
  | 'SALES_CRM'
  | 'READ_ONLY_EXEC';

export type Permission =
  | 'workspace:manage'
  | 'workspace:read'
  | 'brand:manage'
  | 'brand:read'
  | 'catalog:manage'
  | 'catalog:read'
  | 'evidence:manage'
  | 'evidence:verify'
  | 'evidence:read'
  | 'claims:manage'
  | 'claims:approve'
  | 'claims:read'
  | 'icp:manage'
  | 'icp:read'
  | 'campaigns:create'
  | 'campaigns:edit'
  | 'campaigns:read'
  | 'content:generate'
  | 'content:edit'
  | 'content:review'
  | 'content:override_compliance'
  | 'content:schedule'
  | 'content:publish'
  | 'seo:manage'
  | 'compliance:manage_rules'
  | 'compliance:review'
  | 'ai:configure'
  | 'audit:read';

// -------------------------------------------------------------
// 2. Lifecycle & Content State Machine (PRD Section 11)
// -------------------------------------------------------------
export type ContentState =
  | 'DRAFT'
  | 'VALIDATING'
  | 'NEEDS_REVIEW'
  | 'CHANGES_REQUESTED'
  | 'APPROVED'
  | 'SCHEDULED'
  | 'PUBLISHED'
  | 'REJECTED'
  | 'FAILED'
  | 'ARCHIVED';

export type AssetChannel =
  | 'LINKEDIN'
  | 'BLOG'
  | 'EMAIL'
  | 'WEBSITE_LANDING'
  | 'TWITTER_X'
  | 'YOUTUBE_SCRIPT';

export type AssetFormat =
  | 'SOCIAL_POST'
  | 'LONG_FORM_ARTICLE'
  | 'EMAIL_NEWSLETTER'
  | 'CAROUSEL_SLIDES'
  | 'SHORT_VIDEO_SCRIPT'
  | 'FAQ_SECTION';

// -------------------------------------------------------------
// 3. Markets & Jurisdictions (PRD Section 1 & 5.7)
// -------------------------------------------------------------
export type MarketJurisdiction = 'UK' | 'INDIA' | 'GLOBAL';

export type ComplianceSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL_BLOCK';

export interface ComplianceRule {
  id: string;
  jurisdiction: MarketJurisdiction;
  category: 'ADVERTISING_STANDARDS' | 'PRIVACY_DIRECT_MARKETING' | 'CLAIMS_SUBSTANTIATION' | 'DISCLAIMERS';
  code: string;
  name: string;
  description: string;
  sourceUrl: string;
  effectiveDate: string;
  reviewedDate: string;
  severity: ComplianceSeverity;
  prohibitedPatterns: string[];
  requiredDisclaimers?: string[];
  owner: string;
}

// -------------------------------------------------------------
// 4. Grounded Knowledge & Claim Registry (PRD Section 5.1)
// -------------------------------------------------------------
export interface BrandProfile {
  id: string;
  workspaceId: string;
  companyName: string;
  websites: string[];
  approvedDescriptions: {
    short: string;
    long: string;
    elevatorPitch: string;
  };
  brandVoice: {
    tone: string[];
    styleRules: string[];
    vocabularyDo: string[];
    vocabularyDont: string[];
  };
  markets: MarketJurisdiction[];
  contactDetails: {
    email: string;
    phone?: string;
    addressUK?: string;
    addressIN?: string;
  };
  version: number;
}

export interface ProductService {
  id: string;
  workspaceId: string;
  name: string;
  category: string;
  capabilities: string[];
  limitations: string[];
  targetIndustries: string[];
  pricingRules?: string;
  ctaDestinationUrl: string;
  ownerEmail: string;
}

export type EvidenceScope = 'CASE_STUDY' | 'STATISTIC' | 'TESTIMONIAL' | 'CERTIFICATION' | 'WHITEPAPER';

export interface EvidenceRecord {
  id: string;
  workspaceId: string;
  title: string;
  scope: EvidenceScope;
  sourceUrlOrFile: string;
  verifiedData: string;
  permissionStatus: 'APPROVED_FOR_PUBLIC' | 'CONFIDENTIAL_INTERNAL' | 'PENDING_CONSENT';
  owner: string;
  verifiedAt: string;
  expiresAt?: string;
}

export interface Claim {
  id: string;
  workspaceId: string;
  exactWording: string;
  evidenceIds: string[]; // Links to EvidenceRecord
  allowedContexts: string[];
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  status: 'APPROVED' | 'PENDING_REVIEW' | 'EXPIRED' | 'REJECTED';
  reviewer: string;
  reviewDate: string;
  expiresAt?: string;
}

// -------------------------------------------------------------
// 5. ICP & Persona Management (PRD Section 5.2)
// -------------------------------------------------------------
export interface ICPPersona {
  id: string;
  workspaceId: string;
  title: string;
  industry: string;
  subindustry?: string;
  geography: MarketJurisdiction[];
  companySizeRange: string;
  revenueBand?: string;
  businessModel?: string;
  maturity?: string;
  buyingCapacity?: string;
  buyerRole: string;
  painPoints: string[];
  desiredOutcomes: string[];
  buyingTriggers: string[];
  objections: string[];
  exclusions: string[];
  jobsToBeDone?: string[];
  recommendedProductIds: string[];
  fitScoreWeights?: {
    industry: number;
    companySize: number;
    painRelevance: number;
    budgetMatch: number;
  };
  clonedFromId?: string;
  version: number;
}

export interface ICPFitScoreComponent {
  name: string;
  score: number; // 0 - 100
  weight: number; // Percentage, e.g. 25
  weightedScore: number;
  reason: string;
}

export interface ICPFitScoreResult {
  totalScore: number; // 0 - 100
  tier: 'TIER_1_EXCELLENT_FIT' | 'TIER_2_MODERATE_FIT' | 'TIER_3_LOW_FIT';
  isHeuristic: boolean; // Must be labelled heuristic until calibrated per ICP-04
  components: ICPFitScoreComponent[];
  recommendations: string[];
}

// -------------------------------------------------------------
// 6. Campaign Planning & Content Brief (PRD Section 5.3 & Appendix A)
// -------------------------------------------------------------
export interface Campaign {
  id: string;
  workspaceId: string;
  name: string;
  objective: string;
  icpId: string;
  market: MarketJurisdiction;
  locale: string; // e.g. "en-GB" or "en-IN"
  channels: AssetChannel[];
  funnelStage: 'TOP_AWARENESS' | 'MID_CONSIDERATION' | 'BOTTOM_DECISION';
  offerProductId: string;
  tone: string;
  targetCta: string;
  scheduleStart: string;
  scheduleEnd: string;
  ownerId: string;
  status: 'DRAFT' | 'ACTIVE' | 'COMPLETED' | 'PAUSED';
  isTemplate?: boolean;
  templateName?: string;
  assetVolume?: number;
  theme?: string;
  rationale?: string;
  successMetrics?: string;
}

// -------------------------------------------------------------
// 6.1 Advanced Filter Engine (PRD Section 6)
// -------------------------------------------------------------
export type FilterOperator =
  | 'EQUALS'
  | 'NOT_EQUALS'
  | 'CONTAINS'
  | 'IN'
  | 'NOT_IN'
  | 'GREATER_THAN'
  | 'LESS_THAN';

export interface FilterCondition {
  field: string;
  operator: FilterOperator;
  value: string | number | boolean | string[];
}

export interface FilterGroup {
  conjunction: 'AND' | 'OR';
  conditions: FilterCondition[];
}

export interface SavedFilterView {
  id: string;
  workspaceId: string;
  name: string;
  category: 'CAMPAIGNS' | 'ASSETS' | 'ICPS' | 'KNOWLEDGE';
  filterGroup: FilterGroup;
  createdBy: string;
}

export interface ContentAsset {
  id: string;
  campaignId: string;
  channel: AssetChannel;
  format: AssetFormat;
  status: ContentState;
  currentVersionId?: string;
  targetCtaUrl: string;
  utmParameters?: {
    source: string;
    medium: string;
    campaign: string;
    term?: string;
    content?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ContentVersion {
  id: string;
  assetId: string;
  versionNumber: number;
  headline?: string;
  body: string;
  callToAction: string;
  hookVariant?: string;
  angleVariant?: string;
  metadata: {
    seoTitle?: string;
    metaDescription?: string;
    targetKeywords?: string[];
    readabilityScore?: number;
    wordCount: number;
  };
  grounding: {
    retrievedEvidenceIds: string[];
    referencedClaimIds: string[];
    unverifiedClaimsWarnings: string[];
  };
  modelMetadata: {
    provider: string;
    model: string;
    promptVersion: string;
    temperature?: number;
    tokensUsed?: number;
    latencyMs?: number;
  };
  createdBy: string;
  createdAt: string;
}

// -------------------------------------------------------------
// 7. Validation, Review & Audit (PRD Section 5.7 & 9)
// -------------------------------------------------------------
export interface ValidationResult {
  assetId: string;
  versionId: string;
  passed: boolean;
  score: number; // 0 - 100
  checks: {
    factualGrounding: { passed: boolean; details: string; unverifiedClaims: string[] };
    brandVoice: { passed: boolean; details: string };
    seoChecks: { passed: boolean; details: string; recommendations: string[] };
    complianceChecks: { passed: boolean; severity: ComplianceSeverity; flags: string[] };
    duplicationWarning?: { similarAssetId?: string; similarityScore?: number };
  };
}

export interface ReviewDecision {
  id: string;
  assetVersionId: string;
  reviewerId: string;
  reviewerName: string;
  decision: 'APPROVED' | 'CHANGES_REQUESTED' | 'REJECTED';
  reason?: string;
  riskFlagsAcknowledged: string[];
  timestamp: string;
}

export interface AuditEvent {
  id: string;
  workspaceId: string;
  actorId: string;
  actorRole: UserRole;
  action: string;
  entityType: string;
  entityId: string;
  beforeSnapshot?: Record<string, unknown>;
  afterSnapshot?: Record<string, unknown>;
  ipAddress?: string;
  timestamp: string;
}

// -------------------------------------------------------------
// 8. Model-Agnostic AI Gateway Abstractions (PRD Section 7)
// -------------------------------------------------------------
export type AITaskType =
  | 'CAMPAIGN_PLAN'
  | 'CONTENT_DRAFT'
  | 'CONTENT_SECTION_REGEN'
  | 'CLAIM_EXTRACTION'
  | 'SEO_AUDIT'
  | 'COMPLIANCE_EVALUATION'
  | 'EMBEDDING'
  | 'IMAGE_PROMPT';

export interface AIModelConfig {
  provider: 'gemini' | 'openai' | 'anthropic' | 'litellm' | 'mock';
  modelId: string;
  contextWindow: number;
  costPer1kInputTokens: number;
  costPer1kOutputTokens: number;
  supportsStructuredOutputs: boolean;
}

export interface AIGenerationRequest {
  task: AITaskType;
  prompt: string;
  systemPrompt?: string;
  schema?: Record<string, unknown>;
  contextRefs?: {
    brandProfile?: Partial<BrandProfile>;
    product?: Partial<ProductService>;
    icp?: Partial<ICPPersona>;
    approvedClaims?: Claim[];
    evidence?: EvidenceRecord[];
    market?: MarketJurisdiction;
  };
  options?: {
    temperature?: number;
    maxTokens?: number;
    variantCount?: number;
  };
}

export interface AIGenerationResponse<T = unknown> {
  output: T;
  rawText: string;
  citations: string[];
  model: string;
  provider: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
    estimatedCostUsd: number;
  };
  latencyMs: number;
  warnings: string[];
}

// -------------------------------------------------------------
// 7. AI Quality Evaluation Rubric (PRD Section 12)
// -------------------------------------------------------------
export type QualityRubricDimension =
  | 'factual_grounding'
  | 'icp_relevance'
  | 'offer_accuracy'
  | 'conversion_quality'
  | 'originality'
  | 'seo_quality'
  | 'geo_usefulness'
  | 'brand_voice'
  | 'compliance'
  | 'format_validity';

export interface RubricDimensionScore {
  dimension: QualityRubricDimension;
  score: number; // 0 - 100
  weight: number; // 0.0 - 1.0
  passed: boolean;
  feedback: string;
}

export interface QualityEvaluationResult {
  evaluationId: string;
  assetId?: string;
  campaignId?: string;
  overallScore: number; // 0 - 100
  passedOverall: boolean;
  hasCriticalBlocker: boolean;
  rubricBreakdown: Record<QualityRubricDimension, RubricDimensionScore>;
  complianceViolations: Array<{
    code: string;
    category: string;
    message: string;
    severity: ComplianceSeverity;
  }>;
  recommendations: string[];
  provenance: {
    modelVersion: string;
    promptVersion: string;
    retrievedSourceIds: string[];
    evaluatorVersion: string;
    evaluatedAt: string;
  };
}

// -------------------------------------------------------------
// 8. Telemetry & Analytics Dashboard (PRD Section 13 & 15)
// -------------------------------------------------------------
export interface WorkspaceTelemetrySummary {
  workspaceId: string;
  generatedAt: string;
  aiUsage: {
    totalRequests: number;
    totalTokens: number;
    totalCostUsd: number;
    averageLatencyMs: number;
    providerBreakdown: Record<string, { requests: number; tokens: number; costUsd: number }>;
  };
  complianceSummary: {
    totalEvaluations: number;
    passedEvaluations: number;
    flaggedEvaluations: number;
    passRatePercent: number;
    topViolations: Array<{ code: string; count: number }>;
  };
  lifecycleDistribution: Record<ContentState, number>;
  assetVolumeByChannel: Record<string, number>;
  totalCampaigns: number;
  totalAssets: number;
  totalPublished: number;
}


