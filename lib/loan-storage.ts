/**
 * Loan Storage utilities for managing loan form data in localStorage
 */

import { PDNCalculation } from './pdn'

// Storage key constants
export const LOAN_STORAGE_KEY = 'kreditomat_loan_data'
export const LOAN_STORAGE_EXPIRY_HOURS = 24

// Interfaces
export interface LoanCalculation {
  monthlyPayment: number
  totalPayment: number
  totalInterest: number
  effectiveRate: number
  paymentSchedule?: Array<{
    month: number
    payment: number
    principal: number
    interest: number
    balance: number
  }>
}

export interface PreCheckResult {
  isEligible: boolean
  score?: number
  recommendations?: string[]
  estimatedApprovalRate?: number
}

export interface LoanFormStorage {
  amount: number
  term: number
  monthlyIncome: number
  monthlyExpenses: number
  existingPayments: number
  calculation?: LoanCalculation
  pdnCalculation?: PDNCalculation
  preCheckResult?: PreCheckResult
  timestamp: number
}

/**
 * Save loan data to localStorage
 */
export function saveLoanData(data: LoanFormStorage): void {
  try {
    const storageData = {
      ...data,
      timestamp: Date.now()
    }
    localStorage.setItem(LOAN_STORAGE_KEY, JSON.stringify(storageData))
  } catch (error) {
    console.error('Failed to save loan data to localStorage:', error)
  }
}

/**
 * Get loan data from localStorage
 */
export function getLoanData(): LoanFormStorage | null {
  try {
    const stored = localStorage.getItem(LOAN_STORAGE_KEY)
    if (!stored) return null
    
    const data = JSON.parse(stored) as LoanFormStorage
    
    // Validate data structure
    if (!data.amount || !data.term || !data.monthlyIncome) {
      return null
    }
    
    return data
  } catch (error) {
    console.error('Failed to get loan data from localStorage:', error)
    return null
  }
}

/**
 * Clear loan data from localStorage
 */
export function clearLoanData(): void {
  try {
    localStorage.removeItem(LOAN_STORAGE_KEY)
  } catch (error) {
    console.error('Failed to clear loan data from localStorage:', error)
  }
}

/**
 * Check if loan data is expired
 */
export function isLoanDataExpired(hours: number = LOAN_STORAGE_EXPIRY_HOURS): boolean {
  try {
    const data = getLoanData()
    if (!data || !data.timestamp) return true
    
    const expiryTime = hours * 60 * 60 * 1000 // Convert hours to milliseconds
    const isExpired = Date.now() - data.timestamp > expiryTime
    
    return isExpired
  } catch (error) {
    console.error('Failed to check loan data expiry:', error)
    return true
  }
}

/**
 * Update loan calculation results
 */
export function updateLoanCalculation(calculation: LoanCalculation): void {
  try {
    const data = getLoanData()
    if (!data) return
    
    saveLoanData({
      ...data,
      calculation
    })
  } catch (error) {
    console.error('Failed to update loan calculation:', error)
  }
}

/**
 * Update PDN calculation results
 */
export function updatePDNCalculation(pdnCalculation: PDNCalculation): void {
  try {
    const data = getLoanData()
    if (!data) return
    
    saveLoanData({
      ...data,
      pdnCalculation
    })
  } catch (error) {
    console.error('Failed to update PDN calculation:', error)
  }
}

/**
 * Update pre-check results
 */
export function updatePreCheckResult(preCheckResult: PreCheckResult): void {
  try {
    const data = getLoanData()
    if (!data) return
    
    saveLoanData({
      ...data,
      preCheckResult
    })
  } catch (error) {
    console.error('Failed to update pre-check result:', error)
  }
}

/**
 * Get loan summary for display
 */
export function getLoanSummary(): string | null {
  const data = getLoanData()
  if (!data) return null
  
  const formatter = new Intl.NumberFormat('ru-RU')
  return `${formatter.format(data.amount)} сум на ${data.term} мес.`
}

/**
 * Check if user has valid loan data
 */
export function hasValidLoanData(): boolean {
  return !isLoanDataExpired() && getLoanData() !== null
}

/**
 * Migrate from sessionStorage (for backward compatibility)
 */
export function migrateFromSessionStorage(): boolean {
  try {
    const sessionData = sessionStorage.getItem('loanData')
    if (!sessionData) return false
    
    const data = JSON.parse(sessionData)
    saveLoanData({
      amount: data.amount || 0,
      term: data.term || 0,
      monthlyIncome: data.monthlyIncome || 0,
      monthlyExpenses: data.monthlyExpenses || 0,
      existingPayments: data.existingPayments || 0,
      timestamp: Date.now()
    })
    
    // Clear session storage after migration
    sessionStorage.removeItem('loanData')
    return true
  } catch (error) {
    console.error('Failed to migrate from sessionStorage:', error)
    return false
  }
}