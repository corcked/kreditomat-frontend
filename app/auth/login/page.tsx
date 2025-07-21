"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { api } from "@/lib/api"
import { 
  Phone, 
  Shield, 
  ArrowRight,
  AlertCircle,
  Info,
  Sparkles
} from "lucide-react"
import Link from "next/link"

export default function LoginPage() {
  const router = useRouter()
  const [phoneNumber, setPhoneNumber] = useState("")
  const [agreed, setAgreed] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  
  const formatPhoneDisplay = (value: string) => {
    // Remove all non-digits
    const cleaned = value.replace(/\D/g, "")
    
    // Format as XX XXX-XX-XX
    if (cleaned.length <= 2) return cleaned
    if (cleaned.length <= 5) return `${cleaned.slice(0, 2)} ${cleaned.slice(2)}`
    if (cleaned.length <= 7) return `${cleaned.slice(0, 2)} ${cleaned.slice(2, 5)}-${cleaned.slice(5)}`
    return `${cleaned.slice(0, 2)} ${cleaned.slice(2, 5)}-${cleaned.slice(5, 7)}-${cleaned.slice(7, 9)}`
  }
  
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    const cleaned = value.replace(/\D/g, "")
    
    // Limit to 9 digits (without country code)
    if (cleaned.length <= 9) {
      setPhoneNumber(cleaned)
      setError("")
    }
  }
  
  const validatePhone = () => {
    if (phoneNumber.length !== 9) {
      setError("Введите 9-значный номер телефона")
      return false
    }
    
    // Check if starts with valid operator codes (90, 91, 93, 94, 95, 97, 98, 99, 33, 88)
    const validPrefixes = ["90", "91", "93", "94", "95", "97", "98", "99", "33", "88"]
    const prefix = phoneNumber.slice(0, 2)
    
    if (!validPrefixes.includes(prefix)) {
      setError("Неверный код оператора")
      return false
    }
    
    return true
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!agreed) {
      setError("Необходимо согласие с условиями")
      return
    }
    
    if (!validatePhone()) {
      return
    }
    
    setLoading(true)
    setError("")
    
    try {
      // Add country code
      const fullNumber = `998${phoneNumber}`
      
      await api.auth.request({ phone_number: fullNumber })
      
      // Redirect to verification page
      router.push(`/auth/verify?phone=${fullNumber}`)
    } catch (err: any) {
      setError(err.response?.data?.detail || "Ошибка при отправке кода")
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Phone className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Вход в систему</CardTitle>
          <CardDescription>
            Введите ваш номер телефона для получения кода подтверждения
          </CardDescription>
        </CardHeader>
        
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            {/* Phone input */}
            <div className="space-y-2">
              <Label htmlFor="phone">Номер телефона</Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <span className="text-muted-foreground">+998</span>
                </div>
                <Input
                  id="phone"
                  type="tel"
                  inputMode="numeric"
                  placeholder="XX XXX-XX-XX"
                  value={formatPhoneDisplay(phoneNumber)}
                  onChange={handlePhoneChange}
                  className="pl-14"
                  autoFocus
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Мы отправим SMS с кодом подтверждения
              </p>
            </div>
            
            {/* Agreement checkbox */}
            <div className="flex items-start space-x-2">
              <Checkbox
                id="agreement"
                checked={agreed}
                onCheckedChange={(checked) => setAgreed(checked as boolean)}
              />
              <div className="space-y-1 leading-none">
                <label
                  htmlFor="agreement"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Я согласен с условиями
                </label>
                <p className="text-xs text-muted-foreground">
                  Нажимая кнопку, вы соглашаетесь с{" "}
                  <Link href="/terms" className="underline hover:text-primary">
                    условиями использования
                  </Link>{" "}
                  и{" "}
                  <Link href="/privacy" className="underline hover:text-primary">
                    политикой конфиденциальности
                  </Link>
                </p>
              </div>
            </div>
            
            {/* Error message */}
            {error && (
              <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}
            
            {/* Info section */}
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 space-y-2">
              <div className="flex items-start gap-2">
                <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                    Безопасная авторизация
                  </p>
                  <p className="text-xs text-blue-700 dark:text-blue-300">
                    Используем Telegram Gateway для защиты ваших данных
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
          
          <CardFooter className="flex flex-col gap-3">
            <Button
              type="submit"
              disabled={loading || !agreed || phoneNumber.length !== 9}
              className="w-full"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Отправка...
                </>
              ) : (
                <>
                  Получить код
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
            
            {/* First time bonus */}
            <div className="text-center">
              <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                <Sparkles className="w-4 h-4 text-yellow-500" />
                <span>Новым клиентам — первый займ без процентов!</span>
              </div>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}