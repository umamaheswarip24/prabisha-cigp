/**
 * Prabisha Content Intelligence & Growth Platform (PCIGP)
 * AI Task Router & Model Policy Configuration
 * Aligned with PRD Section 7.2
 */

import { AITaskType } from '@/types';
import { TaskModelPolicy } from './types';

export const DEFAULT_TASK_POLICIES: Record<AITaskType, TaskModelPolicy> = {
  CAMPAIGN_PLAN: {
    primaryProvider: 'gemini',
    primaryModel: 'gemini-1.5-pro',
    fallbackProvider: 'openai',
    fallbackModel: 'gpt-4o',
    temperature: 0.4,
    maxTokens: 2500,
    timeoutMs: 30000,
  },
  CONTENT_DRAFT: {
    primaryProvider: 'gemini',
    primaryModel: 'gemini-1.5-pro',
    fallbackProvider: 'openai',
    fallbackModel: 'gpt-4o',
    temperature: 0.7,
    maxTokens: 2000,
    timeoutMs: 30000,
  },
  CONTENT_SECTION_REGEN: {
    primaryProvider: 'gemini',
    primaryModel: 'gemini-1.5-flash',
    fallbackProvider: 'openai',
    fallbackModel: 'gpt-4o-mini',
    temperature: 0.5,
    maxTokens: 1000,
    timeoutMs: 20000,
  },
  CLAIM_EXTRACTION: {
    primaryProvider: 'gemini',
    primaryModel: 'gemini-1.5-flash',
    fallbackProvider: 'openai',
    fallbackModel: 'gpt-4o-mini',
    temperature: 0.1,
    maxTokens: 1200,
    timeoutMs: 15000,
  },
  SEO_AUDIT: {
    primaryProvider: 'gemini',
    primaryModel: 'gemini-1.5-flash',
    fallbackProvider: 'openai',
    fallbackModel: 'gpt-4o-mini',
    temperature: 0.2,
    maxTokens: 1500,
    timeoutMs: 20000,
  },
  COMPLIANCE_EVALUATION: {
    primaryProvider: 'gemini',
    primaryModel: 'gemini-1.5-pro',
    fallbackProvider: 'openai',
    fallbackModel: 'gpt-4o',
    temperature: 0.1,
    maxTokens: 2000,
    timeoutMs: 25000,
  },
  EMBEDDING: {
    primaryProvider: 'gemini',
    primaryModel: 'text-embedding-004',
    fallbackProvider: 'openai',
    fallbackModel: 'text-embedding-3-small',
    temperature: 0.0,
    maxTokens: 500,
    timeoutMs: 10000,
  },
  IMAGE_PROMPT: {
    primaryProvider: 'gemini',
    primaryModel: 'gemini-1.5-flash',
    fallbackProvider: 'openai',
    fallbackModel: 'gpt-4o-mini',
    temperature: 0.7,
    maxTokens: 500,
    timeoutMs: 15000,
  },
};

export class TaskRouter {
  private policies: Record<AITaskType, TaskModelPolicy>;

  constructor(customPolicies?: Partial<Record<AITaskType, TaskModelPolicy>>) {
    this.policies = { ...DEFAULT_TASK_POLICIES, ...customPolicies };
  }

  public getPolicy(task: AITaskType): TaskModelPolicy {
    return this.policies[task] || DEFAULT_TASK_POLICIES.CONTENT_DRAFT;
  }

  public updatePolicy(task: AITaskType, policy: Partial<TaskModelPolicy>): void {
    this.policies[task] = {
      ...this.getPolicy(task),
      ...policy,
    };
  }

  public getAllPolicies(): Record<AITaskType, TaskModelPolicy> {
    return { ...this.policies };
  }
}

