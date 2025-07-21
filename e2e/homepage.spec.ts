import { test, expect } from '@playwright/test'

test.describe('Homepage', () => {
  test('should display hero section', async ({ page }) => {
    await page.goto('/')
    
    // Check hero title
    await expect(page.locator('h1')).toContainText('Найдите лучший микрозайм')
    
    // Check CTA button
    const ctaButton = page.locator('text=Получить займ')
    await expect(ctaButton).toBeVisible()
  })

  test('should navigate to loan application', async ({ page }) => {
    await page.goto('/')
    
    // Click CTA button
    await page.click('text=Получить займ')
    
    // Should navigate to application page
    await expect(page).toHaveURL(/.*application\/new/)
  })

  test('should display features section', async ({ page }) => {
    await page.goto('/')
    
    // Check features
    await expect(page.locator('text=Быстрое решение')).toBeVisible()
    await expect(page.locator('text=Лучшие предложения')).toBeVisible()
    await expect(page.locator('text=Безопасность данных')).toBeVisible()
  })

  test('should have responsive design', async ({ page }) => {
    // Desktop view
    await page.setViewportSize({ width: 1280, height: 720 })
    await page.goto('/')
    await expect(page.locator('[data-testid="desktop-menu"]')).toBeVisible()
    
    // Mobile view
    await page.setViewportSize({ width: 375, height: 667 })
    await expect(page.locator('[data-testid="mobile-menu-button"]')).toBeVisible()
  })
})