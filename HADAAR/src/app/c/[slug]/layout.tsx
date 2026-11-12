'use client';

// ====================================================================
// HADAR SaaS Platform — Dynamic Center Workspace Layout (/c/[slug])
// Developed by MADAAR Technologies
// ====================================================================

import React from 'react';

export default function CenterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#111D2D]">
      {children}
    </div>
  );
}

