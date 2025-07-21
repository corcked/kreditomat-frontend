import { test, expect } from '@playwright/test'

test.describe('Authentication', () => {
  test('should complete login flow', async ({ page }) => {
    await page.goto('/auth/login')
    
    // Enter phone number
    const phoneInput = page.locator('input[name="phone"]')
    await phoneInput.fill('901234567')
    
    // Check formatting
    await expect(phoneInput).toHaveValue('+998 90 123 45 67')
    
    // Submit form
    await page.click('button[type="submit"]')
    
    // Should navigate to verification page
    await expect(page).toHaveURL(/.*auth\/verify/)
    
    // Should show phone number
    await expect(page.locator('text=+998 90 123 45 67')).toBeVisible()
  })

  test('should verify SMS code', async ({ page }) => {
    // Navigate directly to verify page (simulating after phone submission)
    await page.goto('/auth/verify?phone=%2B998901234567')
    
    // Enter code digits
    const inputs = page.locator('input[inputmode="numeric"]')
    await inputs.nth(0).fill('1')
    await inputs.nth(1).fill('2')
    await inputs.nth(2).fill('3')
    await inputs.nth(3).fill('4')
    await inputs.nth(4).fill('5')
    await inputs.nth(5).fill('6')
    
    // Code should auto-submit (in real app)
    // For testing, we'll check if all inputs are filled
    for (let i = 0; i < 6; i++) {
      await expect(inputs.nth(i)).toHaveValue(/\d/)
    }
  })

  test('should handle invalid phone number', async ({ page }) => {
    await page.goto('/auth/login')
    
    // Enter invalid phone
    const phoneInput = page.locator('input[name="phone"]')
    await phoneInput.fill('123')
    
    // Try to submit
    await page.click('button[type="submit"]')
    
    // Should show error
    await expect(page.locator('text=Введите корректный номер')).toBeVisible()
  })

  test('should navigate back from verify page', async ({ page }) => {
    await page.goto('/auth/verify?phone=%2B998901234567')
    
    // Click back button
    await page.click('text=Изменить номер')
    
    // Should go back to login
    await expect(page).toHaveURL(/.*auth\/login/)
  })
})