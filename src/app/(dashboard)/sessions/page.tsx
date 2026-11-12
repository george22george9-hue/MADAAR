'use client';

// ====================================================================
// HADAR SaaS Platform — Session Management Module
// Developed by MADAAR Technologies
// ====================================================================

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  CalendarDays,
  Plus,
  Clock,
  QrCode,
  CheckCircle,
  XCircle,
  Play,
  Pause,
  Users,
  MapPin,
  X,
  Eye
} from 'lucide-react';
import { useI18n } from '@/lib/i18n/context';
import { useData } from '@/lib/store/data-context';
import { Session } from '@/types/database';

export default function SessionsPage() {
  const router = useRouter();
  const { t } = useI18n();
  const { sessions, groups, currentCenter, addSession, updateSessionStatus, attendance } = useData();

  const [selectedGroupId, setSelectedGroupId] = useState('ALL');
  const [showAddModal, setShowAddModal] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    group_id: groups[0]?.id || '',
    session_date: new Date().toISOString().split('T')[0],
    start_time: '16:00:00',
    end_time: '18:00:00',
    title: '',
    room: 'قاعة 1',
    notes: ''
  });

  const filteredSessions = sessions.filter((s) => {
    return selectedGroupId === 'ALL' || s.group_id === selectedGroupId;
  });

  const handleCreateSession = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.group_id) return;

    addSession({
      center_id: currentCenter.id,
      group_id: formData.group_id,
      session_date: formData.session_date,
      start_time: formData.start_time,
      end_time: formData.end_time,
      status: 'open',
      title: formData.title || 'حصة تدريسية',
      room: formData.room,
      notes: formData.notes
    });

    setShowAddModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#111D2D] flex items-center gap-2">
            <CalendarDays className="w-6 h-6 text-[#27877E]" />
            الحصص والمواعيد ({filteredSessions.length})
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            جدولة الحصص الدراسية، فتح وإغلاق تسجيل الحضور، ومتابعة نسبة الإقبال لحظياً.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#C7A66A] hover:bg-[#B08E4F] text-[#111D2D] text-xs font-bold shadow-gold transition"
        >
          <Plus className="w-4 h-4" />
          <span>جدولة حصة جديدة</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-600">تصفية حسب المجموعة:</span>
          <select
            value={selectedGroupId}
            onChange={(e) => setSelectedGroupId(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs bg-white text-slate-700 focus:outline-none focus:border-[#C7A66A]"
          >
            <option value="ALL">جميع المجموعات</option>
            {groups.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Sessions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredSessions.map((session) => {
          const group = groups.find((g) => g.id === session.group_id);
          const attendedCount = attendance.filter((a) => a.session_id === session.id && (a.status === 'present' || a.status === 'late')).length;

          return (
            <div
              key={session.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-card hover:border-[#27877E] transition flex flex-col justify-between"
            >
              <div>
                {/* Header status */}
                <div className="flex items-center justify-between mb-3">
                  <span
                    className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                      session.status === 'open'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200 animate-pulse'
                        : session.status === 'scheduled'
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : session.status === 'completed'
                        ? 'bg-slate-100 text-slate-700'
                        : 'bg-red-50 text-red-700'
                    }`}
                  >
                    {session.status === 'open'
                      ? '● الحضور مفتوح الآن'
                      : session.status === 'scheduled'
                      ? 'مجدولة'
                      : session.status === 'completed'
                      ? 'مكتملة'
                      : 'ملغاة'}
                  </span>

                  <span className="text-xs font-mono text-slate-500">
                    {session.session_date}
                  </span>
                </div>

                <h2 className="text-base font-bold text-[#111D2D] leading-tight mb-1">
                  {session.title || group?.name}
                </h2>
                <p className="text-xs text-[#27877E] font-semibold mb-3">
                  {group?.name} ({group?.teacher_name})
                </p>

                {/* Details */}
                <div className="space-y-1.5 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100 mb-4">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-[#C7A66A]" />
                      الوقت:
                    </span>
                    <span className="font-mono">{session.start_time} - {session.end_time}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-[#C7A66A]" />
                      المكان:
                    </span>
                    <span>{session.room || group?.default_room || 'القاعة الرئيسية'}</span>
                  </div>
                  <div className="flex items-center justify-between font-bold pt-1 border-t border-slate-200">
                    <span className="flex items-center gap-1 text-slate-700">
                      <Users className="w-3.5 h-3.5 text-[#27877E]" />
                      نسبة الحضور:
                    </span>
                    <span className="text-emerald-700">
                      {attendedCount} من {session.total_students || group?.student_count || 5} طالب
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                {/* Scanner link */}
                <Link
                  href={`/scanner?session_id=${session.id}`}
                  className="w-full py-2.5 rounded-xl bg-[#C7A66A] hover:bg-[#B08E4F] text-[#111D2D] font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition"
                >
                  <QrCode className="w-4 h-4" />
                  <span>فتح الماسح لهذه الحصة</span>
                </Link>

                <div className="flex items-center gap-2">
                  {session.status === 'open' ? (
                    <button
                      onClick={() => updateSessionStatus(session.id, 'completed')}
                      className="flex-1 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center justify-center gap-1 transition"
                    >
                      <Pause className="w-3.5 h-3.5 text-amber-600" />
                      <span>إغلاق الحضور</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => updateSessionStatus(session.id, 'open')}
                      className="flex-1 py-1.5 rounded-lg border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold flex items-center justify-center gap-1 transition"
                    >
                      <Play className="w-3.5 h-3.5 text-emerald-600 fill-current" />
                      <span>فتح الحضور</span>
                    </button>
                  )}

                  <Link
                    href={`/history?session_id=${session.id}`}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-semibold flex items-center gap-1 transition"
                    title="عرض كشف حضور الحصة"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>الكشف</span>
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Session Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden border border-slate-200">
            <div className="p-5 bg-[#111D2D] text-white flex items-center justify-between">
              <h2 className="text-base font-bold flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-[#C7A66A]" />
                جدولة حصة جديدة
              </h2>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSession} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">المجموعة الدراسية *</label>
                <select
                  required
                  value={formData.group_id}
                  onChange={(e) => setFormData({ ...formData, group_id: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-[#C7A66A] bg-white"
                >
                  {groups.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name} ({g.teacher_name})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">عنوان أو موضوع الحصة (اختياري)</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="مثال: مراجعة الباب الثاني - الاتزان الكيميائي"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-[#C7A66A]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">تاريخ الحصة *</label>
                  <input
                    type="date"
                    required
                    value={formData.session_date}
                    onChange={(e) => setFormData({ ...formData, session_date: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-[#C7A66A]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">القاعة</label>
                  <input
                    type="text"
                    value={formData.room}
                    onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-[#C7A66A]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">وقت البدء *</label>
                  <input
                    type="time"
                    required
                    value={formData.start_time}
                    onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-[#C7A66A]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">وقت الانتهاء *</label>
                  <input
                    type="time"
                    required
                    value={formData.end_time}
                    onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-[#C7A66A]"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-[#C7A66A] hover:bg-[#B08E4F] text-[#111D2D] font-bold shadow-md"
                >
                  إنشاء الحصة وفتح الحضور
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
