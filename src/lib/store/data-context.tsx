'use client';

// ====================================================================
// HADAR SaaS Platform — Unified Reactive Data & Tenant Context
// Developed by MADAAR Technologies
// ====================================================================

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
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
  UserProfile,
  UserRole,
  AttendanceStatus,
  SubscriptionPlan
} from '@/types/database';
import {
  INITIAL_CENTERS,
  INITIAL_PLANS,
  INITIAL_STUDENTS,
  INITIAL_GROUPS,
  INITIAL_GROUP_STUDENTS,
  INITIAL_SESSIONS,
  INITIAL_ATTENDANCE,
  INITIAL_SUBSCRIPTIONS,
  INITIAL_PAYMENTS,
  INITIAL_NOTIFICATIONS,
  INITIAL_AUDIT_LOGS,
  CURRENT_USER,
  SUPER_ADMIN_USER
} from './mock-data';

export interface ScanResult {
  success: boolean;
  mode: 'check_in' | 'check_out';
  message: string;
  error_code?: string;
  student?: Student;
  group_name?: string;
  time?: string;
  status?: AttendanceStatus;
}

interface DataContextType {
  // Tenant & User
  currentCenter: Center;
  allCenters: Center[];
  currentUser: UserProfile;
  currentRole: UserRole;
  switchCenter: (centerId: string) => void;
  switchUserRole: (role: UserRole) => void;
  updateCenterSettings: (settings: Partial<Center['settings']>) => void;

  // Data Collections
  students: Student[];
  groups: Group[];
  sessions: Session[];
  attendance: AttendanceRecord[];
  auditLogs: AttendanceAuditLog[];
  subscriptions: StudentSubscription[];
  payments: Payment[];
  notifications: NotificationItem[];
  plans: SubscriptionPlan[];

  // Student Actions
  addStudent: (student: Omit<Student, 'id' | 'created_at' | 'updated_at' | 'qr_token' | 'qr_version'>, groupIds?: string[]) => Student;
  updateStudent: (id: string, data: Partial<Student>) => void;
  archiveStudent: (id: string) => void;
  bulkAddStudents: (newStudents: Array<{ full_name: string; phone: string; parent_phone: string; stage: string; grade: string; group_name?: string }>) => number;

  // Group & Session Actions
  addGroup: (group: Omit<Group, 'id' | 'created_at' | 'updated_at' | 'student_count'>) => Group;
  updateGroup: (id: string, data: Partial<Group>) => void;
  addSession: (session: Omit<Session, 'id' | 'created_at' | 'updated_at' | 'attended_count' | 'total_students'>) => Session;
  updateSessionStatus: (id: string, status: Session['status']) => void;

  // Smart Attendance
  processQrAttendance: (qrToken: string, sessionId: string, mode?: 'check_in' | 'check_out') => Promise<ScanResult>;
  recordManualAttendance: (sessionId: string, studentId: string, status: AttendanceStatus, reason: string) => Promise<boolean>;

  // Financials
  recordPayment: (data: { subscriptionId: string; studentId: string; amount: number; paymentMethod: Payment['payment_method']; notes?: string }) => Payment;
  addSubscription: (data: Omit<StudentSubscription, 'id' | 'created_at' | 'updated_at' | 'remaining_balance' | 'status' | 'total_paid'>) => StudentSubscription;

  // Notifications
  markNotificationRead: (id: string) => void;
  unreadNotificationsCount: number;

  // SaaS Super Admin
  addCenter: (center: Omit<Center, 'id' | 'created_at' | 'updated_at'>) => Center;
  updateCenterTier: (centerId: string, tier: Center['subscription_tier'], status: Center['subscription_status']) => void;
  updatePlan: (id: string, data: Partial<SubscriptionPlan>) => void;

  // Student Portal Authentication
  currentStudent: Student | null;
  setCurrentStudent: (student: Student | null) => void;
  loginStudent: (identifier: string) => Student | null;
  loginUser: (email: string, role?: UserRole) => boolean;
  logout: () => void;

  // Storage reset
  resetToDefaults: () => void;
}

const DataContext = createContext<DataContextType | null>(null);

const STORAGE_KEY_PREFIX = 'hadar_saas_v1_';

