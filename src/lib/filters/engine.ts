/**
 * Prabisha Content Intelligence & Growth Platform (PCIGP)
 * Advanced Multi-Dimensional Filter & Query Engine
 * Aligned with PRD Section 6 (Advanced filters and customisation)
 */

import { FilterGroup, FilterCondition } from '@/types';

export class FilterEngine {
  /**
   * Evaluates an in-memory record against a structured FilterGroup (AND/OR tree)
   */
  public static matchesGroup<T extends Record<string, any>>(item: T, group: FilterGroup): boolean {
    if (!group.conditions || group.conditions.length === 0) {
      return true;
    }

    if (group.conjunction === 'AND') {
      return group.conditions.every((cond) => this.matchesCondition(item, cond));
    } else {
      return group.conditions.some((cond) => this.matchesCondition(item, cond));
    }
  }

  /**
   * Evaluates an individual field condition
   */
  public static matchesCondition<T extends Record<string, any>>(item: T, cond: FilterCondition): boolean {
    const rawVal = item[cond.field];
    const targetVal = cond.value;

    switch (cond.operator) {
      case 'EQUALS':
        return String(rawVal).toLowerCase() === String(targetVal).toLowerCase();

      case 'NOT_EQUALS':
        return String(rawVal).toLowerCase() !== String(targetVal).toLowerCase();

      case 'CONTAINS':
        return String(rawVal).toLowerCase().includes(String(targetVal).toLowerCase());

      case 'IN':
        if (Array.isArray(targetVal)) {
          return targetVal.map((v) => String(v).toLowerCase()).includes(String(rawVal).toLowerCase());
        }
        return false;

      case 'NOT_IN':
        if (Array.isArray(targetVal)) {
          return !targetVal.map((v) => String(v).toLowerCase()).includes(String(rawVal).toLowerCase());
        }
        return true;

      case 'GREATER_THAN':
        return Number(rawVal) > Number(targetVal);

      case 'LESS_THAN':
        return Number(rawVal) < Number(targetVal);

      default:
        return true;
    }
  }

  /**
   * Filters an array of entities using the specified FilterGroup
   */
  public static filterRecords<T extends Record<string, any>>(records: T[], group: FilterGroup): T[] {
    return records.filter((rec) => this.matchesGroup(rec, group));
  }

  /**
   * Returns preconfigured filter presets for common marketing workflows
   */
  public static getStandardPresets(): Array<{
    id: string;
    name: string;
    category: string;
    group: FilterGroup;
  }> {
    return [
      {
        id: 'preset-uk-high-intent',
        name: 'UK Market • Mid & Bottom Funnel',
        category: 'CAMPAIGNS',
        group: {
          conjunction: 'AND',
          conditions: [
            { field: 'market', operator: 'EQUALS', value: 'UK' },
            { field: 'funnelStage', operator: 'IN', value: ['MID_CONSIDERATION', 'BOTTOM_DECISION'] },
          ],
        },
      },
      {
        id: 'preset-pending-approval',
        name: 'Pending Compliance Sign-Off',
        category: 'ASSETS',
        group: {
          conjunction: 'AND',
          conditions: [
            { field: 'status', operator: 'IN', value: ['NEEDS_REVIEW', 'CHANGES_REQUESTED'] },
          ],
        },
      },
      {
        id: 'preset-critical-rules',
        name: 'Critical Block Rules (ASA & ASCI)',
        category: 'COMPLIANCE',
        group: {
          conjunction: 'AND',
          conditions: [
            { field: 'severity', operator: 'EQUALS', value: 'CRITICAL_BLOCK' },
          ],
        },
      },
    ];
  }
}

