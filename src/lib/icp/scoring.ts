/**
 * Prabisha Content Intelligence & Growth Platform (PCIGP)
 * ICP Fit Scoring Engine
 * Aligned with PRD Requirement ICP-04 (Configurable heuristic scoring with component weights)
 */

import { ICPPersona, ProductService, ICPFitScoreResult, ICPFitScoreComponent } from '@/types';

export interface ProspectProfile {
  companyName: string;
  industry: string;
  companySize: number; // e.g. 45
  revenueBand?: string;
  buyerRole: string;
  statedPains: string[];
  budgetEstimatedUsd?: number;
}

export class ICPFitScorer {
  /**
   * Calculates explainable ICP fit score against an ICP and recommended products.
   * Note: Explicitly labelled heuristic per PRD requirement ICP-04.
   */
  public static calculateFitScore(
    prospect: ProspectProfile,
    icp: ICPPersona,
    products: ProductService[] = []
  ): ICPFitScoreResult {
    const weights = icp.fitScoreWeights || {
      industry: 25,
      companySize: 20,
      painRelevance: 30,
      budgetMatch: 25,
    };

    const components: ICPFitScoreComponent[] = [];
    const recommendations: string[] = [];

    // 1. Industry Alignment (Default weight 25)
    let industryScore = 0;
    let industryReason = '';
    const normProspectInd = prospect.industry.toLowerCase();
    const normIcpInd = icp.industry.toLowerCase();

    if (normProspectInd === normIcpInd || normIcpInd.includes(normProspectInd)) {
      industryScore = 100;
      industryReason = `Direct match with primary ICP industry: "${icp.industry}"`;
    } else if (
      icp.subindustry &&
      (normProspectInd.includes(icp.subindustry.toLowerCase()) ||
        icp.subindustry.toLowerCase().includes(normProspectInd))
    ) {
      industryScore = 85;
      industryReason = `Sub-industry match: "${icp.subindustry}"`;
    } else {
      industryScore = 30;
      industryReason = `Adjacent industry: prospect is "${prospect.industry}", target is "${icp.industry}"`;
      recommendations.push(`Tailor messaging with vertical-specific case study if engaging outside core ${icp.industry} sector.`);
    }

    components.push({
      name: 'Industry & Sector Match',
      score: industryScore,
      weight: weights.industry,
      weightedScore: (industryScore * weights.industry) / 100,
      reason: industryReason,
    });

    // 2. Company Size & Maturity Alignment (Default weight 20)
    let sizeScore = 70;
    let sizeReason = `Company size of ${prospect.companySize} employees matches target range (${icp.companySizeRange})`;

    // Check size range (e.g. "15-150 employees")
    const sizeRangeMatches = icp.companySizeRange.match(/(\d+)\s*-\s*(\d+)/);
    if (sizeRangeMatches) {
      const min = parseInt(sizeRangeMatches[1], 10);
      const max = parseInt(sizeRangeMatches[2], 10);
      if (prospect.companySize >= min && prospect.companySize <= max) {
        sizeScore = 100;
        sizeReason = `Employee count (${prospect.companySize}) is ideally positioned in sweet spot (${min}-${max}).`;
      } else if (prospect.companySize < min) {
        sizeScore = 40;
        sizeReason = `Prospect has ${prospect.companySize} employees, below minimum threshold of ${min}. Risk of resource constraint.`;
        recommendations.push('Evaluate if self-serve or smaller tier product package is needed.');
      } else {
        sizeScore = 80;
        sizeReason = `Prospect has ${prospect.companySize} employees, slightly above range (${max}). Enterprise procurement may apply.`;
      }
    }

    components.push({
      name: 'Company Scale & Size Fit',
      score: sizeScore,
      weight: weights.companySize,
      weightedScore: (sizeScore * weights.companySize) / 100,
      reason: sizeReason,
    });

    // 3. Pain Point & Solution Mapping (Default weight 30)
    let matchedPains = 0;
    const icpPains = icp.painPoints || [];
    for (const pain of prospect.statedPains) {
      if (
        icpPains.some(
          (ip) =>
            ip.toLowerCase().includes(pain.toLowerCase()) ||
            pain.toLowerCase().includes(ip.toLowerCase())
        )
      ) {
        matchedPains++;
      }
    }

    const painRatio = icpPains.length > 0 ? matchedPains / Math.min(icpPains.length, 3) : 0.8;
    const painScore = Math.min(100, Math.round(Math.max(40, painRatio * 100)));
    components.push({
      name: 'Documented Pain Point Overlap',
      score: painScore,
      weight: weights.painRelevance,
      weightedScore: (painScore * weights.painRelevance) / 100,
      reason: `${matchedPains} validated pain points shared with ICP baseline. Relevant to offer capabilities.`,
    });

    // 4. Budget & Buying Capacity (Default weight 25)
    let budgetScore = 85;
    let budgetReason = `Target buyer role "${prospect.buyerRole}" holds direct signing authority.`;

    const executiveKeywords = ['director', 'managing', 'founder', 'ceo', 'vp', 'head', 'chief'];
    const isExec = executiveKeywords.some((k) => prospect.buyerRole.toLowerCase().includes(k));
    if (!isExec) {
      budgetScore = 55;
      budgetReason = `Buyer role "${prospect.buyerRole}" is typically an influencer rather than primary budget holder.`;
      recommendations.push('Arm this contact with an internal business case deck for executive sign-off.');
    }

    components.push({
      name: 'Buying Capacity & Authority',
      score: budgetScore,
      weight: weights.budgetMatch,
      weightedScore: (budgetScore * weights.budgetMatch) / 100,
      reason: budgetReason,
    });

    // Aggregate weighted total
    const totalScore = Math.round(components.reduce((acc, c) => acc + c.weightedScore, 0));

    let tier: ICPFitScoreResult['tier'] = 'TIER_3_LOW_FIT';
    if (totalScore >= 80) {
      tier = 'TIER_1_EXCELLENT_FIT';
    } else if (totalScore >= 60) {
      tier = 'TIER_2_MODERATE_FIT';
    }

    return {
      totalScore,
      tier,
      isHeuristic: true, // PRD Section 5.2 requirement: labelled heuristic
      components,
      recommendations,
    };
  }
}

