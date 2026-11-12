// ====================================================================
// HADAR SaaS Platform — Offline Engine & Sync Service
// Developed by MADAAR Technologies
// ====================================================================

import { offlineDb, QueuedOfflineEvent, getOrCreateDeviceId } from './db';
import { Student, GroupStudent, Session, AttendanceStatus } from '@/types/database';

export interface OfflineScanResult {
  success: boolean;
  mode: 'check_in' | 'check_out';
  message: string;
  error_code?: string;
  student?: {
    id: string;
    full_name: string;
    student_code: string;
    photo_url?: string;
  };
  time?: string;
  status?: AttendanceStatus;
  is_offline: boolean;
}

export class OfflineSyncService {
  /**
   * Pre-downloads session roster into IndexedDB for offline scanning
   */
  static async prepareOfflineSession(
    session: Session,
    groupStudents: GroupStudent[],
    allStudents: Student[]
  ): Promise<number> {
    try {
      // 1. Cache Session
      await offlineDb.cachedSessions.put({
        id: session.id,
        center_id: session.center_id,
        group_id: session.group_id,
        group_name: session.group?.name || 'مجموعة الحصة',
        session_date: session.session_date,
        start_time: session.start_time,
        status: session.status
      });

      // 2. Identify enrolled students
      const enrolledStudentIds = new Set(
        groupStudents.filter((gs) => gs.group_id === session.group_id).map((gs) => gs.student_id)
      );

      const targetStudents = allStudents.filter((s) => enrolledStudentIds.has(s.id));

      // 3. Cache students in bulk
      await offlineDb.cachedStudents.bulkPut(
        targetStudents.map((s) => ({
          id: s.id,
          center_id: s.center_id,
          student_code: s.student_code,
          full_name: s.full_name,
          qr_token: s.qr_token,
          status: s.status,
          photo_url: s.photo_url,
          grade: s.grade,
          parent_phone: s.parent_phone
        }))
      );

      // 4. Cache enrollment links
      await offlineDb.cachedGroupStudents.bulkPut(
        targetStudents.map((s) => ({
          id: `${session.group_id}_${s.id}`,
          group_id: session.group_id,
          student_id: s.id
        }))
      );

      return targetStudents.length;
    } catch (err) {
      console.error('Failed to prepare offline session data in IndexedDB:', err);
      return 0;
    }
  }

