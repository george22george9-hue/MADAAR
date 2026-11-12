'use client';

// ====================================================================
// HADAR SaaS Platform — Student Subscriptions & Balances
// Developed by MADAAR Technologies
// ====================================================================

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  CreditCard,
  Search,
  Filter,
  DollarSign,
  Plus,
  Receipt,
  CheckCircle,
  AlertCircle,
  Clock,
  Printer,
  X
} from 'lucide-react';
import { useI18n } from '@/lib/i18n/context';
import { useData } from '@/lib/store/data-context';
import { StudentSubscription, Payment } from '@/types/database';

export default function SubscriptionsPage() {
  const { t } = useI18n();
  const {
    subscriptions,
    students,
    groups,
    currentCenter,
    recordPayment
  } = useData();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

  // Payment Modal State
  const [payingSubscription, setPayingSubscription] = useState<StudentSubscription | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<Payment['payment_method']>('cash');
  const [paymentNotes, setPaymentNotes] = useState('');
  const [generatedReceipt, setGeneratedReceipt] = useState<Payment | null>(null);

  // Financial Summary KPIs
  const totalDueSum = subscriptions.reduce((sum, s) => sum + s.total_due, 0);
  const totalPaidSum = subscriptions.reduce((sum, s) => sum + s.total_paid, 0);
  const totalRemainingSum = subscriptions.reduce((sum, s) => sum + s.remaining_balance, 0);

  // Filtered Subscriptions
  const filteredSubs = useMemo(() => {
    return subscriptions
      .map((sub) => {
        const student = students.find((s) => s.id === sub.student_id);
        const group = groups.find((g) => g.id === sub.group_id);
        return {
          ...sub,
          student,
          group
        };
      })
      .filter((item) => {
        const matchesSearch =
          !searchQuery ||
          item.student?.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.student?.student_code.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesStatus =
          selectedStatus === 'ALL' || item.status === selectedStatus;

        return matchesSearch && matchesStatus;
      });
  }, [subscriptions, students, groups, searchQuery, selectedStatus]);

  const handleOpenPayment = (sub: StudentSubscription) => {
    setPayingSubscription(sub);
    setPaymentAmount(sub.remaining_balance > 0 ? sub.remaining_balance : sub.total_due);
    setPaymentMethod('cash');
    setPaymentNotes('');
    setGeneratedReceipt(null);
  };

  const handleConfirmPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!payingSubscription || paymentAmount <= 0) return;

    const receipt = recordPayment({
      subscriptionId: payingSubscription.id,
      studentId: payingSubscription.student_id,
      amount: Number(paymentAmount),
      paymentMethod,
      notes: paymentNotes
    });

    setGeneratedReceipt(receipt);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#111D2D] flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-[#C7A66A]" />
            اشتراكات الطلاب والمستحقات
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            متابعة دورات الدفع الشهرية، تسديد الرسوم، وتوليد إيصالات السداد الرسمية.
          </p>
        </div>

        <Link
          href="/payments"
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-[#111D2D] hover:bg-slate-50 shadow-sm transition"
        >
          <Receipt className="w-4 h-4 text-[#27877E]" />
          <span>سجل المدفوعات والخزينة</span>
        </Link>
      </div>

      {/* Financial Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
          <p className="text-xs text-slate-500 font-semibold">إجمالي الاشتراكات المطلوبة</p>
          <p className="text-2xl font-bold text-[#111D2D] mt-2">
            {totalDueSum.toLocaleString()} <span className="text-xs font-medium text-slate-500">ج.م</span>
          </p>
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
          <p className="text-xs text-slate-500 font-semibold">المبالغ المحصلة فعلياً</p>
          <p className="text-2xl font-bold text-emerald-600 mt-2">
            {totalPaidSum.toLocaleString()} <span className="text-xs font-medium text-slate-500">ج.م</span>
          </p>
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
          <p className="text-xs text-slate-500 font-semibold">المستحقات المعلقة (متبقي)</p>
          <p className="text-2xl font-bold text-amber-600 mt-2">
            {totalRemainingSum.toLocaleString()} <span className="text-xs font-medium text-slate-500">ج.م</span>
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
            placeholder="بحث باسم الطالب أو الكود..."
            className="w-full pr-9 pl-4 py-2 rounded-lg border border-slate-200 text-xs focus:outline-none focus:border-[#C7A66A]"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 rounded-lg border border-slate-200 text-xs bg-white text-slate-700 focus:outline-none focus:border-[#C7A66A]"
          >
            <option value="ALL">جميع حالات السداد</option>
            <option value="paid">مدفوع بالكامل</option>
            <option value="partially_paid">مدفوع جزئياً</option>
            <option value="unpaid">غير مدفوع</option>
            <option value="overdue">متأخرات</option>
          </select>
        </div>
      </div>

      {/* Subscriptions Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
              <tr>
                <th className="px-4 py-3">الطالب</th>
                <th className="px-4 py-3">المجموعة</th>
                <th className="px-4 py-3">فترة الاشتراك</th>
                <th className="px-4 py-3">المطلوب</th>
                <th className="px-4 py-3">المسدد</th>
                <th className="px-4 py-3">المتبقي</th>
                <th className="px-4 py-3">الحالة</th>
                <th className="px-4 py-3 text-center">إجراء السداد</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSubs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    لا توجد اشتراكات مسجلة مطابقة للبحث
                  </td>
                </tr>
              ) : (
                filteredSubs.map((sub) => (
                  <tr key={sub.id} className="hover:bg-slate-50 transition">
                    <td className="px-4 py-3">
                      <p className="font-bold text-[#111D2D]">{sub.student?.full_name}</p>
                      <p className="text-[10px] text-slate-400 font-mono">{sub.student?.student_code}</p>
                    </td>

                    <td className="px-4 py-3 text-slate-700 font-medium">
                      {sub.group?.name || 'اشتراك شهري'}
                    </td>

                    <td className="px-4 py-3 font-mono text-slate-500 text-[11px]">
                      {sub.cycle_start_date} إلى {sub.cycle_end_date}
                    </td>

                    <td className="px-4 py-3 font-bold text-[#111D2D]">
                      {sub.total_due} ج.م
                    </td>

                    <td className="px-4 py-3 font-bold text-emerald-600">
                      {sub.total_paid} ج.م
                    </td>

                    <td className="px-4 py-3 font-bold text-amber-600">
                      {sub.remaining_balance} ج.م
                    </td>

                    <td className="px-4 py-3">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                          sub.status === 'paid'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : sub.status === 'partially_paid'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : sub.status === 'unpaid'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-red-50 text-red-700 border border-red-200'
                        }`}
                      >
                        {sub.status === 'paid'
                          ? 'مدفوع بالكامل'
                          : sub.status === 'partially_paid'
                          ? 'مدفوع جزئياً'
                          : sub.status === 'unpaid'
                          ? 'غير مدفوع'
                          : 'متأخرات'}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => handleOpenPayment(sub)}
                        className="px-3 py-1.5 rounded-lg bg-[#C7A66A] hover:bg-[#B08E4F] text-[#111D2D] text-xs font-bold transition shadow-sm"
                      >
                        تحصيل دفعة
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payment Receipt / Record Modal */}
      {payingSubscription && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden border border-slate-200">
            <div className="p-5 bg-[#111D2D] text-white flex items-center justify-between">
              <h2 className="text-base font-bold flex items-center gap-2">
                <Receipt className="w-5 h-5 text-[#C7A66A]" />
                {generatedReceipt ? 'إيصال السداد الإلكتروني' : 'تسجيل سداد اشتراك'}
              </h2>
              <button
                onClick={() => setPayingSubscription(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {generatedReceipt ? (
              /* Receipt Preview */
              <div className="p-6 space-y-4 text-xs">
                <div className="border-2 border-[#111D2D] rounded-xl p-5 bg-slate-50 text-center space-y-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#C7A66A]/20 text-[#111D2D]">
                    {currentCenter.name_ar}
                  </span>
                  <h3 className="text-base font-extrabold text-[#111D2D]">
                    إيصال استلام نقدية
                  </h3>
                  <p className="font-mono text-xs font-bold text-[#27877E]">
                    {generatedReceipt.receipt_number}
                  </p>

                  <div className="my-3 py-2 border-y border-dashed border-slate-300 text-right space-y-1">
                    <p>
                      <strong>اسم الطالب:</strong> {students.find((s) => s.id === generatedReceipt.student_id)?.full_name}
                    </p>
                    <p>
                      <strong>المبلغ المسدد:</strong> <span className="font-bold text-emerald-700 text-sm">{generatedReceipt.amount} ج.م</span>
                    </p>
                    <p>
                      <strong>طريقة الدفع:</strong> {generatedReceipt.payment_method}
                    </p>
                    <p>
                      <strong>تاريخ المعاملة:</strong> {new Date(generatedReceipt.paid_at).toLocaleString('ar-EG')}
                    </p>
                  </div>

                  <p className="text-[10px] text-slate-400">
                    تم إصدار الإيصال إلكترونياً عبر منظومة حضر — مدار للتقنية
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => window.print()}
                    className="flex-1 py-2 rounded-lg bg-[#C7A66A] hover:bg-[#B08E4F] text-[#111D2D] font-bold text-xs flex items-center justify-center gap-1.5"
                  >
                    <Printer className="w-4 h-4" />
                    <span>طباعة الإيصال</span>
                  </button>
                  <button
                    onClick={() => setPayingSubscription(null)}
                    className="flex-1 py-2 rounded-lg border border-slate-200 text-slate-700 font-semibold"
                  >
                    إغلاق
                  </button>
                </div>
              </div>
            ) : (
              /* Payment Input Form */
              <form onSubmit={handleConfirmPayment} className="p-6 space-y-4 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <p className="font-bold text-sm text-[#111D2D]">
                    {students.find((s) => s.id === payingSubscription.student_id)?.full_name}
                  </p>
                  <div className="mt-1 flex items-center justify-between text-slate-600">
                    <span>إجمالي الرسوم: {payingSubscription.total_due} ج.م</span>
                    <span className="font-bold text-amber-700">المتبقي: {payingSubscription.remaining_balance} ج.م</span>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">المبلغ المحصل الآن (ج.م) *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    max={payingSubscription.remaining_balance || payingSubscription.total_due}
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm font-bold text-[#111D2D] focus:outline-none focus:border-[#C7A66A]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">طريقة السداد *</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as Payment['payment_method'])}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white font-semibold text-slate-800 focus:outline-none focus:border-[#C7A66A]"
                  >
                    <option value="cash">نقداً (كاش - بالسنتر)</option>
                    <option value="instapay">إنستاباي (InstaPay)</option>
                    <option value="vodafone_cash">فودافون كاش (محافظ إلكترونية)</option>
                    <option value="card">فيزا / بطاقة بنكية</option>
                    <option value="bank_transfer">تحويل بنكي</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">ملاحظات التحصيل (اختياري)</label>
                  <input
                    type="text"
                    value={paymentNotes}
                    onChange={(e) => setPaymentNotes(e.target.value)}
                    placeholder="مثال: دفعة من الحساب، تم إرسال رسالة تأكيد لوالد الطالب"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-[#C7A66A]"
                  />
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setPayingSubscription(null)}
                    className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 font-semibold"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-lg bg-[#C7A66A] hover:bg-[#B08E4F] text-[#111D2D] font-bold shadow-md"
                  >
                    تأكيد السداد وإصدار الإيصال
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

