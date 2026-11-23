'use client';

import React, { useState, useMemo } from 'react';
import {
  Scale,
  ShieldCheck,
  ExternalLink,
  History,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface ComplianceViewProps {
  rules: any[];
  auditEvents: any[];
}

export function ComplianceView({ rules, auditEvents }: ComplianceViewProps) {
  const [jurisdictionFilter, setJurisdictionFilter] = useState<'ALL' | 'UK' | 'INDIA'>('ALL');
  const [expandedRules, setExpandedRules] = useState<Record<string, boolean>>({});

  const toggleRuleExpand = (ruleId: string) => {
    setExpandedRules((prev) => ({
      ...prev,
      [ruleId]: !prev[ruleId],
    }));
  };

  const filteredRules = useMemo(() => {
    if (jurisdictionFilter === 'ALL') return rules;
    return rules.filter((r) => r.jurisdiction === jurisdictionFilter);
  }, [rules, jurisdictionFilter]);

  return (
    <div className="space-y-6">
      {/* 1. Flat Governance Header on Canvas */}
      <div className="border-b border-[#E2E4E9] pb-4 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded-[3px] border border-[#E2E4E9]">
              PRD P0 CMP-01 to CMP-06
            </span>
            <span className="text-slate-400 text-xs">•</span>
            <span className="text-[11px] font-mono text-slate-500">
              Deterministic Regulatory Engine
            </span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight font-sans">
            Compliance Rule Engine &amp; Governance Gate
          </h1>
          <p className="text-xs text-slate-600 leading-normal font-sans max-w-2xl">
            Server-enforced regulatory rule packs for United Kingdom (ASA/CAP &amp; ICO) and India (ASCI &amp; DPDP). High-risk claims cannot bypass approval gates.
          </p>
        </div>

        {/* System Guard Status Badge */}
        <div className="flex items-center space-x-2 shrink-0">
          <span className="text-[11px] font-mono font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-1 rounded-[4px] flex items-center space-x-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>All Rule Packs Active (100% Guarded)</span>
          </span>
        </div>
      </div>

      {/* 2. Section Header with Inline Jurisdiction Filter */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
          <div>
            <h2 className="text-sm font-bold text-slate-900 tracking-tight flex items-center space-x-2">
              <Scale className="w-4 h-4 text-indigo-600" />
              <span>Active Regulatory Rule Packs ({filteredRules.length})</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Checked automatically during every content generation and draft validation cycle
            </p>
          </div>

          {/* Inline Flat Tab Filter (All | UK | INDIA) */}
          <div className="inline-flex rounded-[4px] border border-[#E2E4E9] bg-white p-0.5 text-xs shadow-2xs self-start sm:self-auto">
            <button
              onClick={() => setJurisdictionFilter('ALL')}
              className={`px-3 py-1 rounded-[3px] text-xs font-semibold transition ${
                jurisdictionFilter === 'ALL'
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              All ({rules.length})
            </button>
            <button
              onClick={() => setJurisdictionFilter('UK')}
              className={`px-3 py-1 rounded-[3px] text-xs font-semibold transition ${
                jurisdictionFilter === 'UK'
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              UK ({rules.filter((r) => r.jurisdiction === 'UK').length})
            </button>
            <button
              onClick={() => setJurisdictionFilter('INDIA')}
              className={`px-3 py-1 rounded-[3px] text-xs font-semibold transition ${
                jurisdictionFilter === 'INDIA'
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              INDIA ({rules.filter((r) => r.jurisdiction === 'INDIA').length})
            </button>
          </div>
        </div>

        {/* High-Contrast Regulatory Matrix (Touching 2-Column Grid) */}
        <div className="bg-white rounded-[4px] border border-[#E2E4E9] shadow-xs overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 divide-[#E2E4E9]">
            {filteredRules.map((rule, idx) => {
              const patterns: string[] = JSON.parse(rule.prohibitedPatternsJson || '[]');
              const disclaimers: string[] = JSON.parse(rule.requiredDisclaimersJson || '[]');
              const isExpanded = !!expandedRules[rule.id];
              const visiblePatterns = isExpanded ? patterns : patterns.slice(0, 3);
              const hiddenCount = patterns.length - 3;

              const isCritical = rule.severity === 'CRITICAL_BLOCK';
              const borderAccent = isCritical
                ? 'border-l-[3px] border-l-rose-600'
                : 'border-l-[3px] border-l-amber-500';

              return (
                <div
                  key={rule.id}
                  className={`p-4 ${borderAccent} flex flex-col justify-between space-y-3.5 bg-white ${
                    idx % 2 === 1 ? 'md:border-l md:border-l-[#E2E4E9]' : ''
                  } ${idx >= 2 ? 'border-t border-[#E2E4E9]' : ''}`}
                >
                  <div className="space-y-2.5">
                    {/* Header Row: Jurisdiction badge + Code (Left) & Severity (Right) */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="bg-slate-900 text-white font-mono font-bold text-[10px] px-1.5 py-0.5 rounded-[2px]">
                          {rule.jurisdiction}
                        </span>
                        <span className="font-mono text-slate-800 font-bold text-xs tracking-tight">
                          {rule.code}
                        </span>
                      </div>

                      <span
                        className={`font-mono font-bold text-[10px] tracking-wider uppercase px-1.5 py-0.2 rounded-[2px] border ${
                          isCritical
                            ? 'bg-rose-50 text-rose-800 border-rose-200'
                            : 'bg-amber-50 text-amber-800 border-amber-200'
                        }`}
                      >
                        {rule.severity}
                      </span>
                    </div>

                    {/* Rule Name & Description */}
                    <div>
                      <h3 className="font-bold text-slate-900 text-xs tracking-tight font-sans">
                        {rule.name}
                      </h3>
                      <p className="text-slate-600 mt-1 text-[11px] leading-relaxed font-sans">
                        {rule.description}
                      </p>
                    </div>

                    {/* 3. Tamed Monospace Pattern Strip */}
                    {patterns.length > 0 && (
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[10px] font-mono">
                          <span className="font-semibold text-rose-800 uppercase tracking-wide">
                            Prohibited Trigger Patterns:
                          </span>
                          {hiddenCount > 0 && (
                            <button
                              onClick={() => toggleRuleExpand(rule.id)}
                              className="text-slate-600 hover:text-slate-900 font-semibold flex items-center space-x-0.5"
                            >
                              <span>{isExpanded ? 'Show less' : `+${hiddenCount} more`}</span>
                              {isExpanded ? (
                                <ChevronUp className="w-3 h-3" />
                              ) : (
                                <ChevronDown className="w-3 h-3" />
                              )}
                            </button>
                          )}
                        </div>

                        <div className="bg-[#FAF9F6] border border-[#E2E4E9] rounded-[3px] p-2 text-[11px] font-mono text-slate-800 space-y-1">
                          <div className="flex flex-wrap gap-1.5">
                            {visiblePatterns.map((p, pIdx) => (
                              <span
                                key={pIdx}
                                className="bg-white text-rose-900 border border-rose-200 px-1.5 py-0.2 rounded-[2px] text-[10px]"
                              >
                                &ldquo;{p}&rdquo;
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Required Notice if applicable */}
                    {disclaimers.length > 0 && (
                      <div className="space-y-0.5">
                        <span className="font-semibold text-indigo-900 text-[10px] font-mono uppercase tracking-wide">
                          Required Legal Notice:
                        </span>
                        <div className="bg-indigo-50/60 p-2 rounded-[3px] border border-indigo-200 text-[10px] text-slate-800 italic">
                          {disclaimers[0]}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 4. Crisp Audit Footer Line */}
                  <div className="pt-2.5 border-t border-[#E2E4E9] flex items-center justify-between text-xs">
                    <a
                      href={rule.sourceUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-indigo-600 hover:text-indigo-800 hover:underline flex items-center space-x-1 font-semibold text-[11px]"
                    >
                      <span>Official Authority Guidance</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                    <span className="font-mono text-[10px] text-slate-500">
                      Owner: {rule.owner}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Immutable Governance Audit Log (Dense Ledger Table) */}
      <div className="bg-white rounded-[4px] border border-[#E2E4E9] shadow-xs p-5 space-y-3.5">
        <div className="flex items-center justify-between pb-3 border-b border-[#E2E4E9]">
          <div>
            <h2 className="text-xs font-bold font-mono uppercase tracking-wider text-slate-900 flex items-center space-x-1.5">
              <History className="w-3.5 h-3.5 text-indigo-600" />
              <span>Immutable Governance Audit Log</span>
            </h2>
            <p className="text-[11px] text-slate-400 mt-0.5 font-sans">
              Cryptographically timestamped record of campaign state changes and export events
            </p>
          </div>
          <span className="text-[10px] font-mono text-emerald-800 font-bold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-[2px]">
            OWASP ASVS Aligned
          </span>
        </div>

        {auditEvents.length === 0 ? (
          <p className="text-xs text-slate-400 py-4 text-center font-sans">No audit records logged yet.</p>
        ) : (
          <div className="border border-[#E2E4E9] rounded-[4px] overflow-hidden">
            <table className="w-full text-xs">
              <thead className="bg-[#FAF9F6] border-b border-[#E2E4E9] text-slate-600 text-[10px] font-mono uppercase font-bold">
                <tr>
                  <th className="py-2 px-3 text-left">Action</th>
                  <th className="py-2 px-3 text-left">Entity</th>
                  <th className="py-2 px-3 text-left">Actor &amp; Role</th>
                  <th className="py-2 px-3 text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E4E9] font-mono text-slate-700">
                {auditEvents.map((evt) => (
                  <tr key={evt.id} className="hover:bg-slate-50/60 transition">
                    <td className="py-2.5 px-3 font-bold text-slate-900 font-sans text-xs">
                      {evt.action}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="bg-slate-100 text-slate-800 text-[10px] px-1.5 py-0.5 rounded-[2px] border border-[#E2E4E9] font-mono font-bold">
                        {evt.entityType}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 font-sans text-xs">
                      {evt.user?.name || evt.actorId}{' '}
                      <span className="font-mono text-slate-400 text-[10px]">({evt.actorRole})</span>
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-500 text-[11px] font-mono">
                      {new Date(evt.timestamp).toLocaleString('en-GB')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
