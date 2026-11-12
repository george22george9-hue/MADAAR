import type { Metadata } from 'next';
import './globals.css';
import { I18nProvider } from '@/lib/i18n/context';
import { DataProvider } from '@/lib/store/data-context';

export const metadata: Metadata = {
  title: 'HADAR | حضر — Smart Attendance & Student Management SaaS',
  description: 'منصة حضر الذكية لإدارة السناتر والمراكز التعليمية وحضور الطلاب بالـ QR — تطوير مدار للتقنية',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="min-h-screen bg-[#F8F9FA] text-[#111D2D] selection:bg-[#C7A66A]/30 selection:text-[#111D2D]">
        <I18nProvider>
          <DataProvider>
            {children}
          </DataProvider>
        </I18nProvider>
      </body>
    </html>
  );
}

