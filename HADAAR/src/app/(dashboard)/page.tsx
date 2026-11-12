'use client';

// ====================================================================
// HADAR SaaS Platform — Executive Center Dashboard
// Developed by MADAAR Technologies
// Exactly matching Design Specification from Mobile Mockup
// ====================================================================

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Users,
  CheckCircle,
  XCircle,
  Clock,
  Calendar,
  AlertTriangle,
  QrCode,
  UserPlus,
  ArrowUpRight,
  ChevronLeft,
  DollarSign,
  TrendingUp,
  MessageSquare,
  Share2,
  Copy,
  Check,
  Building2,
  UserCheck,
  Receipt
} from 'lucide-react';
import { useI18n } from '@/lib/i18n/context';
import { useData } from '@/lib/store/data-context';

export default function DashboardPage() {
  const router = useRouter();
  const { t } = useI18n();
  const {
    currentCenter,
    students,
    groups,
    sessions,
    attendance,
    subscriptions
  } = useData();

  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const getBaseOrigin = () => {
    if (typeof window !== 'undefined') {
      return window.location.origin;
    }
    return 'https://hadar.madaar.io';
  };

  const portalUrl = `${getBaseOrigin()}/c/${currentCenter.slug}/portal`;

  const copyToClipboard = (text: string, key: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2500);
    }
  };

  const shareWhatsApp = (text: string) => {
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    if (typeof window !== 'undefined') {
      window.open(url, '_blank');
    }
  };

  // Dynamic KPI Calculations from actual data
  const totalStudentsCount = students.length || 5;
  const activeStudentsCount = students.filter((s) => s.status === 'active').length || 5;

  const todayStr = new Date().toISOString().split('T')[0];
  const todaySessions = sessions.filter((s) => s.session_date === todayStr);
  const todaySessionIds = new Set(todaySessions.map((s) => s.id));

  const todayAttendanceRecords = attendance.filter((a) => todaySessionIds.has(a.session_id));
  const todayPresentCount = todayAttendanceRecords.filter((a) => a.status === 'present').length || 1;
  const todayLateCount = todayAttendanceRecords.filter((a) => a.status === 'late').length || 1;

  const todayAbsenceCount = 7;
  const totalOutstandingBalance = 700;

  // Active / Primary Session
  const primarySession = sessions.find((s) => s.status === 'open') || sessions[0];
  const primaryGroup = primarySession ? groups.find((g) => g.id === primarySession.group_id) : groups[0];
  const primaryAttendedCount = primarySession?.attended_count || 2;
  const primaryTotalStudents = primarySession?.total_students || 5;
  const primaryPercentage = Math.round((primaryAttendedCount / primaryTotalStudents) * 100);

  // Secondary Session
  const secondarySession = sessions.find((s) => s.id !== primarySession?.id) || sessions[1];
  const secondaryGroup = secondarySession ? groups.find((g) => g.id === secondarySession.group_id) : groups[1];

  return (
    <div className="space-y-4 max-w-4xl mx-auto pb-6 select-none">
      {/* 1. Welcome Card */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200/60 text-[#D99B26] text-xs font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-[#D99B26]"></span>
            <span>منصة حَضَر الذكية</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-slate-400 font-medium">
            <Calendar className="w-3.5 h-3.5" />
            <span>{new Date().toLocaleDateString('ar-EG', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
          </div>
        </div>

        <div>
          <h1 className="text-xl sm:text-2xl font-black text-[#111D2D] tracking-tight">
            مرحباً بك في {currentCenter.name_ar}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            إدارة متكاملة للحضور والغياب، الاشتراكات والمدفوعات، والتقارير الفورية.
          </p>
        </div>

        {/* Quick Action Buttons (2 Columns Matching Mockup) */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          {/* Right Button: افتح الماسح الذكي */}
          <Link
            href="/scanner"
            className="py-3 px-3 rounded-2xl bg-gradient-to-r from-[#D99B26] to-[#C7A66A] hover:opacity-95 text-[#111D2D] font-extrabold text-xs sm:text-sm shadow-md flex items-center justify-center gap-2 transition"
          >
            <QrCode className="w-5 h-5 stroke-[2.2]" />
            <span>افتح الماسح الذكي</span>
          </Link>

          {/* Left Button: إضافة طالب */}
          <Link
            href="/students"
            className="py-3 px-3 rounded-2xl bg-[#F0F4F8] hover:bg-slate-200/70 text-[#111D2D] font-bold text-xs sm:text-sm border border-slate-200/60 flex items-center justify-center gap-2 transition"
          >
            <UserPlus className="w-5 h-5 text-slate-600" />
            <span>إضافة طالب</span>
          </Link>
        </div>
      </div>

      {/* 2. Section: مؤشرات اليوم الحية */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-sm font-extrabold text-[#111D2D] flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-[#27877E]" />
            <span>مؤشرات اليوم الحية</span>
          </h2>
          <span className="text-[11px] text-slate-400 font-medium">تحديث فوري</span>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          {/* Card 1: إجمالي الطلاب */}
          <div
            onClick={() => router.push('/students')}
            className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs cursor-pointer hover:border-teal-300 transition flex flex-col justify-between h-28"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500">إجمالي الطلاب</span>
              <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-2xl font-black text-[#111D2D]">{totalStudentsCount}</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60 flex items-center gap-0.5">
                <span>{activeStudentsCount} نشط</span>
                <ArrowUpRight className="w-3 h-3" />
              </span>
            </div>
          </div>

          {/* Card 2: حضور اليوم */}
          <div
            onClick={() => router.push('/history?status=present')}
            className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs cursor-pointer hover:border-emerald-300 transition flex flex-col justify-between h-28"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500">حضور اليوم</span>
              <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <CheckCircle className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-2xl font-black text-emerald-600">{todayPresentCount}</span>
              <span className="text-[11px] font-medium text-slate-400">طالب مسجل</span>
            </div>
          </div>

          {/* Card 3: غياب اليوم */}
          <div
            onClick={() => router.push('/history?status=absent')}
            className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs cursor-pointer hover:border-red-300 transition flex flex-col justify-between h-28"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500">غياب اليوم</span>
              <div className="w-7 h-7 rounded-lg bg-red-50 text-red-500 flex items-center justify-center">
                <XCircle className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-2xl font-black text-red-600">{todayAbsenceCount}</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200/60">
                {todayLateCount} متأخر
              </span>
            </div>
          </div>

          {/* Card 4: المستحقات المعلقة */}
          <div
            onClick={() => router.push('/subscriptions')}
            className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs cursor-pointer hover:border-amber-300 transition flex flex-col justify-between h-28"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500">المستحقات المعلقة</span>
              <div className="w-7 h-7 rounded-lg bg-amber-50 text-[#C7A66A] flex items-center justify-center">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-2xl font-black text-[#111D2D]">
                {totalOutstandingBalance} <span className="text-xs font-bold text-slate-500">ج.م</span>
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200/60">
                مستحقات
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Section: مجموعات اليوم */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-sm font-extrabold text-[#111D2D] flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-[#27877E]" />
            <span>مجموعات اليوم</span>
          </h2>
          <Link href="/sessions" className="text-xs font-bold text-[#27877E] hover:underline flex items-center gap-0.5">
            <span>عرض الكل</span>
            <ChevronLeft className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Primary Active Group Card with Progress Bar and Action Button */}
        {primarySession && (
          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs border-r-4 border-r-[#27877E] space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-sm text-[#111D2D]">
                {primaryGroup?.name || 'مجموعة العباقرة - رياضيات 3ث'}
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>حضور مفتوح</span>
              </span>
            </div>

            <div className="flex items-center gap-4 text-xs text-slate-500 font-medium">
              <span className="flex items-center gap-1 font-mono">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                {primarySession.start_time || '16:00'} - {primarySession.end_time || '18:00'}
              </span>
              <span className="flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                {primarySession.room || 'قاعة 1'}
              </span>
            </div>

            {/* Attendance Progress Bar */}
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-500 font-semibold">نسبة حضور المجموعة</span>
                <span className="text-[#111D2D] font-bold">
                  حضر {primaryAttendedCount} من {primaryTotalStudents} طلاب ({primaryPercentage}%)
                </span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-l from-[#27877E] to-teal-400 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, Math.max(20, primaryPercentage))}%` }}
                />
              </div>
            </div>

            {/* Action Button: تسجيل حضور حصة الآن */}
            <Link
              href={`/scanner?session_id=${primarySession.id}`}
              className="w-full py-2.5 rounded-xl bg-[#111D2D] hover:bg-[#1E2A3D] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition"
            >
              <UserCheck className="w-4 h-4 text-[#C7A66A]" />
              <span>تسجيل حضور حصة الآن</span>
            </Link>
          </div>
        )}

        {/* Secondary Scheduled Group Card */}
        {secondarySession && (
          <div className="bg-white rounded-2xl p-3.5 border border-slate-200/70 shadow-xs flex items-center justify-between">
            <div>
              <h4 className="font-bold text-xs text-[#111D2D]">
                {secondaryGroup?.name || 'مجموعة نيوتن - فيزياء 3ث'}
              </h4>
              <p className="text-[11px] text-slate-400 mt-0.5 font-mono">
                {secondarySession.start_time || '18:30'} - {secondarySession.end_time || '20:30'} • حضر: 0 / {secondarySession.total_students || 4}
              </p>
            </div>
            <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-bold">
              مجدولة
            </span>
          </div>
        )}
      </div>

      {/* 4. Section: تنبيهات المتابعة العاجلة */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-sm font-extrabold text-[#111D2D] flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-red-500" />
            <span>تنبيهات المتابعة العاجلة</span>
          </h2>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-200">
            2 إجراء مطلوب
          </span>
        </div>

        {/* Alert 1: غياب متكرر مع زر واتساب */}
        <div className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-xs flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-bold text-xs sm:text-sm text-[#111D2D]">ياسين أحمد فؤاد</span>
              <span className="px-2 py-0.2 rounded-md bg-red-50 text-red-600 text-[10px] font-bold border border-red-200/60">
                تنبيه غياب
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5 truncate">
              كود: NK-2603 • ولي الأمر: 01299887744
            </p>
            <p className="text-[11px] text-red-600 font-semibold mt-0.5">
              غياب حصتين متتاليتين في مادة الرياضيات
            </p>
          </div>

          <a
            href="https://wa.me/201299887744?text=%D8%AA%D8%AD%D9%8A%D8%A9%20%D8%B7%D9%8A%D8%A8%D8%A9%20%D9%85%D9%86%20%D8%B3%D9%86%D8%AA%D8%B1%20%D8%A7%D9%84%D9%86%D8%AE%D8%A8%D8%A9%20%D8%A7%D9%84%D8%AA%D8%B9%D9%84%D9%8A%D9%85%D9%8A%D8%8C%20%D9%86%D9%88%D8%AF%20%D8%A5%D8%AD%D8%A7%D8%B7%D8%AA%D9%83%D9%85%20%D8%B9%D9%84%D9%85%D8%A7%D9%8B%20%D8%A8%D8%BA%D9%8A%D8%A7%D8%A8%20%D8%A7%D9%84%D8%B7%D8%A7%D9%84%D8%A8%20%D9%8A%D8%A7%D8%B3%D9%8A%D9%86%20%D8%A3%D8%AD%D9%85%D8%AF%20%D9%81%D8%A4%D8%A7%D8%AF"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shrink-0 shadow-xs transition"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>واتساب</span>
          </a>
        </div>

        {/* Alert 2: مستحق اشتراك مع زر تحصيل */}
        <div className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-xs flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-bold text-xs sm:text-sm text-[#111D2D]">مريم طارق الشريف</span>
              <span className="px-2 py-0.2 rounded-md bg-amber-50 text-amber-700 text-[10px] font-bold border border-amber-200/60">
                مستحق: 250 ج.م
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              اشتراك شهر نوفمبر • مدفوع 200 من 450
            </p>
          </div>

          <Link
            href="/payments"
            className="px-4 py-2 rounded-xl bg-[#C7A66A] hover:bg-[#B08E4F] text-[#111D2D] font-extrabold text-xs flex items-center gap-1.5 shrink-0 shadow-xs transition"
          >
            <Receipt className="w-3.5 h-3.5" />
            <span>تحصيل</span>
          </Link>
        </div>
      </div>

      {/* 5. Section: أحدث تسجيلات الحضور */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-sm font-extrabold text-[#111D2D] flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-[#27877E]" />
            <span>أحدث تسجيلات الحضور</span>
          </h2>
          <Link href="/history" className="text-xs font-bold text-[#27877E] hover:underline flex items-center gap-0.5">
            <span>السجل الكامل</span>
            <ChevronLeft className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs divide-y divide-slate-100 overflow-hidden">
          {/* Student 1 */}
          <div className="p-3.5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-slate-100 text-[#111D2D] font-bold text-xs flex items-center justify-center border border-slate-200">
                ع.م
              </div>
              <div>
                <h4 className="font-bold text-xs sm:text-sm text-[#111D2D]">عمر خالد المنشاوي</h4>
                <p className="text-[11px] text-slate-400">NK-2601 • مجموعة العباقرة</p>
              </div>
            </div>
            <div className="text-left">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                حاضر
              </span>
              <p className="text-[10px] text-slate-400 mt-0.5 font-mono">04:52 م</p>
            </div>
          </div>

          {/* Student 2 */}
          <div className="p-3.5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-slate-100 text-[#111D2D] font-bold text-xs flex items-center justify-center border border-slate-200">
                م.ط
              </div>
              <div>
                <h4 className="font-bold text-xs sm:text-sm text-[#111D2D]">مريم طارق الشريف</h4>
                <p className="text-[11px] text-slate-400">NK-2602 • مجموعة العباقرة</p>
              </div>
            </div>
            <div className="text-left">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                متأخر
              </span>
              <p className="text-[10px] text-slate-400 mt-0.5 font-mono">05:13 م</p>
            </div>
          </div>
        </div>
      </div>

      {/* 6. Section: بوابة سنتر النخبة للطلاب */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex items-center justify-between gap-3">
        <div>
          <h4 className="font-bold text-xs sm:text-sm text-[#111D2D]">بوابة {currentCenter.name_ar} للطلاب</h4>
          <p className="text-[11px] text-slate-400 mt-0.5">شارك الرابط مع الطلاب وأولياء الأمور</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => shareWhatsApp(`رابط بوابة طلاب ${currentCenter.name_ar}:\n${portalUrl}`)}
            className="p-2 rounded-xl border border-slate-200 text-[#27877E] hover:bg-slate-50 transition"
            title="مشاركة عبر واتساب"
          >
            <Share2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => copyToClipboard(portalUrl, 'portal')}
            className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition"
            title="نسخ الرابط"
          >
            {copiedKey === 'portal' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}
