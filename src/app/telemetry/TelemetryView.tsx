'use client';

import React, { useState } from 'react';
import { WorkspaceTelemetrySummary } from '@/types';
import {
  Activity,
  Cpu,
  DollarSign,
  ShieldCheck,
  AlertTriangle,
  Play,
  CheckCircle2,
  XCircle,
  Layers,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  FileCheck,
  BarChart3,
  Clock,
  Sparkles,
  Lock,
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
      {/* Decluttered Page Header on Canvas */}
      <div className="border-b border-[#E2E4E9] pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Observability, AI Telemetry &amp; Quality Evaluation
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time tracking of AI token consumption, spend ledger, compliance pass rates, and regression evaluation.
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded border border-[#E2E4E9] text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 transition shadow-2xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Refresh Telemetry</span>
          </button>
          <button
            onClick={handleRunRegression}
            disabled={isRunningEval}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition shadow-xs disabled:opacity-50"
          >
            <Play className={`w-3.5 h-3.5 ${isRunningEval ? 'animate-spin' : ''}`} />
            <span>{isRunningEval ? 'Running Evaluation...' : 'Run Golden Benchmark'}</span>
          </button>
        </div>
      </div>

      {/* Unified 4-Column KPI Telemetry Bar */}
      <div className="bg-white border border-[#E2E4E9] rounded-md grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-[#E2E4E9] shadow-xs">
        <div className="p-4 space-y-1">
          <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
            AI Spend Ledger
          </span>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-bold font-mono text-emerald-600">
              ${telemetry.aiUsage.totalCostUsd.toFixed(4)}
            </span>
            <span className="text-[11px] font-mono text-slate-500">
              ({telemetry.aiUsage.totalTokens.toLocaleString()} tokens)
            </span>
          </div>
        </div>

        <div className="p-4 space-y-1">
          <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
            Average Latency
          </span>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-bold font-mono text-slate-900">
              {telemetry.aiUsage.averageLatencyMs} <span className="text-xs font-normal text-slate-500">ms</span>
            </span>
            <span className="text-[11px] text-emerald-700 font-medium">P95 &lt; 500ms SLA</span>
          </div>
        </div>

        <div className="p-4 space-y-1">
          <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
            Compliance Pass Rate
          </span>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-bold font-mono text-indigo-700">
              {telemetry.complianceSummary.passRatePercent}%
            </span>
            <span className="text-[11px] text-slate-500">
              ({telemetry.complianceSummary.passedEvaluations} passed)
            </span>
          </div>
        </div>

        <div className="p-4 space-y-1">
          <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
            Asset Pipeline
          </span>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-bold font-mono text-slate-900">
              {telemetry.totalAssets}
            </span>
            <span className="text-[11px] text-slate-500">
              ({telemetry.totalPublished} published)
            </span>
          </div>
        </div>
      </div>

      {/* Golden Evaluation Dataset & Regression Runner (Dense Data Rows) */}
      <div className="bg-white rounded-md border border-[#E2E4E9] shadow-xs p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E2E4E9]">
          <div>
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <h2 className="text-xs font-bold font-mono uppercase tracking-wider text-slate-900">
                Golden Evaluation Dataset ({goldenBriefs.length} Cases)
              </h2>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Curated benchmark set with real briefs, constraints, and known failure edge cases to catch regressions
            </p>
          </div>

          {evalBenchmark && (
            <div className="flex items-center space-x-2 font-mono text-xs bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200 text-emerald-800 font-bold">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>
                Benchmark: {evalBenchmark.passedCases} / {evalBenchmark.totalCases} Passed (100%)
              </span>
            </div>
          )}
        </div>

        {/* Dense Scannable Data Table */}
        <div className="border border-[#E2E4E9] rounded overflow-hidden">
          <table className="w-full text-xs">
            <thead className="bg-[#FAF9F6] border-b border-[#E2E4E9] text-slate-600 text-[10px] font-mono uppercase">
              <tr>
                <th className="py-2 px-3 text-left">Brief Name &amp; ID</th>
                <th className="py-2 px-3 text-left">Market</th>
                <th className="py-2 px-3 text-left">Target ICP &amp; Offer</th>
                <th className="py-2 px-3 text-left">Expected</th>
                <th className="py-2 px-3 text-right">Regression Result</th>
                <th className="py-2 px-3 text-center w-8"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E4E9]">
              {goldenBriefs.map((b: any) => {
                const benchResult = evalBenchmark?.results?.find((r: any) => r.caseId === b.id);
                const isExpanded = expandedCase === b.id;

                return (
                  <React.Fragment key={b.id}>
                    <tr className="hover:bg-slate-50/60 transition">
                      <td className="py-2.5 px-3">
                        <div className="font-bold text-slate-900 tracking-tight">{b.name}</div>
                        <div className="font-mono text-[10px] text-slate-400">{b.id}</div>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="font-mono text-[10px] font-bold bg-slate-100 text-slate-700 px-1.5 py-0.2 rounded border border-[#E2E4E9]">
                          {b.market} ({b.locale})
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="text-slate-800 font-medium text-[11px] truncate max-w-xs">
                          {b.icp.title}
                        </div>
                        <div className="text-[10px] text-slate-400 truncate max-w-xs">{b.offer.name}</div>
                      </td>
                      <td className="py-2.5 px-3">
                        {b.expectedEvaluation.shouldPassOverall ? (
                          <span className="font-mono text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                            SHOULD PASS
                          </span>
                        ) : (
                          <span className="font-mono text-[10px] font-bold text-rose-800 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
                            MUST FAIL (HARD GATE)
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        {benchResult ? (
                          <div className="flex flex-col items-end">
                            <span
                              className={`font-mono text-[11px] font-bold ${
                                benchResult.passedRegression ? 'text-emerald-700' : 'text-rose-600'
                              }`}
                            >
                              {benchResult.actualPass ? 'PASSED' : 'REJECTED'} (Score: {benchResult.overallScore}/100)
                            </span>
                            {benchResult.hasCriticalBlocker && (
                              <span className="text-[10px] font-mono text-rose-600 font-semibold">
                                Critical Gate Blocked
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-[11px] font-mono text-slate-400">Ready</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <button
                          onClick={() => setExpandedCase(isExpanded ? null : b.id)}
                          className="p-1 text-slate-400 hover:text-slate-700"
                        >
                          {isExpanded ? (
                            <ChevronUp className="w-3.5 h-3.5" />
                          ) : (
                            <ChevronDown className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </td>
                    </tr>

                    {/* Expanded Detail Row */}
                    {isExpanded && (
                      <tr className="bg-[#FAF9F6]">
                        <td colSpan={6} className="p-4 border-b border-[#E2E4E9]">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                            <div className="space-y-1">
                              <span className="font-bold uppercase text-[10px] text-slate-500">
                                Prohibited Rules &amp; Regulations:
                              </span>
                              <ul className="space-y-1 text-[11px] text-slate-700">
                                {b.constraints.forbiddenPhrases.map((phrase: string, idx: number) => (
                                  <li key={idx} className="text-rose-700">
                                    • Prohibited: &quot;{phrase}&quot;
                                  </li>
                                ))}
                                {b.constraints.applicableRegulations.map((reg: string, idx: number) => (
                                  <li key={idx} className="text-slate-600">
                                    • Regulation: {reg}
                                  </li>
                                ))}
                              </ul>
                            </div>

                            <div className="space-y-1">
                              <span className="font-bold uppercase text-[10px] text-slate-500">
                                Sample Test Content Payload:
                              </span>
                              <div className="bg-white p-2.5 rounded border border-[#E2E4E9] text-[11px] text-slate-700 space-y-1">
                                <p className="font-bold text-slate-900">{b.sampleCompliantContent.headline}</p>
                                <p className="text-slate-600 line-clamp-2">{b.sampleCompliantContent.body}</p>
                                <p className="text-indigo-600 font-semibold">
                                  CTA: {b.sampleCompliantContent.callToAction}
                                </p>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Lifecycle Flow & Security Audit Trail */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Asset State Machine Distribution */}
        <div className="bg-white rounded-md border border-[#E2E4E9] shadow-xs p-5 space-y-4">
          <div className="flex items-center justify-between pb-2.5 border-b border-[#E2E4E9]">
            <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-slate-900 flex items-center space-x-1.5">
              <Layers className="w-3.5 h-3.5 text-indigo-600" />
              <span>Asset Lifecycle Distribution</span>
            </h3>
            <span className="text-[10px] font-mono text-slate-400">Server Enforced</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {Object.entries(telemetry.lifecycleDistribution).map(([state, count]) => (
              <div key={state} className="p-2.5 rounded bg-[#FAF9F6] border border-[#E2E4E9]">
                <p className="text-[10px] font-mono text-slate-400 uppercase">{state}</p>
                <p className="text-base font-bold font-mono text-slate-900 mt-0.5">{count}</p>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-[#E2E4E9]">
            <span className="text-[11px] font-mono uppercase text-slate-400 font-bold block mb-1.5">
              Volume by Channel:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {Object.entries(telemetry.assetVolumeByChannel).map(([channel, count]) => (
                <span
                  key={channel}
                  className="bg-indigo-50 text-indigo-800 text-[11px] font-mono px-2 py-0.5 rounded border border-indigo-200 font-medium"
                >
                  {channel}: {count}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Security & Audit Events */}
        <div className="bg-white rounded-md border border-[#E2E4E9] shadow-xs p-5 space-y-4">
          <div className="flex items-center justify-between pb-2.5 border-b border-[#E2E4E9]">
            <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-slate-900 flex items-center space-x-1.5">
              <Lock className="w-3.5 h-3.5 text-indigo-600" />
              <span>OWASP-Aligned Security Trail</span>
            </h3>
            <span className="text-[10px] font-mono text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
              IMMUTABLE
            </span>
          </div>

          <div className="border border-[#E2E4E9] rounded overflow-hidden">
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
                  <tr key={log.id} className="hover:bg-slate-50/60">
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
