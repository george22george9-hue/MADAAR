'use client';

// ====================================================================
// HADAR SaaS Platform — Topbar Header
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
  UserCheck,
  CheckCircle2,
  Shield,
  LogOut
} from 'lucide-react';
import { useI18n } from '@/lib/i18n/context';
import { useData } from '@/lib/store/data-context';
import { UserRole } from '@/types/database';
import { OfflineSyncService } from '@/lib/offline/sync-service';

export function Topbar() {
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
      // Offline events simulated upload
      return { success: true };
    });
    const remaining = await OfflineSyncService.getPendingCount();
    setPendingCount(remaining);
    setIsSyncing(false);
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-20 shadow-sm">
      {/* Left / Center Selection */}
      <div className="flex items-center gap-4">
        {/* Multi-Tenant Center Switcher */}
        <div className="relative">
          <button
            onClick={() => setShowCenterMenu(!showCenterMenu)}
            className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:border-[#C7A66A] bg-slate-50 transition text-sm font-semibold text-[#111D2D]"
          >
            <Building2 className="w-4 h-4 text-[#27877E]" />
            <span>{currentCenter.name_ar}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
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

        {/* Role Switcher Pill (Dev / Testing / RBAC Preview) */}
        <div className="relative">
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
              {(['owner', 'assistant', 'super_admin'] as UserRole[]).map((r) => (
                <button
                  key={r}
                  onClick={() => {
                    switchUserRole(r);
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
      <div className="flex items-center gap-3">
        {/* Offline / Online Network Indicator */}
        <div className="flex items-center gap-2">
          {isOnline ? (
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <Wifi className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t('online')}</span>
            </span>
          ) : (
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
              <WifiOff className="w-3.5 h-3.5 text-amber-600" />
              <span>{t('offline')}</span>
            </span>
          )}

          {/* Pending Sync Counter */}
          {pendingCount > 0 && (
            <button
              onClick={triggerAutoSync}
              disabled={isSyncing || !isOnline}
              className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition"
              title="مزامنة الحضور المسجل أوفلاين"
            >
              <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{pendingCount} معلق للسنك</span>
            </button>
          )}
        </div>

        {/* Language Switcher */}
        <button
          onClick={() => setLocale(locale === 'ar' ? 'en' : 'ar')}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
          title="تبديل اللغة / Switch Language"
        >
          <Globe className="w-3.5 h-3.5 text-[#C7A66A]" />
          <span>{locale === 'ar' ? 'English' : 'العربية'}</span>
        </button>

        {/* Notifications Icon */}
        <Link
          href="/notifications"
          className="relative p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-[#111D2D] transition"
        >
          <Bell className="w-4 h-4" />
          {unreadNotificationsCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
              {unreadNotificationsCount}
            </span>
          )}
        </Link>

        {/* User Profile Card & Logout */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full bg-[#111D2D] text-[#C7A66A] flex items-center justify-center font-bold text-xs shadow-sm">
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
            className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-red-600 hover:bg-red-50 transition"
            title="تسجيل الخروج / تبديل الحساب"
          >
            <LogOut className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </header>
  );
}

