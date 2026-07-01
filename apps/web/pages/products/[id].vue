<script setup lang="ts">
import type { Product, ReviewStats } from '~/types'

const route = useRoute()
const api = useApi()
const auth = useAuthStore()
const cart = useCartStore()
const toast = useToast()

const productId = route.params.id as string

const { data: product, error: productError } = await useAsyncData(
  `product-${productId}`,
  () => api<Product>(`/products/${productId}`),
  { server: false },
)

const { data: reviewStats, refresh: refreshReviews } = await useAsyncData(
  `reviews-${productId}`,
  () => api<ReviewStats>(`/products/${productId}/reviews`).catch(() => null),
  { server: false },
)

if (productError.value) {
  throw createError({ statusCode: 404, message: 'Produto não encontrado' })
}

const quantity = ref(1)
const addingToCart = ref(false)

const reviewForm = reactive({ rating: 5, comment: '' })
const submittingReview = ref(false)
const reviewError = ref('')

const priceFormatted = computed(() =>
  Number(product.value?.price || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
)

const statusInfo = computed(() => {
  switch (product.value?.status) {
    case 'ACTIVE': return { label: 'Em estoque', class: 'bg-green-100 text-green-700' }
    case 'OUT_OF_STOCK': return { label: 'Esgotado', class: 'bg-red-100 text-red-700' }
    default: return { label: 'Indisponível', class: 'bg-gray-100 text-gray-600' }
  }
})

async function addToCart() {
  if (!auth.isAuthenticated) return navigateTo('/login')
  addingToCart.value = true
  try {
    await cart.addItem(productId, quantity.value)
    toast.success(`${quantity.value}x adicionado ao carrinho!`)
  } catch (e: any) {
    toast.error('Erro', e?.data?.message)
  } finally {
    addingToCart.value = false
  }
}

async function submitReview() {
  reviewError.value = ''
  submittingReview.value = true
  try {
    await api(`/products/${productId}/reviews`, {
      method: 'POST',
      body: { rating: reviewForm.rating, comment: reviewForm.comment || undefined },
    })
    toast.success('Avaliação enviada!')
    reviewForm.rating = 5
    reviewForm.comment = ''
    await refreshReviews()
  } catch (e: any) {
    reviewError.value = e?.data?.message || 'Erro ao enviar avaliação'
  } finally {
    submittingReview.value = false
  }
}
</script>

<template>
  <div v-if="product" class="container mx-auto px-4 py-8">

    <!-- Breadcrumb -->
    <nav class="mb-6 flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
      <NuxtLink to="/" class="hover:text-foreground transition-colors">Home</NuxtLink>
      <span>/</span>
      <span v-if="product.category">
        <button class="hover:text-foreground transition-colors" @click="navigateTo(`/?category=${product.categoryId}`)">
          {{ product.category.name }}
        </button>
      </span>
      <span v-if="product.category">/</span>
      <span class="text-foreground font-medium line-clamp-1">{{ product.name }}</span>
    </nav>

    <!-- Product Detail -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-10 mb-14">

      <!-- Image placeholder -->
      <div class="aspect-square bg-muted rounded-2xl flex items-center justify-center">
        <span class="text-8xl">📦</span>
      </div>

      <!-- Info -->
      <div class="flex flex-col gap-5">
        <div>
          <span v-if="product.category" class="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {{ product.category.name }}
          </span>
          <h1 class="text-2xl sm:text-3xl font-bold mt-1 leading-snug">{{ product.name }}</h1>
        </div>

        <!-- Price & Status -->
        <div class="flex items-center gap-3 flex-wrap">
          <span class="text-3xl font-extrabold text-primary">{{ priceFormatted }}</span>
          <span class="text-xs px-2.5 py-1 rounded-full font-semibold" :class="statusInfo.class">
            {{ statusInfo.label }}
          </span>
        </div>

        <!-- Rating summary -->
        <div v-if="reviewStats?.total" class="flex items-center gap-2">
          <div class="flex text-yellow-400">
            <span v-for="i in 5" :key="i" class="text-lg">{{ i <= Math.round(reviewStats.average) ? '★' : '☆' }}</span>
          </div>
          <span class="text-sm font-medium">{{ reviewStats.average.toFixed(1) }}</span>
          <span class="text-sm text-muted-foreground">({{ reviewStats.total }} avaliação{{ reviewStats.total !== 1 ? 'ões' : '' }})</span>
        </div>

        <!-- Description -->
        <p v-if="product.description" class="text-muted-foreground leading-relaxed">
          {{ product.description }}
        </p>

        <!-- Seller -->
        <div v-if="product.seller" class="text-sm text-muted-foreground flex items-center gap-1">
          🏪 Vendido por:
          <span class="font-semibold text-foreground ml-1">{{ product.seller.storeName }}</span>
        </div>

        <!-- SKU -->
        <p class="text-xs text-muted-foreground">SKU: {{ product.sku }}</p>

        <!-- Add to Cart -->
        <div v-if="product.status === 'ACTIVE'" class="flex items-center gap-3 mt-2 flex-wrap">
          <div class="flex items-center border rounded-lg overflow-hidden">
            <button
              class="px-3 py-2.5 hover:bg-muted transition-colors text-sm font-bold"
              :disabled="quantity <= 1"
              @click="quantity = Math.max(1, quantity - 1)"
            >
              −
            </button>
            <span class="px-5 py-2.5 text-sm font-semibold min-w-[3rem] text-center">{{ quantity }}</span>
            <button
              class="px-3 py-2.5 hover:bg-muted transition-colors text-sm font-bold"
              :disabled="quantity >= product.stock"
              @click="quantity = Math.min(product.stock, quantity + 1)"
            >
              +
            </button>
          </div>
          <button
            :disabled="addingToCart"
            class="flex-1 rounded-lg bg-primary px-6 py-2.5 font-semibold text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
            @click="addToCart"
          >
            {{ addingToCart ? 'Adicionando...' : '🛒 Adicionar ao Carrinho' }}
          </button>
        </div>

        <div v-else class="rounded-lg bg-muted/50 p-4 text-sm text-muted-foreground text-center">
          Este produto não está disponível para compra no momento.
        </div>
      </div>
    </div>

    <!-- Reviews -->
    <section>
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-xl font-bold">Avaliações</h2>
        <div v-if="reviewStats?.total" class="flex items-center gap-2 text-sm">
          <span class="font-bold text-xl">{{ reviewStats.average.toFixed(1) }}</span>
          <div class="flex text-yellow-400 text-base">
            <span v-for="i in 5" :key="i">{{ i <= Math.round(reviewStats.average) ? '★' : '☆' }}</span>
          </div>
          <span class="text-muted-foreground">({{ reviewStats.total }})</span>
        </div>
      </div>

      <!-- Write review -->
      <div v-if="auth.isAuthenticated && auth.isCustomer" class="mb-8 p-6 border rounded-2xl bg-card">
        <h3 class="font-semibold mb-4">Deixar avaliação</h3>
        <form class="space-y-4" @submit.prevent="submitReview">
          <div>
            <label class="block text-sm font-medium mb-2">Nota</label>
            <div class="flex gap-1">
              <button
                v-for="i in 5"
                :key="i"
                type="button"
                class="text-3xl transition-all hover:scale-110 focus:outline-none"
                :class="i <= reviewForm.rating ? 'text-yellow-400' : 'text-gray-300'"
                @click="reviewForm.rating = i"
              >
                ★
              </button>
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium mb-1.5">Comentário <span class="text-muted-foreground">(opcional)</span></label>
            <textarea
              v-model="reviewForm.comment"
              rows="3"
              maxlength="800"
              placeholder="Conte sua experiência com o produto..."
              class="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
            />
          </div>
          <p v-if="reviewError" class="text-sm text-destructive">{{ reviewError }}</p>
          <button
            type="submit"
            :disabled="submittingReview"
            class="rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            {{ submittingReview ? 'Enviando...' : 'Enviar Avaliação' }}
          </button>
        </form>
      </div>

      <!-- Reviews list -->
      <div v-if="!reviewStats?.reviews.length" class="text-center py-12 text-muted-foreground">
        <div class="text-4xl mb-3">⭐</div>
        <p>Nenhuma avaliação ainda. Seja o primeiro!</p>
      </div>
      <div v-else class="space-y-4">
        <div
          v-for="review in reviewStats.reviews"
          :key="review.id"
          class="p-5 border rounded-xl bg-card"
        >
          <div class="flex items-start justify-between mb-3">
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-semibold shrink-0">
                {{ review.user?.name?.[0]?.toUpperCase() || '?' }}
              </div>
              <div>
                <p class="text-sm font-medium">{{ review.user?.name || 'Usuário' }}</p>
                <p class="text-xs text-muted-foreground">
                  {{ new Date(review.createdAt).toLocaleDateString('pt-BR', { dateStyle: 'medium' }) }}
                </p>
              </div>
            </div>
            <div class="flex text-yellow-400">
              <span v-for="i in 5" :key="i" class="text-sm">{{ i <= review.rating ? '★' : '☆' }}</span>
            </div>
          </div>
          <p v-if="review.comment" class="text-sm text-muted-foreground leading-relaxed">
            {{ review.comment }}
          </p>
        </div>
      </div>
    </section>
  </div>
</template>
