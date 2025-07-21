"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import BankCard, { BankOffer } from "@/components/ui/bank-card"
import ScoringGauge from "@/components/ui/scoring-gauge"
import PDNIndicator from "@/components/ui/pdn-indicator"
import { api } from "@/lib/api"
import { getToken } from "@/lib/auth"
import { 
  CheckCircle,
  Filter,
  SortAsc,
  Download,
  Share2,
  RefreshCw,
  TrendingUp,
  Award,
  Clock,
  AlertCircle,
  Search,
  X,
  Sparkles,
  Shield,
  Calculator,
  ArrowUpDown
} from "lucide-react"

interface ApplicationDetails {
  id: string
  amount: number
  term: number
  status: string
  created_at: string
  scoring_result: {
    score: number
    category: string
    factors: Record<string, number>
  }
  pdn_calculation: {
    pdn: number
    risk_level: string
    monthly_income: number
    monthly_expenses: number
    credit_payments: number
  }
  matched_offers: BankOffer[]
  device_info: {
    device_type: string
    is_mobile: boolean
  }
}

type SortOption = "rating" | "rate" | "amount" | "decision_time"
type FilterOption = {
  noIncomeProof?: boolean
  noCreditHistory?: boolean
  quickDecision?: boolean
  noInsurance?: boolean
}

