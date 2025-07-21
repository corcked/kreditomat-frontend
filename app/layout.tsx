import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import MainLayout from '@/components/layout/main-layout'
import { AuthProvider } from '@/contexts/auth-context'
import './globals.css'

const inter = Inter({ subsets: ['latin', 'cyrillic'] })

export const metadata: Metadata = {
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
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ru">
      <body className={inter.className}>
        <AuthProvider>
          <MainLayout>{children}</MainLayout>
        </AuthProvider>
      </body>
    </html>
  )
}