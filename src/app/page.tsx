import Link from 'next/link';
import { prisma } from '@/lib/db/prisma';
import {
  Sparkles,
  BookOpen,
  ArrowRight,
  ArrowUpRight,
  Scale,
  ShieldCheck,
  Settings,
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
      {/* 1. Split Command Header directly on Canvas with 1px Bottom Hairline */}
      <div className="border-b border-[#E2E4E9] pb-5 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1.5 max-w-2xl">
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 border border-indigo-200 px-1.5 py-0.2 rounded-[4px]">
              Intelligence Workspace
            </span>
            <span className="text-slate-400 text-xs">•</span>
            <span className="text-[11px] font-mono text-slate-500">v1.0 Production</span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight font-sans">
            Prabisha Content Intelligence &amp; Growth Platform
          </h1>
          <p className="text-xs text-slate-600 leading-relaxed font-sans">
            Eliminating ungrounded AI text generation by anchoring every marketing asset to registered evidence, verifiable brand claims, and UK (ASA/CAP) / India (ASCI) compliance rules.
          </p>
        </div>

        {/* Flush-Right Actions */}
        <div className="flex items-center space-x-2.5 shrink-0">
          <Link
            href="/knowledge"
            className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-700 bg-white border border-[#E2E4E9] hover:bg-slate-50 hover:text-slate-900 px-3.5 py-2 rounded-[4px] transition shadow-2xs"
          >
            <BookOpen className="w-3.5 h-3.5 text-slate-500" />
            <span>Inspect Claim Registry</span>
          </Link>
          <Link
            href="/campaigns"
            className="inline-flex items-center space-x-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-[4px] transition shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Generate Weekly Campaign Pack</span>
          </Link>
        </div>
      </div>

      {/* 2. Unified 4-Column Horizontal Telemetry Strip */}
      <div className="bg-white border border-[#E2E4E9] rounded-[4px] grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-[#E2E4E9] shadow-xs">
        {/* Active Campaigns */}
        <div className="p-4 space-y-1">
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">
            Active Campaigns
          </span>
          <div className="text-2xl md:text-3xl font-bold font-mono text-slate-900">
            {campaignCount}
          </div>
          <p className="text-[11px] text-slate-500 font-sans">
            Targeting UK &amp; India SMEs
          </p>
        </div>

        {/* Substantiated Claims */}
        <div className="p-4 space-y-1">
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">
            Substantiated Claims
          </span>
          <div className="text-2xl md:text-3xl font-bold font-mono text-emerald-600">
            {claimCount}
          </div>
          <p className="text-[11px] text-slate-500 font-sans">
            {evidenceCount} supporting evidence docs
          </p>
        </div>

        {/* Compliance Reviews */}
        <div className="p-4 space-y-1">
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">
            Compliance Reviews
          </span>
          <div className="text-2xl md:text-3xl font-bold font-mono text-amber-600">
            {pendingReviewsCount}
          </div>
          <div className="flex items-center text-[11px] text-slate-600 font-sans">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-500 mr-1.5 animate-pulse shrink-0"></span>
            <span>Pending human sign-off</span>
          </div>
        </div>

        {/* Generated Assets */}
        <div className="p-4 space-y-1">
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">
            Generated Assets
          </span>
          <div className="text-2xl md:text-3xl font-bold font-mono text-indigo-600">
            {assetCount}
          </div>
          <p className="text-[11px] text-slate-500 font-sans">
            Multi-channel variants
          </p>
        </div>
      </div>

      {/* 3. Asymmetric 65% / 35% Split Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Pane (65% width: Recent Content Pipeline Assets) */}
        <div className="lg:col-span-8 bg-white rounded-[4px] border border-[#E2E4E9] shadow-xs">
          {/* Flat Section Header */}
          <div className="p-4 border-b border-[#E2E4E9] flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900 tracking-tight">
                Recent Content Pipeline Assets
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Live assets with versioning, channel specs, and compliance gates
              </p>
            </div>
            <Link
              href="/campaigns"
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center space-x-1"
            >
              <span>View all campaigns</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Horizontal Ledger Rows */}
          {recentAssets.length === 0 ? (
            <div className="p-10 text-center text-xs text-slate-500 space-y-2">
              <p>No content generated in this workspace yet.</p>
              <Link
                href="/campaigns"
                className="inline-block bg-indigo-600 text-white font-semibold px-3 py-1.5 rounded-[4px]"
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
                    className="p-3.5 flex items-start justify-between hover:bg-slate-50/70 transition gap-4"
                  >
                    <div className="space-y-1.5 min-w-0 flex-1">
                      {/* Rectangular Badges */}
                      <div className="flex items-center space-x-2">
                        <span className="text-[10px] font-mono font-bold bg-slate-900 text-white px-1.5 py-0.5 rounded-[3px]">
                          {asset.channel}
                        </span>
                        <span
                          className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-[3px] ${
                            asset.status === 'PUBLISHED'
                              ? 'bg-purple-50 text-purple-800 border border-purple-200'
                              : asset.status === 'SCHEDULED'
                              ? 'bg-blue-50 text-blue-800 border border-blue-200'
                              : asset.status === 'APPROVED'
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : asset.status === 'CHANGES_REQUESTED'
                              ? 'bg-rose-50 text-rose-800 border border-rose-200'
                              : 'bg-amber-50 text-amber-800 border border-amber-200'
                          }`}
                        >
                          {asset.status}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">
                          v{version?.versionNumber || 1}
                        </span>
                      </div>

                      {/* Title & Preview */}
                      <h3 className="text-xs font-bold text-slate-900 tracking-tight truncate">
                        {version?.headline || asset.campaign.name}
                      </h3>
                      <p className="text-xs text-slate-600 line-clamp-1 font-sans">
                        {version?.body || 'Content generated'}
                      </p>
                    </div>

                    {/* Flush Right Date & Review Action */}
                    <div className="text-right flex flex-col items-end space-y-1.5 shrink-0">
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

        {/* Right Pane (35% width: Active Compliance Jurisdiction & AI Gateway) */}
        <div className="lg:col-span-4 space-y-4">
          {/* Active Compliance Jurisdiction Dossier */}
          <div className="bg-white rounded-[4px] border border-[#E2E4E9] shadow-xs p-4 space-y-3.5">
            <div className="flex items-center justify-between pb-2 border-b border-[#E2E4E9]">
              <h2 className="text-xs font-bold font-mono uppercase tracking-wider text-slate-900 flex items-center space-x-1.5">
                <Scale className="w-3.5 h-3.5 text-indigo-600" />
                <span>Active Compliance Jurisdiction</span>
              </h2>
              <span className="text-[10px] font-mono text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                ACTIVE
              </span>
            </div>

            <div className="space-y-2.5 text-xs">
              {/* United Kingdom Dossier Block with 3px left emerald border */}
              <div className="p-3 bg-[#FAF9F6] rounded-[4px] border border-[#E2E4E9] border-l-[3px] border-l-emerald-600 space-y-1">
                <div className="flex items-center justify-between font-bold text-slate-900 text-xs">
                  <span>United Kingdom (UK)</span>
                  <span className="font-mono text-emerald-700 text-[10px] font-bold">ENFORCED</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-snug">
                  Mandatory proof under <span className="font-mono bg-white px-1 py-0.2 rounded border border-[#E2E4E9] text-slate-800">ASA/CAP Rule 3.7</span>, truthful pricing under <span className="font-mono bg-white px-1 py-0.2 rounded border border-[#E2E4E9] text-slate-800">Rule 3.1</span>, and strict direct marketing consent governed by <span className="font-mono bg-white px-1 py-0.2 rounded border border-[#E2E4E9] text-slate-800">ICO PECR</span>.
                </p>
              </div>

              {/* India Dossier Block with 3px left emerald border */}
              <div className="p-3 bg-[#FAF9F6] rounded-[4px] border border-[#E2E4E9] border-l-[3px] border-l-emerald-600 space-y-1">
                <div className="flex items-center justify-between font-bold text-slate-900 text-xs">
                  <span>India</span>
                  <span className="font-mono text-emerald-700 text-[10px] font-bold">ENFORCED</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-snug">
                  Prohibits misleading ranking claims under <span className="font-mono bg-white px-1 py-0.2 rounded border border-[#E2E4E9] text-slate-800">ASCI Chapter I</span> and enforces consumer privacy under <span className="font-mono bg-white px-1 py-0.2 rounded border border-[#E2E4E9] text-slate-800">DPDP Act 2023</span>.
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

          {/* Model-Agnostic Gateway Architecture Card */}
          <div className="bg-white rounded-[4px] border border-[#E2E4E9] shadow-xs p-4 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#E2E4E9]">
              <h2 className="text-xs font-bold font-mono uppercase tracking-wider text-slate-900 flex items-center space-x-1.5">
                <Settings className="w-3.5 h-3.5 text-indigo-600" />
                <span>AI Gateway &amp; Routing</span>
              </h2>
              <span className="text-[10px] font-mono text-indigo-700 font-bold bg-indigo-50 px-1.5 py-0.2 rounded border border-indigo-200">
                MULTI-PROVIDER
              </span>
            </div>

            <div className="text-xs space-y-2 text-slate-600">
              <p className="text-[11px] leading-snug">
                Zero vendor lock-in. Multi-model routing with automatic failover between Gemini 1.5 Pro and GPT-4o.
              </p>
              <div className="p-2.5 bg-[#FAF9F6] rounded-[4px] border border-[#E2E4E9] space-y-1 font-mono text-[11px]">
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
