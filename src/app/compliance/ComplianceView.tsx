'use client';

import React, { useState } from 'react';
import {
  Scale,
  ShieldCheck,
  ExternalLink,
  History,
  Lock,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface ComplianceViewProps {
  rules: any[];
  auditEvents: any[];
}

export function ComplianceView({ rules, auditEvents }: ComplianceViewProps) {
  const [expandedRules, setExpandedRules] = useState<Record<string, boolean>>({});

  const toggleRuleExpand = (ruleId: string) => {
    setExpandedRules((prev) => ({
      ...prev,
      [ruleId]: !prev[ruleId],
    }));
  };

  return (
    <div className="space-y-6">
      {/* Decluttered Page Header on Canvas */}
      <div className="border-b border-[#E2E4E9] pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Compliance Rule Engine &amp; Governance Gate
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Server-enforced regulatory rules for UK (ASA/CAP &amp; ICO) and India (ASCI &amp; DPDP).
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-[11px] font-mono text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200 font-bold">
            All Rule Packs Active (100% Guarded)
          </span>
        </div>
      </div>

      {/* Rules Section with Sharp Left Borders */}
      <div className="bg-white rounded-md border border-[#E2E4E9] shadow-xs p-5 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#E2E4E9]">
          <div>
            <h2 className="text-xs font-bold font-mono uppercase tracking-wider text-slate-900">
              Active Regulatory Rule Packs ({rules.length})
            </h2>
            <p className="text-[11px] text-slate-400">
              Evaluated during every content generation and draft validation cycle
            </p>
          </div>
          <span className="text-[11px] font-mono text-slate-400">Deterministic Linters</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {rules.map((rule) => {
            const patterns: string[] = JSON.parse(rule.prohibitedPatternsJson || '[]');
            const disclaimers: string[] = JSON.parse(rule.requiredDisclaimersJson || '[]');
            const isExpanded = !!expandedRules[rule.id];
            const visiblePatterns = isExpanded ? patterns : patterns.slice(0, 3);
            const hiddenCount = patterns.length - 3;

            const borderAccent =
              rule.severity === 'CRITICAL_BLOCK'
                ? 'border-l-4 border-l-rose-500'
                : rule.severity === 'HIGH'
                ? 'border-l-4 border-l-amber-500'
                : 'border-l-4 border-l-sky-500';

            return (
              <div
                key={rule.id}
                className={`p-4 bg-[#FAF9F6] rounded border border-[#E2E4E9] ${borderAccent} text-xs space-y-3 shadow-2xs`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="bg-slate-900 text-white font-mono font-bold text-[10px] px-1.5 py-0.2 rounded">
                      {rule.jurisdiction}
                    </span>
                    <span className="font-mono text-slate-600 font-bold text-[11px]">{rule.code}</span>
                  </div>
                  <span
                    className={`font-mono font-bold text-[10px] px-1.5 py-0.2 rounded ${
                      rule.severity === 'CRITICAL_BLOCK'
                        ? 'bg-rose-50 text-rose-800 border border-rose-200'
                        : rule.severity === 'HIGH'
                        ? 'bg-amber-50 text-amber-800 border border-amber-200'
                        : 'bg-sky-50 text-sky-800 border border-sky-200'
                    }`}
                  >
                    {rule.severity}
                  </span>
                </div>

                <div>
                  <h3 className="font-bold text-slate-900 text-xs tracking-tight">{rule.name}</h3>
                  <p className="text-slate-600 mt-1 leading-snug text-[11px]">{rule.description}</p>
                </div>

                {/* Prohibited Trigger Patterns with +N more toggle */}
                {patterns.length > 0 && (
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-semibold text-rose-700">Prohibited Trigger Patterns:</span>
                      {hiddenCount > 0 && (
                        <button
                          onClick={() => toggleRuleExpand(rule.id)}
                          className="text-[10px] text-slate-500 hover:text-slate-900 font-mono font-semibold flex items-center space-x-0.5"
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

                    <div className="flex flex-wrap gap-1 mt-1">
                      {visiblePatterns.map((p, idx) => (
                        <span
                          key={idx}
                          className="bg-white text-rose-900 border border-rose-200 text-[10px] font-mono px-1.5 py-0.2 rounded"
                        >
                          &quot;{p}&quot;
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {disclaimers.length > 0 && (
                  <div>
                    <span className="font-semibold text-indigo-800 text-[11px]">Required Notice:</span>
                    <div className="bg-indigo-50/50 p-2 rounded border border-indigo-100 text-[10px] text-slate-700 mt-0.5 italic">
                      {disclaimers[0]}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-[#E2E4E9]">
                  <a
                    href={rule.sourceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-indigo-600 hover:text-indigo-800 flex items-center space-x-1"
                  >
                    <span>Authority Guidance</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                  <span className="font-mono text-[10px]">{rule.owner}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Immutable Governance Audit Log (Dense Data Rows) */}
      <div className="bg-white rounded-md border border-[#E2E4E9] shadow-xs p-5 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#E2E4E9]">
          <div>
            <h2 className="text-xs font-bold font-mono uppercase tracking-wider text-slate-900 flex items-center space-x-1.5">
              <History className="w-3.5 h-3.5 text-indigo-600" />
              <span>Immutable Governance Audit Log</span>
            </h2>
            <p className="text-[11px] text-slate-400">
              Cryptographically timestamped record of campaign state changes and export events
            </p>
          </div>
          <span className="text-[10px] font-mono text-slate-400">OWASP ASVS Aligned</span>
        </div>

        {auditEvents.length === 0 ? (
          <p className="text-xs text-slate-400 py-4 text-center">No audit records logged yet.</p>
        ) : (
          <div className="border border-[#E2E4E9] rounded overflow-hidden">
            <table className="w-full text-xs">
              <thead className="bg-[#FAF9F6] border-b border-[#E2E4E9] text-slate-600 text-[10px] font-mono uppercase">
                <tr>
                  <th className="py-2 px-3 text-left">Action</th>
                  <th className="py-2 px-3 text-left">Entity</th>
                  <th className="py-2 px-3 text-left">Actor &amp; Role</th>
                  <th className="py-2 px-3 text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E4E9] font-mono text-slate-700">
                {auditEvents.map((evt) => (
                  <tr key={evt.id} className="hover:bg-slate-50/60">
                    <td className="py-2.5 px-3 font-bold text-slate-900 font-sans">
                      {evt.action}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="bg-slate-100 text-slate-700 text-[10px] px-1.5 py-0.5 rounded border border-[#E2E4E9]">
                        {evt.entityType}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 font-sans">
                      {evt.user?.name || evt.actorId}{' '}
                      <span className="font-mono text-slate-400 text-[11px]">({evt.actorRole})</span>
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-400 text-[11px]">
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
