'use client';

import React, { useState, useMemo } from 'react';
import {
  Calendar as CalendarIcon,
  Clock,
  Download,
  Link as LinkIcon,
  Copy,
  Check,
  X,
  SlidersHorizontal,
} from 'lucide-react';

interface CalendarViewProps {
  initialAssets: any[];
  campaigns: any[];
}

export function CalendarView({ initialAssets, campaigns }: CalendarViewProps) {
  const [assets, setAssets] = useState(initialAssets);
  const [channelFilter, setChannelFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedDayOffset, setSelectedDayOffset] = useState<number | null>(null);

  // Modal States
  const [selectedAsset, setSelectedAsset] = useState<any | null>(null);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [scheduleDate, setScheduleDate] = useState('');
  const [copyPackage, setCopyPackage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // UTM Builder State
  const [utmUrl, setUtmUrl] = useState('https://prabisha.com/services/ai-automation');
  const [utmSource, setUtmSource] = useState('linkedin');
  const [utmMedium, setUtmMedium] = useState('organic_post');
  const [utmCampaign, setUtmCampaign] = useState('uk_sme_ai_automation');
  const [utmResult, setUtmResult] = useState<any | null>(null);

  // Helper for safe ISO date comparison
  const matchesDate = (dateVal: any, datePrefix: string) => {
    if (!dateVal) return false;
    try {
      const isoStr = typeof dateVal === 'string' ? dateVal : new Date(dateVal).toISOString();
      return isoStr.startsWith(datePrefix);
    } catch {
      return false;
    }
  };

  // Generate 7-day rolling timeline strip starting from today
  const timelineDays = useMemo(() => {
    const today = new Date();
    return Array.from({ length: 7 }).map((_, idx) => {
      const d = new Date(today);
      d.setDate(today.getDate() + idx);
      const dateStr = d.toISOString().split('T')[0];
      const count = assets.filter((a) => matchesDate(a.scheduledDate, dateStr)).length;
      return {
        idx,
        date: d,
        dateStr,
        dayName: d.toLocaleDateString('en-GB', { weekday: 'short' }),
        dayNum: d.getDate(),
        month: d.toLocaleDateString('en-GB', { month: 'short' }),
        isToday: idx === 0,
        count,
      };
    });
  }, [assets]);

  // Filter assets
  const filteredAssets = useMemo(() => {
    return assets.filter((asset) => {
      if (channelFilter !== 'ALL' && asset.channel !== channelFilter) return false;
      if (statusFilter !== 'ALL' && asset.status !== statusFilter) return false;
      if (selectedDayOffset !== null) {
        const targetDay = timelineDays[selectedDayOffset];
        if (!matchesDate(asset.scheduledDate, targetDay.dateStr)) {
          return false;
        }
      }
      return true;
    });
  }, [assets, channelFilter, statusFilter, selectedDayOffset, timelineDays]);

  const handleScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAsset || !scheduleDate) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/v1/assets/${selectedAsset.id}/schedule`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scheduledDate: new Date(scheduleDate).toISOString(),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setAssets(
          assets.map((a) =>
            a.id === selectedAsset.id
              ? { ...a, status: 'SCHEDULED', scheduledDate: scheduleDate }
              : a
          )
        );
        setShowScheduleModal(false);
        setSelectedAsset(null);
      } else {
        alert(`Scheduling failed: ${data.error}`);
      }
    } catch (e) {
      console.error(e);
      alert('Error scheduling asset');
    } finally {
      setActionLoading(false);
    }
  };

  const handlePublishSubmit = async (asset: any) => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/v1/assets/${asset.id}/publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (data.success) {
        setAssets(
          assets.map((a) =>
            a.id === asset.id
              ? { ...a, status: 'PUBLISHED', publishedAt: new Date().toISOString() }
              : a
          )
        );
        setCopyPackage(data.exportPackage);
        setShowPublishModal(true);
      } else {
        alert(`Publication failed: ${data.error}`);
      }
    } catch (e) {
      console.error(e);
      alert('Error publishing asset');
    } finally {
      setActionLoading(false);
    }
  };

  const handleGenerateUtm = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/v1/distribution/utm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          destinationUrl: utmUrl,
          source: utmSource,
          medium: utmMedium,
          campaign: utmCampaign,
        }),
      });
      const data = await res.json();
      setUtmResult(data.result);
    } catch (e) {
      console.error(e);
      alert('Failed to generate UTM');
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* 1. Flat Calendar Header on Canvas */}
      <div className="border-b border-[#E2E4E9] pb-4 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded-[3px] border border-[#E2E4E9]">
              PRD PUB-01 to PUB-06
            </span>
            <span className="text-slate-400 text-xs">•</span>
            <span className="text-[11px] font-mono text-slate-500">
              Distribution &amp; Attribution Suite
            </span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight font-sans">
            Editorial Calendar, Distribution &amp; UTM Suite
          </h1>
          <p className="text-xs text-slate-600 leading-normal font-sans max-w-2xl">
            Schedule approved content, generate copy-ready packages with verified UTM tracking, and export RFC-4180 performance reports.
          </p>
        </div>

        {/* Flush-Right Solid Dark Action */}
        <a
          href="/api/v1/reports/export"
          download
          className="inline-flex items-center space-x-1.5 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-[4px] text-xs font-semibold transition shadow-xs shrink-0"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Performance CSV (PUB-06)</span>
        </a>
      </div>

      {/* Slim 44px Inline Filter Strip & Week Timeline */}
      <div className="space-y-3">
        {/* Inline Filter Toolbar (44px) */}
        <div className="bg-white border border-[#E2E4E9] rounded-[4px] px-3.5 py-2 flex flex-wrap items-center justify-between gap-3 text-xs shadow-2xs">
          <div className="flex items-center space-x-3 flex-wrap gap-y-1">
            <div className="flex items-center space-x-1.5 text-slate-500 font-medium">
              <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-600" />
              <span className="font-mono uppercase text-[10px] tracking-wider text-slate-400 font-bold">
                Filter Schedule:
              </span>
            </div>

            <select
              value={channelFilter}
              onChange={(e) => setChannelFilter(e.target.value)}
              className="bg-[#FAF9F6] border border-[#E2E4E9] rounded-[3px] px-2.5 py-1 text-xs text-slate-800 focus:outline-none focus:border-indigo-500 font-sans"
            >
              <option value="ALL">All Channels</option>
              <option value="LINKEDIN">LinkedIn</option>
              <option value="BLOG">Blog</option>
              <option value="EMAIL">Email</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-[#FAF9F6] border border-[#E2E4E9] rounded-[3px] px-2.5 py-1 text-xs text-slate-800 focus:outline-none focus:border-indigo-500 font-sans"
            >
              <option value="ALL">All Statuses</option>
              <option value="APPROVED">Approved (Ready to Schedule)</option>
              <option value="SCHEDULED">Scheduled</option>
              <option value="PUBLISHED">Published</option>
              <option value="NEEDS_REVIEW">Needs Review</option>
            </select>
          </div>

          {selectedDayOffset !== null && (
            <button
              onClick={() => setSelectedDayOffset(null)}
              className="text-[11px] text-indigo-600 hover:text-indigo-800 font-semibold"
            >
              Clear Date Filter
            </button>
          )}
        </div>

        {/* Compact Horizontal Week Timeline Strip */}
        <div className="bg-white rounded-[4px] border border-[#E2E4E9] shadow-xs p-2.5">
          <div className="grid grid-cols-7 gap-2 text-center text-xs">
            {timelineDays.map((d) => {
              const isSelected = selectedDayOffset === d.idx;
              return (
                <button
                  key={d.idx}
                  onClick={() => setSelectedDayOffset(isSelected ? null : d.idx)}
                  className={`p-2 rounded-[3px] border transition flex flex-col items-center space-y-1 ${
                    isSelected
                      ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                      : d.isToday
                      ? 'bg-indigo-50/70 border-indigo-200 text-slate-900'
                      : 'bg-[#FAF9F6] border-[#E2E4E9] hover:bg-slate-100/60 text-slate-700'
                  }`}
                >
                  <span
                    className={`text-[10px] font-mono uppercase ${
                      isSelected ? 'text-indigo-300' : 'text-slate-400'
                    }`}
                  >
                    {d.dayName}
                  </span>
                  <span className="text-sm font-bold font-mono">{d.dayNum}</span>
                  <div className="flex items-center">
                    {d.count > 0 ? (
                      <span
                        className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded-full ${
                          isSelected
                            ? 'bg-indigo-500 text-white'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {d.count} post{d.count > 1 ? 's' : ''}
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-300">•</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Asymmetric Grid: Schedule Ledger (65%) & Sticky UTM Builder (35%) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* 2. Left Pane: Editorial Schedule Ledger (65% Width) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-white rounded-[4px] border border-[#E2E4E9] shadow-xs overflow-hidden">
            {/* Ledger Section Header */}
            <div className="p-3.5 border-b border-[#E2E4E9] flex items-center justify-between bg-white">
              <div>
                <h2 className="text-xs font-bold font-mono uppercase tracking-wider text-slate-900">
                  Scheduled Editorial Content Ledger ({filteredAssets.length})
                </h2>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  State-machine governed publication queue with embedded attribution
                </p>
              </div>
              <span className="text-[10px] font-mono text-slate-400">PUB-01 to PUB-02</span>
            </div>

            {/* Structured Schedule Rows */}
            {filteredAssets.length === 0 ? (
              <div className="p-12 text-center text-xs text-slate-500 space-y-2">
                <CalendarIcon className="w-8 h-8 text-slate-400 mx-auto" />
                <p>No content assets match the active schedule filter.</p>
              </div>
            ) : (
              <div className="divide-y divide-[#E2E4E9]">
                {filteredAssets.map((asset) => {
                  const version = asset.versions?.[0];
                  const isApproved = asset.status === 'APPROVED';
                  const isScheduled = asset.status === 'SCHEDULED';
                  const isPublished = asset.status === 'PUBLISHED';
                  const isChanges = asset.status === 'CHANGES_REQUESTED';

                  // Structural left accent border
                  const borderAccent = isPublished
                    ? 'border-l-[3px] border-l-purple-600'
                    : isScheduled
                    ? 'border-l-[3px] border-l-blue-600'
                    : isApproved
                    ? 'border-l-[3px] border-l-emerald-600'
                    : isChanges
                    ? 'border-l-[3px] border-l-rose-600'
                    : 'border-l-[3px] border-l-amber-500';

                  return (
                    <div
                      key={asset.id}
                      className={`p-4 ${borderAccent} hover:bg-slate-50/60 transition space-y-2.5 bg-white`}
                    >
                      {/* Top Metadata Line: Campaign context (Left) & Date (Right) */}
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center space-x-2">
                          <span className="bg-slate-900 text-white text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-[2px]">
                            {asset.channel}
                          </span>
                          <span
                            className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-[2px] border ${
                              isPublished
                                ? 'bg-purple-50 text-purple-800 border-purple-200'
                                : isScheduled
                                ? 'bg-blue-50 text-blue-800 border-blue-200'
                                : isApproved
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                : 'bg-amber-50 text-amber-800 border-amber-200'
                            }`}
                          >
                            {asset.status}
                          </span>
                          <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500 font-bold truncate max-w-xs">
                            {asset.campaign?.name} ({asset.campaign?.market})
                          </span>
                        </div>

                        {/* Aligned Monospace Date */}
                        <div className="text-[11px] font-mono text-slate-500 flex items-center space-x-1.5 shrink-0">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>
                            {asset.scheduledDate
                              ? `Scheduled: ${new Date(asset.scheduledDate).toLocaleDateString('en-GB')}`
                              : asset.publishedAt
                              ? `Published: ${new Date(asset.publishedAt).toLocaleDateString('en-GB')}`
                              : 'Unscheduled'}
                          </span>
                        </div>
                      </div>

                      {/* Content Headline & Body Excerpt */}
                      <div>
                        <h3 className="text-xs font-bold text-slate-900 tracking-tight font-sans">
                          {version?.headline || asset.campaign?.name}
                        </h3>
                        <p className="text-xs text-slate-600 line-clamp-2 mt-1 leading-relaxed font-sans">
                          {version?.body}
                        </p>
                      </div>

                      {/* Bottom Recessed CTA Line & Flush-Right Actions */}
                      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#E2E4E9]">
                        <div className="bg-[#FAF9F6] border border-[#E2E4E9] px-2.5 py-1 rounded-[3px] font-mono text-[11px] text-indigo-700 truncate max-w-md">
                          <span>Target CTA: {asset.targetCtaUrl}</span>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center space-x-2 shrink-0">
                          {isApproved && (
                            <button
                              onClick={() => {
                                setSelectedAsset(asset);
                                setShowScheduleModal(true);
                              }}
                              className="px-3.5 py-1.5 rounded-[4px] bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition shadow-2xs"
                            >
                              Schedule Post
                            </button>
                          )}

                          {isScheduled && (
                            <button
                              onClick={() => handlePublishSubmit(asset)}
                              disabled={actionLoading}
                              className="px-3.5 py-1.5 rounded-[4px] bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition shadow-2xs disabled:opacity-50"
                            >
                              Publish &amp; Copy Package
                            </button>
                          )}

                          {isPublished && (
                            <span className="text-[10px] font-mono font-bold text-purple-700 bg-purple-50 border border-purple-200 px-2.5 py-1 rounded-[2px]">
                              Distributed ✓
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* 3. Right Pane: Sticky UTM Builder (35% Width) */}
        <div className="lg:col-span-4 space-y-4 lg:sticky lg:top-4">
          <div className="bg-white p-5 rounded-[4px] border border-[#E2E4E9] shadow-xs space-y-4">
            <div className="flex items-center space-x-2 pb-3 border-b border-[#E2E4E9]">
              <LinkIcon className="w-4 h-4 text-indigo-600 shrink-0" />
              <div>
                <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-slate-900">
                  Standardized UTM Builder (PUB-03)
                </h3>
                <p className="text-[11px] text-slate-400">
                  Destination validation &amp; lowercase slug tokenization
                </p>
              </div>
            </div>

            {/* Sharpened Parameter Inputs */}
            <form onSubmit={handleGenerateUtm} className="space-y-3 text-xs">
              <div>
                <label className="text-[11px] font-semibold text-slate-700 block">
                  Destination URL *
                </label>
                <input
                  type="text"
                  required
                  value={utmUrl}
                  onChange={(e) => setUtmUrl(e.target.value)}
                  className="w-full mt-1 p-2 bg-[#FAF9F6] border border-[#E2E4E9] rounded-[4px] text-xs font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-semibold text-slate-700 block">
                    Source (utm_source) *
                  </label>
                  <input
                    type="text"
                    required
                    value={utmSource}
                    onChange={(e) => setUtmSource(e.target.value)}
                    className="w-full mt-1 p-2 bg-[#FAF9F6] border border-[#E2E4E9] rounded-[4px] text-xs font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-700 block">
                    Medium (utm_medium)
                  </label>
                  <input
                    type="text"
                    value={utmMedium}
                    onChange={(e) => setUtmMedium(e.target.value)}
                    className="w-full mt-1 p-2 bg-[#FAF9F6] border border-[#E2E4E9] rounded-[4px] text-xs font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-700 block">
                  Campaign (utm_campaign) *
                </label>
                <input
                  type="text"
                  required
                  value={utmCampaign}
                  onChange={(e) => setUtmCampaign(e.target.value)}
                  className="w-full mt-1 p-2 bg-[#FAF9F6] border border-[#E2E4E9] rounded-[4px] text-xs font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Full-Width Action Button */}
              <button
                type="submit"
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-[4px] text-xs transition shadow-xs"
              >
                Validate &amp; Build Tracking Link
              </button>
            </form>

            {/* Live Token Preview Slot */}
            {utmResult && (
              <div className="mt-3 p-3 bg-[#FAF9F6] rounded-[4px] border border-[#E2E4E9] text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[10px] font-mono uppercase text-slate-700">
                    Assembled Tracking URL:
                  </span>
                  <button
                    onClick={() => handleCopy(utmResult.finalUrl)}
                    className="text-indigo-600 hover:text-indigo-800 font-semibold flex items-center space-x-1"
                  >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>

                <p className="p-2 bg-white rounded-[3px] border border-[#E2E4E9] break-all font-mono text-[10px] text-slate-900 select-all leading-relaxed">
                  {utmResult.finalUrl}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Schedule Modal */}
      {showScheduleModal && selectedAsset && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[4px] max-w-md w-full p-6 space-y-4 shadow-lg border border-[#E2E4E9]">
            <h2 className="text-base font-bold text-slate-900">Schedule Publication Date</h2>
            <form onSubmit={handleScheduleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block">Target Date &amp; Time</label>
                <input
                  type="datetime-local"
                  required
                  value={scheduleDate}
                  onChange={(e) => setScheduleDate(e.target.value)}
                  className="w-full mt-1 p-2 bg-[#FAF9F6] border border-[#E2E4E9] rounded-[4px] text-xs font-mono"
                />
              </div>
              <div className="flex justify-end space-x-2 pt-2 border-t border-[#E2E4E9]">
                <button
                  type="button"
                  onClick={() => setShowScheduleModal(false)}
                  className="px-3 py-1.5 rounded-[4px] border border-[#E2E4E9] text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-1.5 rounded-[4px] bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-xs"
                >
                  Confirm Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Published Package Modal */}
      {showPublishModal && copyPackage && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[4px] max-w-xl w-full p-6 space-y-4 shadow-lg border border-[#E2E4E9]">
            <div className="flex items-center justify-between pb-2 border-b border-[#E2E4E9]">
              <h2 className="text-base font-bold text-slate-900 font-sans">Publication Package Ready (PUB-02)</h2>
              <button
                onClick={() => setShowPublishModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <textarea
              readOnly
              rows={10}
              value={copyPackage}
              className="w-full p-3 bg-[#FAF9F6] border border-[#E2E4E9] rounded-[4px] font-mono text-[11px] text-slate-800 leading-relaxed"
            />
            <div className="flex justify-between items-center pt-2">
              <button
                onClick={() => handleCopy(copyPackage)}
                className="px-4 py-2 rounded-[4px] bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center space-x-1.5 shadow-xs"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copied ? 'Copied' : 'Copy Package'}</span>
              </button>
              <button
                onClick={() => setShowPublishModal(false)}
                className="px-3.5 py-1.5 rounded-[4px] border border-[#E2E4E9] text-slate-600 text-xs hover:bg-slate-50"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
