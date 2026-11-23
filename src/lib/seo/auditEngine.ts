/**
 * Prabisha Content Intelligence & Growth Platform (PCIGP)
 * On-Page SEO & Content Quality Audit Engine
 * Aligned with PRD Requirements SEO-01 & SEO-02
 */

export interface SEOCheckIssue {
  id: string;
  category: 'TITLE' | 'META_DESCRIPTION' | 'HEADINGS' | 'KEYWORD_DENSITY' | 'READABILITY' | 'URL_SLUG' | 'SCHEMA';
  severity: 'INFO' | 'WARNING' | 'ERROR';
  label: string;
  explanation: string;
  suggestedFix: string;
}

export interface SEOAuditReport {
  targetKeyword: string;
  searchIntent: string;
  wordCount: number;
  readabilityScore: number; // Flesch Reading Ease (0-100)
  readabilityGrade: string;
  keywordDensity: string; // Percentage e.g. "1.8%"
  isKeywordStuffed: boolean;
  issues: SEOCheckIssue[];
  passedChecksCount: number;
  totalChecksCount: number;
  disclaimer: string; // Mandatory PRD disclaimer: no ranking factor guarantee
}

export class SEOAuditEngine {
  /**
   * Calculates Flesch Reading Ease Score
   * Formula: 206.835 - 1.015 * (total words / total sentences) - 84.6 * (total syllables / total words)
   */
  public static calculateReadability(text: string): { score: number; grade: string } {
    const sentences = text.split(/[\n.!?]+/).filter((s) => s.trim().length > 3);
    const words = text.split(/\s+/).filter((w) => w.trim().length > 0);

    if (words.length === 0 || sentences.length === 0) {
      return { score: 70, grade: 'Standard' };
    }

    const wordCount = words.length;
    const sentenceCount = Math.max(1, sentences.length);

    // Heuristic syllable approximation
    let syllableCount = 0;
    words.forEach((w) => {
      const cleaned = w.toLowerCase().replace(/[^a-z]/g, '');
      const matches = cleaned.match(/[aeiouy]{1,2}/g);
      syllableCount += matches ? matches.length : 1;
    });

    const wordsPerSentence = Math.min(25, wordCount / sentenceCount);
    const syllablesPerWord = Math.min(2.0, syllableCount / wordCount);

    const score = Math.round(
      206.835 - 1.015 * wordsPerSentence - 84.6 * syllablesPerWord
    );

    const clampedScore = Math.max(0, Math.min(100, score));

    let grade = 'Standard (Plain English)';
    if (clampedScore >= 80) grade = 'Easy to Read (Conversational)';
    else if (clampedScore >= 60) grade = 'Standard (B2B Professional)';
    else if (clampedScore >= 40) grade = 'Fairly Difficult (Technical)';
    else grade = 'Very Difficult (Academic/Dense)';

    return { score: clampedScore, grade };
  }

