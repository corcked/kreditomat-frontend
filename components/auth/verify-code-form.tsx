"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuth } from "@/contexts/auth-context"
import { ArrowLeft, AlertCircle, RefreshCw } from "lucide-react"
import { toast } from "sonner"

interface VerifyCodeFormProps {
  phoneNumber: string
  onSuccess: () => void
  onBack: () => void
  context?: string
}

export default function VerifyCodeForm({ phoneNumber, onSuccess, onBack, context }: VerifyCodeFormProps) {
  const { verify, login } = useAuth()
  const [code, setCode] = useState(["", "", "", "", "", ""])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [resendTimer, setResendTimer] = useState(60)
  const [canResend, setCanResend] = useState(false)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])
  
  useEffect(() => {
    inputRefs.current[0]?.focus()
  }, [])
  
  useEffect(() => {
    if (resendTimer > 0 && !canResend) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000)
      return () => clearTimeout(timer)
    } else if (resendTimer === 0) {
      setCanResend(true)
    }
  }, [resendTimer, canResend])
  
  const handleCodeChange = (index: number, value: string) => {
    if (value.length > 1) {
      const digits = value.split("").slice(0, 6)
      const newCode = [...code]
      digits.forEach((digit, i) => {
        if (index + i < 6 && /^\d$/.test(digit)) {
          newCode[index + i] = digit
        }
      })
      setCode(newCode)
      
      const filledIndex = index + digits.length - 1
      if (filledIndex < 5) {
        inputRefs.current[filledIndex + 1]?.focus()
      } else {
        inputRefs.current[5]?.focus()
      }
      
      if (newCode.every(d => d !== "")) {
        handleSubmit(newCode.join(""))
      }
      return
    }
    
    if (/^\d$/.test(value)) {
      const newCode = [...code]
      newCode[index] = value
      setCode(newCode)
      setError("")
      
      if (index < 5) {
        inputRefs.current[index + 1]?.focus()
      }
      
      if (newCode.every(d => d !== "")) {
        handleSubmit(newCode.join(""))
      }
    } else if (value === "") {
      const newCode = [...code]
      newCode[index] = ""
      setCode(newCode)
    }
  }
  
  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && code[index] === "" && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }
  
  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6)
    
    if (pastedData.length > 0) {
      const newCode = [...code]
      pastedData.split("").forEach((digit, i) => {
        if (i < 6) {
          newCode[i] = digit
        }
      })
      setCode(newCode)
      
      if (newCode.every(d => d !== "")) {
        handleSubmit(newCode.join(""))
      } else {
        const lastFilledIndex = pastedData.length - 1
        if (lastFilledIndex < 5) {
          inputRefs.current[lastFilledIndex + 1]?.focus()
        }
      }
    }
  }
  
  const handleSubmit = async (codeString?: string) => {
    const verificationCode = codeString || code.join("")
    
    if (verificationCode.length !== 6) {
      setError("Введите 6-значный код")
      return
    }
    
    setLoading(true)
    setError("")
    
    try {
      await verify(phoneNumber, verificationCode, context)
      toast.success("Авторизация успешна!")
      onSuccess()
    } catch (err: any) {
      setError(err.response?.data?.detail || "Неверный код")
      setCode(["", "", "", "", "", ""])
      inputRefs.current[0]?.focus()
    } finally {
      setLoading(false)
    }
  }
  
  const handleResend = async () => {
    if (!canResend) return
    
    setLoading(true)
    setError("")
    
    try {
      await login(phoneNumber, context)
      toast.success("Код отправлен повторно")
      setResendTimer(60)
      setCanResend(false)
      setCode(["", "", "", "", "", ""])
      inputRefs.current[0]?.focus()
    } catch (err: any) {
      setError("Ошибка при отправке кода")
    } finally {
      setLoading(false)
    }
  }
  
  const formatPhone = (phone: string) => {
    if (phone.startsWith("998")) {
      const number = phone.slice(3)
      return `+998 ${number.slice(0, 2)} ${number.slice(2, 5)}-${number.slice(5, 7)}-${number.slice(7, 9)}`
    }
    return phone
  }
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onBack}
          disabled={loading}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Назад
        </Button>
        <span className="text-sm text-muted-foreground">
          {formatPhone(phoneNumber)}
        </span>
      </div>
      
      <div className="space-y-2">
        <Label>Код подтверждения</Label>
        <p className="text-sm text-muted-foreground">
          Введите 6-значный код, отправленный на ваш номер
        </p>
        
        <div className="flex gap-2 justify-center">
          {code.map((digit, index) => (
            <Input
              key={index}
              ref={(el) => (inputRefs.current[index] = el)}
              type="text"
              inputMode="numeric"
              pattern="\d*"
              maxLength={6}
              value={digit}
              onChange={(e) => handleCodeChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={index === 0 ? handlePaste : undefined}
              className="w-12 h-12 text-center text-lg font-semibold"
              disabled={loading}
            />
          ))}
        </div>
      </div>
      
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <div className="flex flex-col items-center gap-2">
        <Button
          onClick={() => handleSubmit()}
          className="w-full"
          disabled={loading || code.some(d => d === "")}
        >
          {loading ? "Проверка..." : "Подтвердить"}
        </Button>
        
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleResend}
          disabled={!canResend || loading}
          className="text-sm"
        >
          {canResend ? (
            <>
              <RefreshCw className="h-3 w-3 mr-2" />
              Отправить код повторно
            </>
          ) : (
            `Отправить повторно через ${resendTimer}с`
          )}
        </Button>
      </div>
    </div>
  )
}