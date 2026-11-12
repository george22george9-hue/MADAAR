-- ====================================================================
-- HADAR SaaS Platform — Initial Schema Migration
-- Developed by MADAAR Technologies
-- Database: PostgreSQL / Supabase
-- ====================================================================

-- 1. Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Subscription Plans (Platform-wide, managed by Super Admin)
CREATE TABLE IF NOT EXISTS public.subscription_plans (
    id TEXT PRIMARY KEY, -- 'STARTER', 'GROWTH', 'ENTERPRISE'
    name_ar TEXT NOT NULL,
    name_en TEXT NOT NULL,
    base_fee NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    price_per_student NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    min_students INT NOT NULL DEFAULT 0,
    max_students INT, -- NULL indicates unlimited
    features JSONB NOT NULL DEFAULT '[]'::jsonb,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Seed Default Plans proposed in requirements
INSERT INTO public.subscription_plans (id, name_ar, name_en, base_fee, price_per_student, min_students, max_students, features)
VALUES 
    ('STARTER', 'الباقة الأساسية', 'Starter Plan', 300.00, 0.00, 0, 150, '["حتى 150 طالب", "تسجيل الحضور بالـ QR", "إدارة المجموعات والطلاب", "سجل الحضور الأساسي"]'::jsonb),
    ('GROWTH', 'باقة النمو', 'Growth Plan', 0.00, 2.00, 151, 1000, '["من 150 إلى 1000 طالب", "2 جنيه لكل طالب شهرياً", "حضور أوفلاين وسنك", "تقارير متقدمة وتنبيهات غياب"]'::jsonb),
    ('ENTERPRISE', 'باقة المؤسسات الكبرى', 'Enterprise Plan', 0.00, 2.00, 1001, NULL, '["أكثر من 1000 طالب", "تخصيص كامل واسم مخصص", "دعم فني مخصص 24/7", "سيرفرات فائقة الأداء"]'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- 3. Centers (Educational Center Tenants)
CREATE TABLE IF NOT EXISTS public.centers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT UNIQUE NOT NULL,
    name_ar TEXT NOT NULL,
    name_en TEXT,
    logo_url TEXT,
    phone TEXT,
    email TEXT,
    address TEXT,
    subscription_tier TEXT NOT NULL DEFAULT 'STARTER' REFERENCES public.subscription_plans(id),
    subscription_status TEXT NOT NULL DEFAULT 'active' CHECK (subscription_status IN ('active', 'trialing', 'past_due', 'suspended', 'cancelled')),
    student_limit INT DEFAULT 150,
    has_financial_addon BOOLEAN NOT NULL DEFAULT true, -- Add-on for financial management (+100 EGP)
    financial_addon_fee NUMERIC(10,2) DEFAULT 100.00,
    settings JSONB NOT NULL DEFAULT '{
        "late_grace_minutes": 15,
        "require_checkout": false,
        "currency": "EGP",
        "primary_language": "ar",
        "theme": "navy-gold",
        "qr_card_layout": "standard"
    }'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for tenant lookups
CREATE INDEX IF NOT EXISTS idx_centers_slug ON public.centers(slug);

-- 4. Users Profile Table (Extends Supabase Auth users)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    phone TEXT,
    avatar_url TEXT,
    is_super_admin BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. Center Memberships & RBAC
CREATE TABLE IF NOT EXISTS public.center_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    center_id UUID NOT NULL REFERENCES public.centers(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'assistant', 'teacher')),
    permissions JSONB NOT NULL DEFAULT '{
        "can_view_financials": false,
        "can_manage_students": true,
        "can_manage_groups": false,
        "can_take_attendance": true,
        "can_edit_attendance": false,
        "can_export_reports": false
    }'::jsonb,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(center_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_center_members_user ON public.center_members(user_id);
CREATE INDEX IF NOT EXISTS idx_center_members_center ON public.center_members(center_id);

-- 6. Subjects
CREATE TABLE IF NOT EXISTS public.subjects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    center_id UUID NOT NULL REFERENCES public.centers(id) ON DELETE CASCADE,
    name_ar TEXT NOT NULL,
    name_en TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_subjects_center ON public.subjects(center_id);

-- 7. Students (Scoped to Center)
CREATE TABLE IF NOT EXISTS public.students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    center_id UUID NOT NULL REFERENCES public.centers(id) ON DELETE CASCADE,
    student_code TEXT NOT NULL, -- e.g. STU-00101
    full_name TEXT NOT NULL,
    phone TEXT,
    parent_phone TEXT NOT NULL,
    photo_url TEXT,
    stage TEXT NOT NULL, -- المرحلة التعليمية: الثانوية العامة، الإعدادية، الابتدائية
    grade TEXT NOT NULL, -- الصف الدراسي: الأول الثانوي، الثالث الإعدادي، إلخ
    enrollment_date DATE NOT NULL DEFAULT CURRENT_DATE,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'archived')),
    notes TEXT,
    qr_token TEXT UNIQUE NOT NULL, -- Cryptographically random non-guessable token for QR code
    qr_version INT NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(center_id, student_code)
);

CREATE INDEX IF NOT EXISTS idx_students_center_status ON public.students(center_id, status);
CREATE INDEX IF NOT EXISTS idx_students_qr_token ON public.students(qr_token);
CREATE INDEX IF NOT EXISTS idx_students_parent_phone ON public.students(parent_phone);

