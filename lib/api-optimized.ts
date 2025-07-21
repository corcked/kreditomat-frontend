import { api } from './api'
import { memoryCache, localCache } from './cache'

// Cache TTL in seconds
const CACHE_TTL = {
  offers: 300, // 5 minutes
  personalData: 600, // 10 minutes
  referralStats: 300, // 5 minutes
  calculator: 60, // 1 minute
  preCheck: 60, // 1 minute
}

// Optimized API with caching
export const apiOptimized = {
  // Offers with caching
  offers: {
    async list(params?: any) {
      const cacheKey = `offers_${JSON.stringify(params || {})}`
      const cached = memoryCache.get(cacheKey)
      if (cached) return cached
      
      const data = await api.offers.list(params)
      memoryCache.set(cacheKey, data, CACHE_TTL.offers)
      return data
    },
    
    async featured() {
      const cacheKey = 'offers_featured'
      const cached = memoryCache.get(cacheKey)
      if (cached) return cached
      
      const data = await api.offers.featured()
      memoryCache.set(cacheKey, data, CACHE_TTL.offers)
      return data
    },
    
    // Other methods without caching
    get: api.offers.get,
    compare: api.offers.compare,
    calculate: api.offers.calculate,
  },
  
  // Personal data with local caching
  personalData: {
    async get() {
      const cached = localCache.get('personal_data')
      if (cached) return cached
      
      const data = await api.personalData.get()
      localCache.set('personal_data', data, CACHE_TTL.personalData)
      return data
    },
    
    async createOrUpdate(data: any) {
      const result = await api.personalData.createOrUpdate(data)
      // Clear cache after update
      localCache.delete('personal_data')
      return result
    },
    
    // Other methods
    validate: api.personalData.validate,
    checkCompleteness: api.personalData.checkCompleteness,
    export: api.personalData.export,
  },
  
  // Referrals with caching
  referrals: {
    async getStats() {
      const cacheKey = 'referral_stats'
      const cached = memoryCache.get(cacheKey)
      if (cached) return cached
      
      const data = await api.referrals.getStats()
      memoryCache.set(cacheKey, data, CACHE_TTL.referralStats)
      return data
    },
    
    // Other methods
    getCode: api.referrals.getCode,
    getTree: api.referrals.getTree,
    getTop: api.referrals.getTop,
    getPromo: api.referrals.getPromo,
  },
  
  // Calculator with short-term caching
  calculator: {
    async loan(data: any) {
      const cacheKey = `calc_loan_${JSON.stringify(data)}`
      const cached = memoryCache.get(cacheKey)
      if (cached) return cached
      
      const result = await api.calculator.loan(data)
      memoryCache.set(cacheKey, result, CACHE_TTL.calculator)
      return result
    },
    
    async pdn(data: any) {
      const cacheKey = `calc_pdn_${JSON.stringify(data)}`
      const cached = memoryCache.get(cacheKey)
      if (cached) return cached
      
      const result = await api.calculator.pdn(data)
      memoryCache.set(cacheKey, result, CACHE_TTL.calculator)
      return result
    },
  },
  
  // Applications with pre-check caching
  applications: {
    async preCheck(data: any) {
      const cacheKey = `pre_check_${JSON.stringify(data)}`
      const cached = memoryCache.get(cacheKey)
      if (cached) return cached
      
      const result = await api.applications.preCheck(data)
      memoryCache.set(cacheKey, result, CACHE_TTL.preCheck)
      return result
    },
    
    // Other methods without caching
    create: api.applications.create,
    get: api.applications.get,
    list: api.applications.list,
    getScoring: api.applications.getScoring,
    getOffers: api.applications.getOffers,
    downloadReport: api.applications.downloadReport,
  },
  
  // Auth methods without caching
  auth: api.auth,
}

// Clear cache on logout
const originalLogout = api.auth.logout
api.auth.logout = async () => {
  const result = await originalLogout()
  // Clear all caches
  memoryCache.clear()
  localCache.cleanup()
  return result
}