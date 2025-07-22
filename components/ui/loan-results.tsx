'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  TrendingUp,
  Calculator,
  Percent,
  Clock,
  Award
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { LoanCalculation, PreCheckResult } from '@/lib/loan-storage'
import { PDNCalculation } from '@/lib/pdn'

interface LoanResultsProps {
  calculation: LoanCalculation
  preCheckResult?: PreCheckResult
  pdnCalculation?: PDNCalculation
  onContinue?: () => void
  onRecalculate?: () => void
  className?: string
}

export function LoanResults({
  calculation,
  preCheckResult,
  pdnCalculation,
  onContinue,
  onRecalculate,
  className
}: LoanResultsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'UZS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const formatPercent = (value: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'percent',
      minimumFractionDigits: 1,
      maximumFractionDigits: 1
    }).format(value / 100)
  }

  const getScoreBadgeColor = (score: number) => {
    if (score >= 750) return 'default'
    if (score >= 700) return 'secondary'
    if (score >= 650) return 'outline'
    return 'destructive'
  }

  const getScoreLabel = (score: number) => {
    if (score >= 750) return 'Отличный'
    if (score >= 700) return 'Хороший'
    if (score >= 650) return 'Средний'
    return 'Низкий'
  }

  const getPDNStatusColor = (status: string) => {
    switch (status) {
      case 'LOW':
        return 'text-green-600'
      case 'MEDIUM':
        return 'text-yellow-600'
      case 'HIGH':
        return 'text-orange-600'
      case 'CRITICAL':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  const getPDNStatusLabel = (status: string) => {
    switch (status) {
      case 'LOW':
        return 'Низкая нагрузка'
      case 'MEDIUM':
        return 'Средняя нагрузка'
      case 'HIGH':
        return 'Высокая нагрузка'
      case 'CRITICAL':
        return 'Критическая нагрузка'
      default:
        return 'Неизвестно'
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={className}
    >
      <div className="grid gap-6 md:grid-cols-2">
        {/* Основные параметры займа */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Параметры займа
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Ежемесячный платеж</span>
              <span className="text-2xl font-bold">{formatCurrency(calculation.monthlyPayment)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Общая сумма выплат</span>
              <span className="text-lg font-semibold">{formatCurrency(calculation.totalPayment)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Переплата</span>
              <span className="text-lg font-semibold text-orange-600">
                {formatCurrency(calculation.totalInterest)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Эффективная ставка</span>
              <span className="text-lg font-semibold">{formatPercent(calculation.effectiveRate)}</span>
            </div>
          </CardContent>
        </Card>

        {/* Результаты предварительной проверки */}
        {preCheckResult && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  {preCheckResult.isEligible ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-600" />
                  )}
                  Предварительная проверка
                </span>
                {preCheckResult.score && (
                  <Badge variant={getScoreBadgeColor(preCheckResult.score)}>
                    {preCheckResult.score} ({getScoreLabel(preCheckResult.score)})
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {preCheckResult.isEligible ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle className="h-4 w-4" />
                    <span className="text-sm font-medium">Вы подходите для получения займа</span>
                  </div>
                  {preCheckResult.estimatedApprovalRate && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Вероятность одобрения</span>
                        <span className="font-medium">
                          {formatPercent(preCheckResult.estimatedApprovalRate)}
                        </span>
                      </div>
                      <Progress value={preCheckResult.estimatedApprovalRate * 100} className="h-2" />
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2 text-red-600">
                  <XCircle className="h-4 w-4" />
                  <span className="text-sm font-medium">К сожалению, займ не может быть одобрен</span>
                </div>
              )}
              
              {preCheckResult.recommendations && preCheckResult.recommendations.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Рекомендации:</p>
                  <ul className="space-y-1">
                    {preCheckResult.recommendations.map((rec, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <AlertCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* ПДН индикатор */}
        {pdnCalculation && (
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Показатель долговой нагрузки (ПДН)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-2xl font-bold">{formatPercent(pdnCalculation.pdn_ratio)}</p>
                    <p className={`text-sm font-medium ${getPDNStatusColor(pdnCalculation.status)}`}>
                      {getPDNStatusLabel(pdnCalculation.status)}
                    </p>
                  </div>
                  <div className="text-right space-y-1">
                    <p className="text-sm text-muted-foreground">Свободный доход</p>
                    <p className="text-lg font-semibold">
                      {formatCurrency(pdnCalculation.available_income)}
                    </p>
                  </div>
                </div>
                <Progress 
                  value={Math.min(pdnCalculation.pdn_ratio * 100, 100)} 
                  className="h-3"
                />
                <div className="grid grid-cols-4 gap-1 text-xs text-muted-foreground">
                  <span className="text-center">0-30%</span>
                  <span className="text-center">30-50%</span>
                  <span className="text-center">50-70%</span>
                  <span className="text-center">70%+</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* CTA секция */}
        <Card className="md:col-span-2 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Award className="h-8 w-8 text-blue-600" />
                <div>
                  <h3 className="font-semibold">Готовы продолжить?</h3>
                  <p className="text-sm text-muted-foreground">
                    Оформите заявку и получите деньги уже сегодня
                  </p>
                </div>
              </div>
              <div className="flex gap-3 w-full sm:w-auto">
                <Button variant="outline" onClick={onRecalculate} className="flex-1 sm:flex-initial">
                  Пересчитать
                </Button>
                <Button 
                  onClick={onContinue} 
                  className="flex-1 sm:flex-initial"
                  disabled={preCheckResult && !preCheckResult.isEligible}
                >
                  <Clock className="h-4 w-4 mr-2" />
                  Продолжить оформление
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  )
}