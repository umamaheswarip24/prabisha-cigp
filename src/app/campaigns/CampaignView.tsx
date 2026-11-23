'use client';

import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Send,
  ShieldCheck,
  Layers,
  ArrowRight,
  ExternalLink,
  MessageSquare,
  RefreshCw,
  Plus,
  Copy,
  Bookmark,
  Filter,
  X,
  SlidersHorizontal,
  FileText,
  Linkedin,
  Mail,
  BookOpen,
} from 'lucide-react';

interface CampaignViewProps {
  initialCampaigns: any[];
  icps?: any[];
  products?: any[];
}

export function CampaignView({
  initialCampaigns,
  icps = [],
  products = [],
}: CampaignViewProps) {
  const [campaigns, setCampaigns] = useState(initialCampaigns);
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>(
    initialCampaigns[0]?.id || ''
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [reviewLoading, setReviewLoading] = useState<string | null>(null);
  const [reviewSuccess, setReviewSuccess] = useState<string | null>(null);
  const [showBriefModal, setShowBriefModal] = useState(false);
  const [isCloning, setIsCloning] = useState(false);

  // Single-row inline filter toolbar states
  const [marketFilter, setMarketFilter] = useState<string>('ALL');
  const [funnelFilter, setFunnelFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Tabbed Right Workspace State (LinkedIn | Blog | Email | ALL)
  const [channelTab, setChannelTab] = useState<string>('ALL');

  // New Campaign Form State
  const [briefForm, setBriefForm] = useState({
    name: '',
    objective: '',
    icpId: icps[0]?.id || '',
    market: 'UK',
    locale: 'en-GB',
    channels: ['LINKEDIN', 'BLOG'],
    funnelStage: 'MID_CONSIDERATION',
    offerProductId: products[0]?.id || '',
    tone: 'consultative, authoritative, evidence-backed',
    targetCta: 'Book an AI Consultation Assessment',
    assetVolume: 3,
    saveAsTemplate: false,
  });

  // Filtered campaigns
  const filteredCampaigns = useMemo(() => {
    return campaigns.filter((c) => {
      if (marketFilter !== 'ALL' && c.market !== marketFilter) return false;
      if (funnelFilter !== 'ALL' && c.funnelStage !== funnelFilter) return false;
      if (statusFilter !== 'ALL' && c.status !== statusFilter) return false;
      return true;
    });
  }, [campaigns, marketFilter, funnelFilter, statusFilter]);

  const activeCampaign = useMemo(() => {
    return (
      filteredCampaigns.find((c) => c.id === selectedCampaignId) ||
      filteredCampaigns[0] ||
      null
    );
  }, [filteredCampaigns, selectedCampaignId]);

  // Tabbed assets
  const tabbedAssets = useMemo(() => {
    if (!activeCampaign?.assets) return [];
    if (channelTab === 'ALL') return activeCampaign.assets;
    return activeCampaign.assets.filter((a: any) => a.channel === channelTab);
  }, [activeCampaign, channelTab]);

  const handleGeneratePack = async () => {
    if (!activeCampaign) return;
    setIsGenerating(true);
    try {
      const res = await fetch(`/api/v1/campaigns/${activeCampaign.id}/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (data.success) {
        const newAssets = data.pack?.assets || data.campaign?.assets || [];
        setCampaigns(
          campaigns.map((c) =>
            c.id === activeCampaign.id ? { ...c, assets: newAssets } : c
          )
        );
      } else {
        alert(`Generation failed: ${data.error}`);
      }
    } catch (e) {
      console.error(e);
      alert('Error during content synthesis');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleReviewDecision = async (
    assetId: string,
    decision: 'APPROVED' | 'CHANGES_REQUESTED'
  ) => {
    setReviewLoading(assetId);
    setReviewSuccess(null);
    try {
      const res = await fetch(`/api/v1/assets/${assetId}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          decision,
          reason:
            decision === 'APPROVED'
              ? 'Meets ASA/CAP & ASCI advertising guidelines and grounded in evidence.'
              : 'Requires headline refinement and additional claim citations.',
          reviewerRole: 'COMPLIANCE_REVIEWER',
        }),
      });

      const data = await res.json();
      if (data.success) {
        setReviewSuccess(
          `Review submitted: Asset status updated to ${decision.replace('_', ' ')}`
        );
        setCampaigns(
          campaigns.map((c) => ({
            ...c,
            assets: c.assets?.map((a: any) =>
              a.id === assetId ? { ...a, status: decision } : a
            ),
          }))
        );
      } else {
        alert(`Review action rejected: ${data.error}`);
      }
    } catch (e) {
      console.error(e);
      alert('Review submission failed');
    } finally {
      setReviewLoading(null);
    }
  };

  const handleCloneCampaign = async (campaignId: string) => {
    setIsCloning(true);
    try {
      const res = await fetch(`/api/v1/campaigns/${campaignId}/clone`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (data.success) {
        setCampaigns([data.campaign, ...campaigns]);
        setSelectedCampaignId(data.campaign.id);
      } else {
        alert(`Cloning failed: ${data.error}`);
      }
    } catch (e) {
      console.error(e);
      alert('Clone failed');
    } finally {
      setIsCloning(false);
    }
  };

  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const endpoint = briefForm.saveAsTemplate
        ? '/api/v1/campaigns/templates'
        : '/api/v1/campaigns';

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(briefForm),
      });

      const data = await res.json();
      if (data.success) {
        const newCamp = data.campaign || data.template;
        setCampaigns([newCamp, ...campaigns]);
        setSelectedCampaignId(newCamp.id);
        setShowBriefModal(false);
      } else {
        alert(`Failed to save brief: ${data.error}`);
      }
    } catch (e) {
      console.error(e);
      alert('Save failed');
    }
  };

  return (
    <div className="space-y-6">
      {/* Decluttered Page Header on Canvas with 1px Hairline Divider */}
      <div className="border-b border-[#E2E4E9] pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Campaign Briefs &amp; Content Studio
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Create weekly briefs, generate evidence-anchored assets, and enforce separation-of-duties review.
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={() => setShowBriefModal(true)}
            className="inline-flex items-center space-x-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-[#E2E4E9] px-3 py-1.5 rounded text-xs font-semibold transition shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Brief</span>
          </button>

          <button
            onClick={handleGeneratePack}
            disabled={isGenerating || !activeCampaign}
            className="inline-flex items-center space-x-1.5 bg-indigo-600 hover:bg-indigo-700 text-white px-3.5 py-1.5 rounded text-xs font-semibold transition shadow-xs disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Synthesizing Assets...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>Generate Weekly Content Pack</span>
              </>
            )}
          </button>
        </div>
      </div>

      {reviewSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded text-xs font-semibold text-emerald-800 flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{reviewSuccess}</span>
        </div>
      )}

      {/* Single-Row Inline Filter Toolbar */}
      <div className="bg-white border border-[#E2E4E9] rounded-md px-3 py-2 flex flex-wrap items-center justify-between gap-3 text-xs shadow-2xs">
        <div className="flex items-center space-x-3 flex-wrap gap-y-1">
          <div className="flex items-center space-x-1.5 text-slate-500 font-medium">
            <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-600" />
            <span className="font-mono uppercase text-[10px] tracking-wider text-slate-400">Filters:</span>
          </div>

          <select
            value={marketFilter}
            onChange={(e) => setMarketFilter(e.target.value)}
            className="bg-[#FAF9F6] border border-[#E2E4E9] rounded px-2 py-1 text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
          >
            <option value="ALL">Market: All</option>
            <option value="UK">Market: UK</option>
            <option value="INDIA">Market: India</option>
          </select>

          <select
            value={funnelFilter}
            onChange={(e) => setFunnelFilter(e.target.value)}
            className="bg-[#FAF9F6] border border-[#E2E4E9] rounded px-2 py-1 text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
          >
            <option value="ALL">Funnel: All</option>
            <option value="TOP_AWARENESS">Top (Awareness)</option>
            <option value="MID_CONSIDERATION">Mid (Consideration)</option>
            <option value="BOTTOM_DECISION">Bottom (Decision)</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#FAF9F6] border border-[#E2E4E9] rounded px-2 py-1 text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
          >
            <option value="ALL">Status: All</option>
            <option value="DRAFT">Draft</option>
            <option value="ACTIVE">Active</option>
            <option value="COMPLETED">Completed</option>
          </select>
        </div>

        {/* Quick Preset Buttons */}
        <div className="flex items-center space-x-1.5">
          <button
            onClick={() => {
              setMarketFilter('UK');
              setFunnelFilter('MID_CONSIDERATION');
            }}
            className="text-[11px] px-2 py-0.5 rounded bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-600 font-medium transition"
          >
            UK Mid-Funnel
          </button>
          <button
            onClick={() => {
              setMarketFilter('INDIA');
              setFunnelFilter('TOP_AWARENESS');
            }}
            className="text-[11px] px-2 py-0.5 rounded bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-600 font-medium transition"
          >
            India Awareness
          </button>
          <button
            onClick={() => {
              setMarketFilter('ALL');
              setFunnelFilter('ALL');
              setStatusFilter('ALL');
            }}
            className="text-[11px] px-1.5 py-0.5 text-slate-400 hover:text-rose-600 transition"
            title="Reset Filters"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Campaign Selector Tabs */}
      <div className="flex space-x-1.5 border-b border-[#E2E4E9] pb-2 overflow-x-auto">
        {filteredCampaigns.length === 0 ? (
          <p className="text-xs text-slate-400 py-1">No campaigns match active filters.</p>
        ) : (
          filteredCampaigns.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCampaignId(c.id)}
              className={`px-3 py-1.5 rounded text-xs transition flex items-center space-x-2 ${
                activeCampaign?.id === c.id
                  ? 'bg-slate-900 text-white font-semibold shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-[#E2E4E9]'
              }`}
            >
              <span>{c.name}</span>
              <span className="text-[10px] font-mono bg-slate-800 text-slate-300 px-1 py-0.2 rounded">
                {c.market}
              </span>
            </button>
          ))
        )}
      </div>

      {/* True Split-Pane Studio Layout */}
      {activeCampaign && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Reference Panel: Locked Campaign Brief Spec (4 cols) */}
          <div className="lg:col-span-4 space-y-4 lg:sticky lg:top-4">
            <div className="bg-white rounded-md border border-[#E2E4E9] shadow-xs p-4 space-y-4">
              <div className="flex items-center justify-between pb-2.5 border-b border-[#E2E4E9]">
                <div>
                  <h2 className="text-xs font-bold font-mono uppercase tracking-wider text-slate-900">
                    Campaign Brief Spec
                  </h2>
                  <span className="text-[10px] text-slate-400 font-mono">ID: {activeCampaign.id}</span>
                </div>
                <button
                  onClick={() => handleCloneCampaign(activeCampaign.id)}
                  disabled={isCloning}
                  className="inline-flex items-center space-x-1 text-[11px] font-semibold text-slate-600 hover:text-indigo-600 border border-[#E2E4E9] px-2 py-1 rounded bg-slate-50 hover:bg-slate-100 transition"
                >
                  <Copy className="w-3 h-3" />
                  <span>{isCloning ? '...' : 'Clone'}</span>
                </button>
              </div>

              {/* Spec Sheet Key-Value Pairs */}
              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-[10px] font-mono uppercase text-slate-400">Objective</span>
                  <p className="font-semibold text-slate-900 mt-0.5">{activeCampaign.objective}</p>
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase text-slate-400">Target ICP Persona</span>
                  <p className="font-semibold text-slate-900 mt-0.5">
                    {activeCampaign.icp?.title || 'UK SME MD'}
                  </p>
                  <p className="text-[11px] text-slate-500 font-sans">
                    {activeCampaign.icp?.buyerRole} • {activeCampaign.icp?.companySizeRange}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div>
                    <span className="text-[10px] font-mono uppercase text-slate-400">Stage</span>
                    <p className="font-mono text-indigo-700 text-[11px] font-semibold mt-0.5">
                      {activeCampaign.funnelStage}
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] font-mono uppercase text-slate-400">Tone</span>
                    <p className="text-[11px] text-slate-700 mt-0.5 truncate">{activeCampaign.tone}</p>
                  </div>
                </div>
                <div className="pt-1">
                  <span className="text-[10px] font-mono uppercase text-slate-400">Call to Action (CTA)</span>
                  <p className="font-semibold text-indigo-600 mt-0.5">{activeCampaign.targetCta}</p>
                </div>
              </div>
            </div>

            {/* Grounding Pains & Triggers Reference Box */}
            <div className="bg-slate-900 text-slate-200 p-4 rounded-md shadow-xs space-y-2.5">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-indigo-400">
                Grounding Pains &amp; Triggers
              </span>
              <ul className="space-y-1.5 text-xs">
                {activeCampaign.icp?.painPointsJson &&
                  JSON.parse(activeCampaign.icp.painPointsJson).map((pain: string, i: number) => (
                    <li key={i} className="flex items-start space-x-1.5 text-slate-300">
                      <span className="text-indigo-400 font-bold">•</span>
                      <span>{pain}</span>
                    </li>
                  ))}
              </ul>
            </div>
          </div>

          {/* Right Workspace: Tabbed Channel Variants (8 cols) */}
          <div className="lg:col-span-8 space-y-4">
            {/* Tabbed Header (LinkedIn | Blog | Email | ALL) */}
            <div className="bg-white border border-[#E2E4E9] rounded-md p-1.5 flex items-center justify-between text-xs shadow-2xs">
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => setChannelTab('ALL')}
                  className={`px-3 py-1.5 rounded text-xs font-semibold transition ${
                    channelTab === 'ALL'
                      ? 'bg-slate-900 text-white shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  All Channels ({activeCampaign.assets?.length || 0})
                </button>
                <button
                  onClick={() => setChannelTab('LINKEDIN')}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded text-xs font-semibold transition ${
                    channelTab === 'LINKEDIN'
                      ? 'bg-indigo-600 text-white shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Linkedin className="w-3.5 h-3.5" />
                  <span>LinkedIn</span>
                </button>
                <button
                  onClick={() => setChannelTab('BLOG')}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded text-xs font-semibold transition ${
                    channelTab === 'BLOG'
                      ? 'bg-indigo-600 text-white shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Blog</span>
                </button>
                <button
                  onClick={() => setChannelTab('EMAIL')}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded text-xs font-semibold transition ${
                    channelTab === 'EMAIL'
                      ? 'bg-indigo-600 text-white shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Email</span>
                </button>
              </div>

              <span className="text-[11px] font-mono text-slate-400 hidden sm:block pr-2">
                Separation of Duties Enforced
              </span>
            </div>

            {/* Variants Workspace List / Empty State */}
            {tabbedAssets.length === 0 ? (
              <div className="bg-white p-12 text-center rounded-md border border-dashed border-[#E2E4E9] shadow-xs space-y-3">
                <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    No {channelTab === 'ALL' ? '' : channelTab} Assets in this Workspace
                  </h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                    Click "Generate Weekly Content Pack" above to synthesize grounded LinkedIn, Blog, and Email copy against registered brand claims.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {tabbedAssets.map((asset: any) => {
                  const version = asset.versions?.[0];
                  const metadata = version?.metadataJson ? JSON.parse(version.metadataJson) : {};
                  const complianceReport = metadata.complianceReport;

                  return (
                    <div
                      key={asset.id}
                      className="bg-white rounded-md border border-[#E2E4E9] shadow-xs p-5 space-y-4"
                    >
                      {/* Asset Header */}
                      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#E2E4E9]">
                        <div className="flex items-center space-x-2">
                          <span className="px-2 py-0.5 bg-slate-900 text-white rounded text-[11px] font-mono font-bold">
                            {asset.channel}
                          </span>
                          <span className="text-xs text-slate-500 font-sans">{asset.format}</span>
                          <span className="text-[11px] font-mono text-slate-400">
                            v{version?.versionNumber || 1}
                          </span>
                        </div>

                        <span
                          className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                            asset.status === 'APPROVED'
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : asset.status === 'CHANGES_REQUESTED'
                              ? 'bg-rose-50 text-rose-800 border border-rose-200'
                              : 'bg-amber-50 text-amber-800 border border-amber-200'
                          }`}
                        >
                          STATUS: {asset.status}
                        </span>
                      </div>

                      {/* Content Preview with Sharp Borders */}
                      <div className="space-y-2">
                        {version?.headline && (
                          <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                            {version.headline}
                          </h3>
                        )}
                        <p className="text-xs text-slate-800 whitespace-pre-line leading-relaxed bg-[#FAF9F6] p-3.5 rounded border border-[#E2E4E9] font-sans">
                          {version?.body}
                        </p>
                        {version?.callToAction && (
                          <p className="text-xs font-semibold text-indigo-700">
                            CTA: {version.callToAction} ({asset.targetCtaUrl})
                          </p>
                        )}
                      </div>

                      {/* Compliance Pre-Check Report */}
                      {complianceReport && (
                        <div
                          className={`p-3 rounded text-xs space-y-1 ${
                            complianceReport.passed
                              ? 'bg-emerald-50/60 border border-emerald-200 text-emerald-950'
                              : 'bg-amber-50/60 border border-amber-200 text-amber-950'
                          }`}
                        >
                          <div className="flex items-center space-x-1.5 font-bold">
                            {complianceReport.passed ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                            )}
                            <span>
                              {complianceReport.passed
                                ? 'Compliance Pre-Check Passed (UK ASA / India ASCI)'
                                : 'Compliance Flags Detected'}
                            </span>
                          </div>
                          {complianceReport.violations?.length > 0 && (
                            <ul className="list-disc list-inside space-y-0.5 text-[11px] text-slate-700 pt-1">
                              {complianceReport.violations.map((v: any, idx: number) => (
                                <li key={idx}>
                                  <span className="font-semibold">{v.ruleName}:</span> {v.explanation}
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      )}

                      {/* Actions: Model Provenance & Separation of Duties Buttons */}
                      <div className="flex flex-wrap items-center justify-between pt-3 border-t border-[#E2E4E9] gap-3">
                        <div className="text-[11px] text-slate-500 font-mono">
                          <span>model: </span>
                          <span className="text-slate-800 font-semibold">
                            {version?.modelMetadataJson
                              ? JSON.parse(version.modelMetadataJson).model
                              : 'gemini-1.5-pro'}
                          </span>
                        </div>

                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleReviewDecision(asset.id, 'CHANGES_REQUESTED')}
                            disabled={reviewLoading === asset.id || asset.status === 'APPROVED'}
                            className="text-xs px-3 py-1.5 rounded font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 transition"
                          >
                            Request Edits
                          </button>
                          <button
                            onClick={() => handleReviewDecision(asset.id, 'APPROVED')}
                            disabled={reviewLoading === asset.id || asset.status === 'APPROVED'}
                            className="text-xs px-3.5 py-1.5 rounded font-semibold text-white bg-emerald-600 hover:bg-emerald-700 shadow-xs disabled:opacity-50 transition"
                          >
                            {asset.status === 'APPROVED' ? 'Approved ✓' : 'Approve Asset'}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal: New Campaign Brief Builder */}
      {showBriefModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-md border border-[#E2E4E9] shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#E2E4E9]">
              <h2 className="text-base font-bold text-slate-900">Create Campaign Brief</h2>
              <button
                onClick={() => setShowBriefModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateCampaign} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700">Campaign Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. UK SME AI Automation — Weekly Lead Gen"
                  value={briefForm.name}
                  onChange={(e) => setBriefForm({ ...briefForm, name: e.target.value })}
                  className="w-full mt-1 p-2 bg-[#FAF9F6] border border-[#E2E4E9] rounded text-xs"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700">Campaign Objective</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Drive 10 qualified consultation calls from managing directors"
                  value={briefForm.objective}
                  onChange={(e) => setBriefForm({ ...briefForm, objective: e.target.value })}
                  className="w-full mt-1 p-2 bg-[#FAF9F6] border border-[#E2E4E9] rounded text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-slate-700">Target ICP Segment</label>
                  <select
                    value={briefForm.icpId}
                    onChange={(e) => setBriefForm({ ...briefForm, icpId: e.target.value })}
                    className="w-full mt-1 p-2 bg-[#FAF9F6] border border-[#E2E4E9] rounded text-xs"
                  >
                    {icps.map((icp) => (
                      <option key={icp.id} value={icp.id}>
                        {icp.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700">Market Jurisdiction</label>
                  <select
                    value={briefForm.market}
                    onChange={(e) =>
                      setBriefForm({
                        ...briefForm,
                        market: e.target.value,
                        locale: e.target.value === 'UK' ? 'en-GB' : 'en-IN',
                      })
                    }
                    className="w-full mt-1 p-2 bg-[#FAF9F6] border border-[#E2E4E9] rounded text-xs"
                  >
                    <option value="UK">United Kingdom (en-GB)</option>
                    <option value="INDIA">India (en-IN)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-slate-700">Promoted Service / Offer</label>
                  <select
                    value={briefForm.offerProductId}
                    onChange={(e) => setBriefForm({ ...briefForm, offerProductId: e.target.value })}
                    className="w-full mt-1 p-2 bg-[#FAF9F6] border border-[#E2E4E9] rounded text-xs"
                  >
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700">Funnel Stage</label>
                  <select
                    value={briefForm.funnelStage}
                    onChange={(e) => setBriefForm({ ...briefForm, funnelStage: e.target.value })}
                    className="w-full mt-1 p-2 bg-[#FAF9F6] border border-[#E2E4E9] rounded text-xs"
                  >
                    <option value="TOP_AWARENESS">Top (Awareness)</option>
                    <option value="MID_CONSIDERATION">Mid (Consideration)</option>
                    <option value="BOTTOM_DECISION">Bottom (Decision)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700">Target Call to Action (CTA)</label>
                <input
                  type="text"
                  required
                  value={briefForm.targetCta}
                  onChange={(e) => setBriefForm({ ...briefForm, targetCta: e.target.value })}
                  className="w-full mt-1 p-2 bg-[#FAF9F6] border border-[#E2E4E9] rounded text-xs"
                />
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <input
                  type="checkbox"
                  id="saveAsTemplate"
                  checked={briefForm.saveAsTemplate}
                  onChange={(e) =>
                    setBriefForm({ ...briefForm, saveAsTemplate: e.target.checked })
                  }
                  className="rounded border-[#E2E4E9] text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="saveAsTemplate" className="text-slate-700 font-medium">
                  Save as Reusable Campaign Template
                </label>
              </div>

              <div className="flex justify-end space-x-2.5 pt-4 border-t border-[#E2E4E9]">
                <button
                  type="button"
                  onClick={() => setShowBriefModal(false)}
                  className="px-3 py-1.5 rounded border border-[#E2E4E9] text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-xs"
                >
                  Create Brief
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
