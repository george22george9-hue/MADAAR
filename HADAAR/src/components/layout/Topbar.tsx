'use client';

// ====================================================================
// HADAR SaaS Platform — Topbar Header (Exact Mobile Reference Design)
// Developed by MADAAR Technologies
// ====================================================================

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Building2,
  ChevronDown,
  Wifi,
  WifiOff,
  RefreshCw,
  Globe,
  Bell,
  CheckCircle2,
  Shield,
  LogOut,
  MessageCircle,
  Menu,
  GraduationCap
} from 'lucide-react';
import { useI18n } from '@/lib/i18n/context';
import { useData } from '@/lib/store/data-context';
import { UserRole } from '@/types/database';
import { OfflineSyncService } from '@/lib/offline/sync-service';

interface TopbarProps {
  onToggleMobileSidebar?: () => void;
}

export function Topbar({ onToggleMobileSidebar }: TopbarProps) {
  const { t, locale, setLocale, isRtl } = useI18n();
  const {
    currentCenter,
    allCenters,
    switchCenter,
    currentUser,
    currentRole,
    switchUserRole,
    unreadNotificationsCount
  } = useData();

  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [pendingCount, setPendingCount] = useState<number>(0);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [showCenterMenu, setShowCenterMenu] = useState(false);
  const [showRoleMenu, setShowRoleMenu] = useState(false);

  // Monitor network status
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsOnline(navigator.onLine);
      const handleOnline = () => {
        setIsOnline(true);
        triggerAutoSync();
      };
      const handleOffline = () => setIsOnline(false);

      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);

      // Check pending offline events count
      const checkPending = async () => {
        const count = await OfflineSyncService.getPendingCount();
        setPendingCount(count);
      };
      checkPending();
      const interval = setInterval(checkPending, 5000);

      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
        clearInterval(interval);
      };
    }
  }, []);

  const triggerAutoSync = async () => {
    setIsSyncing(true);
    await OfflineSyncService.syncEvents(async (evt) => {
      return { success: true };
    });
    const remaining = await OfflineSyncService.getPendingCount();
    setPendingCount(remaining);
    setIsSyncing(false);
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200/80 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-20 shadow-xs select-none">
      {/* Right Side (in RTL): User Profile & Center Status */}
      <div className="flex items-center gap-2.5 min-w-0">
        {/* User Identity Box */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#111D2D] text-[#C7A66A] flex items-center justify-center font-bold text-xs shadow-xs shrink-0 border border-[#1E2A3D]">
            <span>1.1</span>
          </div>

          <div className="text-right min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-xs sm:text-sm font-extrabold text-[#111D2D] truncate">
                {currentUser.full_name}
              </span>
              <span className="px-1.5 py-0.2 rounded-md bg-teal-50 text-[#27877E] border border-teal-200/60 text-[10px] font-bold shrink-0">
                {currentRole === 'super_admin' ? 'مدير المنصة' : currentRole === 'owner' ? 'مدير السنتر' : 'مساعد'}
              </span>
            </div>

            <div className="flex items-center gap-1 text-[10px] text-emerald-600 font-medium leading-none mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>{isOnline ? 'متصل بالإنترنت' : 'أوفلاين'}</span>
            </div>
          </div>
        </div>

        {/* Center Switcher (Desktop / Expanded) */}
        <div className="relative hidden lg:block mr-2">
          <button
            onClick={() => setShowCenterMenu(!showCenterMenu)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-slate-200 hover:border-[#C7A66A] bg-slate-50 transition text-xs font-semibold text-[#111D2D]"
          >
            <Building2 className="w-3.5 h-3.5 text-[#27877E] shrink-0" />
            <span className="truncate">{currentCenter.name_ar}</span>
            <ChevronDown className="w-3 h-3 text-slate-400 shrink-0" />
          </button>

          {showCenterMenu && (
            <div className="absolute top-full mt-1.5 w-60 bg-white border border-slate-200 rounded-xl shadow-lg py-2 z-50">
              <div className="px-3 py-1.5 text-xs text-slate-400 font-semibold border-b border-slate-100">
                السناتر التعليمية المتاحة:
              </div>
              {allCenters.map((c) => (
                <button
                  key={c.id}
                  onClick={() => {
                    switchCenter(c.id);
                    setShowCenterMenu(false);
                  }}
                  className={`w-full text-right px-3 py-2 text-sm flex items-center justify-between hover:bg-slate-50 ${
                    c.id === currentCenter.id ? 'font-bold text-[#111D2D] bg-[#C7A66A]/10' : 'text-slate-600'
                  }`}
                >
                  <span className="truncate">{c.name_ar}</span>
                  {c.id === currentCenter.id && <CheckCircle2 className="w-4 h-4 text-[#27877E]" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Left Side (in RTL): Brand Badge, Notifications & Actions */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Developer WhatsApp (Desktop) */}
        <a
          href="https://wa.me/201202074649?text=%D9%85%D8%B1%D8%AD%D8%A8%D8%A7%D9%8B%D8%8C%20%D8%A3%D9%88%D8%AF%20%D8%A7%D9%84%D8%AA%D9%88%D8%A7%D8%B5%D9%84%20%D9%85%D8%B9%20%D9%85%D8%B7%D9%88%D8%B1%20%D9%85%D9%86%D8%B8%D9%88%D9%85%D8%A9%20%D8%AD%D9%8E%D8%B6%D9%8E%D8%B1"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold transition"
          title="تواصل مع المطور عبر واتساب (01202074649)"
        >
          <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
          <span>تواصل مع المطور</span>
        </a>

        {/* Notifications Icon with Badge */}
        <Link
          href="/notifications"
          className="relative p-2 rounded-xl border border-slate-200/80 bg-slate-50 text-slate-700 hover:bg-slate-100 transition flex items-center justify-center"
          title="التنبيهات"
        >
          <Bell className="w-4 h-4" />
          {unreadNotificationsCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center shadow-xs">
              {unreadNotificationsCount}
            </span>
          )}
        </Link>

        {/* Brand Badge (As in Mobile Mockup) */}
        <button
          type="button"
          onClick={onToggleMobileSidebar}
          className="px-2.5 py-1.5 rounded-xl bg-[#111D2D] text-white flex items-center gap-1.5 text-xs font-bold shadow-xs hover:bg-[#1E2A3D] transition border border-[#1E2A3D]"
          title="منظومة حَضَر الذكية"
        >
          <GraduationCap className="w-3.5 h-3.5 text-[#C7A66A]" />
          <span>حَضَر</span>
        </button>
      </div>
    </header>
  );
}
