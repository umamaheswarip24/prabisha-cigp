import { prisma } from '@/lib/db/prisma';
import { aiGateway } from '@/lib/ai/gateway';
import { AIUsageLedger } from '@/lib/ai/ledger';
import {
  Settings,
  Cpu,
  Layers,
  Activity,
  DollarSign,
  ShieldCheck,
  RefreshCw,
  ArrowRight,
} from 'lucide-react';

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
      {/* Decluttered Page Header on Canvas */}
      <div className="border-b border-[#E2E4E9] pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Model-Agnostic AI Gateway &amp; Policy Registry
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Switch model providers (Gemini, OpenAI, Anthropic, LiteLLM) via configuration without code changes.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-[11px] font-mono text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded border border-indigo-200 font-bold">
            Failover Mode: Automatic Circuit Breaker
          </span>
        </div>
      </div>

      {/* Unified 4-Column KPI Telemetry Bar */}
      <div className="bg-white border border-[#E2E4E9] rounded-md grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-[#E2E4E9] shadow-xs">
        <div className="p-4 space-y-1">
          <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
            Total Invocations
          </span>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-bold font-mono text-slate-900">{summary.totalRequests}</span>
            <span className="text-[11px] text-slate-500 font-sans">Ledger Logged</span>
          </div>
        </div>

        <div className="p-4 space-y-1">
          <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
            Tokens Processed
          </span>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-bold font-mono text-indigo-700">
              {summary.totalTokens.toLocaleString()}
            </span>
            <span className="text-[11px] text-slate-500 font-sans">Prompt &amp; Completion</span>
          </div>
        </div>

        <div className="p-4 space-y-1">
          <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
            Estimated Spend
          </span>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-bold font-mono text-emerald-600">
              ${summary.totalCostUsd.toFixed(4)}
            </span>
            <span className="text-[11px] text-slate-500 font-sans">Blended Rate</span>
          </div>
        </div>

        <div className="p-4 space-y-1">
          <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
            Average Latency
          </span>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-bold font-mono text-slate-900">{summary.averageLatencyMs}</span>
            <span className="text-[11px] text-slate-500 font-sans">ms (P95 Compliant)</span>
          </div>
        </div>
      </div>

      {/* Task Model Routing Policies Table with Visual Flow Arrows */}
      <div className="bg-white rounded-md border border-[#E2E4E9] shadow-xs p-5 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#E2E4E9]">
          <div>
            <h2 className="text-xs font-bold font-mono uppercase tracking-wider text-slate-900 flex items-center space-x-1.5">
              <Cpu className="w-3.5 h-3.5 text-indigo-600" />
              <span>Per-Task Model Routing Policies</span>
            </h2>
            <p className="text-[11px] text-slate-400">
              Dispatch hierarchy matching specialized models to task constraints with automatic fallback
            </p>
          </div>
          <span className="text-[10px] font-mono text-slate-400">8 Policies Active</span>
        </div>

        <div className="border border-[#E2E4E9] rounded overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF9F6] border-b border-[#E2E4E9] text-slate-600 text-[10px] font-mono uppercase font-bold">
              <tr>
                <th className="py-2.5 px-3">Task Type</th>
                <th className="py-2.5 px-3">Primary ➔ Fallback Routing Chain</th>
                <th className="py-2.5 px-3 text-center">Temp</th>
                <th className="py-2.5 px-3 text-center">Max Tokens</th>
                <th className="py-2.5 px-3 text-right">Timeout</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E4E9] font-mono text-slate-700">
              {Object.entries(policies).map(([task, policy]) => (
                <tr key={task} className="hover:bg-slate-50/60 transition">
                  <td className="py-2.5 px-3 font-bold text-slate-900 font-sans text-xs">
                    {task}
                  </td>
                  <td className="py-2.5 px-3">
                    <div className="flex items-center space-x-2 text-xs">
                      {/* Primary Provider */}
                      <span className="inline-flex items-center space-x-1 bg-indigo-50 text-indigo-800 border border-indigo-200 px-2 py-0.5 rounded font-bold text-[10px]">
                        <span>{policy.primaryProvider.toUpperCase()}</span>
                        <span className="font-normal text-slate-600">{policy.primaryModel}</span>
                      </span>

                      {/* Fallback Provider */}
                      {policy.fallbackProvider ? (
                        <>
                          <ArrowRight className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="inline-flex items-center space-x-1 bg-slate-100 text-slate-700 border border-[#E2E4E9] px-2 py-0.5 rounded text-[10px]">
                            <span className="font-bold">{policy.fallbackProvider.toUpperCase()}</span>
                            <span className="text-slate-500">{policy.fallbackModel}</span>
                          </span>
                        </>
                      ) : (
                        <span className="text-slate-400 text-[10px] italic">None</span>
                      )}
                    </div>
                  </td>
                  <td className="py-2.5 px-3 text-center text-[11px]">{policy.temperature}</td>
                  <td className="py-2.5 px-3 text-center text-[11px]">{policy.maxTokens}</td>
                  <td className="py-2.5 px-3 text-right text-[11px] text-slate-500">
                    {policy.timeoutMs / 1000}s
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Telemetry Request Logs (Dense Data Rows) */}
      <div className="bg-white rounded-md border border-[#E2E4E9] shadow-xs p-5 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#E2E4E9]">
          <div>
            <h2 className="text-xs font-bold font-mono uppercase tracking-wider text-slate-900 flex items-center space-x-1.5">
              <Activity className="w-3.5 h-3.5 text-indigo-600" />
              <span>Real-Time Invocation Telemetry (Last 10 Invocations)</span>
            </h2>
            <p className="text-[11px] text-slate-400">
              Auditable execution log with token counts, latencies, and circuit breaker status
            </p>
          </div>
          <span className="text-[10px] font-mono text-slate-400">Live Stream</span>
        </div>

        {recentLogs.length === 0 ? (
          <p className="text-xs text-slate-400 py-4 text-center">No AI calls recorded yet.</p>
        ) : (
          <div className="border border-[#E2E4E9] rounded overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF9F6] border-b border-[#E2E4E9] text-slate-600 text-[10px] font-mono uppercase font-bold">
                <tr>
                  <th className="py-2 px-3">Timestamp</th>
                  <th className="py-2 px-3">Task</th>
                  <th className="py-2 px-3">Provider / Model</th>
                  <th className="py-2 px-3">Tokens</th>
                  <th className="py-2 px-3">Latency</th>
                  <th className="py-2 px-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E4E9] font-mono text-slate-700">
                {recentLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/60">
                    <td className="py-2 px-3 text-[11px] text-slate-500 font-sans">
                      {new Date(log.timestamp).toLocaleTimeString('en-GB')}
                    </td>
                    <td className="py-2 px-3 font-semibold text-slate-900 font-sans text-xs">
                      {log.task}
                    </td>
                    <td className="py-2 px-3 text-xs">
                      {log.provider} ({log.model})
                    </td>
                    <td className="py-2 px-3 text-xs">
                      {log.promptTokens + log.completionTokens}
                    </td>
                    <td className="py-2 px-3 text-xs">{log.latencyMs} ms</td>
                    <td className="py-2 px-3 text-right">
                      <span
                        className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded ${
                          log.status === 'SUCCESS'
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : 'bg-amber-50 text-amber-800 border border-amber-200'
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
        )}
      </div>
    </div>
  );
}
