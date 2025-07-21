"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { api } from "@/lib/api"
import { getToken } from "@/lib/auth"
import { 
  ArrowRight,
  ArrowLeft,
  User,
  Briefcase,
  Home,
  Phone,
  Mail,
  Calendar,
  CreditCard,
  Building,
  MapPin,
  Users,
  AlertCircle,
  Info,
  CheckCircle,
  RefreshCw
} from "lucide-react"

interface PersonalData {
  full_name: string
  birth_date: string
  passport_series: string
  passport_number: string
  passport_issued_by: string
  passport_issue_date: string
  pinfl: string
  registration_address: string
  actual_address: string
  same_address: boolean
  
  workplace: string
  position: string
  work_experience_months: number
  official_income: boolean
  
  marital_status: "single" | "married" | "divorced" | "widowed"
  children_count: number
  
  contact_person_name: string
  contact_person_phone: string
  contact_person_relation: string
  
  additional_phone?: string
  email?: string
}

const initialData: PersonalData = {
  full_name: "",
  birth_date: "",
  passport_series: "",
  passport_number: "",
  passport_issued_by: "",
  passport_issue_date: "",
  pinfl: "",
  registration_address: "",
  actual_address: "",
  same_address: false,
  
  workplace: "",
  position: "",
  work_experience_months: 0,
  official_income: false,
  
  marital_status: "single",
  children_count: 0,
  
  contact_person_name: "",
  contact_person_phone: "",
  contact_person_relation: "",
  
  additional_phone: "",
  email: ""
}