-- 8. Groups (Study Groups / Classes)
CREATE TABLE IF NOT EXISTS public.groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    center_id UUID NOT NULL REFERENCES public.centers(id) ON DELETE CASCADE,
    subject_id UUID REFERENCES public.subjects(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    teacher_name TEXT NOT NULL,
    stage TEXT NOT NULL,
    grade TEXT NOT NULL,
    default_room TEXT,
    session_duration_minutes INT NOT NULL DEFAULT 120,
    monthly_price NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    schedule_config JSONB NOT NULL DEFAULT '[]'::jsonb, -- Array of {day: "monday", start_time: "16:00", end_time: "18:00"}
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'archived')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_groups_center ON public.groups(center_id);

-- 9. Group Students (Enrollments)
CREATE TABLE IF NOT EXISTS public.group_students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    center_id UUID NOT NULL REFERENCES public.centers(id) ON DELETE CASCADE,
    group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    joined_at DATE NOT NULL DEFAULT CURRENT_DATE,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'left')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(group_id, student_id)
);

CREATE INDEX IF NOT EXISTS idx_group_students_student ON public.group_students(student_id);
CREATE INDEX IF NOT EXISTS idx_group_students_group ON public.group_students(group_id);

-- 10. Sessions
CREATE TABLE IF NOT EXISTS public.sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    center_id UUID NOT NULL REFERENCES public.centers(id) ON DELETE CASCADE,
    group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
    session_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    attendance_opened_at TIMESTAMPTZ,
    attendance_closed_at TIMESTAMPTZ,
    status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'open', 'completed', 'cancelled')),
    title TEXT,
    room TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sessions_group_date ON public.sessions(group_id, session_date);
CREATE INDEX IF NOT EXISTS idx_sessions_center_status ON public.sessions(center_id, status);

-- 11. Attendance Records
CREATE TABLE IF NOT EXISTS public.attendance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    center_id UUID NOT NULL REFERENCES public.centers(id) ON DELETE CASCADE,
    session_id UUID NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    status TEXT NOT NULL CHECK (status IN ('present', 'absent', 'late', 'excused', 'early_departure')),
    check_in_time TIMESTAMPTZ,
    check_out_time TIMESTAMPTZ,
    recorded_by_user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    recorded_via TEXT NOT NULL DEFAULT 'qr_scanner' CHECK (recorded_via IN ('qr_scanner', 'manual_admin', 'offline_sync')),
    device_id TEXT,
    offline_event_id TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    -- Hard DB constraint: One attendance record per student per session!
    UNIQUE(session_id, student_id)
);

CREATE INDEX IF NOT EXISTS idx_attendance_session ON public.attendance(session_id);
CREATE INDEX IF NOT EXISTS idx_attendance_student ON public.attendance(student_id);
CREATE INDEX IF NOT EXISTS idx_attendance_center_date ON public.attendance(center_id, created_at);

-- 12. Attendance Audit Trail (Mandatory requirement for modifications)
CREATE TABLE IF NOT EXISTS public.attendance_audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    center_id UUID NOT NULL REFERENCES public.centers(id) ON DELETE CASCADE,
    attendance_id UUID NOT NULL REFERENCES public.attendance(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id),
    action TEXT NOT NULL, -- 'status_changed', 'manual_entry', 'check_out_added', 'cancelled'
    previous_status TEXT,
    new_status TEXT NOT NULL,
    reason TEXT NOT NULL,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_log_attendance ON public.attendance_audit_log(attendance_id);

-- 13. Student Subscriptions (Billing cycles)
CREATE TABLE IF NOT EXISTS public.student_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    center_id UUID NOT NULL REFERENCES public.centers(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    group_id UUID REFERENCES public.groups(id) ON DELETE SET NULL,
    cycle_start_date DATE NOT NULL,
    cycle_end_date DATE NOT NULL,
    plan_amount NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    discount_amount NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    total_due NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    total_paid NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    remaining_balance NUMERIC(10,2) GENERATED ALWAYS AS (total_due - total_paid) STORED,
    status TEXT NOT NULL DEFAULT 'unpaid' CHECK (status IN ('paid', 'partially_paid', 'unpaid', 'overdue')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_student_subs_student ON public.student_subscriptions(student_id);
CREATE INDEX IF NOT EXISTS idx_student_subs_center_status ON public.student_subscriptions(center_id, status);

-- 14. Payments (Receipts)
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    center_id UUID NOT NULL REFERENCES public.centers(id) ON DELETE CASCADE,
    subscription_id UUID NOT NULL REFERENCES public.student_subscriptions(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    receipt_number TEXT NOT NULL, -- REC-2026-0001
    amount NUMERIC(10,2) NOT NULL CHECK (amount > 0),
    payment_method TEXT NOT NULL DEFAULT 'cash' CHECK (payment_method IN ('cash', 'instapay', 'vodafone_cash', 'card', 'bank_transfer')),
    paid_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    received_by_user_id UUID REFERENCES public.users(id),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(center_id, receipt_number)
);

CREATE INDEX IF NOT EXISTS idx_payments_center ON public.payments(center_id);
CREATE INDEX IF NOT EXISTS idx_payments_student ON public.payments(student_id);
CREATE INDEX IF NOT EXISTS idx_payments_subscription ON public.payments(subscription_id);

-- 15. Notifications
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    center_id UUID NOT NULL REFERENCES public.centers(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('repeated_absence', 'late_arrival', 'expiring_subscription', 'payment_overdue', 'sync_alert', 'admin_notice')),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    data JSONB NOT NULL DEFAULT '{}'::jsonb,
    is_read BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notifications_center_read ON public.notifications(center_id, is_read);

-- 16. Devices for Offline Sync Verification
CREATE TABLE IF NOT EXISTS public.devices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    center_id UUID NOT NULL REFERENCES public.centers(id) ON DELETE CASCADE,
    device_fingerprint TEXT NOT NULL,
    device_name TEXT,
    last_sync_at TIMESTAMPTZ,
    registered_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(center_id, device_fingerprint)
);

