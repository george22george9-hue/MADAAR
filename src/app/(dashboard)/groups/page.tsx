'use client';

// ====================================================================
// HADAR SaaS Platform — Groups & Recurring Schedules Module
// Developed by MADAAR Technologies
// ====================================================================

import React, { useState } from 'react';
import {
  BookOpen,
  Plus,
  Clock,
  Calendar,
  Users,
  MapPin,
  DollarSign,
  Edit2,
  Trash2,
  Play,
  X,
  GraduationCap
} from 'lucide-react';
import { useI18n } from '@/lib/i18n/context';
import { useData } from '@/lib/store/data-context';
import { Group, GroupScheduleItem } from '@/types/database';
import { useRouter } from 'next/navigation';

export default function GroupsPage() {
  const router = useRouter();
  const { t } = useI18n();
  const { groups, currentCenter, addGroup, updateGroup, addSession } = useData();

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    teacher_name: '',
    stage: 'الثانوية العامة',
    grade: 'الصف الثالث الثانوي',
    default_room: 'قاعة ابن الهيثم (1)',
    session_duration_minutes: 120,
    monthly_price: 450,
    schedule: [
      { day: 'Sunday', day_ar: 'الأحد', start_time: '16:00', end_time: '18:00' },
      { day: 'Wednesday', day_ar: 'الأربعاء', start_time: '16:00', end_time: '18:00' }
    ] as GroupScheduleItem[]
  });

  const handleOpenAdd = () => {
    setEditingGroup(null);
    setFormData({
      name: '',
      teacher_name: '',
      stage: 'الثانوية العامة',
      grade: 'الصف الثالث الثانوي',
      default_room: 'قاعة 1',
      session_duration_minutes: 120,
      monthly_price: 450,
      schedule: [
        { day: 'Sunday', day_ar: 'الأحد', start_time: '16:00', end_time: '18:00' }
      ]
    });
    setShowAddModal(true);
  };

  const handleOpenEdit = (group: Group) => {
    setEditingGroup(group);
    setFormData({
      name: group.name,
      teacher_name: group.teacher_name,
      stage: group.stage,
      grade: group.grade,
      default_room: group.default_room || '',
      session_duration_minutes: group.session_duration_minutes,
      monthly_price: group.monthly_price,
      schedule: group.schedule_config || []
    });
    setShowAddModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.teacher_name) return;

    if (editingGroup) {
      updateGroup(editingGroup.id, {
        name: formData.name,
        teacher_name: formData.teacher_name,
        stage: formData.stage,
        grade: formData.grade,
        default_room: formData.default_room,
        session_duration_minutes: Number(formData.session_duration_minutes),
        monthly_price: Number(formData.monthly_price),
        schedule_config: formData.schedule
      });
    } else {
      addGroup({
        center_id: currentCenter.id,
        name: formData.name,
        teacher_name: formData.teacher_name,
        stage: formData.stage,
        grade: formData.grade,
        default_room: formData.default_room,
        session_duration_minutes: Number(formData.session_duration_minutes),
        monthly_price: Number(formData.monthly_price),
        schedule_config: formData.schedule,
        status: 'active'
      });
    }
    setShowAddModal(false);
  };

  const handleQuickStartSession = (group: Group) => {
    const today = new Date().toISOString().split('T')[0];
    const newSession = addSession({
      center_id: currentCenter.id,
      group_id: group.id,
      session_date: today,
      start_time: '16:00:00',
      end_time: '18:00:00',
      status: 'open',
      title: `حصة ${group.name}`,
      room: group.default_room
    });
    router.push(`/scanner?session_id=${newSession.id}`);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#111D2D] flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-[#C7A66A]" />
            المجموعات الدراسية ({groups.length})
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            إدارة فصول ومجموعات الطلاب، المواعيد الأسبوعية المتكررة، وأسعار الاشتراكات.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#C7A66A] hover:bg-[#B08E4F] text-[#111D2D] text-xs font-bold shadow-gold transition"
        >
          <Plus className="w-4 h-4" />
          <span>إنشاء مجموعة جديدة</span>
        </button>
      </div>

      {/* Groups Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {groups.map((grp) => (
          <div
            key={grp.id}
            className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-card hover:border-[#C7A66A] transition flex flex-col justify-between"
          >
            <div>
              {/* Header */}
              <div className="flex items-start justify-between gap-2 mb-3">
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-teal-50 text-[#27877E] border border-teal-200">
                  {grp.grade}
                </span>
                <span className="font-bold text-xs text-[#111D2D] bg-slate-100 px-2.5 py-0.5 rounded-lg">
                  {grp.monthly_price} ج.م / شهر
                </span>
              </div>

              <h2 className="text-base font-bold text-[#111D2D] leading-tight mb-1">
                {grp.name}
              </h2>

              <p className="text-xs text-slate-600 font-medium flex items-center gap-1 mb-4">
                <GraduationCap className="w-4 h-4 text-[#C7A66A]" />
                المعلم: <strong>{grp.teacher_name}</strong>
              </p>

              {/* Recurring Schedules */}
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 space-y-1.5 mb-4">
                <p className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-[#27877E]" />
                  المواعيد الأسبوعية:
                </p>
                {grp.schedule_config?.map((sched, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs text-slate-700">
                    <span className="font-semibold">{sched.day_ar || sched.day}</span>
                    <span className="font-mono text-slate-500">{sched.start_time} - {sched.end_time}</span>
                  </div>
                ))}
              </div>

              {/* Room & Students info */}
              <div className="flex items-center justify-between text-xs text-slate-500 mb-4 px-1">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#C7A66A]" />
                  {grp.default_room || 'القاعة الرئيسية'}
                </span>
                <span className="flex items-center gap-1 font-semibold text-slate-700">
                  <Users className="w-3.5 h-3.5 text-[#27877E]" />
                  {grp.student_count || 5} طالب مقيد
                </span>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
              <button
                onClick={() => handleQuickStartSession(grp)}
                className="flex-1 py-2 rounded-lg bg-[#111D2D] hover:bg-[#1E2A3D] text-white text-xs font-bold flex items-center justify-center gap-1.5 transition"
                title="بدء حصة فورية وفتح الحضور"
              >
                <Play className="w-3.5 h-3.5 text-[#C7A66A] fill-current" />
                <span>بدء حصة الآن</span>
              </button>

              <button
                onClick={() => handleOpenEdit(grp)}
                className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 transition"
                title="تعديل المجموعة"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Group Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden border border-slate-200">
            <div className="p-5 bg-[#111D2D] text-white flex items-center justify-between">
              <h2 className="text-base font-bold flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-[#C7A66A]" />
                {editingGroup ? 'تعديل بيانات المجموعة' : 'إنشاء مجموعة جديدة'}
              </h2>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">اسم المجموعة *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-[#C7A66A]"
                  placeholder="مثال: رياضيات 3ث - مجموعة التفوق"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">اسم المعلم / المدرس *</label>
                  <input
                    type="text"
                    required
                    value={formData.teacher_name}
                    onChange={(e) => setFormData({ ...formData, teacher_name: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-[#C7A66A]"
                    placeholder="م. يوسف القاضي"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">الاشتراك الشهري (ج.م)</label>
                  <input
                    type="number"
                    required
                    value={formData.monthly_price}
                    onChange={(e) => setFormData({ ...formData, monthly_price: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-[#C7A66A]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">الصف الدراسي</label>
                  <select
                    value={formData.grade}
                    onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-[#C7A66A] bg-white"
                  >
                    <option value="الصف الثالث الثانوي">الصف الثالث الثانوي</option>
                    <option value="الصف الثاني الثانوي">الصف الثاني الثانوي</option>
                    <option value="الصف الأول الثانوي">الصف الأول الثانوي</option>
                    <option value="الصف الثالث الإعدادي">الصف الثالث الإعدادي</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">القاعة الافتراضية</label>
                  <input
                    type="text"
                    value={formData.default_room}
                    onChange={(e) => setFormData({ ...formData, default_room: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-[#C7A66A]"
                    placeholder="قاعة ابن الهيثم (1)"
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
                  {editingGroup ? 'حفظ التعديلات' : 'إنشاء المجموعة'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
