import { memoryCache, localCache, debounce, throttle } from '@/lib/cache'

describe('Cache utilities', () => {
  describe('MemoryCache', () => {
    beforeEach(() => {
      memoryCache.clear()
    })

    it('should store and retrieve data', () => {
      const data = { test: 'value' }
      memoryCache.set('key', data, 1)
      expect(memoryCache.get('key')).toEqual(data)
    })

    it('should return null for non-existent keys', () => {
      expect(memoryCache.get('nonexistent')).toBeNull()
    })

    it('should expire data after TTL', async () => {
      memoryCache.set('key', 'value', 0.1) // 0.1 second
      expect(memoryCache.get('key')).toBe('value')
      
      await new Promise(resolve => setTimeout(resolve, 150))
      expect(memoryCache.get('key')).toBeNull()
    })

    it('should delete specific keys', () => {
      memoryCache.set('key', 'value')
      memoryCache.delete('key')
      expect(memoryCache.get('key')).toBeNull()
    })

    it('should clear all data', () => {
      memoryCache.set('key1', 'value1')
      memoryCache.set('key2', 'value2')
      memoryCache.clear()
      expect(memoryCache.get('key1')).toBeNull()
      expect(memoryCache.get('key2')).toBeNull()
    })
  })

  describe('LocalCache', () => {
    beforeEach(() => {
      localStorage.clear()
    })

    it('should store and retrieve data from localStorage', () => {
      const data = { test: 'value' }
      localCache.set('key', data, 1)
      expect(localCache.get('key')).toEqual(data)
    })

    it('should handle localStorage errors gracefully', () => {
      const mockSetItem = jest.spyOn(Storage.prototype, 'setItem')
      mockSetItem.mockImplementation(() => {
        throw new Error('QuotaExceededError')
      })

      expect(() => localCache.set('key', 'value')).not.toThrow()
      mockSetItem.mockRestore()
    })
  })

  describe('debounce', () => {
    jest.useFakeTimers()

    it('should debounce function calls', () => {
      const fn = jest.fn()
      const debounced = debounce(fn, 100)

      debounced()
      debounced()
      debounced()

      expect(fn).not.toHaveBeenCalled()

      jest.advanceTimersByTime(100)
      expect(fn).toHaveBeenCalledTimes(1)
    })

    it('should pass arguments correctly', () => {
      const fn = jest.fn()
      const debounced = debounce(fn, 100)

      debounced('arg1', 'arg2')
      jest.advanceTimersByTime(100)

      expect(fn).toHaveBeenCalledWith('arg1', 'arg2')
    })

    jest.useRealTimers()
  })

  describe('throttle', () => {
    jest.useFakeTimers()

    it('should throttle function calls', () => {
      const fn = jest.fn()
      const throttled = throttle(fn, 100)

      throttled()
      throttled()
      throttled()

      expect(fn).toHaveBeenCalledTimes(1)

      jest.advanceTimersByTime(100)
      throttled()
      expect(fn).toHaveBeenCalledTimes(2)
    })

    jest.useRealTimers()
  })
})