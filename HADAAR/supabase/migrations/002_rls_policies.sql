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

