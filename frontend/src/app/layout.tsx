import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { QueryProvider } from './providers/QueryProvider';
import { SkipLink } from '@/components/ui/AccessibleForm';

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter'
});

export const metadata: Metadata = {
  title: 'CureLex - Healthcare Telemedicine Platform',
  description: 'Comprehensive healthcare platform with telemedicine capabilities, patient portal, and secure medical records management',
  keywords: 'healthcare, telemedicine, patient portal, doctor dashboard, medical records, accessibility, WCAG compliant',
  authors: [{ name: 'CureLex Healthcare Platform Team' }],
  robots: 'index, follow',
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/manifest.json',
  openGraph: {
    title: 'CureLex - Healthcare Telemedicine Platform',
    description: 'Secure, accessible healthcare platform for patients and providers',
    type: 'website',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <meta charSet="utf-8" />
        <meta name="theme-color" content="#2563eb" />
        <meta name="color-scheme" content="light" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className={`${inter.className} antialiased`}>
        <SkipLink href="#main-content">Skip to main content</SkipLink>
        <SkipLink href="#navigation">Skip to navigation</SkipLink>
        
        <QueryProvider>
          <div id="root" className="min-h-screen">
            {children}
          </div>
        </QueryProvider>
        
        {/* Accessibility announcements */}
        <div 
          id="accessibility-announcements" 
          aria-live="polite" 
          aria-atomic="true" 
          className="sr-only"
        />
      </body>
    </html>
  );
}