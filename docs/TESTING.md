# Testing Guide

## Overview

The project uses multiple testing strategies:
- **Unit Tests**: Jest + React Testing Library
- **Integration Tests**: Jest with mocked APIs
- **E2E Tests**: Playwright

## Running Tests

### Unit & Integration Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run tests in CI mode
npm run test:ci
```

### E2E Tests

```bash
# Install Playwright browsers (first time only)
npx playwright install

# Run E2E tests
npm run test:e2e

# Run E2E tests with UI
npm run test:e2e:ui

# Debug E2E tests
npm run test:e2e:debug
```

## Test Structure

```
__tests__/
├── components/     # Component unit tests
├── hooks/         # Custom hooks tests
├── lib/           # Utility functions tests
└── integration/   # Integration tests

e2e/
├── homepage.spec.ts      # Homepage E2E tests
├── auth.spec.ts          # Authentication flow tests
└── loan-calculator.spec.ts # Calculator functionality tests
```

## Writing Tests

### Unit Test Example

```typescript
import { render, screen } from '@testing-library/react'
import MyComponent from '@/components/MyComponent'

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent title="Test" />)
    expect(screen.getByText('Test')).toBeInTheDocument()
  })
})
```

### Integration Test Example

```typescript
import { renderHook, waitFor } from '@testing-library/react'
import { useMyHook } from '@/hooks/useMyHook'

describe('useMyHook', () => {
  it('fetches data', async () => {
    const { result } = renderHook(() => useMyHook())
    
    await waitFor(() => {
      expect(result.current.data).toBeDefined()
    })
  })
})
```

### E2E Test Example

```typescript
import { test, expect } from '@playwright/test'

test('user can submit form', async ({ page }) => {
  await page.goto('/form')
  await page.fill('input[name="email"]', 'test@example.com')
  await page.click('button[type="submit"]')
  await expect(page).toHaveURL('/success')
})
```

## Coverage Requirements

- Branches: 70%
- Functions: 70%
- Lines: 70%
- Statements: 70%

## Mocking

### API Mocking

```typescript
jest.mock('@/lib/api', () => ({
  api: {
    auth: {
      login: jest.fn(),
    },
  },
}))
```

### Next.js Router Mocking

Already configured in `jest.setup.ts`

## CI/CD Integration

Tests run automatically in GitHub Actions:
- On every push to main
- On every pull request
- Coverage reports are generated

## Best Practices

1. **Test Behavior, Not Implementation**
   - Focus on what users see and do
   - Avoid testing internal state

2. **Use Testing Library Queries**
   - Prefer `getByRole`, `getByLabelText`
   - Avoid `getByTestId` when possible

3. **Keep Tests Independent**
   - Each test should run in isolation
   - Clean up after tests

4. **Use Descriptive Names**
   - Test names should describe the scenario
   - Use nested describe blocks for organization

5. **Mock External Dependencies**
   - Mock API calls
   - Mock timers when needed
   - Mock browser APIs

## Debugging

### Jest Tests
- Use `console.log` for quick debugging
- Use `debug()` from Testing Library
- Run single test: `npm test -- MyComponent.test.tsx`

### Playwright Tests
- Use `--debug` flag
- Use `page.pause()` in tests
- View trace files for failed tests

## Performance

- Run tests in parallel when possible
- Use `--maxWorkers` flag for CI
- Skip heavy tests in watch mode