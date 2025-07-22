"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuth } from "@/contexts/auth-context"
import { Phone, AlertCircle } from "lucide-react"
import Link from "next/link"

interface PhoneAuthFormProps {
  onSubmit: (phoneNumber: string) => void
  isLoading?: boolean
  context?: string
}

export default function PhoneAuthForm({ onSubmit, isLoading = false, context }: PhoneAuthFormProps) {
  const { login } = useAuth()
  const [phoneNumber, setPhoneNumber] = useState("")
  const [agreed, setAgreed] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  
  const formatPhoneDisplay = (value: string) => {
    const cleaned = value.replace(/\D/g, "")
    
    if (cleaned.length <= 2) return cleaned
    if (cleaned.length <= 5) return `${cleaned.slice(0, 2)} ${cleaned.slice(2)}`
    if (cleaned.length <= 7) return `${cleaned.slice(0, 2)} ${cleaned.slice(2, 5)}-${cleaned.slice(5)}`
    return `${cleaned.slice(0, 2)} ${cleaned.slice(2, 5)}-${cleaned.slice(5, 7)}-${cleaned.slice(7, 9)}`
  }
  
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    const cleaned = value.replace(/\D/g, "")
    
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
      const fullNumber = `998${phoneNumber}`
      await login(fullNumber, context)
      onSubmit(fullNumber)
    } catch (err: any) {
      setError(err.response?.data?.detail || "Ошибка при отправке кода")
    } finally {
      setLoading(false)
    }
  }
  
  const isSubmitDisabled = loading || isLoading || !agreed || phoneNumber.length !== 9
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="phone">Номер телефона</Label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <span className="ml-2 text-muted-foreground">+998</span>
          </div>
          <Input
            id="phone"
            type="tel"
            placeholder="XX XXX-XX-XX"
            value={formatPhoneDisplay(phoneNumber)}
            onChange={handlePhoneChange}
            className="pl-20"
            autoComplete="tel"
            disabled={loading || isLoading}
          />
        </div>
      </div>
      
      <div className="flex items-start space-x-2">
        <Checkbox
          id="terms"
          checked={agreed}
          onCheckedChange={(checked) => setAgreed(checked as boolean)}
          disabled={loading || isLoading}
        />
        <label
          htmlFor="terms"
          className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          Я согласен с{' '}
          <Link href="/terms" className="text-primary underline hover:no-underline">
            условиями использования
          </Link>{' '}
          и{' '}
          <Link href="/privacy" className="text-primary underline hover:no-underline">
            политикой конфиденциальности
          </Link>
        </label>
      </div>
      
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <Button 
        type="submit" 
        className="w-full" 
        disabled={isSubmitDisabled}
      >
        {loading || isLoading ? "Отправка..." : "Получить код"}
      </Button>
    </form>
  )
}