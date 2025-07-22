import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { LoanResults } from '@/components/ui/loan-results'
import { LoanCalculation, PreCheckResult } from '@/lib/loan-storage'
import { PDNCalculation } from '@/lib/pdn'

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>
  }
}))

describe('LoanResults', () => {
  const mockCalculation: LoanCalculation = {
    monthlyPayment: 95000,
    totalPayment: 1140000,
    totalInterest: 140000,
    effectiveRate: 14
  }

  const mockPreCheckResult: PreCheckResult = {
    isEligible: true,
    score: 750,
    recommendations: ['Улучшите кредитную историю'],
    estimatedApprovalRate: 0.85
  }

  const mockPDNCalculation: PDNCalculation = {
    pdn_ratio: 0.35,
    status: 'MEDIUM',
    available_income: 200000,
    total_payments: 150000,
    new_payment: 95000,
    risk_level: 'MEDIUM'
  }

  const mockOnContinue = jest.fn()
  const mockOnRecalculate = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders loan calculation results', () => {
    render(
      <LoanResults
        calculation={mockCalculation}
        onContinue={mockOnContinue}
        onRecalculate={mockOnRecalculate}
      />
    )

    expect(screen.getByText('Параметры займа')).toBeInTheDocument()
    expect(screen.getByText('95 000 UZS')).toBeInTheDocument()
    expect(screen.getByText('1 140 000 UZS')).toBeInTheDocument()
    expect(screen.getByText('140 000 UZS')).toBeInTheDocument()
    expect(screen.getByText('14,0%')).toBeInTheDocument()
  })

  it('renders pre-check results when eligible', () => {
    render(
      <LoanResults
        calculation={mockCalculation}
        preCheckResult={mockPreCheckResult}
        onContinue={mockOnContinue}
        onRecalculate={mockOnRecalculate}
      />
    )

    expect(screen.getByText('Предварительная проверка')).toBeInTheDocument()
    expect(screen.getByText('750 (Отличный)')).toBeInTheDocument()
    expect(screen.getByText('Вы подходите для получения займа')).toBeInTheDocument()
    expect(screen.getByText('85,0%')).toBeInTheDocument()
    expect(screen.getByText('Улучшите кредитную историю')).toBeInTheDocument()
  })

  it('renders pre-check results when not eligible', () => {
    const notEligibleResult: PreCheckResult = {
      isEligible: false,
      recommendations: ['Снизьте долговую нагрузку']
    }

    render(
      <LoanResults
        calculation={mockCalculation}
        preCheckResult={notEligibleResult}
        onContinue={mockOnContinue}
        onRecalculate={mockOnRecalculate}
      />
    )

    expect(screen.getByText('К сожалению, займ не может быть одобрен')).toBeInTheDocument()
    expect(screen.getByText('Снизьте долговую нагрузку')).toBeInTheDocument()
  })

  it('renders PDN calculation', () => {
    render(
      <LoanResults
        calculation={mockCalculation}
        pdnCalculation={mockPDNCalculation}
        onContinue={mockOnContinue}
        onRecalculate={mockOnRecalculate}
      />
    )

    expect(screen.getByText('Показатель долговой нагрузки (ПДН)')).toBeInTheDocument()
    expect(screen.getByText('35,0%')).toBeInTheDocument()
    expect(screen.getByText('Средняя нагрузка')).toBeInTheDocument()
    expect(screen.getByText('200 000 UZS')).toBeInTheDocument()
  })

  it('calls onContinue when continue button is clicked', () => {
    render(
      <LoanResults
        calculation={mockCalculation}
        preCheckResult={mockPreCheckResult}
        onContinue={mockOnContinue}
        onRecalculate={mockOnRecalculate}
      />
    )

    const continueButton = screen.getByText('Продолжить оформление')
    fireEvent.click(continueButton)

    expect(mockOnContinue).toHaveBeenCalledTimes(1)
  })

  it('calls onRecalculate when recalculate button is clicked', () => {
    render(
      <LoanResults
        calculation={mockCalculation}
        onContinue={mockOnContinue}
        onRecalculate={mockOnRecalculate}
      />
    )

    const recalculateButton = screen.getByText('Пересчитать')
    fireEvent.click(recalculateButton)

    expect(mockOnRecalculate).toHaveBeenCalledTimes(1)
  })

  it('disables continue button when not eligible', () => {
    const notEligibleResult: PreCheckResult = {
      isEligible: false
    }

    render(
      <LoanResults
        calculation={mockCalculation}
        preCheckResult={notEligibleResult}
        onContinue={mockOnContinue}
        onRecalculate={mockOnRecalculate}
      />
    )

    const continueButton = screen.getByText('Продолжить оформление')
    expect(continueButton).toBeDisabled()
  })

  it('renders correct PDN status colors', () => {
    const testCases = [
      { status: 'LOW', label: 'Низкая нагрузка' },
      { status: 'MEDIUM', label: 'Средняя нагрузка' },
      { status: 'HIGH', label: 'Высокая нагрузка' },
      { status: 'CRITICAL', label: 'Критическая нагрузка' }
    ]

    testCases.forEach(({ status, label }) => {
      const { rerender } = render(
        <LoanResults
          calculation={mockCalculation}
          pdnCalculation={{ ...mockPDNCalculation, status }}
          onContinue={mockOnContinue}
          onRecalculate={mockOnRecalculate}
        />
      )

      expect(screen.getByText(label)).toBeInTheDocument()
      rerender(<></>)
    })
  })

  it('renders correct score badge colors', () => {
    const testCases = [
      { score: 800, label: 'Отличный' },
      { score: 720, label: 'Хороший' },
      { score: 670, label: 'Средний' },
      { score: 600, label: 'Низкий' }
    ]

    testCases.forEach(({ score, label }) => {
      const { rerender } = render(
        <LoanResults
          calculation={mockCalculation}
          preCheckResult={{ ...mockPreCheckResult, score }}
          onContinue={mockOnContinue}
          onRecalculate={mockOnRecalculate}
        />
      )

      expect(screen.getByText(`${score} (${label})`)).toBeInTheDocument()
      rerender(<></>)
    })
  })
})