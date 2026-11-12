'use client';

// ====================================================================
// HADAR SaaS Platform — Responsive Brand Navigation Sidebar
// Developed by MADAAR Technologies
// Colors: Midnight Navy (#111D2D), Champagne Gold (#C7A66A)
// ====================================================================

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  QrCode,
  Users,
  BookOpen,
  CalendarDays,
  History,
  CreditCard,
  Receipt,
  BarChart3,
  Bell,
  Settings,
  ShieldAlert,
  GraduationCap
} from 'lucide-react';
import { useI18n } from '@/lib/i18n/context';
import { useData } from '@/lib/store/data-context';

export function Sidebar() {
  const pathname = usePathname();
  const { t, isRtl } = useI18n();
  const { currentCenter, currentRole, unreadNotificationsCount } = useData();

  // Navigation Items
  const navItems = [
    { href: '/', label: t('nav_dashboard'), icon: LayoutDashboard },
    {
      href: '/scanner',
      label: t('nav_scanner'),
      icon: QrCode,
      highlight: true
    },
    { href: '/students', label: t('nav_students'), icon: Users },
    { href: '/groups', label: t('nav_groups'), icon: BookOpen },
    { href: '/sessions', label: t('nav_sessions'), icon: CalendarDays },
    { href: '/history', label: t('nav_history'), icon: History },
    { href: '/subscriptions', label: t('nav_subscriptions'), icon: CreditCard, requiresFinance: true },
    { href: '/payments', label: t('nav_payments'), icon: Receipt, requiresFinance: true },
    { href: '/reports', label: t('nav_reports'), icon: BarChart3 },
    {
      href: '/notifications',
      label: t('nav_notifications'),
      icon: Bell,
      badge: unreadNotificationsCount > 0 ? unreadNotificationsCount : null
    },
    { href: '/settings', label: t('nav_settings'), icon: Settings }
  ];

  // Super Admin Navigation
  const superAdminItem = {
    href: '/super-admin',
    label: t('nav_super_admin'),
    icon: ShieldAlert
  };

  // Check if role is restricted from finance
  const isFinanceRestricted = currentRole === 'assistant' && !currentCenter.has_financial_addon;

  return (
    <aside className="w-64 bg-[#111D2D] text-white flex flex-col h-screen fixed top-0 bottom-0 z-30 select-none shadow-xl border-r border-[#1E2A3D]">
      {/* Brand Identity Header */}
      <div className="p-5 border-b border-[#1E2A3D] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#C7A66A] to-[#8C6F3B] p-[2px] shadow-gold flex items-center justify-center">
            <div className="w-full h-full bg-[#111D2D] rounded-[10px] flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-[#C7A66A]" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold tracking-tight text-white">HADAR</span>
              <span className="text-base font-bold text-[#C7A66A]">حضر</span>
            </div>
            <p className="text-[10px] tracking-wider text-slate-400 uppercase font-medium">
              by MADAAR Technologies
            </p>
          </div>
        </div>
      </div>

      {/* Active Workspace / Center Banner */}
      <div className="px-4 py-3 bg-[#162130] border-b border-[#1E2A3D] flex items-center justify-between">
        <div className="min-w-0">
          <p className="text-xs text-slate-400 font-medium">السنتر الحالي:</p>
          <p className="text-sm font-semibold text-white truncate">{currentCenter.name_ar}</p>
        </div>
        <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-[#C7A66A]/20 text-[#C7A66A] border border-[#C7A66A]/30">
          {currentCenter.subscription_tier}
        </span>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {navItems.map((item) => {
          if (item.requiresFinance && isFinanceRestricted) return null;
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                item.highlight
                  ? isActive
                    ? 'bg-[#C7A66A] text-[#111D2D] font-bold shadow-md'
                    : 'bg-[#C7A66A]/15 text-[#C7A66A] hover:bg-[#C7A66A]/25 border border-[#C7A66A]/30'
                  : isActive
                  ? 'bg-[#27877E] text-white shadow'
                  : 'text-slate-300 hover:bg-[#1E2A3D] hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${item.highlight && !isActive ? 'text-[#C7A66A]' : ''}`} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className="px-1.5 py-0.2 bg-red-500 text-white text-[11px] font-bold rounded-full">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}

        {/* Special Portals (Super Admin & Student Portal) */}
        <div className="pt-3 mt-3 border-t border-[#1E2A3D] space-y-1">
          <Link
            href="/portal"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold text-teal-300/90 hover:bg-teal-950/40 hover:text-teal-200 transition"
          >
            <GraduationCap className="w-4 h-4 text-teal-400" />
            <span>بوابة الطالب وولي الأمر</span>
          </Link>

          <Link
            href={superAdminItem.href}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition ${
              pathname === superAdminItem.href
                ? 'bg-amber-600 text-white font-bold'
                : 'text-amber-300/80 hover:bg-amber-950/40 hover:text-amber-200'
            }`}
          >
            <ShieldAlert className="w-4 h-4 text-amber-400" />
            <span>{superAdminItem.label}</span>
          </Link>
        </div>
      </nav>

      {/* Footer Identity */}
      <div className="p-3 border-t border-[#1E2A3D] text-[11px] text-slate-400 text-center">
        <p>نظام حضر الذكي v1.0</p>
        <p className="text-slate-500">شركة مدار للحلول السحابية</p>
      </div>
    </aside>
  );
}

