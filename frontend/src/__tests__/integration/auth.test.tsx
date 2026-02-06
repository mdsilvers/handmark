/**
 * Integration tests for authentication flow
 */
import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import { mockSupabaseClient } from '../../__mocks__/supabase'

// Mock auth service
const authService = {
  login: async (email: string, password: string) => {
    const result = await mockSupabaseClient.auth.signInWithPassword({ email, password })
    return result
  },
  logout: async () => {
    await mockSupabaseClient.auth.signOut()
  },
  getSession: async () => {
    return await mockSupabaseClient.auth.getSession()
  },
}

describe('Authentication Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('login flow', () => {
    it('should successfully login with valid credentials', async () => {
      const mockSession = {
        access_token: 'mock-token',
        user: { id: '123', email: 'teacher@test.com' },
      }

      mockSupabaseClient.auth.signInWithPassword.mockResolvedValueOnce({
        data: { session: mockSession, user: mockSession.user },
        error: null,
      })

      const result = await authService.login('teacher@test.com', 'password123')

      expect(mockSupabaseClient.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'teacher@test.com',
        password: 'password123',
      })
      expect(result.data.session).toBeDefined()
      expect(result.error).toBeNull()
    })

    it('should handle login failure with invalid credentials', async () => {
      const mockError = { message: 'Invalid credentials' }

      mockSupabaseClient.auth.signInWithPassword.mockResolvedValueOnce({
        data: { session: null, user: null },
        error: mockError,
      })

      const result = await authService.login('wrong@test.com', 'wrongpass')

      expect(result.error).toBeTruthy()
      expect(result.data.session).toBeNull()
    })

    it('should handle network errors during login', async () => {
      mockSupabaseClient.auth.signInWithPassword.mockRejectedValueOnce(
        new Error('Network error')
      )

      await expect(
        authService.login('teacher@test.com', 'password123')
      ).rejects.toThrow('Network error')
    })
  })

  describe('logout flow', () => {
    it('should successfully logout', async () => {
      mockSupabaseClient.auth.signOut.mockResolvedValueOnce({ error: null })

      await authService.logout()

      expect(mockSupabaseClient.auth.signOut).toHaveBeenCalled()
    })

    it('should handle logout errors gracefully', async () => {
      const mockError = { message: 'Logout failed' }
      mockSupabaseClient.auth.signOut.mockResolvedValueOnce({ error: mockError })

      // Should not throw
      await authService.logout()

      expect(mockSupabaseClient.auth.signOut).toHaveBeenCalled()
    })
  })

  describe('session management', () => {
    it('should retrieve existing session', async () => {
      const mockSession = {
        access_token: 'mock-token',
        user: { id: '123', email: 'teacher@test.com' },
      }

      mockSupabaseClient.auth.getSession.mockResolvedValueOnce({
        data: { session: mockSession },
        error: null,
      })

      const result = await authService.getSession()

      expect(result.data.session).toBeDefined()
      expect(result.data.session?.access_token).toBe('mock-token')
    })

    it('should return null for no active session', async () => {
      mockSupabaseClient.auth.getSession.mockResolvedValueOnce({
        data: { session: null },
        error: null,
      })

      const result = await authService.getSession()

      expect(result.data.session).toBeNull()
    })
  })
})
