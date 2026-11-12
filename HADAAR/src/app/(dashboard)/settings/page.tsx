'use client';

// ====================================================================
// HADAR SaaS Platform — Center Settings Module
// Developed by MADAAR Technologies
// ====================================================================

import React, { useState } from 'react';
import {
  Settings,
  Building2,
  Clock,
  QrCode,
  Shield,
  Save,
  CheckCircle,
  RotateCcw
} from 'lucide-react';
import { useI18n } from '@/lib/i18n/context';
import { useData } from '@/lib/store/data-context';
import { getOrCreateDeviceId } from '@/lib/offline/db';

export default function SettingsPage() {
  const { t } = useI18n();
  const { currentCenter, updateCenterSettings, resetToDefaults } = useData();

  const [activeTab, setActiveTab] = useState<'general' | 'attendance' | 'qr'>('attendance');

  const [graceMinutes, setGraceMinutes] = useState(currentCenter.settings.late_grace_minutes || 15);
  const [requireCheckout, setRequireCheckout] = useState(currentCenter.settings.require_checkout || false);
  const [whatsapp, setWhatsapp] = useState(currentCenter.settings.contact_whatsapp || '201012345678');
  const [savedSuccess, setSavedSuccess] = useState(false);

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

