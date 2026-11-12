'use client';

// ====================================================================
// HADAR SaaS Platform — Payments Log & Treasury (Safe)
// Developed by MADAAR Technologies
// ====================================================================

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Receipt,
  Search,
  Filter,
  Download,
  Printer,
  CreditCard,
  Banknote,
  Smartphone,
  Building2,
  Calendar,
  X
} from 'lucide-react';
import { useI18n } from '@/lib/i18n/context';
import { useData } from '@/lib/store/data-context';
import { Payment } from '@/types/database';

export default function PaymentsPage() {
  const { t } = useI18n();
  const { payments, students, currentCenter } = useData();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMethod, setSelectedMethod] = useState<string>('ALL');
  const [selectedReceipt, setSelectedReceipt] = useState<Payment | null>(null);

  // Totals calculations
  const totalAmount = payments.reduce((sum, p) => sum + p.amount, 0);
  const cashAmount = payments.filter((p) => p.payment_method === 'cash').reduce((sum, p) => sum + p.amount, 0);
  const instapayAmount = payments.filter((p) => p.payment_method === 'instapay').reduce((sum, p) => sum + p.amount, 0);
  const vodafoneAmount = payments.filter((p) => p.payment_method === 'vodafone_cash').reduce((sum, p) => sum + p.amount, 0);

  // Filtered Payments
  const filteredPayments = useMemo(() => {
    return payments
      .map((p) => {
        const student = students.find((s) => s.id === p.student_id);
        return { ...p, student };
      })
      .filter((p) => {
        const matchesSearch =
          !searchQuery ||
          p.receipt_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.student?.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.student?.student_code.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesMethod = selectedMethod === 'ALL' || p.payment_method === selectedMethod;

        return matchesSearch && matchesMethod;
      });
  }, [payments, students, searchQuery, selectedMethod]);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#111D2D] flex items-center gap-2">
            <Receipt className="w-6 h-6 text-[#27877E]" />
            سجل المدفوعات والخزينة
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            سجل حركة النقدية والمقبوضات، متابعة قنوات التحصيل، وطباعة إيصالات السداد.
          </p>
        </div>

        <Link
          href="/subscriptions"
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-[#111D2D] hover:bg-slate-50 shadow-sm transition"
        >
          <CreditCard className="w-4 h-4 text-[#C7A66A]" />
          <span>إدارة اشتراكات الطلاب</span>
        </Link>
      </div>

      {/* Financial Channel Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
          <p className="text-xs text-slate-500 font-semibold">إجمالي المتحصلات</p>
          <p className="text-2xl font-bold text-[#111D2D] mt-2">
            {totalAmount.toLocaleString()} <span className="text-xs font-medium text-slate-500">ج.م</span>
          </p>
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-semibold">تحصيل كاش (خزينة)</span>
            <Banknote className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-emerald-600 mt-2">
            {cashAmount.toLocaleString()} <span className="text-xs font-medium text-slate-500">ج.م</span>
          </p>
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-semibold">تحصيل إنستاباي</span>
            <CreditCard className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-2xl font-bold text-purple-600 mt-2">
            {instapayAmount.toLocaleString()} <span className="text-xs font-medium text-slate-500">ج.م</span>
          </p>
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-semibold">فودافون كاش ومحافظ</span>
            <Smartphone className="w-4 h-4 text-red-600" />
          </div>
          <p className="text-2xl font-bold text-red-600 mt-2">
            {vodafoneAmount.toLocaleString()} <span className="text-xs font-medium text-slate-500">ج.م</span>
          </p>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="بحث برقم الإيصال أو اسم الطالب..."
            className="w-full pr-9 pl-4 py-2 rounded-lg border border-slate-200 text-xs focus:outline-none focus:border-[#C7A66A]"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={selectedMethod}
            onChange={(e) => setSelectedMethod(e.target.value)}
            className="px-3 py-2 rounded-lg border border-slate-200 text-xs bg-white text-slate-700 focus:outline-none focus:border-[#C7A66A]"
          >
            <option value="ALL">جميع طرق السداد</option>
            <option value="cash">كاش فقط</option>
            <option value="instapay">إنستاباي (InstaPay)</option>
            <option value="vodafone_cash">فودافون كاش</option>
            <option value="card">بطاقة بنكية</option>
          </select>
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
              <tr>
                <th className="px-4 py-3">رقم الإيصال</th>
                <th className="px-4 py-3">الطالب</th>
                <th className="px-4 py-3">المبلغ المحصل</th>
                <th className="px-4 py-3">طريقة الدفع</th>
                <th className="px-4 py-3">تاريخ السداد</th>
                <th className="px-4 py-3">الملاحظات</th>
                <th className="px-4 py-3 text-center">الإيصال</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    لا توجد إيصالات سداد مسجلة
                  </td>
                </tr>
              ) : (
                filteredPayments.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50 transition">
                    <td className="px-4 py-3 font-mono font-bold text-[#27877E]">
                      {p.receipt_number}
                    </td>

                    <td className="px-4 py-3">
                      <p className="font-bold text-[#111D2D]">{p.student?.full_name}</p>
                      <p className="text-[10px] text-slate-400 font-mono">{p.student?.student_code}</p>
                    </td>

                    <td className="px-4 py-3 font-bold text-emerald-700 text-sm">
                      {p.amount} ج.م
                    </td>

                    <td className="px-4 py-3">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                        {p.payment_method === 'cash'
                          ? 'كاش'
                          : p.payment_method === 'instapay'
                          ? 'إنستاباي'
                          : p.payment_method === 'vodafone_cash'
                          ? 'فودافون كاش'
                          : 'بطاقة'}
                      </span>
                    </td>

                    <td className="px-4 py-3 font-mono text-slate-500 text-[11px]">
                      {new Date(p.paid_at).toLocaleString('ar-EG')}
                    </td>

                    <td className="px-4 py-3 text-slate-500">
                      {p.notes || '-'}
                    </td>

                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => setSelectedReceipt(p)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#111D2D]/5 hover:bg-[#111D2D]/10 text-[#111D2D] font-semibold text-[11px]"
                      >
                        <Printer className="w-3.5 h-3.5 text-[#C7A66A]" />
                        <span>عرض وطباعة</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Receipt Modal Preview */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden border border-slate-200">
            <div className="p-5 bg-[#111D2D] text-white flex items-center justify-between no-print">
              <h2 className="text-base font-bold flex items-center gap-2">
                <Receipt className="w-5 h-5 text-[#C7A66A]" />
                إيصال استلام نقدية
              </h2>
              <button onClick={() => setSelectedReceipt(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="border-2 border-[#111D2D] rounded-xl p-5 bg-slate-50 text-center space-y-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#C7A66A]/20 text-[#111D2D]">
                  {currentCenter.name_ar}
                </span>
                <h3 className="text-base font-extrabold text-[#111D2D]">
                  إيصال سداد رسوم دراسية
                </h3>
                <p className="font-mono text-xs font-bold text-[#27877E]">
                  {selectedReceipt.receipt_number}
                </p>

                <div className="my-3 py-2 border-y border-dashed border-slate-300 text-right space-y-1">
                  <p>
                    <strong>اسم الطالب:</strong> {students.find((s) => s.id === selectedReceipt.student_id)?.full_name}
                  </p>
                  <p>
                    <strong>المبلغ المدفوع:</strong>{' '}
                    <span className="font-bold text-emerald-700 text-sm">{selectedReceipt.amount} ج.م</span>
                  </p>
                  <p>
                    <strong>طريقة السداد:</strong> {selectedReceipt.payment_method}
                  </p>
                  <p>
                    <strong>تاريخ المعاملة:</strong> {new Date(selectedReceipt.paid_at).toLocaleString('ar-EG')}
                  </p>
                  {selectedReceipt.notes && (
                    <p>
                      <strong>ملاحظات:</strong> {selectedReceipt.notes}
                    </p>
                  )}
                </div>

                <p className="text-[10px] text-slate-400">
                  منظومة حضر الذكية — MADAAR Technologies
                </p>
              </div>

              <div className="flex items-center gap-2 no-print">
                <button
                  onClick={() => window.print()}
                  className="flex-1 py-2 rounded-lg bg-[#C7A66A] hover:bg-[#B08E4F] text-[#111D2D] font-bold text-xs flex items-center justify-center gap-1.5"
                >
                  <Printer className="w-4 h-4" />
                  <span>طباعة الإيصال</span>
                </button>
                <button
                  onClick={() => setSelectedReceipt(null)}
                  className="flex-1 py-2 rounded-lg border border-slate-200 text-slate-700 font-semibold"
                >
                  إغلاق
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

