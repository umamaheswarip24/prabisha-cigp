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
  ShieldCheck,
  User,
} from 'lucide-react';

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
  badge?: string;
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
      label: 'Studio',
      items: [
        { name: 'Dashboard', href: '/', icon: LayoutDashboard },
        { name: 'Campaigns', href: '/campaigns', icon: Layers },
        { name: 'Calendar & Export', href: '/calendar', icon: Calendar },
      ],
    },
    {
      label: 'Governance',
      items: [
        { name: 'ICP Personas', href: '/icp', icon: Target },
        { name: 'Claims & Evidence', href: '/knowledge', icon: BookOpen },
        { name: 'Compliance Gate', href: '/compliance', icon: Scale },
      ],
    },
    {
      label: 'System',
      items: [
        { name: 'Telemetry & Eval', href: '/telemetry', icon: Activity },
        { name: 'AI Gateway', href: '/settings', icon: Settings },
      ],
    },
  ];

  return (
    <aside
      className={`relative flex flex-col border-r border-[#E2E4E9] bg-white transition-all duration-200 z-30 select-none ${
        collapsed ? 'w-16' : 'w-60'
      }`}
    >
      {/* Brand & Workspace Header */}
      <div className="h-14 flex items-center justify-between px-3 border-b border-[#E2E4E9]">
        <Link href="/" className="flex items-center space-x-2.5 overflow-hidden">
          <div className="w-8 h-8 rounded bg-indigo-600 flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-xs">
            P
          </div>
          {!collapsed && (
            <div className="truncate">
              <div className="flex items-center space-x-1.5">
                <span className="font-bold text-slate-900 text-sm tracking-tight">Prabisha</span>
                <span className="text-[10px] font-mono bg-indigo-50 text-indigo-700 px-1.5 py-0.2 rounded border border-indigo-200">
                  v1.0
                </span>
              </div>
              <p className="text-[11px] text-slate-400 truncate">Marketing Ops Studio</p>
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
      <div className="flex-1 overflow-y-auto py-3 px-2 space-y-5">
        {clusters.map((cluster) => (
          <div key={cluster.label} className="space-y-1">
            {!collapsed ? (
              <p className="px-2.5 text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                {cluster.label}
              </p>
            ) : (
              <div className="border-t border-[#E2E4E9] my-2 mx-1" />
            )}

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
                    className={`flex items-center rounded text-xs transition duration-100 ${
                      collapsed ? 'justify-center p-2' : 'px-2.5 py-2 space-x-2.5'
                    } ${
                      isActive
                        ? 'bg-slate-50 text-slate-950 font-bold border-l-3 border-l-indigo-600 border border-[#E2E4E9] shadow-xs'
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

      {/* User & Compliance Status Footer */}
      <div className="border-t border-[#E2E4E9] p-2 bg-[#FAF9F6]">
        <div className={`flex items-center ${collapsed ? 'justify-center' : 'space-x-2.5 px-1 py-1'}`}>
          <div className="w-7 h-7 rounded-full bg-slate-200 border border-[#E2E4E9] flex items-center justify-center text-xs font-bold text-slate-700 shrink-0">
            AK
          </div>
          {!collapsed && (
            <div className="truncate text-xs">
              <p className="font-semibold text-slate-900 truncate">Alok Kumar</p>
              <div className="flex items-center space-x-1 text-[10px] text-emerald-700 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span>
                <span>UK & IN Active</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
