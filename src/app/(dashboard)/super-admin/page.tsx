'use client';

// ====================================================================
// HADAR SaaS Platform — Super Admin Portal
// Developed by MADAAR Technologies
// Platform Owner Operations & Tier Management
// ====================================================================

import React, { useState } from 'react';
import {
  ShieldAlert,
  Building2,
  DollarSign,
  Users,
  Plus,
  CheckCircle,
  XCircle,
  Pause,
  Play,
  Edit2,
  Layers,
  Sparkles,
  TrendingUp,
  X
} from 'lucide-react';
import { useI18n } from '@/lib/i18n/context';
import { useData } from '@/lib/store/data-context';
import { Center, SubscriptionPlan, SubscriptionPlanTier } from '@/types/database';

export default function SuperAdminPage() {
  const { t } = useI18n();
  const {
    allCenters,
    plans,
    students,
    addCenter,
    updateCenterTier,
    updatePlan
  } = useData();

  const [showAddCenterModal, setShowAddCenterModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);

  // New Center Form
  const [newCenterForm, setNewCenterForm] = useState({
    name_ar: '',
    name_en: '',
    slug: '',
    phone: '',
    email: '',
    address: '',
    subscription_tier: 'STARTER' as SubscriptionPlanTier,
    student_limit: 150,
    has_financial_addon: false
  });

  // Plan Edit Form
  const [planForm, setPlanForm] = useState({
    base_fee: 0,
    price_per_student: 0,
    min_students: 0,
    max_students: 150 as number | null
  });

  // Calculate Platform-Wide MRR (Monthly Recurring Revenue)
  const platformMRR = allCenters.reduce((sum, c) => {
    const plan = plans.find((p) => p.id === c.subscription_tier);
    if (!plan) return sum;
    let fee = plan.base_fee;
    if (plan.price_per_student > 0) {
      const centerStudentsCount = students.filter((s) => s.center_id === c.id).length || 5;
      fee += centerStudentsCount * plan.price_per_student;
    }
    if (c.has_financial_addon) {
      fee += c.financial_addon_fee || 100;
    }
    return sum + fee;
  }, 0);

  const handleCreateCenter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCenterForm.name_ar || !newCenterForm.slug) return;

    addCenter({
      slug: newCenterForm.slug.toLowerCase().trim(),
      name_ar: newCenterForm.name_ar,
      name_en: newCenterForm.name_en || newCenterForm.name_ar,
      phone: newCenterForm.phone,
      email: newCenterForm.email,
      address: newCenterForm.address,
      subscription_tier: newCenterForm.subscription_tier,
      subscription_status: 'active',
      student_limit: newCenterForm.student_limit,
      has_financial_addon: newCenterForm.has_financial_addon,
      financial_addon_fee: 100,
      settings: {
        late_grace_minutes: 15,
        require_checkout: false,
        currency: 'EGP',
        primary_language: 'ar',
        theme: 'navy-gold'
      }
    });

    setShowAddCenterModal(false);
  };

  const handleOpenEditPlan = (plan: SubscriptionPlan) => {
    setEditingPlan(plan);
    setPlanForm({
      base_fee: plan.base_fee,
      price_per_student: plan.price_per_student,
      min_students: plan.min_students,
      max_students: plan.max_students
    });
  };

  const handleSavePlan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlan) return;

    updatePlan(editingPlan.id, {
      base_fee: Number(planForm.base_fee),
      price_per_student: Number(planForm.price_per_student),
      min_students: Number(planForm.min_students),
      max_students: planForm.max_students ? Number(planForm.max_students) : null
    });

    setEditingPlan(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500 text-white flex items-center gap-1">
              <ShieldAlert className="w-3.5 h-3.5" />
              صلاحيات الإدارة العليا — مدار للتقنية
            </span>
          </div>
          <h1 className="text-2xl font-bold text-[#111D2D] flex items-center gap-2">
            بوابة المشرف العام (Super Admin Portal)
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            إدارة حسابات السناتر التعليمية، تكوين باقات الاشتراك، ومراقبة الإيراد الشهري للمنصة.
          </p>
        </div>

        <button
          onClick={() => setShowAddCenterModal(true)}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#111D2D] hover:bg-[#1E2A3D] text-white text-xs font-bold shadow-md transition"
        >
          <Plus className="w-4 h-4 text-[#C7A66A]" />
          <span>إضافة سنتر جديد للمنصة</span>
        </button>
      </div>

      {/* Platform KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
          <p className="text-xs text-slate-500 font-semibold">إجمالي السناتر المشتركة</p>
          <p className="text-2xl font-bold text-[#111D2D] mt-2">{allCenters.length}</p>
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
          <p className="text-xs text-slate-500 font-semibold">السناتر النشطة حالياً</p>
          <p className="text-2xl font-bold text-emerald-600 mt-2">
            {allCenters.filter((c) => c.subscription_status === 'active').length}
          </p>
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
          <p className="text-xs text-slate-500 font-semibold">إجمالي الطلاب المخدومين</p>
          <p className="text-2xl font-bold text-[#27877E] mt-2">
            {students.length * allCenters.length}
          </p>
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
          <p className="text-xs text-slate-500 font-semibold">الإيراد الشهري المتكرر (MRR)</p>
          <p className="text-2xl font-bold text-[#C7A66A] mt-2">
            {platformMRR.toLocaleString()} <span className="text-xs font-medium text-slate-500">ج.م / شهر</span>
          </p>
        </div>
      </div>

      {/* Centers Management Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-xs font-bold text-slate-700 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-[#27877E]" />
            السناتر والمؤسسات التعليمية المسجلة
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
              <tr>
                <th className="px-4 py-3">السنتر التعليمي</th>
                <th className="px-4 py-3">المعرف (Slug)</th>
                <th className="px-4 py-3">الباقة الحالية</th>
                <th className="px-4 py-3">إضافة الحسابات المالية</th>
                <th className="px-4 py-3">حد الطلاب</th>
                <th className="px-4 py-3">الحالة</th>
                <th className="px-4 py-3 text-center">التحكم والتعطيل</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {allCenters.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50 transition">
                  <td className="px-4 py-3">
                    <p className="font-bold text-[#111D2D]">{c.name_ar}</p>
                    <p className="text-[11px] text-slate-400">{c.phone || c.email}</p>
                  </td>

                  <td className="px-4 py-3 font-mono font-bold text-slate-600">
                    {c.slug}
                  </td>

                  <td className="px-4 py-3">
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#C7A66A]/20 text-[#111D2D] border border-[#C7A66A]/40">
                      {c.subscription_tier}
                    </span>
                  </td>

                  <td className="px-4 py-3">
                    {c.has_financial_addon ? (
                      <span className="text-emerald-700 font-bold">مفعلة (+100 ج.م)</span>
                    ) : (
                      <span className="text-slate-400">غير مفعلة</span>
                    )}
                  </td>

                  <td className="px-4 py-3 font-mono text-slate-700 font-bold">
                    {c.student_limit} طالب
                  </td>

                  <td className="px-4 py-3">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        c.subscription_status === 'active'
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-red-50 text-red-700'
                      }`}
                    >
                      {c.subscription_status === 'active' ? 'نشط' : 'معطل'}
                    </span>
                  </td>

                  <td className="px-4 py-3 text-center">
                    {c.subscription_status === 'active' ? (
                      <button
                        onClick={() => updateCenterTier(c.id, c.subscription_tier, 'suspended')}
                        className="px-2.5 py-1 rounded bg-red-50 hover:bg-red-100 text-red-700 font-bold text-[11px] transition"
                        title="إيقاف حساب السنتر مؤقتاً"
                      >
                        إيقاف مؤقت
                      </button>
                    ) : (
                      <button
                        onClick={() => updateCenterTier(c.id, c.subscription_tier, 'active')}
                        className="px-2.5 py-1 rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-[11px] transition"
                        title="تفعيل حساب السنتر"
                      >
                        تفعيل الحساب
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Subscription Plans Pricing Configurator */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-[#111D2D] flex items-center gap-2">
              <Layers className="w-5 h-5 text-[#C7A66A]" />
              باقات اشتراك المنصة وقواعد التسعير الديناميكية
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              أسعار الباقات مخزنة في قاعدة البيانات ويمكن تعديلها دون إعادة نشر الكود.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {plans.map((p) => (
            <div
              key={p.id}
              className="rounded-2xl border-2 border-slate-200 p-5 hover:border-[#C7A66A] transition flex flex-col justify-between bg-slate-50/50"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-500 font-mono">{p.id}</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                </div>

                <h3 className="text-base font-extrabold text-[#111D2D] mb-1">{p.name_ar}</h3>

                <div className="my-3 py-2 border-y border-slate-200">
                  {p.base_fee > 0 && (
                    <p className="text-xl font-black text-[#111D2D]">
                      {p.base_fee} <span className="text-xs font-medium text-slate-500">ج.م / شهرياً</span>
                    </p>
                  )}
                  {p.price_per_student > 0 && (
                    <p className="text-xl font-black text-[#27877E]">
                      {p.price_per_student} <span className="text-xs font-medium text-slate-500">ج.م لكل طالب / شهر</span>
                    </p>
                  )}
                  <p className="text-xs text-slate-500 mt-1">
                    النطاق: من {p.min_students} إلى {p.max_students ? `${p.max_students} طالب` : 'غير محدود'}
                  </p>
                </div>

                <ul className="space-y-1.5 text-xs text-slate-600 mb-4">
                  {p.features.map((f, idx) => (
                    <li key={idx} className="flex items-center gap-1.5">
                      <CheckCircle className="w-3.5 h-3.5 text-[#27877E] flex-shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                onClick={() => handleOpenEditPlan(p)}
                className="w-full py-2 rounded-xl bg-white border border-slate-200 hover:border-[#C7A66A] text-slate-700 hover:text-[#111D2D] font-bold text-xs flex items-center justify-center gap-1.5 transition shadow-sm"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>تعديل تسعير الباقة</span>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Add Center Modal */}
      {showAddCenterModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden border border-slate-200">
            <div className="p-5 bg-[#111D2D] text-white flex items-center justify-between">
              <h2 className="text-base font-bold flex items-center gap-2">
                <Building2 className="w-5 h-5 text-[#C7A66A]" />
                إضافة سنتر جديد
              </h2>
              <button onClick={() => setShowAddCenterModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCenter} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">اسم السنتر (عربي) *</label>
                  <input
                    type="text"
                    required
                    value={newCenterForm.name_ar}
                    onChange={(e) => setNewCenterForm({ ...newCenterForm, name_ar: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-[#C7A66A]"
                    placeholder="مثال: أكاديمية الأوائل"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">المعرف الفريد (Slug) *</label>
                  <input
                    type="text"
                    required
                    value={newCenterForm.slug}
                    onChange={(e) => setNewCenterForm({ ...newCenterForm, slug: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-[#C7A66A] font-mono"
                    placeholder="al-awael"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">رقم الهاتف *</label>
                  <input
                    type="tel"
                    required
                    value={newCenterForm.phone}
                    onChange={(e) => setNewCenterForm({ ...newCenterForm, phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-[#C7A66A] font-mono"
                    placeholder="01012345678"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">البريد الإلكتروني</label>
                  <input
                    type="email"
                    value={newCenterForm.email}
                    onChange={(e) => setNewCenterForm({ ...newCenterForm, email: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-[#C7A66A]"
                    placeholder="contact@alawael.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">باقة الاشتراك</label>
                  <select
                    value={newCenterForm.subscription_tier}
                    onChange={(e) => setNewCenterForm({ ...newCenterForm, subscription_tier: e.target.value as SubscriptionPlanTier })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white focus:outline-none focus:border-[#C7A66A]"
                  >
                    <option value="STARTER">الباقة الأساسية (STARTER)</option>
                    <option value="GROWTH">باقة النمو (GROWTH)</option>
                    <option value="ENTERPRISE">باقة المؤسسات الكبرى (ENTERPRISE)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">الحد الأقصى للطلاب</label>
                  <input
                    type="number"
                    value={newCenterForm.student_limit}
                    onChange={(e) => setNewCenterForm({ ...newCenterForm, student_limit: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-[#C7A66A]"
                  />
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-800">
                  <input
                    type="checkbox"
                    checked={newCenterForm.has_financial_addon}
                    onChange={(e) => setNewCenterForm({ ...newCenterForm, has_financial_addon: e.target.checked })}
                    className="rounded text-[#27877E] focus:ring-[#27877E]"
                  />
                  <span>تفعيل ميزة إدارة الاشتراكات والمدفوعات (+100 ج.م/شهر)</span>
                </label>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddCenterModal(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-[#111D2D] hover:bg-[#1E2A3D] text-[#C7A66A] font-bold shadow-md"
                >
                  إنشاء وتفعيل الحساب
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Plan Modal */}
      {editingPlan && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden border border-slate-200">
            <div className="p-5 bg-[#111D2D] text-white flex items-center justify-between">
              <h2 className="text-base font-bold flex items-center gap-2">
                <Layers className="w-5 h-5 text-[#C7A66A]" />
                تعديل تسعير {editingPlan.name_ar}
              </h2>
              <button onClick={() => setEditingPlan(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePlan} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">الرسم الشهري الثابت (ج.م)</label>
                  <input
                    type="number"
                    value={planForm.base_fee}
                    onChange={(e) => setPlanForm({ ...planForm, base_fee: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-[#C7A66A]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">السعر لكل طالب شهرياً (ج.م)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={planForm.price_per_student}
                    onChange={(e) => setPlanForm({ ...planForm, price_per_student: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-[#C7A66A]"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingPlan(null)}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 font-semibold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-[#C7A66A] hover:bg-[#B08E4F] text-[#111D2D] font-bold shadow-md"
                >
                  حفظ التسعير الجديد
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

