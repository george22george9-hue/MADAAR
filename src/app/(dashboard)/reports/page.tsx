'use client';

// ====================================================================
// HADAR SaaS Platform — Reports & Analytics Engine
// Developed by MADAAR Technologies
// ====================================================================

import React, { useState } from 'react';
import {
  BarChart3,
  Calendar,
  Download,
  Printer,
  FileSpreadsheet,
  Users,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  TrendingUp,
  Percent
} from 'lucide-react';
import { useI18n } from '@/lib/i18n/context';
import { useData } from '@/lib/store/data-context';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import * as XLSX from 'xlsx';

export default function ReportsPage() {
  const { t } = useI18n();
  const {
    students,
    groups,
    attendance,
    subscriptions,
    payments,
    currentCenter
  } = useData();

  const [reportType, setReportType] = useState<
    'attendance_overview' | 'student_percentage' | 'financial_summary'
  >('attendance_overview');

  const [selectedGroupId, setSelectedGroupId] = useState('ALL');

  // Student Attendance Statistics
  const studentStats = students.map((s) => {
    const studentRecords = attendance.filter((a) => a.student_id === s.id);
    const present = studentRecords.filter((a) => a.status === 'present').length;
    const late = studentRecords.filter((a) => a.status === 'late').length;
    const totalSessions = Math.max(studentRecords.length, 1);
    const rate = Math.round(((present + late) / totalSessions) * 100);

    return {
      ...s,
      present,
      late,
      totalSessions,
      rate
    };
  });

  // Financial Stats
  const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);
  const totalOutstanding = subscriptions.reduce((sum, s) => sum + s.remaining_balance, 0);

  // Status breakdown for Pie Chart
  const statusPieData = [
    { name: 'حاضر في الموعد', value: attendance.filter((a) => a.status === 'present').length || 1, color: '#27877E' },
    { name: 'متأخر', value: attendance.filter((a) => a.status === 'late').length || 1, color: '#F59E0B' },
    { name: 'غائب', value: 2, color: '#EF4444' }
  ];

  // Export current report to Excel
  const handleExportExcel = () => {
    let data: any[] = [];
    let sheetName = 'تقرير';

    if (reportType === 'student_percentage') {
      sheetName = 'نسب_حضور_الطلاب';
      data = studentStats.map((s, idx) => ({
        '#': idx + 1,
        'كود الطالب': s.student_code,
        'اسم الطالب': s.full_name,
        'الصف': s.grade,
        'حضور في الموعد': s.present,
        'حضور متأخر': s.late,
        'إجمالي الحصص': s.totalSessions,
        'نسبة الالتزام %': `${s.rate}%`
      }));
    } else if (reportType === 'financial_summary') {
      sheetName = 'التقرير_المالي';
      data = payments.map((p, idx) => {
        const student = students.find((s) => s.id === p.student_id);
        return {
          '#': idx + 1,
          'رقم الإيصال': p.receipt_number,
          'اسم الطالب': student?.full_name || '-',
          'المبلغ (ج.م)': p.amount,
          'طريقة السداد': p.payment_method,
          'التاريخ': new Date(p.paid_at).toLocaleString('ar-EG')
        };
      });
    } else {
      sheetName = 'ملخص_حضور_المجموعات';
      data = groups.map((g, idx) => ({
        '#': idx + 1,
        'اسم المجموعة': g.name,
        'المعلم': g.teacher_name,
        'عدد الطلاب المقيدين': g.student_count || 5,
        'سعر الاشتراك': `${g.monthly_price} ج.م`
      }));
    }

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    XLSX.writeFile(
      workbook,
      `HADAR_${sheetName}_${currentCenter.slug}_${new Date().toISOString().split('T')[0]}.xlsx`
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#111D2D] flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-[#27877E]" />
            التقارير والإحصائيات التحليلية
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            تقارير نسب الحضور، مؤشرات أداء المجموعات، وملخص الإيرادات والمستحقات المالية.
          </p>
        </div>

        {/* Export Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportExcel}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-sm transition"
          >
            <Download className="w-4 h-4 text-emerald-600" />
            <span>تصدير تقرير Excel</span>
          </button>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#C7A66A] hover:bg-[#B08E4F] text-[#111D2D] text-xs font-bold shadow-gold transition"
          >
            <Printer className="w-4 h-4" />
            <span>طباعة التقرير (PDF)</span>
          </button>
        </div>
      </div>

      {/* Report Selection Tabs */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-2 overflow-x-auto">
        <button
          onClick={() => setReportType('attendance_overview')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            reportType === 'attendance_overview'
              ? 'bg-[#111D2D] text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <TrendingUp className="w-4 h-4 text-[#C7A66A]" />
          <span>ملخص الحضور العام والمجموعات</span>
        </button>

        <button
          onClick={() => setReportType('student_percentage')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            reportType === 'student_percentage'
              ? 'bg-[#111D2D] text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Percent className="w-4 h-4 text-[#27877E]" />
          <span>نسب حضور الطلاب ومعدل الالتزام</span>
        </button>

        <button
          onClick={() => setReportType('financial_summary')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            reportType === 'financial_summary'
              ? 'bg-[#111D2D] text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <DollarSign className="w-4 h-4 text-amber-500" />
          <span>التقرير المالي والمقبوضات</span>
        </button>
      </div>

      {/* Visual Analytics Grid */}
      {reportType === 'attendance_overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
            <h2 className="text-sm font-bold text-[#111D2D] mb-4">
              مقارنة أعداد الطلاب بكل مجموعة
            </h2>
            <div className="h-64 w-full" dir="ltr">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={groups} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E9F0" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#60769A' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#60769A' }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#111D2D', color: '#fff', borderRadius: '8px', fontSize: '12px' }}
                  />
                  <Bar dataKey="student_count" name="عدد الطلاب" fill="#27877E" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex flex-col items-center justify-center">
            <h2 className="text-sm font-bold text-[#111D2D] mb-2 self-start">
              توزيع حالات الحضور
            </h2>
            <div className="h-52 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {statusPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="w-full flex items-center justify-around text-xs font-semibold text-slate-600 mt-2">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-[#27877E]"></span> حاضر
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]"></span> متأخر
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444]"></span> غائب
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Student Attendance Rate Table */}
      {reportType === 'student_percentage' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <h2 className="text-xs font-bold text-slate-700">
              تقرير التزام وحضور الطلاب الفردي
            </h2>
            <span className="text-xs text-slate-500 font-medium">
              إجمالي الطلاب: {students.length}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                <tr>
                  <th className="px-4 py-3">الطالب</th>
                  <th className="px-4 py-3">كود الطالب</th>
                  <th className="px-4 py-3">الصف الدراسي</th>
                  <th className="px-4 py-3">حضور في الموعد</th>
                  <th className="px-4 py-3">وصول متأخر</th>
                  <th className="px-4 py-3">نسبة الالتزام</th>
                  <th className="px-4 py-3 text-center">التقييم العام</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {studentStats.map((st) => (
                  <tr key={st.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-bold text-[#111D2D]">
                      {st.full_name}
                    </td>
                    <td className="px-4 py-3 font-mono font-bold text-[#27877E]">
                      {st.student_code}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {st.grade}
                    </td>
                    <td className="px-4 py-3 font-semibold text-emerald-700">
                      {st.present} حصة
                    </td>
                    <td className="px-4 py-3 font-semibold text-amber-700">
                      {st.late} حصة
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              st.rate >= 80 ? 'bg-[#27877E]' : st.rate >= 60 ? 'bg-amber-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${st.rate}%` }}
                          ></div>
                        </div>
                        <span className="font-bold text-slate-700 font-mono">{st.rate}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          st.rate >= 80
                            ? 'bg-emerald-50 text-emerald-700'
                            : st.rate >= 60
                            ? 'bg-amber-50 text-amber-700'
                            : 'bg-red-50 text-red-700'
                        }`}
                      >
                        {st.rate >= 80 ? 'ممتاز' : st.rate >= 60 ? 'متوسط' : 'يحتاج متابعة'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Financial Summary Table */}
      {reportType === 'financial_summary' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
              <p className="text-xs text-slate-500 font-semibold">إجمالي الإيرادات المحصلة</p>
              <p className="text-2xl font-bold text-emerald-600 mt-2">
                {totalRevenue.toLocaleString()} <span className="text-xs font-medium text-slate-500">ج.م</span>
              </p>
            </div>
            <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
              <p className="text-xs text-slate-500 font-semibold">إجمالي المتبقيات المستحقة</p>
              <p className="text-2xl font-bold text-amber-600 mt-2">
                {totalOutstanding.toLocaleString()} <span className="text-xs font-medium text-slate-500">ج.م</span>
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200">
              <h2 className="text-xs font-bold text-slate-700">حركات التحصيل والإيصالات</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                  <tr>
                    <th className="px-4 py-3">رقم الإيصال</th>
                    <th className="px-4 py-3">الطالب</th>
                    <th className="px-4 py-3">المبلغ</th>
                    <th className="px-4 py-3">قناة التحصيل</th>
                    <th className="px-4 py-3">التاريخ والوقت</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {payments.map((p) => {
                    const st = students.find((s) => s.id === p.student_id);
                    return (
                      <tr key={p.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3 font-mono font-bold text-[#27877E]">{p.receipt_number}</td>
                        <td className="px-4 py-3 font-bold text-[#111D2D]">{st?.full_name}</td>
                        <td className="px-4 py-3 font-bold text-emerald-700">{p.amount} ج.م</td>
                        <td className="px-4 py-3 font-medium text-slate-700">{p.payment_method}</td>
                        <td className="px-4 py-3 font-mono text-slate-500">{new Date(p.paid_at).toLocaleString('ar-EG')}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
