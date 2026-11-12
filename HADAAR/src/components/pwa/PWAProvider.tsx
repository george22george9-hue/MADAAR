'use client';

// ====================================================================
// HADAR SaaS Platform — PWA Service Worker Registration & Install Prompt
// Developed by MADAAR Technologies
// ====================================================================

import React, { useEffect, useState } from 'react';
import { Download, X, Smartphone, Sparkles } from 'lucide-react';

export function PWAProvider({ children }: { children: React.ReactNode }) {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSTip, setShowIOSTip] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // 1. Register Service Worker
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then((registration) => {
            console.log('[HADAR PWA] Service Worker registered successfully:', registration.scope);
          })
          .catch((error) => {
            console.warn('[HADAR PWA] Service Worker registration failed:', error);
          });
      });
    }

    // 2. Check if already installed & running as standalone
    const isRunningStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;
    setIsStandalone(isRunningStandalone);

    // 3. Detect iOS Safari
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isAppleDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isAppleDevice);

    // 4. Capture BeforeInstallPrompt (Android / Chrome / Desktop Edge)
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // If user hasn't dismissed before in this session
      const dismissed = sessionStorage.getItem('hadar_pwa_dismissed');
      if (!dismissed && !isRunningStandalone) {
        setShowInstallPrompt(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    // Also for iOS Safari (if not standalone, prompt after 4 seconds)
    if (isAppleDevice && !isRunningStandalone) {
      const dismissed = sessionStorage.getItem('hadar_pwa_dismissed');
      if (!dismissed) {
        const timer = setTimeout(() => {
          setShowInstallPrompt(true);
        }, 3500);
        return () => clearTimeout(timer);
      }
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIOSTip(true);
      return;
    }

    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        console.log('[HADAR PWA] User accepted the install prompt');
        setShowInstallPrompt(false);
      }
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    setShowInstallPrompt(false);
    setShowIOSTip(false);
    sessionStorage.setItem('hadar_pwa_dismissed', 'true');
  };

  return (
    <>
      {children}

      {/* Floating PWA Install Banner (For Mobile / Android / iOS) */}
      {showInstallPrompt && !isStandalone && (
        <div className="fixed bottom-20 md:bottom-6 left-4 right-4 md:left-auto md:right-6 z-50 max-w-sm bg-[#111D2D] text-white p-3.5 rounded-2xl shadow-2xl border border-[#C7A66A]/40 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="flex items-start justify-between gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#C7A66A] to-[#E3C58B] text-[#111D2D] flex items-center justify-center shrink-0 font-bold shadow-md">
              <Smartphone className="w-5 h-5" />
            </div>

            <div className="flex-1 min-w-0 text-right">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-xs text-white">تثبيت تطبيق حَضَر</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#C7A66A]/20 text-[#C7A66A] font-bold">
                  سريع وخفيف
                </span>
              </div>
              <p className="text-[11px] text-slate-300 mt-0.5 leading-snug">
                ثبّت التطبيق على شاشة هاتفك لفتحه بلمسة واحدة بدون متصفح.
              </p>

              {/* iOS Safari Tip */}
              {showIOSTip && (
                <div className="mt-2 p-2 bg-[#1E2A3D] rounded-xl text-[10px] text-slate-200 border border-[#C7A66A]/30 space-y-1">
                  <p className="font-bold text-[#C7A66A]">طريقة التثبيت على الآيفون:</p>
                  <p>1. اضغط على زر المشاركة <strong>(Share ⎋)</strong> أسفل المتصفح.</p>
                  <p>2. مرر لأسفل واختر <strong>«إضافة إلى الشاشة الرئيسية ➕»</strong>.</p>
                </div>
              )}

              <div className="flex items-center gap-2 mt-2.5">
                <button
                  type="button"
                  onClick={handleInstallClick}
                  className="flex-1 py-1.5 px-3 rounded-xl bg-gradient-to-r from-[#D99B26] to-[#C7A66A] text-[#111D2D] font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>تثبيت التطبيق الآن</span>
                </button>
                <button
                  type="button"
                  onClick={handleDismiss}
                  className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-400 hover:text-white transition"
                  aria-label="إغلاق التنبيه"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
