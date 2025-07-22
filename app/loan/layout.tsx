'use client'

import { usePathname } from 'next/navigation'
import { ChevronRight, Calculator, User, FileText, CheckCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

const steps = [
  { id: 'calculate', name: 'Расчет', icon: Calculator, href: '/' },
  { id: 'auth', name: 'Авторизация', icon: User, href: '/loan/checkout' },
  { id: 'data', name: 'Данные', icon: FileText, href: '/application/personal-data' },
  { id: 'offers', name: 'Предложения', icon: CheckCircle, href: '/application/offers' },
]

function ProgressIndicator() {
  const pathname = usePathname()
  
  const getCurrentStep = () => {
    if (pathname === '/') return 0
    if (pathname === '/loan/checkout') return 1
    if (pathname === '/application/personal-data') return 2
    if (pathname === '/application/offers') return 3
    return 0
  }
  
  const currentStep = getCurrentStep()
  
  return (
    <nav aria-label="Progress">
      <ol className="flex items-center justify-center space-x-2 sm:space-x-4">
        {steps.map((step, index) => (
          <li key={step.id} className="flex items-center">
            <div
              className={cn(
                "flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors",
                index <= currentStep
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-gray-300 bg-white text-gray-400"
              )}
            >
              <step.icon className="w-5 h-5" />
            </div>
            <div className="ml-2 hidden sm:block">
              <p
                className={cn(
                  "text-sm font-medium transition-colors",
                  index <= currentStep ? "text-primary" : "text-gray-500"
                )}
              >
                {step.name}
              </p>
            </div>
            {index < steps.length - 1 && (
              <ChevronRight className="ml-2 sm:ml-4 h-5 w-5 text-gray-400" />
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}

export default function LoanFlowLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const showProgress = pathname !== '/' // Don't show on home page
  
  return (
    <div className="min-h-screen bg-gray-50">
      {showProgress && (
        <div className="bg-white shadow-sm border-b">
          <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
            <ProgressIndicator />
          </div>
        </div>
      )}
      <main className="flex-1">
        {children}
      </main>
    </div>
  )
}