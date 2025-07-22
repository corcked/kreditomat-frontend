"use client"

import { CheckCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface Step {
  id: string
  title: string
  description?: string
  status: "completed" | "current" | "upcoming"
}

interface ProgressStepsProps {
  steps: Step[]
  className?: string
  variant?: "default" | "compact"
}

export default function ProgressSteps({ steps, className, variant = "default" }: ProgressStepsProps) {
  return (
    <div className={cn("w-full", className)}>
      {variant === "default" ? (
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className="flex items-center">
                <div
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all",
                    step.status === "completed" && "bg-green-500 text-white",
                    step.status === "current" && "bg-primary text-primary-foreground ring-4 ring-primary/20",
                    step.status === "upcoming" && "bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
                  )}
                >
                  {step.status === "completed" ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    index + 1
                  )}
                </div>
                <div className="ml-3">
                  <p
                    className={cn(
                      "text-sm font-medium",
                      step.status === "upcoming" && "text-gray-500 dark:text-gray-400"
                    )}
                  >
                    {step.title}
                  </p>
                  {step.description && variant === "default" && (
                    <p className="text-xs text-muted-foreground mt-0.5">{step.description}</p>
                  )}
                </div>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    "w-16 h-0.5 mx-4 transition-all",
                    steps[index + 1].status !== "upcoming" ? "bg-primary" : "bg-gray-200 dark:bg-gray-700"
                  )}
                />
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="flex items-center justify-center space-x-2">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className="flex items-center">
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
                    step.status === "completed" && "bg-green-500 text-white",
                    step.status === "current" && "bg-primary text-primary-foreground",
                    step.status === "upcoming" && "bg-gray-300 dark:bg-gray-700"
                  )}
                >
                  {step.status === "completed" ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    index + 1
                  )}
                </div>
                <span
                  className={cn(
                    "ml-2 text-sm font-medium",
                    step.status === "current" && "text-primary",
                    step.status === "upcoming" && "text-muted-foreground"
                  )}
                >
                  {step.title}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    "w-8 h-0.5 mx-2",
                    steps[index + 1].status !== "upcoming" ? "bg-primary" : "bg-gray-300 dark:bg-gray-700"
                  )}
                />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}