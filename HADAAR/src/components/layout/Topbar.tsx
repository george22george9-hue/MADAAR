'use client';

// ====================================================================
// HADAR SaaS Platform — Topbar Header (Fully Mobile Responsive)
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
  Menu
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
    <header className="h-14 sm:h-16 bg-white border-b border-slate-200 px-3 sm:px-6 flex items-center justify-between sticky top-0 z-20 shadow-sm select-none">
      {/* Left / Center Selection */}
      <div className="flex items-center gap-2 sm:gap-4 min-w-0">
        {/* Mobile Hamburger Drawer Button */}
        <button
          type="button"
          onClick={onToggleMobileSidebar}
          className="md:hidden p-1.5 rounded-lg text-slate-700 hover:bg-slate-100 transition flex items-center justify-center shrink-0"
          aria-label="القائمة الجانبية"
        >
          <Menu className="w-5 h-5 text-[#111D2D]" />
        </button>

        {/* Multi-Tenant Center Switcher */}
        <div className="relative shrink-0 max-w-[140px] sm:max-w-none">
          <button
            onClick={() => setShowCenterMenu(!showCenterMenu)}
            className="flex items-center gap-1.5 sm:gap-2.5 px-2.5 py-1.5 rounded-lg border border-slate-200 hover:border-[#C7A66A] bg-slate-50 transition text-xs sm:text-sm font-semibold text-[#111D2D]"
          >
            <Building2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#27877E] shrink-0" />
            <span className="truncate">{currentCenter.name_ar}</span>
            <ChevronDown className="w-3 h-3 text-slate-400 shrink-0" />
          </button>

          {showCenterMenu && (
            <div className="absolute top-full mt-1.5 w-64 bg-white border border-slate-200 rounded-xl shadow-lg py-2 z-50">
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

        {/* Role Switcher Pill (Center Staff) */}
        <div className="relative hidden sm:block">
          <button
            onClick={() => setShowRoleMenu(!showRoleMenu)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-[#111D2D]/5 hover:bg-[#111D2D]/10 text-[#111D2D] border border-slate-200"
          >
            <Shield className="w-3.5 h-3.5 text-[#C7A66A]" />
            <span>الدور: {currentRole === 'super_admin' ? 'مدير المنصة' : currentRole === 'owner' ? 'مدير السنتر' : 'مساعد حضور'}</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {showRoleMenu && (
            <div className="absolute top-full mt-1.5 w-48 bg-white border border-slate-200 rounded-xl shadow-lg py-2 z-50">
              <div className="px-3 py-1 text-[11px] text-slate-400 font-semibold border-b border-slate-100">
                تبديل صلاحية المستخدم:
              </div>
              {(currentRole === 'super_admin' ? ['owner', 'assistant', 'super_admin'] : ['owner', 'assistant']).map((r) => (
                <button
                  key={r}
                  onClick={() => {
                    switchUserRole(r as UserRole);
                    setShowRoleMenu(false);
                  }}
                  className={`w-full text-right px-3 py-1.5 text-xs hover:bg-slate-50 ${
                    currentRole === r ? 'font-bold text-[#27877E] bg-teal-50' : 'text-slate-600'
                  }`}
                >
                  {r === 'owner' ? 'مدير السنتر (Full Access)' : r === 'assistant' ? 'مساعد حضور (Scanner & Group)' : 'مدير المنصة (Super Admin)'}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
        {/* Developer WhatsApp Contact Button */}
        <a
          href="https://wa.me/201202074649?text=%D9%85%D8%B1%D8%AD%D8%A8%D8%A7%D9%8B%D8%8C%20%D8%A3%D9%88%D8%AF%20%D8%A7%D9%84%D8%AA%D9%88%D8%A7%D8%B5%D9%84%20%D9%85%D8%B9%20%D9%85%D8%B7%D9%88%D8%B1%20%D9%85%D9%86%D8%B8%D9%88%D9%85%D8%A9%20%D8%AD%D9%8E%D8%B6%D9%8E%D8%B1"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-2 py-1.5 sm:px-3 sm:py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold transition"
          title="تواصل مع المطور عبر واتساب (01202074649)"
        >
          <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
          <span className="hidden md:inline">تواصل مع المطور</span>
        </a>

        {/* Offline / Online Network Indicator */}
        <div className="flex items-center gap-1 sm:gap-2">
          {isOnline ? (
            <span className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <Wifi className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              <span className="hidden lg:inline">{t('online')}</span>
            </span>
          ) : (
            <span className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
              <WifiOff className="w-3.5 h-3.5 text-amber-600" />
              <span className="hidden sm:inline">{t('offline')}</span>
            </span>
          )}

          {/* Pending Sync Counter */}
          {pendingCount > 0 && (
            <button
              onClick={triggerAutoSync}
              disabled={isSyncing || !isOnline}
              className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition"
              title="مزامنة الحضور المسجل أوفلاين"
            >
              <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">{pendingCount} معلق</span>
            </button>
          )}
        </div>

        {/* Language Switcher */}
        <button
          onClick={() => setLocale(locale === 'ar' ? 'en' : 'ar')}
          className="flex items-center gap-1 p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
          title="تبديل اللغة / Switch Language"
        >
          <Globe className="w-3.5 h-3.5 text-[#C7A66A]" />
          <span className="hidden sm:inline">{locale === 'ar' ? 'EN' : 'عربي'}</span>
        </button>

        {/* Notifications Icon */}
        <Link
          href="/notifications"
          className="relative p-1.5 sm:p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-[#111D2D] transition"
        >
          <Bell className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          {unreadNotificationsCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center">
              {unreadNotificationsCount}
            </span>
          )}
        </Link>

        {/* User Profile Card & Logout */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 pl-1.5 sm:pl-2 border-l border-slate-200">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#111D2D] text-[#C7A66A] flex items-center justify-center font-bold text-xs shadow-sm">
            {currentUser.full_name.substring(0, 2)}
          </div>
          <div className="hidden md:block text-right">
            <p className="text-xs font-semibold text-[#111D2D] leading-tight">{currentUser.full_name}</p>
            <p className="text-[10px] text-slate-500 font-medium">
              {currentRole === 'super_admin' ? 'Super Admin' : currentRole === 'owner' ? 'Owner' : 'Assistant'}
            </p>
          </div>
          <Link
            href="/login"
            className="p-1 sm:p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-red-600 hover:bg-red-50 transition"
            title="تسجيل الخروج / تبديل الحساب"
          >
            <LogOut className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </header>
  );
}
