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

-- ====================================================================
-- HADAR SaaS Platform — Row Level Security (RLS) & Multi-Tenant Isolation
-- Developed by MADAAR Technologies
-- Database: PostgreSQL / Supabase
-- ====================================================================

-- 1. Helper function: Get active center_id for the current authenticated user
CREATE OR REPLACE FUNCTION public.get_current_user_center_id()
RETURNS UUID AS $$
  SELECT center_id 
  FROM public.center_members 
  WHERE user_id = auth.uid() 
    AND is_active = true 
  LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- 2. Helper function: Check if current user is Super Admin
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN AS $$
  SELECT COALESCE(is_super_admin, false)
  FROM public.users 
  WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- 3. Helper function: Check if user is Center Owner or Admin
CREATE OR REPLACE FUNCTION public.has_center_admin_role(p_center_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.center_members
    WHERE center_id = p_center_id
      AND user_id = auth.uid()
      AND role IN ('owner', 'admin')
      AND is_active = true
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- 4. Enable RLS on All Tables
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.centers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.center_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.devices ENABLE ROW LEVEL SECURITY;

-- 5. Policies for Subscription Plans
-- Everyone authenticated can view available plans; only Super Admin can edit
CREATE POLICY "Public read subscription plans" 
  ON public.subscription_plans FOR SELECT 
  TO authenticated 
  USING (true);

CREATE POLICY "Super admin can modify plans" 
  ON public.subscription_plans FOR ALL 
  TO authenticated 
  USING (public.is_super_admin());

-- 6. Policies for Centers
CREATE POLICY "Users can view their own center" 
  ON public.centers FOR SELECT 
  TO authenticated 
  USING (
    id = public.get_current_user_center_id() OR public.is_super_admin()
  );

CREATE POLICY "Super admin can manage all centers" 
  ON public.centers FOR ALL 
  TO authenticated 
  USING (public.is_super_admin());

CREATE POLICY "Center owner can update center settings" 
  ON public.centers FOR UPDATE 
  TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM public.center_members 
      WHERE center_id = public.centers.id 
        AND user_id = auth.uid() 
        AND role = 'owner'
    )
  );

-- 7. Policies for Users
CREATE POLICY "Users can read own profile" 
  ON public.users FOR SELECT 
  TO authenticated 
  USING (id = auth.uid() OR public.is_super_admin());

CREATE POLICY "Users can update own profile" 
  ON public.users FOR UPDATE 
  TO authenticated 
  USING (id = auth.uid());

-- 8. Policies for Center Members
CREATE POLICY "Members can view members in same center" 
  ON public.center_members FOR SELECT 
  TO authenticated 
  USING (
    center_id = public.get_current_user_center_id() OR public.is_super_admin()
  );

CREATE POLICY "Center admins can manage members" 
  ON public.center_members FOR ALL 
  TO authenticated 
  USING (
    public.has_center_admin_role(center_id) OR public.is_super_admin()
  );

-- 9. Scoped Tenant Policies: Students
CREATE POLICY "Tenant isolation for students" 
  ON public.students FOR ALL 
  TO authenticated 
  USING (center_id = public.get_current_user_center_id() OR public.is_super_admin())
  WITH CHECK (center_id = public.get_current_user_center_id() OR public.is_super_admin());

-- 10. Scoped Tenant Policies: Subjects
CREATE POLICY "Tenant isolation for subjects" 
  ON public.subjects FOR ALL 
  TO authenticated 
  USING (center_id = public.get_current_user_center_id() OR public.is_super_admin())
  WITH CHECK (center_id = public.get_current_user_center_id() OR public.is_super_admin());

-- 11. Scoped Tenant Policies: Groups
CREATE POLICY "Tenant isolation for groups" 
  ON public.groups FOR ALL 
  TO authenticated 
  USING (center_id = public.get_current_user_center_id() OR public.is_super_admin())
  WITH CHECK (center_id = public.get_current_user_center_id() OR public.is_super_admin());

-- 12. Scoped Tenant Policies: Group Students
CREATE POLICY "Tenant isolation for group students" 
  ON public.group_students FOR ALL 
  TO authenticated 
  USING (center_id = public.get_current_user_center_id() OR public.is_super_admin())
  WITH CHECK (center_id = public.get_current_user_center_id() OR public.is_super_admin());

-- 13. Scoped Tenant Policies: Sessions
CREATE POLICY "Tenant isolation for sessions" 
  ON public.sessions FOR ALL 
  TO authenticated 
  USING (center_id = public.get_current_user_center_id() OR public.is_super_admin())
  WITH CHECK (center_id = public.get_current_user_center_id() OR public.is_super_admin());

