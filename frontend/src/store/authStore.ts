import { create } from 'zustand'

interface User {
  id: string
  email: string
  name: string | null
  xp: number
  level: number
  isPremium: boolean
  streak: number
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  setUser: (user: User | null) => void
  setIsAuthenticated: (value: boolean) => void
  setIsLoading: (value: boolean) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: !!localStorage.getItem('accessToken'),
  isLoading: true,

  setUser: (user) => set({ user }),

  setIsAuthenticated: (value) => set({ isAuthenticated: value }),

  setIsLoading: (value) => set({ isLoading: value }),

  logout: () => {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    set({ user: null, isAuthenticated: false })
  },
}))