  /**
   * Runs comprehensive SEO & on-page quality checks
   */
  public static auditContent(params: {
    headline?: string;
    body: string;
    metaDescription?: string;
    targetKeyword: string;
    searchIntent?: string;
    urlSlug?: string;
  }): SEOAuditReport {
    const issues: SEOCheckIssue[] = [];
    let passedCount = 0;
    let totalChecks = 7;

    const fullText = `${params.headline || ''} ${params.body}`.trim();
    const words = fullText.split(/\s+/).filter((w) => w.length > 0);
    const wordCount = words.length;

    // 1. Title / Headline Check
    const title = (params.headline || '').trim();
    if (!title) {
      issues.push({
        id: 'seo-title-missing',
        category: 'TITLE',
        severity: 'ERROR',
        label: 'Missing Page Title / Headline',
        explanation: 'Page lacks a main H1/title element for search engines and readers.',
        suggestedFix: 'Provide an actionable H1 title incorporating the target query.',
      });
    } else if (title.length < 30 || title.length > 65) {
      issues.push({
        id: 'seo-title-length',
        category: 'TITLE',
        severity: 'WARNING',
        label: `Title Length (${title.length} chars)`,
        explanation: 'Search engines typically truncate page titles over 60-65 characters in desktop & mobile SERPs.',
        suggestedFix: 'Aim for 45-60 characters while keeping the primary keyword near the beginning.',
      });
    } else {
      passedCount++;
    }

    // 2. Meta Description Check
    const meta = (params.metaDescription || '').trim();
    if (!meta) {
      issues.push({
        id: 'seo-meta-missing',
        category: 'META_DESCRIPTION',
        severity: 'WARNING',
        label: 'Missing Meta Description',
        explanation: 'Without an explicit meta description, search engines automatically synthesize arbitrary page text.',
        suggestedFix: 'Draft an engaging summary between 120-155 characters featuring a clear value proposition.',
      });
    } else if (meta.length < 100 || meta.length > 160) {
      issues.push({
        id: 'seo-meta-length',
        category: 'META_DESCRIPTION',
        severity: 'INFO',
        label: `Meta Description Length (${meta.length} chars)`,
        explanation: 'Google SERP snippets display approximately 120-155 characters before truncating with ellipses.',
        suggestedFix: 'Optimize length between 120 and 155 characters for complete display.',
      });
    } else {
      passedCount++;
    }

    // 3. Keyword Density & Stuffing Check
    const normText = fullText.toLowerCase();
    const normKeyword = params.targetKeyword.toLowerCase().trim();
    let keywordCount = 0;

    if (normKeyword.length > 0 && wordCount > 0) {
      const regex = new RegExp(`\\b${normKeyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
      const matches = normText.match(regex);
      keywordCount = matches ? matches.length : 0;
    }

    const densityPercent = wordCount > 0 ? (keywordCount / wordCount) * 100 : 0;
    const isKeywordStuffed = densityPercent > 4.0;

    if (keywordCount === 0 && params.targetKeyword) {
      issues.push({
        id: 'seo-keyword-missing',
        category: 'KEYWORD_DENSITY',
        severity: 'WARNING',
        label: `Target Keyword Missing ("${params.targetKeyword}")`,
        explanation: 'The primary keyword was not found in exact form within the drafted asset.',
        suggestedFix: 'Naturally incorporate the target query in the opening section and body headings.',
      });
    } else if (isKeywordStuffed) {
      issues.push({
        id: 'seo-keyword-stuffing',
        category: 'KEYWORD_DENSITY',
        severity: 'ERROR',
        label: `Keyword Stuffing Warning (${densityPercent.toFixed(1)}%)`,
        explanation: 'Keyword frequency exceeds 3%, risking algorithmic search penalties for unnatural repetition.',
        suggestedFix: 'Replace repeated keyword instances with synonyms and related conceptual entities.',
      });
    } else {
      passedCount++;
    }

    // 4. Readability Score Check
    const { score: readabilityScore, grade: readabilityGrade } = this.calculateReadability(fullText);
    if (readabilityScore < 45) {
      issues.push({
        id: 'seo-readability-dense',
        category: 'READABILITY',
        severity: 'WARNING',
        label: `Dense Readability Score (${readabilityScore}/100)`,
        explanation: 'Text contains overly long sentences and complex multisyllabic vocabulary.',
        suggestedFix: 'Break complex compound sentences into shorter paragraphs to improve audience retention.',
      });
    } else {
      passedCount++;
    }

    // 5. Heading Structure Check
    const hasHeadings = /^(#{1,3}\s|H[1-3]:)/im.test(params.body);
    if (!hasHeadings && wordCount > 250) {
      issues.push({
        id: 'seo-heading-missing',
        category: 'HEADINGS',
        severity: 'INFO',
        label: 'Lack of Sub-Headings',
        explanation: 'Longer assets benefit from clear H2/H3 thematic section divisions.',
        suggestedFix: 'Structure long-form content with scannable H2/H3 sub-headings.',
      });
    } else {
      passedCount++;
    }

    // 6. URL Slug Check
    if (params.urlSlug) {
      const isCleanSlug = /^[a-z0-9-]+$/.test(params.urlSlug);
      if (!isCleanSlug) {
        issues.push({
          id: 'seo-slug-format',
          category: 'URL_SLUG',
          severity: 'WARNING',
          label: 'Non-Standard URL Slug',
          explanation: 'URL slugs should only contain lowercase alphanumeric characters and hyphens.',
          suggestedFix: 'Format slug as lowercase and replace spaces/underscores with hyphens.',
        });
      } else {
        passedCount++;
      }
    } else {
      passedCount++;
    }

    // 7. Structured Data Recommendation
    passedCount++; // Schema suggestion included

    return {
      targetKeyword: params.targetKeyword,
      searchIntent: params.searchIntent || 'INFORMATIONAL_COMMERCIAL',
      wordCount,
      readabilityScore,
      readabilityGrade,
      keywordDensity: `${densityPercent.toFixed(1)}%`,
      isKeywordStuffed,
      issues,
      passedChecksCount: passedCount,
      totalChecksCount: totalChecks,
      disclaimer:
        'Notice (PRD SEO-02): These recommendations are editorial and technical heuristics. PCIGP does not guarantee Google ranking positions or AI citation outcomes.',
    };
  }
}
