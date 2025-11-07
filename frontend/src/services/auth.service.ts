import api from './api'

export interface RegisterData {
  email: string
  password: string
  name?: string
}

export interface LoginData {
  email: string
  password: string
}

export interface AuthResponse {
  user: {
    id: string
    email: string
    name: string | null
    xp: number
    level: number
    isPremium: boolean
  }
  accessToken: string
  refreshToken: string
}

const authService = {
  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await api.post('/auth/register', data)
    const { accessToken, refreshToken, user } = response.data

    localStorage.setItem('accessToken', accessToken)
    localStorage.setItem('refreshToken', refreshToken)

    return response.data
  },

  async login(data: LoginData): Promise<AuthResponse> {
    const response = await api.post('/auth/login', data)
    const { accessToken, refreshToken, user } = response.data

    localStorage.setItem('accessToken', accessToken)
    localStorage.setItem('refreshToken', refreshToken)

    return response.data
  },

  async logout(): Promise<void> {
    const refreshToken = localStorage.getItem('refreshToken')

    try {
      await api.post('/auth/logout', { refreshToken })
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
    }
  },

  async getCurrentUser() {
    const response = await api.get('/auth/me')
    return response.data
  },

  isAuthenticated(): boolean {
    return !!localStorage.getItem('accessToken')
  },
}

export default authService
