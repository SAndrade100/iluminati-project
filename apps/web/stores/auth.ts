import type { User, AuthTokens } from '~/types'

function decodeJwt(token: string): Record<string, unknown> | null {
  try {
    const payload = token.split('.')[1]
    return JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')))
  } catch {
    return null
  }
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as User | null,
    accessToken: null as string | null,
    refreshToken: null as string | null,
  }),

  getters: {
    isAuthenticated: (s): boolean => !!s.accessToken,
    isSeller: (s): boolean => s.user?.role === 'SELLER',
    isAdmin: (s): boolean => s.user?.role === 'ADMIN',
    isCustomer: (s): boolean => s.user?.role === 'CUSTOMER',
    displayName: (s): string => s.user?.name || s.user?.email?.split('@')[0] || 'Usuário',
    initials: (s): string => {
      const name = s.user?.name || s.user?.email || ''
      return name.charAt(0).toUpperCase() || 'U'
    },
  },

  actions: {
    setTokens(tokens: AuthTokens) {
      this.accessToken = tokens.accessToken
      this.refreshToken = tokens.refreshToken
      localStorage.setItem('iluminati_access', tokens.accessToken)
      localStorage.setItem('iluminati_refresh', tokens.refreshToken)

      const payload = decodeJwt(tokens.accessToken)
      if (payload && !this.user) {
        this.user = {
          id: payload.sub as string,
          email: payload.email as string,
          name: (payload.name as string) || (payload.email as string).split('@')[0],
          role: payload.role as User['role'],
        }
      }
    },

    setUser(user: User) {
      this.user = user
    },

    async logout() {
      this.user = null
      this.accessToken = null
      this.refreshToken = null
      localStorage.removeItem('iluminati_access')
      localStorage.removeItem('iluminati_refresh')
      await navigateTo('/login')
    },

    initFromStorage() {
      const access = localStorage.getItem('iluminati_access')
      const refresh = localStorage.getItem('iluminati_refresh')
      if (!access || !refresh) return

      const payload = decodeJwt(access)
      if (!payload) return

      // Check expiry
      const exp = payload.exp as number
      if (exp && Date.now() / 1000 > exp) {
        this.logout()
        return
      }

      this.accessToken = access
      this.refreshToken = refresh
      this.user = {
        id: payload.sub as string,
        email: payload.email as string,
        name: (payload.name as string) || (payload.email as string).split('@')[0],
        role: payload.role as User['role'],
      }
    },
  },
})