-- 14. Scoped Tenant Policies: Attendance
CREATE POLICY "Tenant isolation for attendance" 
  ON public.attendance FOR ALL 
  TO authenticated 
  USING (center_id = public.get_current_user_center_id() OR public.is_super_admin())
  WITH CHECK (center_id = public.get_current_user_center_id() OR public.is_super_admin());

-- 15. Scoped Tenant Policies: Attendance Audit Log
CREATE POLICY "Tenant isolation for attendance audit log" 
  ON public.attendance_audit_log FOR ALL 
  TO authenticated 
  USING (center_id = public.get_current_user_center_id() OR public.is_super_admin())
  WITH CHECK (center_id = public.get_current_user_center_id() OR public.is_super_admin());

-- 16. Scoped Tenant Policies: Student Subscriptions
CREATE POLICY "Tenant isolation for subscriptions" 
  ON public.student_subscriptions FOR ALL 
  TO authenticated 
  USING (
    (center_id = public.get_current_user_center_id() AND (
      public.has_center_admin_role(center_id) OR (
        SELECT (permissions->>'can_view_financials')::boolean 
        FROM public.center_members 
        WHERE center_id = public.student_subscriptions.center_id AND user_id = auth.uid()
      ) = true
    )) OR public.is_super_admin()
  );

-- 17. Scoped Tenant Policies: Payments
CREATE POLICY "Tenant isolation for payments" 
  ON public.payments FOR ALL 
  TO authenticated 
  USING (
    (center_id = public.get_current_user_center_id() AND (
      public.has_center_admin_role(center_id) OR (
        SELECT (permissions->>'can_view_financials')::boolean 
        FROM public.center_members 
        WHERE center_id = public.payments.center_id AND user_id = auth.uid()
      ) = true
    )) OR public.is_super_admin()
  );

-- 18. Scoped Tenant Policies: Notifications
CREATE POLICY "Tenant isolation for notifications" 
  ON public.notifications FOR ALL 
  TO authenticated 
  USING (
    (center_id = public.get_current_user_center_id() AND (user_id IS NULL OR user_id = auth.uid()))
    OR public.is_super_admin()
  );

-- 19. Smart Attendance Stored Procedure (Server-Side Atomic QR Check-in/Check-out)
CREATE OR REPLACE FUNCTION public.process_qr_attendance(
  p_qr_token TEXT,
  p_session_id UUID,
  p_recorded_by UUID,
  p_mode TEXT DEFAULT 'check_in' -- 'check_in' or 'check_out'
)
RETURNS JSONB AS $$
DECLARE
  v_student RECORD;
  v_session RECORD;
  v_group RECORD;
  v_enrolled BOOLEAN;
  v_existing_attendance RECORD;
  v_center_id UUID;
  v_attendance_status TEXT := 'present';
  v_now TIMESTAMPTZ := now();
  v_grace_minutes INT := 15;
  v_result_id UUID;
