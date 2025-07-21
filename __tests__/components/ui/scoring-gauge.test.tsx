import { render, screen } from '@testing-library/react'
import ScoringGauge from '@/components/ui/scoring-gauge'

describe('ScoringGauge', () => {
  it('renders score value correctly', () => {
    render(<ScoringGauge score={750} />)
    expect(screen.getByText('750')).toBeInTheDocument()
  })

  it('shows correct category for poor score', () => {
    render(<ScoringGauge score={400} />)
    expect(screen.getByText(/Плохой/)).toBeInTheDocument()
  })

  it('shows correct category for fair score', () => {
    render(<ScoringGauge score={550} />)
    expect(screen.getByText(/Удовлетворительный/)).toBeInTheDocument()
  })

  it('shows correct category for good score', () => {
    render(<ScoringGauge score={650} />)
    expect(screen.getByText(/Хороший/)).toBeInTheDocument()
  })

  it('shows correct category for very good score', () => {
    render(<ScoringGauge score={750} />)
    expect(screen.getByText(/Очень хороший/)).toBeInTheDocument()
  })

  it('shows correct category for excellent score', () => {
    render(<ScoringGauge score={850} />)
    expect(screen.getByText(/Отличный/)).toBeInTheDocument()
  })

  it('displays change indicator when provided', () => {
    render(<ScoringGauge score={750} previousScore={700} />)
    expect(screen.getByText('+50')).toBeInTheDocument()
  })

  it('shows approval probability', () => {
    render(<ScoringGauge score={750} showProbability />)
    expect(screen.getByText(/Вероятность одобрения/)).toBeInTheDocument()
    expect(screen.getByText(/95%/)).toBeInTheDocument()
  })

  it('applies different sizes', () => {
    const { rerender, container } = render(<ScoringGauge score={750} size="sm" />)
    expect(container.querySelector('svg')).toHaveAttribute('width', '150')
    
    rerender(<ScoringGauge score={750} size="lg" />)
    expect(container.querySelector('svg')).toHaveAttribute('width', '350')
  })

  it('handles edge cases', () => {
    render(<ScoringGauge score={300} />)
    expect(screen.getByText('300')).toBeInTheDocument()
    
    render(<ScoringGauge score={900} />)
    expect(screen.getByText('900')).toBeInTheDocument()
  })

  it('applies custom className', () => {
    const { container } = render(
      <ScoringGauge score={750} className="custom-class" />
    )
    expect(container.firstChild).toHaveClass('custom-class')
  })
})