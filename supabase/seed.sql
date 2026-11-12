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
-- Note: In production Supabase, users are created in auth.users first.
-- Here we populate the public.users profiles.
INSERT INTO public.users (id, email, full_name, phone, is_super_admin)
VALUES 
    ('u0000000-0000-0000-0000-000000000001', 'admin@madaar.io', 'م. حسام الدين (المدير العام)', '01000000001', true),
    ('u0000000-0000-0000-0000-000000000002', 'owner@alnokhba.com', 'أ. أحمد السيد (مدير السنتر)', '01012345678', false),
    ('u0000000-0000-0000-0000-000000000003', 'assistant@alnokhba.com', 'سارة محمود (مساعد حضور)', '01122334455', false)
ON CONFLICT (id) DO NOTHING;

-- 3. Center Memberships
INSERT INTO public.center_members (id, center_id, user_id, role, permissions, is_active)
VALUES
    ('m0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'u0000000-0000-0000-0000-000000000002', 'owner', '{"can_view_financials": true, "can_manage_students": true, "can_manage_groups": true, "can_take_attendance": true, "can_edit_attendance": true, "can_export_reports": true}'::jsonb, true),
    ('m0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'u0000000-0000-0000-0000-000000000003', 'assistant', '{"can_view_financials": false, "can_manage_students": false, "can_manage_groups": false, "can_take_attendance": true, "can_edit_attendance": false, "can_export_reports": false}'::jsonb, true)
ON CONFLICT (id) DO NOTHING;

-- 4. Subjects
INSERT INTO public.subjects (id, center_id, name_ar, name_en)
VALUES
    ('s0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'الرياضيات التطبيقية والبحثية', 'Mathematics'),
    ('s0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'الفيزياء للثانوية العامة', 'Physics'),
    ('s0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'الكيمياء', 'Chemistry')
ON CONFLICT (id) DO NOTHING;

-- 5. Groups
INSERT INTO public.groups (id, center_id, subject_id, name, teacher_name, stage, grade, default_room, session_duration_minutes, monthly_price, schedule_config, status)
VALUES
    ('g0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 's0000000-0000-0000-0000-000000000001', 'مجموعة العباقرة - رياضيات 3ث', 'م. يوسف القاضي', 'الثانوية العامة', 'الصف الثالث الثانوي', 'قاعة ابن الهيثم (1)', 120, 450.00, '[{"day": "Sunday", "start_time": "16:00", "end_time": "18:00"}, {"day": "Wednesday", "start_time": "16:00", "end_time": "18:00"}]'::jsonb, 'active'),
    ('g0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 's0000000-0000-0000-0000-000000000002', 'مجموعة نيوتن - فيزياء 3ث', 'د. مصطفى كمال', 'الثانوية العامة', 'الصف الثالث الثانوي', 'قاعة فاراداي (2)', 120, 500.00, '[{"day": "Monday", "start_time": "17:00", "end_time": "19:00"}, {"day": "Thursday", "start_time": "17:00", "end_time": "19:00"}]'::jsonb, 'active')
ON CONFLICT (id) DO NOTHING;

-- 6. Students
INSERT INTO public.students (id, center_id, student_code, full_name, phone, parent_phone, stage, grade, qr_token, status)
VALUES
    ('t0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'NK-2601', 'عمر خالد المنشاوي', '01023456781', '01099887766', 'الثانوية العامة', 'الصف الثالث الثانوي', 'HADAR-QR-SEC-9f8e7d6c5b4a3101', 'active'),
    ('t0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'NK-2602', 'مريم طارق الشريف', '01123456782', '01199887755', 'الثانوية العامة', 'الصف الثالث الثانوي', 'HADAR-QR-SEC-9f8e7d6c5b4a3102', 'active'),
    ('t0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'NK-2603', 'ياسين أحمد فؤاد', '01223456783', '01299887744', 'الثانوية العامة', 'الصف الثالث الثانوي', 'HADAR-QR-SEC-9f8e7d6c5b4a3103', 'active'),
    ('t0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000001', 'NK-2604', 'نور الدين مصطفى', '01523456784', '01599887733', 'الثانوية العامة', 'الصف الثالث الثانوي', 'HADAR-QR-SEC-9f8e7d6c5b4a3104', 'active'),
    ('t0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000001', 'NK-2605', 'فريدة هاني زهران', '01034567895', '01088776655', 'الثانوية العامة', 'الصف الثالث الثانوي', 'HADAR-QR-SEC-9f8e7d6c5b4a3105', 'active')
ON CONFLICT (id) DO NOTHING;

-- 7. Group Enrollments
INSERT INTO public.group_students (center_id, group_id, student_id, status)
VALUES
    ('a0000000-0000-0000-0000-000000000001', 'g0000000-0000-0000-0000-000000000001', 't0000000-0000-0000-0000-000000000001', 'active'),
    ('a0000000-0000-0000-0000-000000000001', 'g0000000-0000-0000-0000-000000000001', 't0000000-0000-0000-0000-000000000002', 'active'),
    ('a0000000-0000-0000-0000-000000000001', 'g0000000-0000-0000-0000-000000000001', 't0000000-0000-0000-0000-000000000003', 'active'),
    ('a0000000-0000-0000-0000-000000000001', 'g0000000-0000-0000-0000-000000000002', 't0000000-0000-0000-0000-000000000003', 'active'),
    ('a0000000-0000-0000-0000-000000000001', 'g0000000-0000-0000-0000-000000000002', 't0000000-0000-0000-0000-000000000004', 'active'),
    ('a0000000-0000-0000-0000-000000000001', 'g0000000-0000-0000-0000-000000000002', 't0000000-0000-0000-0000-000000000005', 'active')
ON CONFLICT DO NOTHING;

-- 8. Today's Sessions
INSERT INTO public.sessions (id, center_id, group_id, session_date, start_time, end_time, status, title, room)
VALUES
    ('c0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'g0000000-0000-0000-0000-000000000001', CURRENT_DATE, '16:00:00', '18:00:00', 'open', 'حصة التفاضل والتكامل: تطبيقات القيم العظمى والصغرى', 'قاعة ابن الهيثم (1)'),
    ('c0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'g0000000-0000-0000-0000-000000000002', CURRENT_DATE, '18:30:00', '20:30:00', 'scheduled', 'الفيزياء الحديثة: ظاهرة كومتون والتأثير الكهروضوئي', 'قاعة فاراداي (2)')
ON CONFLICT (id) DO NOTHING;

-- 9. Student Subscriptions
INSERT INTO public.student_subscriptions (id, center_id, student_id, group_id, cycle_start_date, cycle_end_date, plan_amount, total_due, total_paid, status)
VALUES
    ('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 't0000000-0000-0000-0000-000000000001', 'g0000000-0000-0000-0000-000000000001', CURRENT_DATE - INTERVAL '10 days', CURRENT_DATE + INTERVAL '20 days', 450.00, 450.00, 450.00, 'paid'),
    ('b0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 't0000000-0000-0000-0000-000000000002', 'g0000000-0000-0000-0000-000000000001', CURRENT_DATE - INTERVAL '5 days', CURRENT_DATE + INTERVAL '25 days', 450.00, 450.00, 200.00, 'partially_paid'),
    ('b0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 't0000000-0000-0000-0000-000000000003', 'g0000000-0000-0000-0000-000000000001', CURRENT_DATE, CURRENT_DATE + INTERVAL '30 days', 450.00, 450.00, 0.00, 'unpaid')
ON CONFLICT (id) DO NOTHING;

-- 10. Sample Payments
INSERT INTO public.payments (id, center_id, subscription_id, student_id, receipt_number, amount, payment_method, paid_at)
VALUES
    ('p0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 't0000000-0000-0000-0000-000000000001', 'REC-2026-0001', 450.00, 'cash', now() - INTERVAL '10 days'),
    ('p0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000002', 't0000000-0000-0000-0000-000000000002', 'REC-2026-0002', 200.00, 'instapay', now() - INTERVAL '5 days')
ON CONFLICT (id) DO NOTHING;

-- 11. Notifications
INSERT INTO public.notifications (center_id, type, title, message, is_read)
VALUES
    ('a0000000-0000-0000-0000-000000000001', 'repeated_absence', 'تنبيه غياب متكرر', 'الطالب ياسين أحمد فؤاد غاب حصتين متتاليتين في مادة الرياضيات.', false),
    ('a0000000-0000-0000-0000-000000000001', 'payment_overdue', 'مستحقات اشتراك معلقة', 'يوجد قسط متبقي بقيمة 250 ج.م على الطالبة مريم طارق الشريف.', false)
ON CONFLICT DO NOTHING;