export function DataProvider({ children }: { children: React.ReactNode }) {
  // 1. Initial State from localStorage or initial mock data
  const [centers, setCenters] = useState<Center[]>(INITIAL_CENTERS);
  const [activeCenterId, setActiveCenterId] = useState<string>(INITIAL_CENTERS[0].id);
  const [currentUser, setCurrentUser] = useState<UserProfile>(CURRENT_USER);
  const [currentRole, setCurrentRole] = useState<UserRole>('owner');
  const [currentStudent, setCurrentStudentState] = useState<Student | null>(INITIAL_STUDENTS[0]);

  const setCurrentStudent = (st: Student | null) => {
    setCurrentStudentState(st);
    try {
      if (st) {
        localStorage.setItem(`${STORAGE_KEY_PREFIX}current_student`, JSON.stringify(st));
      } else {
        localStorage.removeItem(`${STORAGE_KEY_PREFIX}current_student`);
      }
    } catch {}
  };

  const [students, setStudents] = useState<Student[]>(INITIAL_STUDENTS);
  const [groups, setGroups] = useState<Group[]>(INITIAL_GROUPS);
  const [groupStudents, setGroupStudents] = useState(INITIAL_GROUP_STUDENTS);
  const [sessions, setSessions] = useState<Session[]>(INITIAL_SESSIONS);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>(INITIAL_ATTENDANCE);
  const [auditLogs, setAuditLogs] = useState<AttendanceAuditLog[]>(INITIAL_AUDIT_LOGS);
  const [subscriptions, setSubscriptions] = useState<StudentSubscription[]>(INITIAL_SUBSCRIPTIONS);
  const [payments, setPayments] = useState<Payment[]>(INITIAL_PAYMENTS);
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [plans, setPlans] = useState<SubscriptionPlan[]>(INITIAL_PLANS);

  // Load from LocalStorage on mount
  useEffect(() => {
    try {
      const savedCenters = localStorage.getItem(`${STORAGE_KEY_PREFIX}centers`);
      if (savedCenters) setCenters(JSON.parse(savedCenters));

      const savedStudents = localStorage.getItem(`${STORAGE_KEY_PREFIX}students`);
      if (savedStudents) setStudents(JSON.parse(savedStudents));

      const savedGroups = localStorage.getItem(`${STORAGE_KEY_PREFIX}groups`);
      if (savedGroups) setGroups(JSON.parse(savedGroups));

      const savedGroupStudents = localStorage.getItem(`${STORAGE_KEY_PREFIX}group_students`);
      if (savedGroupStudents) setGroupStudents(JSON.parse(savedGroupStudents));

      const savedSessions = localStorage.getItem(`${STORAGE_KEY_PREFIX}sessions`);
      if (savedSessions) setSessions(JSON.parse(savedSessions));

      const savedAttendance = localStorage.getItem(`${STORAGE_KEY_PREFIX}attendance`);
      if (savedAttendance) setAttendance(JSON.parse(savedAttendance));

      const savedSubscriptions = localStorage.getItem(`${STORAGE_KEY_PREFIX}subscriptions`);
      if (savedSubscriptions) setSubscriptions(JSON.parse(savedSubscriptions));

      const savedPayments = localStorage.getItem(`${STORAGE_KEY_PREFIX}payments`);
      if (savedPayments) setPayments(JSON.parse(savedPayments));

      const savedNotifications = localStorage.getItem(`${STORAGE_KEY_PREFIX}notifications`);
      if (savedNotifications) setNotifications(JSON.parse(savedNotifications));

      const savedPlans = localStorage.getItem(`${STORAGE_KEY_PREFIX}plans`);
      if (savedPlans) setPlans(JSON.parse(savedPlans));
    } catch {
      // In SSR or if quota exceeded, fall back to memory
    }
  }, []);

  // Save changes to localStorage
  const saveKey = (key: string, data: unknown) => {
    try {
      localStorage.setItem(`${STORAGE_KEY_PREFIX}${key}`, JSON.stringify(data));
    } catch {
      // Ignore storage errors
    }
  };

  const currentCenter = centers.find((c) => c.id === activeCenterId) || centers[0];

  const switchCenter = (centerId: string) => {
    setActiveCenterId(centerId);
  };

  const switchUserRole = (role: UserRole) => {
    setCurrentRole(role);
    if (role === 'super_admin') {
      setCurrentUser(SUPER_ADMIN_USER);
    } else {
      setCurrentUser(CURRENT_USER);
    }
  };

  const updateCenterSettings = (newSettings: Partial<Center['settings']>) => {
    const updated = centers.map((c) =>
      c.id === currentCenter.id
        ? { ...c, settings: { ...c.settings, ...newSettings }, updated_at: new Date().toISOString() }
        : c
    );
    setCenters(updated);
    saveKey('centers', updated);
  };

  // Student Actions
  const addStudent = (
    data: Omit<Student, 'id' | 'created_at' | 'updated_at' | 'qr_token' | 'qr_version'>,
    groupIds: string[] = []
  ): Student => {
    const newId = `t-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const randomHex = Math.random().toString(36).substring(2, 10) + Math.random().toString(36).substring(2, 10);
    const qrToken = `HADAR-QR-${currentCenter.slug.toUpperCase()}-${randomHex}`;

    const newStudent: Student = {
      ...data,
      id: newId,
      center_id: currentCenter.id,
      qr_token: qrToken,
      qr_version: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const nextStudents = [newStudent, ...students];
    setStudents(nextStudents);
    saveKey('students', nextStudents);

    // Enroll in groups
    if (groupIds.length > 0) {
      const nextEnrollments = [
        ...groupStudents,
        ...groupIds.map((gid) => ({ group_id: gid, student_id: newId }))
      ];
      setGroupStudents(nextEnrollments);
      saveKey('group_students', nextEnrollments);

      // Create initial subscription for the primary group
      const targetGroup = groups.find((g) => g.id === groupIds[0]);
      if (targetGroup && targetGroup.monthly_price > 0) {
        const nextSubs: StudentSubscription[] = [
          ...subscriptions,
          {
            id: `sub-${Date.now()}`,
            center_id: currentCenter.id,
            student_id: newId,
            group_id: targetGroup.id,
            cycle_start_date: new Date().toISOString().split('T')[0],
            cycle_end_date: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
            plan_amount: targetGroup.monthly_price,
            discount_amount: 0,
            total_due: targetGroup.monthly_price,
            total_paid: 0,
            remaining_balance: targetGroup.monthly_price,
            status: 'unpaid',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ];
        setSubscriptions(nextSubs);
        saveKey('subscriptions', nextSubs);
      }
    }

    return newStudent;
  };

  const updateStudent = (id: string, data: Partial<Student>) => {
    const updated = students.map((s) =>
      s.id === id ? { ...s, ...data, updated_at: new Date().toISOString() } : s
    );
    setStudents(updated);
    saveKey('students', updated);
  };

  const archiveStudent = (id: string) => {
    updateStudent(id, { status: 'archived' });
  };

  const bulkAddStudents = (
    newItems: Array<{ full_name: string; phone: string; parent_phone: string; stage: string; grade: string; group_name?: string }>
  ): number => {
    let addedCount = 0;
    const addedStudents: Student[] = [];
    const addedEnrollments: { group_id: string; student_id: string }[] = [];

    newItems.forEach((item, index) => {
      if (!item.full_name || !item.parent_phone) return;
      const newId = `t-${Date.now()}-${index}`;
      const codeNum = students.length + addedCount + 101;
      const studentCode = `NK-${codeNum}`;
      const randomHex = Math.random().toString(36).substring(2, 10);
      const qrToken = `HADAR-QR-${currentCenter.slug.toUpperCase()}-${randomHex}`;

      const s: Student = {
        id: newId,
        center_id: currentCenter.id,
        student_code: studentCode,
        full_name: item.full_name,
        phone: item.phone || '',
        parent_phone: item.parent_phone,
        stage: item.stage || 'الثانوية العامة',
        grade: item.grade || 'الصف الثالث الثانوي',
        enrollment_date: new Date().toISOString().split('T')[0],
        status: 'active',
        qr_token: qrToken,
        qr_version: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      addedStudents.push(s);
      addedCount++;

      // Match group by name if provided
      if (item.group_name) {
        const foundGroup = groups.find((g) => g.name.toLowerCase().includes(item.group_name!.toLowerCase()));
        if (foundGroup) {
          addedEnrollments.push({ group_id: foundGroup.id, student_id: newId });
        }
      }
    });

    const nextStudents = [...addedStudents, ...students];
    setStudents(nextStudents);
    saveKey('students', nextStudents);

    if (addedEnrollments.length > 0) {
      const nextGroupStudents = [...groupStudents, ...addedEnrollments];
      setGroupStudents(nextGroupStudents);
      saveKey('group_students', nextGroupStudents);
    }

    return addedCount;
  };

  // Group Actions
  const addGroup = (groupData: Omit<Group, 'id' | 'created_at' | 'updated_at' | 'student_count'>): Group => {
    const newId = `g-${Date.now()}`;
    const newGroup: Group = {
      ...groupData,
      id: newId,
      student_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    const nextGroups = [newGroup, ...groups];
    setGroups(nextGroups);
    saveKey('groups', nextGroups);
    return newGroup;
  };

  const updateGroup = (id: string, data: Partial<Group>) => {
    const updated = groups.map((g) => (g.id === id ? { ...g, ...data, updated_at: new Date().toISOString() } : g));
    setGroups(updated);
    saveKey('groups', updated);
  };

  // Session Actions
  const addSession = (sessionData: Omit<Session, 'id' | 'created_at' | 'updated_at' | 'attended_count' | 'total_students'>): Session => {
    const newId = `c-${Date.now()}`;
    const enrolledCount = groupStudents.filter((gs) => gs.group_id === sessionData.group_id).length;
    const newSession: Session = {
      ...sessionData,
      id: newId,
      attended_count: 0,
      total_students: enrolledCount,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    const nextSessions = [newSession, ...sessions];
    setSessions(nextSessions);
    saveKey('sessions', nextSessions);
    return newSession;
  };

  const updateSessionStatus = (id: string, status: Session['status']) => {
    const updated = sessions.map((s) => {
      if (s.id === id) {
        return {
          ...s,
          status,
          attendance_opened_at: status === 'open' ? new Date().toISOString() : s.attendance_opened_at,
          attendance_closed_at: status === 'completed' || status === 'cancelled' ? new Date().toISOString() : s.attendance_closed_at,
          updated_at: new Date().toISOString()
        };
      }
      return s;
    });
    setSessions(updated);
    saveKey('sessions', updated);
  };

  // Smart Attendance Engine
  const processQrAttendance = async (
    qrToken: string,
    sessionId: string,
    mode: 'check_in' | 'check_out' = 'check_in'
  ): Promise<ScanResult> => {
    // 1. Find Student by QR Token
    const student = students.find((s) => s.qr_token === qrToken.trim());
    if (!student) {
      return {
        success: false,
        mode,
        message: 'رمز QR غير صالح أو غير مسجل في قاعدة البيانات',
        error_code: 'INVALID_QR'
      };
    }

    // Check student status
    if (student.status !== 'active') {
      return {
        success: false,
        mode,
        message: 'حساب الطالب معطل أو مؤرشف',
        error_code: 'STUDENT_SUSPENDED',
        student
      };
    }

    // 2. Find Session
    const session = sessions.find((s) => s.id === sessionId);
    if (!session) {
      return {
        success: false,
        mode,
        message: 'الحصة غير موجودة أو تم حذفها',
        error_code: 'SESSION_NOT_FOUND'
      };
    }

    const group = groups.find((g) => g.id === session.group_id);
    const groupName = group ? group.name : 'المجموعة المحددة';

    // 3. Check Enrollment in Group
    const isEnrolled = groupStudents.some(
      (gs) => gs.group_id === session.group_id && gs.student_id === student.id
    );

    if (!isEnrolled) {
      return {
        success: false,
        mode,
        message: `الطالب غير مقيد في هذه المجموعة (${groupName})`,
        error_code: 'NOT_IN_GROUP',
        student,
        group_name: groupName
      };
    }

    // 4. Check Existing Attendance
    const existingIndex = attendance.findIndex(
      (a) => a.session_id === sessionId && a.student_id === student.id
    );

    const nowIso = new Date().toISOString();
    const nowTimeStr = new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });

    // Handle Check-out Mode
    if (mode === 'check_out') {
      if (existingIndex === -1) {
        return {
          success: false,
          mode: 'check_out',
          message: 'لم يتم تسجيل حضور الطالب بعد ليتم تسجيل انصرافه',
          error_code: 'NOT_CHECKED_IN',
          student,
          group_name: groupName
        };
      }

      if (attendance[existingIndex].check_out_time) {
        const outTime = new Date(attendance[existingIndex].check_out_time!).toLocaleTimeString('ar-EG', {
          hour: '2-digit',
          minute: '2-digit'
        });
        return {
          success: false,
          mode: 'check_out',
          message: `تم تسجيل انصراف الطالب مسبقاً في الساعة ${outTime}`,
          error_code: 'ALREADY_CHECKED_OUT',
          student,
          group_name: groupName
        };
      }

      // Record check-out
      const updatedAttendance = [...attendance];
      updatedAttendance[existingIndex] = {
        ...updatedAttendance[existingIndex],
        check_out_time: nowIso,
        updated_at: nowIso
      };
      setAttendance(updatedAttendance);
      saveKey('attendance', updatedAttendance);

      return {
        success: true,
        mode: 'check_out',
        message: 'تم تسجيل الانصراف بنجاح',
        student,
        group_name: groupName,
        time: nowTimeStr,
        status: updatedAttendance[existingIndex].status
      };
    }

    // Check-in Mode: Duplicate Check (Strict Validation)
    if (existingIndex !== -1) {
      const recordedTime = new Date(attendance[existingIndex].check_in_time || attendance[existingIndex].created_at).toLocaleTimeString('ar-EG', {
        hour: '2-digit',
        minute: '2-digit'
      });
      return {
        success: false,
        mode: 'check_in',
        message: `تم تسجيل حضور الطالب مسبقاً في الساعة ${recordedTime}`,
        error_code: 'DUPLICATE_ATTENDANCE',
        student,
        group_name: groupName,
        time: recordedTime,
        status: attendance[existingIndex].status
      };
    }

    // 5. Determine Late vs Present
    let status: AttendanceStatus = 'present';
    const graceMinutes = currentCenter.settings.late_grace_minutes || 15;
    const sessionDate = new Date(`${session.session_date}T${session.start_time}`);
    const lateThreshold = new Date(sessionDate.getTime() + graceMinutes * 60000);

    if (Date.now() > lateThreshold.getTime()) {
      status = 'late';
    }

    // 6. Record New Attendance
    const newRecord: AttendanceRecord = {
      id: `att-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      center_id: currentCenter.id,
      session_id: sessionId,
      student_id: student.id,
      status,
      check_in_time: nowIso,
      recorded_by_user_id: currentUser.id,
      recorded_via: 'qr_scanner',
      created_at: nowIso,
      updated_at: nowIso
    };

    const nextAttendance = [newRecord, ...attendance];
    setAttendance(nextAttendance);
    saveKey('attendance', nextAttendance);

    // Update Session attended_count
    const nextSessions = sessions.map((s) =>
      s.id === sessionId ? { ...s, attended_count: (s.attended_count || 0) + 1 } : s
    );
    setSessions(nextSessions);
    saveKey('sessions', nextSessions);

    // Add alert notification if student was late
    if (status === 'late') {
      const lateNotif: NotificationItem = {
        id: `notif-${Date.now()}`,
        center_id: currentCenter.id,
        type: 'late_arrival',
        title: 'وصول متأخر',
        message: `حضر الطالب ${student.full_name} متأخراً عن موعد الحصة (${groupName}).`,
        data: { student_id: student.id, session_id: sessionId },
        is_read: false,
        created_at: nowIso
      };
      setNotifications((prev) => [lateNotif, ...prev]);
    }

    return {
      success: true,
      mode: 'check_in',
      message: 'تمام، اتحضر بنجاح',
      student,
      group_name: groupName,
      time: nowTimeStr,
      status
    };
  };

  // Manual Attendance Modification with Audit Logging
  const recordManualAttendance = async (
    sessionId: string,
    studentId: string,
    status: AttendanceStatus,
    reason: string
  ): Promise<boolean> => {
    const existingIndex = attendance.findIndex((a) => a.session_id === sessionId && a.student_id === studentId);
    const nowIso = new Date().toISOString();

    if (existingIndex !== -1) {
      const prev = attendance[existingIndex];
      const updated = [...attendance];
      updated[existingIndex] = {
        ...prev,
        status,
        updated_at: nowIso,
        notes: reason
      };
      setAttendance(updated);
      saveKey('attendance', updated);

      // Audit Log entry
      const log: AttendanceAuditLog = {
        id: `aud-${Date.now()}`,
        center_id: currentCenter.id,
        attendance_id: prev.id,
        user_id: currentUser.id,
        action: 'status_changed',
        previous_status: prev.status,
        new_status: status,
        reason,
        timestamp: nowIso
      };
      const nextLogs = [log, ...auditLogs];
      setAuditLogs(nextLogs);
      saveKey('audit_logs', nextLogs);
    } else {
      // New manual entry
      const newId = `att-${Date.now()}`;
      const newRecord: AttendanceRecord = {
        id: newId,
        center_id: currentCenter.id,
        session_id: sessionId,
        student_id: studentId,
        status,
        check_in_time: nowIso,
        recorded_by_user_id: currentUser.id,
        recorded_via: 'manual_admin',
        notes: reason,
        created_at: nowIso,
        updated_at: nowIso
      };
      const nextAttendance = [newRecord, ...attendance];
      setAttendance(nextAttendance);
      saveKey('attendance', nextAttendance);

      // Audit Log
      const log: AttendanceAuditLog = {
        id: `aud-${Date.now()}`,
        center_id: currentCenter.id,
        attendance_id: newId,
        user_id: currentUser.id,
        action: 'manual_entry',
        previous_status: undefined,
        new_status: status,
        reason,
        timestamp: nowIso
      };
      const nextLogs = [log, ...auditLogs];
      setAuditLogs(nextLogs);
      saveKey('audit_logs', nextLogs);
    }

    return true;
  };

  // Payment Actions
  const recordPayment = (data: {
    subscriptionId: string;
    studentId: string;
    amount: number;
    paymentMethod: Payment['payment_method'];
    notes?: string;
  }): Payment => {
    const receiptNum = `REC-${new Date().getFullYear()}-${String(payments.length + 1).padStart(4, '0')}`;
    const newPayment: Payment = {
      id: `p-${Date.now()}`,
      center_id: currentCenter.id,
      subscription_id: data.subscriptionId,
      student_id: data.studentId,
      receipt_number: receiptNum,
      amount: data.amount,
      payment_method: data.paymentMethod,
      paid_at: new Date().toISOString(),
      received_by_user_id: currentUser.id,
      notes: data.notes,
      created_at: new Date().toISOString()
    };

    const nextPayments = [newPayment, ...payments];
    setPayments(nextPayments);
    saveKey('payments', nextPayments);

    // Update Subscription balances
    const nextSubs = subscriptions.map((sub) => {
      if (sub.id === data.subscriptionId) {
        const totalPaid = (sub.total_paid || 0) + data.amount;
        const remaining = Math.max(0, sub.total_due - totalPaid);
        const status: StudentSubscription['status'] = remaining === 0 ? 'paid' : totalPaid > 0 ? 'partially_paid' : 'unpaid';
        return {
          ...sub,
          total_paid: totalPaid,
          remaining_balance: remaining,
          status,
          updated_at: new Date().toISOString()
        };
      }
      return sub;
    });
    setSubscriptions(nextSubs);
    saveKey('subscriptions', nextSubs);

    return newPayment;
  };

  const addSubscription = (
    subData: Omit<StudentSubscription, 'id' | 'created_at' | 'updated_at' | 'remaining_balance' | 'status' | 'total_paid'>
  ): StudentSubscription => {
    const newSub: StudentSubscription = {
      ...subData,
      id: `sub-${Date.now()}`,
      total_paid: 0,
      remaining_balance: subData.total_due,
      status: 'unpaid',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    const nextSubs = [newSub, ...subscriptions];
    setSubscriptions(nextSubs);
    saveKey('subscriptions', nextSubs);
    return newSub;
  };

  const markNotificationRead = (id: string) => {
    const updated = notifications.map((n) => (n.id === id ? { ...n, is_read: true } : n));
    setNotifications(updated);
    saveKey('notifications', updated);
  };

  const unreadNotificationsCount = notifications.filter((n) => !n.is_read).length;

  // Super Admin Functions
  const addCenter = (centerData: Omit<Center, 'id' | 'created_at' | 'updated_at'>): Center => {
    const newId = `center-${Date.now()}`;
    const newCenter: Center = {
      ...centerData,
      id: newId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    const nextCenters = [...centers, newCenter];
    setCenters(nextCenters);
    saveKey('centers', nextCenters);
    return newCenter;
  };

  const updateCenterTier = (centerId: string, tier: Center['subscription_tier'], status: Center['subscription_status']) => {
    const updated = centers.map((c) =>
      c.id === centerId ? { ...c, subscription_tier: tier, subscription_status: status, updated_at: new Date().toISOString() } : c
    );
    setCenters(updated);
    saveKey('centers', updated);
  };

  const updatePlan = (id: string, data: Partial<SubscriptionPlan>) => {
    const updated = plans.map((p) => (p.id === id ? { ...p, ...data } : p));
    setPlans(updated);
    saveKey('plans', updated);
  };

  const loginStudent = (identifier: string): Student | null => {
    const clean = identifier.trim().toLowerCase();
    const found = students.find(
      (s) =>
        s.student_code.toLowerCase() === clean ||
        s.parent_phone === clean ||
        (s.phone && s.phone === clean) ||
        s.qr_token.toLowerCase() === clean ||
        s.full_name.toLowerCase().includes(clean)
    );
    if (found) {
      setCurrentStudent(found);
      return found;
    }
    return null;
  };

  const loginUser = (email: string, role?: UserRole): boolean => {
    const lower = email.trim().toLowerCase();
    if (role === 'super_admin' || lower.includes('admin') || lower.includes('madaar')) {
      setCurrentUser(SUPER_ADMIN_USER);
      setCurrentRole('super_admin');
      return true;
    } else if (role === 'assistant' || lower.includes('assistant')) {
      setCurrentUser({
        id: 'u0000000-0000-0000-0000-000000000003',
        email: 'assistant@alnokhba.com',
        full_name: 'سارة محمود (مساعد حضور)',
        is_super_admin: false,
        created_at: new Date().toISOString()
      });
      setCurrentRole('assistant');
      return true;
    } else {
      setCurrentUser(CURRENT_USER);
      setCurrentRole('owner');
      return true;
    }
  };

  const logout = () => {
    setCurrentStudent(null);
    setCurrentRole('owner');
  };

  const resetToDefaults = () => {
    localStorage.clear();
    setCenters(INITIAL_CENTERS);
    setActiveCenterId(INITIAL_CENTERS[0].id);
    setStudents(INITIAL_STUDENTS);
    setGroups(INITIAL_GROUPS);
    setSessions(INITIAL_SESSIONS);
    setAttendance(INITIAL_ATTENDANCE);
    setSubscriptions(INITIAL_SUBSCRIPTIONS);
    setPayments(INITIAL_PAYMENTS);
    setNotifications(INITIAL_NOTIFICATIONS);
    setPlans(INITIAL_PLANS);
    setAuditLogs(INITIAL_AUDIT_LOGS);
  };

  return (
    <DataContext.Provider
      value={{
        currentCenter,
        allCenters: centers,
        currentUser,
        currentRole,
        switchCenter,
        switchUserRole,
        updateCenterSettings,
        students,
        groups,
        sessions,
        attendance,
        auditLogs,
        subscriptions,
        payments,
        notifications,
        plans,
        addStudent,
        updateStudent,
        archiveStudent,
        bulkAddStudents,
        addGroup,
        updateGroup,
        addSession,
        updateSessionStatus,
        processQrAttendance,
        recordManualAttendance,
        recordPayment,
        addSubscription,
        markNotificationRead,
        unreadNotificationsCount,
        addCenter,
        updateCenterTier,
        updatePlan,
        currentStudent,
        setCurrentStudent,
        loginStudent,
        loginUser,
        logout,
        resetToDefaults
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}