BEGIN
  -- 1. Fetch Student by QR Token
  SELECT id, center_id, full_name, student_code, status, photo_url
  INTO v_student
  FROM public.students
  WHERE qr_token = p_qr_token;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error_code', 'INVALID_QR', 'message_ar', 'رمز QR غير صالح أو غير موجود بالنظام');
  END IF;

  IF v_student.status != 'active' THEN
    RETURN jsonb_build_object('success', false, 'error_code', 'STUDENT_SUSPENDED', 'message_ar', 'حساب الطالب معطل أو مؤرشف');
  END IF;

  v_center_id := v_student.center_id;

  -- 2. Fetch Session & Associated Group
  SELECT s.id, s.center_id, s.group_id, s.session_date, s.start_time, s.end_time, s.status,
         g.name AS group_name, g.teacher_name
  INTO v_session
  FROM public.sessions s
  JOIN public.groups g ON g.id = s.group_id
  WHERE s.id = p_session_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error_code', 'SESSION_NOT_FOUND', 'message_ar', 'الحصة المحددة غير موجودة');
  END IF;

  IF v_session.center_id != v_center_id THEN
    RETURN jsonb_build_object('success', false, 'error_code', 'CROSS_CENTER_DENIED', 'message_ar', 'الطالب لا ينتمي إلى هذا السنتر');
  END IF;

  IF v_session.status = 'cancelled' THEN
    RETURN jsonb_build_object('success', false, 'error_code', 'SESSION_CANCELLED', 'message_ar', 'هذه الحصة تم إلغاؤها');
  END IF;

  -- 3. Verify Student Enrollment in the Group
  SELECT EXISTS (
    SELECT 1 FROM public.group_students
    WHERE group_id = v_session.group_id
      AND student_id = v_student.id
      AND status = 'active'
  ) INTO v_enrolled;

  IF NOT v_enrolled THEN
    RETURN jsonb_build_object(
      'success', false, 
      'error_code', 'NOT_IN_GROUP', 
      'message_ar', 'الطالب غير مقيد في هذه المجموعة (' || v_session.group_name || ')',
      'student_name', v_student.full_name
    );
  END IF;

  -- 4. Check Existing Attendance
  SELECT id, status, check_in_time, check_out_time
  INTO v_existing_attendance
  FROM public.attendance
  WHERE session_id = p_session_id AND student_id = v_student.id;

  -- Handle Check-out Mode
  IF p_mode = 'check_out' THEN
    IF NOT FOUND THEN
      RETURN jsonb_build_object('success', false, 'error_code', 'NOT_CHECKED_IN', 'message_ar', 'لم يتم تسجيل دخول الطالب بعد ليتم تسجيل انصرافه');
    END IF;

    IF v_existing_attendance.check_out_time IS NOT NULL THEN
      RETURN jsonb_build_object('success', false, 'error_code', 'ALREADY_CHECKED_OUT', 'message_ar', 'تم تسجيل انصراف الطالب مسبقاً في ' || to_char(v_existing_attendance.check_out_time, 'HH12:MI AM'));
    END IF;

    UPDATE public.attendance
    SET check_out_time = v_now,
        updated_at = v_now
    WHERE id = v_existing_attendance.id;

    RETURN jsonb_build_object(
      'success', true,
      'mode', 'check_out',
      'message_ar', 'تم تسجيل الانصراف بنجاح',
      'student_id', v_student.id,
      'student_name', v_student.full_name,
      'student_code', v_student.student_code,
      'group_name', v_session.group_name,
      'check_out_time', to_char(v_now, 'HH12:MI AM')
    );
  END IF;

  -- Check-in Mode: Duplicate Check
  IF FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error_code', 'DUPLICATE_ATTENDANCE',
      'message_ar', 'تم تسجيل حضور الطالب مسبقاً في هذه الحصة (' || to_char(v_existing_attendance.check_in_time, 'HH12:MI AM') || ')',
      'student_name', v_student.full_name,
      'student_code', v_student.student_code,
      'existing_status', v_existing_attendance.status,
      'check_in_time', v_existing_attendance.check_in_time
    );
  END IF;

  -- 5. Determine Late Status based on grace minutes
  -- Late if current time > session start time + grace period
  IF (v_now::time > (v_session.start_time + (v_grace_minutes || ' minutes')::interval)) THEN
    v_attendance_status := 'late';
  ELSE
    v_attendance_status := 'present';
  END IF;

  -- 6. Insert Attendance Record
  INSERT INTO public.attendance (
    center_id,
    session_id,
    student_id,
    status,
    check_in_time,
    recorded_by_user_id,
    recorded_via
  ) VALUES (
    v_center_id,
    p_session_id,
    v_student.id,
    v_attendance_status,
    v_now,
    p_recorded_by,
    'qr_scanner'
  ) RETURNING id INTO v_result_id;

  -- 7. Return Rich Success Object
  RETURN jsonb_build_object(
    'success', true,
    'mode', 'check_in',
    'attendance_id', v_result_id,
    'status', v_attendance_status,
    'message_ar', 'تمام، اتحضر بنجاح',
    'student_id', v_student.id,
    'student_name', v_student.full_name,
    'student_code', v_student.student_code,
    'photo_url', v_student.photo_url,
    'group_name', v_session.group_name,
    'check_in_time', to_char(v_now, 'HH12:MI AM')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ====================================================================
-- HADAR SaaS Platform — Seed Data (Demo & Initial Setup)
-- Developed by MADAAR Technologies
-- ====================================================================

-- 1. Create Demo Center
INSERT INTO public.centers (
    id, slug, name_ar, name_en, phone, email, address, subscription_tier, subscription_status, student_limit, has_financial_addon, settings
) VALUES (
    'a0000000-0000-0000-0000-000000000001',
    'al-nokhba',
    'سنتر النخبة التعليمي',
    'Al-Nokhba Educational Center',
    '01012345678',
    'contact@alnokhba-center.com',
    'شارع مصطفى النحاس، مدينة نصر، القاهرة',
    'GROWTH',
    'active',
    500,
    true,
    '{
        "late_grace_minutes": 15,
        "require_checkout": false,
        "currency": "EGP",
        "primary_language": "ar",
        "theme": "navy-gold"
    }'::jsonb
) ON CONFLICT (id) DO NOTHING;