  /**
   * Validates and records attendance strictly offline inside IndexedDB
   */
  static async scanOffline(
    qrToken: string,
    sessionId: string,
    mode: 'check_in' | 'check_out' = 'check_in'
  ): Promise<OfflineScanResult> {
    try {
      // 1. Find Student in Cached IndexedDB
      const student = await offlineDb.cachedStudents.where('qr_token').equals(qrToken.trim()).first();
      if (!student) {
        return {
          success: false,
          mode,
          message: 'رمز QR غير موجود في بيانات الحصة المحفوظة أوفلاين',
          error_code: 'OFFLINE_STUDENT_NOT_FOUND',
          is_offline: true
        };
      }

      if (student.status !== 'active') {
        return {
          success: false,
          mode,
          message: 'حساب الطالب معطل أو مؤرشف',
          error_code: 'STUDENT_SUSPENDED',
          is_offline: true
        };
      }

      // 2. Verify Session
      const session = await offlineDb.cachedSessions.get(sessionId);
      if (!session) {
        return {
          success: false,
          mode,
          message: 'بيانات الحصة غير محملة أوفلاين',
          error_code: 'OFFLINE_SESSION_NOT_FOUND',
          is_offline: true
        };
      }

      // 3. Verify Enrollment
      const enrollment = await offlineDb.cachedGroupStudents
        .where('[group_id+student_id]')
        .equals([session.group_id, student.id])
        .first();

      if (!enrollment) {
        return {
          success: false,
          mode,
          message: `الطالب غير مقيد في هذه المجموعة أوفلاين (${session.group_name})`,
          error_code: 'NOT_IN_GROUP',
          student: {
            id: student.id,
            full_name: student.full_name,
            student_code: student.student_code,
            photo_url: student.photo_url
          },
          is_offline: true
        };
      }

      // 4. Duplicate Check in local IndexedDB offline events
      const existingEvent = await offlineDb.offlineEvents
        .where('[session_id+student_id]')
        .equals([sessionId, student.id])
        .first();

      const nowTimeStr = new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
      const nowIso = new Date().toISOString();

      if (mode === 'check_out') {
        if (!existingEvent) {
          return {
            success: false,
            mode: 'check_out',
            message: 'لم يتم تسجيل حضور الطالب أوفلاين بعد ليتم تسجيل انصرافه',
            error_code: 'NOT_CHECKED_IN',
            student,
            is_offline: true
          };
        }

        // Record check_out offline
        const offlineEventId = `off-evt-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
        await offlineDb.offlineEvents.add({
          offline_event_id: offlineEventId,
          student_id: student.id,
          student_name: student.full_name,
          student_code: student.student_code,
          session_id: sessionId,
          center_id: session.center_id,
          device_id: getOrCreateDeviceId(),
          event_type: 'check_out',
          status: existingEvent.status,
          local_timestamp: nowIso,
          sync_status: 'pending'
        });

        return {
          success: true,
          mode: 'check_out',
          message: 'تم تسجيل الانصراف محلياً (وضع أوفلاين)',
          student,
          time: nowTimeStr,
          status: existingEvent.status,
          is_offline: true
        };
      }

      // Check-in Duplicate Prevention
      if (existingEvent && existingEvent.event_type === 'check_in') {
        const recordedTime = new Date(existingEvent.local_timestamp).toLocaleTimeString('ar-EG', {
          hour: '2-digit',
          minute: '2-digit'
        });
        return {
          success: false,
          mode: 'check_in',
          message: `تم تسجيل الحضور محلياً مسبقاً في الساعة ${recordedTime}`,
          error_code: 'DUPLICATE_OFFLINE_ATTENDANCE',
          student,
          time: recordedTime,
          status: existingEvent.status,
          is_offline: true
        };
      }

      // Record offline check-in event
      const offlineEventId = `off-evt-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      await offlineDb.offlineEvents.add({
        offline_event_id: offlineEventId,
        student_id: student.id,
        student_name: student.full_name,
        student_code: student.student_code,
        session_id: sessionId,
        center_id: session.center_id,
        device_id: getOrCreateDeviceId(),
        event_type: 'check_in',
        status: 'present',
        local_timestamp: nowIso,
        sync_status: 'pending'
      });

      return {
        success: true,
        mode: 'check_in',
        message: 'تمام، اتحضر بنجاح (وضع بدون اتصال)',
        student,
        time: nowTimeStr,
        status: 'present',
        is_offline: true
      };
    } catch (err) {
      console.error('Offline scan error:', err);
      return {
        success: false,
        mode,
        message: 'حدث خطأ في قاعدة البيانات المحلية',
        error_code: 'OFFLINE_STORAGE_ERROR',
        is_offline: true
      };
    }
  }

  /**
   * Returns count of queued events pending upload
   */
  static async getPendingCount(): Promise<number> {
    try {
      return await offlineDb.offlineEvents.where('sync_status').equals('pending').count();
    } catch {
      return 0;
    }
  }

  /**
   * Retrieves all pending events
   */
  static async getPendingEvents(): Promise<QueuedOfflineEvent[]> {
    try {
      return await offlineDb.offlineEvents.where('sync_status').equals('pending').toArray();
    } catch {
      return [];
    }
  }

  /**
   * Synchronizes queued offline events with the server
   */
  static async syncEvents(
    syncHandler: (event: QueuedOfflineEvent) => Promise<{ success: boolean; error?: string }>
  ): Promise<{ synced: number; failed: number }> {
    const pending = await this.getPendingEvents();
    let synced = 0;
    let failed = 0;

    for (const evt of pending) {
      try {
        if (!evt.id) continue;
        await offlineDb.offlineEvents.update(evt.id, { sync_status: 'syncing' });

        const res = await syncHandler(evt);
        if (res.success) {
          await offlineDb.offlineEvents.update(evt.id, { sync_status: 'synced' });
          synced++;
        } else {
          await offlineDb.offlineEvents.update(evt.id, {
            sync_status: 'failed',
            error_message: res.error || 'Server rejected offline event'
          });
          failed++;
        }
      } catch (err: unknown) {
        if (evt.id) {
          await offlineDb.offlineEvents.update(evt.id, {
            sync_status: 'failed',
            error_message: err instanceof Error ? err.message : 'Unknown network failure'
          });
        }
        failed++;
      }
    }

    return { synced, failed };
  }
}

