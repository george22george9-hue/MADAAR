'use client';

// ====================================================================
// HADAR SaaS Platform — Smart QR Attendance Engine (Online & Offline)
// Developed by MADAAR Technologies
// Colors: Midnight Navy (#111D2D), Champagne Gold (#C7A66A), Deep Teal (#27877E)
// ====================================================================

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
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
  DownloadCloud,
  RefreshCw,
  Search,
  UserCheck,
  Sparkles,
  Volume2,
  VolumeX,
  Keyboard,
  ShieldCheck
} from 'lucide-react';
import { useI18n } from '@/lib/i18n/context';
import { useData, ScanResult } from '@/lib/store/data-context';
import { OfflineSyncService } from '@/lib/offline/sync-service';
import { Student, AttendanceStatus } from '@/types/database';

function ScannerContent() {
  const searchParams = useSearchParams();
  const initialSessionId = searchParams.get('session_id') || '';
  const { t } = useI18n();
  const {
    sessions,
    groups,
    students,
    attendance,
    currentCenter,
    processQrAttendance,
    recordManualAttendance
  } = useData();

  // Active Session & Mode
  const [selectedSessionId, setSelectedSessionId] = useState<string>(initialSessionId);
  const [mode, setMode] = useState<'check_in' | 'check_out'>('check_in');
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Scanner States
  const [isScanning, setIsScanning] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [manualCodeInput, setManualCodeInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Offline Engine States
  const [isOnline, setIsOnline] = useState(true);
  const [offlineCachedCount, setOfflineCachedCount] = useState<number | null>(null);
  const [isCachingOffline, setIsCachingOffline] = useState(false);

  // Manual Override Modal
  const [showManualModal, setShowManualModal] = useState(false);
  const [selectedStudentForManual, setSelectedStudentForManual] = useState<Student | null>(null);
  const [manualStatus, setManualStatus] = useState<AttendanceStatus>('present');
  const [manualReason, setManualReason] = useState('حضور يدوي بتصريح المشرف');

  const scannerRef = useRef<any>(null);

  // Set default session if available
  useEffect(() => {
    if (!selectedSessionId && sessions.length > 0) {
      const openSession = sessions.find((s) => s.status === 'open');
      setSelectedSessionId(openSession ? openSession.id : sessions[0].id);
    }
  }, [sessions, selectedSessionId]);

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

  const activeSession = sessions.find((s) => s.id === selectedSessionId);
  const activeGroup = activeSession ? groups.find((g) => g.id === activeSession.group_id) : null;

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
        osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
        osc.frequency.setValueAtTime(880.0, ctx.currentTime + 0.1); // A5
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
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
    } catch {
      // Audio not supported or blocked
    }
  };

  // Start HTML5 QR Camera Scanner
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

      const html5QrCode = new Html5Qrcode('qr-reader');
      scannerRef.current = html5QrCode;

      await html5QrCode.start(
        { facingMode: 'environment' },
        {
          fps: 15,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0
        },
        async (decodedText) => {
          // Scanned successfully!
          await handleScanToken(decodedText);
        },
        () => {
          // Frame error (ignore searching frames)
        }
      );
    } catch (err: any) {
      console.warn('Camera failed or permission denied:', err);
      setCameraError(
        'تعذر الوصول إلى الكاميرا. يمكنك استخدام الإدخال اليدوي أو اختيار الطالب من القائمة أدناه.'
      );
      setIsScanning(false);
    }
  };

  const stopCamera = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        scannerRef.current = null;
      } catch {}
    }
    setIsScanning(false);
  };

  // Process Scanned Token
  const handleScanToken = async (token: string) => {
    if (isProcessing || !token || !selectedSessionId) return;
    setIsProcessing(true);

    try {
      if (!isOnline) {
        // Offline scanning via IndexedDB
        const offlineResult = await OfflineSyncService.scanOffline(token, selectedSessionId, mode);
        if (offlineResult.success) {
          playSound('success');
          setScanResult({
            success: true,
            mode,
            message: offlineResult.message,
            student: offlineResult.student as any,
            time: offlineResult.time,
            status: offlineResult.status
          });
        } else {
          playSound('error');
          setScanResult({
            success: false,
            mode,
            message: offlineResult.message,
            error_code: offlineResult.error_code,
            student: offlineResult.student as any
          });
        }
      } else {
        // Online scanning via Data Context
        const result = await processQrAttendance(token, selectedSessionId, mode);
        if (result.success) {
          playSound('success');
        } else {
          playSound('error');
        }
        setScanResult(result);
      }
    } catch (err) {
      playSound('error');
      setScanResult({
        success: false,
        mode,
        message: 'حدث خطأ أثناء معالجة الرمز',
        error_code: 'PROCESSING_ERROR'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Pre-cache session roster for offline attendance
  const handlePrepareOfflineSession = async () => {
    if (!activeSession) return;
    setIsCachingOffline(true);
    try {
      // Mock enrollments
      const count = await OfflineSyncService.prepareOfflineSession(
        activeSession,
        students.map((s) => ({
          id: `${activeSession.group_id}_${s.id}`,
          center_id: currentCenter.id,
          group_id: activeSession.group_id,
          student_id: s.id,
          joined_at: '2026-09-01',
          status: 'active'
        })),
        students
      );
      setOfflineCachedCount(count);
      alert(`تم تحميل بيانات ${count} طالب في الذاكرة المحلية بنجاح! يمكنك الآن تسجيل الحضور بدون إنترنت.`);
    } catch (err) {
      alert('حدث خطأ أثناء حفظ البيانات أوفلاين.');
    } finally {
      setIsCachingOffline(false);
    }
  };

  // Manual Token / Code Search
  const handleManualSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCodeInput.trim()) return;

    // Search by student_code or qr_token or phone
    const student = students.find(
      (s) =>
        s.student_code.toLowerCase() === manualCodeInput.trim().toLowerCase() ||
        s.qr_token === manualCodeInput.trim() ||
        s.parent_phone === manualCodeInput.trim() ||
        (s.phone && s.phone === manualCodeInput.trim())
    );

    if (student) {
      handleScanToken(student.qr_token);
      setManualCodeInput('');
    } else {
      playSound('error');
      setScanResult({
        success: false,
        mode,
        message: 'لم يتم العثور على طالب بهذا الكود أو الرقم',
        error_code: 'UNKNOWN_STUDENT'
      });
    }
  };

  // Manual Override Record
  const handleManualOverride = async () => {
    if (!selectedStudentForManual || !selectedSessionId) return;
    await recordManualAttendance(
      selectedSessionId,
      selectedStudentForManual.id,
      manualStatus,
      manualReason
    );
    playSound('success');
    setShowManualModal(false);
    setScanResult({
      success: true,
      mode: 'check_in',
      message: 'تم تسجيل الحضور اليدوي وتوثيقه في سجل التدقيق بنجاح',
      student: selectedStudentForManual,
      time: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
      status: manualStatus
    });
  };

  // Attended students list for current session
  const sessionAttendance = attendance
    .filter((a) => a.session_id === selectedSessionId)
    .map((a) => ({
      ...a,
      student: students.find((s) => s.id === a.student_id)
    }));

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#C7A66A] text-[#111D2D]">
              الماسح الذكي المباشر
            </span>
            {!isOnline && (
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-500 text-white flex items-center gap-1">
                <WifiOff className="w-3 h-3" />
                وضع الأوفلاين نشط
              </span>
            )}
          </div>
          <h1 className="text-2xl font-bold text-[#111D2D] flex items-center gap-2">
            <QrCode className="w-6 h-6 text-[#C7A66A]" />
            تسجيل الحضور بالماسح الذكي
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            وجّه كاميرا الهاتف أو جهاز القارئ نحو بطاقة الطالب لتسجيل الحضور في أجزاء من الثانية.
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          {/* Sound toggle */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-2 rounded-xl border transition ${
              soundEnabled
                ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                : 'bg-slate-100 border-slate-200 text-slate-500'
            }`}
            title={soundEnabled ? 'كتم الصوت' : 'تفعيل نغمة النجاح والخطأ'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Offline Cache Download Button */}
          <button
            onClick={handlePrepareOfflineSession}
            disabled={isCachingOffline}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-sm transition"
            title="تحميل كشف الحصة كاملاً إلى ذاكرة المتصفح للعمل بدون إنترنت"
          >
            <DownloadCloud className={`w-3.5 h-3.5 text-[#27877E] ${isCachingOffline ? 'animate-bounce' : ''}`} />
            <span>تحميل للأوفلاين</span>
          </button>
        </div>
      </div>

      {/* Session & Mode Selector Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
        {/* Session Dropdown */}
        <div className="md:col-span-2">
          <label className="block text-xs font-bold text-slate-700 mb-1">
            اختر الحصة المُراد تسجيل الحضور لها:
          </label>
          <select
            value={selectedSessionId}
            onChange={(e) => {
              setSelectedSessionId(e.target.value);
              stopCamera();
              setScanResult(null);
            }}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 bg-slate-50 focus:outline-none focus:border-[#C7A66A]"
          >
            {sessions.map((s) => {
              const grp = groups.find((g) => g.id === s.group_id);
              return (
                <option key={s.id} value={s.id}>
                  {grp?.name} ({s.session_date} • {s.start_time}) {s.status === 'open' ? '— [مفتوح]' : ''}
                </option>
              );
            })}
          </select>
        </div>

        {/* Check-In vs Check-Out Mode Toggle */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            نوع التسجيل:
          </label>
          <div className="flex rounded-xl bg-slate-100 p-1 border border-slate-200">
            <button
              onClick={() => setMode('check_in')}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                mode === 'check_in'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-[#111D2D]'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>تسجيل دخول (حضور)</span>
            </button>
            <button
              onClick={() => setMode('check_out')}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                mode === 'check_out'
                  ? 'bg-[#111D2D] text-[#C7A66A] shadow-sm'
                  : 'text-slate-600 hover:text-[#111D2D]'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>تسجيل انصراف</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Scanner Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Camera Feed & Quick Input (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-[#111D2D] rounded-2xl p-6 text-white shadow-xl border border-[#C7A66A]/20 relative overflow-hidden">
            {/* Camera Viewport */}
            <div className="relative aspect-video max-h-80 w-full bg-black/60 rounded-xl overflow-hidden border border-[#C7A66A]/30 flex flex-col items-center justify-center">
              {/* HTML5 QR Code Container */}
              <div id="qr-reader" className="w-full h-full"></div>

              {!isScanning && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4 bg-navy-900/90 z-10">
                  <div className="w-16 h-16 rounded-2xl bg-[#C7A66A]/20 border border-[#C7A66A] flex items-center justify-center mb-3">
                    <Camera className="w-8 h-8 text-[#C7A66A]" />
                  </div>
                  <h3 className="text-base font-bold text-white mb-1">الكاميرا متوقفة</h3>
                  <p className="text-xs text-slate-300 max-w-xs mb-4">
                    اضغط الزر أدناه لتشغيل الكاميرا ومسح بطاقات الطلاب بالكود المباشر.
                  </p>
                  <button
                    onClick={startCamera}
                    className="px-6 py-2.5 rounded-xl bg-[#C7A66A] hover:bg-[#B08E4F] text-[#111D2D] font-bold text-xs shadow-gold transition flex items-center gap-2"
                  >
                    <Camera className="w-4 h-4" />
                    <span>تشغيل الكاميرا الآن</span>
                  </button>
                </div>
              )}

              {isScanning && (
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between z-20 bg-black/60 px-3 py-1.5 rounded-lg text-xs backdrop-blur-sm">
                  <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                    الكاميرا جاهزة للمسح...
                  </span>
                  <button
                    onClick={stopCamera}
                    className="px-3 py-1 rounded bg-red-600/80 hover:bg-red-600 text-white font-bold text-[11px]"
                  >
                    إيقاف
                  </button>
                </div>
              )}
            </div>

            {cameraError && (
              <div className="mt-3 p-3 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-200 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>{cameraError}</span>
              </div>
            )}

            {/* Quick Manual Code / Barcode Scanner Search */}
            <form onSubmit={handleManualSearch} className="mt-4 flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={manualCodeInput}
                  onChange={(e) => setManualCodeInput(e.target.value)}
                  placeholder="أو اكتب كود الطالب (مثال: NK-2601) أو امسحه بالباركود اليدوي..."
                  className="w-full pr-9 pl-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-slate-400 text-xs focus:outline-none focus:border-[#C7A66A]"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2.5 rounded-xl bg-[#C7A66A] text-[#111D2D] text-xs font-bold hover:bg-[#B08E4F] transition"
              >
                تسجيل
              </button>
            </form>

            {/* Simulated QR Quick buttons for test validation */}
            <div className="mt-3 pt-3 border-t border-white/10 flex items-center gap-2 flex-wrap text-[11px]">
              <span className="text-slate-400 flex items-center gap-1 font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-[#C7A66A]" />
                اختبار سريع لطلاب المجموعة:
              </span>
              {students.slice(0, 4).map((s) => (
                <button
                  key={s.id}
                  onClick={() => handleScanToken(s.qr_token)}
                  className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-slate-200 border border-white/10 transition"
                  title="مسح تجريبي لهذا الطالب"
                >
                  {s.full_name.split(' ')[0]} ({s.student_code})
                </button>
              ))}
            </div>
          </div>

          {/* Manual Entry Button */}
          <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
            <div>
              <p className="text-xs font-bold text-[#111D2D]">تسجيل حضور يدوي مع توثيق السبب؟</p>
              <p className="text-[11px] text-slate-500">يتيح للمشرف تسجيل الطالب يدوياً وتوثيق سبب التعديل للمدير.</p>
            </div>
            <button
              onClick={() => {
                setSelectedStudentForManual(students[0]);
                setShowManualModal(true);
              }}
              className="px-3.5 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-[#111D2D] text-xs font-bold flex items-center gap-1.5 transition"
            >
              <Keyboard className="w-3.5 h-3.5 text-[#27877E]" />
              <span>تسجيل يدوي</span>
            </button>
          </div>
        </div>

        {/* Right: Scan Feedback Card & Session Stream (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Scan Result Feedback Banner */}
          {scanResult ? (
            <div
              className={`rounded-2xl p-5 border-2 shadow-card transition-all ${
                scanResult.success
                  ? 'bg-emerald-50/90 border-emerald-500 text-emerald-950'
                  : 'bg-red-50/90 border-red-500 text-red-950'
              }`}
            >
              {/* Header */}
              <div className="flex items-center gap-3 mb-3">
                {scanResult.success ? (
                  <div className="w-12 h-12 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-md">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-red-500 text-white flex items-center justify-center shadow-md">
                    <XCircle className="w-7 h-7" />
                  </div>
                )}
                <div>
                  <h3 className="text-lg font-black leading-tight">
                    {scanResult.success ? scanResult.message : 'تعذر تسجيل الحضور!'}
                  </h3>
                  <p className="text-xs font-semibold opacity-80">
                    {scanResult.success ? `الحصة: ${activeGroup?.name}` : scanResult.message}
                  </p>
                </div>
              </div>

              {/* Student Details on Success */}
              {scanResult.student && (
                <div className="bg-white rounded-xl p-4 border border-emerald-200 shadow-sm flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center font-bold text-slate-700 text-sm">
                    {scanResult.student.photo_url ? (
                      <img src={scanResult.student.photo_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      scanResult.student.full_name.substring(0, 2)
                    )}
                  </div>
                  <div className="flex-1 text-xs">
                    <p className="text-sm font-extrabold text-[#111D2D] leading-tight">
                      {scanResult.student.full_name}
                    </p>
                    <p className="font-mono text-slate-500 mt-0.5">
                      كود: {scanResult.student.student_code}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          scanResult.status === 'present'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {scanResult.status === 'present' ? 'حاضر في الموعد' : 'متأخر'}
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono">
                        {scanResult.time}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-2xl p-6 border-2 border-dashed border-slate-200 bg-white text-center text-slate-400">
              <QrCode className="w-10 h-10 mx-auto mb-2 text-slate-300" />
              <p className="text-sm font-semibold text-slate-600">بانتظار مسح بطاقة الطالب...</p>
              <p className="text-xs text-slate-400 mt-1">
                ستظهر نتيجة المسح وبيانات الطالب المسجل فور قراءة الكود
              </p>
            </div>
          )}

          {/* Session Attended Stream */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-[#111D2D] flex items-center gap-1.5">
                <Users className="w-4 h-4 text-[#27877E]" />
                الطلاب الذين تم حضورهم ({sessionAttendance.length})
              </h3>
              <span className="text-[11px] text-slate-400 font-mono">
                {activeGroup?.name}
              </span>
            </div>

            <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
              {sessionAttendance.length === 0 ? (
                <p className="text-center py-6 text-xs text-slate-400">
                  لم يتم تسجيل حضور أي طالب في هذه الحصة حتى الآن
                </p>
              ) : (
                sessionAttendance.map((rec) => (
                  <div key={rec.id} className="py-2.5 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      <div>
                        <p className="font-bold text-[#111D2D]">{rec.student?.full_name}</p>
                        <p className="text-[10px] text-slate-400 font-mono">{rec.student?.student_code}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                          rec.status === 'present' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                        }`}
                      >
                        {rec.status === 'present' ? 'حاضر' : 'متأخر'}
                      </span>
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                        {rec.check_in_time ? new Date(rec.check_in_time).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }) : '-'}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Manual Override Modal */}
      {showManualModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden border border-slate-200">
            <div className="p-5 bg-[#111D2D] text-white flex items-center justify-between">
              <h2 className="text-base font-bold flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#C7A66A]" />
                تسجيل حضور يدوي وتوثيق التعديل
              </h2>
              <button onClick={() => setShowManualModal(false)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">اختر الطالب:</label>
                <select
                  value={selectedStudentForManual?.id || ''}
                  onChange={(e) => {
                    const st = students.find((s) => s.id === e.target.value);
                    if (st) setSelectedStudentForManual(st);
                  }}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 font-semibold text-slate-800 bg-white focus:outline-none focus:border-[#C7A66A]"
                >
                  {students.map((st) => (
                    <option key={st.id} value={st.id}>
                      {st.full_name} ({st.student_code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">حالة الحضور المراد تسجيلها:</label>
                <select
                  value={manualStatus}
                  onChange={(e) => setManualStatus(e.target.value as AttendanceStatus)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 font-semibold text-slate-800 bg-white focus:outline-none focus:border-[#C7A66A]"
                >
                  <option value="present">حاضر (Present)</option>
                  <option value="late">متأخر (Late)</option>
                  <option value="excused">معتذر بإذن مسبق (Excused)</option>
                  <option value="absent">غائب (Absent)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  سبب التعديل اليدوي * (إجباري للتسجيل بسجل التدقيق):
                </label>
                <textarea
                  rows={3}
                  required
                  value={manualReason}
                  onChange={(e) => setManualReason(e.target.value)}
                  placeholder="مثال: الطالب نسي بطاقة الـ QR وتم التأكد من هويته شخصياً..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-[#C7A66A]"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowManualModal(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50"
                >
                  إلغاء
                </button>
                <button
                  type="button"
                  onClick={handleManualOverride}
                  className="px-5 py-2 rounded-lg bg-[#27877E] hover:bg-[#1F7068] text-white font-bold shadow-md"
                >
                  حفظ وتوثيق الحضور
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ScannerPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-slate-500 font-semibold">جاري تحميل الماسح الذكي...</div>}>
      <ScannerContent />
    </Suspense>
  );
}
