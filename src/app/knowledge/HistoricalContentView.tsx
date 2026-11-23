'use client';

import React, { useState } from 'react';
import {
  Search,
  UploadCloud,
  FileText,
  AlertCircle,
  CheckCircle2,
  Copy,
  ExternalLink,
  Plus,
  X,
} from 'lucide-react';

interface HistoricalContentViewProps {
  initialDocuments: any[];
}

export function HistoricalContentView({ initialDocuments }: HistoricalContentViewProps) {
  const [documents, setDocuments] = useState(initialDocuments);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[] | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  const [importForm, setImportForm] = useState({
    title: '',
    sourceType: 'MARKDOWN',
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
          sourceType: 'MARKDOWN',
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
    <div className="bg-white rounded-md border border-[#E2E4E9] shadow-xs p-5 space-y-4">
      {/* Header & Import CTA */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#E2E4E9]">
        <div>
          <h2 className="text-xs font-bold font-mono uppercase tracking-wider text-slate-900 flex items-center space-x-2">
            <FileText className="w-3.5 h-3.5 text-indigo-600" />
            <span>Historical Content &amp; Semantic Archive</span>
          </h2>
          <p className="text-[11px] text-slate-400">
            Case studies, whitepapers, and past campaigns ingested for duplicate detection and RAG
          </p>
        </div>

        <button
          onClick={() => {
            setShowImportModal(true);
            setImportStatus(null);
          }}
          className="inline-flex items-center space-x-1.5 text-xs font-semibold px-3 py-1.5 rounded bg-indigo-600 hover:bg-indigo-700 text-white transition shadow-xs"
        >
          <UploadCloud className="w-3.5 h-3.5" />
          <span>Import Content Document</span>
        </button>
      </div>

      {importStatus && (
        <div className="p-2.5 bg-indigo-50 border border-indigo-200 rounded text-xs text-indigo-900 font-medium">
          {importStatus}
        </div>
      )}

      {/* Semantic / Keyword Search Bar */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search approved knowledge and past assets (e.g., 'automation', 'tax compliance')..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs border border-[#E2E4E9] rounded bg-[#FAF9F6] focus:bg-white text-slate-800 focus:outline-none"
          />
        </div>
        <button
          type="submit"
          disabled={isSearching}
          className="px-3 py-1.5 bg-slate-900 text-white rounded text-xs font-semibold hover:bg-slate-800 disabled:opacity-50"
        >
          {isSearching ? 'Searching...' : 'Search'}
        </button>
        {searchResults && (
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setSearchResults(null);
            }}
            className="px-3 py-1.5 border border-[#E2E4E9] text-slate-600 rounded text-xs hover:bg-slate-50"
          >
            Clear
          </button>
        )}
      </form>

      {/* Dense Scannable Data Rows Table */}
      <div className="border border-[#E2E4E9] rounded overflow-hidden">
        {activeList.length === 0 ? (
          <p className="text-xs text-slate-400 py-6 text-center">
            No historical documents found. Import your first piece of content above!
          </p>
        ) : (
          <table className="w-full text-xs">
            <thead className="bg-[#FAF9F6] border-b border-[#E2E4E9] text-slate-600 text-[10px] font-mono uppercase">
              <tr>
                <th className="py-2 px-3 text-left">Document &amp; Excerpt</th>
                <th className="py-2 px-3 text-left">Type</th>
                <th className="py-2 px-3 text-left">Tags</th>
                <th className="py-2 px-3 text-right">System ID</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E4E9]">
              {activeList.map((doc: any) => (
                <tr key={doc.id} className="hover:bg-slate-50/60 transition">
                  <td className="py-2.5 px-3 max-w-md">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-slate-900 tracking-tight">{doc.title}</span>
                      {doc.relevanceScore !== undefined && (
                        <span className="text-[10px] font-mono font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 px-1.5 py-0.2 rounded">
                          {doc.relevanceScore}% match
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                      {doc.excerpt || doc.content}
                    </p>
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded border border-[#E2E4E9]">
                      {doc.sourceType}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-[11px] text-slate-600">
                    {Array.isArray(doc.tags) ? doc.tags.join(', ') : 'None'}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-slate-400 text-[11px]">
                    {doc.id.slice(0, 8)}...
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal: Import Document */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-md max-w-lg w-full p-6 space-y-4 shadow-lg max-h-[90vh] overflow-y-auto text-xs border border-[#E2E4E9]">
            <div className="flex items-center justify-between pb-2 border-b border-[#E2E4E9]">
              <h2 className="text-base font-bold text-slate-900">Import Content Document</h2>
              <button
                onClick={() => setShowImportModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleImport} className="space-y-3">
              <div>
                <label className="font-semibold text-slate-700">Document Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 2026 UK Mid-Market AI Automation Whitepaper"
                  value={importForm.title}
                  onChange={(e) => setImportForm({ ...importForm, title: e.target.value })}
                  className="w-full mt-1 p-2 bg-[#FAF9F6] border border-[#E2E4E9] rounded text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700">Source Type</label>
                  <select
                    value={importForm.sourceType}
                    onChange={(e) => setImportForm({ ...importForm, sourceType: e.target.value })}
                    className="w-full mt-1 p-2 bg-[#FAF9F6] border border-[#E2E4E9] rounded text-xs"
                  >
                    <option value="WHITE_PAPER">White Paper</option>
                    <option value="CASE_STUDY">Case Study</option>
                    <option value="MARKDOWN">Markdown Document</option>
                    <option value="BLOG_POST">Blog Post</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700">Tags (comma-separated)</label>
                  <input
                    type="text"
                    value={importForm.tags}
                    onChange={(e) => setImportForm({ ...importForm, tags: e.target.value })}
                    className="w-full mt-1 p-2 bg-[#FAF9F6] border border-[#E2E4E9] rounded text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700">Content Body *</label>
                <textarea
                  rows={6}
                  required
                  placeholder="Paste article, case study text, or factual notes..."
                  value={importForm.content}
                  onChange={(e) => setImportForm({ ...importForm, content: e.target.value })}
                  className="w-full mt-1 p-2 bg-[#FAF9F6] border border-[#E2E4E9] rounded text-xs font-mono"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-[#E2E4E9]">
                <button
                  type="button"
                  onClick={() => setShowImportModal(false)}
                  className="px-3 py-1.5 rounded border border-[#E2E4E9] text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-xs"
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
