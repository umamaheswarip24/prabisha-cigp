'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Layers,
  Calendar,
  Target,
  BookOpen,
  Scale,
  Activity,
  Settings,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
}

interface NavCluster {
  label: string;
  items: NavItem[];
}

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const clusters: NavCluster[] = [
    {
      label: 'STUDIO',
      items: [
        { name: 'Dashboard', href: '/', icon: LayoutDashboard },
        { name: 'Campaigns', href: '/campaigns', icon: Layers },
        { name: 'Calendar & Export', href: '/calendar', icon: Calendar },
      ],
    },
    {
      label: 'GOVERNANCE',
      items: [
        { name: 'ICP Personas', href: '/icp', icon: Target },
        { name: 'Claims & Evidence', href: '/knowledge', icon: BookOpen },
        { name: 'Compliance Gate', href: '/compliance', icon: Scale },
      ],
    },
    {
      label: 'SYSTEM',
      items: [
        { name: 'Telemetry & Eval', href: '/telemetry', icon: Activity },
        { name: 'AI Gateway', href: '/settings', icon: Settings },
      ],
    },
  ];

  return (
    <aside
      className={`relative flex flex-col border-r border-[#E2E4E9] bg-white transition-all duration-200 z-30 select-none shrink-0 ${
        collapsed ? 'w-16' : 'w-[240px]'
      }`}
    >
      {/* Brand & Platform Header (Pinned Top) */}
      <div className="h-14 flex items-center justify-between px-3 border-b border-[#E2E4E9]">
        <Link href="/" className="flex items-center space-x-2.5 overflow-hidden">
          <div className="w-8 h-8 rounded-[4px] bg-indigo-600 flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-xs">
            P
          </div>
          {!collapsed && (
            <div className="truncate">
              <div className="flex items-center space-x-1.5">
                <span className="font-bold text-slate-900 text-sm tracking-tight">Prabisha</span>
                <span className="text-[9px] font-mono font-bold bg-indigo-50 text-indigo-700 px-1 py-0.2 rounded border border-indigo-200">
                  PCIGP v1.0
                </span>
              </div>
              <p className="text-[10px] text-slate-400 truncate">
                Content Intelligence Platform
              </p>
            </div>
          )}
        </Link>

        {/* Collapse Toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation Clusters */}
      <div className="flex-1 overflow-y-auto py-3 px-2 space-y-4">
        {clusters.map((cluster, idx) => (
          <div key={cluster.label} className="space-y-1">
            {idx > 0 && <div className="border-t border-[#E2E4E9] my-2 mx-1" />}
            {!collapsed ? (
              <p className="px-2.5 pt-1 text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                {cluster.label}
              </p>
            ) : null}

            <div className="space-y-0.5">
              {cluster.items.map((item) => {
                const isActive =
                  item.href === '/'
                    ? pathname === '/'
                    : pathname === item.href || pathname.startsWith(item.href + '/');
                const Icon = item.icon;

                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    title={collapsed ? item.name : undefined}
                    className={`flex items-center rounded-[4px] text-xs transition duration-100 ${
                      collapsed ? 'justify-center p-2' : 'px-2.5 py-2 space-x-2.5'
                    } ${
                      isActive
                        ? 'bg-indigo-50/70 text-slate-900 font-bold border-l-[3px] border-l-indigo-600 border-t border-r border-b border-[#E2E4E9]'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70 border border-transparent'
                    }`}
                  >
                    <Icon
                      className={`w-4 h-4 shrink-0 ${
                        isActive ? 'text-indigo-600' : 'text-slate-400'
                      }`}
                    />
                    {!collapsed && (
                      <span className="truncate">{item.name}</span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* User & Identity Footer (Pinned Bottom) */}
      <div className="border-t border-[#E2E4E9] p-2.5 bg-[#FAF9F6]">
        <div className={`flex items-center ${collapsed ? 'justify-center' : 'space-x-2.5 px-1 py-0.5'}`}>
          <div className="w-7 h-7 rounded-[4px] bg-slate-900 border border-[#E2E4E9] flex items-center justify-center text-[11px] font-mono font-bold text-white shrink-0">
            AK
          </div>
          {!collapsed && (
            <div className="truncate text-xs">
              <p className="font-bold text-slate-900 truncate">Alok Kumar</p>
              <p className="text-[10px] text-slate-500 truncate font-mono">
                Marketing Lead (UK &amp; IN)
              </p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
