import { renderHook, waitFor } from '@testing-library/react'
import { useAsyncData, useLoanCalculator, usePDNCalculator } from '@/hooks/use-optimized-data'
import { apiOptimized } from '@/lib/api-optimized'

// Mock the API
jest.mock('@/lib/api-optimized', () => ({
  apiOptimized: {
    calculator: {
      loan: jest.fn(),
      pdn: jest.fn(),
    },
    offers: {
      list: jest.fn(),
      featured: jest.fn(),
    },
    personalData: {
      get: jest.fn(),
      createOrUpdate: jest.fn(),
    },
    referrals: {
      getStats: jest.fn(),
    },
    applications: {
      preCheck: jest.fn(),
    },
  },
}))

describe('useAsyncData', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should fetch data on mount', async () => {
    const mockData = { test: 'data' }
    const fetcher = jest.fn().mockResolvedValue(mockData)
    
    const { result } = renderHook(() => useAsyncData(fetcher))
    
    expect(result.current.loading).toBe(true)
    expect(result.current.data).toBe(null)
    expect(result.current.error).toBe(null)
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
      expect(result.current.data).toEqual(mockData)
    })
  })

  it('should handle errors', async () => {
    const mockError = new Error('Test error')
    const fetcher = jest.fn().mockRejectedValue(mockError)
    
    const { result } = renderHook(() => useAsyncData(fetcher))
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
      expect(result.current.error).toEqual(mockError)
      expect(result.current.data).toBe(null)
    })
  })

  it('should refetch data', async () => {
    const fetcher = jest.fn().mockResolvedValue({ count: 1 })
    
    const { result } = renderHook(() => useAsyncData(fetcher))
    
    await waitFor(() => {
      expect(result.current.data).toEqual({ count: 1 })
    })
    
    fetcher.mockResolvedValue({ count: 2 })
    result.current.refetch()
    
    await waitFor(() => {
      expect(result.current.data).toEqual({ count: 2 })
    })
    
    expect(fetcher).toHaveBeenCalledTimes(2)
  })
})

describe('useLoanCalculator', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('should calculate loan with debouncing', async () => {
    const mockResult = {
      monthly_payment: 500000,
      total_payment: 6000000,
      overpayment: 1000000,
    }
    
    ;(apiOptimized.calculator.loan as jest.Mock).mockResolvedValue(mockResult)
    
    const { result } = renderHook(() => useLoanCalculator())
    
    result.current.calculate({ amount: 5000000, term: 12, rate: 20 })
    
    expect(apiOptimized.calculator.loan).not.toHaveBeenCalled()
    
    jest.advanceTimersByTime(300)
    
    await waitFor(() => {
      expect(apiOptimized.calculator.loan).toHaveBeenCalledWith({
        amount: 5000000,
        term: 12,
        rate: 20,
      })
      expect(result.current.result).toEqual(mockResult)
    })
  })
})

describe('usePDNCalculator', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('should calculate PDN with debouncing', async () => {
    const mockResult = {
      pdn_value: 35,
      risk_level: 'medium',
      max_loan_amount: 10000000,
    }
    
    ;(apiOptimized.calculator.pdn as jest.Mock).mockResolvedValue(mockResult)
    
    const { result } = renderHook(() => usePDNCalculator())
    
    result.current.calculate({
      monthly_income: 5000000,
      monthly_expenses: 1000000,
      loan_amount: 5000000,
      loan_term: 12,
      annual_rate: 20,
    })
    
    jest.advanceTimersByTime(300)
    
    await waitFor(() => {
      expect(result.current.result).toEqual(mockResult)
    })
  })
})