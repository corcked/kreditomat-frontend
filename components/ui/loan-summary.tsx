"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Calculator, CreditCard, Clock as ClockIcon, CheckCircle, AlertCircle } from "lucide-react"
import { LoanFormStorage } from "@/lib/loan-storage"

interface LoanSummaryProps {
  loanData: LoanFormStorage
  showTitle?: boolean
  className?: string
  variant?: "default" | "compact"
}

export default function LoanSummary({ 
  loanData, 
  showTitle = true, 
  className,
  variant = "default" 
}: LoanSummaryProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("ru-RU").format(amount)
  }

  if (variant === "compact") {
    return (
      <div className={className}>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Сумма займа</span>
            <span className="font-semibold">{formatCurrency(loanData.amount)} сум</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Срок</span>
            <span className="font-semibold">{loanData.term} месяцев</span>
          </div>
          {loanData.calculation && (
            <div className="flex justify-between items-center pt-2 border-t">
              <span className="text-sm text-muted-foreground">Ежемесячный платеж</span>
              <span className="font-bold text-primary">
                {formatCurrency(loanData.calculation.monthlyPayment)} сум
              </span>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <Card className={className}>
      {showTitle && (
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="w-5 h-5" />
            Параметры займа
          </CardTitle>
        </CardHeader>
      )}
      <CardContent className="space-y-4">
        {/* Loan Amount */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Сумма займа</span>
            <CreditCard className="w-4 h-4 text-muted-foreground" />
          </div>
          <p className="text-lg font-semibold">
            {formatCurrency(loanData.amount)} сум
          </p>
        </div>
        
        {/* Loan Term */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Срок займа</span>
            <ClockIcon className="w-4 h-4 text-muted-foreground" />
          </div>
          <p className="text-lg font-semibold">{loanData.term} месяцев</p>
        </div>
        
        {/* Monthly Payment */}
        {loanData.calculation && (
          <div className="space-y-1 pt-2 border-t">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Ежемесячный платеж</span>
              <Calculator className="w-4 h-4 text-muted-foreground" />
            </div>
            <p className="text-xl font-bold text-primary">
              {formatCurrency(loanData.calculation.monthlyPayment)} сум
            </p>
          </div>
        )}
        
        {/* Income Info */}
        <div className="space-y-1 pt-2 border-t">
          <p className="text-sm text-muted-foreground">Ежемесячный доход</p>
          <p className="font-medium">
            {formatCurrency(loanData.monthlyIncome)} сум
          </p>
        </div>
        
        {/* PDN Indicator */}
        {loanData.pdnCalculation && (
          <div className="space-y-2 pt-2 border-t">
            <p className="text-sm text-muted-foreground">Долговая нагрузка (ПДН)</p>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all ${
                    loanData.pdnCalculation.pdn_ratio < 0.3 ? 'bg-green-500' :
                    loanData.pdnCalculation.pdn_ratio < 0.5 ? 'bg-yellow-500' :
                    'bg-red-500'
                  }`}
                  style={{ width: `${Math.min(loanData.pdnCalculation.pdn_ratio * 100, 100)}%` }}
                />
              </div>
              <span className="text-sm font-medium">
                {Math.round(loanData.pdnCalculation.pdn_ratio * 100)}%
              </span>
            </div>
          </div>
        )}
        
        {/* Pre-check Status */}
        {loanData.preCheckResult && (
          <Alert className={loanData.preCheckResult.isEligible ? "border-green-200" : "border-yellow-200"}>
            <AlertDescription className="text-sm">
              {loanData.preCheckResult.isEligible ? (
                <span className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Предварительное одобрение получено
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-yellow-500" />
                  Требуется дополнительная проверка
                </span>
              )}
            </AlertDescription>
          </Alert>
        )}
        
        {/* Calculation Details */}
        {loanData.calculation && (
          <div className="pt-2 border-t space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Общая сумма к возврату</span>
              <span>{formatCurrency(loanData.calculation.totalAmount)} сум</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Переплата</span>
              <span>{formatCurrency(loanData.calculation.overpayment)} сум</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Эффективная ставка</span>
              <span>{(loanData.calculation.effectiveRate * 100).toFixed(1)}% годовых</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}