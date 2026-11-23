'use client';

import React, { useState } from 'react';
import {
  Search,
  UploadCloud,
  FileText,
  ShieldCheck,
  Award,
  Plus,
  X,
  ExternalLink,
  Check,
  Copy,
} from 'lucide-react';

interface KnowledgeViewProps {
  initialDocuments: any[];
  claims: any[];
  evidence: any[];
}

export function KnowledgeView({
  initialDocuments,
  claims,
  evidence,
}: KnowledgeViewProps) {
  const [documents, setDocuments] = useState(initialDocuments);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[] | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  const [importForm, setImportForm] = useState({
    title: '',
    sourceType: 'WHITE_PAPER',
    sourceUrl: '',
    content: '',
    tags: 'automation, case-study, b2b',
  });

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      setSearchResults(null);
      return;
    }

    setIsSearching(true);
    try {
      const res = await fetch(`/api/v1/content/search?q=${encodeURIComponent(searchQuery)}`);
      const data = await res.json();
      if (data.success) {
        setSearchResults(data.results);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSearching(false);
    }
  };

  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault();
    setImportStatus(null);
    try {
      const res = await fetch('/api/v1/content/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: importForm.title,
          sourceType: importForm.sourceType,
          sourceUrl: importForm.sourceUrl || undefined,
          content: importForm.content,
          tags: importForm.tags.split(',').map((t) => t.trim()),
        }),
      });

      const data = await res.json();
      if (data.success) {
        setImportStatus(`Success: ${data.result.message}`);
        setShowImportModal(false);
        setImportForm({
          title: '',
          sourceType: 'WHITE_PAPER',
          sourceUrl: '',
          content: '',
          tags: '',
        });
        // Reload list
        const refreshed = await fetch('/api/v1/content/search?q=a');
        const refData = await refreshed.json();
        if (refData.results) {
          setDocuments(refData.results);
        }
      } else {
        setImportStatus(`Warning: ${data.result?.message || data.error}`);
      }
    } catch (e) {
      console.error(e);
      setImportStatus('Import failed unexpectedly.');
    }
  };

  const activeList = searchResults || documents;

  return (
    <div className="space-y-6">
      {/* 1. Flat Registry Header on Canvas */}
      <div className="border-b border-[#E2E4E9] pb-4 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded-[3px] border border-[#E2E4E9]">
              PRD P0 Requirement BR-01 to BR-06
            </span>
            <span className="text-slate-400 text-xs">•</span>
            <span className="text-[11px] font-mono text-emerald-700 font-semibold">
              {claims.length} Approved Claims Active
            </span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight font-sans">
            Grounded Knowledge &amp; Claim Registry
          </h1>
          <p className="text-xs text-slate-600 leading-normal font-sans max-w-2xl">
            The core intelligence layer. Generation models are strictly constrained to factual records registered here.
          </p>
        </div>

        {/* Promoted Primary Action (Top Right) */}
        <button
          onClick={() => {
            setShowImportModal(true);
            setImportStatus(null);
          }}
          className="inline-flex items-center space-x-1.5 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-[4px] text-xs font-semibold transition shadow-xs shrink-0"
        >
          <UploadCloud className="w-3.5 h-3.5" />
          <span>Import Content (BR-05)</span>
        </button>
      </div>

      {importStatus && (
        <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-[4px] text-xs text-indigo-950 font-medium">
          {importStatus}
        </div>
      )}

      {/* 2. Historical Content & Semantic Archive (Dense Ledger) */}
      <div className="space-y-3">
        {/* Flat Section Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900 tracking-tight flex items-center space-x-2">
              <FileText className="w-4 h-4 text-indigo-600" />
              <span>Historical Content &amp; Semantic Archive (BR-05, BR-06)</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Imported past campaigns, case studies, and reference articles with duplicate detection
            </p>
          </div>
          <span className="text-[10px] font-mono text-slate-400">
            {activeList.length} Ingested Records
          </span>
        </div>

        {/* Integrated Full-Width Search Bar */}
        <form onSubmit={handleSearch} className="flex rounded-[4px] border border-[#E2E4E9] bg-white overflow-hidden shadow-2xs">
          <div className="relative flex-1 flex items-center">
            <Search className="w-4 h-4 text-slate-400 absolute left-3" />
            <input
              type="text"
              placeholder="Search approved knowledge and historical assets (e.g., 'automation', 'legal intake')..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-transparent text-slate-900 focus:outline-none font-sans"
            />
          </div>
          {searchResults && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSearchResults(null);
              }}
              className="px-3 text-xs text-slate-500 hover:text-slate-800 border-l border-[#E2E4E9] font-medium"
            >
              Clear
            </button>
          )}
          <button
            type="submit"
            disabled={isSearching}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition disabled:opacity-50 shrink-0 font-sans"
          >
            {isSearching ? 'Searching...' : 'Search'}
          </button>
        </form>

        {/* Scannable Data Rows (Dense Ledger) */}
        <div className="bg-white rounded-[4px] border border-[#E2E4E9] shadow-xs overflow-hidden">
          {activeList.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">
              No historical records found matching your query.
            </div>
          ) : (
            <div className="divide-y divide-[#E2E4E9]">
              {activeList.map((doc: any) => {
                const parsedTags = Array.isArray(doc.tags)
                  ? doc.tags
                  : doc.tagsJson
                  ? JSON.parse(doc.tagsJson)
                  : [];

                return (
                  <div
                    key={doc.id}
                    className="p-3.5 flex flex-col sm:flex-row sm:items-start justify-between gap-3 hover:bg-slate-50/70 transition"
                  >
                    {/* Left Column: Title & Summary */}
                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-bold text-slate-900 text-xs tracking-tight">
                          {doc.title}
                        </h3>
                        {doc.relevanceScore !== undefined && (
                          <span className="text-[10px] font-mono font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 px-1.5 py-0.2 rounded">
                            {doc.relevanceScore}% match
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-600 font-sans leading-relaxed line-clamp-2">
                        {doc.excerpt || doc.content}
                      </p>
                    </div>

                    {/* Right Metadata Column: Aligned Monospace Index */}
                    <div className="flex sm:flex-col sm:items-end items-start justify-between sm:justify-start gap-1 sm:gap-0.5 shrink-0 text-right">
                      <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-800 px-1.5 py-0.5 rounded-[2px] border border-[#E2E4E9]">
                        {doc.sourceType}
                      </span>
                      <span className="font-mono text-[10px] text-slate-400">
                        ID: {doc.id.slice(0, 12)}...
                      </span>
                      <span className="text-[10px] text-slate-500 font-sans">
                        Tags: {parsedTags.length > 0 ? parsedTags.join(', ') : 'None'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* 3. Bottom 50/50 Split Governance Vault */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Left Pane — Approved Claims Registry */}
        <div className="bg-white rounded-[4px] border border-[#E2E4E9] shadow-xs p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#E2E4E9]">
            <div>
              <h2 className="text-xs font-bold font-mono uppercase tracking-wider text-slate-900 flex items-center space-x-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Approved Claims Registry ({claims.length})</span>
              </h2>
              <p className="text-[11px] text-slate-500 mt-0.5 font-sans">
                Verifiable objective claims approved for use in promotional content
              </p>
            </div>
            {/* Sharp 1px-bordered emerald monospace badge */}
            <span className="text-[10px] font-mono font-bold text-emerald-800 bg-emerald-50 border border-emerald-300 px-2 py-0.5 rounded-[2px] shrink-0">
              ASA/ASCI Validated
            </span>
          </div>

          <div className="space-y-3">
            {claims.map((claim) => (
              <div
                key={claim.id}
                className="p-3.5 bg-[#FAF9F6] rounded-[4px] border border-[#E2E4E9] space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold text-indigo-700">
                    {claim.id}
                  </span>
                  <span
                    className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded-[2px] border ${
                      claim.riskLevel === 'LOW'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}
                  >
                    Risk: {claim.riskLevel}
                  </span>
                </div>

                <p className="text-xs font-bold text-slate-900 leading-snug font-sans">
                  &ldquo;{claim.exactWording}&rdquo;
                </p>

                <div className="flex flex-wrap items-center justify-between text-[10px] font-mono text-slate-400 pt-1.5 border-t border-[#E2E4E9]">
                  <span>Reviewer: {claim.reviewer}</span>
                  <span>Verified: {new Date(claim.reviewDate).toLocaleDateString('en-GB')}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Pane — Evidence Library */}
        <div className="bg-white rounded-[4px] border border-[#E2E4E9] shadow-xs p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#E2E4E9]">
            <div>
              <h2 className="text-xs font-bold font-mono uppercase tracking-wider text-slate-900 flex items-center space-x-1.5">
                <Award className="w-3.5 h-3.5 text-indigo-600" />
                <span>Evidence Library ({evidence.length})</span>
              </h2>
              <p className="text-[11px] text-slate-500 mt-0.5 font-sans">
                Source documents, case studies, statistics, and third-party certifications
              </p>
            </div>
            <span className="text-[10px] font-mono text-slate-500 bg-slate-100 border border-[#E2E4E9] px-2 py-0.5 rounded-[2px] shrink-0">
              Verified Proof
            </span>
          </div>

          <div className="space-y-3">
            {evidence.map((item) => (
              <div
                key={item.id}
                className="p-3.5 bg-[#FAF9F6] rounded-[4px] border border-[#E2E4E9] space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-xs font-sans">{item.title}</span>
                  <span className="text-[10px] font-mono bg-slate-100 text-slate-700 px-1.5 py-0.2 rounded-[2px] border border-[#E2E4E9]">
                    {item.scope}
                  </span>
                </div>

                <div className="p-2 bg-white rounded-[3px] border border-[#E2E4E9] font-mono text-indigo-700 text-[11px] leading-snug">
                  {item.verifiedData}
                </div>

                <div className="flex flex-wrap items-center justify-between text-[10px] font-mono text-slate-400 pt-1.5 border-t border-[#E2E4E9]">
                  <span>Owner: {item.owner}</span>
                  <span>Permission: {item.permissionStatus}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal: Import Document */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[4px] max-w-lg w-full p-6 space-y-4 shadow-lg max-h-[90vh] overflow-y-auto text-xs border border-[#E2E4E9]">
            <div className="flex items-center justify-between pb-2 border-b border-[#E2E4E9]">
              <h2 className="text-base font-bold text-slate-900 font-sans">Import Content Document (BR-05)</h2>
              <button
                onClick={() => setShowImportModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleImport} className="space-y-3">
              <div>
                <label className="font-semibold text-slate-700 block">Document Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 2026 UK Mid-Market AI Automation Whitepaper"
                  value={importForm.title}
                  onChange={(e) => setImportForm({ ...importForm, title: e.target.value })}
                  className="w-full mt-1 p-2 bg-[#FAF9F6] border border-[#E2E4E9] rounded-[4px] text-xs font-sans"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block">Source Type</label>
                  <select
                    value={importForm.sourceType}
                    onChange={(e) => setImportForm({ ...importForm, sourceType: e.target.value })}
                    className="w-full mt-1 p-2 bg-[#FAF9F6] border border-[#E2E4E9] rounded-[4px] text-xs font-mono"
                  >
                    <option value="WHITE_PAPER">White Paper</option>
                    <option value="CASE_STUDY">Case Study</option>
                    <option value="MARKDOWN">Markdown Document</option>
                    <option value="BLOG_POST">Blog Post</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block">Tags (comma-separated)</label>
                  <input
                    type="text"
                    value={importForm.tags}
                    onChange={(e) => setImportForm({ ...importForm, tags: e.target.value })}
                    className="w-full mt-1 p-2 bg-[#FAF9F6] border border-[#E2E4E9] rounded-[4px] text-xs font-sans"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block">Content Body *</label>
                <textarea
                  rows={6}
                  required
                  placeholder="Paste article, case study text, or factual notes..."
                  value={importForm.content}
                  onChange={(e) => setImportForm({ ...importForm, content: e.target.value })}
                  className="w-full mt-1 p-2 bg-[#FAF9F6] border border-[#E2E4E9] rounded-[4px] text-xs font-mono"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-[#E2E4E9]">
                <button
                  type="button"
                  onClick={() => setShowImportModal(false)}
                  className="px-3 py-1.5 rounded-[4px] border border-[#E2E4E9] text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-[4px] bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-xs"
                >
                  Import &amp; Deduplicate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
