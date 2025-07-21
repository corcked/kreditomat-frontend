"use client"

import { useState } from "react"
import BankCard, { BankOffer } from "./bank-card"
import { Button } from "./button"
import { Input } from "./input"
import { Label } from "./label"

// Mock bank offers
const mockOffers: BankOffer[] = [
  {
    id: "1",
    bank_name: "Ипотека Банк",
    min_amount: 1000000,
    max_amount: 50000000,
    min_term_months: 3,
    max_term_months: 36,
    annual_rate: 0.28,
    monthly_rate: 0.28 / 12,
    processing_fee: 0.01,
    insurance_required: false,
    min_age: 18,
    max_age: 70,
    income_proof_required: false,
    consider_credit_history: false,
    decision_time_minutes: 10,
    max_pdn: 80,
    special_offer: "Первый займ без %",
    rating: 4.8,
    is_active: true
  },
  {
    id: "2",
    bank_name: "Капитал Банк",
    min_amount: 500000,
    max_amount: 100000000,
    min_term_months: 6,
    max_term_months: 60,
    annual_rate: 0.24,
    monthly_rate: 0.24 / 12,
    processing_fee: 0.02,
    insurance_required: true,
    min_age: 21,
    max_age: 65,
    income_proof_required: true,
    consider_credit_history: true,
    decision_time_minutes: 30,
    max_pdn: 65,
    rating: 4.5,
    is_active: true
  },
  {
    id: "3",
    bank_name: "Узпромстройбанк",
    min_amount: 2000000,
    max_amount: 200000000,
    min_term_months: 12,
    max_term_months: 84,
    annual_rate: 0.22,
    monthly_rate: 0.22 / 12,
    processing_fee: 0.015,
    insurance_required: true,
    min_age: 23,
    max_age: 60,
    income_proof_required: true,
    consider_credit_history: true,
    decision_time_minutes: 60,
    max_pdn: 50,
    rating: 4.7,
    is_active: true
  },
  {
    id: "4",
    bank_name: "Хамкорбанк",
    min_amount: 500000,
    max_amount: 30000000,
    min_term_months: 3,
    max_term_months: 24,
    annual_rate: 0.32,
    monthly_rate: 0.32 / 12,
    processing_fee: 0,
    insurance_required: false,
    min_age: 18,
    max_age: 75,
    income_proof_required: false,
    consider_credit_history: false,
    decision_time_minutes: 5,
    max_pdn: 90,
    special_offer: "0% комиссия",
    rating: 4.6,
    is_active: true
  }
]

export default function BankCardDemo() {
  const [userScore, setUserScore] = useState(650)
  const [userPDN, setUserPDN] = useState(45)
  const [requestedAmount, setRequestedAmount] = useState(5000000)
  const [requestedTerm, setRequestedTerm] = useState(12)
  const [selectedOffer, setSelectedOffer] = useState<BankOffer | null>(null)
  
  const handleSelect = (offer: BankOffer) => {
    setSelectedOffer(offer)
    alert(`Выбран банк: ${offer.bank_name}`)
  }
  
  const handleCalculate = (offer: BankOffer) => {
    alert(`Открыть калькулятор для: ${offer.bank_name}`)
  }
  
  return (
    <div className="space-y-8 p-8 max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Bank Card Examples</h2>
      
      {/* User data controls */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 space-y-4">
        <h3 className="text-lg font-semibold mb-4">Параметры пользователя</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <Label htmlFor="score">Кредитный рейтинг</Label>
            <Input
              id="score"
              type="number"
              value={userScore}
              onChange={(e) => setUserScore(Number(e.target.value))}
              min={300}
              max={900}
            />
          </div>
          
          <div>
            <Label htmlFor="pdn">ПДН (%)</Label>
            <Input
              id="pdn"
              type="number"
              value={userPDN}
              onChange={(e) => setUserPDN(Number(e.target.value))}
              min={0}
              max={100}
            />
          </div>
          
          <div>
            <Label htmlFor="amount">Сумма (сум)</Label>
            <Input
              id="amount"
              type="number"
              value={requestedAmount}
              onChange={(e) => setRequestedAmount(Number(e.target.value))}
              step={100000}
            />
          </div>
          
          <div>
            <Label htmlFor="term">Срок (мес)</Label>
            <Input
              id="term"
              type="number"
              value={requestedTerm}
              onChange={(e) => setRequestedTerm(Number(e.target.value))}
              min={1}
              max={84}
            />
          </div>
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setUserScore(0)
            setUserPDN(0)
            setRequestedAmount(0)
            setRequestedTerm(0)
          }}
        >
          Сбросить параметры
        </Button>
      </div>
      
      {/* Featured offer */}
      <div>
        <h3 className="text-xl font-semibold mb-4">Рекомендуемое предложение</h3>
        <BankCard
          offer={mockOffers[0]}
          featured
          userScore={userScore || undefined}
          userPDN={userPDN || undefined}
          requestedAmount={requestedAmount || undefined}
          requestedTerm={requestedTerm || undefined}
          onSelect={handleSelect}
          onCalculate={handleCalculate}
        />
      </div>
      
      {/* Regular offers grid */}
      <div>
        <h3 className="text-xl font-semibold mb-4">Все предложения</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {mockOffers.map((offer) => (
            <BankCard
              key={offer.id}
              offer={offer}
              userScore={userScore || undefined}
              userPDN={userPDN || undefined}
              requestedAmount={requestedAmount || undefined}
              requestedTerm={requestedTerm || undefined}
              onSelect={handleSelect}
              onCalculate={handleCalculate}
            />
          ))}
        </div>
      </div>
      
      {/* Compact view without details */}
      <div>
        <h3 className="text-xl font-semibold mb-4">Компактный вид</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {mockOffers.slice(0, 3).map((offer) => (
            <BankCard
              key={offer.id}
              offer={offer}
              showDetails={false}
              onSelect={handleSelect}
            />
          ))}
        </div>
      </div>
      
      {/* Selected offer display */}
      {selectedOffer && (
        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
          <p className="text-sm">
            Последний выбранный банк: <strong>{selectedOffer.bank_name}</strong>
          </p>
        </div>
      )}
    </div>
  )
}