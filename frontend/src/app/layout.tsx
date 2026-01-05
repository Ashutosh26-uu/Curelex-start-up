import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { QueryProvider } from './providers/QueryProvider';
import { SkipLink } from '@/components/ui/AccessibleForm';
import { ErrorBoundary } from '@/components/ErrorBoundary';

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
  preload: true,
});

export const metadata: Metadata = {
  title: {
    default: 'CureLex - Healthcare Telemedicine Platform',
    template: '%s | CureLex Healthcare'
  },
  description: 'Comprehensive healthcare platform with telemedicine capabilities, patient portal, and secure medical records management. HIPAA compliant and accessible.',
  keywords: ['healthcare', 'telemedicine', 'patient portal', 'doctor dashboard', 'medical records', 'accessibility', 'WCAG compliant', 'HIPAA'],
  authors: [{ name: 'CureLex Healthcare Platform Team', url: 'https://curelex.com' }],
  creator: 'CureLex Healthcare',
  publisher: 'CureLex Healthcare',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [{ url: '/favicon.ico' }, { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' }],
    shortcut: '/favicon.ico',
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
  },
  manifest: '/manifest.json',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://curelex.com',
    siteName: 'CureLex Healthcare',
    title: 'CureLex - Healthcare Telemedicine Platform',
    description: 'Secure, accessible healthcare platform for patients and providers. HIPAA compliant telemedicine solutions.',
    images: [{
      url: '/images/og-image.jpg',
      width: 1200,
      height: 630,
      alt: 'CureLex Healthcare Platform',
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CureLex - Healthcare Telemedicine Platform',
    description: 'Secure, accessible healthcare platform for patients and providers',
    images: ['/images/twitter-image.jpg'],
  },
  verification: {
    google: 'your-google-verification-code',
  },
  category: 'healthcare',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [{ media: '(prefers-color-scheme: light)', color: '#2563eb' }],
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
        <meta name="color-scheme" content="light" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href={process.env.NEXT_PUBLIC_API_URL} />
      </head>
      <body className={`${inter.className} antialiased`}>
        <SkipLink href="#main-content">Skip to main content</SkipLink>
        <SkipLink href="#navigation">Skip to navigation</SkipLink>
        
        <ErrorBoundary>
          <QueryProvider>
            <div id="root" className="min-h-screen">
              <main id="main-content">
                {children}
              </main>
            </div>
          </QueryProvider>
        </ErrorBoundary>
        
        {/* Accessibility announcements */}
        <div 
          id="accessibility-announcements" 
          aria-live="polite" 
          aria-atomic="true" 
          className="sr-only"
        />
        
        {/* Focus management */}
        <div id="focus-trap-start" tabIndex={0} className="sr-only" />
        <div id="focus-trap-end" tabIndex={0} className="sr-only" />
      </body>
    </html>
  );
}