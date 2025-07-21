"use client"

import { useMemo } from "react"
import { cn } from "@/lib/utils"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"

export interface ScoringGaugeProps {
  score: number
  previousScore?: number
  showDetails?: boolean
  size?: "sm" | "md" | "lg"
  className?: string
}

export type ScoreCategory = "excellent" | "good" | "fair" | "poor" | "very_poor"

export function getScoreCategory(score: number): ScoreCategory {
  if (score >= 800) return "excellent"
  if (score >= 700) return "good"
  if (score >= 600) return "fair"
  if (score >= 500) return "poor"
  return "very_poor"
}

const categoryConfig = {
  excellent: {
    label: "Отличный",
    color: "#10b981", // green-500
    bgColor: "bg-green-50",
    textColor: "text-green-700",
    description: "Вам доступны лучшие условия",
    emoji: "🌟",
  },
  good: {
    label: "Хороший",
    color: "#3b82f6", // blue-500
    bgColor: "bg-blue-50",
    textColor: "text-blue-700",
    description: "Большинство предложений доступно",
    emoji: "✨",
  },
  fair: {
    label: "Средний",
    color: "#eab308", // yellow-500
    bgColor: "bg-yellow-50",
    textColor: "text-yellow-700",
    description: "Доступны базовые предложения",
    emoji: "💫",
  },
  poor: {
    label: "Низкий",
    color: "#f97316", // orange-500
    bgColor: "bg-orange-50",
    textColor: "text-orange-700",
    description: "Ограниченный выбор предложений",
    emoji: "⚡",
  },
  very_poor: {
    label: "Очень низкий",
    color: "#ef4444", // red-500
    bgColor: "bg-red-50",
    textColor: "text-red-700",
    description: "Рекомендуем улучшить показатели",
    emoji: "⚠️",
  },
}

const sizeConfig = {
  sm: {
    container: "w-32 h-32",
    svg: 128,
    strokeWidth: 8,
    scoreText: "text-2xl",
    labelText: "text-xs",
  },
  md: {
    container: "w-48 h-48",
    svg: 192,
    strokeWidth: 12,
    scoreText: "text-3xl",
    labelText: "text-sm",
  },
  lg: {
    container: "w-64 h-64",
    svg: 256,
    strokeWidth: 16,
    scoreText: "text-4xl",
    labelText: "text-base",
  },
}

export default function ScoringGauge({
  score,
  previousScore,
  showDetails = true,
  size = "md",
  className,
}: ScoringGaugeProps) {
  const category = useMemo(() => getScoreCategory(score), [score])
  const config = categoryConfig[category]
  const sizeConf = sizeConfig[size]
  
  // Calculate gauge parameters
  const radius = (sizeConf.svg - sizeConf.strokeWidth) / 2
  const circumference = radius * Math.PI * 1.5 // 270 degrees
  const center = sizeConf.svg / 2
  
  // Score percentage (300-900 range)
  const scorePercentage = ((score - 300) / 600) * 100
  const strokeDashoffset = circumference - (scorePercentage / 100) * circumference
  
  // Score change
  const scoreChange = previousScore ? score - previousScore : null
  
  return (
    <div className={cn("flex flex-col items-center space-y-4", className)}>
      {/* Gauge */}
      <div className={cn("relative", sizeConf.container)}>
        <svg
          width={sizeConf.svg}
          height={sizeConf.svg}
          className="transform -rotate-45"
        >
          {/* Background arc */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="#e5e7eb"
            strokeWidth={sizeConf.strokeWidth}
            strokeDasharray={`${circumference} ${circumference}`}
            strokeLinecap="round"
            className="opacity-50"
          />
          
          {/* Score arc */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke={config.color}
            strokeWidth={sizeConf.strokeWidth}
            strokeDasharray={`${circumference} ${circumference}`}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        
        {/* Score display */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-center">
            <div className={cn(sizeConf.scoreText, "font-bold text-gray-900")}>
              {score}
            </div>
            <div className={cn(sizeConf.labelText, "font-medium", config.textColor)}>
              {config.label}
            </div>
          </div>
        </div>
        
        {/* Score range labels */}
        <div className="absolute -bottom-2 left-0 text-xs text-gray-500">300</div>
        <div className="absolute -bottom-2 right-0 text-xs text-gray-500">900</div>
      </div>
      
      {/* Details */}
      {showDetails && (
        <div className="text-center space-y-3">
          {/* Category info */}
          <div className={cn("inline-flex items-center gap-2 px-4 py-2 rounded-full", config.bgColor)}>
            <span className="text-lg">{config.emoji}</span>
            <span className={cn("font-medium", config.textColor)}>
              {config.description}
            </span>
          </div>
          
          {/* Score change */}
          {scoreChange !== null && (
            <div className="flex items-center justify-center gap-2">
              {scoreChange > 0 ? (
                <>
                  <TrendingUp className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-green-600 font-medium">
                    +{scoreChange} баллов
                  </span>
                </>
              ) : scoreChange < 0 ? (
                <>
                  <TrendingDown className="w-4 h-4 text-red-500" />
                  <span className="text-sm text-red-600 font-medium">
                    {scoreChange} баллов
                  </span>
                </>
              ) : (
                <>
                  <Minus className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600">
                    Без изменений
                  </span>
                </>
              )}
            </div>
          )}
          
          {/* Approval probability */}
          <div className="text-sm text-gray-600">
            Вероятность одобрения:{" "}
            <span className="font-semibold">
              {score >= 800 ? "95%" :
               score >= 700 ? "80%" :
               score >= 600 ? "60%" :
               score >= 500 ? "30%" : "10%"}
            </span>
          </div>
          
          {/* Score breakdown hint */}
          <button className="text-sm text-primary hover:underline">
            Узнать, как улучшить рейтинг →
          </button>
        </div>
      )}
    </div>
  )
}