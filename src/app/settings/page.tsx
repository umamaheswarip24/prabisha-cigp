import { prisma } from '@/lib/db/prisma';
import { aiGateway } from '@/lib/ai/gateway';
import { AIUsageLedger } from '@/lib/ai/ledger';
import { Cpu, Activity } from 'lucide-react';

export const revalidate = 0;

export default async function SettingsPage() {
  const policies = aiGateway.getRouter().getAllPolicies();
  const summary = await AIUsageLedger.getWorkspaceSummary('prabisha-hq');
  const recentLogs = await prisma.aIRequestLog.findMany({
    take: 10,
    orderBy: { timestamp: 'desc' },
  });

  return (
    <div className="space-y-6">
      {/* 1. Flat Gateway Header on Canvas */}
      <div className="border-b border-[#E2E4E9] pb-4 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded-[3px] border border-[#E2E4E9]">
              PRD Section 7 Mandatory Architecture
            </span>
            <span className="text-slate-400 text-xs">•</span>
            <span className="text-[11px] font-mono text-slate-500">
              AI Gateway &amp; Provider Registry
            </span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight font-sans">
            Model-Agnostic AI Gateway &amp; Policy Registry
          </h1>
          <p className="text-xs text-slate-600 leading-normal font-sans max-w-2xl">
            Zero vendor lock-in. Switch model providers (Gemini, OpenAI, Anthropic, LiteLLM) via configuration with zero code alterations to core campaign logic.
          </p>
        </div>

        {/* Live Circuit Breaker Status Indicator */}
        <div className="flex items-center space-x-2 shrink-0">
          <span className="inline-flex items-center space-x-1.5 text-[11px] font-mono text-indigo-700 bg-indigo-50 px-2.5 py-1.5 rounded-[4px] border border-indigo-200 font-bold shadow-2xs">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse" />
            <span>Circuit Breaker Active</span>
          </span>
        </div>
      </div>

      {/* 2. Unified 4-Column Gateway Telemetry Strip */}
      <div className="bg-white border border-[#E2E4E9] rounded-[4px] grid grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-[#E2E4E9] shadow-2xs">
        {/* Column 1: Total AI Invocations */}
        <div className="p-4 space-y-1">
          <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">
            TOTAL AI INVOCATIONS
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-slate-900 tracking-tight">
            {summary.totalRequests}
          </div>
          <div className="text-[11px] font-mono text-slate-500">
            Tracked in AIUsageLedger
          </div>
        </div>

        {/* Column 2: Tokens Processed */}
        <div className="p-4 space-y-1">
          <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">
            TOKENS PROCESSED
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-indigo-700 tracking-tight">
            {summary.totalTokens.toLocaleString()}
          </div>
          <div className="text-[11px] font-mono text-slate-500">
            Prompt &amp; completion
          </div>
        </div>

        {/* Column 3: Estimated Spend (USD) */}
        <div className="p-4 space-y-1">
          <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">
            ESTIMATED SPEND (USD)
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-slate-900 tracking-tight">
            ${summary.totalCostUsd.toFixed(4)}
          </div>
          <div className="text-[11px] font-mono text-slate-500">
            Blended provider rate
          </div>
        </div>

        {/* Column 4: Average Latency */}
        <div className="p-4 space-y-1">
          <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">
            AVERAGE LATENCY
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-slate-900 tracking-tight">
            {summary.averageLatencyMs} <span className="text-xs font-normal text-slate-500">ms</span>
          </div>
          <div className="flex items-center space-x-1.5 mt-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block shrink-0" />
            <span className="font-mono text-[11px] text-emerald-700 font-medium">
              P95 SLA &lt; 500ms target
            </span>
          </div>
        </div>
      </div>

      {/* 3. Per-Task Model Routing Policies (Visual Dispatch Ledger) */}
      <div className="space-y-3">
        {/* Flat Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 pb-3 border-b border-[#E2E4E9]">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <Cpu className="w-3.5 h-3.5 text-indigo-600" />
              <h2 className="text-base font-bold text-slate-900 font-sans tracking-tight">
                Per-Task Model Routing Policies
              </h2>
            </div>
            <p className="text-xs text-slate-500">
              Configured dispatch policies matching specialized models to task requirements with automatic failover circuit breaker.
            </p>
          </div>
          <span className="font-mono text-[10px] uppercase font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-[3px] border border-[#E2E4E9] shrink-0">
            {Object.keys(policies).length} Policies Active
          </span>
        </div>

        {/* Flat Edge-to-Edge Visual Dispatch Table */}
        <div className="bg-white border border-[#E2E4E9] rounded-[4px] shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF9F6] border-b border-[#E2E4E9] text-slate-600 text-[10px] font-mono uppercase font-bold tracking-wider">
                <tr>
                  <th className="py-2.5 px-3.5">Task Type</th>
                  <th className="py-2.5 px-3.5">Dispatch Pipeline (Primary → Fallback)</th>
                  <th className="py-2.5 px-3.5 text-right">Temp</th>
                  <th className="py-2.5 px-3.5 text-right">Max Tokens</th>
                  <th className="py-2.5 px-3.5 text-right">Timeout</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E4E9] font-mono text-slate-700">
                {Object.entries(policies).map(([task, policy]) => {
                  const isCreative = policy.temperature > 0.4;

                  return (
                    <tr key={task} className="hover:bg-slate-50/60 transition">
                      {/* Bold Uppercase Monospace Task Type */}
                      <td className="py-3 px-3.5 font-bold text-slate-900 font-mono text-[11px] tracking-tight whitespace-nowrap">
                        {task}
                      </td>

                      {/* Visualized Routing Pipeline with Directional Arrow */}
                      <td className="py-3 px-3.5">
                        <div className="flex items-center space-x-2 text-xs flex-wrap gap-y-1">
                          {/* Primary Provider & Model Tag */}
                          <span className="inline-flex items-center space-x-1.5 bg-indigo-50/70 text-indigo-900 border border-indigo-200 px-2 py-0.5 rounded-[3px] font-mono text-[11px]">
                            <span className="font-bold uppercase tracking-wider text-indigo-950">
                              {policy.primaryProvider}
                            </span>
                            <span className="text-slate-600 font-normal">
                              {policy.primaryModel}
                            </span>
                          </span>

                          {/* Subtle Directional Arrow */}
                          <span className="text-slate-400 font-mono text-xs select-none">→</span>

                          {/* Fallback Provider & Model Tag */}
                          {policy.fallbackProvider ? (
                            <span className="inline-flex items-center space-x-1.5 bg-slate-100 text-slate-800 border border-[#E2E4E9] px-2 py-0.5 rounded-[3px] font-mono text-[11px]">
                              <span className="font-bold uppercase tracking-wider text-slate-700">
                                {policy.fallbackProvider}
                              </span>
                              <span className="text-slate-500 font-normal">
                                {policy.fallbackModel}
                              </span>
                            </span>
                          ) : (
                            <span className="text-slate-400 font-mono text-[11px] italic">
                              None (Terminal)
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Temperature with Color-Coded Micro-Indicator */}
                      <td className="py-3 px-3.5 text-right whitespace-nowrap">
                        <div className="inline-flex items-center space-x-1.5 justify-end">
                          <span
                            className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                              isCreative ? 'bg-amber-500' : 'bg-sky-500'
                            }`}
                            title={isCreative ? 'Creative Synthesis (Temp > 0.4)' : 'Deterministic / Factual (Temp ≤ 0.4)'}
                          />
                          <span className="font-mono tabular-nums text-[11px] text-slate-800 font-semibold">
                            {policy.temperature.toFixed(1)}
                          </span>
                        </div>
                      </td>

                      {/* Right-Aligned Max Tokens */}
                      <td className="py-3 px-3.5 text-right font-mono tabular-nums text-[11px] text-slate-700 whitespace-nowrap">
                        {policy.maxTokens.toLocaleString()}
                      </td>

                      {/* Right-Aligned Timeout */}
                      <td className="py-3 px-3.5 text-right font-mono tabular-nums text-[11px] text-slate-500 whitespace-nowrap">
                        {policy.timeoutMs / 1000}s
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 4. Real-Time Invocation Telemetry (Last 10 Invocations) */}
      <div className="space-y-3">
        {/* Flat Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 pb-3 border-b border-[#E2E4E9]">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <Activity className="w-3.5 h-3.5 text-indigo-600" />
              <h2 className="text-base font-bold text-slate-900 font-sans tracking-tight">
                Real-Time Invocation Telemetry (Last 10 Invocations)
              </h2>
            </div>
            <p className="text-xs text-slate-500">
              Auditable execution log with token consumption, latency, and circuit breaker status.
            </p>
          </div>
          <span className="font-mono text-[10px] uppercase font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-[3px] border border-emerald-200 shrink-0">
            Live Stream
          </span>
        </div>

        {recentLogs.length === 0 ? (
          <div className="bg-white border border-[#E2E4E9] rounded-[4px] p-6 text-center text-xs text-slate-400 font-mono shadow-2xs">
            No AI calls recorded yet.
          </div>
        ) : (
          <div className="bg-white border border-[#E2E4E9] rounded-[4px] shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FAF9F6] border-b border-[#E2E4E9] text-slate-600 text-[10px] font-mono uppercase font-bold tracking-wider">
                  <tr>
                    <th className="py-2.5 px-3.5">Timestamp</th>
                    <th className="py-2.5 px-3.5">Task</th>
                    <th className="py-2.5 px-3.5">Provider / Model</th>
                    <th className="py-2.5 px-3.5 text-right">Tokens</th>
                    <th className="py-2.5 px-3.5 text-right">Latency</th>
                    <th className="py-2.5 px-3.5 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E4E9] font-mono text-slate-700">
                  {recentLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/60 transition">
                      <td className="py-2.5 px-3.5 text-[11px] text-slate-500 font-mono tabular-nums whitespace-nowrap">
                        {new Date(log.timestamp).toLocaleTimeString('en-GB')}
                      </td>
                      <td className="py-2.5 px-3.5 font-bold text-slate-900 font-mono text-[11px] whitespace-nowrap">
                        {log.task}
                      </td>
                      <td className="py-2.5 px-3.5 text-slate-700 text-[11px] whitespace-nowrap">
                        <span className="font-semibold text-slate-900">{log.provider}</span>{' '}
                        <span className="text-slate-500">({log.model})</span>
                      </td>
                      <td className="py-2.5 px-3.5 text-right font-mono tabular-nums text-[11px] text-slate-800 whitespace-nowrap">
                        {(log.promptTokens + log.completionTokens).toLocaleString()}
                      </td>
                      <td className="py-2.5 px-3.5 text-right font-mono tabular-nums text-[11px] text-slate-700 whitespace-nowrap">
                        {log.latencyMs} ms
                      </td>
                      <td className="py-2.5 px-3.5 text-right whitespace-nowrap">
                        <span
                          className={`font-mono text-[10px] font-bold px-1.5 py-0.5 rounded-[3px] border ${
                            log.status === 'SUCCESS'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : 'bg-amber-50 text-amber-800 border-amber-200'
                          }`}
                        >
                          {log.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