export default function OffersPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [application, setApplication] = useState<ApplicationDetails | null>(null)
  const [filteredOffers, setFilteredOffers] = useState<BankOffer[]>([])
  const [selectedOffer, setSelectedOffer] = useState<BankOffer | null>(null)
  const [sortBy, setSortBy] = useState<SortOption>("rating")
  const [filters, setFilters] = useState<FilterOption>({})
  const [searchTerm, setSearchTerm] = useState("")
  const [showFilters, setShowFilters] = useState(false)
  
  // Check authentication and load application
  useEffect(() => {
    const token = getToken()
    if (!token) {
      router.push("/auth/login")
      return
    }
    
    const applicationId = sessionStorage.getItem("applicationId")
    if (!applicationId) {
      router.push("/application/new")
      return
    }
    
    loadApplication(applicationId)
  }, [router]) // eslint-disable-line react-hooks/exhaustive-deps
  
  const loadApplication = async (applicationId: string) => {
    setLoading(true)
    try {
      // Get application details with offers
      const appData = await api.applications.get(applicationId)
      
      // Get scoring result
      const scoring = await api.applications.getScoring(applicationId)
      
      // Get matched offers
      const offers = await api.applications.getOffers(applicationId)
      
      setApplication({
        ...appData,
        scoring_result: scoring,
        matched_offers: offers
      })
      
      setFilteredOffers(offers)
    } catch (err) {
      console.error("Failed to load application:", err)
      router.push("/application/new")
    } finally {
      setLoading(false)
    }
  }
  
  // Filter and sort offers
  useEffect(() => {
    if (!application) return
    
    let filtered = [...application.matched_offers]
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(offer =>
        offer.bank_name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    
    // Apply filters
    if (filters.noIncomeProof) {
      filtered = filtered.filter(offer => !offer.income_proof_required)
    }
    if (filters.noCreditHistory) {
      filtered = filtered.filter(offer => !offer.consider_credit_history)
    }
    if (filters.quickDecision) {
      filtered = filtered.filter(offer => offer.decision_time_minutes <= 15)
    }
    if (filters.noInsurance) {
      filtered = filtered.filter(offer => !offer.insurance_required)
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "rating":
          return b.rating - a.rating
        case "rate":
          return a.annual_rate - b.annual_rate
        case "amount":
          return b.max_amount - a.max_amount
        case "decision_time":
          return a.decision_time_minutes - b.decision_time_minutes
        default:
          return 0
      }
    })
    
    setFilteredOffers(filtered)
  }, [application, searchTerm, filters, sortBy])
  
  const handleSelectOffer = (offer: BankOffer) => {
    setSelectedOffer(offer)
    // In real app, this would redirect to bank's application page
    alert(`Переход на страницу банка: ${offer.bank_name}`)
  }
  
  const handleCalculate = (offer: BankOffer) => {
    // Open calculator modal or redirect
    router.push(`/calculator?bank=${offer.id}&amount=${application?.amount}&term=${application?.term}`)
  }
  
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: "Мои предложения по займу",
        text: `Мне одобрено ${filteredOffers.length} предложений на сумму ${application?.amount} сум`,
        url: window.location.href
      })
    } else {
      // Copy to clipboard
      navigator.clipboard.writeText(window.location.href)
      alert("Ссылка скопирована!")
    }
  }
  
  const handleDownloadReport = async () => {
    try {
      const report = await api.applications.downloadReport(application!.id)
      // Handle file download
      const blob = new Blob([report], { type: 'application/pdf' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `loan-offers-${application!.id}.pdf`
      a.click()
    } catch (err) {
      alert("Ошибка при скачивании отчета")
    }
  }
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-64">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center space-y-4">
              <RefreshCw className="w-8 h-8 animate-spin text-primary" />
              <p className="text-sm font-medium">Подбираем предложения...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }
  
  if (!application || filteredOffers.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-yellow-500" />
              Нет подходящих предложений
            </CardTitle>
            <CardDescription>
              К сожалению, по вашим параметрам не найдено подходящих предложений
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Попробуйте изменить параметры займа или улучшить кредитную историю
            </p>
          </CardContent>
          <CardFooter>
            <Button onClick={() => router.push("/application/new")} className="w-full">
              Изменить параметры
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container max-w-7xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">Ваши предложения</h1>
              <p className="text-muted-foreground">
                Найдено {filteredOffers.length} предложений на сумму{" "}
                {new Intl.NumberFormat("ru-RU").format(application.amount)} сум
              </p>
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleShare}>
                <Share2 className="w-4 h-4 mr-2" />
                Поделиться
              </Button>
              <Button variant="outline" size="sm" onClick={handleDownloadReport}>
                <Download className="w-4 h-4 mr-2" />
                Скачать отчет
              </Button>
            </div>
          </div>
          
          {/* Progress indicator */}
          <div className="flex items-center justify-center space-x-2">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                <CheckCircle className="w-5 h-5" />
              </div>
              <span className="ml-2 text-sm font-medium">Параметры займа</span>
            </div>
            <div className="w-8 h-0.5 bg-green-500" />
            <div className="flex items-center">
              <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                <CheckCircle className="w-5 h-5" />
              </div>
              <span className="ml-2 text-sm font-medium">Личные данные</span>
            </div>
            <div className="w-8 h-0.5 bg-green-500" />
            <div className="flex items-center">
              <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                3
              </div>
              <span className="ml-2 text-sm font-medium">Предложения</span>
            </div>
          </div>
        </div>
        
        {/* Summary cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Scoring result */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Award className="w-4 h-4" />
                Ваш кредитный рейтинг
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScoringGauge
                score={application.scoring_result.score}
                size="sm"
                showDetails={false}
              />
            </CardContent>
          </Card>
          
          {/* PDN result */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Долговая нагрузка
              </CardTitle>
            </CardHeader>
            <CardContent>
              <PDNIndicator
                pdn={application.pdn_calculation.pdn}
                monthlyIncome={application.pdn_calculation.monthly_income}
                monthlyPayment={application.pdn_calculation.credit_payments || 0}
                otherPayments={0}
                showDetails={false}
              />
            </CardContent>
          </Card>
          
          {/* Best offer highlight */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Лучшее предложение
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm font-medium">{filteredOffers[0].bank_name}</p>
                <p className="text-2xl font-bold text-primary">
                  от {(filteredOffers[0].annual_rate * 100).toFixed(1)}%
                </p>
                <p className="text-xs text-muted-foreground">годовых</p>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Filters and search */}
        <div className="mb-6 space-y-4">
          <div className="flex gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                type="search"
                placeholder="Поиск по названию банка..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            {/* Sort */}
            <Select value={sortBy} onValueChange={(value: SortOption) => setSortBy(value)}>
              <SelectTrigger className="w-[200px]">
                <ArrowUpDown className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rating">По рейтингу</SelectItem>
                <SelectItem value="rate">По ставке</SelectItem>
                <SelectItem value="amount">По сумме</SelectItem>
                <SelectItem value="decision_time">По скорости</SelectItem>
              </SelectContent>
            </Select>
            
            {/* Filter toggle */}
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="relative"
            >
              <Filter className="w-4 h-4 mr-2" />
              Фильтры
              {Object.values(filters).some(v => v) && (
                <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center">
                  {Object.values(filters).filter(v => v).length}
                </Badge>
              )}
            </Button>
          </div>
          
          {/* Filter options */}
          {showFilters && (
            <Card>
              <CardContent className="pt-4">
                <div className="flex flex-wrap gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <Checkbox
                      checked={filters.noIncomeProof}
                      onCheckedChange={(checked) => 
                        setFilters({ ...filters, noIncomeProof: checked as boolean })
                      }
                    />
                    <span className="text-sm">Без справки о доходах</span>
                  </label>
                  
                  <label className="flex items-center gap-2 cursor-pointer">
                    <Checkbox
                      checked={filters.noCreditHistory}
                      onCheckedChange={(checked) => 
                        setFilters({ ...filters, noCreditHistory: checked as boolean })
                      }
                    />
                    <span className="text-sm">Без кредитной истории</span>
                  </label>
                  
                  <label className="flex items-center gap-2 cursor-pointer">
                    <Checkbox
                      checked={filters.quickDecision}
                      onCheckedChange={(checked) => 
                        setFilters({ ...filters, quickDecision: checked as boolean })
                      }
                    />
                    <span className="text-sm">Быстрое решение (до 15 мин)</span>
                  </label>
                  
                  <label className="flex items-center gap-2 cursor-pointer">
                    <Checkbox
                      checked={filters.noInsurance}
                      onCheckedChange={(checked) => 
                        setFilters({ ...filters, noInsurance: checked as boolean })
                      }
                    />
                    <span className="text-sm">Без страховки</span>
                  </label>
                </div>
                
                {Object.values(filters).some(v => v) && (
                  <Button
                    variant="link"
                    size="sm"
                    onClick={() => setFilters({})}
                    className="mt-2"
                  >
                    <X className="w-4 h-4 mr-1" />
                    Сбросить фильтры
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </div>
        
        {/* Offers tabs */}
        <Tabs defaultValue="all" className="space-y-4">
          <TabsList>
            <TabsTrigger value="all">
              Все предложения ({filteredOffers.length})
            </TabsTrigger>
            <TabsTrigger value="recommended">
              Рекомендуемые ({filteredOffers.filter(o => o.rating >= 4.5).length})
            </TabsTrigger>
            <TabsTrigger value="special">
              Спецпредложения ({filteredOffers.filter(o => o.special_offer).length})
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="space-y-4">
            {filteredOffers.map((offer, index) => (
              <BankCard
                key={offer.id}
                offer={offer}
                featured={index === 0}
                userScore={application.scoring_result.score}
                userPDN={application.pdn_calculation.pdn}
                requestedAmount={application.amount}
                requestedTerm={application.term}
                onSelect={handleSelectOffer}
                onCalculate={handleCalculate}
              />
            ))}
          </TabsContent>
          
          <TabsContent value="recommended" className="space-y-4">
            {filteredOffers
              .filter(o => o.rating >= 4.5)
              .map((offer) => (
                <BankCard
                  key={offer.id}
                  offer={offer}
                  userScore={application.scoring_result.score}
                  userPDN={application.pdn_calculation.pdn}
                  requestedAmount={application.amount}
                  requestedTerm={application.term}
                  onSelect={handleSelectOffer}
                  onCalculate={handleCalculate}
                />
              ))}
          </TabsContent>
          
          <TabsContent value="special" className="space-y-4">
            {filteredOffers
              .filter(o => o.special_offer)
              .map((offer) => (
                <BankCard
                  key={offer.id}
                  offer={offer}
                  userScore={application.scoring_result.score}
                  userPDN={application.pdn_calculation.pdn}
                  requestedAmount={application.amount}
                  requestedTerm={application.term}
                  onSelect={handleSelectOffer}
                  onCalculate={handleCalculate}
                />
              ))}
          </TabsContent>
        </Tabs>
        
        {/* Tips section */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Полезные советы
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                Сравните не только процентные ставки, но и дополнительные комиссии
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                Обратите внимание на требования к страхованию — это может увеличить стоимость займа
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                Выбирайте банки с быстрым решением, если вам срочно нужны деньги
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                Подавайте заявки в несколько банков одновременно для увеличения шансов
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// Import Select components (assuming they're not imported in the actual implementation)
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"