"use client"

import { useState } from "react"
import LoanForm, { LoanFormData, LoanCalculation } from "./loan-form"
import { Card, CardContent, CardHeader, CardTitle } from "./card"

export default function LoanFormDemo() {
  const [submissions, setSubmissions] = useState<Array<{
    data: LoanFormData
    calculation: LoanCalculation
    timestamp: Date
  }>>([])
  
  const [lastCalculation, setLastCalculation] = useState<{
    data: LoanFormData
    calculation: LoanCalculation
  } | null>(null)
  
  const handleSubmit = (data: LoanFormData, calculation: LoanCalculation) => {
    setSubmissions(prev => [{
      data,
      calculation,
      timestamp: new Date()
    }, ...prev.slice(0, 4)])
    
    alert(`Заявка отправлена!
    
Сумма: ${new Intl.NumberFormat("ru-RU").format(data.amount)} сум
Срок: ${data.term} месяцев
Ежемесячный платеж: ${new Intl.NumberFormat("ru-RU").format(Math.round(calculation.monthlyPayment))} сум
ПДН: ${calculation.pdn.toFixed(1)}%`)
  }
  
  const handleCalculate = (data: LoanFormData, calculation: LoanCalculation) => {
    setLastCalculation({ data, calculation })
  }
  
  const formatCurrency = (amount: number) => {
    return `${new Intl.NumberFormat("ru-RU").format(amount)} сум`
  }
  
  return (
    <div className="space-y-8 p-8 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Loan Form Examples</h2>
      
      {/* Default form with all features */}
      <div>
        <h3 className="text-xl font-semibold mb-4">Полная форма с расчетом ПДН</h3>
        <LoanForm
          onSubmit={handleSubmit}
          onCalculate={handleCalculate}
        />
      </div>
      
      {/* Custom parameters */}
      <div>
        <h3 className="text-xl font-semibold mb-4">Форма с кастомными параметрами</h3>
        <LoanForm
          minAmount={1000000}
          maxAmount={100000000}
          minTerm={6}
          maxTerm={60}
          annualRate={0.24}
          onSubmit={handleSubmit}
          showTips={false}
        />
      </div>
      
      {/* Minimal form */}
      <div>
        <h3 className="text-xl font-semibold mb-4">Минимальная форма без ПДН</h3>
        <LoanForm
          showPDN={false}
          showTips={false}
          onSubmit={handleSubmit}
        />
      </div>
      
      {/* Real-time calculation display */}
      {lastCalculation && (
        <Card>
          <CardHeader>
            <CardTitle>Последний расчет в реальном времени</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Сумма:</span>
                <span className="ml-2 font-medium">
                  {formatCurrency(lastCalculation.data.amount)}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Срок:</span>
                <span className="ml-2 font-medium">
                  {lastCalculation.data.term} мес
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Платеж:</span>
                <span className="ml-2 font-medium">
                  {formatCurrency(Math.round(lastCalculation.calculation.monthlyPayment))}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">ПДН:</span>
                <span className="ml-2 font-medium">
                  {lastCalculation.calculation.pdn.toFixed(1)}%
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Переплата:</span>
                <span className="ml-2 font-medium">
                  {formatCurrency(Math.round(lastCalculation.calculation.overpayment))}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Уровень риска:</span>
                <span className={`ml-2 font-medium ${
                  lastCalculation.calculation.pdnRiskLevel === "low" ? "text-green-600" :
                  lastCalculation.calculation.pdnRiskLevel === "medium" ? "text-yellow-600" :
                  lastCalculation.calculation.pdnRiskLevel === "high" ? "text-orange-600" :
                  "text-red-600"
                }`}>
                  {lastCalculation.calculation.pdnRiskLevel === "low" ? "Низкий" :
                   lastCalculation.calculation.pdnRiskLevel === "medium" ? "Средний" :
                   lastCalculation.calculation.pdnRiskLevel === "high" ? "Высокий" :
                   "Критический"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Submission history */}
      {submissions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>История заявок</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {submissions.map((submission, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                >
                  <div className="space-y-1">
                    <div className="text-sm font-medium">
                      {formatCurrency(submission.data.amount)} на {submission.data.term} мес
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Платеж: {formatCurrency(Math.round(submission.calculation.monthlyPayment))} | 
                      ПДН: {submission.calculation.pdn.toFixed(1)}%
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {submission.timestamp.toLocaleTimeString("ru-RU")}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}