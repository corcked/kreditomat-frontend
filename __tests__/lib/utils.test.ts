import { cn, formatAmount, formatPhone, formatDate } from '@/lib/utils'

describe('utils', () => {
  describe('cn', () => {
    it('should merge class names correctly', () => {
      expect(cn('foo', 'bar')).toBe('foo bar')
      expect(cn('foo', { bar: true })).toBe('foo bar')
      expect(cn('foo', { bar: false })).toBe('foo')
      expect(cn('foo', undefined, 'bar')).toBe('foo bar')
    })

    it('should handle tailwind class conflicts', () => {
      expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500')
      expect(cn('p-4', 'p-2')).toBe('p-2')
    })
  })

  describe('formatAmount', () => {
    it('should format amount with spaces', () => {
      expect(formatAmount(1000)).toBe('1 000')
      expect(formatAmount(1000000)).toBe('1 000 000')
      expect(formatAmount(1234567.89)).toBe('1 234 567.89')
    })

    it('should handle zero and negative numbers', () => {
      expect(formatAmount(0)).toBe('0')
      expect(formatAmount(-1000)).toBe('-1 000')
    })
  })

  describe('formatPhone', () => {
    it('should format phone numbers correctly', () => {
      expect(formatPhone('998901234567')).toBe('+998 90 123 45 67')
      expect(formatPhone('+998901234567')).toBe('+998 90 123 45 67')
      expect(formatPhone('901234567')).toBe('+998 90 123 45 67')
    })

    it('should return original for invalid phones', () => {
      expect(formatPhone('12345')).toBe('12345')
      expect(formatPhone('')).toBe('')
    })
  })

  describe('formatDate', () => {
    it('should format dates correctly', () => {
      const date = new Date('2024-01-15T10:30:00')
      expect(formatDate(date)).toMatch(/15/)
      expect(formatDate(date)).toMatch(/2024/)
    })

    it('should format date strings', () => {
      expect(formatDate('2024-01-15')).toMatch(/15/)
      expect(formatDate('2024-01-15')).toMatch(/2024/)
    })
  })
})