// ====================================================================
// HADAR SaaS Platform — High-Fidelity Data Store & Business Engine
// Developed by MADAAR Technologies
// ====================================================================

import {
  Center,
  Student,
  Group,
  Session,
  AttendanceRecord,
  AttendanceAuditLog,
  StudentSubscription,
  Payment,
  NotificationItem,
  Subject,
  UserProfile,
  SubscriptionPlan
} from '@/types/database';

export const INITIAL_PLANS: SubscriptionPlan[] = [
  {
    id: 'STARTER',
    name_ar: 'الباقة الأساسية',
    name_en: 'Starter Plan',
    base_fee: 300,
    price_per_student: 0,
    min_students: 0,
    max_students: 150,
    features: ['حتى 150 طالب', 'تسجيل الحضور بالـ QR', 'إدارة المجموعات والطلاب', 'سجل الحضور الأساسي'],
    is_active: true
  },
  {
    id: 'GROWTH',
    name_ar: 'باقة النمو',
    name_en: 'Growth Plan',
    base_fee: 0,
    price_per_student: 2,
    min_students: 151,
    max_students: 1000,
    features: ['من 150 إلى 1000 طالب', '2 جنيه لكل طالب شهرياً', 'حضور أوفلاين وسنك', 'تقارير متقدمة وتنبيهات غياب'],
    is_active: true
  },
  {
    id: 'ENTERPRISE',
    name_ar: 'باقة المؤسسات الكبرى',
    name_en: 'Enterprise Plan',
    base_fee: 0,
    price_per_student: 2,
    min_students: 1001,
    max_students: null,
    features: ['أكثر من 1000 طالب', 'تخصيص كامل واسم مخصص', 'دعم فني مخصص 24/7', 'سيرفرات فائقة الأداء'],
    is_active: true
  }
];

export const INITIAL_CENTERS: Center[] = [
  {
    id: 'a0000000-0000-0000-0000-000000000001',
    slug: 'al-nokhba',
    name_ar: 'سنتر النخبة التعليمي',
    name_en: 'Al-Nokhba Educational Center',
    phone: '01012345678',
    email: 'contact@alnokhba-center.com',
    address: 'شارع مصطفى النحاس، مدينة نصر، القاهرة',
    subscription_tier: 'GROWTH',
    subscription_status: 'active',
    student_limit: 500,
    has_financial_addon: true,
    financial_addon_fee: 100,
    settings: {
      late_grace_minutes: 15,
      require_checkout: false,
      currency: 'EGP',
      primary_language: 'ar',
      theme: 'navy-gold',
      contact_whatsapp: '201012345678'
    },
    created_at: new Date(Date.now() - 60 * 86400000).toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'a0000000-0000-0000-0000-000000000002',
    slug: 'rowad-al-mustaqbal',
    name_ar: 'أكاديمية رواد المستقبل',
    name_en: 'Rowad Al-Mustaqbal Academy',
    phone: '01298765432',
    email: 'info@rowad-edu.com',
    address: 'الدقي، الجيزة',
    subscription_tier: 'STARTER',
    subscription_status: 'active',
    student_limit: 150,
    has_financial_addon: false,
    financial_addon_fee: 100,
    settings: {
      late_grace_minutes: 10,
      require_checkout: true,
      currency: 'EGP',
      primary_language: 'ar',
      theme: 'navy-gold',
      contact_whatsapp: '201298765432'
    },
    created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
    updated_at: new Date().toISOString()
  }
];

export const CURRENT_USER: UserProfile = {
  id: 'u0000000-0000-0000-0000-000000000002',
  email: 'owner@alnokhba.com',
  full_name: 'أ. أحمد السيد (مدير السنتر)',
  phone: '01012345678',
  avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  is_super_admin: false,
  created_at: new Date().toISOString()
};

export const SUPER_ADMIN_USER: UserProfile = {
  id: 'u0000000-0000-0000-0000-000000000001',
  email: 'admin@madaar.io',
  full_name: 'م. حسام الدين (المدير العام - مدار)',
  phone: '01000000001',
  is_super_admin: true,
  created_at: new Date().toISOString()
};

export const INITIAL_SUBJECTS: Subject[] = [
  {
    id: 's0000000-0000-0000-0000-000000000001',
    center_id: 'a0000000-0000-0000-0000-000000000001',
    name_ar: 'الرياضيات التطبيقية والبحثية',
    name_en: 'Mathematics',
    created_at: new Date().toISOString()
  },
  {
    id: 's0000000-0000-0000-0000-000000000002',
    center_id: 'a0000000-0000-0000-0000-000000000001',
    name_ar: 'الفيزياء للثانوية العامة',
    name_en: 'Physics',
    created_at: new Date().toISOString()
  },
  {
    id: 's0000000-0000-0000-0000-000000000003',
    center_id: 'a0000000-0000-0000-0000-000000000001',
    name_ar: 'الكيمياء',
    name_en: 'Chemistry',
    created_at: new Date().toISOString()
  }
];

