"use client"

import { useState } from "react"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { 
  Clock, 
  Percent, 
  Banknote, 
  CheckCircle2, 
  XCircle,
  Info,
  Calculator,
  Star,
  TrendingUp,
  Users,
  Calendar
} from "lucide-react"

export interface BankOffer {
  id: string
  bank_name: string
  bank_logo?: string
  min_amount: number
  max_amount: number
  min_term_months: number
  max_term_months: number
  annual_rate: number
  monthly_rate: number
  processing_fee: number
  insurance_required: boolean
  min_age: number
  max_age: number
  income_proof_required: boolean
  consider_credit_history: boolean
  decision_time_minutes: number
  max_pdn: number
  special_offer?: string
  rating: number
  is_active: boolean
}

export interface BankCardProps {
  offer: BankOffer
  featured?: boolean
  showDetails?: boolean
  userScore?: number
  userPDN?: number
  requestedAmount?: number
  requestedTerm?: number
  onSelect?: (offer: BankOffer) => void
  onCalculate?: (offer: BankOffer) => void
  className?: string
}

export default function BankCard({
  offer,
  featured = false,
  showDetails = true,
  userScore,
  userPDN,
  requestedAmount,
  requestedTerm,
  onSelect,
  onCalculate,
  className
}: BankCardProps) {
  const [showRequirements, setShowRequirements] = useState(false)
  
  // Check eligibility based on user data
  const eligibility = {
    score: userScore ? userScore >= (offer.consider_credit_history ? 600 : 500) : null,
    pdn: userPDN ? userPDN <= offer.max_pdn : null,
    amount: requestedAmount 
      ? requestedAmount >= offer.min_amount && requestedAmount <= offer.max_amount 
      : null,
    term: requestedTerm
      ? requestedTerm >= offer.min_term_months && requestedTerm <= offer.max_term_months
      : null
  }
  
  const isEligible = Object.values(eligibility).every(v => v !== false)
  const hasUserData = userScore || userPDN || requestedAmount || requestedTerm
  
  // Calculate monthly payment if requested amount and term provided
  const monthlyPayment = requestedAmount && requestedTerm
    ? (requestedAmount * offer.monthly_rate * Math.pow(1 + offer.monthly_rate, requestedTerm)) /
      (Math.pow(1 + offer.monthly_rate, requestedTerm) - 1)
    : null
    
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat("ru-RU").format(amount)
  }
  
  const formatRate = (rate: number) => {
    return `${(rate * 100).toFixed(1)}%`
  }
  
  return (
    <Card className={cn(
      "relative overflow-hidden transition-all duration-300",
      featured && "ring-2 ring-primary shadow-lg",
      hasUserData && !isEligible && "opacity-60",
      className
    )}>
      {/* Featured badge */}
      {featured && (
        <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-3 py-1 text-xs font-semibold rounded-bl-lg">
          Рекомендуем
        </div>
      )}
      
      {/* Special offer badge */}
      {offer.special_offer && (
        <div className="absolute top-0 left-0 bg-yellow-500 text-yellow-900 px-3 py-1 text-xs font-semibold rounded-br-lg flex items-center gap-1">
          <TrendingUp className="w-3 h-3" />
          {offer.special_offer}
        </div>
      )}
      
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between gap-4">
          {/* Bank info */}
          <div className="flex items-center gap-3">
            {offer.bank_logo ? (
              <Image
                src={offer.bank_logo}
                alt={offer.bank_name}
                width={48}
                height={48}
                className="rounded-lg object-contain"
              />
            ) : (
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                <Banknote className="w-6 h-6 text-gray-400" />
              </div>
            )}
            <div>
              <h3 className="font-semibold text-lg">{offer.bank_name}</h3>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-500 fill-current" />
                  <span className="text-sm font-medium">{offer.rating.toFixed(1)}</span>
                </div>
                {offer.decision_time_minutes <= 15 && (
                  <Badge variant="secondary" className="text-xs">
                    Быстрое решение
                  </Badge>
                )}
              </div>
            </div>
          </div>
          
          {/* Eligibility indicator */}
          {hasUserData && (
            <div className="flex items-center">
              {isEligible ? (
                <CheckCircle2 className="w-6 h-6 text-green-500" />
              ) : (
                <XCircle className="w-6 h-6 text-red-500" />
              )}
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Main parameters */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-sm text-muted-foreground">Ставка</div>
            <div className="text-2xl font-bold text-primary">
              от {formatRate(offer.annual_rate)}
            </div>
            <div className="text-xs text-muted-foreground">годовых</div>
          </div>
          
          <div>
            <div className="text-sm text-muted-foreground">Сумма</div>
            <div className="text-lg font-semibold">
              {formatAmount(offer.min_amount)} - {formatAmount(offer.max_amount)} сум
            </div>
          </div>
        </div>
        
        {/* Monthly payment calculation */}
        {monthlyPayment && (
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
            <div className="text-sm text-muted-foreground">Ежемесячный платеж</div>
            <div className="text-xl font-bold">{formatAmount(Math.round(monthlyPayment))} сум</div>
            <div className="text-xs text-muted-foreground mt-1">
              Для {formatAmount(requestedAmount!)} сум на {requestedTerm} мес.
            </div>
          </div>
        )}
        
        {/* Quick info */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <span>Решение за {offer.decision_time_minutes} мин</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <span>{offer.min_term_months}-{offer.max_term_months} месяцев</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Percent className="w-4 h-4 text-muted-foreground" />
            <span>Комиссия {formatRate(offer.processing_fee)}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-muted-foreground" />
            <span>{offer.min_age}-{offer.max_age} лет</span>
          </div>
        </div>
        
        {/* Requirements section */}
        {showDetails && (
          <div className="border-t pt-3">
            <button
              onClick={() => setShowRequirements(!showRequirements)}
              className="flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors"
            >
              <Info className="w-4 h-4" />
              {showRequirements ? "Скрыть требования" : "Показать требования"}
            </button>
            
            {showRequirements && (
              <div className="mt-3 space-y-2">
                <div className="flex items-start gap-2">
                  <div className={cn(
                    "w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5",
                    offer.income_proof_required ? "bg-orange-100" : "bg-green-100"
                  )}>
                    {offer.income_proof_required ? (
                      <Info className="w-3 h-3 text-orange-600" />
                    ) : (
                      <CheckCircle2 className="w-3 h-3 text-green-600" />
                    )}
                  </div>
                  <span className="text-sm">
                    {offer.income_proof_required 
                      ? "Требуется подтверждение дохода" 
                      : "Без подтверждения дохода"}
                  </span>
                </div>
                
                <div className="flex items-start gap-2">
                  <div className={cn(
                    "w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5",
                    offer.consider_credit_history ? "bg-orange-100" : "bg-green-100"
                  )}>
                    {offer.consider_credit_history ? (
                      <Info className="w-3 h-3 text-orange-600" />
                    ) : (
                      <CheckCircle2 className="w-3 h-3 text-green-600" />
                    )}
                  </div>
                  <span className="text-sm">
                    {offer.consider_credit_history 
                      ? "Учитывается кредитная история" 
                      : "Без проверки кредитной истории"}
                  </span>
                </div>
                
                <div className="flex items-start gap-2">
                  <div className={cn(
                    "w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5",
                    offer.insurance_required ? "bg-orange-100" : "bg-green-100"
                  )}>
                    {offer.insurance_required ? (
                      <Info className="w-3 h-3 text-orange-600" />
                    ) : (
                      <CheckCircle2 className="w-3 h-3 text-green-600" />
                    )}
                  </div>
                  <span className="text-sm">
                    {offer.insurance_required 
                      ? "Обязательное страхование" 
                      : "Без обязательного страхования"}
                  </span>
                </div>
                
                <div className="flex items-start gap-2">
                  <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Info className="w-3 h-3 text-blue-600" />
                  </div>
                  <span className="text-sm">
                    Максимальный ПДН: {offer.max_pdn}%
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* Eligibility details */}
        {hasUserData && !isEligible && (
          <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-3 space-y-2">
            <div className="text-sm font-medium text-red-800 dark:text-red-200">
              Не подходит по следующим параметрам:
            </div>
            <div className="space-y-1">
              {eligibility.score === false && (
                <div className="text-xs text-red-600 dark:text-red-300">
                  • Требуется кредитный рейтинг от 600 баллов
                </div>
              )}
              {eligibility.pdn === false && (
                <div className="text-xs text-red-600 dark:text-red-300">
                  • Ваш ПДН превышает максимальный ({offer.max_pdn}%)
                </div>
              )}
              {eligibility.amount === false && (
                <div className="text-xs text-red-600 dark:text-red-300">
                  • Запрошенная сумма вне диапазона
                </div>
              )}
              {eligibility.term === false && (
                <div className="text-xs text-red-600 dark:text-red-300">
                  • Запрошенный срок вне диапазона
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="gap-2">
        {onCalculate && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onCalculate(offer)}
            className="flex-1"
          >
            <Calculator className="w-4 h-4 mr-2" />
            Рассчитать
          </Button>
        )}
        
        {onSelect && (
          <Button
            size="sm"
            onClick={() => onSelect(offer)}
            disabled={Boolean(hasUserData && !isEligible)}
            className="flex-1"
          >
            Оформить заявку
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}