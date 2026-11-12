// ====================================================================
// HADAR SaaS Platform — Excel Import & Export Engine (XLSX)
// Developed by MADAAR Technologies
// ====================================================================

import * as XLSX from 'xlsx';
import { Student, AttendanceRecord } from '@/types/database';

export interface ImportedStudentRow {
  full_name: string;
  phone: string;
  parent_phone: string;
  stage: string;
  grade: string;
  group_name?: string;
}

export function exportStudentsToExcel(students: Student[], centerName: string) {
  const data = students.map((s, idx) => ({
    '#': idx + 1,
    'كود الطالب': s.student_code,
    'اسم الطالب': s.full_name,
    'المرحلة': s.stage,
    'الصف الدراسي': s.grade,
    'هاتف الطالب': s.phone || '-',
    'هاتف ولي الأمر': s.parent_phone,
    'الحالة': s.status === 'active' ? 'نشط' : s.status === 'suspended' ? 'معطل' : 'مؤرشف',
    'تاريخ القيد': s.enrollment_date
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'الطلاب');

  const filename = `HADAR_Students_${centerName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(workbook, filename);
}

export function exportAttendanceToExcel(records: AttendanceRecord[], sessionTitle: string) {
  const data = records.map((r, idx) => ({
    '#': idx + 1,
    'كود الطالب': r.student?.student_code || '-',
    'اسم الطالب': r.student?.full_name || '-',
    'الحالة':
      r.status === 'present'
        ? 'حاضر'
        : r.status === 'late'
        ? 'متأخر'
        : r.status === 'absent'
        ? 'غائب'
        : r.status === 'excused'
        ? 'معتذر'
        : 'انصراف مبكر',
    'وقت الحضور': r.check_in_time ? new Date(r.check_in_time).toLocaleTimeString('ar-EG') : '-',
    'وقت الانصراف': r.check_out_time ? new Date(r.check_out_time).toLocaleTimeString('ar-EG') : '-',
    'طريقة التسجيل': r.recorded_via === 'qr_scanner' ? 'الماسح الذكي QR' : 'يدوي',
    'ملاحظات': r.notes || '-'
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'سجل الحضور');

  const filename = `HADAR_Attendance_${sessionTitle.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(workbook, filename);
}

export async function parseStudentsExcelFile(file: File): Promise<ImportedStudentRow[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const json: Record<string, string | number>[] = XLSX.utils.sheet_to_json(worksheet);

        const rows: ImportedStudentRow[] = json.map((row) => {
          // Normalize various possible header names in Arabic and English
          const fullName = String(row['اسم الطالب'] || row['الاسم'] || row['Name'] || row['Full Name'] || '').trim();
          const parentPhone = String(row['هاتف ولي الأمر'] || row['تليفون ولي الأمر'] || row['ولي الأمر'] || row['Parent Phone'] || '').trim();
          const studentPhone = String(row['هاتف الطالب'] || row['الموبايل'] || row['Phone'] || '').trim();
          const stage = String(row['المرحلة'] || row['المرحلة التعليمية'] || row['Stage'] || 'الثانوية العامة').trim();
          const grade = String(row['الصف'] || row['الصف الدراسي'] || row['Grade'] || 'الصف الثالث الثانوي').trim();
          const groupName = String(row['المجموعة'] || row['اسم المجموعة'] || row['Group'] || '').trim();

          return {
            full_name: fullName,
            phone: studentPhone,
            parent_phone: parentPhone,
            stage,
            grade,
            group_name: groupName || undefined
          };
        }).filter((r) => r.full_name && r.parent_phone);

        resolve(rows);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = (err) => reject(err);
    reader.readAsArrayBuffer(file);
  });
}

