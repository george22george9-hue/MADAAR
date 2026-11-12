'use client';

// ====================================================================
// HADAR SaaS Platform — Mobile Bottom Navigation Bar
// Developed by MADAAR Technologies
// Matched exactly to Mobile Design Specification
// ====================================================================

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutGrid,
  QrCode,
  Users,
  CalendarDays,
  Menu
} from 'lucide-react';

interface MobileBottomNavProps {
  onOpenMenu: () => void;
}

export function MobileBottomNav({ onOpenMenu }: MobileBottomNavProps) {
  const pathname = usePathname();

  const isHome = pathname === '/';
  const isScanner = pathname.startsWith('/scanner');
  const isStudents = pathname.startsWith('/students');
  const isSessions = pathname.startsWith('/sessions') || pathname.startsWith('/groups');

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/80 px-2 py-1.5 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] flex items-center justify-around select-none safe-area-bottom"
      aria-label="التنقل السفلي للموبايل"
    >
      {/* 1. الرئيسية */}
      <Link
        href="/"
        className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition ${
          isHome
            ? 'bg-teal-50 border border-teal-200/80 text-[#27877E] font-bold shadow-xs'
            : 'text-slate-500 hover:text-slate-800'
        }`}
      >
        <LayoutGrid className="w-5 h-5 mb-0.5" />
        <span className="text-[10px] leading-tight">الرئيسية</span>
      </Link>

      {/* 2. الماسح QR */}
      <Link
        href="/scanner"
        className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition ${
          isScanner
            ? 'bg-amber-50 border border-amber-200/80 text-[#C7A66A] font-bold shadow-xs'
            : 'text-slate-500 hover:text-slate-800'
        }`}
      >
        <QrCode className="w-5 h-5 mb-0.5" />
        <span className="text-[10px] leading-tight">الماسح QR</span>
      </Link>

      {/* 3. الطلاب */}
      <Link
        href="/students"
        className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition ${
          isStudents
            ? 'bg-teal-50 border border-teal-200/80 text-[#27877E] font-bold shadow-xs'
            : 'text-slate-500 hover:text-slate-800'
        }`}
      >
        <Users className="w-5 h-5 mb-0.5" />
        <span className="text-[10px] leading-tight">الطلاب</span>
      </Link>

      {/* 4. الحصص */}
      <Link
        href="/sessions"
        className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition ${
          isSessions
            ? 'bg-teal-50 border border-teal-200/80 text-[#27877E] font-bold shadow-xs'
            : 'text-slate-500 hover:text-slate-800'
        }`}
      >
        <CalendarDays className="w-5 h-5 mb-0.5" />
        <span className="text-[10px] leading-tight">الحصص</span>
      </Link>

      {/* 5. المزيد */}
      <button
        type="button"
        onClick={onOpenMenu}
        className="flex flex-col items-center justify-center py-1 px-3 rounded-xl text-slate-500 hover:text-slate-800 transition"
      >
        <Menu className="w-5 h-5 mb-0.5" />
        <span className="text-[10px] leading-tight">المزيد</span>
      </button>
    </nav>
  );
}
