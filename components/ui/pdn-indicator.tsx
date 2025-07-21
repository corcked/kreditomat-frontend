"use client"

import { useMemo } from "react"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Info, AlertTriangle, AlertCircle, CheckCircle } from "lucide-react"
import { cn } from "@/lib/utils"

export interface PDNIndicatorProps {
  pdn: number
  monthlyIncome?: number
  monthlyPayment?: number
  otherPayments?: number
  showDetails?: boolean
  className?: string
}

export type PDNRiskLevel = "low" | "medium" | "high" | "critical"

export function getPDNRiskLevel(pdn: number): PDNRiskLevel {
  if (pdn < 30) return "low"
  if (pdn < 50) return "medium"
  if (pdn < 65) return "high"
  return "critical"
}

const riskConfig = {
  low: {
    color: "text-green-600",
    bgColor: "bg-green-50",
    progressColor: "bg-green-500",
    icon: CheckCircle,
    title: "Низкая долговая нагрузка",
    description: "Ваш показатель долговой нагрузки находится в безопасной зоне",
  },
  medium: {
    color: "text-yellow-600",
    bgColor: "bg-yellow-50",
    progressColor: "bg-yellow-500",
    icon: Info,
    title: "Средняя долговая нагрузка",
    description: "Рекомендуем не увеличивать долговую нагрузку",
  },
  high: {
    color: "text-orange-600",
    bgColor: "bg-orange-50",
    progressColor: "bg-orange-500",
    icon: AlertTriangle,
    title: "Высокая долговая нагрузка",
    description: "Рекомендуем уменьшить сумму займа или увеличить срок",
  },
  critical: {
    color: "text-red-600",
    bgColor: "bg-red-50",
    progressColor: "bg-red-500",
    icon: AlertCircle,
    title: "Критическая долговая нагрузка",
    description: "Превышен безопасный уровень. Займ может быть отклонен",
  },
}

export default function PDNIndicator({
  pdn,
  monthlyIncome,
  monthlyPayment,
  otherPayments = 0,
  showDetails = false,
  className,
}: PDNIndicatorProps) {
  const riskLevel = useMemo(() => getPDNRiskLevel(pdn), [pdn])
  const config = riskConfig[riskLevel]
  const Icon = config.icon

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat("ru-RU", {
      style: "currency",
      currency: "UZS",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* PDN Value and Progress */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">
            Показатель долговой нагрузки (ПДН)
          </span>
          <span className={cn("text-2xl font-bold", config.color)}>
            {pdn.toFixed(1)}%
          </span>
        </div>
        
        <div className="relative">
          <Progress 
            value={Math.min(pdn, 100)} 
            className="h-3"
            indicatorClassName={config.progressColor}
          />
          
          {/* Risk zone markers */}
          <div className="absolute inset-0 flex pointer-events-none">
            <div className="w-[30%] border-r-2 border-gray-300" />
            <div className="w-[20%] border-r-2 border-gray-300" />
            <div className="w-[15%] border-r-2 border-gray-300" />
          </div>
        </div>
        
        {/* Risk zones legend */}
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>0%</span>
          <span className="ml-[30%]">30%</span>
          <span className="ml-[20%]">50%</span>
          <span className="ml-[15%]">65%</span>
          <span className="ml-auto">100%</span>
        </div>
      </div>

      {/* Risk Alert */}
      <Alert className={cn(config.bgColor, "border-0")}>
        <Icon className={cn("h-4 w-4", config.color)} />
        <AlertDescription>
          <strong className={config.color}>{config.title}</strong>
          <p className="text-sm text-gray-600 mt-1">{config.description}</p>
        </AlertDescription>
      </Alert>

      {/* Detailed Breakdown */}
      {showDetails && monthlyIncome && monthlyPayment && (
        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
          <h4 className="font-medium text-gray-900">Расчет ПДН</h4>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Ежемесячный доход:</span>
              <span className="font-medium">{formatAmount(monthlyIncome)}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600">Платеж по новому займу:</span>
              <span className="font-medium">{formatAmount(monthlyPayment)}</span>
            </div>
            
            {otherPayments > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600">Другие платежи:</span>
                <span className="font-medium">{formatAmount(otherPayments)}</span>
              </div>
            )}
            
            <div className="pt-2 border-t border-gray-200">
              <div className="flex justify-between">
                <span className="text-gray-600">Общие платежи:</span>
                <span className="font-medium">
                  {formatAmount(monthlyPayment + otherPayments)}
                </span>
              </div>
              
              <div className="flex justify-between mt-1">
                <span className="text-gray-600">Свободный доход:</span>
                <span className="font-medium">
                  {formatAmount(monthlyIncome - monthlyPayment - otherPayments)}
                </span>
              </div>
            </div>
          </div>
          
          {/* Recommendations */}
          {riskLevel !== "low" && (
            <div className="pt-3 border-t border-gray-200">
              <p className="text-sm font-medium text-gray-900 mb-2">Рекомендации:</p>
              <ul className="text-sm text-gray-600 space-y-1">
                {riskLevel === "medium" && (
                  <>
                    <li>• Рассмотрите увеличение срока займа для снижения платежа</li>
                    <li>• Избегайте дополнительных кредитов</li>
                  </>
                )}
                {riskLevel === "high" && (
                  <>
                    <li>• Уменьшите сумму займа на 20-30%</li>
                    <li>• Увеличьте срок займа до максимального</li>
                    <li>• Рассмотрите погашение других кредитов</li>
                  </>
                )}
                {riskLevel === "critical" && (
                  <>
                    <li>• Откажитесь от займа или значительно уменьшите сумму</li>
                    <li>• Сначала погасите существующие кредиты</li>
                    <li>• Рассмотрите альтернативные источники дохода</li>
                  </>
                )}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  )
}