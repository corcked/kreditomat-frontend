"use client"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Sparkles, TrendingUp, Clock, Shield, Award, CheckCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface MotivationalBannerProps {
  type: "success" | "progress" | "info" | "warning"
  title?: string
  message: string
  icon?: React.ReactNode
  className?: string
  features?: string[]
}

const defaultIcons = {
  success: <CheckCircle className="w-5 h-5" />,
  progress: <TrendingUp className="w-5 h-5" />,
  info: <Sparkles className="w-5 h-5" />,
  warning: <Shield className="w-5 h-5" />
}

const variantStyles = {
  success: "border-green-200 bg-green-50 text-green-900 dark:border-green-800 dark:bg-green-950 dark:text-green-100",
  progress: "border-blue-200 bg-blue-50 text-blue-900 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-100",
  info: "border-purple-200 bg-purple-50 text-purple-900 dark:border-purple-800 dark:bg-purple-950 dark:text-purple-100",
  warning: "border-yellow-200 bg-yellow-50 text-yellow-900 dark:border-yellow-800 dark:bg-yellow-950 dark:text-yellow-100"
}

export default function MotivationalBanner({
  type,
  title,
  message,
  icon,
  className,
  features
}: MotivationalBannerProps) {
  const IconComponent = icon || defaultIcons[type]
  
  return (
    <Alert className={cn(variantStyles[type], className)}>
      <div className="flex items-start gap-3">
        <div className={cn(
          "mt-0.5",
          type === "success" && "text-green-600 dark:text-green-400",
          type === "progress" && "text-blue-600 dark:text-blue-400",
          type === "info" && "text-purple-600 dark:text-purple-400",
          type === "warning" && "text-yellow-600 dark:text-yellow-400"
        )}>
          {IconComponent}
        </div>
        <div className="flex-1 space-y-2">
          {title && (
            <p className="font-semibold text-base">{title}</p>
          )}
          <AlertDescription className="text-sm">
            {message}
          </AlertDescription>
          {features && features.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {features.map((feature, index) => (
                <Badge 
                  key={index} 
                  variant="secondary"
                  className={cn(
                    "text-xs",
                    type === "success" && "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
                    type === "progress" && "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
                    type === "info" && "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300",
                    type === "warning" && "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300"
                  )}
                >
                  {feature}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>
    </Alert>
  )
}

export function LoanFlowMotivation({ step }: { step: "calculated" | "auth" | "personal" | "offers" }) {
  const motivations = {
    calculated: {
      type: "success" as const,
      title: "Отличный старт! 🎯",
      message: "Вы уже прошли первый шаг. Осталось всего несколько минут до получения денег.",
      features: ["Без походов в банк", "Решение за 5 минут", "Деньги на карту"]
    },
    auth: {
      type: "progress" as const,
      title: "Вы на правильном пути!",
      message: "Авторизуйтесь, чтобы банки могли отправить вам персональные предложения.",
      features: ["Безопасно", "Без спама", "Только лучшие предложения"]
    },
    personal: {
      type: "info" as const,
      title: "Почти готово!",
      message: "Заполните персональные данные один раз и используйте их для всех заявок.",
      features: ["Автозаполнение", "Сохранение данных", "Быстрые повторные заявки"]
    },
    offers: {
      type: "success" as const,
      title: "Поздравляем! 🎉",
      message: "Вам доступны персональные предложения от банков. Выберите лучшее!",
      icon: <Award className="w-5 h-5" />
    }
  }
  
  return <MotivationalBanner {...motivations[step]} />
}