-- 2. Demo Users (Super Admin, Center Owner, Assistant)
INSERT INTO public.users (id, email, full_name, phone, is_super_admin)
VALUES 
    ('00000000-0000-0000-0000-000000000001', 'admin@madaar.io', 'م. حسام الدين (المدير العام)', '01000000001', true),
    ('00000000-0000-0000-0000-000000000002', 'owner@alnokhba.com', 'أ. أحمد السيد (مدير السنتر)', '01012345678', false),
    ('00000000-0000-0000-0000-000000000003', 'assistant@alnokhba.com', 'سارة محمود (مساعد حضور)', '01122334455', false)
ON CONFLICT (id) DO NOTHING;

-- 3. Center Memberships
INSERT INTO public.center_members (id, center_id, user_id, role, permissions, is_active)
VALUES
    ('00000000-0000-0000-0000-000000000011', 'a0000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', 'owner', '{"can_view_financials": true, "can_manage_students": true, "can_manage_groups": true, "can_take_attendance": true, "can_edit_attendance": true, "can_export_reports": true}'::jsonb, true),
    ('00000000-0000-0000-0000-000000000012', 'a0000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000003', 'assistant', '{"can_view_financials": false, "can_manage_students": false, "can_manage_groups": false, "can_take_attendance": true, "can_edit_attendance": false, "can_export_reports": false}'::jsonb, true)
ON CONFLICT (id) DO NOTHING;

-- 4. Subjects
INSERT INTO public.subjects (id, center_id, name_ar, name_en)
VALUES
    ('00000000-0000-0000-0000-000000000021', 'a0000000-0000-0000-0000-000000000001', 'الرياضيات التطبيقية والبحثية', 'Mathematics'),
    ('00000000-0000-0000-0000-000000000022', 'a0000000-0000-0000-0000-000000000001', 'الفيزياء للثانوية العامة', 'Physics'),
    ('00000000-0000-0000-0000-000000000023', 'a0000000-0000-0000-0000-000000000001', 'الكيمياء', 'Chemistry')
ON CONFLICT (id) DO NOTHING;

-- 5. Groups
INSERT INTO public.groups (id, center_id, subject_id, name, teacher_name, stage, grade, default_room, session_duration_minutes, monthly_price, schedule_config, status)
VALUES
    ('00000000-0000-0000-0000-000000000031', 'a0000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000021', 'مجموعة العباقرة - رياضيات 3ث', 'م. يوسف القاضي', 'الثانوية العامة', 'الصف الثالث الثانوي', 'قاعة ابن الهيثم (1)', 120, 450.00, '[{"day": "Sunday", "start_time": "16:00", "end_time": "18:00"}, {"day": "Wednesday", "start_time": "16:00", "end_time": "18:00"}]'::jsonb, 'active'),
    ('00000000-0000-0000-0000-000000000032', 'a0000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000022', 'مجموعة نيوتن - فيزياء 3ث', 'د. مصطفى كمال', 'الثانوية العامة', 'الصف الثالث الثانوي', 'قاعة فاراداي (2)', 120, 500.00, '[{"day": "Monday", "start_time": "17:00", "end_time": "19:00"}, {"day": "Thursday", "start_time": "17:00", "end_time": "19:00"}]'::jsonb, 'active')
ON CONFLICT (id) DO NOTHING;

-- 6. Students
INSERT INTO public.students (id, center_id, student_code, full_name, phone, parent_phone, stage, grade, qr_token, status)
VALUES
    ('00000000-0000-0000-0000-000000000041', 'a0000000-0000-0000-0000-000000000001', 'NK-2601', 'عمر خالد المنشاوي', '01023456781', '01099887766', 'الثانوية العامة', 'الصف الثالث الثانوي', 'HADAR-QR-SEC-9f8e7d6c5b4a3101', 'active'),
    ('00000000-0000-0000-0000-000000000042', 'a0000000-0000-0000-0000-000000000001', 'NK-2602', 'مريم طارق الشريف', '01123456782', '01199887755', 'الثانوية العامة', 'الصف الثالث الثانوي', 'HADAR-QR-SEC-9f8e7d6c5b4a3102', 'active'),
    ('00000000-0000-0000-0000-000000000043', 'a0000000-0000-0000-0000-000000000001', 'NK-2603', 'ياسين أحمد فؤاد', '01223456783', '01299887744', 'الثانوية العامة', 'الصف الثالث الثانوي', 'HADAR-QR-SEC-9f8e7d6c5b4a3103', 'active'),
    ('00000000-0000-0000-0000-000000000044', 'a0000000-0000-0000-0000-000000000001', 'NK-2604', 'نور الدين مصطفى', '01523456784', '01599887733', 'الثانوية العامة', 'الصف الثالث الثانوي', 'HADAR-QR-SEC-9f8e7d6c5b4a3104', 'active'),
    ('00000000-0000-0000-0000-000000000045', 'a0000000-0000-0000-0000-000000000001', 'NK-2605', 'فريدة هاني زهران', '01034567895', '01088776655', 'الثانوية العامة', 'الصف الثالث الثانوي', 'HADAR-QR-SEC-9f8e7d6c5b4a3105', 'active')