export const INITIAL_GROUPS: Group[] = [
  {
    id: 'g0000000-0000-0000-0000-000000000001',
    center_id: 'a0000000-0000-0000-0000-000000000001',
    subject_id: 's0000000-0000-0000-0000-000000000001',
    name: 'مجموعة العباقرة - رياضيات 3ث',
    teacher_name: 'م. يوسف القاضي',
    stage: 'الثانوية العامة',
    grade: 'الصف الثالث الثانوي',
    default_room: 'قاعة ابن الهيثم (1)',
    session_duration_minutes: 120,
    monthly_price: 450,
    schedule_config: [
      { day: 'Sunday', day_ar: 'الأحد', start_time: '16:00', end_time: '18:00' },
      { day: 'Wednesday', day_ar: 'الأربعاء', start_time: '16:00', end_time: '18:00' }
    ],
    status: 'active',
    student_count: 5,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'g0000000-0000-0000-0000-000000000002',
    center_id: 'a0000000-0000-0000-0000-000000000001',
    subject_id: 's0000000-0000-0000-0000-000000000002',
    name: 'مجموعة نيوتن - فيزياء 3ث',
    teacher_name: 'د. مصطفى كمال',
    stage: 'الثانوية العامة',
    grade: 'الصف الثالث الثانوي',
    default_room: 'قاعة فاراداي (2)',
    session_duration_minutes: 120,
    monthly_price: 500,
    schedule_config: [
      { day: 'Monday', day_ar: 'الاثنين', start_time: '17:00', end_time: '19:00' },
      { day: 'Thursday', day_ar: 'الخميس', start_time: '17:00', end_time: '19:00' }
    ],
    status: 'active',
    student_count: 4,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

export const INITIAL_STUDENTS: Student[] = [
  {
    id: 't0000000-0000-0000-0000-000000000001',
    center_id: 'a0000000-0000-0000-0000-000000000001',
    student_code: 'NK-2601',
    full_name: 'عمر خالد المنشاوي',
    phone: '01023456781',
    parent_phone: '01099887766',
    photo_url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
    stage: 'الثانوية العامة',
    grade: 'الصف الثالث الثانوي',
    enrollment_date: '2026-09-01',
    status: 'active',
    notes: 'طالب متميز - شعبة علمي رياضة',
    qr_token: 'HADAR-QR-SEC-9f8e7d6c5b4a3101',
    qr_version: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 't0000000-0000-0000-0000-000000000002',
    center_id: 'a0000000-0000-0000-0000-000000000001',
    student_code: 'NK-2602',
    full_name: 'مريم طارق الشريف',
    phone: '01123456782',
    parent_phone: '01199887755',
    photo_url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    stage: 'الثانوية العامة',
    grade: 'الصف الثالث الثانوي',
    enrollment_date: '2026-09-02',
    status: 'active',
    notes: 'تحتاج متابعة في واجبات الفيزياء',
    qr_token: 'HADAR-QR-SEC-9f8e7d6c5b4a3102',
    qr_version: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 't0000000-0000-0000-0000-000000000003',
    center_id: 'a0000000-0000-0000-0000-000000000001',
    student_code: 'NK-2603',
    full_name: 'ياسين أحمد فؤاد',
    phone: '01223456783',
    parent_phone: '01299887744',
    photo_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    stage: 'الثانوية العامة',
    grade: 'الصف الثالث الثانوي',
    enrollment_date: '2026-09-05',
    status: 'active',
    notes: 'تنبيه غياب متكرر',
    qr_token: 'HADAR-QR-SEC-9f8e7d6c5b4a3103',
    qr_version: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 't0000000-0000-0000-0000-000000000004',
    center_id: 'a0000000-0000-0000-0000-000000000001',
    student_code: 'NK-2604',
    full_name: 'نور الدين مصطفى',
    phone: '01523456784',
    parent_phone: '01599887733',
    photo_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    stage: 'الثانوية العامة',
    grade: 'الصف الثالث الثانوي',
    enrollment_date: '2026-09-10',
    status: 'active',
    notes: 'شعبة علمي علوم',
    qr_token: 'HADAR-QR-SEC-9f8e7d6c5b4a3104',
    qr_version: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 't0000000-0000-0000-0000-000000000005',
    center_id: 'a0000000-0000-0000-0000-000000000001',
    student_code: 'NK-2605',
    full_name: 'فريدة هاني زهران',
    phone: '01034567895',
    parent_phone: '01088776655',
    photo_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    stage: 'الثانوية العامة',
    grade: 'الصف الثالث الثانوي',
    enrollment_date: '2026-09-12',
    status: 'active',
    notes: 'طالبة ملتزمة جداً',
    qr_token: 'HADAR-QR-SEC-9f8e7d6c5b4a3105',
    qr_version: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

export const INITIAL_GROUP_STUDENTS: { group_id: string; student_id: string }[] = [
  { group_id: 'g0000000-0000-0000-0000-000000000001', student_id: 't0000000-0000-0000-0000-000000000001' },
  { group_id: 'g0000000-0000-0000-0000-000000000001', student_id: 't0000000-0000-0000-0000-000000000002' },
  { group_id: 'g0000000-0000-0000-0000-000000000001', student_id: 't0000000-0000-0000-0000-000000000003' },
  { group_id: 'g0000000-0000-0000-0000-000000000001', student_id: 't0000000-0000-0000-0000-000000000004' },
  { group_id: 'g0000000-0000-0000-0000-000000000001', student_id: 't0000000-0000-0000-0000-000000000005' },
  { group_id: 'g0000000-0000-0000-0000-000000000002', student_id: 't0000000-0000-0000-0000-000000000001' },
  { group_id: 'g0000000-0000-0000-0000-000000000002', student_id: 't0000000-0000-0000-0000-000000000002' },
  { group_id: 'g0000000-0000-0000-0000-000000000002', student_id: 't0000000-0000-0000-0000-000000000004' },
  { group_id: 'g0000000-0000-0000-0000-000000000002', student_id: 't0000000-0000-0000-0000-000000000005' }
];

export const INITIAL_SESSIONS: Session[] = [
  {
    id: 'c0000000-0000-0000-0000-000000000001',
    center_id: 'a0000000-0000-0000-0000-000000000001',
    group_id: 'g0000000-0000-0000-0000-000000000001',
    session_date: new Date().toISOString().split('T')[0],
    start_time: '16:00:00',
    end_time: '18:00:00',
    attendance_opened_at: new Date(Date.now() - 3600000).toISOString(),
    status: 'open',
    title: 'حصة التفاضل: تطبيقات القيم العظمى والصغرى',
    room: 'قاعة ابن الهيثم (1)',
    attended_count: 2,
    total_students: 5,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'c0000000-0000-0000-0000-000000000002',
    center_id: 'a0000000-0000-0000-0000-000000000001',
    group_id: 'g0000000-0000-0000-0000-000000000002',
    session_date: new Date().toISOString().split('T')[0],
    start_time: '18:30:00',
    end_time: '20:30:00',
    status: 'scheduled',
    title: 'الفيزياء الحديثة: التأثير الكهروضوئي وظاهرة كومتون',
    room: 'قاعة فاراداي (2)',
    attended_count: 0,
    total_students: 4,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

export const INITIAL_ATTENDANCE: AttendanceRecord[] = [
  {
    id: 'att-001',
    center_id: 'a0000000-0000-0000-0000-000000000001',
    session_id: 'c0000000-0000-0000-0000-000000000001',
    student_id: 't0000000-0000-0000-0000-000000000001',
    status: 'present',
    check_in_time: new Date(Date.now() - 2500000).toISOString(),
    recorded_via: 'qr_scanner',
    recorded_by_user_id: 'u0000000-0000-0000-0000-000000000002',
    created_at: new Date(Date.now() - 2500000).toISOString(),
    updated_at: new Date(Date.now() - 2500000).toISOString()
  },
  {
    id: 'att-002',
    center_id: 'a0000000-0000-0000-0000-000000000001',
    session_id: 'c0000000-0000-0000-0000-000000000001',
    student_id: 't0000000-0000-0000-0000-000000000002',
    status: 'late',
    check_in_time: new Date(Date.now() - 1200000).toISOString(),
    recorded_via: 'qr_scanner',
    recorded_by_user_id: 'u0000000-0000-0000-0000-000000000002',
    notes: 'تأخير 20 دقيقة بسبب المواصلات',
    created_at: new Date(Date.now() - 1200000).toISOString(),
    updated_at: new Date(Date.now() - 1200000).toISOString()
  }
];

export const INITIAL_SUBSCRIPTIONS: StudentSubscription[] = [
  {
    id: 'b0000000-0000-0000-0000-000000000001',
    center_id: 'a0000000-0000-0000-0000-000000000001',
    student_id: 't0000000-0000-0000-0000-000000000001',
    group_id: 'g0000000-0000-0000-0000-000000000001',
    cycle_start_date: '2026-11-01',
    cycle_end_date: '2026-11-30',
    plan_amount: 450,
    discount_amount: 0,
    total_due: 450,
    total_paid: 450,
    remaining_balance: 0,
    status: 'paid',
    created_at: '2026-11-01T10:00:00Z',
    updated_at: '2026-11-01T10:00:00Z'
  },
  {
    id: 'b0000000-0000-0000-0000-000000000002',
    center_id: 'a0000000-0000-0000-0000-000000000001',
    student_id: 't0000000-0000-0000-0000-000000000002',
    group_id: 'g0000000-0000-0000-0000-000000000001',
    cycle_start_date: '2026-11-01',
    cycle_end_date: '2026-11-30',
    plan_amount: 450,
    discount_amount: 0,
    total_due: 450,
    total_paid: 200,
    remaining_balance: 250,
    status: 'partially_paid',
    created_at: '2026-11-02T11:00:00Z',
    updated_at: '2026-11-02T11:00:00Z'
  },
  {
    id: 'b0000000-0000-0000-0000-000000000003',
    center_id: 'a0000000-0000-0000-0000-000000000001',
    student_id: 't0000000-0000-0000-0000-000000000003',
    group_id: 'g0000000-0000-0000-0000-000000000001',
    cycle_start_date: '2026-11-01',
    cycle_end_date: '2026-11-30',
    plan_amount: 450,
    discount_amount: 0,
    total_due: 450,
    total_paid: 0,
    remaining_balance: 450,
    status: 'unpaid',
    created_at: '2026-11-03T12:00:00Z',
    updated_at: '2026-11-03T12:00:00Z'
  }
];

export const INITIAL_PAYMENTS: Payment[] = [
  {
    id: 'p0000000-0000-0000-0000-000000000001',
    center_id: 'a0000000-0000-0000-0000-000000000001',
    subscription_id: 'b0000000-0000-0000-0000-000000000001',
    student_id: 't0000000-0000-0000-0000-000000000001',
    receipt_number: 'REC-2026-0001',
    amount: 450,
    payment_method: 'cash',
    paid_at: '2026-11-01T10:15:00Z',
    received_by_user_id: 'u0000000-0000-0000-0000-000000000002',
    notes: 'تم سداد اشتراك شهر نوفمبر بالكامل كاش',
    created_at: '2026-11-01T10:15:00Z'
  },
  {
    id: 'p0000000-0000-0000-0000-000000000002',
    center_id: 'a0000000-0000-0000-0000-000000000001',
    subscription_id: 'b0000000-0000-0000-0000-000000000002',
    student_id: 't0000000-0000-0000-0000-000000000002',
    receipt_number: 'REC-2026-0002',
    amount: 200,
    payment_method: 'instapay',
    paid_at: '2026-11-02T11:30:00Z',
    received_by_user_id: 'u0000000-0000-0000-0000-000000000002',
    notes: 'دفعة أولى إنستاباي - متبقي 250 ج.م',
    created_at: '2026-11-02T11:30:00Z'
  }
];

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'n-001',
    center_id: 'a0000000-0000-0000-0000-000000000001',
    type: 'repeated_absence',
    title: 'تنبيه غياب متكرر',
    message: 'الطالب ياسين أحمد فؤاد غاب حصتين متتاليتين في مادة الرياضيات.',
    data: { student_id: 't0000000-0000-0000-0000-000000000003', group_id: 'g0000000-0000-0000-0000-000000000001' },
    is_read: false,
    created_at: new Date(Date.now() - 3600000 * 2).toISOString()
  },
  {
    id: 'n-002',
    center_id: 'a0000000-0000-0000-0000-000000000001',
    type: 'payment_overdue',
    title: 'مستحقات اشتراك معلقة',
    message: 'يوجد قسط متبقي بقيمة 250 ج.م على الطالبة مريم طارق الشريف.',
    data: { student_id: 't0000000-0000-0000-0000-000000000002', balance: 250 },
    is_read: false,
    created_at: new Date(Date.now() - 3600000 * 6).toISOString()
  }
];

export const INITIAL_AUDIT_LOGS: AttendanceAuditLog[] = [
  {
    id: 'aud-001',
    center_id: 'a0000000-0000-0000-0000-000000000001',
    attendance_id: 'att-002',
    user_id: 'u0000000-0000-0000-0000-000000000002',
    action: 'status_changed',
    previous_status: 'present',
    new_status: 'late',
    reason: 'تم تعديل الحالة إلى متأخر بسبب وصول الطالب بعد انتهاء فترة السماح',
    timestamp: new Date(Date.now() - 1000000).toISOString()
  }
];
