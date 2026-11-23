/**
 * Prabisha Content Intelligence & Growth Platform (PCIGP)
 * Duplicate & Near-Duplicate Detection Engine
 * Aligned with PRD Requirement GEN-06
 */

export interface DuplicateCheckResult {
  isDuplicate: boolean;
  similarityScore: number; // 0.0 to 1.0
  threshold: number;
  matchedId?: string;
  matchedTitle?: string;
  matchedExcerpt?: string;
  recommendation: 'PROCEED' | 'REWRITE_RECOMMENDED' | 'DOCUMENTED_EXCEPTION_REQUIRED';
}

export class DuplicateDetector {
  private static DEFAULT_THRESHOLD = 0.65; // 65% similarity triggers warning

  /**
   * Normalizes text into a clean token array
   */
  public static tokenize(text: string): string[] {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter((w) => w.length > 2);
  }

  /**
   * Generates character/word n-grams for shingling
   */
  public static generateShingles(tokens: string[], n = 3): Set<string> {
    const shingles = new Set<string>();
    if (tokens.length < n) {
      if (tokens.length > 0) shingles.add(tokens.join(' '));
      return shingles;
    }

    for (let i = 0; i <= tokens.length - n; i++) {
      shingles.add(tokens.slice(i, i + n).join(' '));
    }
    return shingles;
  }

  /**
   * Calculates Jaccard Similarity between two texts using unigram and bigram tokens
   */
  public static calculateJaccardSimilarity(textA: string, textB: string): number {
    const tokensA = this.tokenize(textA);
    const tokensB = this.tokenize(textB);

    if (tokensA.length === 0 || tokensB.length === 0) return 0;

    // Combine unigrams and bigrams for robust near-duplicate detection
    const shinglesA = new Set<string>(tokensA);
    const shinglesB = new Set<string>(tokensB);

    // Add bigrams
    for (let i = 0; i < tokensA.length - 1; i++) {
      shinglesA.add(`${tokensA[i]}_${tokensA[i + 1]}`);
    }
    for (let i = 0; i < tokensB.length - 1; i++) {
      shinglesB.add(`${tokensB[i]}_${tokensB[i + 1]}`);
    }

    let intersectionCount = 0;
    shinglesA.forEach((s) => {
      if (shinglesB.has(s)) intersectionCount++;
    });

    const unionSize = new Set([...shinglesA, ...shinglesB]).size;
    if (unionSize === 0) return 0;

    return Number((intersectionCount / unionSize).toFixed(4));
  }

  /**
   * Checks candidate text against an array of prior assets or historical documents
   */
  public static checkDuplicates(
    candidateText: string,
    existingCorpus: Array<{ id: string; title: string; content: string }>,
    threshold = this.DEFAULT_THRESHOLD
  ): DuplicateCheckResult {
    let highestScore = 0;
    let bestMatch: { id: string; title: string; content: string } | null = null;

    for (const item of existingCorpus) {
      const score = this.calculateJaccardSimilarity(candidateText, item.content);
      if (score > highestScore) {
        highestScore = score;
        bestMatch = item;
      }
    }

    const isDuplicate = highestScore >= threshold;
    let recommendation: DuplicateCheckResult['recommendation'] = 'PROCEED';

    if (highestScore >= 0.85) {
      recommendation = 'DOCUMENTED_EXCEPTION_REQUIRED';
    } else if (highestScore >= threshold) {
      recommendation = 'REWRITE_RECOMMENDED';
    }

    return {
      isDuplicate,
      similarityScore: highestScore,
      threshold,
      matchedId: bestMatch?.id,
      matchedTitle: bestMatch?.title,
      matchedExcerpt: bestMatch?.content.slice(0, 160),
      recommendation,
    };
  }
}
