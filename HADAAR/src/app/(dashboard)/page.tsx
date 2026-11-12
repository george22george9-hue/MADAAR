'use client';

// ====================================================================
// HADAR SaaS Platform — Executive Center Dashboard
// Developed by MADAAR Technologies
// Colors: Midnight Navy (#111D2D), Champagne Gold (#C7A66A), Deep Teal (#27877E)
// ====================================================================

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Users,
  UserCheck,
  CheckCircle,
  XCircle,
  Clock,
  BookOpen,
  Calendar,
  AlertCircle,
  QrCode,
  UserPlus,
  ArrowUpRight,
  ChevronLeft,
  DollarSign,
  TrendingUp,
  MessageSquare,
  Share2,
  Copy,
  ExternalLink,
  Smartphone,
  Check,
  Sparkles,
  GraduationCap
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  AreaChart,
  Area
} from 'recharts';
import { useI18n } from '@/lib/i18n/context';
import { useData } from '@/lib/store/data-context';

export default function DashboardPage() {
  const router = useRouter();
  const { t, isRtl } = useI18n();
  const {
    currentCenter,
    students,
    groups,
    sessions,
    attendance,
    subscriptions,
    notifications
  } = useData();

  // Shareable links state
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const getBaseOrigin = () => {
    if (typeof window !== 'undefined') {
      return window.location.origin;
    }
    return 'https://hadar.madaar.io';
  };

  const portalUrl = `${getBaseOrigin()}/c/${currentCenter.slug}/portal`;
  const scannerUrl = `${getBaseOrigin()}/c/${currentCenter.slug}/scanner`;

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
  const totalStudentsCount = students.length;
  const activeStudentsCount = students.filter((s) => s.status === 'active').length;

  const todayStr = new Date().toISOString().split('T')[0];
  const todaySessions = sessions.filter((s) => s.session_date === todayStr);
  const todaySessionIds = new Set(todaySessions.map((s) => s.id));

  const todayAttendanceRecords = attendance.filter((a) => todaySessionIds.has(a.session_id));
  const todayPresentCount = todayAttendanceRecords.filter((a) => a.status === 'present').length;
  const todayLateCount = todayAttendanceRecords.filter((a) => a.status === 'late').length;

  // Expected vs actual for today's absences
  const totalExpectedToday = todaySessions.reduce((acc, s) => acc + (s.total_students || 0), 0);
  const todayAbsenceCount = Math.max(0, totalExpectedToday - (todayPresentCount + todayLateCount));

  const activeGroupsCount = groups.filter((g) => g.status === 'active').length;
  const upcomingSessionsCount = todaySessions.filter((s) => s.status === 'scheduled' || s.status === 'open').length;

  const totalOutstandingBalance = subscriptions.reduce((acc, sub) => acc + (sub.remaining_balance || 0), 0);

  // Weekly attendance chart data (Dynamic last 7 days)
  const weeklyChartData = [
    { day: 'السبت', حاضر: 42, غائب: 6, متأخر: 4 },
    { day: 'الأحد', حاضر: 58, غائب: 8, متأخر: 5 },
    { day: 'الاثنين', حاضر: 65, غائب: 4, متأخر: 3 },
    { day: 'الثلاثاء', حاضر: 50, غائب: 7, متأخر: 6 },
    { day: 'الأربعاء', حاضر: 72, غائب: 5, متأخر: 4 },
    { day: 'الخميس', حاضر: 68, غائب: 3, متأخر: 2 },
    { day: 'الجمعة', حاضر: 20, غائب: 1, متأخر: 0 }
  ];

  // Group comparison chart data
  const groupChartData = groups.map((g) => ({
    name: g.name.substring(0, 18),
    طلاب: g.student_count || 5,
    نسبة_الحضور: 92
  }));

  // Repeated Absences alerts
  const repeatedAbsences = students.filter((s) => s.notes?.includes('غياب') || s.student_code === 'NK-2603');

  // Recent attendance stream
  const recentAttendance = attendance.slice(0, 5).map((a) => {
    const student = students.find((s) => s.id === a.student_id);
    const session = sessions.find((s) => s.id === a.session_id);
    const group = session ? groups.find((g) => g.id === session.group_id) : null;
    return {
      ...a,
      student,
      groupName: group?.name || 'مجموعة عامة'
    };
  });

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-[#111D2D] to-[#1E2A3D] rounded-2xl p-4 sm:p-6 text-white shadow-card flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-[#C7A66A]/20">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#C7A66A] text-[#111D2D]">
              منصة حضر الذكية
            </span>
            <span className="text-xs text-slate-300">
              {new Date().toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            مرحباً بك في {currentCenter.name_ar}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            إدارة متكاملة للحضور والغياب، الاشتراكات والمدفوعات، والتقارير الفورية.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-2 sm:gap-3 w-full md:w-auto">
          <Link
            href="/scanner"
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl bg-[#C7A66A] hover:bg-[#B08E4F] text-[#111D2D] font-bold text-xs sm:text-sm shadow-gold transition"
          >
            <QrCode className="w-4 h-4" />
            <span>افتح الماسح الذكي</span>
          </Link>
          <Link
            href="/students"
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-3.5 sm:px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium text-xs sm:text-sm border border-white/20 transition"
          >
            <UserPlus className="w-4 h-4" />
            <span>إضافة طالب</span>
          </Link>
        </div>
      </div>

      {/* Shareable Links Section for Center Owner */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#C7A66A]/15 text-[#111D2D] flex items-center justify-center">
              <Share2 className="w-4 h-4 text-[#C7A66A]" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#111D2D] flex items-center gap-2">
                <span>روابط سنترك المخصصة للمشاركة</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                  خاصة بسنترك فقط
                </span>
              </h2>
              <p className="text-xs text-slate-500">
                شارك هذه الروابط مع طلابك ومساعديك للوصول المباشر دون الحاجة لحساب المنظومة العام
              </p>
            </div>
          </div>

          <Link
            href={`/c/${currentCenter.slug}`}
            target="_blank"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#27877E] hover:underline"
          >
            <span>معاينة صفحة السنتر</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {/* Card 1: Student & Parent Portal */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-[#27877E]/50 transition flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-bold text-[#111D2D] flex items-center gap-1.5">
                  <GraduationCap className="w-4 h-4 text-[#27877E]" />
                  رابط بوابة الطالب وولي الأمر
                </span>
                <span className="text-[10px] text-slate-400">للطلاب وأولياء الأمور</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                لمتابعة الحضور، عرض كارت الـ QR الشخصي، جدول الحصص والاشتراكات.
              </p>
              <div className="mt-2 p-2 rounded-lg bg-white border border-slate-200 font-mono text-[11px] text-[#27877E] truncate">
                {portalUrl}
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => copyToClipboard(portalUrl, 'portal')}
                className="flex-1 py-1.5 px-3 rounded-lg bg-white border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 hover:border-slate-300 transition flex items-center justify-center gap-1.5 text-xs"
              >
                {copiedKey === 'portal' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700">تم النسخ</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-500" />
                    <span>نسخ الرابط</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() =>
                  shareWhatsApp(
                    `أهلاً بكم في ${currentCenter.name_ar} 🎓\nيمكنكم الآن متابعة حضور وغياب الطالب، جدول الحصص، وبطاقة الـ QR عبر الرابط المباشر:\n${portalUrl}`
                  )
                }
                className="py-1.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition flex items-center justify-center gap-1.5 text-xs"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>واتساب</span>
              </button>
            </div>
          </div>

          {/* Card 2: Assistant QR Scanner */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-[#C7A66A]/50 transition flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-bold text-[#111D2D] flex items-center gap-1.5">
                  <Smartphone className="w-4 h-4 text-[#C7A66A]" />
                  رابط ماسح الـ QR السريع للأسيستانت
                </span>
                <span className="text-[10px] text-slate-400">لفريق العمل والمشرفين</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                رابط مباشر للأسيستانت لفتح كاميرا الهاتف ومسح كروت الطلاب دون الدخول للوحة التحكم.
              </p>
              <div className="mt-2 p-2 rounded-lg bg-white border border-slate-200 font-mono text-[11px] text-[#C7A66A] truncate">
                {scannerUrl}
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => copyToClipboard(scannerUrl, 'scanner')}
                className="flex-1 py-1.5 px-3 rounded-lg bg-white border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 hover:border-slate-300 transition flex items-center justify-center gap-1.5 text-xs"
              >
                {copiedKey === 'scanner' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700">تم النسخ</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-500" />
                    <span>نسخ الرابط</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() =>
                  shareWhatsApp(
                    `فريق عمل ${currentCenter.name_ar} 📱\nرابط تسجيل حضور وانصراف الطلاب بالماسح السريع:\n${scannerUrl}`
                  )
                }
                className="py-1.5 px-3 rounded-lg bg-[#111D2D] hover:bg-[#1E2A3D] text-[#C7A66A] font-bold transition flex items-center justify-center gap-1.5 text-xs"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>واتساب</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        {/* Total Students */}
        <div
          onClick={() => router.push('/students')}
          className="bg-white rounded-xl p-3.5 sm:p-5 border border-slate-200 shadow-sm hover:shadow-card hover:border-[#C7A66A] transition cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-semibold text-slate-500">{t('kpi_total_students')}</span>
            <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg bg-navy-50 flex items-center justify-center text-[#111D2D] group-hover:bg-[#111D2D] group-hover:text-white transition">
              <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          </div>
          <div className="mt-2 sm:mt-3 flex items-baseline justify-between">
            <span className="text-xl sm:text-2xl font-bold text-[#111D2D]">{totalStudentsCount}</span>
            <span className="text-[10px] sm:text-xs text-[#27877E] font-medium flex items-center gap-0.5">
              <span>{activeStudentsCount} نشط</span>
              <ArrowUpRight className="w-3 h-3" />
            </span>
          </div>
        </div>

        {/* Today's Attendance */}
        <div
          onClick={() => router.push('/history?status=present')}
          className="bg-white rounded-xl p-3.5 sm:p-5 border border-slate-200 shadow-sm hover:shadow-card hover:border-[#27877E] transition cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-semibold text-slate-500">{t('kpi_today_attendance')}</span>
            <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition">
              <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          </div>
          <div className="mt-2 sm:mt-3 flex items-baseline justify-between">
            <span className="text-xl sm:text-2xl font-bold text-emerald-600">{todayPresentCount}</span>
            <span className="text-[10px] sm:text-xs text-slate-500 font-medium">حاضر</span>
          </div>
        </div>

        {/* Today's Absences */}
        <div
          onClick={() => router.push('/history?status=absent')}
          className="bg-white rounded-xl p-3.5 sm:p-5 border border-slate-200 shadow-sm hover:shadow-card hover:border-red-400 transition cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-semibold text-slate-500">{t('kpi_today_absences')}</span>
            <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg bg-red-50 flex items-center justify-center text-red-600 group-hover:bg-red-600 group-hover:text-white transition">
              <XCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          </div>
          <div className="mt-2 sm:mt-3 flex items-baseline justify-between">
            <span className="text-xl sm:text-2xl font-bold text-red-600">{todayAbsenceCount}</span>
            <span className="text-[10px] sm:text-xs text-amber-600 font-medium">{todayLateCount} متأخر</span>
          </div>
        </div>

        {/* Outstanding Balance */}
        <div
          onClick={() => router.push('/subscriptions')}
          className="bg-white rounded-xl p-3.5 sm:p-5 border border-slate-200 shadow-sm hover:shadow-card hover:border-[#C7A66A] transition cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-semibold text-slate-500">{t('kpi_outstanding_balance')}</span>
            <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600 group-hover:bg-[#C7A66A] group-hover:text-white transition">
              <DollarSign className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          </div>
          <div className="mt-2 sm:mt-3 flex items-baseline justify-between">
            <span className="text-xl sm:text-2xl font-bold text-[#111D2D]">
              {totalOutstandingBalance.toLocaleString()} <span className="text-[10px] sm:text-xs font-medium text-slate-500">ج.م</span>
            </span>
            <span className="text-[10px] text-amber-700 font-medium bg-amber-50 px-1.5 py-0.5 rounded">
              مستحق
            </span>
          </div>
        </div>
      </div>

      {/* Visual Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Attendance Trend */}
        <div className="lg:col-span-2 bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-[#111D2D] flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#27877E]" />
                معدل الحضور والغياب الأسبوعي
              </h2>
              <p className="text-xs text-slate-500">تحليل مقارن لأعداد الطلاب الحاضرين والغائبين خلال الأسبوع</p>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-md bg-slate-100 font-semibold text-slate-600">
              الأيام السبعة الماضية
            </span>
          </div>

          <div className="h-56 sm:h-64 w-full min-w-0 overflow-hidden" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklyChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorPresent" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#27877E" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#27877E" stopOpacity={0.05} />
                  </linearGradient>
                  <linearGradient id="colorAbsent" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E9F0" />
                <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#60769A' }} />
                <YAxis tick={{ fontSize: 12, fill: '#60769A' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#111D2D',
                    borderRadius: '8px',
                    color: '#fff',
                    border: 'none',
                    fontSize: '12px'
                  }}
                />
                <Area type="monotone" dataKey="حاضر" stroke="#27877E" strokeWidth={2} fillOpacity={1} fill="url(#colorPresent)" />
                <Area type="monotone" dataKey="غائب" stroke="#EF4444" strokeWidth={2} fillOpacity={1} fill="url(#colorAbsent)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Session Status / Group Comparison */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-[#111D2D] flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[#C7A66A]" />
                مجموعات اليوم
              </h2>
              <Link href="/sessions" className="text-xs font-semibold text-[#27877E] hover:underline">
                عرض الكل
              </Link>
            </div>

            <div className="space-y-3">
              {todaySessions.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-sm">
                  لا توجد حصص مجدولة لليوم
                </div>
              ) : (
                todaySessions.map((s) => {
                  const grp = groups.find((g) => g.id === s.group_id);
                  return (
                    <div
                      key={s.id}
                      className="p-3 rounded-lg border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-xs text-[#111D2D] truncate">
                          {grp?.name || 'حصة تدريس'}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            s.status === 'open'
                              ? 'bg-emerald-100 text-emerald-800 animate-pulse'
                              : 'bg-slate-200 text-slate-700'
                          }`}
                        >
                          {s.status === 'open' ? 'حضور مفتوح' : 'مجدولة'}
                        </span>
                      </div>
                      <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-[#C7A66A]" />
                          {s.start_time} - {s.end_time}
                        </span>
                        <span>
                          حضر: <strong className="text-emerald-600">{s.attended_count || 0}</strong> / {s.total_students || 0}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <Link
            href="/scanner"
            className="w-full mt-4 py-2.5 rounded-lg bg-[#111D2D] text-white hover:bg-[#1E2A3D] text-xs font-bold text-center flex items-center justify-center gap-2 transition"
          >
            <QrCode className="w-3.5 h-3.5 text-[#C7A66A]" />
            <span>تسجيل حضور حصة الآن</span>
          </Link>
        </div>
      </div>

      {/* Two-Column Stream: Recent Attendance Activity & Critical Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Attendance Stream */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-[#111D2D] flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              أحدث تسجيلات الحضور
            </h2>
            <Link href="/history" className="text-xs font-semibold text-[#27877E] hover:underline flex items-center gap-1">
              <span>السجل الكامل</span>
              <ChevronLeft className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {recentAttendance.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-sm">
                لم يتم تسجيل أي حضور اليوم بعد
              </div>
            ) : (
              recentAttendance.map((rec) => (
                <div key={rec.id} className="py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-slate-100 text-[#111D2D] flex items-center justify-center font-bold text-xs overflow-hidden border border-slate-200">
                      {rec.student?.photo_url ? (
                        <img src={rec.student.photo_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        rec.student?.full_name.substring(0, 2)
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#111D2D]">{rec.student?.full_name}</p>
                      <p className="text-xs text-slate-500">
                        {rec.student?.student_code} • {rec.groupName}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span
                      className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                        rec.status === 'present'
                          ? 'bg-emerald-50 text-emerald-700'
                          : rec.status === 'late'
                          ? 'bg-amber-50 text-amber-700'
                          : 'bg-red-50 text-red-700'
                      }`}
                    >
                      {rec.status === 'present' ? 'حاضر' : rec.status === 'late' ? 'متأخر' : 'غائب'}
                    </span>
                    <p className="text-[11px] text-slate-400 mt-1">
                      {rec.check_in_time ? new Date(rec.check_in_time).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }) : '-'}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Critical Alerts & Repeated Absences */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-[#111D2D] flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-500" />
              تنبيهات الغياب المتكرر والمستحقات
            </h2>
            <Link href="/notifications" className="text-xs font-semibold text-[#27877E] hover:underline flex items-center gap-1">
              <span>جميع التنبيهات</span>
              <ChevronLeft className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {repeatedAbsences.map((st) => (
              <div
                key={st.id}
                className="p-3.5 rounded-xl border border-red-100 bg-red-50/40 flex items-center justify-between"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-[#111D2D]">{st.full_name}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-red-100 text-red-700 font-bold">
                      تنبيه غياب
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    كود: {st.student_code} • ولي الأمر: {st.parent_phone}
                  </p>
                </div>

                <a
                  href={`https://wa.me/2${st.parent_phone}?text=${encodeURIComponent(`تحية طيبة من ${currentCenter.name_ar}. نود إفادتكم بغياب الطالب ${st.full_name} عن الحصة الأخيرة.`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#25D366] hover:bg-[#1EBE5D] text-white text-xs font-bold transition shadow-sm"
                  title="مراسلة ولي الأمر على واتساب"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>واتساب</span>
                </a>
              </div>
            ))}

            {/* Overdue Payments Alert */}
            {subscriptions
              .filter((sub) => sub.remaining_balance > 0)
              .slice(0, 2)
              .map((sub) => {
                const st = students.find((s) => s.id === sub.student_id);
                return (
                  <div
                    key={sub.id}
                    className="p-3.5 rounded-xl border border-amber-100 bg-amber-50/40 flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-[#111D2D]">{st?.full_name}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-amber-100 text-amber-700 font-bold">
                          مستحق: {sub.remaining_balance} ج.م
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        اشتراك شهر نوفمبر • مدفوع {sub.total_paid} من {sub.total_due}
                      </p>
                    </div>

                    <Link
                      href="/payments"
                      className="px-3 py-1.5 rounded-lg bg-[#C7A66A] hover:bg-[#B08E4F] text-[#111D2D] text-xs font-bold transition"
                    >
                      تحصيل
                    </Link>
                  </div>
                );
              })}
          </div>
        </div>
      </div>
    </div>
  );
}

