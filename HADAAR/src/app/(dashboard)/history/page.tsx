'use client';

// ====================================================================
// HADAR SaaS Platform — Attendance History & Audit Trail
// Developed by MADAAR Technologies
// ====================================================================

import React, { useState, useMemo } from 'react';
import {
  History,
  Search,
  Filter,
  Download,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  Shield,
  FileSpreadsheet,
  Edit2,
  Calendar,
  X,
  UserCheck
} from 'lucide-react';
import { useI18n } from '@/lib/i18n/context';
import { useData } from '@/lib/store/data-context';
import { AttendanceStatus, AttendanceRecord } from '@/types/database';
import { exportAttendanceToExcel } from '@/lib/excel/service';

export default function HistoryPage() {
  const { t } = useI18n();
  const {
    attendance,
    auditLogs,
    students,
    groups,
    sessions,
    currentCenter,
    recordManualAttendance
  } = useData();

  // Active Tab
  const [activeTab, setActiveTab] = useState<'attendance' | 'audit'>('attendance');

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroupId, setSelectedGroupId] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

  // Edit Modal State
  const [editingRecord, setEditingRecord] = useState<AttendanceRecord | null>(null);
  const [newStatus, setNewStatus] = useState<AttendanceStatus>('present');
  const [auditReason, setAuditReason] = useState('');

  // Filtered Attendance Records
  const filteredAttendance = useMemo(() => {
    return attendance
      .map((att) => {
        const student = students.find((s) => s.id === att.student_id);
        const session = sessions.find((s) => s.id === att.session_id);
        const group = session ? groups.find((g) => g.id === session.group_id) : null;
        return {
          ...att,
          student,
          session,
          group
        };
      })
      .filter((item) => {
        const matchesSearch =
          !searchQuery ||
          item.student?.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.student?.student_code.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesGroup =
          selectedGroupId === 'ALL' || item.group?.id === selectedGroupId;

        const matchesStatus =
          selectedStatus === 'ALL' || item.status === selectedStatus;

        return matchesSearch && matchesGroup && matchesStatus;
      });
  }, [attendance, students, sessions, groups, searchQuery, selectedGroupId, selectedStatus]);

  // Aggregate Stats
  const presentCount = filteredAttendance.filter((a) => a.status === 'present').length;
  const lateCount = filteredAttendance.filter((a) => a.status === 'late').length;
  const excusedCount = filteredAttendance.filter((a) => a.status === 'excused').length;
  const absentCount = filteredAttendance.filter((a) => a.status === 'absent').length;

  const handleOpenEdit = (rec: AttendanceRecord) => {
    setEditingRecord(rec);
    setNewStatus(rec.status);
    setAuditReason('');
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRecord || !auditReason.trim()) return;

    await recordManualAttendance(
      editingRecord.session_id,
      editingRecord.student_id,
      newStatus,
      auditReason
    );

    setEditingRecord(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#111D2D] flex items-center gap-2">
            <History className="w-6 h-6 text-[#27877E]" />
            سجل الحضور والتدقيق الإداري
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            سجل الحضور الموثق، تفاصيل تسجيل الدخول والانصراف، ومتابعة سجل التعديلات اليدوية.
          </p>
        </div>

        <button
          onClick={() => exportAttendanceToExcel(filteredAttendance, currentCenter.name_ar)}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-sm transition"
        >
          <Download className="w-4 h-4 text-emerald-600" />
          <span>تصدير السجل إلى Excel</span>
        </button>
      </div>

      {/* Stats Summary Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
          <p className="text-xs text-slate-500 font-medium">حاضر في الموعد</p>
          <p className="text-xl font-bold text-emerald-600 mt-1">{presentCount}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
          <p className="text-xs text-slate-500 font-medium">وصول متأخر</p>
          <p className="text-xl font-bold text-amber-600 mt-1">{lateCount}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
          <p className="text-xs text-slate-500 font-medium">معتذر بإذن</p>
          <p className="text-xl font-bold text-indigo-600 mt-1">{excusedCount}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
          <p className="text-xs text-slate-500 font-medium">غائب</p>
          <p className="text-xl font-bold text-red-600 mt-1">{absentCount}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-4">
        <button
          onClick={() => setActiveTab('attendance')}
          className={`pb-3 text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'attendance'
              ? 'border-b-2 border-[#C7A66A] text-[#111D2D]'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <History className="w-4 h-4" />
          <span>سجل الحضور الكامل ({filteredAttendance.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('audit')}
          className={`pb-3 text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'audit'
              ? 'border-b-2 border-[#C7A66A] text-[#111D2D]'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Shield className="w-4 h-4 text-amber-600" />
          <span>سجل التدقيق والمراجعة الإدارية ({auditLogs.length})</span>
        </button>
      </div>

      {/* Tab 1: Attendance Records */}
      {activeTab === 'attendance' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="relative w-full md:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="بحث باسم الطالب أو الكود..."
                className="w-full pr-9 pl-4 py-2 rounded-lg border border-slate-200 text-xs focus:outline-none focus:border-[#C7A66A]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 w-full md:w-auto">
              <select
                value={selectedGroupId}
                onChange={(e) => setSelectedGroupId(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs bg-white text-slate-700 focus:outline-none focus:border-[#C7A66A]"
              >
                <option value="ALL">جميع المجموعات</option>
                {groups.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name}
                  </option>
                ))}
              </select>

              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs bg-white text-slate-700 focus:outline-none focus:border-[#C7A66A]"
              >
                <option value="ALL">جميع الحالات</option>
                <option value="present">حاضر فقط</option>
                <option value="late">متأخر فقط</option>
                <option value="excused">معتذر فقط</option>
                <option value="absent">غائب فقط</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                  <tr>
                    <th className="px-4 py-3">الطالب</th>
                    <th className="px-4 py-3">المجموعة</th>
                    <th className="px-4 py-3">الحالة</th>
                    <th className="px-4 py-3">وقت الحضور</th>
                    <th className="px-4 py-3">وقت الانصراف</th>
                    <th className="px-4 py-3">طريقة التسجيل</th>
                    <th className="px-4 py-3">ملاحظات</th>
                    <th className="px-4 py-3 text-center">تعديل إداري</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredAttendance.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-slate-400">
                        لا توجد سجلات حضور مطابقة
                      </td>
                    </tr>
                  ) : (
                    filteredAttendance.map((rec) => (
                      <tr key={rec.id} className="hover:bg-slate-50 transition">
                        <td className="px-4 py-3">
                          <div className="font-bold text-[#111D2D]">{rec.student?.full_name}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{rec.student?.student_code}</div>
                        </td>
                        <td className="px-4 py-3 text-slate-700">
                          {rec.group?.name || 'مجموعة عامة'}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                              rec.status === 'present'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : rec.status === 'late'
                                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                : rec.status === 'excused'
                                ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                                : 'bg-red-50 text-red-700 border border-red-200'
                            }`}
                          >
                            {rec.status === 'present'
                              ? 'حاضر'
                              : rec.status === 'late'
                              ? 'متأخر'
                              : rec.status === 'excused'
                              ? 'معتذر'
                              : 'غائب'}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-mono text-slate-600">
                          {rec.check_in_time ? new Date(rec.check_in_time).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }) : '-'}
                        </td>
                        <td className="px-4 py-3 font-mono text-slate-600">
                          {rec.check_out_time ? new Date(rec.check_out_time).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }) : '-'}
                        </td>
                        <td className="px-4 py-3 text-slate-500">
                          {rec.recorded_via === 'qr_scanner' ? 'الماسح الذكي QR' : 'يدوي (إداري)'}
                        </td>
                        <td className="px-4 py-3 text-slate-500">
                          {rec.notes || '-'}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => handleOpenEdit(rec)}
                            className="p-1.5 rounded hover:bg-slate-100 text-slate-600 transition"
                            title="تعديل الحالة مع توثيق السبب"
                          >
                            <Edit2 className="w-3.5 h-3.5 text-[#27877E]" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Audit Trail Log */}
      {activeTab === 'audit' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 bg-amber-50/50 border-b border-amber-100 flex items-center gap-2 text-amber-900 text-xs font-semibold">
            <Shield className="w-4 h-4 text-amber-600" />
            <span>سجل التدقيق يوثق تلقائياً كل تعديل يدوي، واسم المشرف، والسبب، والوقت، والقيمة السابقة.</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                <tr>
                  <th className="px-4 py-3">تاريخ ووقت التعديل</th>
                  <th className="px-4 py-3">نوع الإجراء</th>
                  <th className="px-4 py-3">الحالة السابقة</th>
                  <th className="px-4 py-3">الحالة الجديدة</th>
                  <th className="px-4 py-3">سبب التعديل الموثق</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {auditLogs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-10 text-center text-slate-400">
                      لا توجد تعديلات يدوية مسجلة في سجل التدقيق
                    </td>
                  </tr>
                ) : (
                  auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-mono text-slate-600">
                        {new Date(log.timestamp).toLocaleString('ar-EG')}
                      </td>
                      <td className="px-4 py-3 font-bold text-[#111D2D]">
                        {log.action === 'status_changed' ? 'تعديل حالة حضور' : 'تسجيل حضور يدوي'}
                      </td>
                      <td className="px-4 py-3 text-slate-500">
                        {log.previous_status || 'لا يوجد'}
                      </td>
                      <td className="px-4 py-3 font-bold text-[#27877E]">
                        {log.new_status}
                      </td>
                      <td className="px-4 py-3 text-slate-700 bg-amber-50/30 font-medium">
                        {log.reason}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Manual Status Edit Modal */}
      {editingRecord && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden border border-slate-200">
            <div className="p-5 bg-[#111D2D] text-white flex items-center justify-between">
              <h2 className="text-base font-bold flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-[#C7A66A]" />
                تعديل حالة الحضور وتوثيق السبب
              </h2>
              <button onClick={() => setEditingRecord(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-6 space-y-4 text-xs">
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <p className="font-bold text-[#111D2D] text-sm">{editingRecord.student?.full_name}</p>
                <p className="text-slate-500 font-mono mt-0.5">{editingRecord.student?.student_code}</p>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">الحالة الجديدة:</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as AttendanceStatus)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 font-semibold text-slate-800 bg-white focus:outline-none focus:border-[#C7A66A]"
                >
                  <option value="present">حاضر (Present)</option>
                  <option value="late">متأخر (Late)</option>
                  <option value="excused">معتذر (Excused)</option>
                  <option value="absent">غائب (Absent)</option>
                  <option value="early_departure">انصراف مبكر (Early Departure)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  سبب التعديل * (إجباري للتسجيل في سجل التدقيق):
                </label>
                <textarea
                  rows={3}
                  required
                  value={auditReason}
                  onChange={(e) => setAuditReason(e.target.value)}
                  placeholder="اكتب سبب تعديل الحالة بوضوح..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-[#C7A66A]"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingRecord(null)}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-[#C7A66A] hover:bg-[#B08E4F] text-[#111D2D] font-bold shadow-md"
                >
                  تأكيد وتوثيق التعديل
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

