"use client"

import { useState, useEffect, useMemo } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import PDNIndicator from "./pdn-indicator"
import { 
  Calculator,
  Banknote,
  Calendar,
  Percent,
  AlertCircle,
  Info,
  TrendingUp,
  HelpCircle
} from "lucide-react"

export interface LoanFormData {
  amount: number
  term: number
  monthlyIncome: number
  monthlyExpenses: number
  existingPayments: number
}

export interface LoanCalculation {
  monthlyPayment: number
  totalPayment: number
  overpayment: number
  effectiveRate: number
  pdn: number
  pdnRiskLevel: "low" | "medium" | "high" | "critical"
}

export interface LoanFormProps {
  minAmount?: number
  maxAmount?: number
  minTerm?: number
  maxTerm?: number
  annualRate?: number
  onSubmit?: (data: LoanFormData, calculation: LoanCalculation) => void
  onCalculate?: (data: LoanFormData, calculation: LoanCalculation) => void
  showPDN?: boolean
  showTips?: boolean
  className?: string
}

const formatAmount = (amount: number) => {
  return new Intl.NumberFormat("ru-RU").format(amount)
}

const formatCurrency = (amount: number) => {
  return `${formatAmount(amount)} сум`
}

export default function LoanForm({
  minAmount = 500000,
  maxAmount = 50000000,
  minTerm = 3,
  maxTerm = 36,
  annualRate = 0.28,
  onSubmit,
  onCalculate,
  showPDN = true,
  showTips = true,
  className
}: LoanFormProps) {
  const [formData, setFormData] = useState<LoanFormData>({
    amount: 5000000,
    term: 12,
    monthlyIncome: 10000000,
    monthlyExpenses: 3000000,
    existingPayments: 0
  })
  
  const [errors, setErrors] = useState<Partial<Record<keyof LoanFormData, string>>>({})
  const [showAdvanced, setShowAdvanced] = useState(false)
  
  // Calculate loan parameters
  const calculation = useMemo<LoanCalculation>(() => {
    const monthlyRate = annualRate / 12
    const monthlyPayment = 
      (formData.amount * monthlyRate * Math.pow(1 + monthlyRate, formData.term)) /
      (Math.pow(1 + monthlyRate, formData.term) - 1)
    
    const totalPayment = monthlyPayment * formData.term
    const overpayment = totalPayment - formData.amount
    const effectiveRate = (overpayment / formData.amount) * 100
    
    // Calculate PDN
    const totalMonthlyPayments = monthlyPayment + formData.existingPayments
    const netIncome = formData.monthlyIncome - formData.monthlyExpenses
    const pdn = netIncome > 0 ? (totalMonthlyPayments / netIncome) * 100 : 100
    
    // Determine risk level
    let pdnRiskLevel: "low" | "medium" | "high" | "critical"
    if (pdn < 30) pdnRiskLevel = "low"
    else if (pdn < 50) pdnRiskLevel = "medium"
    else if (pdn < 65) pdnRiskLevel = "high"
    else pdnRiskLevel = "critical"
    
    return {
      monthlyPayment,
      totalPayment,
      overpayment,
      effectiveRate,
      pdn,
      pdnRiskLevel
    }
  }, [formData, annualRate])
  
  // Notify about calculation changes
  useEffect(() => {
    if (onCalculate) {
      onCalculate(formData, calculation)
    }
  }, [formData, calculation, onCalculate])
  
  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof LoanFormData, string>> = {}
    
    if (formData.amount < minAmount || formData.amount > maxAmount) {
      newErrors.amount = `Сумма должна быть от ${formatCurrency(minAmount)} до ${formatCurrency(maxAmount)}`
    }
    
    if (formData.term < minTerm || formData.term > maxTerm) {
      newErrors.term = `Срок должен быть от ${minTerm} до ${maxTerm} месяцев`
    }
    
    if (formData.monthlyIncome <= 0) {
      newErrors.monthlyIncome = "Укажите ваш ежемесячный доход"
    }
    
    if (formData.monthlyExpenses < 0) {
      newErrors.monthlyExpenses = "Расходы не могут быть отрицательными"
    }
    
    if (formData.monthlyExpenses >= formData.monthlyIncome) {
      newErrors.monthlyExpenses = "Расходы не могут превышать доходы"
    }
    
    if (formData.existingPayments < 0) {
      newErrors.existingPayments = "Платежи не могут быть отрицательными"
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (validateForm() && onSubmit) {
      onSubmit(formData, calculation)
    }
  }
  
  const handleAmountChange = (value: number) => {
    setFormData(prev => ({ ...prev, amount: value }))
    setErrors(prev => ({ ...prev, amount: undefined }))
  }
  
  const handleTermChange = (value: number) => {
    setFormData(prev => ({ ...prev, term: value }))
    setErrors(prev => ({ ...prev, term: undefined }))
  }
  
  // Quick amount buttons
  const quickAmounts = [
    { value: 1000000, label: "1 млн" },
    { value: 3000000, label: "3 млн" },
    { value: 5000000, label: "5 млн" },
    { value: 10000000, label: "10 млн" }
  ].filter(a => a.value >= minAmount && a.value <= maxAmount)
  
  // Quick term buttons
  const quickTerms = [
    { value: 6, label: "6 мес" },
    { value: 12, label: "1 год" },
    { value: 24, label: "2 года" },
    { value: 36, label: "3 года" }
  ].filter(t => t.value >= minTerm && t.value <= maxTerm)
  
  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="w-5 h-5" />
          Калькулятор займа
        </CardTitle>
        <CardDescription>
          Рассчитайте условия вашего займа и узнайте ежемесячный платеж
        </CardDescription>
      </CardHeader>
      
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          {/* Amount section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="amount" className="flex items-center gap-2">
                <Banknote className="w-4 h-4" />
                Сумма займа
              </Label>
              <span className="text-sm font-medium">
                {formatCurrency(formData.amount)}
              </span>
            </div>
            
            <Slider
              id="amount"
              min={minAmount}
              max={maxAmount}
              step={100000}
              value={[formData.amount]}
              onValueChange={([value]) => handleAmountChange(value)}
              className="my-4"
            />
            
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{formatCurrency(minAmount)}</span>
              <span>{formatCurrency(maxAmount)}</span>
            </div>
            
            {/* Quick amount buttons */}
            <div className="flex flex-wrap gap-2">
              {quickAmounts.map(({ value, label }) => (
                <Button
                  key={value}
                  type="button"
                  variant={formData.amount === value ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleAmountChange(value)}
                >
                  {label}
                </Button>
              ))}
            </div>
            
            {errors.amount && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.amount}
              </p>
            )}
          </div>
          
          {/* Term section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="term" className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Срок займа
              </Label>
              <span className="text-sm font-medium">
                {formData.term} месяцев
              </span>
            </div>
            
            <Slider
              id="term"
              min={minTerm}
              max={maxTerm}
              step={1}
              value={[formData.term]}
              onValueChange={([value]) => handleTermChange(value)}
              className="my-4"
            />
            
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{minTerm} мес</span>
              <span>{maxTerm} мес</span>
            </div>
            
            {/* Quick term buttons */}
            <div className="flex flex-wrap gap-2">
              {quickTerms.map(({ value, label }) => (
                <Button
                  key={value}
                  type="button"
                  variant={formData.term === value ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleTermChange(value)}
                >
                  {label}
                </Button>
              ))}
            </div>
            
            {errors.term && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.term}
              </p>
            )}
          </div>
          
          {/* Calculation result */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Ежемесячный платеж</span>
              <span className="text-2xl font-bold text-primary">
                {formatCurrency(Math.round(calculation.monthlyPayment))}
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Переплата</span>
                <span className="font-medium">
                  {formatCurrency(Math.round(calculation.overpayment))}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Всего к возврату</span>
                <span className="font-medium">
                  {formatCurrency(Math.round(calculation.totalPayment))}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Ставка</span>
                <span className="font-medium">{(annualRate * 100).toFixed(1)}% годовых</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Эффективная ставка</span>
                <span className="font-medium">{calculation.effectiveRate.toFixed(1)}%</span>
              </div>
            </div>
          </div>
          
          {/* Advanced settings */}
          <div className="border-t pt-4">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center gap-2"
            >
              <Info className="w-4 h-4" />
              {showAdvanced ? "Скрыть" : "Показать"} расчет ПДН
            </Button>
            
            {showAdvanced && (
              <div className="mt-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="income" className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" />
                      Ежемесячный доход
                    </Label>
                    <Input
                      id="income"
                      type="number"
                      value={formData.monthlyIncome}
                      onChange={(e) => {
                        setFormData(prev => ({ ...prev, monthlyIncome: Number(e.target.value) }))
                        setErrors(prev => ({ ...prev, monthlyIncome: undefined }))
                      }}
                      placeholder="10000000"
                    />
                    {errors.monthlyIncome && (
                      <p className="text-sm text-red-500 mt-1">{errors.monthlyIncome}</p>
                    )}
                  </div>
                  
                  <div>
                    <Label htmlFor="expenses" className="flex items-center gap-2">
                      <Banknote className="w-4 h-4" />
                      Ежемесячные расходы
                    </Label>
                    <Input
                      id="expenses"
                      type="number"
                      value={formData.monthlyExpenses}
                      onChange={(e) => {
                        setFormData(prev => ({ ...prev, monthlyExpenses: Number(e.target.value) }))
                        setErrors(prev => ({ ...prev, monthlyExpenses: undefined }))
                      }}
                      placeholder="3000000"
                    />
                    {errors.monthlyExpenses && (
                      <p className="text-sm text-red-500 mt-1">{errors.monthlyExpenses}</p>
                    )}
                  </div>
                  
                  <div className="md:col-span-2">
                    <Label htmlFor="payments" className="flex items-center gap-2">
                      <Percent className="w-4 h-4" />
                      Текущие кредитные платежи
                      <HelpCircle className="w-3 h-3 text-muted-foreground" />
                    </Label>
                    <Input
                      id="payments"
                      type="number"
                      value={formData.existingPayments}
                      onChange={(e) => {
                        setFormData(prev => ({ ...prev, existingPayments: Number(e.target.value) }))
                        setErrors(prev => ({ ...prev, existingPayments: undefined }))
                      }}
                      placeholder="0"
                    />
                    {errors.existingPayments && (
                      <p className="text-sm text-red-500 mt-1">{errors.existingPayments}</p>
                    )}
                  </div>
                </div>
                
                {/* PDN Indicator */}
                {showPDN && (
                  <div className="mt-4">
                    <PDNIndicator
                      pdn={formData.monthlyIncome > 0 ? 
                        ((calculation.monthlyPayment + formData.existingPayments) / formData.monthlyIncome * 100) 
                        : 0
                      }
                      monthlyIncome={formData.monthlyIncome}
                      monthlyPayment={calculation.monthlyPayment}
                      otherPayments={formData.existingPayments}
                      showDetails
                    />
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Tips section */}
          {showTips && (
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 space-y-2">
              <h4 className="font-medium text-sm flex items-center gap-2">
                <Info className="w-4 h-4" />
                Полезные советы
              </h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                {calculation.pdnRiskLevel === "critical" && (
                  <li>• Ваш ПДН слишком высок. Рассмотрите меньшую сумму или больший срок</li>
                )}
                {calculation.effectiveRate > 50 && (
                  <li>• Переплата составляет более 50%. Попробуйте уменьшить срок займа</li>
                )}
                {formData.term > 24 && (
                  <li>• Длительный срок увеличивает переплату. По возможности выбирайте меньший срок</li>
                )}
                <li>• Досрочное погашение поможет сэкономить на процентах</li>
              </ul>
            </div>
          )}
        </CardContent>
        
        <CardFooter className="flex gap-2">
          <Button
            type="submit"
            className="flex-1"
            disabled={calculation.pdnRiskLevel === "critical"}
          >
            {calculation.pdnRiskLevel === "critical" 
              ? "Недоступно (высокий ПДН)" 
              : "Подать заявку"}
          </Button>
          
          {calculation.pdnRiskLevel === "critical" && (
            <Badge variant="destructive">
              ПДН {calculation.pdn.toFixed(0)}%
            </Badge>
          )}
        </CardFooter>
      </form>
    </Card>
  )
}