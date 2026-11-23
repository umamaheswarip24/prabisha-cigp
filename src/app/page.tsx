import Link from 'next/link';
import { prisma } from '@/lib/db/prisma';
import {
  Layers,
  BookOpen,
  Scale,
  Settings,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowUpRight,
} from 'lucide-react';

export const revalidate = 0;

export default async function DashboardPage() {
  const [
    campaignCount,
    assetCount,
    claimCount,
    evidenceCount,
    pendingReviewsCount,
    recentAssets,
  ] = await Promise.all([
    prisma.campaign.count(),
    prisma.contentAsset.count(),
    prisma.claim.count(),
    prisma.evidenceRecord.count(),
    prisma.contentAsset.count({ where: { status: 'NEEDS_REVIEW' } }),
    prisma.contentAsset.findMany({
      take: 6,
      orderBy: { createdAt: 'desc' },
      include: {
        campaign: true,
        versions: {
          orderBy: { versionNumber: 'desc' },
          take: 1,
        },
      },
    }),
  ]);

  return (
    <div className="space-y-6">
      {/* Sleek Compact Command Strip */}
      <div className="bg-white border border-[#E2E4E9] rounded-md p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center space-x-3">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-slate-900 text-sm tracking-tight">
                Grounded Intelligence & Compliance Engine Active
              </span>
              <span className="text-[10px] font-mono bg-emerald-50 text-emerald-800 px-1.5 py-0.2 rounded border border-emerald-200">
                UK &amp; IN
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              All generative copy is anchored to registered claims, evidence records, and regulatory rules.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2.5 shrink-0">
          <Link
            href="/knowledge"
            className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-700 bg-white border border-[#E2E4E9] hover:bg-slate-50 hover:text-slate-900 px-3 py-1.5 rounded transition shadow-2xs"
          >
            <BookOpen className="w-3.5 h-3.5 text-slate-500" />
            <span>Inspect Claim Registry</span>
          </Link>
          <Link
            href="/campaigns"
            className="inline-flex items-center space-x-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 px-3.5 py-1.5 rounded transition shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Generate Weekly Campaign Pack</span>
          </Link>
        </div>
      </div>

      {/* Unified 4-Column Telemetry Bar */}
      <div className="bg-white border border-[#E2E4E9] rounded-md grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-[#E2E4E9] shadow-xs">
        <div className="p-4 space-y-1">
          <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
            Active Campaigns
          </span>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-bold font-mono text-slate-900">{campaignCount}</span>
            <span className="text-[11px] text-slate-500 font-sans">UK &amp; India Targets</span>
          </div>
        </div>

        <div className="p-4 space-y-1">
          <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
            Substantiated Claims
          </span>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-bold font-mono text-emerald-600">{claimCount}</span>
            <span className="text-[11px] text-slate-500 font-sans">
              ({evidenceCount} evidence records)
            </span>
          </div>
        </div>

        <div className="p-4 space-y-1">
          <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
            Compliance Reviews
          </span>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-bold font-mono text-amber-600">{pendingReviewsCount}</span>
            <span className="text-[11px] text-slate-500 font-sans">Pending sign-off</span>
          </div>
        </div>

        <div className="p-4 space-y-1">
          <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
            Generated Assets
          </span>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-bold font-mono text-indigo-600">{assetCount}</span>
            <span className="text-[11px] text-slate-500 font-sans">Multi-channel variants</span>
          </div>
        </div>
      </div>

      {/* Structural Workspace Grid: Content Pipeline & Governance */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 cols): Production Pipeline & Recent Assets */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-md border border-[#E2E4E9] shadow-xs">
            <div className="p-4 border-b border-[#E2E4E9] flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-slate-900 tracking-tight">
                  Recent Content Pipeline Assets
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Latest versioned drafts with state machine verification
                </p>
              </div>
              <Link
                href="/campaigns"
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center space-x-1"
              >
                <span>All campaigns</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {recentAssets.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500 space-y-2">
                <p>No content generated in this workspace yet.</p>
                <Link
                  href="/campaigns"
                  className="inline-block bg-indigo-600 text-white font-semibold px-3 py-1.5 rounded"
                >
                  Create First Brief
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-[#E2E4E9]">
                {recentAssets.map((asset) => {
                  const version = asset.versions[0];
                  return (
                    <div
                      key={asset.id}
                      className="p-4 flex items-start justify-between hover:bg-slate-50/70 transition"
                    >
                      <div className="space-y-1 max-w-lg">
                        <div className="flex items-center space-x-2">
                          <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded border border-[#E2E4E9]">
                            {asset.channel}
                          </span>
                          <span
                            className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                              asset.status === 'PUBLISHED'
                                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                : asset.status === 'APPROVED'
                                ? 'bg-indigo-50 text-indigo-800 border border-indigo-200'
                                : asset.status === 'CHANGES_REQUESTED'
                                ? 'bg-rose-50 text-rose-800 border border-rose-200'
                                : 'bg-amber-50 text-amber-800 border border-amber-200'
                            }`}
                          >
                            {asset.status}
                          </span>
                          <span className="text-[11px] font-mono text-slate-400">
                            v{version?.versionNumber || 1}
                          </span>
                        </div>
                        <h3 className="text-xs font-bold text-slate-900">
                          {version?.headline || asset.campaign.name}
                        </h3>
                        <p className="text-xs text-slate-600 line-clamp-1">
                          {version?.body || 'Content generated'}
                        </p>
                      </div>

                      <div className="text-right flex flex-col items-end space-y-1.5 shrink-0 ml-4">
                        <span className="text-[11px] font-mono text-slate-400">
                          {new Date(asset.createdAt).toLocaleDateString('en-GB')}
                        </span>
                        <Link
                          href="/campaigns"
                          className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center space-x-0.5"
                        >
                          <span>Review</span>
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Governance Status & AI Gateway */}
        <div className="space-y-6">
          {/* Active Compliance Summary */}
          <div className="bg-white rounded-md border border-[#E2E4E9] shadow-xs p-4 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#E2E4E9]">
              <h2 className="text-xs font-bold font-mono uppercase tracking-wider text-slate-900 flex items-center space-x-1.5">
                <Scale className="w-3.5 h-3.5 text-indigo-600" />
                <span>Active Rule Packs</span>
              </h2>
              <span className="text-[10px] font-mono text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                ENFORCED
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-2.5 bg-slate-50/80 rounded border border-[#E2E4E9]">
                <div className="flex items-center justify-between font-bold text-slate-800 text-[11px]">
                  <span>United Kingdom (UK)</span>
                  <span className="font-mono text-emerald-700">ASA / CAP 3.7 &amp; 3.1</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                  Mandatory proof for claims, zero fake urgency/scarcity, ICO direct marketing compliance.
                </p>
              </div>

              <div className="p-2.5 bg-slate-50/80 rounded border border-[#E2E4E9]">
                <div className="flex items-center justify-between font-bold text-slate-800 text-[11px]">
                  <span>India</span>
                  <span className="font-mono text-emerald-700">ASCI Ch I &amp; DPDP</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                  Prohibits misleading ranking claims, mandates clear disclosures and consent boundaries.
                </p>
              </div>
            </div>

            <Link
              href="/compliance"
              className="block text-center text-xs font-semibold text-indigo-600 hover:text-indigo-800 pt-1"
            >
              Inspect Governance Rules &rarr;
            </Link>
          </div>

          {/* AI Gateway Architecture */}
          <div className="bg-white rounded-md border border-[#E2E4E9] shadow-xs p-4 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#E2E4E9]">
              <h2 className="text-xs font-bold font-mono uppercase tracking-wider text-slate-900 flex items-center space-x-1.5">
                <Settings className="w-3.5 h-3.5 text-indigo-600" />
                <span>Model-Agnostic AI Gateway</span>
              </h2>
              <span className="text-[10px] font-mono text-indigo-700 font-bold bg-indigo-50 px-1.5 py-0.2 rounded border border-indigo-200">
                MULTI-PROVIDER
              </span>
            </div>

            <div className="text-xs space-y-2 text-slate-600">
              <p className="text-[11px] leading-snug">
                Zero vendor lock-in. Switch model providers via configuration without modifying business logic.
              </p>
              <div className="p-2.5 bg-[#FAF9F6] rounded border border-[#E2E4E9] space-y-1 font-mono text-[11px]">
                <div className="flex justify-between">
                  <span className="text-slate-500">Router Status:</span>
                  <span className="font-bold text-slate-900">8 Policies Active</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Failover Mode:</span>
                  <span className="font-bold text-emerald-700">Circuit Breaker</span>
                </div>
              </div>
            </div>

            <Link
              href="/settings"
              className="block text-center text-xs font-semibold text-indigo-600 hover:text-indigo-800 pt-1"
            >
              Configure Gateway &amp; Routing &rarr;
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
