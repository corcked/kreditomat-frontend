import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import MainLayout from '@/components/layout/main-layout'
import { AuthProvider } from '@/contexts/auth-context'
import Script from 'next/script'
import './globals.css'

const inter = Inter({ 
  subsets: ['latin', 'cyrillic'],
  display: 'swap',
  preload: true,
  fallback: ['system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
})

export const metadata: Metadata = {
  metadataBase: new URL('https://kreditomat.uz'),
  title: 'Kreditomat - Микрозайм агрегатор',
  description: 'Найдите лучшие предложения микрозаймов от банков Узбекистана',
  keywords: 'микрозайм, кредит, займ онлайн, банки узбекистана, kreditomat',
  authors: [{ name: 'Kreditomat Team' }],
  openGraph: {
    title: 'Kreditomat - Микрозайм агрегатор',
    description: 'Найдите лучшие предложения микрозаймов от банков Узбекистана',
    url: 'https://kreditomat.uz',
    siteName: 'Kreditomat',
    locale: 'ru_RU',
    type: 'website',
  },
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
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: '#3b82f6',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ru" className="scroll-smooth">
      <head>
        <link rel="dns-prefetch" href={process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'} />
        <link rel="preconnect" href={process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'} />
      </head>
      <body className={`${inter.className} antialiased`}>
        <AuthProvider>
          <MainLayout>{children}</MainLayout>
        </AuthProvider>
        {/* Performance monitoring script */}
        <Script
          id="performance-monitor"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              // Web Vitals monitoring
              if ('PerformanceObserver' in window) {
                try {
                  const po = new PerformanceObserver((list) => {
                    for (const entry of list.getEntries()) {
                      console.log('[Performance]', entry.name, entry.startTime, entry.duration);
                    }
                  });
                  po.observe({ entryTypes: ['navigation', 'paint', 'largest-contentful-paint'] });
                } catch (e) {}
              }
            `,
          }}
        />
      </body>
    </html>
  )
}