/**
 * Prabisha Content Intelligence & Growth Platform (PCIGP)
 * Compliance & Policy Validation Engine
 */

import { ComplianceRule, ComplianceSeverity, Claim } from '@/types';
import { INITIAL_COMPLIANCE_RULES } from './rules';

export interface ComplianceEvaluationReport {
  passed: boolean;
  highestSeverity: ComplianceSeverity | null;
  blocksPublication: boolean;
  requiresComplianceReview: boolean;
  violations: Array<{
    ruleCode: string;
    ruleName: string;
    severity: ComplianceSeverity;
    matchedPattern?: string;
    explanation: string;
    sourceUrl: string;
  }>;
  unverifiedClaims: string[];
  recommendedFixes: string[];
}

export class ComplianceEngine {
  private rules: ComplianceRule[];

  constructor(customRules?: ComplianceRule[]) {
    this.rules = customRules || INITIAL_COMPLIANCE_RULES;
  }

  /**
   * Run automated compliance checks across content text and context
   */
  public evaluateContent(
    text: string,
    jurisdiction: 'UK' | 'INDIA' | 'GLOBAL',
    approvedClaims: Claim[] = []
  ): ComplianceEvaluationReport {
    const report: ComplianceEvaluationReport = {
      passed: true,
      highestSeverity: null,
      blocksPublication: false,
      requiresComplianceReview: false,
      violations: [],
      unverifiedClaims: [],
      recommendedFixes: [],
    };

    const lowerText = text.toLowerCase();

    // 1. Filter applicable rules by jurisdiction
    const activeRules = this.rules.filter(
      (r) => r.jurisdiction === jurisdiction || r.jurisdiction === 'GLOBAL'
    );

    // 2. Check prohibited patterns
    for (const rule of activeRules) {
      for (const pattern of rule.prohibitedPatterns) {
        if (lowerText.includes(pattern.toLowerCase())) {
          report.violations.push({
            ruleCode: rule.code,
            ruleName: rule.name,
            severity: rule.severity,
            matchedPattern: pattern,
            explanation: `Found prohibited or high-risk phrase "${pattern}". Adherence required under ${rule.name}.`,
            sourceUrl: rule.sourceUrl,
          });

          if (rule.severity === 'CRITICAL_BLOCK') {
            report.blocksPublication = true;
            report.passed = false;
          } else if (rule.severity === 'HIGH') {
            report.requiresComplianceReview = true;
            report.passed = false;
          }
        }
      }

      // Check required disclaimers if defined
      if (rule.requiredDisclaimers && rule.requiredDisclaimers.length > 0) {
        for (const disclaimer of rule.requiredDisclaimers) {
          // Check if at least some core disclaimer keywords exist
          const hasDisclaimer = text.includes('unsubscribe') || text.includes('registered') || text.includes('Data Protection');
          if (!hasDisclaimer) {
            report.recommendedFixes.push(`Recommended disclaimer: "${disclaimer}"`);
          }
        }
      }
    }

    // 3. Factual claim substantiation heuristic
    // Detect typical numerical or superlative claims (e.g., "50% increase", "10x revenue", "first in market")
    const statisticRegex = /\b(\d+%\s+(increase|reduction|growth|boost|savings)|(\d+x)\s+(roi|revenue|speed))\b/gi;
    const matches = text.match(statisticRegex);

    if (matches) {
      for (const match of matches) {
        // Verify if this matches an approved claim in the claim registry
        const isApproved = approvedClaims.some(
          (c) => c.status === 'APPROVED' && c.exactWording.toLowerCase().includes(match.toLowerCase())
        );

        if (!isApproved) {
          report.unverifiedClaims.push(match);
          report.violations.push({
            ruleCode: 'SUBSTANTIATION_CHECK',
            ruleName: 'Unverified Statistical Claim',
            severity: 'HIGH',
            matchedPattern: match,
            explanation: `Statistic "${match}" does not match any approved record in the Claim Registry. Evidence must be attached before publication.`,
            sourceUrl: 'https://www.asa.org.uk/codes-and-rulings/advertising-codes.html',
          });
          report.requiresComplianceReview = true;
          report.passed = false;
        }
      }
    }

    // Determine highest severity
    const severities: ComplianceSeverity[] = report.violations.map((v) => v.severity);
    if (severities.includes('CRITICAL_BLOCK')) {
      report.highestSeverity = 'CRITICAL_BLOCK';
    } else if (severities.includes('HIGH')) {
      report.highestSeverity = 'HIGH';
    } else if (severities.includes('MEDIUM')) {
      report.highestSeverity = 'MEDIUM';
    } else if (severities.includes('LOW')) {
      report.highestSeverity = 'LOW';
    }

    return report;
  }
}

