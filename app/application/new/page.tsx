"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import LoanForm, { LoanFormData, LoanCalculation } from "@/components/ui/loan-form"
import ScoringGauge from "@/components/ui/scoring-gauge"
import PDNIndicator from "@/components/ui/pdn-indicator"
import { api } from "@/lib/api"
import { getToken } from "@/lib/auth"
import { 
  ArrowRight,
  Info,
  TrendingUp,
  Shield,
  Clock,
  CheckCircle,
  AlertCircle,
  Sparkles,
  RefreshCw
} from "lucide-react"

interface PreCheckResult {
  estimated_score: number
  estimated_pdn: number
  max_amount: number
  recommendations: string[]
  eligible_offers_count: number
  special_offers: string[]
}

export default function NewApplicationPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [preCheckResult, setPreCheckResult] = useState<PreCheckResult | null>(null)
  const [error, setError] = useState("")
  const [currentFormData, setCurrentFormData] = useState<LoanFormData | null>(null)
  const [currentCalculation, setCurrentCalculation] = useState<LoanCalculation | null>(null)
  
  // Check authentication
  useEffect(() => {
    const token = getToken()
    if (!token) {
      router.push("/auth/login")
    }
  }, [router])
  
  const handleFormCalculate = (data: LoanFormData, calculation: LoanCalculation) => {
    setCurrentFormData(data)
    setCurrentCalculation(calculation)
  }
  
  const handleFormSubmit = async (data: LoanFormData, calculation: LoanCalculation) => {
    setLoading(true)
    setError("")
    
    try {
      // Perform pre-check
      const preCheck = await api.applications.preCheck({
        amount: data.amount,
        term: data.term,
        monthly_income: data.monthlyIncome,
        monthly_expenses: data.monthlyExpenses,
        existing_payments: data.existingPayments
      })
      
      setPreCheckResult(preCheck)
      
      // Save application data to session storage
      sessionStorage.setItem("applicationData", JSON.stringify({
        ...data,
        calculation,
        preCheck
      }))
      
      // If eligible, redirect to personal data
      if (preCheck.eligible_offers_count > 0) {
        router.push("/application/personal-data")
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || "Ошибка при проверке данных")
    } finally {
      setLoading(false)
    }
  }
  
  const renderPreCheckResult = () => {
    if (!preCheckResult) return null
    
    const isEligible = preCheckResult.eligible_offers_count > 0
    
    return (
      <Card className={cn(
        "mt-6",
        isEligible ? "border-green-200 dark:border-green-800" : "border-red-200 dark:border-red-800"
      )}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {isEligible ? (
              <>
                <CheckCircle className="w-5 h-5 text-green-500" />
                Отличные новости!
              </>
            ) : (
              <>
                <AlertCircle className="w-5 h-5 text-red-500" />
                К сожалению...
              </>
            )}
          </CardTitle>
          <CardDescription>
            {isEligible
              ? `Вам доступно ${preCheckResult.eligible_offers_count} предложений от банков`
              : "Текущие параметры не подходят для получения займа"}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Scoring and PDN display */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium mb-2">Предварительный рейтинг</h4>
              <ScoringGauge 
                score={preCheckResult.estimated_score} 
                size="sm"
                showDetails={false}
              />
            </div>
            
            <div>
              <h4 className="text-sm font-medium mb-2">Показатель долговой нагрузки</h4>
              <PDNIndicator 
                pdn={currentFormData?.monthlyIncome ? 
                  (((currentCalculation?.monthlyPayment || 0) + (currentFormData?.existingPayments || 0)) / currentFormData.monthlyIncome * 100) 
                  : 0
                }
                monthlyIncome={currentFormData?.monthlyIncome || 0}
                monthlyPayment={currentCalculation?.monthlyPayment || 0}
                otherPayments={currentFormData?.existingPayments || 0}
                showDetails={false}
              />
            </div>
          </div>
          
          {/* Recommendations */}
          {preCheckResult.recommendations.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium flex items-center gap-2">
                <Info className="w-4 h-4" />
                Рекомендации
              </h4>
              <ul className="space-y-1">
                {preCheckResult.recommendations.map((rec, index) => (
                  <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="text-primary">•</span>
                    {rec}
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {/* Special offers */}
          {preCheckResult.special_offers.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-yellow-500" />
                Специальные предложения
              </h4>
              <div className="flex flex-wrap gap-2">
                {preCheckResult.special_offers.map((offer, index) => (
                  <Badge key={index} variant="secondary">
                    {offer}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          
          {/* Max available amount */}
          {isEligible && preCheckResult.max_amount < (currentFormData?.amount || 0) && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-3">
              <p className="text-sm">
                <strong>Совет:</strong> Максимальная доступная сумма:{" "}
                <span className="font-semibold">
                  {new Intl.NumberFormat("ru-RU").format(preCheckResult.max_amount)} сум
                </span>
              </p>
            </div>
          )}
        </CardContent>
        
        {isEligible && (
          <CardFooter>
            <Button 
              onClick={() => router.push("/application/personal-data")}
              className="w-full"
            >
              Продолжить оформление
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </CardFooter>
        )}
      </Card>
    )
  }
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container max-w-4xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Новая заявка на займ</h1>
          <p className="text-muted-foreground">
            Заполните параметры займа для получения предварительного решения
          </p>
        </div>
        
        {/* Progress indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-2">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                1
              </div>
              <span className="ml-2 text-sm font-medium">Параметры займа</span>
            </div>
            <div className="w-8 h-0.5 bg-gray-300 dark:bg-gray-700" />
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gray-300 dark:bg-gray-700 rounded-full flex items-center justify-center text-sm font-medium">
                2
              </div>
              <span className="ml-2 text-sm text-muted-foreground">Личные данные</span>
            </div>
            <div className="w-8 h-0.5 bg-gray-300 dark:bg-gray-700" />
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gray-300 dark:bg-gray-700 rounded-full flex items-center justify-center text-sm font-medium">
                3
              </div>
              <span className="ml-2 text-sm text-muted-foreground">Предложения</span>
            </div>
          </div>
        </div>
        
        {/* Info cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="border-blue-200 dark:border-blue-800">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-blue-500 mt-0.5" />
                <div>
                  <h3 className="font-medium text-sm">Быстрое решение</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Получите ответ за 5 минут
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-green-200 dark:border-green-800">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-green-500 mt-0.5" />
                <div>
                  <h3 className="font-medium text-sm">Безопасно</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Ваши данные под защитой
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-purple-200 dark:border-purple-800">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <TrendingUp className="w-5 h-5 text-purple-500 mt-0.5" />
                <div>
                  <h3 className="font-medium text-sm">Лучшие условия</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Сравним все предложения
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Main form */}
        <LoanForm
          onSubmit={handleFormSubmit}
          onCalculate={handleFormCalculate}
          showPDN={true}
          showTips={true}
        />
        
        {/* Error display */}
        {error && (
          <div className="mt-4 flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}
        
        {/* Pre-check result */}
        {preCheckResult && renderPreCheckResult()}
        
        {/* Loading overlay */}
        {loading && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="w-64">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center space-y-4">
                  <RefreshCw className="w-8 h-8 animate-spin text-primary" />
                  <p className="text-sm font-medium">Проверяем данные...</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}

// Helper function for conditional classes
function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ")
}