import { render, screen } from '@testing-library/react'
import PDNIndicator from '@/components/ui/pdn-indicator'

describe('PDNIndicator', () => {
  const defaultProps = {
    pdnValue: 35,
    monthlyIncome: 5000000,
    totalPayments: 1750000,
  }

  it('renders PDN value correctly', () => {
    render(<PDNIndicator {...defaultProps} />)
    expect(screen.getByText('35%')).toBeInTheDocument()
  })

  it('shows correct risk level for low PDN', () => {
    render(<PDNIndicator {...defaultProps} pdnValue={20} />)
    expect(screen.getByText('Низкий риск')).toBeInTheDocument()
  })

  it('shows correct risk level for medium PDN', () => {
    render(<PDNIndicator {...defaultProps} pdnValue={35} />)
    expect(screen.getByText('Средний риск')).toBeInTheDocument()
  })

  it('shows correct risk level for high PDN', () => {
    render(<PDNIndicator {...defaultProps} pdnValue={55} />)
    expect(screen.getByText('Высокий риск')).toBeInTheDocument()
  })

  it('shows correct risk level for critical PDN', () => {
    render(<PDNIndicator {...defaultProps} pdnValue={75} />)
    expect(screen.getByText('Критический риск')).toBeInTheDocument()
  })

  it('displays income and payments breakdown', () => {
    render(<PDNIndicator {...defaultProps} showDetails />)
    expect(screen.getByText(/Доход:/)).toBeInTheDocument()
    expect(screen.getByText(/5 000 000/)).toBeInTheDocument()
    expect(screen.getByText(/Платежи:/)).toBeInTheDocument()
    expect(screen.getByText(/1 750 000/)).toBeInTheDocument()
  })

  it('hides details when showDetails is false', () => {
    render(<PDNIndicator {...defaultProps} showDetails={false} />)
    expect(screen.queryByText(/Доход:/)).not.toBeInTheDocument()
  })

  it('applies custom className', () => {
    const { container } = render(
      <PDNIndicator {...defaultProps} className="custom-class" />
    )
    expect(container.firstChild).toHaveClass('custom-class')
  })

  it('renders without crashing with edge values', () => {
    render(<PDNIndicator pdnValue={0} monthlyIncome={0} totalPayments={0} />)
    expect(screen.getByText('0%')).toBeInTheDocument()
    
    render(<PDNIndicator pdnValue={100} monthlyIncome={1000} totalPayments={1000} />)
    expect(screen.getByText('100%')).toBeInTheDocument()
  })
})