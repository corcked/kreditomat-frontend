import { test, expect } from '@playwright/test'

test.describe('Loan Calculator', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/application/new')
  })

  test('should calculate loan payment', async ({ page }) => {
    // Wait for form to load
    await page.waitForSelector('[data-testid="loan-form"]')
    
    // Set loan amount
    const amountInput = page.locator('input[name="amount"]')
    await amountInput.clear()
    await amountInput.fill('5000000')
    
    // Set loan term
    const termSlider = page.locator('[role="slider"][aria-label="Срок займа"]')
    await termSlider.click() // This would need proper slider interaction
    
    // Check if monthly payment is displayed
    await expect(page.locator('text=Ежемесячный платеж')).toBeVisible()
    await expect(page.locator('text=/\\d+\\s\\d+\\sсум/')).toBeVisible()
  })

  test('should show PDN indicator', async ({ page }) => {
    // Fill income
    const incomeInput = page.locator('input[name="monthlyIncome"]')
    await incomeInput.fill('5000000')
    
    // Fill expenses
    const expensesInput = page.locator('input[name="monthlyExpenses"]')
    await expensesInput.fill('1000000')
    
    // PDN should be calculated
    await expect(page.locator('[data-testid="pdn-indicator"]')).toBeVisible()
    await expect(page.locator('text=/%/')).toBeVisible()
  })

  test('should validate minimum amount', async ({ page }) => {
    const amountInput = page.locator('input[name="amount"]')
    await amountInput.clear()
    await amountInput.fill('100000') // Below minimum
    
    // Should show error
    await expect(page.locator('text=Минимальная сумма')).toBeVisible()
  })

  test('should use quick amount buttons', async ({ page }) => {
    // Click quick amount button
    await page.click('button:has-text("1 млн")')
    
    // Check if amount is set
    const amountInput = page.locator('input[name="amount"]')
    await expect(amountInput).toHaveValue('1 000 000')
  })

  test('should toggle advanced settings', async ({ page }) => {
    // Click to show advanced settings
    await page.click('text=Указать доходы и расходы')
    
    // Advanced fields should be visible
    await expect(page.locator('input[name="monthlyIncome"]')).toBeVisible()
    await expect(page.locator('input[name="monthlyExpenses"]')).toBeVisible()
  })
})