/**
 * Unit tests for Button component
 */
import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'

// Mock Button component - replace with actual import once created
const Button: React.FC<{
  children: React.ReactNode
  onClick?: () => void
  disabled?: boolean
  variant?: 'primary' | 'secondary' | 'danger'
  size?: 'sm' | 'md' | 'lg'
}> = ({ children, onClick, disabled = false, variant = 'primary', size = 'md' }) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`btn btn-${variant} btn-${size}`}
      data-testid="button"
    >
      {children}
    </button>
  )
}

describe('Button', () => {
  it('should render with children', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByText('Click me')).toBeInTheDocument()
  })

  it('should call onClick when clicked', () => {
    const handleClick = jest.fn()
    render(<Button onClick={handleClick}>Click me</Button>)
    
    const button = screen.getByTestId('button')
    fireEvent.click(button)
    
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('should not call onClick when disabled', () => {
    const handleClick = jest.fn()
    render(<Button onClick={handleClick} disabled>Click me</Button>)
    
    const button = screen.getByTestId('button')
    fireEvent.click(button)
    
    expect(handleClick).not.toHaveBeenCalled()
  })

  it('should apply correct variant class', () => {
    const { rerender } = render(<Button variant="primary">Primary</Button>)
    expect(screen.getByTestId('button')).toHaveClass('btn-primary')
    
    rerender(<Button variant="secondary">Secondary</Button>)
    expect(screen.getByTestId('button')).toHaveClass('btn-secondary')
    
    rerender(<Button variant="danger">Danger</Button>)
    expect(screen.getByTestId('button')).toHaveClass('btn-danger')
  })

  it('should apply correct size class', () => {
    const { rerender } = render(<Button size="sm">Small</Button>)
    expect(screen.getByTestId('button')).toHaveClass('btn-sm')
    
    rerender(<Button size="md">Medium</Button>)
    expect(screen.getByTestId('button')).toHaveClass('btn-md')
    
    rerender(<Button size="lg">Large</Button>)
    expect(screen.getByTestId('button')).toHaveClass('btn-lg')
  })

  it('should be disabled when disabled prop is true', () => {
    render(<Button disabled>Disabled</Button>)
    expect(screen.getByTestId('button')).toBeDisabled()
  })

  it('should be enabled by default', () => {
    render(<Button>Enabled</Button>)
    expect(screen.getByTestId('button')).toBeEnabled()
  })
})
