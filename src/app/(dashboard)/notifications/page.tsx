'use client';

// ====================================================================
// HADAR SaaS Platform — Notifications Center
// Developed by MADAAR Technologies
// ====================================================================

import React, { useState } from 'react';
import {
  Bell,
  AlertTriangle,
  Clock,
  CreditCard,
  CheckCircle,
  MessageSquare,
  RefreshCw,
  Check
} from 'lucide-react';
import { useI18n } from '@/lib/i18n/context';
import { useData } from '@/lib/store/data-context';

export default function NotificationsPage() {
  const { t } = useI18n();
  const { notifications, markNotificationRead, students, currentCenter } = useData();

  const [filterType, setFilterType] = useState<string>('ALL');

  const filteredNotifications = notifications.filter((n) => {
    if (filterType === 'UNREAD') return !n.is_read;
    if (filterType !== 'ALL') return n.type === filterType;
    return true;
  });

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#111D2D] flex items-center gap-2">
            <Bell className="w-6 h-6 text-[#C7A66A]" />
            مركز الإشعارات والتنبيهات الذكية
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            تنبيهات الغياب المتكرر، أقساط الاشتراكات المتأخرة، وتنبيهات مزامنة الأجهزة.
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3 overflow-x-auto text-xs">
        <button
          onClick={() => setFilterType('ALL')}
          className={`px-3 py-1.5 rounded-lg font-bold transition ${
            filterType === 'ALL' ? 'bg-[#111D2D] text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          الكل ({notifications.length})
        </button>
        <button
          onClick={() => setFilterType('UNREAD')}
          className={`px-3 py-1.5 rounded-lg font-bold transition ${
            filterType === 'UNREAD' ? 'bg-[#111D2D] text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          غير مقروء ({notifications.filter((n) => !n.is_read).length})
        </button>
        <button
          onClick={() => setFilterType('repeated_absence')}
          className={`px-3 py-1.5 rounded-lg font-bold transition ${
            filterType === 'repeated_absence' ? 'bg-[#111D2D] text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          غياب متكرر
        </button>
        <button
          onClick={() => setFilterType('payment_overdue')}
          className={`px-3 py-1.5 rounded-lg font-bold transition ${
            filterType === 'payment_overdue' ? 'bg-[#111D2D] text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          مستحقات معلقة
        </button>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filteredNotifications.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-sm text-slate-400">
            <Bell className="w-10 h-10 mx-auto mb-2 text-slate-300" />
            <p className="font-semibold text-sm">لا توجد تنبيهات حالياً في هذا القسم</p>
          </div>
        ) : (
          filteredNotifications.map((n) => {
            const studentId = (n.data as any)?.student_id;
            const student = studentId ? students.find((s) => s.id === studentId) : null;

            return (
              <div
                key={n.id}
                className={`p-4 rounded-xl border transition flex items-start justify-between gap-4 ${
                  !n.is_read
                    ? 'bg-white border-[#C7A66A]/40 shadow-sm'
                    : 'bg-slate-50/70 border-slate-200 text-slate-600'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${
                      n.type === 'repeated_absence'
                        ? 'bg-red-50 text-red-600 border border-red-200'
                        : n.type === 'payment_overdue'
                        ? 'bg-amber-50 text-amber-600 border border-amber-200'
                        : 'bg-blue-50 text-blue-600 border border-blue-200'
                    }`}
                  >
                    {n.type === 'repeated_absence' ? (
                      <AlertTriangle className="w-5 h-5" />
                    ) : n.type === 'payment_overdue' ? (
                      <CreditCard className="w-5 h-5" />
                    ) : (
                      <Bell className="w-5 h-5" />
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-sm font-bold text-[#111D2D]">{n.title}</h2>
                      {!n.is_read && (
                        <span className="w-2 h-2 rounded-full bg-[#C7A66A]"></span>
                      )}
                    </div>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">{n.message}</p>
                    <p className="text-[11px] text-slate-400 mt-2 font-mono">
                      {new Date(n.created_at).toLocaleString('ar-EG')}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  {student && (
                    <a
                      href={`https://wa.me/2${student.parent_phone}?text=${encodeURIComponent(`تحية طيبة من ${currentCenter.name_ar}. نود التنبيه بخصوص الطالب ${student.full_name}: ${n.message}`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#25D366] hover:bg-[#1EBE5D] text-white text-xs font-bold transition shadow-sm"
                      title="مراسلة ولي الأمر على واتساب"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>واتساب</span>
                    </a>
                  )}

                  {!n.is_read && (
                    <button
                      onClick={() => markNotificationRead(n.id)}
                      className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100 transition"
                      title="تحديد كمقروء"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
