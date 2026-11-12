'use client';

// ====================================================================
// HADAR SaaS Platform — Dashboard Master Layout (Fully Mobile Responsive)
// Developed by MADAAR Technologies
// ====================================================================

import React, { useState } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';
import { MobileBottomNav } from '@/components/layout/MobileBottomNav';
import { useI18n } from '@/lib/i18n/context';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isRtl } = useI18n();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-[#F8F9FA]">
      {/* Navigation Sidebar (Desktop fixed + Mobile slide-over drawer) */}
      <Sidebar
        isOpen={mobileSidebarOpen}
        onClose={() => setMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all ${
          isRtl ? 'md:mr-64 mr-0' : 'md:ml-64 ml-0'
        } pb-16 md:pb-0`}
      >
        <Topbar onToggleMobileSidebar={() => setMobileSidebarOpen((prev) => !prev)} />
        <main className="flex-1 p-3.5 sm:p-6 overflow-y-auto min-w-0">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar (Visible only on mobile screens) */}
      <MobileBottomNav onOpenMenu={() => setMobileSidebarOpen(true)} />
    </div>
  );
}
