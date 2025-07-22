'use client'

import { useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import Link from "next/link"
import { Calculator, Shield, Clock, TrendingUp } from "lucide-react"
import { LoanForm } from "@/components/ui/loan-form"
import { LoanResults } from "@/components/ui/loan-results"
import { api } from "@/lib/api"
import { 
  saveLoanData, 
  getLoanData,
  updateLoanCalculation,
  updatePDNCalculation,
  updatePreCheckResult,
  LoanFormStorage,
  LoanCalculation,
  PreCheckResult
} from "@/lib/loan-storage"
import { PDNCalculation } from "@/lib/pdn"
import { toast } from "sonner"

export default function Home() {
  const router = useRouter()
  const [isCalculating, setIsCalculating] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [loanData, setLoanData] = useState<LoanFormStorage | null>(null)
  const [calculationResult, setCalculationResult] = useState<LoanCalculation | null>(null)
  const [preCheckResult, setPreCheckResult] = useState<PreCheckResult | null>(null)
  const [pdnCalculation, setPdnCalculation] = useState<PDNCalculation | null>(null)

  // Load existing loan data on mount
  useEffect(() => {
    const existingData = getLoanData()
    if (existingData && existingData.calculation) {
      setLoanData(existingData)
      setCalculationResult(existingData.calculation)
      setPreCheckResult(existingData.preCheckResult || null)
      setPdnCalculation(existingData.pdnCalculation || null)
      setShowResults(true)
    }
  }, [])

  const handleLoanCalculate = useCallback(async (formData: any, _calculation: any) => {
    setIsCalculating(true)
    setShowResults(false)

    try {
      // Prepare loan data for storage
      const loanDataToSave: LoanFormStorage = {
        amount: formData.amount,
        term: formData.term,
        monthlyIncome: formData.monthlyIncome,
        monthlyExpenses: formData.monthlyExpenses,
        existingPayments: formData.existingPayments || 0,
        timestamp: Date.now()
      }

      // Save to localStorage first
      saveLoanData(loanDataToSave)
      setLoanData(loanDataToSave)

      // Calculate loan parameters
      const calcResponse = await api.public.calculateLoan({
        amount: formData.amount,
        term: formData.term
      })

      const calculation: LoanCalculation = {
        monthlyPayment: calcResponse.monthly_payment,
        totalPayment: calcResponse.total_payment,
        totalInterest: calcResponse.total_interest,
        effectiveRate: calcResponse.effective_rate
      }

      setCalculationResult(calculation)
      updateLoanCalculation(calculation)

      // Perform pre-check if income data is provided
      if (formData.monthlyIncome > 0) {
        const preCheckResponse = await api.public.preCheck({
          amount: formData.amount,
          term: formData.term,
          monthly_income: formData.monthlyIncome,
          monthly_expenses: formData.monthlyExpenses,
          existing_payments: formData.existingPayments || 0
        })

        const preCheck: PreCheckResult = {
          isEligible: preCheckResponse.is_eligible,
          score: preCheckResponse.score,
          recommendations: preCheckResponse.recommendations,
          estimatedApprovalRate: preCheckResponse.estimated_approval_rate
        }

        const pdn: PDNCalculation = {
          pdn_ratio: preCheckResponse.pdn_ratio,
          status: preCheckResponse.pdn_status,
          available_income: formData.monthlyIncome - formData.monthlyExpenses - (formData.existingPayments || 0),
          total_payments: (formData.existingPayments || 0) + calculation.monthlyPayment,
          new_payment: calculation.monthlyPayment,
          risk_level: preCheckResponse.pdn_status
        }

        setPreCheckResult(preCheck)
        setPdnCalculation(pdn)
        updatePreCheckResult(preCheck)
        updatePDNCalculation(pdn)
      }

      setShowResults(true)
      
      // Scroll to results
      setTimeout(() => {
        const resultsElement = document.getElementById('loan-results')
        if (resultsElement) {
          resultsElement.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
      }, 100)

    } catch (error: any) {
      console.error('Calculation error:', error)
      toast.error(error.message || 'Ошибка при расчете займа')
    } finally {
      setIsCalculating(false)
    }
  }, [])

  const handleContinue = useCallback(() => {
    // Navigate to checkout page
    router.push('/loan/checkout')
  }, [router])

  const handleRecalculate = useCallback(() => {
    setShowResults(false)
    setCalculationResult(null)
    setPreCheckResult(null)
    setPdnCalculation(null)
    
    // Scroll back to form
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  return (
    <>
      {/* Hero Section with Loan Form */}
      <section className="relative bg-gradient-to-b from-blue-50 to-white overflow-hidden">
        <div className="mx-auto max-w-7xl px-6 py-12 sm:py-16 lg:px-8">
          <div className="mx-auto max-w-4xl">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
                Микрозаймы онлайн за 5 минут
              </h1>
              <p className="mt-4 text-lg leading-8 text-gray-600">
                Рассчитайте займ прямо сейчас. Сравните предложения от ведущих банков и МФО Узбекистана.
              </p>
            </div>

            {/* Loan Form */}
            {!showResults && (
              <Card className="p-6 sm:p-8 shadow-xl">
                <LoanForm 
                  onSubmit={handleLoanCalculate}
                  initialData={loanData ? {
                    amount: loanData.amount,
                    term: loanData.term,
                    monthlyIncome: loanData.monthlyIncome,
                    monthlyExpenses: loanData.monthlyExpenses,
                    existingPayments: loanData.existingPayments
                  } : undefined}
                  isLoading={isCalculating}
                  showTitle={false}
                  submitButtonText="Рассчитать займ"
                />
              </Card>
            )}

            {/* Loan Results */}
            {showResults && calculationResult && (
              <div id="loan-results" className="pt-8">
                <LoanResults
                  calculation={calculationResult}
                  preCheckResult={preCheckResult || undefined}
                  pdnCalculation={pdnCalculation || undefined}
                  onContinue={handleContinue}
                  onRecalculate={handleRecalculate}
                />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Почему выбирают Kreditomat
            </h2>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Мы делаем процесс получения займа простым и прозрачным
            </p>
          </div>
          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
            <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-4">
              <Card className="p-6">
                <dt className="text-base font-semibold leading-7 text-gray-900">
                  <div className="mb-6 flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                    <Calculator className="h-6 w-6 text-white" />
                  </div>
                  Умный калькулятор
                </dt>
                <dd className="mt-1 text-base leading-7 text-gray-600">
                  Расчет ПДН с автокоррекцией. Подберем оптимальные параметры займа под ваш доход.
                </dd>
              </Card>
              
              <Card className="p-6">
                <dt className="text-base font-semibold leading-7 text-gray-900">
                  <div className="mb-6 flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                    <Shield className="h-6 w-6 text-white" />
                  </div>
                  Проверенные партнеры
                </dt>
                <dd className="mt-1 text-base leading-7 text-gray-600">
                  Только лицензированные банки и МФО. Прозрачные условия без скрытых комиссий.
                </dd>
              </Card>
              
              <Card className="p-6">
                <dt className="text-base font-semibold leading-7 text-gray-900">
                  <div className="mb-6 flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                    <Clock className="h-6 w-6 text-white" />
                  </div>
                  Быстрое решение
                </dt>
                <dd className="mt-1 text-base leading-7 text-gray-600">
                  Заполните заявку за 5 минут. Решение по займу в течение 15 минут.
                </dd>
              </Card>
              
              <Card className="p-6">
                <dt className="text-base font-semibold leading-7 text-gray-900">
                  <div className="mb-6 flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                    <TrendingUp className="h-6 w-6 text-white" />
                  </div>
                  Лучшие условия
                </dt>
                <dd className="mt-1 text-base leading-7 text-gray-600">
                  Сравнение всех предложений в одном месте. Выберите самую низкую ставку.
                </dd>
              </Card>
            </dl>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary">
        <div className="px-6 py-24 sm:px-6 sm:py-32 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Нужна помощь с выбором?
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-primary-foreground/90">
              Наши эксперты помогут подобрать оптимальные условия займа специально для вас
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Button size="lg" variant="secondary" asChild>
                <Link href="/offers">Все предложения</Link>
              </Button>
              <Button size="lg" variant="outline" className="bg-white/10 text-white hover:bg-white/20" asChild>
                <Link href="/how-it-works">Как это работает</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}