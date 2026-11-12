'use client';

// ====================================================================
// HADAR SaaS Platform — Center Settings Module
// Developed by MADAAR Technologies
// ====================================================================

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Settings,
  Building2,
  Clock,
  QrCode,
  Shield,
  Save,
  CheckCircle,
  RotateCcw,
  Share2,
  Copy,
  ExternalLink,
  MessageSquare,
  GraduationCap,
  Smartphone,
  Check
} from 'lucide-react';
import { useI18n } from '@/lib/i18n/context';
import { useData } from '@/lib/store/data-context';
import { getOrCreateDeviceId } from '@/lib/offline/db';

export default function SettingsPage() {
  const { t } = useI18n();
  const { currentCenter, updateCenterSettings, resetToDefaults } = useData();

  const [activeTab, setActiveTab] = useState<'attendance' | 'general' | 'links' | 'qr'>('attendance');

  const [graceMinutes, setGraceMinutes] = useState(currentCenter.settings.late_grace_minutes || 15);
  const [requireCheckout, setRequireCheckout] = useState(currentCenter.settings.require_checkout || false);
  const [whatsapp, setWhatsapp] = useState(currentCenter.settings.contact_whatsapp || '201012345678');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const getBaseOrigin = () => {
    if (typeof window !== 'undefined') {
      return window.location.origin;
    }
    return 'https://hadar.madaar.io';
  };

  const portalUrl = `${getBaseOrigin()}/c/${currentCenter.slug}/portal`;
  const scannerUrl = `${getBaseOrigin()}/c/${currentCenter.slug}/scanner`;
  const centerHubUrl = `${getBaseOrigin()}/c/${currentCenter.slug}`;

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

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateCenterSettings({
      late_grace_minutes: Number(graceMinutes),
      require_checkout: requireCheckout,
      contact_whatsapp: whatsapp
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#111D2D] flex items-center gap-2">
            <Settings className="w-6 h-6 text-[#27877E]" />
            إعدادات السنتر والقواعد التشغيلية
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            تخصيص قواعد الحضور والتأخير، إعدادات بطاقات QR الذكية، ومعلومات الاتصال.
          </p>
        </div>

        {savedSuccess && (
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
            <CheckCircle className="w-4 h-4" />
            تم حفظ التعديلات بنجاح
          </span>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-4 text-xs font-bold">
        <button
          onClick={() => setActiveTab('attendance')}
          className={`pb-3 transition flex items-center gap-2 ${
            activeTab === 'attendance'
              ? 'border-b-2 border-[#C7A66A] text-[#111D2D]'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Clock className="w-4 h-4 text-[#C7A66A]" />
          <span>قواعد الحضور وفترة السماح</span>
        </button>

        <button
          onClick={() => setActiveTab('general')}
          className={`pb-3 transition flex items-center gap-2 ${
            activeTab === 'general'
              ? 'border-b-2 border-[#C7A66A] text-[#111D2D]'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Building2 className="w-4 h-4 text-[#27877E]" />
          <span>بيانات السنتر والاتصال</span>
        </button>

        <button
          onClick={() => setActiveTab('links')}
          className={`pb-3 transition flex items-center gap-2 ${
            activeTab === 'links'
              ? 'border-b-2 border-[#C7A66A] text-[#111D2D]'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Share2 className="w-4 h-4 text-[#C7A66A]" />
          <span>روابط السنتر المخصصة</span>
        </button>

        <button
          onClick={() => setActiveTab('qr')}
          className={`pb-3 transition flex items-center gap-2 ${
            activeTab === 'qr'
              ? 'border-b-2 border-[#C7A66A] text-[#111D2D]'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <QrCode className="w-4 h-4 text-[#111D2D]" />
          <span>بطاقات QR ومعرف الجهاز</span>
        </button>
      </div>

      {/* Settings Form */}
      <form onSubmit={handleSave} className="space-y-6">
        {/* Tab 1: Attendance Rules */}
        {activeTab === 'attendance' && (
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-6">
            <div>
              <h2 className="text-sm font-bold text-[#111D2D] mb-1">
                فترة سماح الوصول والتأخير (Late Grace Period)
              </h2>
              <p className="text-xs text-slate-500 mb-3">
                عدد الدقائق المسموح بها بعد بدء الحصة قبل أن يُحتسب الطالب (متأخراً) تلقائياً.
              </p>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min={0}
                  max={60}
                  value={graceMinutes}
                  onChange={(e) => setGraceMinutes(Number(e.target.value))}
                  className="w-32 px-3 py-2 rounded-lg border border-slate-200 text-sm font-bold text-[#111D2D] focus:outline-none focus:border-[#C7A66A]"
                />
                <span className="text-xs text-slate-600 font-semibold">دقيقة بعد موعد بدء الحصة</span>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <h2 className="text-sm font-bold text-[#111D2D] mb-1">
                تسجيل الانصراف الإجباري (Check-Out)
              </h2>
              <p className="text-xs text-slate-500 mb-3">
                إلزام المساعدين بمسح بطاقة الطالب مرة أخرى عند مغادرة الحصة.
              </p>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={requireCheckout}
                  onChange={(e) => setRequireCheckout(e.target.checked)}
                  className="w-4 h-4 rounded text-[#27877E] focus:ring-[#27877E]"
                />
                <span className="text-xs font-semibold text-slate-700">
                  تفعيل نظام تسجيل الانصراف المنفصل
                </span>
              </label>
            </div>
          </div>
        )}

        {/* Tab 2: General & Contact */}
        {activeTab === 'general' && (
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">اسم السنتر (بالعربية)</label>
                <input
                  type="text"
                  readOnly
                  value={currentCenter.name_ar}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 font-bold text-[#111D2D]"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">اسم السنتر (بالإنجليزية)</label>
                <input
                  type="text"
                  readOnly
                  value={currentCenter.name_en}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 font-bold text-[#111D2D]"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">رقم هاتف الواتساب المعتمد للتنبيهات</label>
              <input
                type="text"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="201012345678"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 font-mono text-[#111D2D] focus:outline-none focus:border-[#C7A66A]"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">عنوان المقر الرئيسي</label>
              <input
                type="text"
                readOnly
                value={currentCenter.address || 'القاهرة، مصر'}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50"
              />
            </div>
          </div>
        )}

        {/* Tab 3: Dedicated Center Links */}
        {activeTab === 'links' && (
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-6 text-xs">
            <div>
              <h2 className="text-sm font-bold text-[#111D2D] mb-1 flex items-center gap-2">
                <Share2 className="w-4 h-4 text-[#C7A66A]" />
                الروابط المخصصة للمركز التعليمي
              </h2>
              <p className="text-xs text-slate-500">
                يمكنك مشاركة هذه الروابط مع الطلاب وأولياء الأمور والمساعدين. كل رابط مخصص لسنترك حصراً.
              </p>
            </div>

            {/* Slug Info */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div>
                <span className="font-bold text-[#111D2D] block">المعرف الفريد لرابط السنتر (Slug):</span>
                <span className="font-mono text-emerald-700 font-bold">{currentCenter.slug}</span>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold">
                نشط وموثق
              </span>
            </div>

            {/* Links List */}
            <div className="space-y-4">
              {/* Portal Link */}
              <div className="p-4 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#111D2D] flex items-center gap-1.5">
                    <GraduationCap className="w-4 h-4 text-[#27877E]" />
                    رابط بوابة الطلاب وأولياء الأمور
                  </span>
                  <Link
                    href={`/c/${currentCenter.slug}/portal`}
                    target="_blank"
                    className="text-[#27877E] hover:underline inline-flex items-center gap-1 font-semibold text-[11px]"
                  >
                    <span>معاينة البوابة</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
                <div className="p-2 bg-slate-50 rounded-lg border border-slate-200 font-mono text-[11px] text-slate-700">
                  {portalUrl}
                </div>
                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => copyToClipboard(portalUrl, 'settings-portal')}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 font-bold text-slate-700 flex items-center gap-1.5"
                  >
                    {copiedKey === 'settings-portal' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>نسخ</span>
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      shareWhatsApp(
                        `أهلاً بكم في ${currentCenter.name_ar} 🎓\nيمكنكم الآن متابعة حضور وغياب الطالب، جدول الحصص، وبطاقة الـ QR عبر الرابط:\n${portalUrl}`
                      )
                    }
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center gap-1.5"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>مشاركة عبر واتساب</span>
                  </button>
                </div>
              </div>

              {/* Scanner Link */}
              <div className="p-4 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#111D2D] flex items-center gap-1.5">
                    <Smartphone className="w-4 h-4 text-[#C7A66A]" />
                    رابط ماسح الـ QR السريع للأسيستانت
                  </span>
                  <Link
                    href={`/c/${currentCenter.slug}/scanner`}
                    target="_blank"
                    className="text-[#C7A66A] hover:underline inline-flex items-center gap-1 font-semibold text-[11px]"
                  >
                    <span>معاينة الماسح</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
                <div className="p-2 bg-slate-50 rounded-lg border border-slate-200 font-mono text-[11px] text-slate-700">
                  {scannerUrl}
                </div>
                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => copyToClipboard(scannerUrl, 'settings-scanner')}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 font-bold text-slate-700 flex items-center gap-1.5"
                  >
                    {copiedKey === 'settings-scanner' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>نسخ</span>
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      shareWhatsApp(
                        `فريق عمل ${currentCenter.name_ar} 📱\nرابط تسجيل حضور وانصراف الطلاب بالماسح السريع:\n${scannerUrl}`
                      )
                    }
                    className="px-3 py-1.5 rounded-lg bg-[#111D2D] hover:bg-[#1E2A3D] text-[#C7A66A] font-bold flex items-center gap-1.5"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>إرسال للأسيستانت</span>
                  </button>
                </div>
              </div>

              {/* Hub Link */}
              <div className="p-4 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#111D2D] flex items-center gap-1.5">
                    <Building2 className="w-4 h-4 text-[#111D2D]" />
                    صفحة المركز الرقمية الرئيسية
                  </span>
                  <Link
                    href={`/c/${currentCenter.slug}`}
                    target="_blank"
                    className="text-[#111D2D] hover:underline inline-flex items-center gap-1 font-semibold text-[11px]"
                  >
                    <span>معاينة الصفحة</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
                <div className="p-2 bg-slate-50 rounded-lg border border-slate-200 font-mono text-[11px] text-slate-700">
                  {centerHubUrl}
                </div>
                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => copyToClipboard(centerHubUrl, 'settings-hub')}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 font-bold text-slate-700 flex items-center gap-1.5"
                  >
                    {copiedKey === 'settings-hub' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>نسخ</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: QR & Device */}
        {activeTab === 'qr' && (
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4 text-xs">
            <div>
              <h2 className="text-sm font-bold text-[#111D2D] mb-1">
                معرف الجهاز الحالي للمزامنة (Device Fingerprint)
              </h2>
              <p className="text-xs text-slate-500 mb-2">
                يُستخدم لتوثيق مصدر تسجيل الحضور في الوضع غير المتصل (أوفلاين).
              </p>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 font-mono font-bold text-[#27877E] text-xs">
                {getOrCreateDeviceId()}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <h2 className="text-sm font-bold text-red-600 mb-1">
                إعادة ضبط البيانات المحلية للمصنع (Reset Defaults)
              </h2>
              <p className="text-xs text-slate-500 mb-3">
                إعادة ضبط قاعدة البيانات المحلية في المتصفح إلى البيانات النموذجية الأولية.
              </p>
              <button
                type="button"
                onClick={() => {
                  if (confirm('هل أنت متأكد من إعادة ضبط البيانات إلى الحالة الافتراضية؟')) {
                    resetToDefaults();
                    alert('تمت إعادة ضبط البيانات بنجاح!');
                  }
                }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-red-200 text-red-600 font-bold hover:bg-red-50 transition"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>إعادة ضبط البيانات الافتراضية</span>
              </button>
            </div>
          </div>
        )}

        {/* Save button */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#C7A66A] hover:bg-[#B08E4F] text-[#111D2D] font-bold text-xs shadow-gold transition"
          >
            <Save className="w-4 h-4" />
            <span>حفظ الإعدادات</span>
          </button>
        </div>
      </form>
    </div>
  );
}

