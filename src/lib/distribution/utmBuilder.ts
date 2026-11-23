/**
 * Prabisha Content Intelligence & Growth Platform (PCIGP)
 * Standardized UTM Builder & Destination Validation Engine
 * Aligned with PRD Requirement PUB-03
 */

export interface UTMParameters {
  source: string; // e.g. "linkedin", "email", "blog"
  medium: string; // e.g. "organic_social", "newsletter", "referral"
  campaign: string; // e.g. "uk_sme_ai_automation"
  term?: string; // Optional target audience or keyword
  content?: string; // Optional creative or hook variant
}

export interface BuildUTMResult {
  valid: boolean;
  finalUrl: string;
  baseUrl: string;
  sanitizedParams: UTMParameters;
  warnings: string[];
}

export class UTMBuilder {
  private static APPROVED_DOMAINS = [
    'prabisha.com',
    'prabisha.co.uk',
    'prabishaconsulting.com',
    'localhost',
  ];

  /**
   * Sanitizes a UTM string token to lowercase alphanumeric with underscores
   */
  public static sanitizeToken(token: string): string {
    return token
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9_-]/g, '_')
      .replace(/_+/g, '_');
  }

  /**
   * Validates if a destination URL belongs to an approved workspace domain
   */
  public static isValidDestination(urlString: string): boolean {
    try {
      const parsed = new URL(urlString);
      return this.APPROVED_DOMAINS.some(
        (domain) => parsed.hostname === domain || parsed.hostname.endsWith(`.${domain}`)
      );
    } catch {
      return false;
    }
  }

  /**
   * Builds standardized, valid tracking URL
   */
  public static buildTrackingUrl(
    destinationUrl: string,
    params: {
      source: string;
      medium?: string;
      campaign: string;
      term?: string;
      content?: string;
    }
  ): BuildUTMResult {
    const warnings: string[] = [];

    // Ensure URL has protocol
    let fullUrl = destinationUrl.trim();
    if (!fullUrl.startsWith('http://') && !fullUrl.startsWith('https://')) {
      fullUrl = `https://${fullUrl}`;
    }

    let urlObj: URL;
    try {
      urlObj = new URL(fullUrl);
    } catch {
      return {
        valid: false,
        finalUrl: fullUrl,
        baseUrl: fullUrl,
        sanitizedParams: {
          source: params.source,
          medium: params.medium || 'organic',
          campaign: params.campaign,
        },
        warnings: [`Invalid destination URL format: "${destinationUrl}"`],
      };
    }

    // Check domain approval
    if (!this.isValidDestination(fullUrl)) {
      warnings.push(
        `Destination hostname "${urlObj.hostname}" is not in approved brand domain registry (prabisha.com / prabisha.co.uk).`
      );
    }

    const sanitizedParams: UTMParameters = {
      source: this.sanitizeToken(params.source || 'direct'),
      medium: this.sanitizeToken(params.medium || 'organic_social'),
      campaign: this.sanitizeToken(params.campaign),
      term: params.term ? this.sanitizeToken(params.term) : undefined,
      content: params.content ? this.sanitizeToken(params.content) : undefined,
    };

    urlObj.searchParams.set('utm_source', sanitizedParams.source);
    urlObj.searchParams.set('utm_medium', sanitizedParams.medium);
    urlObj.searchParams.set('utm_campaign', sanitizedParams.campaign);

    if (sanitizedParams.term) {
      urlObj.searchParams.set('utm_term', sanitizedParams.term);
    }
    if (sanitizedParams.content) {
      urlObj.searchParams.set('utm_content', sanitizedParams.content);
    }

    return {
      valid: warnings.length === 0,
      finalUrl: urlObj.toString(),
      baseUrl: `${urlObj.origin}${urlObj.pathname}`,
      sanitizedParams,
      warnings,
    };
  }
}
