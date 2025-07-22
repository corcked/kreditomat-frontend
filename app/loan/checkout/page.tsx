'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { ArrowLeft, Calculator, Clock, Shield, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import PhoneAuthForm from '@/components/auth/phone-auth-form'
import VerifyCodeForm from '@/components/auth/verify-code-form'
import { useAuth } from '@/contexts/auth-context'
import { getLoanData, isLoanDataExpired, getLoanSummary } from '@/lib/loan-storage'
import { toast } from 'sonner'

export default function LoanCheckoutPage() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuth()
  const [loanData, setLoanData] = useState<any>(null)
  const [phoneNumber, setPhoneNumber] = useState('')
  const [showVerification, setShowVerification] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check for loan data
    const data = getLoanData()
    
    if (!data || isLoanDataExpired()) {
      toast.error('Данные займа устарели. Пожалуйста, пересчитайте займ.')
      router.push('/')
      return
    }
    
    setLoanData(data)
    setIsLoading(false)
    
    // If already authenticated, redirect to personal data
    if (isAuthenticated) {
      router.push('/application/personal-data')
    }
  }, [isAuthenticated, router])

  const handlePhoneSubmit = async (phone: string) => {
    setPhoneNumber(phone)
    setShowVerification(true)
  }

  const handleVerificationSuccess = () => {
    // The auth context will handle the redirect
    toast.success('Авторизация успешна!')
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'UZS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <Button
        variant="ghost"
        onClick={() => router.push('/')}
        className="mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Вернуться к расчету
      </Button>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Loan Summary */}
        <div className="lg:col-span-1">
          <Card className="sticky top-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Ваш займ
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Сумма займа</p>
                <p className="text-2xl font-bold">{formatCurrency(loanData.amount)}</p>
              </div>
              
              <div>
                <p className="text-sm text-muted-foreground">Срок займа</p>
                <p className="text-lg font-semibold">{loanData.term} месяцев</p>
              </div>
              
              {loanData.calculation && (
                <>
                  <Separator />
                  
                  <div>
                    <p className="text-sm text-muted-foreground">Ежемесячный платеж</p>
                    <p className="text-xl font-semibold">
                      {formatCurrency(loanData.calculation.monthlyPayment)}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-muted-foreground">Общая сумма выплат</p>
                    <p className="text-lg">{formatCurrency(loanData.calculation.totalPayment)}</p>
                  </div>
                </>
              )}
              
              {loanData.preCheckResult && (
                <>
                  <Separator />
                  
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Предварительная оценка</p>
                    {loanData.preCheckResult.isEligible ? (
                      <Alert className="border-green-200 bg-green-50">
                        <AlertDescription className="text-green-800">
                          Высокая вероятность одобрения
                        </AlertDescription>
                      </Alert>
                    ) : (
                      <Alert className="border-orange-200 bg-orange-50">
                        <AlertDescription className="text-orange-800">
                          Требуется дополнительная проверка
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Auth Forms */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Авторизация</CardTitle>
              <CardDescription>
                Войдите или зарегистрируйтесь для продолжения оформления займа
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!showVerification ? (
                <>
                  <PhoneAuthForm
                    onSubmit={handlePhoneSubmit}
                    isLoading={false}
                  />
                  
                  <div className="mt-6 space-y-4">
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <Separator />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-white px-2 text-muted-foreground">
                          Преимущества регистрации
                        </span>
                      </div>
                    </div>
                    
                    <div className="grid gap-4 sm:grid-cols-3">
                      <div className="flex items-start gap-3">
                        <Clock className="h-5 w-5 text-primary mt-0.5" />
                        <div>
                          <p className="font-medium text-sm">Быстрое оформление</p>
                          <p className="text-xs text-muted-foreground">
                            Заполните данные один раз
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3">
                        <Shield className="h-5 w-5 text-primary mt-0.5" />
                        <div>
                          <p className="font-medium text-sm">Безопасность</p>
                          <p className="text-xs text-muted-foreground">
                            Защита ваших данных
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-primary mt-0.5" />
                        <div>
                          <p className="font-medium text-sm">История заявок</p>
                          <p className="text-xs text-muted-foreground">
                            Отслеживайте статус
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <VerifyCodeForm
                  phoneNumber={phoneNumber}
                  onSuccess={handleVerificationSuccess}
                  onBack={() => setShowVerification(false)}
                />
              )}
            </CardContent>
          </Card>
          
          <div className="mt-6 text-center text-sm text-muted-foreground">
            <p>
              Нажимая "Продолжить", вы соглашаетесь с{' '}
              <Link href="/terms" className="underline hover:text-primary">
                условиями использования
              </Link>{' '}
              и{' '}
              <Link href="/privacy" className="underline hover:text-primary">
                политикой конфиденциальности
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}