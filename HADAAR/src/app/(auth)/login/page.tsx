'use client';

// ====================================================================
// HADAR SaaS Platform — Unified Authentication & Role Login
// Developed by MADAAR Technologies
// Colors: Midnight Navy (#111D2D), Champagne Gold (#C7A66A), Deep Teal (#27877E)
// ====================================================================

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  GraduationCap,
  ShieldCheck,
  Building2,
  Users,
  Lock,
  Mail,
  Phone,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  QrCode,
  LogIn
} from 'lucide-react';
import { useI18n } from '@/lib/i18n/context';
import { useData } from '@/lib/store/data-context';

export default function LoginPage() {
  const router = useRouter();
  const { t, isRtl } = useI18n();
  const { loginUser, loginStudent, currentCenter, switchUserRole } = useData();

  // Login Mode: 'staff' (Center Owner/Assistant), 'super_admin' (Platform Owner), 'student' (Student/Parent)
  const [accountType, setAccountType] = useState<'staff' | 'super_admin' | 'student'>('staff');

  // Staff Form
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Student Form
  const [studentIdentifier, setStudentIdentifier] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Handle Staff / Admin Submit
  const handleStaffLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (accountType === 'super_admin') {
      loginUser(email || 'admin@madaar.io', 'super_admin');
      router.push('/super-admin');
    } else {
      loginUser(email || 'owner@alnokhba.com', 'owner');
      router.push('/');
    }
  };

  // Handle Student Submit
  const handleStudentLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!studentIdentifier.trim()) {
      setErrorMsg('يرجى إدخال كود الطالب أو رقم هاتف ولي الأمر');
      return;
    }

    const student = loginStudent(studentIdentifier);
    if (student) {
      router.push('/portal');
    } else {
      setErrorMsg('لم يتم العثور على طالب بهذا الكود أو الرقم المسجل');
    }
  };

  // Quick Demo Access Logins
  const handleQuickLogin = (role: 'super_admin' | 'owner' | 'assistant' | 'student') => {
    setErrorMsg(null);
    if (role === 'super_admin') {
      loginUser('admin@madaar.io', 'super_admin');
      router.push('/super-admin');
    } else if (role === 'owner') {
      loginUser('owner@alnokhba.com', 'owner');
      router.push('/');
    } else if (role === 'assistant') {
      loginUser('assistant@alnokhba.com', 'assistant');
      router.push('/scanner');
    } else if (role === 'student') {
      loginStudent('NK-2601');
      router.push('/portal');
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      {/* Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex w-16 h-16 rounded-2xl bg-gradient-to-br from-[#C7A66A] to-[#8C6F3B] p-[2px] shadow-gold items-center justify-center mb-4">
          <div className="w-full h-full bg-[#111D2D] rounded-[14px] flex items-center justify-center">
            <GraduationCap className="w-8 h-8 text-[#C7A66A]" />
          </div>
        </div>

        <div className="flex items-center justify-center gap-2 mb-1">
          <span className="text-3xl font-extrabold tracking-tight text-[#111D2D]">HADAR</span>
          <span className="text-2xl font-bold text-[#C7A66A]">حضر</span>
        </div>
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">
          MADAAR Technologies
        </p>
        <p className="text-sm text-slate-600 mt-2 font-medium">
          حضور أذكى. إدارة أسهل.
        </p>
      </div>

      {/* Main Login Card */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-card rounded-2xl border border-slate-200 sm:px-10">
          {/* Account Type Tabs */}
          <div className="flex p-1 bg-slate-100 rounded-xl mb-6">
            <button
              type="button"
              onClick={() => {
                setAccountType('staff');
                setErrorMsg(null);
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${
                accountType === 'staff'
                  ? 'bg-[#111D2D] text-white shadow-sm'
                  : 'text-slate-600 hover:text-[#111D2D]'
              }`}
            >
              إدارة السنتر
            </button>

            <button
              type="button"
              onClick={() => {
                setAccountType('student');
                setErrorMsg(null);
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${
                accountType === 'student'
                  ? 'bg-[#27877E] text-white shadow-sm'
                  : 'text-slate-600 hover:text-[#111D2D]'
              }`}
            >
              بوابة الطالب
            </button>

            <button
              type="button"
              onClick={() => {
                setAccountType('super_admin');
                setErrorMsg(null);
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${
                accountType === 'super_admin'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-[#111D2D]'
              }`}
            >
              سوبر أدمن
            </button>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
              {errorMsg}
            </div>
          )}

          {/* Form 1 & 2: Staff / Super Admin */}
          {(accountType === 'staff' || accountType === 'super_admin') && (
            <form onSubmit={handleStaffLogin} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  البريد الإلكتروني المسجل:
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={
                      accountType === 'super_admin'
                        ? 'admin@madaar.io'
                        : 'owner@alnokhba.com'
                    }
                    className="w-full pr-9 pl-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#C7A66A]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  كلمة المرور:
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pr-9 pl-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#C7A66A]"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className={`w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-md transition ${
                    accountType === 'super_admin'
                      ? 'bg-amber-600 hover:bg-amber-700 text-white'
                      : 'bg-[#C7A66A] hover:bg-[#B08E4F] text-[#111D2D]'
                  }`}
                >
                  <LogIn className="w-4 h-4" />
                  <span>
                    {accountType === 'super_admin'
                      ? 'تسجيل الدخول كـ سوبر أدمن (مدار)'
                      : 'تسجيل الدخول إلى السنتر'}
                  </span>
                </button>
              </div>
            </form>
          )}

          {/* Form 3: Student & Guardian Portal */}
          {accountType === 'student' && (
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
                    value={studentIdentifier}
                    onChange={(e) => setStudentIdentifier(e.target.value)}
                    placeholder="مثال: NK-2601 أو 01099887766"
                    className="w-full pr-9 pl-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#27877E] font-mono"
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  يمكن لولي الأمر أو الطالب المتابعة بكود الطالب المسجل على الكارنيه.
                </p>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-[#27877E] hover:bg-[#1F7068] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition"
                >
                  <GraduationCap className="w-4 h-4" />
                  <span>دخول بوابة متابعة الطالب</span>
                </button>
              </div>
            </form>
          )}

          {/* Quick Demo Access Bar */}
          <div className="mt-8 pt-6 border-t border-slate-200">
            <p className="text-[11px] font-bold text-slate-400 mb-3 text-center flex items-center justify-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-[#C7A66A]" />
              تجربة سريعة بنقرة واحدة (One-Click Demo Access):
            </p>

            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <button
                type="button"
                onClick={() => handleQuickLogin('super_admin')}
                className="p-2 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 font-bold text-right transition"
              >
                👑 سوبر أدمن المنصة
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('owner')}
                className="p-2 rounded-lg bg-[#C7A66A]/15 hover:bg-[#C7A66A]/25 text-[#111D2D] border border-[#C7A66A]/30 font-bold text-right transition"
              >
                🏢 مدير سنتر النخبة
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('assistant')}
                className="p-2 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-900 border border-teal-200 font-bold text-right transition"
              >
                📱 مساعد الحضور (QR)
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('student')}
                className="p-2 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 font-bold text-right transition"
              >
                🎓 بوابة الطالب (عمر)
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

