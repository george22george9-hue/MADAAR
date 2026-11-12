import type { Metadata, Viewport } from 'next';
import './globals.css';
import { I18nProvider } from '@/lib/i18n/context';
import { DataProvider } from '@/lib/store/data-context';
import { PWAProvider } from '@/components/pwa/PWAProvider';

export const metadata: Metadata = {
  title: 'حَضَر | HADAR — منصة الحضور الذكي وإدارة السناتر',
  description: 'منظومة حَضَر الذكية لإدارة المراكز التعليمية، حضور الطلاب بالـ QR، الاشتراكات والماليات — شركة مدار للتقنية',
  manifest: '/manifest.json',
  applicationName: 'حَضَر',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'حَضَر',
  },
  icons: {
    icon: [
      { url: '/favicon.png', sizes: '64x64', type: 'image/png' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
};

export const viewport: Viewport = {
  themeColor: '#111D2D',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
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
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </head>
      <body className="min-h-screen bg-[#F8F9FA] text-[#111D2D] selection:bg-[#C7A66A]/30 selection:text-[#111D2D]">
        <I18nProvider>
          <DataProvider>
            <PWAProvider>
              {children}
            </PWAProvider>
          </DataProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
