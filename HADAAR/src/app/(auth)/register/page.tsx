'use client';

// ====================================================================
// HADAR SaaS Platform — Center Self-Registration & Onboarding (/register)
// Developed by MADAAR Technologies
// Colors: Midnight Navy (#111D2D), Champagne Gold (#C7A66A), Deep Teal (#27877E)
// ====================================================================

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  GraduationCap,
  Building2,
  User,
  Mail,
  Phone,
  Lock,
  Link as LinkIcon,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Check
} from 'lucide-react';
import { useI18n } from '@/lib/i18n/context';
import { useData } from '@/lib/store/data-context';
import { SubscriptionPlanTier } from '@/types/database';

export default function RegisterCenterPage() {
  const router = useRouter();
  const { t } = useI18n();
  const { addCenter, switchCenter, switchUserRole, plans } = useData();

  const [formData, setFormData] = useState({
    centerNameAr: '',
    centerNameEn: '',
    slug: '',
    ownerName: '',
    phone: '',
    email: '',
    password: '',
    tier: 'GROWTH' as SubscriptionPlanTier,
    hasFinancialAddon: true
  });

  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-generate suggested slug from English name or transliteration
  const handleNameChange = (nameAr: string) => {
    setFormData((prev) => {
      const updated = { ...prev, centerNameAr: nameAr };
      if (!prev.slug) {
        // Simple slug generation
        const generatedSlug = nameAr
          .trim()
          .replace(/[^\w\s\u0621-\u064A]/gi, '')
          .replace(/\s+/g, '-')
          .toLowerCase();
        // If Arabic, provide fallback
        updated.slug = generatedSlug || 'my-center';
      }
      return updated;
    });
  };

  const handleSlugChange = (rawSlug: string) => {
    const clean = rawSlug.toLowerCase().replace(/[^a-z0-9-]/g, '');
    setFormData((prev) => ({ ...prev, slug: clean }));
    setSlugAvailable(clean.length >= 3);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!formData.centerNameAr || !formData.slug || !formData.ownerName || !formData.phone) {
      setErrorMsg('يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    if (formData.slug.length < 3) {
      setErrorMsg('المعرف الفريد (الرابط) يجب أن يتكون من 3 أحرف إنجليزية على الأقل');
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Create Center in multi-tenant data layer
      const newCenter = addCenter({
        slug: formData.slug,
        name_ar: formData.centerNameAr,
        name_en: formData.centerNameEn || formData.centerNameAr,
        phone: formData.phone,
        email: formData.email,
        address: 'القاهرة، مصر',
        subscription_tier: formData.tier,
        subscription_status: 'trialing', // 14-day free trial!
        student_limit: formData.tier === 'STARTER' ? 150 : 1000,
        has_financial_addon: formData.hasFinancialAddon,
        financial_addon_fee: 100,
        settings: {
          late_grace_minutes: 15,
          require_checkout: false,
          currency: 'EGP',
          primary_language: 'ar',
          theme: 'navy-gold',
          contact_whatsapp: formData.phone
        }
      });

      // 2. Switch context to this new center
      switchCenter(newCenter.id);
      switchUserRole('owner');

      // 3. Redirect to dashboard with welcome tour
      router.push('/?registered=true');
    } catch (err: any) {
      setErrorMsg(err.message || 'حدث خطأ أثناء إنشاء السنتر');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8">
      {/* Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-xl text-center">
        <Link href="/" className="inline-flex w-14 h-14 rounded-2xl bg-gradient-to-br from-[#C7A66A] to-[#8C6F3B] p-[2px] shadow-gold items-center justify-center mb-3">
          <div className="w-full h-full bg-[#111D2D] rounded-[12px] flex items-center justify-center">
            <GraduationCap className="w-7 h-7 text-[#C7A66A]" />
          </div>
        </Link>

        <h1 className="text-2xl font-extrabold text-[#111D2D] tracking-tight flex items-center justify-center gap-2">
          <span>تسجيل سنتر جديد في منصة</span>
          <span className="text-[#C7A66A]">حَضَر</span>
        </h1>
        <p className="text-xs text-slate-500 mt-1 font-medium">
          ابدأ إدارة حضور طلابك وكروت الـ QR والاشتراكات مجاناً لمدة 14 يوماً
        </p>
      </div>

      {/* Main Registration Card */}
      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-xl">
        <div className="bg-white py-8 px-6 shadow-card rounded-2xl border border-slate-200 sm:px-10">
          {errorMsg && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {/* Center Info */}
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-sm font-bold text-[#111D2D] mb-3 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-[#27877E]" />
                بيانات المركز التعليمي (السنتر)
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">اسم السنتر (بالعربية) *</label>
                  <input
                    type="text"
                    required
                    value={formData.centerNameAr}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="مثال: سنتر الأوائل التعليمي"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#C7A66A]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">اسم السنتر (بالإنجليزية / اختياري)</label>
                  <input
                    type="text"
                    value={formData.centerNameEn}
                    onChange={(e) => setFormData({ ...formData, centerNameEn: e.target.value })}
                    placeholder="Al-Awael Educational Center"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#C7A66A]"
                  />
                </div>
              </div>

              {/* Dedicated Subdomain / Slug Preview */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  المعرف الفريد لرابط السنتر (Center Link / Slug) *
                </label>
                <div className="relative flex items-center">
                  <span className="px-3 py-2 bg-slate-100 border border-l-0 border-slate-200 rounded-r-xl text-slate-500 font-mono text-[11px] select-none">
                    hadaar.io/c/
                  </span>
                  <input
                    type="text"
                    required
                    value={formData.slug}
                    onChange={(e) => handleSlugChange(e.target.value)}
                    placeholder="al-awael"
                    className="flex-1 px-3 py-2 border border-slate-200 rounded-l-xl text-xs font-mono font-bold text-[#27877E] focus:outline-none focus:border-[#27877E]"
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                  <LinkIcon className="w-3 h-3 text-[#C7A66A]" />
                  <span>رابط بوابة طلاب سنترك سيكون: </span>
                  <strong className="text-emerald-700 font-mono">
                    hadaar.io/c/{formData.slug || 'your-center'}/portal
                  </strong>
                </p>
              </div>
            </div>

            {/* Owner Info */}
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-sm font-bold text-[#111D2D] mb-3 flex items-center gap-2">
                <User className="w-4 h-4 text-[#C7A66A]" />
                بيانات مدير السنتر (الحساب الرئيسي)
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">اسم المسؤول ثلاثي *</label>
                  <input
                    type="text"
                    required
                    value={formData.ownerName}
                    onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                    placeholder="أ. أحمد محمود"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#C7A66A]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">رقم الهاتف / واتساب *</label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="01012345678"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#C7A66A] font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">البريد الإلكتروني *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="owner@mycenter.com"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#C7A66A]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">كلمة المرور *</label>
                  <input
                    type="password"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="••••••••"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#C7A66A]"
                  />
                </div>
              </div>
            </div>

            {/* Plan Selection */}
            <div>
              <h2 className="text-sm font-bold text-[#111D2D] mb-2 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#C7A66A]" />
                اختر الباقة المناسبة (تجربة مجانية 14 يوماً):
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {plans.map((p) => (
                  <label
                    key={p.id}
                    className={`p-3 rounded-xl border cursor-pointer transition flex flex-col justify-between ${
                      formData.tier === p.id
                        ? 'border-[#C7A66A] bg-[#C7A66A]/10 shadow-sm'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-[#111D2D] text-xs">{p.name_ar}</span>
                        {formData.tier === p.id && <Check className="w-3.5 h-3.5 text-[#27877E]" />}
                      </div>
                      <p className="text-[11px] font-bold text-[#27877E]">
                        {p.base_fee > 0 ? `${p.base_fee} ج.م / شهر` : `${p.price_per_student} ج.م / طالب`}
                      </p>
                      <p className="text-[10px] text-slate-500 mt-1">
                        {p.max_students ? `حتى ${p.max_students} طالب` : 'أكثر من 1000 طالب'}
                      </p>
                    </div>
                    <input
                      type="radio"
                      name="tier"
                      checked={formData.tier === p.id}
                      onChange={() => setFormData({ ...formData, tier: p.id })}
                      className="hidden"
                    />
                  </label>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4 border-t border-slate-100 space-y-3">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-xl bg-[#111D2D] hover:bg-[#1E2A3D] text-[#C7A66A] font-bold text-sm shadow-md transition flex items-center justify-center gap-2"
              >
                <ShieldCheck className="w-4 h-4 text-[#C7A66A]" />
                <span>إنشاء حساب السنتر وبدء التجربة المجانية</span>
              </button>

              <div className="text-center text-xs text-slate-500">
                لديك حساب بالفعل؟{' '}
                <Link href="/login" className="font-bold text-[#27877E] hover:underline">
                  تسجيل الدخول
                </Link>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
