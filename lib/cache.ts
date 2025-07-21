// Cache utilities for API responses and static data

interface CacheItem<T> {
  data: T
  timestamp: number
  ttl: number
}

class MemoryCache {
  private cache = new Map<string, CacheItem<any>>()
  
  set<T>(key: string, data: T, ttlSeconds: number = 300): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttlSeconds * 1000,
    })
  }
  
  get<T>(key: string): T | null {
    const item = this.cache.get(key)
    if (!item) return null
    
    const now = Date.now()
    if (now - item.timestamp > item.ttl) {
      this.cache.delete(key)
      return null
    }
    
    return item.data as T
  }
  
  delete(key: string): void {
    this.cache.delete(key)
  }
  
  clear(): void {
    this.cache.clear()
  }
  
  // Clean up expired items
  cleanup(): void {
    const now = Date.now()
    const keysToDelete: string[] = []
    
    this.cache.forEach((item, key) => {
      if (now - item.timestamp > item.ttl) {
        keysToDelete.push(key)
      }
    })
    
    keysToDelete.forEach(key => this.cache.delete(key))
  }
}

// Singleton instance
export const memoryCache = new MemoryCache()

// Run cleanup every 5 minutes
if (typeof window !== 'undefined') {
  setInterval(() => memoryCache.cleanup(), 5 * 60 * 1000)
}

// Local storage cache with expiration
export const localCache = {
  set<T>(key: string, data: T, ttlSeconds: number = 3600): void {
    if (typeof window === 'undefined') return
    
    const item: CacheItem<T> = {
      data,
      timestamp: Date.now(),
      ttl: ttlSeconds * 1000,
    }
    
    try {
      localStorage.setItem(`cache_${key}`, JSON.stringify(item))
    } catch (e) {
      console.warn('LocalStorage full, clearing old cache items')
      this.cleanup()
    }
  },
  
  get<T>(key: string): T | null {
    if (typeof window === 'undefined') return null
    
    try {
      const itemStr = localStorage.getItem(`cache_${key}`)
      if (!itemStr) return null
      
      const item = JSON.parse(itemStr) as CacheItem<T>
      const now = Date.now()
      
      if (now - item.timestamp > item.ttl) {
        localStorage.removeItem(`cache_${key}`)
        return null
      }
      
      return item.data
    } catch {
      return null
    }
  },
  
  delete(key: string): void {
    if (typeof window === 'undefined') return
    localStorage.removeItem(`cache_${key}`)
  },
  
  cleanup(): void {
    if (typeof window === 'undefined') return
    
    const now = Date.now()
    const keysToRemove: string[] = []
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (!key || !key.startsWith('cache_')) continue
      
      try {
        const itemStr = localStorage.getItem(key)
        if (!itemStr) continue
        
        const item = JSON.parse(itemStr) as CacheItem<any>
        if (now - item.timestamp > item.ttl) {
          keysToRemove.push(key)
        }
      } catch {
        keysToRemove.push(key)
      }
    }
    
    keysToRemove.forEach(key => localStorage.removeItem(key))
  }
}

// Debounce function for optimizing frequent calls
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null
  
  return function (this: any, ...args: Parameters<T>) {
    const context = this
    
    if (timeout) clearTimeout(timeout)
    
    timeout = setTimeout(() => {
      func.apply(context, args)
    }, wait)
  }
}

// Throttle function for rate limiting
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false
  
  return function (this: any, ...args: Parameters<T>) {
    const context = this
    
    if (!inThrottle) {
      func.apply(context, args)
      inThrottle = true
      
      setTimeout(() => {
        inThrottle = false
      }, limit)
    }
  }
}