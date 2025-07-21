import { useState, useEffect, useCallback } from 'react'
import { apiOptimized } from '@/lib/api-optimized'
import { debounce } from '@/lib/cache'

// Generic data fetching hook with loading and error states
export function useAsyncData<T>(
  fetcher: () => Promise<T>,
  dependencies: any[] = []
) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  
  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const result = await fetcher()
      setData(result)
    } catch (err) {
      setError(err as Error)
    } finally {
      setLoading(false)
    }
  }, dependencies)
  
  useEffect(() => {
    fetchData()
  }, [fetchData])
  
  return { data, loading, error, refetch: fetchData }
}

// Optimized offers hook
export function useOffers(params?: any) {
  return useAsyncData(
    () => apiOptimized.offers.list(params),
    [JSON.stringify(params)]
  )
}

// Featured offers hook
export function useFeaturedOffers() {
  return useAsyncData(() => apiOptimized.offers.featured())
}

// Personal data hook
export function usePersonalData() {
  const result = useAsyncData(() => apiOptimized.personalData.get())
  
  const updateData = useCallback(async (data: any) => {
    try {
      await apiOptimized.personalData.createOrUpdate(data)
      await result.refetch()
    } catch (error) {
      throw error
    }
  }, [result])
  
  return { ...result, updateData }
}

// Referral stats hook
export function useReferralStats() {
  return useAsyncData(() => apiOptimized.referrals.getStats())
}

// Calculator hook with debouncing
export function useLoanCalculator() {
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  
  const calculate = useCallback(
    debounce(async (data: any) => {
      try {
        setLoading(true)
        setError(null)
        const result = await apiOptimized.calculator.loan(data)
        setResult(result)
      } catch (err) {
        setError(err as Error)
      } finally {
        setLoading(false)
      }
    }, 300),
    []
  )
  
  return { result, loading, error, calculate }
}

// PDN calculator hook with debouncing
export function usePDNCalculator() {
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  
  const calculate = useCallback(
    debounce(async (data: any) => {
      try {
        setLoading(true)
        setError(null)
        const result = await apiOptimized.calculator.pdn(data)
        setResult(result)
      } catch (err) {
        setError(err as Error)
      } finally {
        setLoading(false)
      }
    }, 300),
    []
  )
  
  return { result, loading, error, calculate }
}

// Pre-check hook
export function usePreCheck() {
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  
  const check = useCallback(async (data: any) => {
    try {
      setLoading(true)
      setError(null)
      const result = await apiOptimized.applications.preCheck(data)
      setResult(result)
      return result
    } catch (err) {
      setError(err as Error)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])
  
  return { result, loading, error, check }
}