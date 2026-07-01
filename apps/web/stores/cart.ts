import type { Cart, CartItem } from '~/types'

export const useCartStore = defineStore('cart', {
  state: () => ({
    cart: null as Cart | null,
    loading: false,
  }),

  getters: {
    items: (s): CartItem[] => s.cart?.items ?? [],
    itemCount: (s): number =>
      (s.cart?.items ?? []).reduce((sum, item) => sum + item.quantity, 0),
    total: (s): number =>
      (s.cart?.items ?? []).reduce(
        (sum, item) => sum + Number(item.product.price) * item.quantity,
        0,
      ),
    totalFormatted(): string {
      return this.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
    },
  },

  actions: {
    async fetchCart() {
      const auth = useAuthStore()
      if (!auth.isAuthenticated) return
      this.loading = true
      try {
        const api = useApi()
        this.cart = await api<Cart>('/cart')
      } catch {
        // Cart not created yet — ignore
      } finally {
        this.loading = false
      }
    },

    async addItem(productId: string, quantity = 1) {
      const api = useApi()
      this.cart = await api<Cart>('/cart/items', {
        method: 'POST',
        body: { productId, quantity },
      })
    },

    async removeItem(itemId: string) {
      const api = useApi()
      this.cart = await api<Cart>(`/cart/items/${itemId}`, { method: 'DELETE' })
    },

    async updateQuantity(itemId: string, quantity: number) {
      if (quantity <= 0) return this.removeItem(itemId)
      const api = useApi()
      this.cart = await api<Cart>(`/cart/items/${itemId}`, {
        method: 'PATCH',
        body: { quantity },
      })
    },

    clearCart() {
      this.cart = null
    },
  },
})