ON CONFLICT (id) DO NOTHING;

-- 7. Group Enrollments
INSERT INTO public.group_students (center_id, group_id, student_id, status)
VALUES
    ('a0000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000031', '00000000-0000-0000-0000-000000000041', 'active'),
    ('a0000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000031', '00000000-0000-0000-0000-000000000042', 'active'),
    ('a0000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000031', '00000000-0000-0000-0000-000000000043', 'active'),
    ('a0000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000032', '00000000-0000-0000-0000-000000000043', 'active'),
    ('a0000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000032', '00000000-0000-0000-0000-000000000044', 'active'),
    ('a0000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000032', '00000000-0000-0000-0000-000000000045', 'active')
ON CONFLICT DO NOTHING;

-- 8. Today's Sessions
INSERT INTO public.sessions (id, center_id, group_id, session_date, start_time, end_time, status, title, room)
VALUES
    ('00000000-0000-0000-0000-000000000051', 'a0000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000031', CURRENT_DATE, '16:00:00', '18:00:00', 'open', 'حصة التفاضل والتكامل: تطبيقات القيم العظمى والصغرى', 'قاعة ابن الهيثم (1)'),
    ('00000000-0000-0000-0000-000000000052', 'a0000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000032', CURRENT_DATE, '18:30:00', '20:30:00', 'scheduled', 'الفيزياء الحديثة: ظاهرة كومتون والتأثير الكهروضوئي', 'قاعة فاراداي (2)')
ON CONFLICT (id) DO NOTHING;

-- 9. Student Subscriptions
INSERT INTO public.student_subscriptions (id, center_id, student_id, group_id, cycle_start_date, cycle_end_date, plan_amount, total_due, total_paid, status)
VALUES
    ('00000000-0000-0000-0000-000000000061', 'a0000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000041', '00000000-0000-0000-0000-000000000031', CURRENT_DATE - INTERVAL '10 days', CURRENT_DATE + INTERVAL '20 days', 450.00, 450.00, 450.00, 'paid'),
    ('00000000-0000-0000-0000-000000000062', 'a0000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000042', '00000000-0000-0000-0000-000000000031', CURRENT_DATE - INTERVAL '5 days', CURRENT_DATE + INTERVAL '25 days', 450.00, 450.00, 200.00, 'partially_paid'),
    ('00000000-0000-0000-0000-000000000063', 'a0000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000043', '00000000-0000-0000-0000-000000000031', CURRENT_DATE, CURRENT_DATE + INTERVAL '30 days', 450.00, 450.00, 0.00, 'unpaid')
ON CONFLICT (id) DO NOTHING;

-- 10. Sample Payments
INSERT INTO public.payments (id, center_id, subscription_id, student_id, receipt_number, amount, payment_method, paid_at)
VALUES
    ('00000000-0000-0000-0000-000000000071', 'a0000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000061', '00000000-0000-0000-0000-000000000041', 'REC-2026-0001', 450.00, 'cash', now() - INTERVAL '10 days'),
    ('00000000-0000-0000-0000-000000000072', 'a0000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000062', '00000000-0000-0000-0000-000000000042', 'REC-2026-0002', 200.00, 'instapay', now() - INTERVAL '5 days')
ON CONFLICT (id) DO NOTHING;

-- 11. Notifications
INSERT INTO public.notifications (center_id, type, title, message, is_read)
VALUES
    ('a0000000-0000-0000-0000-000000000001', 'repeated_absence', 'تنبيه غياب متكرر', 'الطالب ياسين أحمد فؤاد غاب حصتين متتاليتين في مادة الرياضيات.', false),
    ('a0000000-0000-0000-0000-000000000001', 'payment_overdue', 'مستحقات اشتراك معلقة', 'يوجد قسط متبقي بقيمة 250 ج.م على الطالبة مريم طارق الشريف.', false)
ON CONFLICT DO NOTHING;
