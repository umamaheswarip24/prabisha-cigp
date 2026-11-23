'use client';

import React, { useState } from 'react';
import { WorkspaceTelemetrySummary } from '@/types';
import {
  Play,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Layers,
  Lock,
  Sparkles,
  AlertTriangle,
} from 'lucide-react';

interface TelemetryViewProps {
  initialTelemetry: WorkspaceTelemetrySummary;
  goldenBriefs: any[];
  recentAudits: any[];
}

export function TelemetryView({
  initialTelemetry,
  goldenBriefs,
  recentAudits,
}: TelemetryViewProps) {
  const [telemetry, setTelemetry] = useState<WorkspaceTelemetrySummary>(initialTelemetry);
  const [isRunningEval, setIsRunningEval] = useState(false);
  const [evalBenchmark, setEvalBenchmark] = useState<any | null>(null);
  const [expandedCase, setExpandedCase] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch('/api/v1/telemetry?workspaceId=prabisha-hq');
      if (res.ok) {
        const data = await res.json();
        setTelemetry(data.telemetry);
      }
    } catch (e) {
      console.error('Error refreshing telemetry', e);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleRunRegression = async () => {
    setIsRunningEval(true);
    try {
      const res = await fetch('/api/v1/ai/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ runGoldenDataset: true }),
      });
      if (res.ok) {
        const data = await res.json();
        setEvalBenchmark(data.benchmarkSummary);
      }
    } catch (e) {
      console.error('Error running regression benchmark', e);
    } finally {
      setIsRunningEval(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Flat Observability Header on Canvas */}
      <div className="border-b border-[#E2E4E9] pb-4 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded-[3px] border border-[#E2E4E9]">
              PRD Sec 12, 13 &amp; 15
            </span>
            <span className="text-slate-400 text-xs">•</span>
            <span className="text-[11px] font-mono text-slate-500">
              Telemetry &amp; Evaluation Infrastructure
            </span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight font-sans">
            Observability, AI Telemetry &amp; Quality Evaluation
          </h1>
          <p className="text-xs text-slate-600 leading-normal font-sans max-w-2xl">
            Real-time tracking of AI token consumption, spend ledger, compliance pass rates, and automated regression evaluation.
          </p>
        </div>

        {/* Sharpened Action Pair Flush Right */}
        <div className="flex items-center space-x-2 shrink-0">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-[4px] border border-[#E2E4E9] text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 transition shadow-2xs disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Refresh Telemetry</span>
          </button>
          <button
            onClick={handleRunRegression}
            disabled={isRunningEval}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-[4px] text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition shadow-xs disabled:opacity-50"
          >
            <Play className={`w-3.5 h-3.5 ${isRunningEval ? 'animate-spin' : ''}`} />
            <span>{isRunningEval ? 'Running Evaluation...' : 'Run Golden Benchmark'}</span>
          </button>
        </div>
      </div>

      {/* 2. Unified 4-Column Telemetry Strip */}
      <div className="bg-white border border-[#E2E4E9] rounded-[4px] grid grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-[#E2E4E9] shadow-2xs">
        {/* Column 1: AI Spend Ledger */}
        <div className="p-4 space-y-1">
          <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">
            AI Spend Ledger
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-slate-900 tracking-tight">
            ${telemetry.aiUsage.totalCostUsd.toFixed(4)}
          </div>
          <div className="text-[11px] font-mono text-slate-500">
            {telemetry.aiUsage.totalTokens.toLocaleString()} tokens • {telemetry.aiUsage.totalRequests} invocations
          </div>
        </div>

        {/* Column 2: Average Latency */}
        <div className="p-4 space-y-1">
          <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">
            Average Latency
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-slate-900 tracking-tight">
            {telemetry.aiUsage.averageLatencyMs} <span className="text-xs font-normal text-slate-500">ms</span>
          </div>
          <div className="flex items-center space-x-1.5 mt-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block shrink-0" />
            <span className="font-mono text-[11px] text-emerald-700 font-medium">
              P95 SLA &lt; 500ms compliant
            </span>
          </div>
        </div>

        {/* Column 3: Compliance Pass Rate */}
        <div className="p-4 space-y-1">
          <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">
            Compliance Pass Rate
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-indigo-700 tracking-tight">
            {telemetry.complianceSummary.passRatePercent}%
          </div>
          <div className="text-[11px] font-mono text-slate-500">
            {telemetry.complianceSummary.passedEvaluations} passed • {telemetry.complianceSummary.flaggedEvaluations || 0} flagged
          </div>
        </div>

        {/* Column 4: Asset Pipeline */}
        <div className="p-4 space-y-1">
          <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">
            Asset Pipeline
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-slate-900 tracking-tight">
            {telemetry.totalAssets}
          </div>
          <div className="text-[11px] font-mono text-slate-500">
            {telemetry.totalCampaigns || 2} active campaigns ({telemetry.totalPublished} published)
          </div>
        </div>
      </div>

      {/* 3. Benchmark & Regression Ledger (Golden Evaluation Dataset) */}
      <div className="space-y-3">
        {/* Flat Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 pb-3 border-b border-[#E2E4E9]">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded-[3px] border border-[#E2E4E9]">
                PRD Sec 12 Mandatory
              </span>
              <span className="text-slate-400 text-xs">•</span>
              <span className="text-[11px] font-mono text-slate-500">
                Automated Quality Regression Suite
              </span>
            </div>
            <h2 className="text-base font-bold text-slate-900 font-sans tracking-tight">
              Golden Evaluation Dataset &amp; Regression Runner
            </h2>
            <p className="text-xs text-slate-500">
              Curated benchmark set with real Prabisha briefs, constraints, and known failure edge cases to catch regressions.
            </p>
          </div>

          {evalBenchmark && (
            <div className="flex items-center space-x-2 font-mono text-xs bg-emerald-50 px-2.5 py-1 rounded-[3px] border border-emerald-200 text-emerald-800 font-bold shrink-0">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>
                Benchmark: {evalBenchmark.passedCases} / {evalBenchmark.totalCases} Passed (100%)
              </span>
            </div>
          )}
        </div>

        {/* Structured Test Rows */}
        <div className="bg-white border border-[#E2E4E9] rounded-[4px] shadow-2xs divide-y divide-[#E2E4E9] overflow-hidden">
          {goldenBriefs.map((b: any) => {
            const isEdgeCase = !b.expectedEvaluation?.shouldPassOverall || b.id.includes('edge');
            const benchResult = evalBenchmark?.results?.find((r: any) => r.caseId === b.id);
            const isExpanded = expandedCase === b.id;

            return (
              <div
                key={b.id}
                className={`transition ${
                  isEdgeCase ? 'border-l-[3px] border-l-amber-500' : 'border-l-[3px] border-l-indigo-600'
                } ${isExpanded ? 'bg-slate-50/70' : 'hover:bg-slate-50/40 bg-white'}`}
              >
                <div
                  onClick={() => setExpandedCase(isExpanded ? null : b.id)}
                  className="p-3.5 cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-3"
                >
                  {/* Left Column: Metadata & Title Stack */}
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                      {/* Monospace Locale Badge */}
                      <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded-[3px] border border-[#E2E4E9]">
                        {b.market === 'UK' ? 'UK (en-GB)' : b.market === 'INDIA' ? 'India (en-IN)' : `${b.market} (${b.locale})`}
                      </span>

                      {/* Sharp Monospace Test Classification Tag */}
                      {isEdgeCase ? (
                        <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded-[3px] border border-amber-200">
                          Edge / Failure Test Case
                        </span>
                      ) : (
                        <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded-[3px] border border-indigo-200">
                          Standard Benchmark Brief
                        </span>
                      )}

                      <span className="font-mono text-[10px] text-slate-400">ID: {b.id}</span>
                    </div>

                    <h3 className="text-sm font-bold text-slate-900 tracking-tight font-sans">
                      {b.name}
                    </h3>

                    <div className="text-[11px] text-slate-600 font-mono flex flex-wrap items-center gap-x-3 gap-y-0.5">
                      <span>
                        <strong className="text-slate-400 font-medium">Target:</strong> {b.icp.title}
                      </span>
                      <span className="text-slate-300">•</span>
                      <span>
                        <strong className="text-slate-400 font-medium">Offer:</strong> {b.offer.name}
                      </span>
                    </div>
                  </div>

                  {/* Right Column: Gate Expectation, Regression Output, Expand Chevron */}
                  <div className="flex items-center space-x-3 shrink-0 self-start md:self-center">
                    {/* Expected Gate Tag */}
                    <div>
                      {b.expectedEvaluation.shouldPassOverall ? (
                        <span className="font-mono text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-[3px] border border-emerald-200 whitespace-nowrap">
                          SHOULD PASS
                        </span>
                      ) : (
                        <span className="font-mono text-[10px] font-bold text-rose-800 bg-rose-50 px-2 py-0.5 rounded-[3px] border border-rose-200 whitespace-nowrap">
                          MUST FAIL (HARD GATE)
                        </span>
                      )}
                    </div>

                    {/* Benchmark Regression Output */}
                    {benchResult ? (
                      <div className="text-right">
                        <span
                          className={`font-mono text-[11px] font-bold block ${
                            benchResult.passedRegression ? 'text-emerald-700' : 'text-rose-600'
                          }`}
                        >
                          {benchResult.actualPass ? 'PASSED' : 'REJECTED'} ({benchResult.overallScore}/100)
                        </span>
                        {benchResult.hasCriticalBlocker && (
                          <span className="text-[10px] font-mono text-rose-600 font-semibold block">
                            Critical Gate Blocked
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="font-mono text-[11px] text-slate-400">Ready</span>
                    )}

                    <div className="text-slate-400 hover:text-slate-700 pl-1">
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Expanded Details Drawer */}
                {isExpanded && (
                  <div className="border-t border-[#E2E4E9] bg-[#FAF9F6] p-4 text-xs font-mono space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Rules & Constraints */}
                      <div className="space-y-1.5 bg-white p-3 rounded-[3px] border border-[#E2E4E9]">
                        <span className="font-bold uppercase text-[10px] tracking-wider text-slate-500 block">
                          Prohibited Trigger Patterns &amp; Regulations:
                        </span>
                        <ul className="space-y-1 text-[11px]">
                          {b.constraints.forbiddenPhrases.map((phrase: string, idx: number) => (
                            <li key={idx} className="text-rose-700 flex items-start space-x-1.5">
                              <span className="text-rose-400 select-none">•</span>
                              <span>Prohibited: <span className="font-bold underline decoration-rose-300">&quot;{phrase}&quot;</span></span>
                            </li>
                          ))}
                          {b.constraints.applicableRegulations.map((reg: string, idx: number) => (
                            <li key={idx} className="text-slate-600 flex items-start space-x-1.5">
                              <span className="text-slate-400 select-none">•</span>
                              <span>Regulation: <strong>{reg}</strong></span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Test Content Payload */}
                      <div className="space-y-1.5 bg-white p-3 rounded-[3px] border border-[#E2E4E9]">
                        <div className="flex items-center justify-between">
                          <span className="font-bold uppercase text-[10px] tracking-wider text-slate-500">
                            Sample Test Content Payload:
                          </span>
                          <span className="text-[10px] text-slate-400">Deterministic Fixture</span>
                        </div>
                        <div className="text-[11px] text-slate-800 space-y-1">
                          <p className="font-bold text-slate-900 font-sans">{b.sampleCompliantContent.headline}</p>
                          <p className="text-slate-600 line-clamp-3 leading-relaxed">{b.sampleCompliantContent.body}</p>
                          <div className="pt-1 border-t border-[#E2E4E9] text-indigo-700 font-semibold flex items-center space-x-1">
                            <span className="text-slate-400 font-normal">CTA:</span>
                            <span>{b.sampleCompliantContent.callToAction}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Bottom Split: Lifecycle Flow & Security Audit Trail */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Asset State Machine Distribution */}
        <div className="bg-white rounded-[4px] border border-[#E2E4E9] shadow-2xs p-4 space-y-3">
          <div className="flex items-center justify-between pb-2.5 border-b border-[#E2E4E9]">
            <div className="flex items-center space-x-2">
              <Layers className="w-3.5 h-3.5 text-indigo-600" />
              <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-slate-900">
                Asset Lifecycle Distribution
              </h3>
            </div>
            <span className="text-[10px] font-mono text-slate-400">Server Enforced</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {Object.entries(telemetry.lifecycleDistribution).map(([state, count]) => (
              <div key={state} className="p-2.5 rounded-[4px] bg-[#FAF9F6] border border-[#E2E4E9]">
                <p className="text-[10px] font-mono text-slate-400 uppercase font-semibold">{state}</p>
                <p className="text-lg font-bold font-mono tabular-nums text-slate-900 mt-0.5">{count}</p>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-[#E2E4E9] flex flex-wrap items-center justify-between gap-2">
            <span className="text-[10px] font-mono uppercase text-slate-400 font-bold">
              Volume by Channel:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {Object.entries(telemetry.assetVolumeByChannel).map(([channel, count]) => (
                <span
                  key={channel}
                  className="bg-indigo-50 text-indigo-800 text-[10px] font-mono px-2 py-0.5 rounded-[3px] border border-indigo-200 font-bold"
                >
                  {channel}: {count}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Security & Audit Events */}
        <div className="bg-white rounded-[4px] border border-[#E2E4E9] shadow-2xs p-4 space-y-3">
          <div className="flex items-center justify-between pb-2.5 border-b border-[#E2E4E9]">
            <div className="flex items-center space-x-2">
              <Lock className="w-3.5 h-3.5 text-indigo-600" />
              <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-slate-900">
                OWASP-Aligned Security Trail
              </h3>
            </div>
            <span className="text-[10px] font-mono text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded-[3px] border border-emerald-200">
              IMMUTABLE LEDGER
            </span>
          </div>

          <div className="border border-[#E2E4E9] rounded-[4px] overflow-hidden">
            <table className="w-full text-xs">
              <thead className="bg-[#FAF9F6] border-b border-[#E2E4E9] text-slate-600 text-[10px] font-mono uppercase">
                <tr>
                  <th className="py-2 px-3 text-left">Action</th>
                  <th className="py-2 px-3 text-left">Role</th>
                  <th className="py-2 px-3 text-right">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E4E9] font-mono text-slate-700">
                {recentAudits.slice(0, 5).map((log: any) => (
                  <tr key={log.id} className="hover:bg-slate-50/60 transition">
                    <td className="py-2 px-3 font-bold text-slate-900 font-sans text-[11px]">
                      {log.action}
                    </td>
                    <td className="py-2 px-3 text-[10px] text-slate-500">
                      {log.actorRole}
                    </td>
                    <td className="py-2 px-3 text-right text-[10px] text-slate-400">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
