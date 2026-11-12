'use client';

// ====================================================================
// HADAR SaaS Platform — Dedicated Center Student Portal (/c/[slug]/portal)
// Developed by MADAAR Technologies
// ====================================================================

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  GraduationCap,
  QrCode,
  Calendar,
  CheckCircle,
  Clock,
  CreditCard,
  Phone,
  Search,
  Sparkles,
  LogOut,
  ArrowRight
} from 'lucide-react';
import { useData } from '@/lib/store/data-context';
import { Student } from '@/types/database';
import QRCode from 'qrcode';

export default function CenterDedicatedStudentPortal() {
  const params = useParams();
  const slug = params?.slug as string;
  const { allCenters, students, groups, sessions, attendance, subscriptions, payments } = useData();

  // Find center by slug
  const center = allCenters.find((c) => c.slug === slug) || allCenters[0];

  // Center-scoped students
  const centerStudents = students.filter((s) => s.center_id === center.id);

  // Authentication state for student portal
  const [loggedStudent, setLoggedStudent] = useState<Student | null>(null);
  const [identifierInput, setIdentifierInput] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  const handleStudentLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    const clean = identifierInput.trim().toLowerCase();

    const found = centerStudents.find(
      (s) =>
        s.student_code.toLowerCase() === clean ||
        s.parent_phone === clean ||
        (s.phone && s.phone === clean) ||
        s.qr_token.toLowerCase() === clean ||
        s.full_name.toLowerCase().includes(clean)
    );

    if (found) {
      setLoggedStudent(found);
    } else {
      setLoginError(`لم يتم العثور على طالب بهذا الكود أو الرقم في كشوفات (${center.name_ar})`);
    }
  };

  useEffect(() => {
    if (loggedStudent) {
      QRCode.toDataURL(loggedStudent.qr_token, {
        margin: 1,
        width: 250,
        color: { dark: '#111D2D', light: '#FFFFFF' }
      }).then(setQrDataUrl);
    }
  }, [loggedStudent]);

  // If student is not logged in, display Center Student Login form
  if (!loggedStudent) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
          <div className="inline-flex w-14 h-14 rounded-2xl bg-gradient-to-br from-[#27877E] to-[#164944] p-[2px] shadow-sm items-center justify-center mb-3">
            <div className="w-full h-full bg-[#111D2D] rounded-[12px] flex items-center justify-center">
              <GraduationCap className="w-7 h-7 text-[#27877E]" />
            </div>
          </div>

          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-teal-50 text-[#27877E] border border-teal-200">
            {center.name_ar}
          </span>
          <h1 className="text-2xl font-extrabold text-[#111D2D] mt-2">
            بوابة متابعة الطالب وولي الأمر
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            أدخل كود الطالب أو رقم ولي الأمر المسجل للاطلاع على كارت الـ QR وسجل الحضور
          </p>
        </div>

        <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-6 shadow-card rounded-2xl border border-slate-200 sm:px-10">
            {loginError && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
                {loginError}
              </div>
            )}

            <form onSubmit={handleStudentLogin} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  كود الطالب أو رقم هاتف ولي الأمر:
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={identifierInput}
                    onChange={(e) => setIdentifierInput(e.target.value)}
                    placeholder="مثال: NK-2601 أو 01099887766"
                    className="w-full pr-9 pl-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#27877E] font-mono font-bold text-slate-800"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-[#27877E] hover:bg-[#1F7068] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition"
              >
                <Search className="w-4 h-4" />
                <span>دخول وعرض بطاقة الطالب</span>
              </button>
            </form>

            {/* Quick Demo Student Button */}
            {centerStudents.length > 0 && (
              <div className="mt-6 pt-4 border-t border-slate-100 text-center">
                <p className="text-[11px] text-slate-400 mb-2 flex items-center justify-center gap-1">
                  <Sparkles className="w-3 h-3 text-[#C7A66A]" />
                  <span>طالب تجريبي لهذا السنتر:</span>
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setLoggedStudent(centerStudents[0]);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-teal-50 hover:bg-teal-100 text-[#27877E] font-bold text-xs transition border border-teal-200"
                >
                  الدخول المباشر كـ {centerStudents[0].full_name} ({centerStudents[0].student_code})
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Student Attendance Records for this Center
  const studentAttendance = attendance
    .filter((a) => a.student_id === loggedStudent.id)
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

  const studentSubs = subscriptions.filter((s) => s.student_id === loggedStudent.id);
  const totalBalanceDue = studentSubs.reduce((sum, s) => sum + s.remaining_balance, 0);

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#111D2D] pb-12">
      {/* Header */}
      <header className="bg-[#111D2D] text-white border-b border-[#1E2A3D] px-6 py-4 sticky top-0 z-30 shadow-md">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#27877E] flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base tracking-tight">{center.name_ar}</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#C7A66A] text-[#111D2D]">
                  بوابة الطالب
                </span>
              </div>
              <p className="text-[11px] text-slate-400">كود الطالب: {loggedStudent.student_code}</p>
            </div>
          </div>

          <button
            onClick={() => setLoggedStudent(null)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>خروج</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-5xl mx-auto px-4 mt-6 space-y-6">
        {/* Banner */}
        <div className="bg-gradient-to-r from-[#111D2D] to-[#1E2A3D] rounded-2xl p-6 text-white shadow-card flex flex-col md:flex-row items-center justify-between gap-6 border border-[#C7A66A]/20">
          <div className="flex items-center gap-4 text-center md:text-right">
            <div className="w-16 h-16 rounded-2xl bg-white/10 border-2 border-[#C7A66A] overflow-hidden flex items-center justify-center font-bold text-lg text-white">
              {loggedStudent.photo_url ? (
                <img src={loggedStudent.photo_url} alt="" className="w-full h-full object-cover" />
              ) : (
                loggedStudent.full_name.substring(0, 2)
              )}
            </div>
            <div>
              <h2 className="text-xl font-bold text-white mb-1">
                {loggedStudent.full_name}
              </h2>
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-300">
                <span className="font-mono font-bold text-[#C7A66A]">{loggedStudent.student_code}</span>
                <span>•</span>
                <span>{loggedStudent.grade}</span>
                <span>•</span>
                <span>ولي الأمر: {loggedStudent.parent_phone}</span>
              </div>
            </div>
          </div>

          <div className="bg-white/10 rounded-xl px-5 py-3 border border-white/10 text-center">
            <p className="text-[11px] text-slate-300 font-semibold">معدل التزام الحضور</p>
            <p className="text-2xl font-black text-[#27877E] mt-1">{attendanceRate}%</p>
          </div>
        </div>

        {/* Digital Card & Schedule Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Digital QR Card */}
          <div className="bg-white rounded-2xl p-6 border-2 border-[#111D2D] shadow-card text-center flex flex-col items-center justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 left-0 h-2 bg-gradient-to-r from-[#C7A66A] to-[#8C6F3B]"></div>

            <div className="w-full">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#C7A66A]/20 text-[#111D2D]">
                بطاقة الطالب الرقمية
              </span>
              <h3 className="text-base font-extrabold text-[#111D2D] mt-2 mb-1">
                {loggedStudent.full_name}
              </h3>
              <p className="font-mono text-xs font-bold text-[#27877E] mb-4">
                {loggedStudent.student_code}
              </p>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 inline-block shadow-inner">
                {qrDataUrl ? (
                  <img src={qrDataUrl} alt="QR Code" className="w-44 h-44 object-contain mx-auto" />
                ) : (
                  <div className="w-44 h-44 flex items-center justify-center text-xs text-slate-400">
                    جاري التحميل...
                  </div>
                )}
              </div>

              <p className="text-[11px] text-slate-500 mt-3">
                أظهر هذه الشاشة عند باب القاعة ليتم تسجيل حضورك فورياً.
              </p>
            </div>

            <div className="w-full mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
              <span>{center.name_ar}</span>
              <span>منظومة حَضَر</span>
            </div>
          </div>

          {/* Schedule & Financials (2 cols) */}
          <div className="md:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
              <h3 className="text-sm font-bold text-[#111D2D] flex items-center gap-2 mb-3">
                <Calendar className="w-4 h-4 text-[#27877E]" />
                المجموعات الدراسية
              </h3>
              <div className="space-y-3">
                {groups.filter((g) => g.center_id === center.id).map((grp) => (
                  <div
                    key={grp.id}
                    className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <p className="font-bold text-[#111D2D]">{grp.name}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        المعلم: {grp.teacher_name} • {grp.default_room}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
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
                <h3 className="text-sm font-bold text-[#111D2D] flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-[#C7A66A]" />
                  الموقف المالي للاشتراكات
                </h3>
                <span
                  className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                    totalBalanceDue === 0
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}
                >
                  {totalBalanceDue === 0 ? 'خالص السداد' : `متبقي: ${totalBalanceDue} ج.م`}
                </span>
              </div>

              <div className="divide-y divide-slate-100 text-xs">
                {studentSubs.map((sub) => (
                  <div key={sub.id} className="py-2.5 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-[#111D2D]">اشتراك شهر نوفمبر</p>
                      <p className="text-[10px] text-slate-400">
                        مسدد {sub.total_paid} من {sub.total_due} ج.م
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

        {/* Attendance History */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-[#111D2D] flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              سجل الحضور والغياب في {center.name_ar}
            </h3>
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
