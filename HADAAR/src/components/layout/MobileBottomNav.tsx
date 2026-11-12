'use client';

// ====================================================================
// HADAR SaaS Platform — Mobile Bottom Navigation Bar
// Developed by MADAAR Technologies
// Colors: Midnight Navy (#111D2D), Champagne Gold (#C7A66A)
// ====================================================================

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  QrCode,
  BookOpen,
  Menu
} from 'lucide-react';

interface MobileBottomNavProps {
  onOpenMenu: () => void;
}

export function MobileBottomNav({ onOpenMenu }: MobileBottomNavProps) {
  const pathname = usePathname();

  const navItems = [
    {
      href: '/',
      label: 'الرئيسية',
      icon: LayoutDashboard,
      isActive: pathname === '/'
    },
    {
      href: '/students',
      label: 'الطلاب',
      icon: Users,
      isActive: pathname.startsWith('/students')
    },
    {
      href: '/scanner',
      label: 'الماسح',
      icon: QrCode,
      isSpecial: true,
      isActive: pathname.startsWith('/scanner')
    },
    {
      href: '/groups',
      label: 'المجموعات',
      icon: BookOpen,
      isActive: pathname.startsWith('/groups')
    }
  ];

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#111D2D]/95 backdrop-blur-md border-t border-[#1E2A3D] px-3 py-1.5 shadow-[0_-4px_20px_rgba(0,0,0,0.25)] flex items-center justify-around safe-area-bottom select-none"
      aria-label="التنقل السفلي للموبايل"
    >
      {/* Dashboard */}
      <Link
        href={navItems[0].href}
        className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition ${
          navItems[0].isActive
            ? 'text-[#C7A66A] font-bold'
            : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <LayoutDashboard className="w-5 h-5 mb-0.5" />
        <span className="text-[10px] leading-none">{navItems[0].label}</span>
      </Link>

      {/* Students */}
      <Link
        href={navItems[1].href}
        className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition ${
          navItems[1].isActive
            ? 'text-[#C7A66A] font-bold'
            : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <Users className="w-5 h-5 mb-0.5" />
        <span className="text-[10px] leading-none">{navItems[1].label}</span>
      </Link>

      {/* Center Action: Scanner Button (Elevated) */}
      <Link
        href="/scanner"
        className="flex flex-col items-center justify-center -mt-5 group"
      >
        <div
          className={`w-13 h-13 w-12 h-12 rounded-full bg-gradient-to-tr from-[#C7A66A] to-[#E5C992] text-[#111D2D] shadow-lg shadow-[#C7A66A]/30 flex items-center justify-center border-2 border-[#111D2D] transform transition-transform active:scale-95 ${
            pathname.startsWith('/scanner') ? 'ring-2 ring-[#C7A66A] ring-offset-2 ring-offset-[#111D2D]' : ''
          }`}
        >
          <QrCode className="w-6 h-6 stroke-[2.2]" />
        </div>
        <span className="text-[10px] font-bold text-[#C7A66A] mt-1 leading-none">
          الماسح
        </span>
      </Link>

      {/* Groups */}
      <Link
        href={navItems[3].href}
        className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition ${
          navItems[3].isActive
            ? 'text-[#C7A66A] font-bold'
            : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <BookOpen className="w-5 h-5 mb-0.5" />
        <span className="text-[10px] leading-none">{navItems[3].label}</span>
      </Link>

      {/* More / Menu Drawer */}
      <button
        type="button"
        onClick={onOpenMenu}
        className="flex flex-col items-center justify-center py-1 px-2 rounded-xl text-slate-400 hover:text-slate-200 transition"
      >
        <Menu className="w-5 h-5 mb-0.5" />
        <span className="text-[10px] leading-none">المزيد</span>
      </button>
    </nav>
  );
}
