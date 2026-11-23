'use client';

import React, { useState, useMemo } from 'react';
import {
  Calendar as CalendarIcon,
  Clock,
  Send,
  Download,
  Link as LinkIcon,
  CheckCircle2,
  AlertTriangle,
  Copy,
  ExternalLink,
  Sparkles,
  Filter,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
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
  const [utmUrl, setUtmUrl] = useState('https://prabisha.co.uk/services/automation-assessment');
  const [utmSource, setUtmSource] = useState('linkedin');
  const [utmMedium, setUtmMedium] = useState('organic_post');
  const [utmCampaign, setUtmCampaign] = useState('uk_sme_ai_automation');
  const [utmResult, setUtmResult] = useState<any | null>(null);

  // Generate 7-day rolling timeline strip starting from today
  const timelineDays = useMemo(() => {
    const today = new Date();
    return Array.from({ length: 7 }).map((_, idx) => {
      const d = new Date(today);
      d.setDate(today.getDate() + idx);
      const dateStr = d.toISOString().split('T')[0];
      const count = assets.filter((a) => a.scheduledDate && a.scheduledDate.startsWith(dateStr)).length;
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
        if (!asset.scheduledDate || !asset.scheduledDate.startsWith(targetDay.dateStr)) {
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
      {/* Decluttered Page Header on Canvas */}
      <div className="border-b border-[#E2E4E9] pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Editorial Calendar, Distribution &amp; UTM Suite
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Schedule approved content, generate copy-ready packages with tracking, and export performance reports.
          </p>
        </div>

        <a
          href="/api/v1/reports/export"
          download
          className="inline-flex items-center space-x-1.5 bg-slate-900 hover:bg-slate-800 text-white px-3.5 py-1.5 rounded text-xs font-semibold transition shadow-xs"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Performance CSV</span>
        </a>
      </div>

      {/* Compact Weekly Timeline Strip */}
      <div className="bg-white rounded-md border border-[#E2E4E9] shadow-xs p-3 space-y-2">
        <div className="flex items-center justify-between text-xs pb-1.5 border-b border-[#E2E4E9]">
          <span className="font-mono text-[10px] uppercase tracking-wider text-slate-400 font-bold">
            Weekly Publication Timeline
          </span>
          {selectedDayOffset !== null && (
            <button
              onClick={() => setSelectedDayOffset(null)}
              className="text-[11px] text-indigo-600 hover:text-indigo-800 font-semibold"
            >
              Clear Day Filter
            </button>
          )}
        </div>

        <div className="grid grid-cols-7 gap-2 text-center text-xs">
          {timelineDays.map((d) => {
            const isSelected = selectedDayOffset === d.idx;
            return (
              <button
                key={d.idx}
                onClick={() => setSelectedDayOffset(isSelected ? null : d.idx)}
                className={`p-2.5 rounded border transition flex flex-col items-center space-y-1 ${
                  isSelected
                    ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                    : d.isToday
                    ? 'bg-indigo-50/70 border-indigo-200 text-slate-900'
                    : 'bg-[#FAF9F6] border-[#E2E4E9] hover:bg-slate-100/60 text-slate-700'
                }`}
              >
                <span className={`text-[10px] font-mono uppercase ${isSelected ? 'text-indigo-300' : 'text-slate-400'}`}>
                  {d.dayName}
                </span>
                <span className="text-base font-bold font-mono">
                  {d.dayNum}
                </span>
                <div className="flex items-center space-x-1">
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

      {/* Main Grid: Scheduled Assets List (8 cols) & Pinned UTM Builder (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (8 cols): Calendar Filter & Asset Schedule */}
        <div className="lg:col-span-8 space-y-4">
          {/* Filter Bar */}
          <div className="bg-white p-3 rounded-md border border-[#E2E4E9] shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center space-x-2">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <span className="font-semibold text-slate-700">Filter Items:</span>
            </div>

            <div className="flex items-center space-x-2">
              <select
                value={channelFilter}
                onChange={(e) => setChannelFilter(e.target.value)}
                className="p-1.5 bg-[#FAF9F6] border border-[#E2E4E9] rounded text-xs"
              >
                <option value="ALL">All Channels</option>
                <option value="LINKEDIN">LinkedIn</option>
                <option value="BLOG">Blog</option>
                <option value="EMAIL">Email</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="p-1.5 bg-[#FAF9F6] border border-[#E2E4E9] rounded text-xs"
              >
                <option value="ALL">All Statuses</option>
                <option value="APPROVED">Approved (Ready)</option>
                <option value="SCHEDULED">Scheduled</option>
                <option value="PUBLISHED">Published</option>
                <option value="NEEDS_REVIEW">Needs Review</option>
              </select>
            </div>
          </div>

          {/* Scheduled Asset List */}
          <div className="space-y-3">
            {filteredAssets.length === 0 ? (
              <div className="bg-white p-12 text-center rounded-md border border-dashed border-[#E2E4E9] shadow-xs">
                <CalendarIcon className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-xs text-slate-500">No assets match the active calendar filter.</p>
              </div>
            ) : (
              filteredAssets.map((asset) => {
                const version = asset.versions?.[0];
                const isApproved = asset.status === 'APPROVED';
                const isScheduled = asset.status === 'SCHEDULED';
                const isPublished = asset.status === 'PUBLISHED';

                return (
                  <div
                    key={asset.id}
                    className="bg-white rounded-md border border-[#E2E4E9] shadow-xs p-4 space-y-3"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center space-x-2">
                        <span className="px-2 py-0.5 bg-slate-900 text-white rounded text-[10px] font-mono font-bold">
                          {asset.channel}
                        </span>
                        <span
                          className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                            isPublished
                              ? 'bg-purple-100 text-purple-800 border border-purple-200'
                              : isScheduled
                              ? 'bg-blue-100 text-blue-800 border border-blue-200'
                              : isApproved
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              : 'bg-amber-100 text-amber-800 border border-amber-200'
                          }`}
                        >
                          {asset.status}
                        </span>
                        <span className="text-xs text-slate-500">
                          {asset.campaign?.name} ({asset.campaign?.market})
                        </span>
                      </div>

                      {/* Date details */}
                      <div className="text-[11px] text-slate-500 font-mono flex items-center space-x-1.5">
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

                    <h3 className="text-xs font-bold text-slate-900 tracking-tight">
                      {version?.headline || asset.campaign?.name}
                    </h3>
                    <p className="text-xs text-slate-600 line-clamp-2 bg-[#FAF9F6] p-2.5 rounded border border-[#E2E4E9]">
                      {version?.body}
                    </p>

                    <div className="flex flex-wrap items-center justify-between pt-2 border-t border-[#E2E4E9] gap-2 text-xs">
                      <div className="text-[11px] text-indigo-700 font-mono">
                        <span>CTA: {asset.targetCtaUrl}</span>
                      </div>

                      <div className="flex items-center space-x-2">
                        {isApproved && (
                          <button
                            onClick={() => {
                              setSelectedAsset(asset);
                              setShowScheduleModal(true);
                            }}
                            className="px-3 py-1 rounded bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-2xs"
                          >
                            Schedule Post
                          </button>
                        )}
                        {isScheduled && (
                          <button
                            onClick={() => handlePublishSubmit(asset)}
                            disabled={actionLoading}
                            className="px-3 py-1 rounded bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs shadow-2xs"
                          >
                            Mark Published
                          </button>
                        )}
                        {isPublished && (
                          <span className="text-[11px] font-mono text-purple-700 font-bold bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                            Distributed ✓
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column (4 cols): Pinned Standardized UTM Builder */}
        <div className="lg:col-span-4 space-y-4 lg:sticky lg:top-4">
          <div className="bg-white p-5 rounded-md border border-[#E2E4E9] shadow-xs space-y-4">
            <div className="flex items-center space-x-2 pb-2.5 border-b border-[#E2E4E9]">
              <LinkIcon className="w-4 h-4 text-indigo-600" />
              <div>
                <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-slate-900">
                  Standardized UTM Builder
                </h3>
                <p className="text-[11px] text-slate-400">Validated tracking links</p>
              </div>
            </div>

            <form onSubmit={handleGenerateUtm} className="space-y-3 text-xs">
              <div>
                <label className="text-[11px] font-semibold text-slate-700">Destination URL *</label>
                <input
                  type="text"
                  required
                  value={utmUrl}
                  onChange={(e) => setUtmUrl(e.target.value)}
                  className="w-full mt-1 p-2 bg-[#FAF9F6] border border-[#E2E4E9] rounded text-xs font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-semibold text-slate-700">utm_source *</label>
                  <input
                    type="text"
                    required
                    value={utmSource}
                    onChange={(e) => setUtmSource(e.target.value)}
                    className="w-full mt-1 p-2 bg-[#FAF9F6] border border-[#E2E4E9] rounded text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-700">utm_medium</label>
                  <input
                    type="text"
                    value={utmMedium}
                    onChange={(e) => setUtmMedium(e.target.value)}
                    className="w-full mt-1 p-2 bg-[#FAF9F6] border border-[#E2E4E9] rounded text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-700">utm_campaign *</label>
                <input
                  type="text"
                  required
                  value={utmCampaign}
                  onChange={(e) => setUtmCampaign(e.target.value)}
                  className="w-full mt-1 p-2 bg-[#FAF9F6] border border-[#E2E4E9] rounded text-xs font-mono"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded text-xs transition shadow-xs"
              >
                Build Tracking Link
              </button>
            </form>

            {utmResult && (
              <div className="mt-3 p-3 bg-[#FAF9F6] rounded border border-[#E2E4E9] text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[10px] font-mono uppercase text-slate-700">
                    Generated Link:
                  </span>
                  <button
                    onClick={() => handleCopy(utmResult.finalUrl)}
                    className="text-indigo-600 hover:text-indigo-800 font-semibold flex items-center space-x-1"
                  >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>

                <p className="p-2 bg-white rounded border border-[#E2E4E9] break-all font-mono text-[10px] text-slate-800 select-all">
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
          <div className="bg-white rounded-md max-w-md w-full p-6 space-y-4 shadow-lg border border-[#E2E4E9]">
            <h2 className="text-base font-bold text-slate-900">Schedule Publication</h2>
            <form onSubmit={handleScheduleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700">Target Date &amp; Time</label>
                <input
                  type="datetime-local"
                  required
                  value={scheduleDate}
                  onChange={(e) => setScheduleDate(e.target.value)}
                  className="w-full mt-1 p-2 bg-[#FAF9F6] border border-[#E2E4E9] rounded text-xs"
                />
              </div>
              <div className="flex justify-end space-x-2 pt-2 border-t border-[#E2E4E9]">
                <button
                  type="button"
                  onClick={() => setShowScheduleModal(false)}
                  className="px-3 py-1.5 rounded border border-[#E2E4E9] text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-1.5 rounded bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-xs"
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
          <div className="bg-white rounded-md max-w-xl w-full p-6 space-y-4 shadow-lg border border-[#E2E4E9]">
            <div className="flex items-center justify-between pb-2 border-b border-[#E2E4E9]">
              <h2 className="text-base font-bold text-slate-900">Publication Package Ready</h2>
              <button
                onClick={() => setShowPublishModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <textarea
              readOnly
              rows={10}
              value={copyPackage}
              className="w-full p-3 bg-[#FAF9F6] border border-[#E2E4E9] rounded font-mono text-[11px] text-slate-800"
            />
            <div className="flex justify-between items-center pt-2">
              <button
                onClick={() => handleCopy(copyPackage)}
                className="px-3 py-1.5 rounded bg-slate-900 text-white text-xs font-semibold flex items-center space-x-1"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copied ? 'Copied' : 'Copy Package'}</span>
              </button>
              <button
                onClick={() => setShowPublishModal(false)}
                className="px-3 py-1.5 rounded border border-[#E2E4E9] text-slate-600 text-xs hover:bg-slate-50"
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
