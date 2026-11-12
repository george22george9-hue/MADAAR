'use client';

// ====================================================================
// HADAR SaaS Platform — Localization (i18n) Engine
// Developed by MADAAR Technologies
// Primary: Arabic (RTL) | Secondary: English (LTR)
// ====================================================================

import React, { createContext, useContext, useState, useEffect } from 'react';

export type Locale = 'ar' | 'en';

interface TranslationMap {
  [key: string]: {
    ar: string;
    en: string;
  };
}

const translations: TranslationMap = {
  // Brand & General
  app_name: { ar: 'حضر', en: 'HADAR' },
  company_name: { ar: 'مدار للتقنية', en: 'MADAAR Technologies' },
  tagline: { ar: 'حضور أذكى. إدارة أسهل.', en: 'Smart Attendance. Smarter Management.' },
  search_placeholder: { ar: 'بحث سريع بالاسم، الكود، أو رقم الهاتف...', en: 'Quick search by name, code, or phone...' },
  switch_to_arabic: { ar: 'العربية', en: 'Arabic' },
  switch_to_english: { ar: 'English', en: 'الإنجليزية' },
  online: { ar: 'متصل بالإنترنت', en: 'Online' },
  offline: { ar: 'وضع أوفلاين', en: 'Offline' },
  pending_sync: { ar: 'سجلات معلقة للمزامنة', en: 'Pending Sync' },
  sync_now: { ar: 'مزامنة الآن', en: 'Sync Now' },
  all: { ar: 'الكل', en: 'All' },
  save: { ar: 'حفظ', en: 'Save' },
  cancel: { ar: 'إلغاء', en: 'Cancel' },
  delete: { ar: 'حذف', en: 'Delete' },
  edit: { ar: 'تعديل', en: 'Edit' },
  add: { ar: 'إضافة', en: 'Add' },
  actions: { ar: 'الإجراءات', en: 'Actions' },
  export_excel: { ar: 'تصدير إكسيل', en: 'Export Excel' },
  import_excel: { ar: 'استيراد من إكسيل', en: 'Import Excel' },
  print_qr_cards: { ar: 'طباعة كروت الـ QR', en: 'Print QR Cards' },

  // Navigation Items
  nav_dashboard: { ar: 'لوحة التحكم', en: 'Dashboard' },
  nav_scanner: { ar: 'الماسح الذكي QR', en: 'QR Scanner' },
  nav_students: { ar: 'الطلاب', en: 'Students' },
  nav_groups: { ar: 'المجموعات', en: 'Groups' },
  nav_sessions: { ar: 'الحصص والمواعيد', en: 'Sessions' },
  nav_history: { ar: 'سجل الحضور', en: 'Attendance History' },
  nav_subscriptions: { ar: 'الاشتراكات', en: 'Subscriptions' },
  nav_payments: { ar: 'المدفوعات والخزينة', en: 'Payments' },
  nav_reports: { ar: 'التقارير والإحصائيات', en: 'Reports' },
  nav_notifications: { ar: 'الإشعارات', en: 'Notifications' },
  nav_settings: { ar: 'إعدادات السنتر', en: 'Center Settings' },
  nav_super_admin: { ar: 'إدارة المنصة (Super Admin)', en: 'Super Admin Portal' },

  // Roles
  role_super_admin: { ar: 'مدير المنصة', en: 'Super Admin' },
  role_owner: { ar: 'مدير السنتر', en: 'Center Owner' },
  role_admin: { ar: 'مشرف إداري', en: 'Administrator' },
  role_assistant: { ar: 'مساعد حضور', en: 'Assistant' },
  role_teacher: { ar: 'مُدرس', en: 'Teacher' },

  // Dashboard KPIs
  kpi_total_students: { ar: 'إجمالي الطلاب المقيدين', en: 'Total Students' },
  kpi_active_students: { ar: 'الطلاب النشطين', en: 'Active Students' },
  kpi_today_attendance: { ar: 'حضور اليوم', en: "Today's Attendance" },
  kpi_today_absences: { ar: 'غياب اليوم', en: "Today's Absences" },
  kpi_late_arrivals: { ar: 'الوصول المتأخر', en: 'Late Arrivals' },
  kpi_active_groups: { ar: 'المجموعات الفعالة', en: 'Active Groups' },
  kpi_upcoming_sessions: { ar: 'الحصص القادمة اليوم', en: 'Upcoming Sessions' },
  kpi_outstanding_balance: { ar: 'المستحقات المعلقة', en: 'Outstanding Balance' },

  // Attendance Statuses
  status_present: { ar: 'حاضر', en: 'Present' },
  status_absent: { ar: 'غائب', en: 'Absent' },
  status_late: { ar: 'متأخر', en: 'Late' },
  status_excused: { ar: 'معتذر', en: 'Excused' },
  status_early_departure: { ar: 'انصراف مبكر', en: 'Early Departure' },

  // Scanner
  scanner_title: { ar: 'ماسح الحضور الذكي', en: 'Smart Attendance Scanner' },
  select_session_prompt: { ar: 'اختر الحصة أولاً لتفعيل الماسح:', en: 'Select a session first to activate camera:' },
  check_in_mode: { ar: 'تسجيل دخول (حضور)', en: 'Check-In' },
  check_out_mode: { ar: 'تسجيل انصراف', en: 'Check-Out' },
  scan_success_message: { ar: 'تمام، اتحضر بنجاح', en: 'Success! Attendance recorded' },
  scan_checkout_success: { ar: 'تم تسجيل الانصراف بنجاح', en: 'Success! Checked out' },
  manual_entry: { ar: 'تسجيل حضور يدوي', en: 'Manual Attendance' },
  manual_reason_prompt: { ar: 'سبب التعديل أو التسجيل اليدوي (إجباري للسجل):', en: 'Reason for manual override (Required for audit trail):' },

  // Students
  student_code: { ar: 'كود الطالب', en: 'Student Code' },
  student_name: { ar: 'اسم الطالب', en: 'Student Name' },
  parent_phone: { ar: 'هاتف ولي الأمر', en: 'Parent Phone' },
  student_phone: { ar: 'هاتف الطالب', en: 'Student Phone' },
  grade: { ar: 'الصف الدراسي', en: 'Grade' },
  stage: { ar: 'المرحلة التعليمية', en: 'Educational Stage' },
  enrolled_groups: { ar: 'المجموعات المشترك بها', en: 'Enrolled Groups' },
  add_student_title: { ar: 'إضافة طالب جديد', en: 'Add New Student' },
  qr_card: { ar: 'بطاقة QR الذكية', en: 'Smart QR Card' },

  // Financials
  subscription_status_paid: { ar: 'مدفوع بالكامل', en: 'Fully Paid' },
  subscription_status_partial: { ar: 'مدفوع جزئياً', en: 'Partially Paid' },
  subscription_status_unpaid: { ar: 'غير مدفوع', en: 'Unpaid' },
  subscription_status_overdue: { ar: 'متأخرات', en: 'Overdue' },
  record_payment: { ar: 'تسجيل دفعة نقدية', en: 'Record Payment' },
  receipt_number: { ar: 'رقم الإيصال', en: 'Receipt No.' },
  payment_method: { ar: 'طريقة السداد', en: 'Payment Method' },
  amount: { ar: 'المبلغ (ج.م)', en: 'Amount (EGP)' },
  remaining_balance: { ar: 'المتبقي', en: 'Remaining Balance' }
};

interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
  isRtl: boolean;
  dir: 'rtl' | 'ltr';
}

const I18nContext = createContext<I18nContextType | null>(null);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('ar');

  useEffect(() => {
    const saved = localStorage.getItem('hadar_locale') as Locale;
    if (saved === 'ar' || saved === 'en') {
      setLocaleState(saved);
    }
  }, []);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem('hadar_locale', newLocale);
    document.documentElement.setAttribute('dir', newLocale === 'ar' ? 'rtl' : 'ltr');
    document.documentElement.setAttribute('lang', newLocale);
  };

  const t = (key: string): string => {
    if (translations[key]) {
      return translations[key][locale] || translations[key].ar || key;
    }
    return key;
  };

  const isRtl = locale === 'ar';
  const dir = isRtl ? 'rtl' : 'ltr';

  return (
    <I18nContext.Provider value={{ locale, setLocale, t, isRtl, dir }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within I18nProvider');
  return ctx;
}
