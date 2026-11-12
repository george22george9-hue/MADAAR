'use client';

// ====================================================================
// HADAR SaaS Platform — Dashboard Master Layout
// Developed by MADAAR Technologies
// ====================================================================

import React from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';
import { useI18n } from '@/lib/i18n/context';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isRtl } = useI18n();

  return (
    <div className="min-h-screen flex bg-[#F8F9FA]">
      {/* Fixed Navigation Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col min-w-0 ${isRtl ? 'mr-64' : 'ml-64'}`}>
        <Topbar />
        <main className="flex-1 p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