export default function PersonalDataPage() {
  const router = useRouter()
  const [formData, setFormData] = useState<PersonalData>(initialData)
  const [errors, setErrors] = useState<Partial<Record<keyof PersonalData, string>>>({})
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [step, setStep] = useState(1) // 1: Personal, 2: Work, 3: Contacts
  
  const loadPersonalData = useCallback(async () => {
    setLoading(true)
    try {
      const data = await api.personalData.get()
      if (data) {
        setFormData({
          ...initialData,
          ...data,
          same_address: data.actual_address === data.registration_address
        })
      }
    } catch (err) {
      // No existing data, use defaults
    } finally {
      setLoading(false)
    }
  }, [])
  
  // Check authentication and load existing data
  useEffect(() => {
    // Skip during SSG/SSR
    if (typeof window === 'undefined') return
    
    const token = getToken()
    if (!token) {
      router.push("/auth/login")
      return
    }
    
    // Check if we have application data
    const appData = sessionStorage.getItem("applicationData")
    if (!appData) {
      router.push("/application/new")
      return
    }
    
    // Load existing personal data
    loadPersonalData()
  }, [router, loadPersonalData])
  
  const validateStep = (stepNumber: number): boolean => {
    const newErrors: Partial<Record<keyof PersonalData, string>> = {}
    
    if (stepNumber === 1) {
      // Personal info validation
      if (!formData.full_name.trim()) {
        newErrors.full_name = "Введите ФИО"
      }
      if (!formData.birth_date) {
        newErrors.birth_date = "Введите дату рождения"
      } else {
        const age = new Date().getFullYear() - new Date(formData.birth_date).getFullYear()
        if (age < 18 || age > 75) {
          newErrors.birth_date = "Возраст должен быть от 18 до 75 лет"
        }
      }
      if (!formData.passport_series || formData.passport_series.length !== 2) {
        newErrors.passport_series = "Введите серию паспорта (2 буквы)"
      }
      if (!formData.passport_number || formData.passport_number.length !== 7) {
        newErrors.passport_number = "Введите номер паспорта (7 цифр)"
      }
      if (!formData.passport_issued_by.trim()) {
        newErrors.passport_issued_by = "Укажите кем выдан паспорт"
      }
      if (!formData.passport_issue_date) {
        newErrors.passport_issue_date = "Введите дату выдачи паспорта"
      }
      if (!formData.pinfl || formData.pinfl.length !== 14) {
        newErrors.pinfl = "Введите ПИНФЛ (14 цифр)"
      }
      if (!formData.registration_address.trim()) {
        newErrors.registration_address = "Введите адрес прописки"
      }
      if (!formData.same_address && !formData.actual_address.trim()) {
        newErrors.actual_address = "Введите фактический адрес"
      }
    } else if (stepNumber === 2) {
      // Work info validation
      if (!formData.workplace.trim()) {
        newErrors.workplace = "Укажите место работы"
      }
      if (!formData.position.trim()) {
        newErrors.position = "Укажите должность"
      }
      if (formData.work_experience_months < 3) {
        newErrors.work_experience_months = "Минимальный стаж - 3 месяца"
      }
    } else if (stepNumber === 3) {
      // Contact info validation
      if (!formData.contact_person_name.trim()) {
        newErrors.contact_person_name = "Введите имя контактного лица"
      }
      if (!formData.contact_person_phone || formData.contact_person_phone.length < 9) {
        newErrors.contact_person_phone = "Введите номер телефона"
      }
      if (!formData.contact_person_relation.trim()) {
        newErrors.contact_person_relation = "Укажите кем приходится"
      }
      if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = "Неверный формат email"
      }
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }
  
  const handleNext = () => {
    if (validateStep(step)) {
      setStep(step + 1)
    }
  }
  
  const handlePrevious = () => {
    setStep(step - 1)
  }
  
  const handleSubmit = async () => {
    if (!validateStep(3)) return
    
    setSaving(true)
    setErrors({})
    
    try {
      // Save personal data
      const dataToSave = {
        ...formData,
        actual_address: formData.same_address ? formData.registration_address : formData.actual_address
      }
      
      await api.personalData.createOrUpdate(dataToSave)
      
      // Get application data
      const appData = JSON.parse(sessionStorage.getItem("applicationData") || "{}")
      
      // Create application
      const application = await api.applications.create({
        amount: appData.amount,
        term: appData.term,
        purpose: "personal"
      })
      
      // Store application ID
      sessionStorage.setItem("applicationId", application.id)
      
      // Redirect to offers page
      router.push("/application/offers")
    } catch (err: any) {
      setErrors({ full_name: err.response?.data?.detail || "Ошибка при сохранении данных" })
    } finally {
      setSaving(false)
    }
  }
  
  const formatPhoneInput = (value: string) => {
    const cleaned = value.replace(/\D/g, "")
    if (cleaned.length <= 2) return cleaned
    if (cleaned.length <= 5) return `${cleaned.slice(0, 2)} ${cleaned.slice(2)}`
    if (cleaned.length <= 7) return `${cleaned.slice(0, 2)} ${cleaned.slice(2, 5)}-${cleaned.slice(5)}`
    return `${cleaned.slice(0, 2)} ${cleaned.slice(2, 5)}-${cleaned.slice(5, 7)}-${cleaned.slice(7, 9)}`
  }
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-64">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center space-y-4">
              <RefreshCw className="w-8 h-8 animate-spin text-primary" />
              <p className="text-sm font-medium">Загрузка данных...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container max-w-4xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Персональные данные</h1>
          <p className="text-muted-foreground">
            Заполните информацию для оформления заявки
          </p>
        </div>
        
        {/* Progress indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-2">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                <CheckCircle className="w-5 h-5" />
              </div>
              <span className="ml-2 text-sm font-medium">Параметры займа</span>
            </div>
            <div className="w-8 h-0.5 bg-primary" />
            <div className="flex items-center">
              <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                2
              </div>
              <span className="ml-2 text-sm font-medium">Личные данные</span>
            </div>
            <div className="w-8 h-0.5 bg-gray-300 dark:bg-gray-700" />
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gray-300 dark:bg-gray-700 rounded-full flex items-center justify-center text-sm font-medium">
                3
              </div>
              <span className="ml-2 text-sm text-muted-foreground">Предложения</span>
            </div>
          </div>
        </div>
        
        {/* Step indicator */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setStep(1)}
              className={`flex-1 py-2 text-center text-sm font-medium border-b-2 transition-colors ${
                step === 1 
                  ? "border-primary text-primary" 
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <User className="w-4 h-4" />
                Личная информация
              </div>
            </button>
            <button
              onClick={() => setStep(2)}
              disabled={!validateStep(1)}
              className={`flex-1 py-2 text-center text-sm font-medium border-b-2 transition-colors ${
                step === 2 
                  ? "border-primary text-primary" 
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <Briefcase className="w-4 h-4" />
                Работа
              </div>
            </button>
            <button
              onClick={() => setStep(3)}
              disabled={!validateStep(1) || !validateStep(2)}
              className={`flex-1 py-2 text-center text-sm font-medium border-b-2 transition-colors ${
                step === 3 
                  ? "border-primary text-primary" 
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <Phone className="w-4 h-4" />
                Контакты
              </div>
            </button>
          </div>
        </div>
        
        <Card>
          <CardContent className="pt-6">
            {/* Step 1: Personal Information */}
            {step === 1 && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="full_name">ФИО полностью</Label>
                  <Input
                    id="full_name"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    placeholder="Иванов Иван Иванович"
                  />
                  {errors.full_name && (
                    <p className="text-sm text-red-500 mt-1">{errors.full_name}</p>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="birth_date">Дата рождения</Label>
                    <Input
                      id="birth_date"
                      type="date"
                      value={formData.birth_date}
                      onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
                    />
                    {errors.birth_date && (
                      <p className="text-sm text-red-500 mt-1">{errors.birth_date}</p>
                    )}
                  </div>
                  
                  <div>
                    <Label htmlFor="pinfl">ПИНФЛ</Label>
                    <Input
                      id="pinfl"
                      value={formData.pinfl}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, "")
                        if (value.length <= 14) {
                          setFormData({ ...formData, pinfl: value })
                        }
                      }}
                      placeholder="14 цифр"
                      maxLength={14}
                    />
                    {errors.pinfl && (
                      <p className="text-sm text-red-500 mt-1">{errors.pinfl}</p>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <Label htmlFor="passport_series">Серия</Label>
                      <Input
                        id="passport_series"
                        value={formData.passport_series}
                        onChange={(e) => {
                          const value = e.target.value.toUpperCase().replace(/[^A-Z]/g, "")
                          if (value.length <= 2) {
                            setFormData({ ...formData, passport_series: value })
                          }
                        }}
                        placeholder="AA"
                        maxLength={2}
                      />
                    </div>
                    <div className="col-span-2">
                      <Label htmlFor="passport_number">Номер паспорта</Label>
                      <Input
                        id="passport_number"
                        value={formData.passport_number}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, "")
                          if (value.length <= 7) {
                            setFormData({ ...formData, passport_number: value })
                          }
                        }}
                        placeholder="1234567"
                        maxLength={7}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="passport_issue_date">Дата выдачи</Label>
                    <Input
                      id="passport_issue_date"
                      type="date"
                      value={formData.passport_issue_date}
                      onChange={(e) => setFormData({ ...formData, passport_issue_date: e.target.value })}
                    />
                    {errors.passport_issue_date && (
                      <p className="text-sm text-red-500 mt-1">{errors.passport_issue_date}</p>
                    )}
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="passport_issued_by">Кем выдан</Label>
                  <Input
                    id="passport_issued_by"
                    value={formData.passport_issued_by}
                    onChange={(e) => setFormData({ ...formData, passport_issued_by: e.target.value })}
                    placeholder="ИИБ Юнусабадского района"
                  />
                  {errors.passport_issued_by && (
                    <p className="text-sm text-red-500 mt-1">{errors.passport_issued_by}</p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="registration_address">Адрес прописки</Label>
                  <Input
                    id="registration_address"
                    value={formData.registration_address}
                    onChange={(e) => setFormData({ ...formData, registration_address: e.target.value })}
                    placeholder="г. Ташкент, ул. Амира Темура, д. 1, кв. 1"
                  />
                  {errors.registration_address && (
                    <p className="text-sm text-red-500 mt-1">{errors.registration_address}</p>
                  )}
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="same_address"
                    checked={formData.same_address}
                    onCheckedChange={(checked) => setFormData({ ...formData, same_address: checked as boolean })}
                  />
                  <label
                    htmlFor="same_address"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Фактический адрес совпадает с адресом прописки
                  </label>
                </div>
                
                {!formData.same_address && (
                  <div>
                    <Label htmlFor="actual_address">Фактический адрес</Label>
                    <Input
                      id="actual_address"
                      value={formData.actual_address}
                      onChange={(e) => setFormData({ ...formData, actual_address: e.target.value })}
                      placeholder="г. Ташкент, ул. Амира Темура, д. 1, кв. 1"
                    />
                    {errors.actual_address && (
                      <p className="text-sm text-red-500 mt-1">{errors.actual_address}</p>
                    )}
                  </div>
                )}
              </div>
            )}
            
            {/* Step 2: Work Information */}
            {step === 2 && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="workplace">Место работы</Label>
                  <Input
                    id="workplace"
                    value={formData.workplace}
                    onChange={(e) => setFormData({ ...formData, workplace: e.target.value })}
                    placeholder="ООО «Компания»"
                  />
                  {errors.workplace && (
                    <p className="text-sm text-red-500 mt-1">{errors.workplace}</p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="position">Должность</Label>
                  <Input
                    id="position"
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                    placeholder="Менеджер"
                  />
                  {errors.position && (
                    <p className="text-sm text-red-500 mt-1">{errors.position}</p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="work_experience">Стаж работы (месяцев)</Label>
                  <Input
                    id="work_experience"
                    type="number"
                    value={formData.work_experience_months}
                    onChange={(e) => setFormData({ ...formData, work_experience_months: parseInt(e.target.value) || 0 })}
                    min={0}
                  />
                  {errors.work_experience_months && (
                    <p className="text-sm text-red-500 mt-1">{errors.work_experience_months}</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    Минимальный стаж для получения займа - 3 месяца
                  </p>
                </div>
                
                <div>
                  <Label>Тип дохода</Label>
                  <RadioGroup
                    value={formData.official_income ? "official" : "unofficial"}
                    onValueChange={(value) => setFormData({ ...formData, official_income: value === "official" })}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="official" id="official" />
                      <label htmlFor="official" className="text-sm font-medium">
                        Официальный (белая зарплата)
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="unofficial" id="unofficial" />
                      <label htmlFor="unofficial" className="text-sm font-medium">
                        Неофициальный (серая зарплата)
                      </label>
                    </div>
                  </RadioGroup>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="marital_status">Семейное положение</Label>
                    <Select
                      value={formData.marital_status}
                      onValueChange={(value: any) => setFormData({ ...formData, marital_status: value })}
                    >
                      <SelectTrigger id="marital_status">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="single">Холост/Не замужем</SelectItem>
                        <SelectItem value="married">Женат/Замужем</SelectItem>
                        <SelectItem value="divorced">Разведен(а)</SelectItem>
                        <SelectItem value="widowed">Вдовец/Вдова</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="children_count">Количество детей</Label>
                    <Input
                      id="children_count"
                      type="number"
                      value={formData.children_count}
                      onChange={(e) => setFormData({ ...formData, children_count: parseInt(e.target.value) || 0 })}
                      min={0}
                      max={10}
                    />
                  </div>
                </div>
                
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                        Информация о доходах
                      </p>
                      <p className="text-xs text-blue-700 dark:text-blue-300">
                        Банки учитывают тип дохода при рассмотрении заявки. Официальный доход увеличивает шансы на одобрение.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Step 3: Contact Information */}
            {step === 3 && (
              <div className="space-y-4">
                <div>
                  <Label className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Контактное лицо
                  </Label>
                  <p className="text-sm text-muted-foreground mb-3">
                    Укажите близкого человека, с которым банк сможет связаться при необходимости
                  </p>
                </div>
                
                <div>
                  <Label htmlFor="contact_person_name">ФИО контактного лица</Label>
                  <Input
                    id="contact_person_name"
                    value={formData.contact_person_name}
                    onChange={(e) => setFormData({ ...formData, contact_person_name: e.target.value })}
                    placeholder="Иванова Мария Петровна"
                  />
                  {errors.contact_person_name && (
                    <p className="text-sm text-red-500 mt-1">{errors.contact_person_name}</p>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="contact_person_phone">Номер телефона</Label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <span className="text-muted-foreground">+998</span>
                      </div>
                      <Input
                        id="contact_person_phone"
                        type="tel"
                        value={formatPhoneInput(formData.contact_person_phone)}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, "")
                          if (value.length <= 9) {
                            setFormData({ ...formData, contact_person_phone: value })
                          }
                        }}
                        className="pl-14"
                        placeholder="XX XXX-XX-XX"
                      />
                    </div>
                    {errors.contact_person_phone && (
                      <p className="text-sm text-red-500 mt-1">{errors.contact_person_phone}</p>
                    )}
                  </div>
                  
                  <div>
                    <Label htmlFor="contact_person_relation">Кем приходится</Label>
                    <Select
                      value={formData.contact_person_relation}
                      onValueChange={(value) => setFormData({ ...formData, contact_person_relation: value })}
                    >
                      <SelectTrigger id="contact_person_relation">
                        <SelectValue placeholder="Выберите..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Супруг(а)">Супруг(а)</SelectItem>
                        <SelectItem value="Родитель">Родитель</SelectItem>
                        <SelectItem value="Ребенок">Ребенок</SelectItem>
                        <SelectItem value="Брат/Сестра">Брат/Сестра</SelectItem>
                        <SelectItem value="Друг">Друг</SelectItem>
                        <SelectItem value="Коллега">Коллега</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.contact_person_relation && (
                      <p className="text-sm text-red-500 mt-1">{errors.contact_person_relation}</p>
                    )}
                  </div>
                </div>
                
                <div className="border-t pt-4">
                  <Label>Дополнительные контакты (необязательно)</Label>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="additional_phone">Дополнительный телефон</Label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <span className="text-muted-foreground">+998</span>
                      </div>
                      <Input
                        id="additional_phone"
                        type="tel"
                        value={formatPhoneInput(formData.additional_phone || "")}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, "")
                          if (value.length <= 9) {
                            setFormData({ ...formData, additional_phone: value })
                          }
                        }}
                        className="pl-14"
                        placeholder="XX XXX-XX-XX"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="example@mail.com"
                    />
                    {errors.email && (
                      <p className="text-sm text-red-500 mt-1">{errors.email}</p>
                    )}
                  </div>
                </div>
                
                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5" />
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-green-900 dark:text-green-100">
                        Почти готово!
                      </p>
                      <p className="text-xs text-green-700 dark:text-green-300">
                        После заполнения всех данных мы подберем для вас лучшие предложения от банков.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
          
          <CardFooter className="flex justify-between">
            {step > 1 ? (
              <Button
                type="button"
                variant="outline"
                onClick={handlePrevious}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Назад
              </Button>
            ) : (
              <Button
                type="button"
                variant="ghost"
                onClick={() => router.push("/application/new")}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Вернуться
              </Button>
            )}
            
            {step < 3 ? (
              <Button onClick={handleNext}>
                Далее
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button 
                onClick={handleSubmit}
                disabled={saving}
              >
                {saving ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Сохранение...
                  </>
                ) : (
                  <>
                    Получить предложения
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}