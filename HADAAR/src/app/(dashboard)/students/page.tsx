'use client';

// ====================================================================
// HADAR SaaS Platform — Student Management Module
// Developed by MADAAR Technologies
// ====================================================================

import React, { useState, useMemo } from 'react';
import {
  Users,
  Search,
  Filter,
  Plus,
  FileSpreadsheet,
  Download,
  QrCode,
  Edit2,
  Archive,
  Phone,
  CheckCircle,
  AlertCircle,
  GraduationCap,
  X,
  Printer,
  Sparkles
} from 'lucide-react';
import { useI18n } from '@/lib/i18n/context';
import { useData } from '@/lib/store/data-context';
import { Student } from '@/types/database';
import { exportStudentsToExcel, parseStudentsExcelFile } from '@/lib/excel/service';
import QRCode from 'qrcode';

export default function StudentsPage() {
  const { t } = useI18n();
  const {
    students,
    groups,
    currentCenter,
    addStudent,
    updateStudent,
    archiveStudent,
    bulkAddStudents
  } = useData();

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [sortBy, setSortBy] = useState<'name' | 'code' | 'date'>('name');

  // Modal States
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState<Student | 'BULK' | null>(null);
  const [qrCodeDataUrls, setQrCodeDataUrls] = useState<Record<string, string>>({});

  // Form State for Add / Edit
  const [formData, setFormData] = useState({
    student_code: '',
    full_name: '',
    phone: '',
    parent_phone: '',
    stage: 'الثانوية العامة',
    grade: 'الصف الثالث الثانوي',
    status: 'active' as Student['status'],
    notes: '',
    selectedGroups: [] as string[]
  });

  // Filtered & Sorted Students
  const filteredStudents = useMemo(() => {
    return students
      .filter((s) => {
        const matchesSearch =
          s.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.student_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.parent_phone.includes(searchQuery) ||
          (s.phone && s.phone.includes(searchQuery));

        const matchesGrade = selectedGrade === 'ALL' || s.grade === selectedGrade;
        const matchesStatus = selectedStatus === 'ALL' || s.status === selectedStatus;

        return matchesSearch && matchesGrade && matchesStatus;
      })
      .sort((a, b) => {
        if (sortBy === 'name') return a.full_name.localeCompare(b.full_name, 'ar');
        if (sortBy === 'code') return a.student_code.localeCompare(b.student_code);
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
  }, [students, searchQuery, selectedGrade, selectedStatus, sortBy]);

  // Open Edit Modal
  const handleOpenEdit = (student: Student) => {
    setEditingStudent(student);
    setFormData({
      student_code: student.student_code,
      full_name: student.full_name,
      phone: student.phone || '',
      parent_phone: student.parent_phone,
      stage: student.stage,
      grade: student.grade,
      status: student.status,
      notes: student.notes || '',
      selectedGroups: []
    });
    setShowAddModal(true);
  };

  // Open Add Modal
  const handleOpenAdd = () => {
    setEditingStudent(null);
    const nextCode = `NK-${students.length + 101}`;
    setFormData({
      student_code: nextCode,
      full_name: '',
      phone: '',
      parent_phone: '',
      stage: 'الثانوية العامة',
      grade: 'الصف الثالث الثانوي',
      status: 'active',
      notes: '',
      selectedGroups: groups.length > 0 ? [groups[0].id] : []
    });
    setShowAddModal(true);
  };

  // Save Student (Create or Update)
  const handleSubmitStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.full_name || !formData.parent_phone) return;

    if (editingStudent) {
      updateStudent(editingStudent.id, {
        student_code: formData.student_code,
        full_name: formData.full_name,
        phone: formData.phone,
        parent_phone: formData.parent_phone,
        stage: formData.stage,
        grade: formData.grade,
        status: formData.status,
        notes: formData.notes
      });
    } else {
      addStudent(
        {
          center_id: currentCenter.id,
          student_code: formData.student_code,
          full_name: formData.full_name,
          phone: formData.phone,
          parent_phone: formData.parent_phone,
          stage: formData.stage,
          grade: formData.grade,
          enrollment_date: new Date().toISOString().split('T')[0],
          status: formData.status,
          notes: formData.notes
        },
        formData.selectedGroups
      );
    }

    setShowAddModal(false);
  };

  // Generate QR Cards
  const handleOpenPrint = async (target: Student | 'BULK') => {
    setShowPrintModal(target);
    const targets = target === 'BULK' ? filteredStudents : [target];
    const urls: Record<string, string> = {};

    for (const st of targets) {
      try {
        urls[st.id] = await QRCode.toDataURL(st.qr_token, {
          margin: 1,
          width: 200,
          color: { dark: '#111D2D', light: '#FFFFFF' }
        });
      } catch (err) {
        console.error(err);
      }
    }
    setQrCodeDataUrls(urls);
  };

  // Handle Excel File Upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const parsed = await parseStudentsExcelFile(file);
      if (parsed.length > 0) {
        const added = bulkAddStudents(parsed);
        alert(`تم استيراد ${added} طالب بنجاح من ملف الإكسيل!`);
        setShowImportModal(false);
      } else {
        alert('لم يتم العثور على سجلات صالحة في الملف. يرجى التأكد من الأعمدة المطلوبة.');
      }
    } catch {
      alert('حدث خطأ أثناء قراءة ملف الإكسيل.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#111D2D] flex items-center gap-2">
            <Users className="w-6 h-6 text-[#27877E]" />
            إدارة الطلاب ({filteredStudents.length})
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            سجل الطلاب المسجلين بالسنتر، توليد كروت QR الذكية، واستيراد وتصدير البيانات.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => exportStudentsToExcel(filteredStudents, currentCenter.name_ar)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-sm transition"
          >
            <Download className="w-3.5 h-3.5 text-emerald-600" />
            <span>تصدير إكسيل</span>
          </button>

          <button
            onClick={() => setShowImportModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-sm transition"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-blue-600" />
            <span>استيراد إكسيل</span>
          </button>

          <button
            onClick={() => handleOpenPrint('BULK')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-[#111D2D] hover:bg-slate-50 shadow-sm transition"
          >
            <Printer className="w-3.5 h-3.5 text-[#C7A66A]" />
            <span>طباعة كروت QR مجمعة</span>
          </button>

          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#C7A66A] hover:bg-[#B08E4F] text-[#111D2D] text-xs font-bold shadow-gold transition"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة طالب جديد</span>
          </button>
        </div>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="بحث بالاسم، الكود، أو الهاتف..."
            className="w-full pr-9 pl-4 py-2 rounded-lg border border-slate-200 text-xs focus:outline-none focus:border-[#C7A66A]"
          />
        </div>

        {/* Filter Dropdowns */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          {/* Grade filter */}
          <select
            value={selectedGrade}
            onChange={(e) => setSelectedGrade(e.target.value)}
            className="px-3 py-2 rounded-lg border border-slate-200 text-xs bg-white text-slate-700 focus:outline-none focus:border-[#C7A66A]"
          >
            <option value="ALL">جميع الصفوف الدراسية</option>
            <option value="الصف الثالث الثانوي">الصف الثالث الثانوي</option>
            <option value="الصف الثاني الثانوي">الصف الثاني الثانوي</option>
            <option value="الصف الأول الثانوي">الصف الأول الثانوي</option>
            <option value="الصف الثالث الإعدادي">الصف الثالث الإعدادي</option>
          </select>

          {/* Status filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 rounded-lg border border-slate-200 text-xs bg-white text-slate-700 focus:outline-none focus:border-[#C7A66A]"
          >
            <option value="ALL">جميع الحالات</option>
            <option value="active">نشط فقط</option>
            <option value="suspended">معطل</option>
            <option value="archived">مؤرشف</option>
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'name' | 'code' | 'date')}
            className="px-3 py-2 rounded-lg border border-slate-200 text-xs bg-white text-slate-700 focus:outline-none focus:border-[#C7A66A]"
          >
            <option value="name">ترتيب بالاسم</option>
            <option value="code">ترتيب بالكود</option>
            <option value="date">تاريخ التسجيل</option>
          </select>
        </div>
      </div>

      {/* Students Data Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
              <tr>
                <th className="px-4 py-3">الطالب</th>
                <th className="px-4 py-3">كود الطالب</th>
                <th className="px-4 py-3">الصف الدراسي</th>
                <th className="px-4 py-3">هاتف الطالب</th>
                <th className="px-4 py-3">هاتف ولي الأمر</th>
                <th className="px-4 py-3">الحالة</th>
                <th className="px-4 py-3 text-center">بطاقة QR</th>
                <th className="px-4 py-3 text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    لا توجد بيانات مطابقة للبحث أو الفلتر
                  </td>
                </tr>
              ) : (
                filteredStudents.map((st) => (
                  <tr key={st.id} className="hover:bg-slate-50/70 transition">
                    {/* Student Name & Avatar */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-xs text-[#111D2D] overflow-hidden">
                          {st.photo_url ? (
                            <img src={st.photo_url} alt="" className="w-full h-full object-cover" />
                          ) : (
                            st.full_name.substring(0, 2)
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-[#111D2D]">{st.full_name}</p>
                          <p className="text-[11px] text-slate-400">{st.notes || 'طالب مسجل'}</p>
                        </div>
                      </div>
                    </td>

                    {/* Student Code */}
                    <td className="px-4 py-3 font-mono font-bold text-[#27877E]">
                      {st.student_code}
                    </td>

                    {/* Grade & Stage */}
                    <td className="px-4 py-3 text-slate-600">
                      <div>{st.grade}</div>
                      <div className="text-[10px] text-slate-400">{st.stage}</div>
                    </td>

                    {/* Student Phone */}
                    <td className="px-4 py-3 font-mono text-slate-600">
                      {st.phone || '-'}
                    </td>

                    {/* Parent Phone with WhatsApp quick button */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-slate-700">{st.parent_phone}</span>
                        <a
                          href={`https://wa.me/2${st.parent_phone}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-5 h-5 rounded bg-emerald-100 text-emerald-700 flex items-center justify-center hover:bg-emerald-200"
                          title="مراسلة ولي الأمر عبر واتساب"
                        >
                          <Phone className="w-3 h-3" />
                        </a>
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                          st.status === 'active'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : st.status === 'suspended'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {st.status === 'active' ? 'نشط' : st.status === 'suspended' ? 'معطل' : 'مؤرشف'}
                      </span>
                    </td>

                    {/* QR Card trigger */}
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => handleOpenPrint(st)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#111D2D]/5 hover:bg-[#111D2D]/10 text-[#111D2D] font-medium text-[11px] transition"
                        title="معاينة وطباعة بطاقة الـ QR"
                      >
                        <QrCode className="w-3.5 h-3.5 text-[#C7A66A]" />
                        <span>عرض البطاقة</span>
                      </button>
                    </td>

                    {/* Action buttons */}
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => handleOpenEdit(st)}
                          className="p-1.5 rounded-md hover:bg-slate-100 text-slate-600 transition"
                          title="تعديل بيانات الطالب"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`هل أنت متأكد من أرشفة الطالب ${st.full_name}؟ (لن يتم حذف السجلات القديمة)`)) {
                              archiveStudent(st.id);
                            }
                          }}
                          className="p-1.5 rounded-md hover:bg-red-50 text-red-500 transition"
                          title="أرشفة الطالب"
                        >
                          <Archive className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Student Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden border border-slate-200">
            <div className="p-5 bg-[#111D2D] text-white flex items-center justify-between">
              <h2 className="text-base font-bold flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-[#C7A66A]" />
                {editingStudent ? 'تعديل بيانات الطالب' : 'إضافة طالب جديد'}
              </h2>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitStudent} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">اسم الطالب رباعي *</label>
                  <input
                    type="text"
                    required
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-[#C7A66A]"
                    placeholder="مثال: عمر خالد المنشاوي"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">كود الطالب الفريد *</label>
                  <input
                    type="text"
                    required
                    value={formData.student_code}
                    onChange={(e) => setFormData({ ...formData, student_code: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-[#C7A66A] font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">هاتف ولي الأمر *</label>
                  <input
                    type="tel"
                    required
                    value={formData.parent_phone}
                    onChange={(e) => setFormData({ ...formData, parent_phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-[#C7A66A] font-mono"
                    placeholder="01012345678"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">هاتف الطالب (اختياري)</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-[#C7A66A] font-mono"
                    placeholder="01123456789"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">المرحلة التعليمية</label>
                  <select
                    value={formData.stage}
                    onChange={(e) => setFormData({ ...formData, stage: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-[#C7A66A] bg-white"
                  >
                    <option value="الثانوية العامة">الثانوية العامة</option>
                    <option value="المرحلة الإعدادية">المرحلة الإعدادية</option>
                    <option value="المرحلة الابتدائية">المرحلة الابتدائية</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">الصف الدراسي</label>
                  <select
                    value={formData.grade}
                    onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-[#C7A66A] bg-white"
                  >
                    <option value="الصف الثالث الثانوي">الصف الثالث الثانوي</option>
                    <option value="الصف الثاني الثانوي">الصف الثاني الثانوي</option>
                    <option value="الصف الأول الثانوي">الصف الأول الثانوي</option>
                    <option value="الصف الثالث الإعدادي">الصف الثالث الإعدادي</option>
                  </select>
                </div>
              </div>

              {!editingStudent && (
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">تسجيل الطالب في المجموعات:</label>
                  <div className="space-y-1.5 max-h-32 overflow-y-auto border border-slate-200 rounded-lg p-2.5">
                    {groups.map((grp) => (
                      <label key={grp.id} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.selectedGroups.includes(grp.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData({ ...formData, selectedGroups: [...formData.selectedGroups, grp.id] });
                            } else {
                              setFormData({
                                ...formData,
                                selectedGroups: formData.selectedGroups.filter((id) => id !== grp.id)
                              });
                            }
                          }}
                          className="rounded text-[#27877E] focus:ring-[#27877E]"
                        />
                        <span className="text-slate-800">{grp.name} ({grp.monthly_price} ج.م)</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="block font-semibold text-slate-700 mb-1">ملاحظات إدارية</label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="ملاحظات حول الطالب أو توصيات المدرس..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-[#C7A66A]"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-[#C7A66A] hover:bg-[#B08E4F] text-[#111D2D] font-bold shadow-md"
                >
                  {editingStudent ? 'حفظ التعديلات' : 'إضافة وتوليد كارت الـ QR'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Excel Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden border border-slate-200">
            <div className="p-5 bg-[#111D2D] text-white flex items-center justify-between">
              <h2 className="text-base font-bold flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
                استيراد الطلاب من ملف Excel
              </h2>
              <button onClick={() => setShowImportModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <p className="text-slate-600 leading-relaxed">
                يمكنك رفع شيت إكسيل (.xlsx أو .csv) يحتوي على الطلاب. تأكد من وجود الأعمدة التالية في الصف الأول:
              </p>
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 space-y-1 font-mono text-[11px] text-slate-700">
                <p>• <strong>اسم الطالب</strong> (إجباري)</p>
                <p>• <strong>هاتف ولي الأمر</strong> (إجباري)</p>
                <p>• <strong>هاتف الطالب</strong> (اختياري)</p>
                <p>• <strong>الصف الدراسي</strong> (اختياري)</p>
                <p>• <strong>اسم المجموعة</strong> (اختياري للتسكين التلقائي)</p>
              </div>

              <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:border-[#C7A66A] transition bg-slate-50">
                <FileSpreadsheet className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#111D2D] text-white font-semibold shadow-sm hover:bg-[#1E2A3D] transition">
                  <span>اختر ملف Excel من جهازك</span>
                  <input
                    type="file"
                    accept=".xlsx, .xls, .csv"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>

              <div className="text-right">
                <button
                  onClick={() => setShowImportModal(false)}
                  className="w-full py-2 rounded-lg border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50"
                >
                  إغلاق
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* QR Card Print Modal (Single or Bulk) */}
      {showPrintModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] shadow-2xl flex flex-col overflow-hidden border border-slate-200">
            {/* Header */}
            <div className="p-5 bg-[#111D2D] text-white flex items-center justify-between no-print">
              <div>
                <h2 className="text-base font-bold flex items-center gap-2">
                  <Printer className="w-5 h-5 text-[#C7A66A]" />
                  {showPrintModal === 'BULK' ? 'طباعة كروت QR مجمعة للطلاب' : 'معاينة بطاقة QR الذكية'}
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">جاهزة للطباعة بجودة عالية بحجم بطاقة الهوية الذكية</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#C7A66A] text-[#111D2D] font-bold text-xs shadow-gold hover:bg-[#B08E4F] transition"
                >
                  <Printer className="w-4 h-4" />
                  <span>طباعة الآن</span>
                </button>
                <button onClick={() => setShowPrintModal(null)} className="text-slate-400 hover:text-white p-1">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Printable Cards Grid */}
            <div className="p-6 overflow-y-auto flex-1 bg-slate-100">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(showPrintModal === 'BULK' ? filteredStudents : [showPrintModal]).map((st) => (
                  <div
                    key={st.id}
                    className="w-full bg-white rounded-2xl p-4 border-2 border-[#111D2D] shadow-md flex items-center justify-between relative overflow-hidden"
                  >
                    {/* Golden accent bar */}
                    <div className="absolute top-0 right-0 left-0 h-2 bg-gradient-to-r from-[#C7A66A] via-[#E5CE9F] to-[#C7A66A]"></div>

                    {/* Left: QR Code */}
                    <div className="flex flex-col items-center justify-center p-2 bg-slate-50 rounded-xl border border-slate-200">
                      {qrCodeDataUrls[st.id] ? (
                        <img src={qrCodeDataUrls[st.id]} alt="QR" className="w-28 h-28 object-contain" />
                      ) : (
                        <div className="w-28 h-28 flex items-center justify-center text-[10px] text-slate-400">
                          جاري التوليد...
                        </div>
                      )}
                      <span className="font-mono text-[10px] font-bold text-slate-600 mt-1">
                        {st.student_code}
                      </span>
                    </div>

                    {/* Right: Student Information & Center Branding */}
                    <div className="flex-1 pr-4 text-right">
                      <div className="flex items-center gap-1.5 mb-1">
                        <GraduationCap className="w-4 h-4 text-[#C7A66A]" />
                        <span className="text-[11px] font-bold text-slate-600">{currentCenter.name_ar}</span>
                      </div>
                      <h3 className="text-base font-extrabold text-[#111D2D] leading-tight mb-1">
                        {st.full_name}
                      </h3>
                      <div className="space-y-0.5 text-xs text-slate-600">
                        <p><strong>الصف:</strong> {st.grade}</p>
                        <p><strong>المرحلة:</strong> {st.stage}</p>
                        <p><strong>ولي الأمر:</strong> <span className="font-mono">{st.parent_phone}</span></p>
                      </div>

                      <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                        <span>منظومة حضر الذكية</span>
                        <span>MADAAR Technologies</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

