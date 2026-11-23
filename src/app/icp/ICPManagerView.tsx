'use client';

import React, { useState } from 'react';
import {
  Target,
  Copy,
  Plus,
  Sparkles,
  Calculator,
  CheckCircle2,
  AlertCircle,
  Briefcase,
  TrendingUp,
  Shield,
  Layers,
  ChevronRight,
  Gauge,
  X,
} from 'lucide-react';
import { ICPFitScoreResult } from '@/types';

interface ICPManagerViewProps {
  initialIcps: any[];
  products: any[];
}

export function ICPManagerView({ initialIcps, products }: ICPManagerViewProps) {
  const [icps, setIcps] = useState(initialIcps);
  const [selectedIcpId, setSelectedIcpId] = useState<string>(initialIcps[0]?.id || '');
  const [isCloning, setIsCloning] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [scoringLoading, setScoringLoading] = useState(false);
  const [fitScoreResult, setFitScoreResult] = useState<ICPFitScoreResult | null>(null);

  // New ICP Form State
  const [formData, setFormData] = useState({
    title: '',
    industry: 'Professional & Business Services',
    subindustry: 'Legal & Accounting',
    geography: ['UK'],
    companySizeRange: '20-100 employees',
    revenueBand: '£2M - £15M',
    businessModel: 'B2B Professional Services',
    buyerRole: 'Managing Director / Chief Executive',
    painPoints:
      'Slow manual data entry between CRM and billing\nFear of AI hallucinations leaking confidential client data\nHigh administrative wage cost',
    desiredOutcomes:
      'Shorten client turnaround by 50%\nDeploy audited compliant AI workflows\nImprove operational profit margins',
    buyingTriggers:
      'Losing RFP bids to automated competitors\nDepartmental bottleneck in client onboarding',
    exclusions: 'B2C retailers\nFirms without cloud infrastructure',
    recommendedProducts: products.map((p) => p.id).slice(0, 1),
  });

  // Fit score test prospect
  const [testProspect, setTestProspect] = useState({
    companyName: 'Apex Legal Partners LLP',
    industry: 'Professional & Business Services',
    companySize: 45,
    buyerRole: 'Managing Partner',
    statedPains: ['Slow manual data entry between CRM and billing', 'Client onboarding delay'],
  });

  const activeIcp = icps.find((i) => i.id === selectedIcpId);

  const handleCloneIcp = async (icpId: string) => {
    setIsCloning(true);
    try {
      const res = await fetch(`/api/v1/icps/${icpId}/clone`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (data.success) {
        setIcps([data.icp, ...icps]);
        setSelectedIcpId(data.icp.id);
      } else {
        alert(`Cloning failed: ${data.error}`);
      }
    } catch (e) {
      console.error(e);
      alert('Error cloning ICP');
    } finally {
      setIsCloning(false);
    }
  };

  const handleCreateIcp = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        title: formData.title,
        industry: formData.industry,
        subindustry: formData.subindustry,
        geography: formData.geography,
        companySizeRange: formData.companySizeRange,
        revenueBand: formData.revenueBand,
        businessModel: formData.businessModel,
        buyerRole: formData.buyerRole,
        painPoints: formData.painPoints.split('\n').filter(Boolean),
        desiredOutcomes: formData.desiredOutcomes.split('\n').filter(Boolean),
        buyingTriggers: formData.buyingTriggers.split('\n').filter(Boolean),
        exclusions: formData.exclusions.split('\n').filter(Boolean),
        recommendedProducts: formData.recommendedProducts,
      };

      const res = await fetch('/api/v1/icps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        setIcps([data.icp, ...icps]);
        setSelectedIcpId(data.icp.id);
        setShowCreateModal(false);
      } else {
        alert(`Failed to save ICP: ${data.error}`);
      }
    } catch (e) {
      console.error(e);
      alert('Creation error');
    }
  };

  const handleRunFitScore = async () => {
    if (!activeIcp) return;
    setScoringLoading(true);
    try {
      const res = await fetch('/api/v1/icps/score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          icpId: activeIcp.id,
          prospect: testProspect,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setFitScoreResult(data.fitScore);
      } else {
        alert(`Scoring failed: ${data.error}`);
      }
    } catch (e) {
      console.error(e);
      alert('Scoring error');
    } finally {
      setScoringLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Decluttered Page Header on Canvas */}
      <div className="border-b border-[#E2E4E9] pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Ideal Customer Profile (ICP) &amp; Persona Manager
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Define target buyer roles, documented pain points, buying triggers, and calibrate fit scores.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center space-x-1.5 bg-indigo-600 hover:bg-indigo-700 text-white px-3.5 py-1.5 rounded text-xs font-semibold transition shadow-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Define New ICP Segment</span>
        </button>
      </div>

      {/* ICP Selector Tabs */}
      <div className="flex space-x-1.5 border-b border-[#E2E4E9] pb-2 overflow-x-auto">
        {icps.map((icp) => (
          <button
            key={icp.id}
            onClick={() => {
              setSelectedIcpId(icp.id);
              setFitScoreResult(null);
            }}
            className={`px-3 py-1.5 rounded text-xs transition flex items-center space-x-2 ${
              selectedIcpId === icp.id
                ? 'bg-slate-900 text-white font-semibold shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-[#E2E4E9]'
            }`}
          >
            <span>{icp.title}</span>
            <span className="text-[10px] font-mono bg-slate-800 text-slate-300 px-1 py-0.2 rounded">
              v{icp.version}
            </span>
          </button>
        ))}
      </div>

      {activeIcp && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column (8 cols): Executive Spec Sheet & Qualitative Drivers */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white rounded-md border border-[#E2E4E9] shadow-xs p-5 space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#E2E4E9]">
                <div>
                  <div className="flex items-center space-x-2">
                    <h2 className="text-sm font-bold text-slate-900">{activeIcp.title}</h2>
                    <span className="text-[11px] font-mono text-slate-500">Version {activeIcp.version}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Assigned to {activeIcp.campaigns?.length || 0} active campaign briefs
                  </p>
                </div>

                <button
                  onClick={() => handleCloneIcp(activeIcp.id)}
                  disabled={isCloning}
                  className="inline-flex items-center space-x-1.5 text-xs font-semibold px-2.5 py-1 rounded border border-[#E2E4E9] hover:bg-slate-50 text-slate-700 transition disabled:opacity-50"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{isCloning ? 'Cloning...' : 'Clone Persona'}</span>
                </button>
              </div>

              {/* Executive Spec Sheet (Compact 2-Column Key-Value Table) */}
              <div className="border border-[#E2E4E9] rounded overflow-hidden">
                <div className="bg-slate-50/80 px-3 py-1.5 border-b border-[#E2E4E9] text-[10px] font-mono uppercase tracking-wider font-bold text-slate-600">
                  Executive Target Spec Sheet
                </div>
                <table className="w-full text-xs">
                  <tbody className="divide-y divide-[#E2E4E9]">
                    <tr className="hover:bg-slate-50/50">
                      <td className="w-1/3 py-2 px-3 text-slate-500 font-medium bg-[#FAF9F6] border-r border-[#E2E4E9]">
                        Primary Industry
                      </td>
                      <td className="py-2 px-3 font-semibold text-slate-900 font-sans">
                        {activeIcp.industry} {activeIcp.subindustry && `(${activeIcp.subindustry})`}
                      </td>
                    </tr>
                    <tr className="hover:bg-slate-50/50">
                      <td className="w-1/3 py-2 px-3 text-slate-500 font-medium bg-[#FAF9F6] border-r border-[#E2E4E9]">
                        Target Buyer Role
                      </td>
                      <td className="py-2 px-3 font-bold text-indigo-700 font-sans">
                        {activeIcp.buyerRole}
                      </td>
                    </tr>
                    <tr className="hover:bg-slate-50/50">
                      <td className="w-1/3 py-2 px-3 text-slate-500 font-medium bg-[#FAF9F6] border-r border-[#E2E4E9]">
                        Company Size Scale
                      </td>
                      <td className="py-2 px-3 font-mono font-medium text-slate-800">
                        {activeIcp.companySizeRange}
                      </td>
                    </tr>
                    <tr className="hover:bg-slate-50/50">
                      <td className="w-1/3 py-2 px-3 text-slate-500 font-medium bg-[#FAF9F6] border-r border-[#E2E4E9]">
                        Target Geography
                      </td>
                      <td className="py-2 px-3 font-mono text-slate-800">
                        {JSON.parse(activeIcp.geographyJson || '["UK"]').join(', ')}
                      </td>
                    </tr>
                    <tr className="hover:bg-slate-50/50">
                      <td className="w-1/3 py-2 px-3 text-slate-500 font-medium bg-[#FAF9F6] border-r border-[#E2E4E9]">
                        Revenue Band
                      </td>
                      <td className="py-2 px-3 font-mono text-slate-800">
                        {activeIcp.revenueBand || '£1M - £20M'}
                      </td>
                    </tr>
                    <tr className="hover:bg-slate-50/50">
                      <td className="w-1/3 py-2 px-3 text-slate-500 font-medium bg-[#FAF9F6] border-r border-[#E2E4E9]">
                        Business Model
                      </td>
                      <td className="py-2 px-3 text-slate-800">
                        {activeIcp.businessModel || 'B2B Services'}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Qualitative Drivers: Pains & Outcomes */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-rose-50/40 p-4 rounded border border-rose-100 text-xs space-y-2">
                  <span className="font-mono font-bold text-rose-800 uppercase tracking-wide text-[10px]">
                    Validated Pain Points
                  </span>
                  <ul className="space-y-1.5 list-disc list-inside text-slate-800">
                    {JSON.parse(activeIcp.painPointsJson || '[]').map((p: string, i: number) => (
                      <li key={i} className="leading-snug">{p}</li>
                    ))}
                  </ul>
                </div>

                <div className="bg-emerald-50/40 p-4 rounded border border-emerald-100 text-xs space-y-2">
                  <span className="font-mono font-bold text-emerald-800 uppercase tracking-wide text-[10px]">
                    Desired Business Outcomes
                  </span>
                  <ul className="space-y-1.5 list-disc list-inside text-slate-800">
                    {JSON.parse(activeIcp.desiredOutcomesJson || '[]').map((o: string, i: number) => (
                      <li key={i} className="leading-snug">{o}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Buying Triggers & Negative Exclusions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-indigo-50/40 p-4 rounded border border-indigo-100 text-xs space-y-2">
                  <span className="font-mono font-bold text-indigo-800 uppercase tracking-wide text-[10px]">
                    Buying Triggers
                  </span>
                  <ul className="space-y-1.5 list-disc list-inside text-slate-800">
                    {JSON.parse(activeIcp.buyingTriggersJson || '[]').map((t: string, i: number) => (
                      <li key={i} className="leading-snug">{t}</li>
                    ))}
                  </ul>
                </div>

                <div className="bg-amber-50/40 p-4 rounded border border-amber-100 text-xs space-y-2">
                  <span className="font-mono font-bold text-amber-800 uppercase tracking-wide text-[10px]">
                    Negative Exclusions
                  </span>
                  <ul className="space-y-1.5 list-disc list-inside text-slate-800">
                    {JSON.parse(activeIcp.exclusionsJson || '[]').map((ex: string, i: number) => (
                      <li key={i} className="leading-snug">{ex}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Sticky Live Simulator Drawer (4 cols) */}
          <div className="lg:col-span-4 space-y-4 lg:sticky lg:top-4">
            <div className="bg-white p-5 rounded-md border border-[#E2E4E9] shadow-xs space-y-4">
              <div className="flex items-center space-x-2 pb-2.5 border-b border-[#E2E4E9]">
                <Calculator className="w-4 h-4 text-indigo-600" />
                <div>
                  <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-slate-900">
                    Live Fit Simulator
                  </h3>
                  <p className="text-[11px] text-slate-400">Heuristic lead scoring engine</p>
                </div>
              </div>

              <div className="space-y-2.5 text-xs">
                <div>
                  <label className="text-[11px] text-slate-500 font-medium">Prospect Company</label>
                  <input
                    type="text"
                    value={testProspect.companyName}
                    onChange={(e) => setTestProspect({ ...testProspect, companyName: e.target.value })}
                    className="w-full mt-1 p-2 bg-[#FAF9F6] border border-[#E2E4E9] rounded text-xs"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] text-slate-500 font-medium">Employee Count</label>
                    <input
                      type="number"
                      value={testProspect.companySize}
                      onChange={(e) =>
                        setTestProspect({
                          ...testProspect,
                          companySize: parseInt(e.target.value, 10) || 10,
                        })
                      }
                      className="w-full mt-1 p-2 bg-[#FAF9F6] border border-[#E2E4E9] rounded text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-500 font-medium">Buyer Job Role</label>
                    <input
                      type="text"
                      value={testProspect.buyerRole}
                      onChange={(e) => setTestProspect({ ...testProspect, buyerRole: e.target.value })}
                      className="w-full mt-1 p-2 bg-[#FAF9F6] border border-[#E2E4E9] rounded text-xs"
                    />
                  </div>
                </div>
              </div>

              <button
                onClick={handleRunFitScore}
                disabled={scoringLoading}
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-xs font-semibold transition shadow-xs disabled:opacity-50 flex items-center justify-center space-x-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{scoringLoading ? 'Calculating Score...' : 'Run Fit Score'}</span>
              </button>

              {/* Visual Score Gauge */}
              {fitScoreResult && (
                <div className="mt-4 pt-4 border-t border-[#E2E4E9] space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-mono text-slate-400 uppercase font-semibold">
                        Fit Score Gauge
                      </span>
                      <p className="text-2xl font-black font-mono text-indigo-700">
                        {fitScoreResult.totalScore}/100
                      </p>
                    </div>
                    <span
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                        fitScoreResult.tier === 'TIER_1_EXCELLENT_FIT'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : fitScoreResult.tier === 'TIER_2_MODERATE_FIT'
                          ? 'bg-blue-100 text-blue-800 border border-blue-300'
                          : 'bg-amber-100 text-amber-800 border border-amber-300'
                      }`}
                    >
                      {fitScoreResult.tier.replace(/_/g, ' ')}
                    </span>
                  </div>

                  {/* Visual Progress Bar */}
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${
                        fitScoreResult.totalScore >= 80
                          ? 'bg-emerald-500'
                          : fitScoreResult.totalScore >= 60
                          ? 'bg-indigo-600'
                          : 'bg-amber-500'
                      }`}
                      style={{ width: `${fitScoreResult.totalScore}%` }}
                    />
                  </div>

                  {/* Component Breakdown */}
                  <div className="space-y-1.5 pt-1">
                    {fitScoreResult.components.map((c, idx) => (
                      <div
                        key={idx}
                        className="p-2 bg-[#FAF9F6] rounded border border-[#E2E4E9] text-xs space-y-0.5"
                      >
                        <div className="flex justify-between font-semibold text-slate-800 text-[11px]">
                          <span>
                            {c.name} ({c.weight}%)
                          </span>
                          <span className="font-mono text-indigo-600">{c.score} pts</span>
                        </div>
                        <p className="text-[10px] text-slate-500 leading-snug">{c.reason}</p>
                      </div>
                    ))}
                  </div>

                  {fitScoreResult.recommendations.length > 0 && (
                    <div className="p-2.5 bg-indigo-50/60 rounded border border-indigo-100 text-[11px] text-indigo-950 space-y-0.5">
                      <span className="font-bold text-[10px] uppercase font-mono text-indigo-800">
                        Recommended Next Step:
                      </span>
                      <p className="leading-snug">{fitScoreResult.recommendations[0]}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal: Define New ICP Segment */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-md max-w-xl w-full p-6 space-y-4 shadow-lg max-h-[90vh] overflow-y-auto border border-[#E2E4E9]">
            <div className="flex items-center justify-between pb-3 border-b border-[#E2E4E9]">
              <h2 className="text-base font-bold text-slate-900">Define New ICP Segment</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateIcp} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700">Segment Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. UK Legal & Professional Services MDs"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full mt-1 p-2 bg-[#FAF9F6] border border-[#E2E4E9] rounded text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700">Industry *</label>
                  <input
                    type="text"
                    required
                    value={formData.industry}
                    onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                    className="w-full mt-1 p-2 bg-[#FAF9F6] border border-[#E2E4E9] rounded text-xs"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700">Sub-Industry</label>
                  <input
                    type="text"
                    value={formData.subindustry}
                    onChange={(e) => setFormData({ ...formData, subindustry: e.target.value })}
                    className="w-full mt-1 p-2 bg-[#FAF9F6] border border-[#E2E4E9] rounded text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700">Company Size Range</label>
                  <input
                    type="text"
                    value={formData.companySizeRange}
                    onChange={(e) => setFormData({ ...formData, companySizeRange: e.target.value })}
                    className="w-full mt-1 p-2 bg-[#FAF9F6] border border-[#E2E4E9] rounded text-xs"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700">Revenue Band</label>
                  <input
                    type="text"
                    value={formData.revenueBand}
                    onChange={(e) => setFormData({ ...formData, revenueBand: e.target.value })}
                    className="w-full mt-1 p-2 bg-[#FAF9F6] border border-[#E2E4E9] rounded text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700">Buyer Job Role *</label>
                <input
                  type="text"
                  required
                  value={formData.buyerRole}
                  onChange={(e) => setFormData({ ...formData, buyerRole: e.target.value })}
                  className="w-full mt-1 p-2 bg-[#FAF9F6] border border-[#E2E4E9] rounded text-xs"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700">Validated Pain Points (one per line)</label>
                <textarea
                  rows={3}
                  value={formData.painPoints}
                  onChange={(e) => setFormData({ ...formData, painPoints: e.target.value })}
                  className="w-full mt-1 p-2 bg-[#FAF9F6] border border-[#E2E4E9] rounded text-xs font-mono"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-[#E2E4E9]">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-3 py-1.5 rounded border border-[#E2E4E9] text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-xs"
                >
                  Save Segment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
