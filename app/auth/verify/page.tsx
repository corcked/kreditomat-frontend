"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { api } from "@/lib/api"
import { setToken } from "@/lib/auth"
import { 
  Phone, 
  Shield, 
  ArrowLeft,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Clock
} from "lucide-react"

export default function VerifyPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const phoneNumber = searchParams.get("phone") || ""
  
  const [code, setCode] = useState(["", "", "", "", "", ""])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [resendTimer, setResendTimer] = useState(60)
  const [canResend, setCanResend] = useState(false)
  
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])
  
  // Redirect if no phone number
  useEffect(() => {
    if (!phoneNumber) {
      router.push("/auth/login")
    }
  }, [phoneNumber, router])
  
  // Resend timer
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000)
      return () => clearTimeout(timer)
    } else {
      setCanResend(true)
    }
  }, [resendTimer])
  
  // Auto-submit when all digits entered
  useEffect(() => {
    const fullCode = code.join("")
    if (fullCode.length === 6) {
      handleSubmit(fullCode)
    }
  }, [code]) // eslint-disable-line react-hooks/exhaustive-deps
  
  const handleCodeChange = (index: number, value: string) => {
    // Only allow digits
    if (value && !/^\d$/.test(value)) return
    
    const newCode = [...code]
    newCode[index] = value
    setCode(newCode)
    setError("")
    
    // Move to next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }
  
  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    // Handle backspace
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
    
    // Handle paste
    if (e.key === "v" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault()
      navigator.clipboard.readText().then(text => {
        const digits = text.replace(/\D/g, "").slice(0, 6)
        const newCode = [...code]
        for (let i = 0; i < digits.length; i++) {
          newCode[i] = digits[i]
        }
        setCode(newCode)
        if (digits.length === 6) {
          inputRefs.current[5]?.focus()
        } else if (digits.length > 0) {
          inputRefs.current[digits.length - 1]?.focus()
        }
      })
    }
  }
  
  const handleSubmit = async (fullCode?: string) => {
    const codeToSubmit = fullCode || code.join("")
    
    if (codeToSubmit.length !== 6) {
      setError("Введите 6-значный код")
      return
    }
    
    setLoading(true)
    setError("")
    
    try {
      const response = await api.auth.verify({
        phone_number: phoneNumber,
        code: codeToSubmit
      })
      
      if (response.access_token) {
        setToken(response.access_token)
        setSuccess(true)
        
        // Redirect after success animation
        setTimeout(() => {
          router.push("/application/new")
        }, 1500)
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || "Неверный код. Попробуйте еще раз")
      setCode(["", "", "", "", "", ""])
      inputRefs.current[0]?.focus()
    } finally {
      setLoading(false)
    }
  }
  
  const handleResend = async () => {
    if (!canResend) return
    
    setCanResend(false)
    setResendTimer(60)
    setError("")
    
    try {
      await api.auth.request({ phone_number: phoneNumber })
      // Show success message
      setError("") // Clear any errors
    } catch (err: any) {
      setError(err.response?.data?.detail || "Ошибка при отправке кода")
      setCanResend(true)
    }
  }
  
  const formatPhone = (phone: string) => {
    // Format as +998 XX XXX-XX-XX
    const cleaned = phone.replace(/\D/g, "")
    const match = cleaned.match(/^(\d{3})(\d{2})(\d{3})(\d{2})(\d{2})$/)
    if (match) {
      return `+${match[1]} ${match[2]} ${match[3]}-${match[4]}-${match[5]}`
    }
    return phone
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Shield className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Подтверждение номера</CardTitle>
          <CardDescription>
            Мы отправили 6-значный код на номер
            <br />
            <span className="font-medium text-foreground">{formatPhone(phoneNumber)}</span>
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Code input */}
          <div>
            <Label className="text-center block mb-3">Введите код из SMS</Label>
            <div className="flex gap-2 justify-center">
              {code.map((digit, index) => (
                <Input
                  key={index}
                  ref={el => {
                    if (el) {
                      inputRefs.current[index] = el
                    }
                  }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleCodeChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  disabled={loading || success}
                  className="w-12 h-12 text-center text-lg font-semibold"
                  autoFocus={index === 0}
                />
              ))}
            </div>
          </div>
          
          {/* Error/Success messages */}
          {error && (
            <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}
          
          {success && (
            <div className="flex items-center justify-center gap-2 text-sm text-green-600 dark:text-green-400">
              <CheckCircle className="w-4 h-4" />
              Успешно! Перенаправляем...
            </div>
          )}
          
          {/* Resend section */}
          <div className="text-center">
            {canResend ? (
              <Button
                type="button"
                variant="link"
                onClick={handleResend}
                className="text-sm"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Отправить код повторно
              </Button>
            ) : (
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Clock className="w-4 h-4" />
                Отправить повторно через {resendTimer} сек
              </div>
            )}
          </div>
          
          {/* Demo hint for development */}
          {process.env.NODE_ENV === "development" && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-3 text-sm">
              <p className="font-medium text-yellow-800 dark:text-yellow-200">
                Тестовый режим
              </p>
              <p className="text-yellow-700 dark:text-yellow-300">
                Используйте код: 123456
              </p>
            </div>
          )}
        </CardContent>
        
        <CardFooter className="flex flex-col gap-3">
          <Button
            onClick={() => handleSubmit()}
            disabled={loading || success || code.join("").length !== 6}
            className="w-full"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Проверка...
              </>
            ) : success ? (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Успешно!
              </>
            ) : (
              "Подтвердить"
            )}
          </Button>
          
          <Button
            type="button"
            variant="ghost"
            onClick={() => router.push("/auth/login")}
            className="w-full"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Изменить номер
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}