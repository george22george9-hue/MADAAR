'use client';

// ====================================================================
// HADAR SaaS Platform — Student & Guardian Self-Service Portal
// Developed by MADAAR Technologies
// ====================================================================

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  GraduationCap,
  QrCode,
  Calendar,
  CheckCircle,
  Clock,
  XCircle,
  CreditCard,
  Receipt,
  Download,
  LogOut,
  Sparkles,
  Phone,
  User,
  ArrowRight
} from 'lucide-react';
import { useI18n } from '@/lib/i18n/context';
import { useData } from '@/lib/store/data-context';
import QRCode from 'qrcode';

export default function StudentPortalPage() {
  const router = useRouter();
  const { t } = useI18n();
  const {
    currentStudent,
    currentCenter,
    groups,
    sessions,
    attendance,
    subscriptions,
    payments,
    logout
  } = useData();

  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  // If no student is selected, fallback to first student
  const student = currentStudent;

  useEffect(() => {
    if (student) {
      QRCode.toDataURL(student.qr_token, {
        margin: 1,
        width: 250,
        color: { dark: '#111D2D', light: '#FFFFFF' }
      }).then(setQrDataUrl);
    }
  }, [student]);

  if (!student) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex flex-col items-center justify-center p-4 text-center">
        <GraduationCap className="w-12 h-12 text-[#C7A66A] mb-3" />
        <h1 className="text-xl font-bold text-[#111D2D] mb-2">لم يتم تسجيل الدخول كطالب</h1>
        <p className="text-xs text-slate-500 mb-4">يرجى تسجيل الدخول عبر كود الطالب أو رقم الموبايل</p>
        <Link
          href="/login"
          className="px-5 py-2.5 rounded-xl bg-[#111D2D] text-white text-xs font-bold hover:bg-[#1E2A3D]"
        >
          الانتقال لصفحة الدخول
        </Link>
      </div>
    );
  }

  // Student Attendance Records
  const studentAttendance = attendance
    .filter((a) => a.student_id === student.id)
    .map((a) => {
      const session = sessions.find((s) => s.id === a.session_id);
      const group = session ? groups.find((g) => g.id === session.group_id) : null;
      return { ...a, session, group };
    });

  const presentCount = studentAttendance.filter((a) => a.status === 'present').length;
  const lateCount = studentAttendance.filter((a) => a.status === 'late').length;
  const attendanceRate = studentAttendance.length > 0
    ? Math.round(((presentCount + lateCount) / studentAttendance.length) * 100)
    : 100;

  // Student Subscriptions & Payments
  const studentSubs = subscriptions.filter((s) => s.student_id === student.id);
  const studentPayments = payments.filter((p) => p.student_id === student.id);
  const totalBalanceDue = studentSubs.reduce((sum, s) => sum + s.remaining_balance, 0);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#111D2D] pb-12">
      {/* Top Navbar */}
      <header className="bg-[#111D2D] text-white border-b border-[#1E2A3D] px-6 py-4 sticky top-0 z-30 shadow-md">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#C7A66A] to-[#8C6F3B] p-[2px] flex items-center justify-center">
              <div className="w-full h-full bg-[#111D2D] rounded-[10px] flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-[#C7A66A]" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base tracking-tight">بوابة الطالب الذكية</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#C7A66A] text-[#111D2D]">
                  {currentCenter.name_ar}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">منظومة حضر — متابعة الحضور والاشتراكات</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-xs text-slate-300 hover:text-white font-semibold hidden sm:inline"
            >
              العودة للوحة الإدارة
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>تسجيل خروج</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-5xl mx-auto px-4 mt-6 space-y-6">
        {/* Welcome & Student Profile Strip */}
        <div className="bg-gradient-to-r from-[#111D2D] to-[#1E2A3D] rounded-2xl p-6 text-white shadow-card flex flex-col md:flex-row items-center justify-between gap-6 border border-[#C7A66A]/20">
          <div className="flex items-center gap-4 text-center md:text-right">
            <div className="w-16 h-16 rounded-2xl bg-white/10 border-2 border-[#C7A66A] overflow-hidden flex items-center justify-center font-bold text-lg text-white">
              {student.photo_url ? (
                <img src={student.photo_url} alt="" className="w-full h-full object-cover" />
              ) : (
                student.full_name.substring(0, 2)
              )}
            </div>
            <div>
              <h1 className="text-xl font-bold text-white mb-1">
                مرحباً، {student.full_name}
              </h1>
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-300">
                <span className="font-mono font-bold text-[#C7A66A]">كود: {student.student_code}</span>
                <span>•</span>
                <span>{student.grade}</span>
                <span>•</span>
                <span>ولي الأمر: {student.parent_phone}</span>
              </div>
            </div>
          </div>

          {/* Quick Commitment Rate */}
          <div className="bg-white/10 rounded-xl px-5 py-3 border border-white/10 text-center">
            <p className="text-[11px] text-slate-300 font-semibold">معدل التزام الحضور</p>
            <p className="text-2xl font-black text-[#27877E] mt-1">{attendanceRate}%</p>
          </div>
        </div>

        {/* Two-Column Grid: Digital Card & Schedule */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Digital QR Card (1 col) */}
          <div className="bg-white rounded-2xl p-6 border-2 border-[#111D2D] shadow-card text-center flex flex-col items-center justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 left-0 h-2 bg-gradient-to-r from-[#C7A66A] to-[#8C6F3B]"></div>

            <div className="w-full">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#C7A66A]/20 text-[#111D2D]">
                بطاقتك الرقمية للحضور
              </span>
              <h2 className="text-base font-extrabold text-[#111D2D] mt-2 mb-1">
                {student.full_name}
              </h2>
              <p className="font-mono text-xs font-bold text-[#27877E] mb-4">
                {student.student_code}
              </p>

              {/* QR Code Canvas / Image */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 inline-block shadow-inner">
                {qrDataUrl ? (
                  <img src={qrDataUrl} alt="QR Code" className="w-44 h-44 object-contain mx-auto" />
                ) : (
                  <div className="w-44 h-44 flex items-center justify-center text-xs text-slate-400">
                    جاري توليد الكود...
                  </div>
                )}
              </div>

              <p className="text-[11px] text-slate-500 mt-3 leading-relaxed">
                أظهر هذه الشاشة لمساعد الحضور عند باب القاعة ليتم مسحها مباشرة من هاتفك.
              </p>
            </div>

            <div className="w-full mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
              <span>{currentCenter.name_ar}</span>
              <span>منظومة حضر الذكية</span>
            </div>
          </div>

          {/* Enrolled Groups & Schedule (2 cols) */}
          <div className="md:col-span-2 space-y-6">
            {/* Groups */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
              <h2 className="text-sm font-bold text-[#111D2D] flex items-center gap-2 mb-3">
                <Calendar className="w-4 h-4 text-[#27877E]" />
                المجموعات الدراسية المشترك بها
              </h2>

              <div className="space-y-3">
                {groups.map((grp) => (
                  <div
                    key={grp.id}
                    className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div>
                      <p className="font-bold text-xs text-[#111D2D]">{grp.name}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        المعلم: {grp.teacher_name} • {grp.default_room}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 text-xs">
                      {grp.schedule_config?.map((sched, idx) => (
                        <span key={idx} className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 font-semibold font-mono">
                          {sched.day_ar || sched.day} ({sched.start_time})
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Financial Overview */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-bold text-[#111D2D] flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-[#C7A66A]" />
                  الموقف المالي والاشتراكات
                </h2>
                <span
                  className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                    totalBalanceDue === 0
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}
                >
                  {totalBalanceDue === 0 ? 'خالص السداد بالكامل' : `متبقي: ${totalBalanceDue} ج.م`}
                </span>
              </div>

              <div className="divide-y divide-slate-100 text-xs">
                {studentSubs.map((sub) => (
                  <div key={sub.id} className="py-2.5 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-[#111D2D]">اشتراك شهر نوفمبر 2026</p>
                      <p className="text-[10px] text-slate-400">
                        سدد: {sub.total_paid} ج.م من {sub.total_due} ج.م
                      </p>
                    </div>
                    <span
                      className={`font-bold ${
                        sub.remaining_balance === 0 ? 'text-emerald-600' : 'text-amber-600'
                      }`}
                    >
                      {sub.remaining_balance === 0 ? 'مدفوع' : `متبقي ${sub.remaining_balance} ج.م`}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Personal Attendance History */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-[#111D2D] flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              سجل الحضور والغياب الشخصي
            </h2>
            <div className="flex items-center gap-3 text-xs font-semibold">
              <span className="text-emerald-700">حاضر: {presentCount}</span>
              <span className="text-amber-700">متأخر: {lateCount}</span>
            </div>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {studentAttendance.length === 0 ? (
              <p className="text-center py-6 text-slate-400">
                لم يتم تسجيل أي حضور حتى الآن
              </p>
            ) : (
              studentAttendance.map((rec) => (
                <div key={rec.id} className="py-3 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-[#111D2D]">
                      {rec.session?.title || rec.group?.name || 'حصة تدريسية'}
                    </p>
                    <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                      {rec.session?.session_date} • {rec.check_in_time ? new Date(rec.check_in_time).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }) : '-'}
                    </p>
                  </div>

                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      rec.status === 'present'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : rec.status === 'late'
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : 'bg-red-50 text-red-700 border border-red-200'
                    }`}
                  >
                    {rec.status === 'present' ? 'حاضر في الموعد' : rec.status === 'late' ? 'حضور متأخر' : 'غائب'}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

