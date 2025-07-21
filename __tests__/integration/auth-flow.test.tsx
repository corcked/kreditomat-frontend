import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AuthProvider, useAuth } from '@/contexts/auth-context'
import { api } from '@/lib/api'

// Mock API
jest.mock('@/lib/api', () => ({
  api: {
    auth: {
      request: jest.fn(),
      verify: jest.fn(),
      logout: jest.fn(),
      getMe: jest.fn(),
    },
  },
}))

// Test component that uses auth
function TestComponent() {
  const { user, isAuthenticated, login, logout, loading } = useAuth()
  
  return (
    <div>
      {loading && <div>Loading...</div>}
      {isAuthenticated ? (
        <>
          <div>Logged in as: {user?.phone_number}</div>
          <button onClick={logout}>Logout</button>
        </>
      ) : (
        <>
          <div>Not logged in</div>
          <button onClick={() => login('+998901234567', '123456')}>
            Login
          </button>
        </>
      )}
    </div>
  )
}

describe('Auth Flow Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    localStorage.clear()
  })

  it('should complete full authentication flow', async () => {
    const user = userEvent.setup()
    
    // Mock successful API responses
    ;(api.auth.verify as jest.Mock).mockResolvedValue({
      access_token: 'test-token',
      user: {
        id: 1,
        phone_number: '+998901234567',
        is_active: true,
      },
    })
    
    ;(api.auth.getMe as jest.Mock).mockResolvedValue({
      id: 1,
      phone_number: '+998901234567',
      is_active: true,
    })
    
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )
    
    // Initially not logged in
    expect(screen.getByText('Not logged in')).toBeInTheDocument()
    
    // Click login
    await user.click(screen.getByText('Login'))
    
    // Should be logged in
    await waitFor(() => {
      expect(screen.getByText('Logged in as: +998901234567')).toBeInTheDocument()
    })
    
    // Token should be stored
    expect(localStorage.getItem('access_token')).toBe('test-token')
  })

  it('should handle logout', async () => {
    const user = userEvent.setup()
    
    // Set initial auth state
    localStorage.setItem('access_token', 'test-token')
    localStorage.setItem('user_id', '1')
    
    ;(api.auth.getMe as jest.Mock).mockResolvedValue({
      id: 1,
      phone_number: '+998901234567',
      is_active: true,
    })
    
    ;(api.auth.logout as jest.Mock).mockResolvedValue({})
    
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )
    
    // Should be logged in
    await waitFor(() => {
      expect(screen.getByText('Logged in as: +998901234567')).toBeInTheDocument()
    })
    
    // Click logout
    await user.click(screen.getByText('Logout'))
    
    // Should be logged out
    await waitFor(() => {
      expect(screen.getByText('Not logged in')).toBeInTheDocument()
    })
    
    // Token should be removed
    expect(localStorage.getItem('access_token')).toBeNull()
  })

  it('should handle authentication errors', async () => {
    const user = userEvent.setup()
    
    // Mock API error
    ;(api.auth.verify as jest.Mock).mockRejectedValue(
      new Error('Invalid code')
    )
    
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )
    
    // Click login
    await user.click(screen.getByText('Login'))
    
    // Should still not be logged in
    await waitFor(() => {
      expect(screen.getByText('Not logged in')).toBeInTheDocument()
    })
    
    // No token should be stored
    expect(localStorage.getItem('access_token')).toBeNull()
  })
})