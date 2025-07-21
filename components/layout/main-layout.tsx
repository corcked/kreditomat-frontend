'use client'

import Header from "./header"
import Footer from "./footer"
import { ErrorBoundary } from "@/components/error-boundary"
import { usePageTracking, useErrorHandler } from "@/hooks/use-logger"

interface MainLayoutProps {
  children: React.ReactNode
}

export default function MainLayout({ children }: MainLayoutProps) {
  usePageTracking()
  useErrorHandler()
  
  return (
    <ErrorBoundary>
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 bg-gray-50">
          {children}
        </main>
        <Footer />
      </div>
    </ErrorBoundary>
  )
}