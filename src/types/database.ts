// ====================================================================
// HADAR SaaS Platform — TypeScript Database & Domain Models
// Developed by MADAAR Technologies
// ====================================================================

export type UserRole = 'super_admin' | 'owner' | 'admin' | 'assistant' | 'teacher' | 'student';

export type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused' | 'early_departure';

export type PaymentMethod = 'cash' | 'instapay' | 'vodafone_cash' | 'card' | 'bank_transfer';

export type SubscriptionPlanTier = 'STARTER' | 'GROWTH' | 'ENTERPRISE';

export interface SubscriptionPlan {
  id: SubscriptionPlanTier;
  name_ar: string;
  name_en: string;
  base_fee: number;
  price_per_student: number;
  min_students: number;
  max_students: number | null;
  features: string[];
  is_active: boolean;
}

export interface CenterSettings {
  late_grace_minutes: number;
  require_checkout: boolean;
  currency: string;
  primary_language: 'ar' | 'en';
  theme: string;
  qr_card_layout?: string;
  contact_whatsapp?: string;
}

export interface Center {
  id: string;
  slug: string;
  name_ar: string;
  name_en: string;
  logo_url?: string;
  phone?: string;
  email?: string;
  address?: string;
  subscription_tier: SubscriptionPlanTier;
  subscription_status: 'active' | 'trialing' | 'past_due' | 'suspended' | 'cancelled';
  student_limit: number;
  has_financial_addon: boolean;
  financial_addon_fee: number;
  settings: CenterSettings;
  created_at: string;
  updated_at: string;
}

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  avatar_url?: string;
  is_super_admin: boolean;
  created_at: string;
}

export interface MemberPermissions {
  can_view_financials: boolean;
  can_manage_students: boolean;
  can_manage_groups: boolean;
  can_take_attendance: boolean;
  can_edit_attendance: boolean;
  can_export_reports: boolean;
}

export interface CenterMember {
  id: string;
  center_id: string;
  user_id: string;
  role: UserRole;
  permissions: MemberPermissions;
  is_active: boolean;
  user?: UserProfile;
  created_at: string;
}

export interface Subject {
  id: string;
  center_id: string;
  name_ar: string;
  name_en?: string;
  created_at: string;
}

export interface Student {
  id: string;
  center_id: string;
  student_code: string;
  full_name: string;
  phone?: string;
  parent_phone: string;
  photo_url?: string;
  stage: string;
  grade: string;
  enrollment_date: string;
  status: 'active' | 'suspended' | 'archived';
  notes?: string;
  qr_token: string;
  qr_version: number;
  created_at: string;
  updated_at: string;
  // Joined or virtual fields
  enrolled_groups?: Group[];
}

export interface GroupScheduleItem {
  day: string; // "Sunday", "Monday", etc.
  day_ar?: string; // "الأحد", "الاثنين", etc.
  start_time: string; // "16:00"
  end_time: string; // "18:00"
}

export interface Group {
  id: string;
  center_id: string;
  subject_id?: string;
  name: string;
  teacher_name: string;
  stage: string;
  grade: string;
  default_room?: string;
  session_duration_minutes: number;
  monthly_price: number;
  schedule_config: GroupScheduleItem[];
  status: 'active' | 'archived';
  created_at: string;
  updated_at: string;
  // Joined stats
  student_count?: number;
  subject?: Subject;
}

export interface GroupStudent {
  id: string;
  center_id: string;
  group_id: string;
  student_id: string;
  joined_at: string;
  status: 'active' | 'paused' | 'left';
  student?: Student;
}

export interface Session {
  id: string;
  center_id: string;
  group_id: string;
  session_date: string; // YYYY-MM-DD
  start_time: string; // HH:MM:SS
  end_time: string; // HH:MM:SS
  attendance_opened_at?: string;
  attendance_closed_at?: string;
  status: 'scheduled' | 'open' | 'completed' | 'cancelled';
  title?: string;
  room?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  // Joined fields
  group?: Group;
  attended_count?: number;
  total_students?: number;
}

export interface AttendanceRecord {
  id: string;
  center_id: string;
  session_id: string;
  student_id: string;
  status: AttendanceStatus;
  check_in_time?: string;
  check_out_time?: string;
  recorded_by_user_id?: string;
  recorded_via: 'qr_scanner' | 'manual_admin' | 'offline_sync';
  device_id?: string;
  offline_event_id?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  // Joined fields
  student?: Student;
  session?: Session;
  recorded_by?: UserProfile;
}

export interface AttendanceAuditLog {
  id: string;
  center_id: string;
  attendance_id: string;
  user_id: string;
  action: 'status_changed' | 'manual_entry' | 'check_out_added' | 'deleted';
  previous_status?: string;
  new_status: string;
  reason: string;
  timestamp: string;
  user?: UserProfile;
}

export interface StudentSubscription {
  id: string;
  center_id: string;
  student_id: string;
  group_id?: string;
  cycle_start_date: string;
  cycle_end_date: string;
  plan_amount: number;
  discount_amount: number;
  total_due: number;
  total_paid: number;
  remaining_balance: number;
  status: 'paid' | 'partially_paid' | 'unpaid' | 'overdue';
  created_at: string;
  updated_at: string;
  // Joined fields
  student?: Student;
  group?: Group;
}

export interface Payment {
  id: string;
  center_id: string;
  subscription_id: string;
  student_id: string;
  receipt_number: string;
  amount: number;
  payment_method: PaymentMethod;
  paid_at: string;
  received_by_user_id?: string;
  notes?: string;
  created_at: string;
  // Joined fields
  student?: Student;
  received_by?: UserProfile;
}

export interface NotificationItem {
  id: string;
  center_id: string;
  user_id?: string;
  type: 'repeated_absence' | 'late_arrival' | 'expiring_subscription' | 'payment_overdue' | 'sync_alert' | 'admin_notice';
  title: string;
  message: string;
  data: Record<string, unknown>;
  is_read: boolean;
  created_at: string;
}

export interface OfflineAttendanceEvent {
  id: string;
  offline_event_id: string;
  student_id: string;
  session_id: string;
  center_id: string;
  device_id: string;
  local_timestamp: string;
  event_type: 'check_in' | 'check_out';
  status: AttendanceStatus;
  sync_status: 'pending' | 'synced' | 'failed';
  error_message?: string;
  student_name?: string;
  student_code?: string;
}

