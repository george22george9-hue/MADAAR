'use client';

// ====================================================================
// HADAR SaaS Platform — Unified Authentication
// Developed by MADAAR Technologies
// Colors: Midnight Navy (#111D2D), Champagne Gold (#C7A66A), Deep Teal (#27877E)
// Developer WhatsApp: +201202074649
// ====================================================================

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  GraduationCap,
  Building2,
  Users,
  Lock,
  Mail,
  Phone,
  ArrowRight,
  Sparkles,
  Smartphone,
  LogIn,
  ChevronDown,
  ChevronUp,
  MessageCircle,
  ExternalLink,
  ShieldAlert
} from 'lucide-react';
import { useI18n } from '@/lib/i18n/context';
import { useData } from '@/lib/store/data-context';

export default function LoginPage() {
  const router = useRouter();
  const { t, isRtl } = useI18n();
  const { loginUser, loginStudent, currentCenter } = useData();

  // Roles visible to public / clients:
  // 1. 'owner' (مدير السنتر)
  // 2. 'assistant' (المساعد / الأسيستانت)
  // 3. 'student' (بوابة الطالب وولي الأمر)
  const [accountType, setAccountType] = useState<'owner' | 'assistant' | 'student'>('owner');

  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [studentIdentifier, setStudentIdentifier] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Demo Modal / Collapsible State
  const [showDemoModal, setShowDemoModal] = useState(false);

  // Developer WhatsApp
  const developerWhatsappNumber = '201202074649';
  const whatsappUrl = `https://wa.me/${developerWhatsappNumber}?text=${encodeURIComponent(
    'مرحباً، أود التواصل بخصوص منصة حَضَر (HADAR) من مدار للتقنية.'
  )}`;

  // Handle Center Owner & Assistant Submit
  const handleStaffLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!password || password.length < 4) {
      setErrorMsg('يرجى إدخال كلمة المرور الصحيحة لحسابك');
      return;
    }

    if (accountType === 'owner') {
      loginUser(email || 'owner@alnokhba.com', 'owner');
      router.push('/');
    } else if (accountType === 'assistant') {
      loginUser(email || 'assistant@alnokhba.com', 'assistant');
      router.push('/scanner');
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

    const student = loginStudent(studentIdentifier.trim());
    if (student) {
      router.push('/portal');
    } else {
      setErrorMsg('لم يتم العثور على طالب بهذا الكود أو الرقم المسجل');
    }
  };

  // Dedicated Demo Logins (For pitching/demo preview only — strictly center/assistant/student)
  const handleLaunchDemo = (role: 'owner' | 'assistant' | 'student') => {
    setErrorMsg(null);
    setShowDemoModal(false);

    if (role === 'owner') {
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
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col justify-between py-10 px-4 sm:px-6 lg:px-8 relative">
      {/* Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex w-16 h-16 rounded-2xl bg-gradient-to-br from-[#C7A66A] to-[#8C6F3B] p-[2px] shadow-gold items-center justify-center mb-3">
          <div className="w-full h-full bg-[#111D2D] rounded-[14px] flex items-center justify-center">
            <GraduationCap className="w-8 h-8 text-[#C7A66A]" />
          </div>
        </div>

        <div className="flex items-center justify-center gap-2 mb-0.5">
          <span className="text-3xl font-extrabold tracking-tight text-[#111D2D]">HADAR</span>
          <span className="text-2xl font-bold text-[#C7A66A]">حضر</span>
        </div>
        <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest">
          MADAAR TECHNOLOGIES
        </p>
        <p className="text-xs text-slate-600 mt-1.5 font-medium">
          حضور أذكى. إدارة أسهل.
        </p>
      </div>

      {/* Main Login Card */}
      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-card rounded-3xl border border-slate-200 sm:px-10">
          {/* Exact 3 Roles: Center Admin, Assistant, Student */}
          <div className="flex p-1 bg-slate-100 rounded-2xl mb-6">
            <button
              type="button"
              onClick={() => {
                setAccountType('owner');
                setErrorMsg(null);
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1 ${
                accountType === 'owner'
                  ? 'bg-[#111D2D] text-white shadow-sm'
                  : 'text-slate-600 hover:text-[#111D2D]'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>إدارة السنتر</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setAccountType('assistant');
                setErrorMsg(null);
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1 ${
                accountType === 'assistant'
                  ? 'bg-[#C7A66A] text-[#111D2D] shadow-sm'
                  : 'text-slate-600 hover:text-[#111D2D]'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>الأسيستانت</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setAccountType('student');
                setErrorMsg(null);
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1 ${
                accountType === 'student'
                  ? 'bg-[#27877E] text-white shadow-sm'
                  : 'text-slate-600 hover:text-[#111D2D]'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span>بوابة الطالب</span>
            </button>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
              {errorMsg}
            </div>
          )}

          {/* Form 1: Center Owner Login */}
          {accountType === 'owner' && (
            <form onSubmit={handleStaffLogin} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  البريد الإلكتروني لمدير السنتر:
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="owner@alnokhba.com"
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
                  className="w-full py-2.5 rounded-xl bg-[#111D2D] hover:bg-[#1E2A3D] text-[#C7A66A] font-bold text-xs flex items-center justify-center gap-2 shadow-md transition"
                >
                  <LogIn className="w-4 h-4" />
                  <span>تسجيل الدخول إلى لوحة السنتر</span>
                </button>
              </div>
            </form>
          )}

          {/* Form 2: Assistant / Supervisor Login */}
          {accountType === 'assistant' && (
            <form onSubmit={handleStaffLogin} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  بريد أو كود الأسيستانت:
                </label>
                <div className="relative">
                  <Smartphone className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="assistant@alnokhba.com أو كود المشرف"
                    className="w-full pr-9 pl-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#C7A66A]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  كلمة المرور / الرمز السري:
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
                  className="w-full py-2.5 rounded-xl bg-[#C7A66A] hover:bg-[#B08E4F] text-[#111D2D] font-bold text-xs flex items-center justify-center gap-2 shadow-gold transition"
                >
                  <LogIn className="w-4 h-4" />
                  <span>دخول إلى ماسح الحضور للقاعات</span>
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
                  المتابعة برقم الهاتف المسجل أو كود الطالب المطبوع على الكارنيه.
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

          {/* Register New Center Banner */}
          <div className="mt-6 pt-5 border-t border-slate-200 text-center">
            <p className="text-xs text-slate-600 mb-2 font-medium">
              تريد تشغيل منظومة حَضَر في سنترك أو مركزك التعليمي؟
            </p>
            <Link
              href="/register"
              className="inline-flex items-center justify-center gap-1.5 w-full py-2.5 px-4 rounded-xl bg-[#111D2D] hover:bg-[#1E2A3D] text-[#C7A66A] font-bold text-xs shadow-sm transition"
            >
              <Building2 className="w-4 h-4 text-[#C7A66A]" />
              <span>تسجيل سنتر جديد (تجربة مجانية 14 يوماً)</span>
            </Link>
          </div>

          {/* Dedicated Clean Demo Button (Organized, only toggles on demand) */}
          <div className="mt-4 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setShowDemoModal(!showDemoModal)}
              className="w-full py-2 px-3 rounded-xl border border-amber-300/80 bg-amber-50/60 hover:bg-amber-100/70 text-amber-900 text-xs font-bold transition flex items-center justify-between"
            >
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#C7A66A]" />
                <span>تجربة نسخة العرض (Live Demo Preview)</span>
              </span>
              {showDemoModal ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {/* Collapsed Clean Demo Options */}
            {showDemoModal && (
              <div className="mt-3 p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 animate-fadeIn text-xs">
                <p className="text-[11px] text-slate-500 mb-2 font-medium text-center">
                  اختر الحساب الذي تريد معاينته بنقرة واحدة للعرض:
                </p>

                <button
                  type="button"
                  onClick={() => handleLaunchDemo('owner')}
                  className="w-full p-2.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 font-bold text-slate-800 text-right flex items-center justify-between transition"
                >
                  <span className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-[#111D2D]" />
                    <span>🏢 معاينة لوحة مدير السنتر</span>
                  </span>
                  <span className="text-[10px] text-slate-400 font-normal">دخول فوري</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleLaunchDemo('assistant')}
                  className="w-full p-2.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 font-bold text-slate-800 text-right flex items-center justify-between transition"
                >
                  <span className="flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-[#C7A66A]" />
                    <span>📱 معاينة ماسح الأسيستانت (QR)</span>
                  </span>
                  <span className="text-[10px] text-slate-400 font-normal">دخول فوري</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleLaunchDemo('student')}
                  className="w-full p-2.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 font-bold text-slate-800 text-right flex items-center justify-between transition"
                >
                  <span className="flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-[#27877E]" />
                    <span>🎓 معاينة بوابة الطالب (عمر)</span>
                  </span>
                  <span className="text-[10px] text-slate-400 font-normal">دخول فوري</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Dedicated WhatsApp Developer Contact Button */}
        <div className="mt-4">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-800 hover:from-emerald-700 hover:to-teal-900 text-white font-bold text-xs shadow-lg transition flex items-center justify-center gap-2 group"
          >
            <MessageCircle className="w-4 h-4 text-emerald-200 group-hover:scale-110 transition" />
            <span>تواصل مباشرة مع المطور عبر واتساب: 01202074649</span>
            <ExternalLink className="w-3.5 h-3.5 text-emerald-200 opacity-80" />
          </a>
        </div>
      </div>

      {/* Footer with Discreet Sovereign Admin Link */}
      <footer className="mt-8 text-center text-xs text-slate-400 space-y-1">
        <p>منظومة حَضَر الذكية &copy; 2026 — تطوير مدار للتقنية MADAAR Technologies</p>
        <div>
          <Link
            href="/super-admin"
            className="text-[10px] text-slate-400 hover:text-slate-600 inline-flex items-center gap-1 opacity-60 hover:opacity-100 transition"
          >
            <Lock className="w-3 h-3" />
            <span>بوابة الإدارة السيادية لشركة مدار (Master Admin)</span>
          </Link>
        </div>
      </footer>
    </div>
  );
}
