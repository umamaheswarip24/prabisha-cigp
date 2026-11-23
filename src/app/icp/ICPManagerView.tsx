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
  Info,
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
    industry: 'Consumer Retail & E-Commerce',
    subindustry: 'Direct-to-Consumer Brands',
    geography: ['INDIA'],
    companySizeRange: '10-100 employees',
    revenueBand: '£1M - £20M',
    businessModel: 'B2B Enterprise / Services',
    buyerRole: 'Founder & CEO',
    painPoints:
      'High marketplace commissions\nLack of owned direct-to-consumer digital channels\nDelayed cash flow cycles',
    desiredOutcomes:
      'Direct customer acquisition with automated WhatsApp / CRM engagement\nImproved brand margin retention\nPredictable repeat purchase rates',
    buyingTriggers:
      'Seasonal margin squeeze during festival sales\nLaunching new regional product lines',
    exclusions: 'Pure offline retail without digital presence\nDropshippers without product ownership',
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

  const activeIcp = icps.find((i) => i.id === selectedIcpId) || icps[0];

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
      {/* 1. Flat Header with 1px Hairline & Demoted Spec Badge */}
      <div className="border-b border-[#E2E4E9] pb-4 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded-[3px] border border-[#E2E4E9]">
              PRD P0 ICP-01 to ICP-04
            </span>
            <span className="text-slate-400 text-xs">•</span>
            <span className="text-[11px] font-mono text-slate-500">Heuristic Persona Engine</span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight font-sans">
            Ideal Customer Profile (ICP) &amp; Persona Manager
          </h1>
          <p className="text-xs text-slate-600 leading-normal font-sans max-w-2xl">
            Define target buyer roles, documented pain points, buying triggers, exclusions, and calibrate heuristic fit scores.
          </p>
        </div>

        {/* Flush-Right Primary Action */}
        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center space-x-1.5 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-[4px] text-xs font-semibold transition shadow-xs shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>+ Define New ICP Segment</span>
        </button>
      </div>

      {/* Flat Editorial Tab Bar with 2px Solid Bottom Indicator */}
      <div className="border-b border-[#E2E4E9] flex space-x-6 overflow-x-auto text-xs">
        {icps.map((icp) => {
          const isActive = activeIcp?.id === icp.id;
          return (
            <button
              key={icp.id}
              onClick={() => {
                setSelectedIcpId(icp.id);
                setFitScoreResult(null);
              }}
              className={`flex items-center space-x-2 pb-2.5 transition text-xs whitespace-nowrap ${
                isActive
                  ? 'border-b-2 border-b-slate-900 text-slate-900 font-bold -mb-[1px]'
                  : 'text-slate-500 hover:text-slate-900 font-medium'
              }`}
            >
              <span>{icp.title}</span>
              <span
                className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-[2px] border ${
                  isActive
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-slate-100 text-slate-600 border-[#E2E4E9]'
                }`}
              >
                v{icp.version}
              </span>
            </button>
          );
        })}
      </div>

      {/* Asymmetric 65% / 35% Split Workspace */}
      {activeIcp && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* 2. Left Pane: Executive Persona Dossier (65% Width) */}
          <div className="lg:col-span-8 space-y-5">
            {/* Compact Dossier Sub-Header */}
            <div className="bg-white rounded-[4px] border border-[#E2E4E9] p-4 flex flex-wrap items-center justify-between gap-3 shadow-xs">
              <div className="space-y-0.5">
                <div className="flex items-center space-x-2">
                  <h2 className="text-sm font-bold text-slate-900 tracking-tight">
                    {activeIcp.title}
                  </h2>
                  <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-700 px-1.5 py-0.2 rounded-[2px] border border-[#E2E4E9]">
                    Version {activeIcp.version}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 font-sans">
                  Assigned to {activeIcp.campaigns?.length || 0} active campaign briefs
                </p>
              </div>

              <button
                onClick={() => handleCloneIcp(activeIcp.id)}
                disabled={isCloning}
                className="inline-flex items-center space-x-1.5 text-xs font-semibold px-3 py-1.5 rounded-[4px] border border-[#E2E4E9] bg-white hover:bg-slate-50 text-slate-700 transition shadow-2xs disabled:opacity-50"
              >
                <Copy className="w-3.5 h-3.5 text-slate-500" />
                <span>{isCloning ? 'Cloning...' : 'Clone Persona (ICP-01)'}</span>
              </button>
            </div>

            {/* 3x2 Touching Spec Matrix */}
            <div className="bg-white rounded-[4px] border border-[#E2E4E9] shadow-xs overflow-hidden">
              <div className="bg-[#FAF9F6] px-4 py-2 border-b border-[#E2E4E9] text-[10px] font-mono font-bold uppercase tracking-wider text-slate-600">
                Executive Firmographic Spec Matrix
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-[#E2E4E9] text-xs">
                {/* Cell 1: Primary Industry */}
                <div className="p-3.5 space-y-1">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold block">
                    Primary Industry
                  </span>
                  <p className="font-semibold text-slate-900 font-sans leading-tight">
                    {activeIcp.industry}
                  </p>
                  {activeIcp.subindustry && (
                    <p className="text-[11px] text-slate-500 font-sans leading-tight">
                      ({activeIcp.subindustry})
                    </p>
                  )}
                </div>

                {/* Cell 2: Target Buyer Role */}
                <div className="p-3.5 space-y-1">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold block">
                    Target Buyer Role
                  </span>
                  <p className="font-bold text-indigo-700 font-sans leading-tight text-sm">
                    {activeIcp.buyerRole}
                  </p>
                </div>

                {/* Cell 3: Company Size Scale */}
                <div className="p-3.5 space-y-1">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold block">
                    Company Size Scale
                  </span>
                  <p className="font-mono font-bold text-slate-900 text-sm">
                    {activeIcp.companySizeRange}
                  </p>
                </div>
              </div>

              <div className="border-t border-[#E2E4E9] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-[#E2E4E9] text-xs">
                {/* Cell 4: Target Geography */}
                <div className="p-3.5 space-y-1">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold block">
                    Target Geography
                  </span>
                  <p className="font-mono font-bold text-slate-900 text-sm">
                    {JSON.parse(activeIcp.geographyJson || '["INDIA"]').join(', ')}
                  </p>
                </div>

                {/* Cell 5: Revenue Band */}
                <div className="p-3.5 space-y-1">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold block">
                    Revenue Band
                  </span>
                  <p className="font-mono font-bold text-slate-900 text-sm">
                    {activeIcp.revenueBand || '£1M - £20M'}
                  </p>
                </div>

                {/* Cell 6: Business Model */}
                <div className="p-3.5 space-y-1">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold block">
                    Business Model
                  </span>
                  <p className="font-semibold text-slate-800 font-sans leading-tight">
                    {activeIcp.businessModel || 'B2B Enterprise / Services'}
                  </p>
                </div>
              </div>
            </div>

            {/* Sharpened Qualitative Drivers (Clean Flat Columns with 3px Accent Borders) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Validated Pain Points: 3px Solid Crimson Left Border */}
              <div className="bg-white rounded-[4px] border border-[#E2E4E9] border-l-[3px] border-l-rose-600 p-4 space-y-2.5 shadow-xs">
                <span className="font-mono font-bold text-rose-700 uppercase tracking-wider text-[10px] block">
                  Validated Pain Points (ICP-02)
                </span>
                <ul className="space-y-1.5 text-xs text-slate-800">
                  {JSON.parse(activeIcp.painPointsJson || '[]').map((p: string, i: number) => (
                    <li key={i} className="flex items-start space-x-2 leading-snug">
                      <span className="text-rose-500 font-bold shrink-0">•</span>
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Desired Business Outcomes: 3px Solid Emerald Left Border */}
              <div className="bg-white rounded-[4px] border border-[#E2E4E9] border-l-[3px] border-l-emerald-600 p-4 space-y-2.5 shadow-xs">
                <span className="font-mono font-bold text-emerald-700 uppercase tracking-wider text-[10px] block">
                  Desired Business Outcomes
                </span>
                <ul className="space-y-1.5 text-xs text-slate-800">
                  {JSON.parse(activeIcp.desiredOutcomesJson || '[]').map((o: string, i: number) => (
                    <li key={i} className="flex items-start space-x-2 leading-snug">
                      <span className="text-emerald-500 font-bold shrink-0">•</span>
                      <span>{o}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Buying Triggers: 3px Solid Indigo Left Border */}
              <div className="bg-white rounded-[4px] border border-[#E2E4E9] border-l-[3px] border-l-indigo-600 p-4 space-y-2.5 shadow-xs">
                <span className="font-mono font-bold text-indigo-700 uppercase tracking-wider text-[10px] block">
                  Buying Triggers
                </span>
                <ul className="space-y-1.5 text-xs text-slate-800">
                  {JSON.parse(activeIcp.buyingTriggersJson || '[]').map((t: string, i: number) => (
                    <li key={i} className="flex items-start space-x-2 leading-snug">
                      <span className="text-indigo-500 font-bold shrink-0">•</span>
                      <span>{t}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Negative Exclusions: 3px Solid Amber Left Border */}
              <div className="bg-white rounded-[4px] border border-[#E2E4E9] border-l-[3px] border-l-amber-600 p-4 space-y-2.5 shadow-xs">
                <span className="font-mono font-bold text-amber-700 uppercase tracking-wider text-[10px] block">
                  Negative Exclusions
                </span>
                <ul className="space-y-1.5 text-xs text-slate-800">
                  {JSON.parse(activeIcp.exclusionsJson || '[]').map((ex: string, i: number) => (
                    <li key={i} className="flex items-start space-x-2 leading-snug">
                      <span className="text-amber-500 font-bold shrink-0">•</span>
                      <span>{ex}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* 3. Right Pane: Sticky Fit Scoring Simulator (35% Width) */}
          <div className="lg:col-span-4 space-y-4 lg:sticky lg:top-4">
            <div className="bg-white rounded-[4px] border border-[#E2E4E9] shadow-xs p-5 space-y-4">
              <div className="flex items-center space-x-2 pb-3 border-b border-[#E2E4E9]">
                <Calculator className="w-4 h-4 text-indigo-600 shrink-0" />
                <div>
                  <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-slate-900">
                    Explainable Fit Scoring (ICP-04)
                  </h3>
                  <p className="text-[11px] text-slate-400">Heuristic calculator with exposed weights</p>
                </div>
              </div>

              {/* Flattened Form Inputs */}
              <div className="space-y-3 text-xs">
                <div>
                  <label className="text-[11px] font-semibold text-slate-700 block">
                    Prospect Company
                  </label>
                  <input
                    type="text"
                    value={testProspect.companyName}
                    onChange={(e) => setTestProspect({ ...testProspect, companyName: e.target.value })}
                    className="w-full mt-1 p-2 bg-[#FAF9F6] border border-[#E2E4E9] rounded-[4px] text-xs font-sans focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-700 block">
                      Employee Count
                    </label>
                    <input
                      type="number"
                      value={testProspect.companySize}
                      onChange={(e) =>
                        setTestProspect({
                          ...testProspect,
                          companySize: parseInt(e.target.value, 10) || 10,
                        })
                      }
                      className="w-full mt-1 p-2 bg-[#FAF9F6] border border-[#E2E4E9] rounded-[4px] text-xs font-mono focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-700 block">
                      Buyer Job Role
                    </label>
                    <input
                      type="text"
                      value={testProspect.buyerRole}
                      onChange={(e) => setTestProspect({ ...testProspect, buyerRole: e.target.value })}
                      className="w-full mt-1 p-2 bg-[#FAF9F6] border border-[#E2E4E9] rounded-[4px] text-xs font-sans focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>

              {/* Full-Width Sharp-Cornered Action Button */}
              <button
                onClick={handleRunFitScore}
                disabled={scoringLoading}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-[4px] text-xs font-semibold transition shadow-xs disabled:opacity-50 flex items-center justify-center space-x-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{scoringLoading ? 'Calculating Score...' : 'Calculate Prospect Fit Score'}</span>
              </button>

              {/* Clean Hairline-Bordered Readout Slot */}
              {fitScoreResult && (
                <div className="mt-4 pt-4 border-t border-[#E2E4E9] space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-mono text-slate-400 uppercase font-semibold">
                        Calculated Fit Score
                      </span>
                      <p className="text-3xl font-black font-mono text-indigo-700">
                        {fitScoreResult.totalScore}/100
                      </p>
                    </div>
                    <span
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-[3px] border ${
                        fitScoreResult.tier === 'TIER_1_EXCELLENT_FIT'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : fitScoreResult.tier === 'TIER_2_MODERATE_FIT'
                          ? 'bg-blue-50 text-blue-800 border-blue-200'
                          : 'bg-amber-50 text-amber-800 border-amber-200'
                      }`}
                    >
                      {fitScoreResult.tier.replace(/_/g, ' ')}
                    </span>
                  </div>

                  {/* Animated Progress Bar */}
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

                  {/* Exposed Weight Component Breakdown */}
                  <div className="space-y-1.5 pt-1">
                    {fitScoreResult.components.map((c, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 bg-[#FAF9F6] rounded-[4px] border border-[#E2E4E9] text-xs space-y-0.5"
                      >
                        <div className="flex justify-between font-semibold text-slate-800 text-[11px]">
                          <span>
                            {c.name} ({c.weight}%)
                          </span>
                          <span className="font-mono text-indigo-700 font-bold">{c.score} pts</span>
                        </div>
                        <p className="text-[10px] text-slate-500 leading-snug font-sans">{c.reason}</p>
                      </div>
                    ))}
                  </div>

                  {fitScoreResult.recommendations?.length > 0 && (
                    <div className="p-2.5 bg-indigo-50/70 rounded-[4px] border border-indigo-200 text-[11px] text-indigo-950 space-y-0.5">
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
          <div className="bg-white rounded-[4px] max-w-xl w-full p-6 space-y-4 shadow-lg max-h-[90vh] overflow-y-auto border border-[#E2E4E9]">
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
                  placeholder="e.g. Indian Retail & D2C Brand Founder"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full mt-1 p-2 bg-[#FAF9F6] border border-[#E2E4E9] rounded-[4px] text-xs font-sans"
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
                    className="w-full mt-1 p-2 bg-[#FAF9F6] border border-[#E2E4E9] rounded-[4px] text-xs font-sans"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700">Sub-Industry</label>
                  <input
                    type="text"
                    value={formData.subindustry}
                    onChange={(e) => setFormData({ ...formData, subindustry: e.target.value })}
                    className="w-full mt-1 p-2 bg-[#FAF9F6] border border-[#E2E4E9] rounded-[4px] text-xs font-sans"
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
                    className="w-full mt-1 p-2 bg-[#FAF9F6] border border-[#E2E4E9] rounded-[4px] text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700">Revenue Band</label>
                  <input
                    type="text"
                    value={formData.revenueBand}
                    onChange={(e) => setFormData({ ...formData, revenueBand: e.target.value })}
                    className="w-full mt-1 p-2 bg-[#FAF9F6] border border-[#E2E4E9] rounded-[4px] text-xs font-mono"
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
                  className="w-full mt-1 p-2 bg-[#FAF9F6] border border-[#E2E4E9] rounded-[4px] text-xs font-sans"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700">Validated Pain Points (one per line)</label>
                <textarea
                  rows={3}
                  value={formData.painPoints}
                  onChange={(e) => setFormData({ ...formData, painPoints: e.target.value })}
                  className="w-full mt-1 p-2 bg-[#FAF9F6] border border-[#E2E4E9] rounded-[4px] text-xs font-mono"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-[#E2E4E9]">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-3 py-1.5 rounded-[4px] border border-[#E2E4E9] text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-[4px] bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-xs"
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
