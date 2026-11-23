'use client';

import React from 'react';
import { ShieldCheck, ExternalLink } from 'lucide-react';

export function Header() {
  return (
    <header className="h-12 border-b border-[#E2E4E9] bg-white px-6 flex items-center justify-between text-xs shrink-0 z-20">
      <div className="flex items-center space-x-3">
        <span className="font-semibold text-slate-800">
          Workspace: <span className="font-mono text-slate-600 font-normal">prabisha-hq</span>
        </span>
        <span className="text-[#E2E4E9]">|</span>
        <div className="inline-flex items-center space-x-1.5 text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-[11px] font-medium">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>UK (ASA/CAP) & India (ASCI) Verified</span>
        </div>
      </div>

      <div className="flex items-center space-x-4 text-slate-500 text-[11px]">
        <span className="font-mono">P95 SLA &lt; 500ms</span>
        <span className="text-[#E2E4E9]">|</span>
        <span className="font-mono text-slate-700 font-medium">Model: Gemini 1.5 Pro / GPT-4o Ready</span>
      </div>
    </header>
  );
}
