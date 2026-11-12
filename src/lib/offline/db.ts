// ====================================================================
// HADAR SaaS Platform — IndexedDB Client via Dexie.js
// Developed by MADAAR Technologies
// ====================================================================

import Dexie, { Table } from 'dexie';
import { AttendanceStatus } from '@/types/database';

export interface CachedStudent {
  id: string;
  center_id: string;
  student_code: string;
  full_name: string;
  qr_token: string;
  status: string;
  photo_url?: string;
  grade: string;
  parent_phone: string;
}

export interface CachedGroupStudent {
  id: string;
  group_id: string;
  student_id: string;
}

export interface CachedSession {
  id: string;
  center_id: string;
  group_id: string;
  group_name: string;
  session_date: string;
  start_time: string;
  status: string;
}

export interface QueuedOfflineEvent {
  id?: number;
  offline_event_id: string;
  student_id: string;
  student_name: string;
  student_code: string;
  session_id: string;
  center_id: string;
  device_id: string;
  event_type: 'check_in' | 'check_out';
  status: AttendanceStatus;
  local_timestamp: string;
  sync_status: 'pending' | 'syncing' | 'synced' | 'failed';
  error_message?: string;
}

export class HadarOfflineDatabase extends Dexie {
  cachedStudents!: Table<CachedStudent, string>;
  cachedGroupStudents!: Table<CachedGroupStudent, string>;
  cachedSessions!: Table<CachedSession, string>;
  offlineEvents!: Table<QueuedOfflineEvent, number>;

  constructor() {
    super('HadarOfflineDB');
    this.version(1).stores({
      cachedStudents: 'id, qr_token, student_code, center_id, status',
      cachedGroupStudents: 'id, [group_id+student_id], group_id, student_id',
      cachedSessions: 'id, center_id, group_id, status',
      offlineEvents: '++id, &offline_event_id, [session_id+student_id], sync_status, local_timestamp'
    });
  }
}

export const offlineDb = new HadarOfflineDatabase();

// Device fingerprint generator for offline tracking
export function getOrCreateDeviceId(): string {
  if (typeof window === 'undefined') return 'server-device';
  let deviceId = localStorage.getItem('hadar_device_id');
  if (!deviceId) {
    deviceId = `dev-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    localStorage.setItem('hadar_device_id', deviceId);
  }
  return deviceId;
}

