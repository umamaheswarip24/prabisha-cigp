'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { ChevronRight } from 'lucide-react';

export function Header() {
  const pathname = usePathname();

  // Dynamic breadcrumb resolution
  const getBreadcrumb = () => {
    switch (pathname) {
      case '/':
        return { cluster: 'Studio', page: 'Dashboard Overview' };
      case '/campaigns':
        return { cluster: 'Studio', page: 'Campaign Briefs & Content Studio' };
      case '/calendar':
        return { cluster: 'Studio', page: 'Editorial Calendar & Export' };
      case '/icp':
        return { cluster: 'Governance', page: 'ICP & Persona Manager' };
      case '/knowledge':
        return { cluster: 'Governance', page: 'Claims & Evidence Library' };
      case '/compliance':
        return { cluster: 'Governance', page: 'Compliance Rule Engine' };
      case '/telemetry':
        return { cluster: 'System', page: 'Telemetry & Golden Evaluation' };
      case '/settings':
        return { cluster: 'System', page: 'Model-Agnostic AI Gateway' };
      default:
        return { cluster: 'Studio', page: 'Workspace' };
    }
  };

  const breadcrumb = getBreadcrumb();

  return (
    <header className="h-12 border-b border-[#E2E4E9] bg-white px-6 flex items-center justify-between text-xs shrink-0 z-20">
      {/* Current Page Breadcrumb (Left) */}
      <div className="flex items-center space-x-2 text-slate-500 font-medium">
        <span className="font-mono text-[11px] uppercase tracking-wider text-slate-400">
          {breadcrumb.cluster}
        </span>
        <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
        <span className="text-slate-900 font-semibold">{breadcrumb.page}</span>
      </div>

      {/* Relocated Grounded Intelligence Status Badge (Right) */}
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2 text-slate-700 bg-[#FAF9F6] border border-[#E2E4E9] px-2.5 py-1 rounded-[4px]">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-[11px] font-mono font-medium text-slate-800">
            Grounded Intelligence &amp; Compliance Active
          </span>
          <span className="text-[10px] font-mono bg-emerald-50 text-emerald-800 px-1 py-0.2 rounded border border-emerald-200">
            UK (ASA) • IN (ASCI)
          </span>
        </div>
      </div>
    </header>
  );
}
