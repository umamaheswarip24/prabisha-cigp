/**
 * Prabisha Content Intelligence & Growth Platform (PCIGP)
 * Deterministic Mock AI Provider Adapter
 * Used for offline development, golden dataset tests, and CI/CD pipelines
 */

import { BaseAIAdapter } from './base';
import { AIProviderCallParams, RawAIResponse } from '../types';

export class MockAIAdapter extends BaseAIAdapter {
  providerName = 'mock';

  isAvailable(): boolean {
    return true;
  }

  async complete(params: AIProviderCallParams): Promise<RawAIResponse> {
    const startTime = Date.now();
    let content = '';

    const lowerPrompt = params.userPrompt.toLowerCase();

    if (params.responseFormat === 'json') {
      if (lowerPrompt.includes('campaign') || lowerPrompt.includes('weekly plan')) {
        content = JSON.stringify({
          weeklyTheme: 'Accelerating UK SME Operations Through Pragmatic AI Workflows',
          objective: 'Generate 15+ qualified consultations with UK Managing Directors',
          assets: [
            {
              channel: 'LINKEDIN',
              format: 'SOCIAL_POST',
              headline: 'Why UK SMEs lose 12+ hours weekly to manual workflow handoffs',
              angle: 'Evidence-backed operational diagnostic',
              hook: 'Are your senior team members acting as expensive copy-paste routers between fragmented SaaS tools?',
              targetCta: 'Book an AI Workflow Audit',
              groundedClaims: ['UK SME operational efficiency case study #402'],
            },
            {
              channel: 'BLOG',
              format: 'LONG_FORM_ARTICLE',
              headline: 'The Practical Guide to Enterprise-Grade Automation for Mid-Market Firms',
              angle: 'In-depth educational roadmap',
              hook: 'Automation without governance is technical debt. Here is the framework Prabisha uses for UK clients.',
              targetCta: 'Download Implementation Framework',
              groundedClaims: ['Prabisha proprietary workflow framework v2'],
            },
            {
              channel: 'EMAIL',
              format: 'EMAIL_NEWSLETTER',
              headline: 'Case Study: Eliminating 14 hours of weekly reporting overhead',
              angle: 'Proof-driven client transformation',
              hook: 'How one professional services firm streamlined their client onboarding without replacing existing software.',
              targetCta: 'Read Full Verified Case Study',
              groundedClaims: ['Verified client onboarding case study #108'],
            },
          ],
        });
      } else if (lowerPrompt.includes('seo') || lowerPrompt.includes('audit')) {
        content = JSON.stringify({
          searchIntent: 'Commercial Investigation',
          targetQuery: 'b2b ai marketing operations uk',
          recommendedHeadings: [
            'H1: How Modern B2B Brands Ground AI Content in Verifiable Proof',
            'H2: The Compliance Gap in AI-Generated Marketing',
            'H3: Step-by-Step Content Intelligence Workflow',
          ],
          readabilityScore: 82,
          keywordDensity: '1.8%',
          seoIssues: [
            'Meta description should be under 155 characters for optimal Google SERP rendering.',
          ],
          schemaMarkupSuggested: ['Article', 'FAQPage', 'Organization'],
        });
      } else {
        // Generic structured content draft
        content = JSON.stringify({
          headline: 'Grounding AI in Commercial Proof: The Prabisha Framework',
          body: 'Most AI-generated marketing fails because it is untethered from brand truth and legal substantiation. In the UK and India, regulatory compliance and audience trust demand verified claims. Prabisha Consulting pairs strategic intelligence with deterministic governance to turn content into pipeline.',
          callToAction: 'Schedule a Strategic Consultation with Prabisha',
          citations: ['https://prabisha.com/case-studies/ai-automation'],
          wordCount: 52,
        });
      }
    } else {
      content = `### Grounding AI in Commercial Proof: The Prabisha Framework\n\nMost AI-generated marketing fails because it is untethered from brand truth and legal substantiation.\n\nIn the UK and India, regulatory compliance (ASA/CAP, ASCI) and audience trust demand verified claims. Prabisha Consulting pairs strategic intelligence with deterministic governance to turn content into pipeline.\n\n**Next Step:** Schedule a consultation with our team.`;
    }

    const latencyMs = Date.now() - startTime + 50;
    const promptTokens = Math.ceil(params.userPrompt.length / 4);
    const completionTokens = Math.ceil(content.length / 4);

    return {
      content,
      model: 'mock-deterministic-v1',
      provider: 'mock',
      promptTokens,
      completionTokens,
      totalTokens: promptTokens + completionTokens,
      latencyMs,
    };
  }

  async embed(texts: string[]): Promise<{
    embeddings: number[][];
    dimensions: number;
    tokens: number;
  }> {
    // Generate deterministic 384-dimensional unit vector
    const dimensions = 384;
    const embeddings = texts.map((text) => {
      const vec = new Array(dimensions).fill(0);
      for (let i = 0; i < text.length; i++) {
        vec[i % dimensions] += text.charCodeAt(i) / 1000;
      }
      return vec;
    });

    const tokens = texts.reduce((acc, t) => acc + Math.ceil(t.length / 4), 0);
    return {
      embeddings,
      dimensions,
      tokens,
    };
  }
}

