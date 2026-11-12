'use client';

// ====================================================================
// HADAR SaaS Platform — Center Landing & Links Hub (/c/[slug])
// Developed by MADAAR Technologies
// ====================================================================

import React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  GraduationCap,
  Building2,
  QrCode,
  Users,
  Calendar,
  Phone,
  ShieldCheck,
  ArrowRight
} from 'lucide-react';
import { useData } from '@/lib/store/data-context';

export default function CenterHubPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const { allCenters, groups } = useData();

  // Find center by slug
  const center = allCenters.find((c) => c.slug === slug) || allCenters[0];

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col justify-between">
      {/* Header */}
      <header className="bg-[#111D2D] text-white border-b border-[#1E2A3D] px-6 py-4 shadow-sm">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#C7A66A] to-[#8C6F3B] p-[2px] flex items-center justify-center">
              <div className="w-full h-full bg-[#111D2D] rounded-[10px] flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-[#C7A66A]" />
              </div>
            </div>
            <div>
              <h1 className="font-extrabold text-base tracking-tight">{center.name_ar}</h1>
              <p className="text-[11px] text-slate-400">المنظومة الذكية لإدارة الحضور والطلاب — حضر</p>
            </div>
          </div>

          <Link
            href="/login"
            className="text-xs text-slate-300 hover:text-white font-semibold"
          >
            دخول المشرفين
          </Link>
        </div>
      </header>

      {/* Main Hub Content */}
      <main className="max-w-3xl mx-auto px-4 py-12 flex-1 w-full space-y-8 text-center">
        <div>
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#C7A66A]/20 text-[#111D2D] border border-[#C7A66A]/30">
            البوابة الرقمية المعتمدة
          </span>
          <h2 className="text-3xl font-extrabold text-[#111D2D] mt-3">
            مرحباً بكم في {center.name_ar}
          </h2>
          <p className="text-sm text-slate-600 mt-2 max-w-lg mx-auto">
            منظومة الحضور الذكي ومتابعة الطلاب والاشتراكات. اختر البوابة المناسبة للدخول:
          </p>
        </div>

        {/* Portals Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-right">
          {/* Student & Parent Portal */}
          <Link
            href={`/c/${center.slug}/portal`}
            className="p-6 rounded-2xl bg-white border-2 border-slate-200 hover:border-[#27877E] hover:shadow-card transition flex flex-col justify-between group"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-teal-50 text-[#27877E] flex items-center justify-center mb-4 group-hover:bg-[#27877E] group-hover:text-white transition">
                <GraduationCap className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-[#111D2D] mb-1">
                بوابة الطالب وولي الأمر
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                متابعة الحضور والغياب، بطاقة الـ QR الرقمية، جدول المجموعات، وحالة الاشتراكات والمدفوعات.
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-[#27877E]">
              <span>دخول بكود الطالب أو الهاتف</span>
              <ArrowRight className="w-4 h-4 rotate-180" />
            </div>
          </Link>

          {/* Assistant Scanner Portal */}
          <Link
            href={`/c/${center.slug}/scanner`}
            className="p-6 rounded-2xl bg-white border-2 border-slate-200 hover:border-[#C7A66A] hover:shadow-card transition flex flex-col justify-between group"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-amber-50 text-[#C7A66A] flex items-center justify-center mb-4 group-hover:bg-[#111D2D] group-hover:text-[#C7A66A] transition">
                <QrCode className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-[#111D2D] mb-1">
                ماسح حضور الحصص (فريق العمل)
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                مخصص للمساعدين والمشرفين لمسح بطاقات الـ QR وتسجيل حضور وانصراف طلاب القاعة فورياً.
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-[#C7A66A]">
              <span>فتح كاميرا الماسح</span>
              <ArrowRight className="w-4 h-4 rotate-180" />
            </div>
          </Link>
        </div>

        {/* Contact info */}
        {center.phone && (
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 inline-flex items-center gap-2 text-xs text-slate-600 font-mono">
            <Phone className="w-3.5 h-3.5 text-[#27877E]" />
            <span>للتواصل مع إدارة السنتر: {center.phone}</span>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="py-4 border-t border-slate-200 text-center text-xs text-slate-400">
        مشغّل بواسطة <strong className="text-[#111D2D]">منظومة حَضَر</strong> — تطوير مدار للتقنية MADAAR Technologies
      </footer>
    </div>
  );
}
