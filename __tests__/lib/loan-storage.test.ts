import {
  saveLoanData,
  getLoanData,
  clearLoanData,
  isLoanDataExpired,
  updateLoanCalculation,
  updatePDNCalculation,
  updatePreCheckResult,
  getLoanSummary,
  hasValidLoanData,
  migrateFromSessionStorage,
  LOAN_STORAGE_KEY,
  LoanFormStorage,
  LoanCalculation,
  PreCheckResult
} from '@/lib/loan-storage'

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key]
    }),
    clear: jest.fn(() => {
      store = {}
    })
  }
})()

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
})

// Mock sessionStorage
const sessionStorageMock = (() => {
  let store: Record<string, string> = {}
  
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key]
    }),
    clear: jest.fn(() => {
      store = {}
    })
  }
})()

Object.defineProperty(window, 'sessionStorage', {
  value: sessionStorageMock
})

describe('loan-storage', () => {
  beforeEach(() => {
    localStorageMock.clear()
    sessionStorageMock.clear()
    jest.clearAllMocks()
  })

  describe('saveLoanData', () => {
    it('should save loan data to localStorage', () => {
      const data: LoanFormStorage = {
        amount: 1000000,
        term: 12,
        monthlyIncome: 500000,
        monthlyExpenses: 200000,
        existingPayments: 50000,
        timestamp: Date.now()
      }

      saveLoanData(data)

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        LOAN_STORAGE_KEY,
        expect.any(String)
      )

      const saved = JSON.parse(localStorageMock.getItem(LOAN_STORAGE_KEY) as string)
      expect(saved.amount).toBe(data.amount)
      expect(saved.term).toBe(data.term)
      expect(saved.timestamp).toBeDefined()
    })

    it('should handle localStorage errors gracefully', () => {
      localStorageMock.setItem.mockImplementationOnce(() => {
        throw new Error('Storage full')
      })

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
      
      saveLoanData({
        amount: 1000000,
        term: 12,
        monthlyIncome: 500000,
        monthlyExpenses: 200000,
        existingPayments: 50000,
        timestamp: Date.now()
      })

      expect(consoleSpy).toHaveBeenCalled()
      consoleSpy.mockRestore()
    })
  })

  describe('getLoanData', () => {
    it('should get loan data from localStorage', () => {
      const data: LoanFormStorage = {
        amount: 1000000,
        term: 12,
        monthlyIncome: 500000,
        monthlyExpenses: 200000,
        existingPayments: 50000,
        timestamp: Date.now()
      }

      localStorageMock.setItem(LOAN_STORAGE_KEY, JSON.stringify(data))

      const retrieved = getLoanData()
      expect(retrieved).toEqual(data)
    })

    it('should return null if no data exists', () => {
      expect(getLoanData()).toBeNull()
    })

    it('should return null if data is invalid', () => {
      localStorageMock.setItem(LOAN_STORAGE_KEY, JSON.stringify({ invalid: true }))
      expect(getLoanData()).toBeNull()
    })

    it('should handle JSON parse errors', () => {
      localStorageMock.setItem(LOAN_STORAGE_KEY, 'invalid json')
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
      
      expect(getLoanData()).toBeNull()
      expect(consoleSpy).toHaveBeenCalled()
      
      consoleSpy.mockRestore()
    })
  })

  describe('clearLoanData', () => {
    it('should clear loan data from localStorage', () => {
      localStorageMock.setItem(LOAN_STORAGE_KEY, 'some data')
      
      clearLoanData()
      
      expect(localStorageMock.removeItem).toHaveBeenCalledWith(LOAN_STORAGE_KEY)
    })
  })

  describe('isLoanDataExpired', () => {
    it('should return true if no data exists', () => {
      expect(isLoanDataExpired()).toBe(true)
    })

    it('should return false if data is fresh', () => {
      const data: LoanFormStorage = {
        amount: 1000000,
        term: 12,
        monthlyIncome: 500000,
        monthlyExpenses: 200000,
        existingPayments: 50000,
        timestamp: Date.now()
      }

      saveLoanData(data)
      expect(isLoanDataExpired()).toBe(false)
    })

    it('should return true if data is expired', () => {
      const data: LoanFormStorage = {
        amount: 1000000,
        term: 12,
        monthlyIncome: 500000,
        monthlyExpenses: 200000,
        existingPayments: 50000,
        timestamp: Date.now() - (25 * 60 * 60 * 1000) // 25 hours ago
      }

      localStorageMock.setItem(LOAN_STORAGE_KEY, JSON.stringify(data))
      expect(isLoanDataExpired()).toBe(true)
    })

    it('should use custom expiry hours', () => {
      const data: LoanFormStorage = {
        amount: 1000000,
        term: 12,
        monthlyIncome: 500000,
        monthlyExpenses: 200000,
        existingPayments: 50000,
        timestamp: Date.now() - (2 * 60 * 60 * 1000) // 2 hours ago
      }

      localStorageMock.setItem(LOAN_STORAGE_KEY, JSON.stringify(data))
      expect(isLoanDataExpired(1)).toBe(true) // Expired after 1 hour
      expect(isLoanDataExpired(3)).toBe(false) // Not expired after 3 hours
    })
  })

  describe('update functions', () => {
    beforeEach(() => {
      const data: LoanFormStorage = {
        amount: 1000000,
        term: 12,
        monthlyIncome: 500000,
        monthlyExpenses: 200000,
        existingPayments: 50000,
        timestamp: Date.now()
      }
      saveLoanData(data)
    })

    it('should update loan calculation', () => {
      const calculation: LoanCalculation = {
        monthlyPayment: 95000,
        totalPayment: 1140000,
        totalInterest: 140000,
        effectiveRate: 0.14
      }

      updateLoanCalculation(calculation)

      const data = getLoanData()
      expect(data?.calculation).toEqual(calculation)
    })

    it('should update pre-check result', () => {
      const preCheck: PreCheckResult = {
        isEligible: true,
        score: 750,
        recommendations: ['Улучшите кредитную историю'],
        estimatedApprovalRate: 0.85
      }

      updatePreCheckResult(preCheck)

      const data = getLoanData()
      expect(data?.preCheckResult).toEqual(preCheck)
    })
  })

  describe('getLoanSummary', () => {
    it('should return formatted loan summary', () => {
      const data: LoanFormStorage = {
        amount: 1000000,
        term: 12,
        monthlyIncome: 500000,
        monthlyExpenses: 200000,
        existingPayments: 50000,
        timestamp: Date.now()
      }

      saveLoanData(data)
      expect(getLoanSummary()).toBe('1 000 000 сум на 12 мес.')
    })

    it('should return null if no data exists', () => {
      expect(getLoanSummary()).toBeNull()
    })
  })

  describe('hasValidLoanData', () => {
    it('should return true if valid data exists', () => {
      const data: LoanFormStorage = {
        amount: 1000000,
        term: 12,
        monthlyIncome: 500000,
        monthlyExpenses: 200000,
        existingPayments: 50000,
        timestamp: Date.now()
      }

      saveLoanData(data)
      expect(hasValidLoanData()).toBe(true)
    })

    it('should return false if no data exists', () => {
      expect(hasValidLoanData()).toBe(false)
    })

    it('should return false if data is expired', () => {
      const data: LoanFormStorage = {
        amount: 1000000,
        term: 12,
        monthlyIncome: 500000,
        monthlyExpenses: 200000,
        existingPayments: 50000,
        timestamp: Date.now() - (25 * 60 * 60 * 1000)
      }

      localStorageMock.setItem(LOAN_STORAGE_KEY, JSON.stringify(data))
      expect(hasValidLoanData()).toBe(false)
    })
  })

  describe('migrateFromSessionStorage', () => {
    it('should migrate data from sessionStorage', () => {
      const sessionData = {
        amount: 2000000,
        term: 24,
        monthlyIncome: 600000,
        monthlyExpenses: 250000,
        existingPayments: 100000
      }

      sessionStorageMock.setItem('loanData', JSON.stringify(sessionData))

      const result = migrateFromSessionStorage()
      
      expect(result).toBe(true)
      expect(sessionStorageMock.removeItem).toHaveBeenCalledWith('loanData')
      
      const migrated = getLoanData()
      expect(migrated?.amount).toBe(sessionData.amount)
      expect(migrated?.term).toBe(sessionData.term)
    })

    it('should return false if no session data exists', () => {
      expect(migrateFromSessionStorage()).toBe(false)
    })

    it('should handle migration errors', () => {
      sessionStorageMock.setItem('loanData', 'invalid json')
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
      
      expect(migrateFromSessionStorage()).toBe(false)
      expect(consoleSpy).toHaveBeenCalled()
      
      consoleSpy.mockRestore()
    })
  })
})