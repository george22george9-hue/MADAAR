'use client';

// ====================================================================
// HADAR SaaS Platform — Dedicated Center Assistant Scanner (/c/[slug]/scanner)
// Developed by MADAAR Technologies
// Scoped to specific Center slug for assistants and room supervisors.
// ====================================================================

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  QrCode,
  Camera,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Users,
  Wifi,
  WifiOff,
  RefreshCw,
  Sparkles,
  Volume2,
  VolumeX,
  Keyboard,
  GraduationCap,
  ArrowRight,
  ShieldCheck,
  Building2
} from 'lucide-react';
import { useData, ScanResult } from '@/lib/store/data-context';
import { Student, AttendanceStatus } from '@/types/database';

function AssistantScannerContent() {
  const params = useParams();
  const slug = params?.slug as string;
  const router = useRouter();

  const {
    allCenters,
    sessions,
    groups,
    students,
    attendance,
    processQrAttendance,
    recordManualAttendance
  } = useData();

  // Find center
  const center = allCenters.find((c) => c.slug === slug) || allCenters[0];

  // Active Session & Mode
  const centerGroups = groups.filter((g) => g.center_id === center.id);
  const centerGroupIds = centerGroups.map((g) => g.id);
  const centerSessions = sessions.filter((s) => centerGroupIds.includes(s.group_id));

  const [selectedSessionId, setSelectedSessionId] = useState<string>('');
  const [mode, setMode] = useState<'check_in' | 'check_out'>('check_in');
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Scanner States
  const [isScanning, setIsScanning] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [manualCodeInput, setManualCodeInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isOnline, setIsOnline] = useState(true);

  const scannerRef = useRef<any>(null);

  // Set default session if available
  useEffect(() => {
    if (!selectedSessionId && centerSessions.length > 0) {
      const openSession = centerSessions.find((s) => s.status === 'open');
      setSelectedSessionId(openSession ? openSession.id : centerSessions[0].id);
    }
  }, [centerSessions, selectedSessionId]);

  // Monitor Network
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsOnline(navigator.onLine);
      const onOn = () => setIsOnline(true);
      const onOff = () => setIsOnline(false);
      window.addEventListener('online', onOn);
      window.addEventListener('offline', onOff);
      return () => {
        window.removeEventListener('online', onOn);
        window.removeEventListener('offline', onOff);
      };
    }
  }, []);

  const activeSession = centerSessions.find((s) => s.id === selectedSessionId);
  const activeGroup = activeSession ? centerGroups.find((g) => g.id === activeSession.group_id) : null;

  // Audio Feedback synthesized via Web Audio API
  const playSound = (type: 'success' | 'error') => {
    if (!soundEnabled || typeof window === 'undefined') return;
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'success') {
        osc.frequency.setValueAtTime(587.33, ctx.currentTime);
        osc.frequency.setValueAtTime(880.0, ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.25, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
        osc.start();
        osc.stop(ctx.currentTime + 0.25);
      } else {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(220, ctx.currentTime);
        osc.frequency.setValueAtTime(160, ctx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
        osc.start();
        osc.stop(ctx.currentTime + 0.35);
      }
    } catch {}
  };

  // Start Camera
  const startCamera = async () => {
    if (!selectedSessionId) {
      alert('يرجى اختيار الحصة أولاً قبل تشغيل الكاميرا');
      return;
    }

    setCameraError(null);
    setIsScanning(true);

    try {
      const { Html5Qrcode } = await import('html5-qrcode');
      if (scannerRef.current) {
        try {
          await scannerRef.current.stop();
        } catch {}
      }

      const html5QrCode = new Html5Qrcode('assistant-qr-reader');
      scannerRef.current = html5QrCode;

      await html5QrCode.start(
        { facingMode: 'environment' },
        {
          fps: 15,
          qrbox: { width: 260, height: 260 },
          aspectRatio: 1.0
        },
        async (decodedText) => {
          handleScan(decodedText);
        },
        () => {}
      );
    } catch (err: any) {
      setIsScanning(false);
      setCameraError(err?.message || 'تعذر الوصول إلى الكاميرا. يرجى منح الإذن أو إدخال الكود يدوياً.');
    }
  };

  const stopCamera = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
      } catch {}
      scannerRef.current = null;
    }
    setIsScanning(false);
  };

  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {});
      }
    };
  }, []);

  const handleScan = async (qrPayload: string) => {
    if (!selectedSessionId || isProcessing) return;
    setIsProcessing(true);

    try {
      const result = await processQrAttendance(qrPayload, selectedSessionId, mode);
      setScanResult(result);
      if (result.success) {
        playSound('success');
      } else {
        playSound('error');
      }
    } catch (err: any) {
      setScanResult({
        success: false,
        message: err.message || 'خطأ أثناء معالجة الكود'
      });
      playSound('error');
    } finally {
      setTimeout(() => {
        setIsProcessing(false);
      }, 1200);
    }
  };

  const handleManualCodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCodeInput.trim()) return;
    handleScan(manualCodeInput.trim());
    setManualCodeInput('');
  };

  // Session attendance count
  const sessionAttendance = attendance.filter((a) => a.session_id === selectedSessionId);
  const presentCount = sessionAttendance.filter((a) => a.status === 'present').length;
  const lateCount = sessionAttendance.filter((a) => a.status === 'late').length;

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col">
      {/* Top Header */}
      <header className="bg-[#111D2D] text-white px-4 py-3 border-b border-[#1E2A3D] sticky top-0 z-30 shadow-md">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href={`/c/${center.slug}`}
              className="w-9 h-9 rounded-xl bg-[#1E2A3D] text-[#C7A66A] flex items-center justify-center hover:bg-[#C7A66A] hover:text-[#111D2D] transition"
            >
              <ArrowRight className="w-5 h-5 rotate-180" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-extrabold text-sm text-[#C7A66A] tracking-tight">
                  {center.name_ar}
                </h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-[#27877E]/20 text-teal-300 border border-[#27877E]/40 font-bold">
                  سكانر الأسيستانت
                </span>
              </div>
              <p className="text-[10px] text-slate-400">
                تسجيل الحضور والانصراف بالـ QR للقاعة
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-2 rounded-lg bg-[#1E2A3D] text-slate-300 hover:text-white transition"
              title={soundEnabled ? 'كتم الصوت' : 'تفعيل الصوت'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-[#C7A66A]" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
            </button>

            <span
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                isOnline ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
              }`}
            >
              {isOnline ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
              <span>{isOnline ? 'متصل' : 'أوفلاين'}</span>
            </span>
          </div>
        </div>
      </header>

      {/* Main Body */}
      <main className="max-w-3xl mx-auto px-4 py-4 flex-1 w-full space-y-4">
        {/* Session Selector & Mode Controls */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                اختر الحصة النشطة للقاعة:
              </label>
              <select
                value={selectedSessionId}
                onChange={(e) => setSelectedSessionId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-[#111D2D] focus:outline-none focus:border-[#C7A66A] bg-slate-50"
              >
                {centerSessions.map((s) => {
                  const grp = centerGroups.find((g) => g.id === s.group_id);
                  return (
                    <option key={s.id} value={s.id}>
                      {grp?.name} ({s.date} • {s.start_time} - {s.end_time}) {s.status === 'open' ? '🟢 مفتوحة' : '⚪ مغلقة'}
                    </option>
                  );
                })}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                نوع العملية:
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setMode('check_in')}
                  className={`py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                    mode === 'check_in'
                      ? 'bg-[#27877E] text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>تسجيل حضور</span>
                </button>
                <button
                  type="button"
                  onClick={() => setMode('check_out')}
                  className={`py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                    mode === 'check_out'
                      ? 'bg-[#111D2D] text-[#C7A66A] shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>تسجيل انصراف</span>
                </button>
              </div>
            </div>
          </div>

          {/* Quick Counter */}
          {activeSession && (
            <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
              <span className="text-slate-500 font-medium">
                المجموعة: <strong className="text-[#111D2D]">{activeGroup?.name}</strong> • المدرس: {activeGroup?.teacher_name}
              </span>
              <div className="flex items-center gap-3 font-bold">
                <span className="text-emerald-700">حاضر: {presentCount}</span>
                <span className="text-amber-700">متأخر: {lateCount}</span>
              </div>
            </div>
          )}
        </div>

        {/* Camera Box */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-card text-center space-y-4">
          <div className="relative mx-auto max-w-sm aspect-square bg-[#111D2D] rounded-2xl overflow-hidden flex flex-col items-center justify-center border-4 border-slate-200">
            <div id="assistant-qr-reader" className="w-full h-full" />

            {!isScanning && (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-[#111D2D] text-white space-y-4">
                <div className="w-20 h-20 rounded-full bg-[#1E2A3D] flex items-center justify-center text-[#C7A66A] shadow-gold">
                  <QrCode className="w-10 h-10 animate-pulse" />
                </div>
                <div>
                  <h3 className="font-bold text-sm">الكاميرا متوقفة</h3>
                  <p className="text-xs text-slate-400 mt-1">
                    اضغط أدناه لتشغيل كاميرا الهاتف لمسح كروت الطلاب فوراً
                  </p>
                </div>
                <button
                  onClick={startCamera}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#C7A66A] to-[#8C6F3B] text-[#111D2D] font-bold text-xs shadow-gold hover:opacity-95 transition flex items-center gap-2"
                >
                  <Camera className="w-4 h-4" />
                  <span>تشغيل الكاميرا الآن</span>
                </button>
              </div>
            )}

            {isScanning && (
              <div className="absolute bottom-3 left-3 right-3 flex justify-center z-10">
                <button
                  onClick={stopCamera}
                  className="px-4 py-1.5 rounded-xl bg-red-600/90 text-white text-xs font-bold hover:bg-red-700 transition backdrop-blur-sm"
                >
                  إيقاف الكاميرا
                </button>
              </div>
            )}
          </div>

          {cameraError && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
              {cameraError}
            </div>
          )}

          {/* Scan Feedback Banner */}
          {scanResult && (
            <div
              className={`p-4 rounded-xl border text-right transition-all animate-fadeIn ${
                scanResult.success
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                  : 'bg-red-50 border-red-300 text-red-900'
              }`}
            >
              <div className="flex items-start gap-3">
                {scanResult.success ? (
                  <CheckCircle2 className="w-7 h-7 text-emerald-600 flex-shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-7 h-7 text-red-600 flex-shrink-0 mt-0.5" />
                )}
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-extrabold text-sm">{scanResult.message}</h4>
                    <span className="text-[11px] font-mono text-slate-500">
                      {new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </span>
                  </div>

                  {scanResult.student && (
                    <div className="mt-2 pt-2 border-t border-emerald-200/60 flex items-center justify-between text-xs">
                      <div>
                        <p className="font-bold text-slate-900">{scanResult.student.name}</p>
                        <p className="text-[11px] text-slate-500 font-mono">
                          كود الطالب: {scanResult.student.student_code} • {scanResult.student.grade}
                        </p>
                      </div>
                      <span className="px-2 py-1 rounded-lg bg-emerald-600 text-white font-bold text-[11px]">
                        {mode === 'check_in' ? 'تم الحضور' : 'تم الانصراف'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Manual Input Form Fallback */}
          <form onSubmit={handleManualCodeSubmit} className="pt-3 border-t border-slate-100">
            <label className="block text-right text-xs font-bold text-slate-700 mb-1">
              أو أدخل كود الطالب يدوياً (في حال تعذر مسح الكاميرا):
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={manualCodeInput}
                onChange={(e) => setManualCodeInput(e.target.value)}
                placeholder="مثال: STU-2026-001 أو رقم الهاتف"
                className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono font-bold focus:outline-none focus:border-[#C7A66A]"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-[#111D2D] text-[#C7A66A] font-bold text-xs hover:bg-[#1E2A3D] transition flex items-center gap-1.5"
              >
                <Keyboard className="w-3.5 h-3.5" />
                <span>تسجيل</span>
              </button>
            </div>
          </form>
        </div>

        {/* Recent Session Attendance Roster */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-[#111D2D] flex items-center gap-2">
              <Users className="w-4 h-4 text-[#27877E]" />
              الطلاب الذين تم تحضيرهم في هذه الحصة ({sessionAttendance.length})
            </h3>
            <span className="text-[11px] text-slate-400">تحديث فوري</span>
          </div>

          {sessionAttendance.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-6">
              لم يتم تسجيل حضور أي طالب حتى الآن لهذه الحصة. ابدأ بالمسح أعلاه.
            </p>
          ) : (
            <div className="divide-y divide-slate-100 max-h-60 overflow-y-auto text-xs">
              {sessionAttendance.slice(-8).reverse().map((att) => {
                const stu = students.find((s) => s.id === att.student_id);
                return (
                  <div key={att.id} className="py-2.5 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-slate-900">{stu?.name || 'طالب مسجل'}</p>
                      <p className="text-[10px] text-slate-500 font-mono">
                        {stu?.student_code} • وقت التحضير: {att.check_in_time ? new Date(att.check_in_time).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }) : '—'}
                      </p>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        att.status === 'present'
                          ? 'bg-emerald-50 text-emerald-700'
                          : att.status === 'late'
                          ? 'bg-amber-50 text-amber-700'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {att.status === 'present' ? 'حاضر' : att.status === 'late' ? 'متأخر' : att.status}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default function CenterAssistantScannerPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-slate-500">جاري تحميل سكانر السنتر...</div>}>
      <AssistantScannerContent />
    </Suspense>
  );
}
