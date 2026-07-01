<script setup lang="ts">
import type { Product } from '~/types'

const props = defineProps<{ product: Product }>()

const cart = useCartStore()
const auth = useAuthStore()
const toast = useToast()
const adding = ref(false)

const priceFormatted = computed(() =>
  Number(props.product.price).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
)

async function addToCart() {
  if (!auth.isAuthenticated) {
    return navigateTo('/login')
  }
  adding.value = true
  try {
    await cart.addItem(props.product.id, 1)
    toast.success('Adicionado ao carrinho!', props.product.name)
  } catch (e: any) {
    toast.error('Erro', e?.data?.message || 'Não foi possível adicionar ao carrinho')
  } finally {
    adding.value = false
  }
}
</script>

<template>
  <article class="group border rounded-xl bg-card overflow-hidden hover:shadow-md transition-all duration-200">
    <NuxtLink :to="`/products/${product.id}`" class="block">
      <div class="aspect-square bg-muted flex items-center justify-center text-5xl text-muted-foreground group-hover:bg-muted/70 transition-colors">
        📦
      </div>
    </NuxtLink>

    <div class="p-4">
      <div v-if="product.category" class="text-xs text-muted-foreground mb-1 uppercase tracking-wide">
        {{ product.category.name }}
      </div>

      <NuxtLink :to="`/products/${product.id}`">
        <h3 class="font-semibold text-sm line-clamp-2 hover:text-primary transition-colors leading-snug">
          {{ product.name }}
        </h3>
      </NuxtLink>

      <p v-if="product.seller" class="text-xs text-muted-foreground mt-1 truncate">
        {{ product.seller.storeName }}
      </p>

      <div class="flex items-center justify-between mt-3">
        <span class="font-bold text-primary text-base">{{ priceFormatted }}</span>
        <span
          v-if="product.status !== 'ACTIVE'"
          class="text-xs px-2 py-0.5 bg-muted text-muted-foreground rounded-full"
        >
          {{ product.status === 'OUT_OF_STOCK' ? 'Esgotado' : 'Indisponível' }}
        </span>
      </div>

      <button
        v-if="product.status === 'ACTIVE'"
        :disabled="adding"
        class="mt-3 w-full rounded-lg border border-primary text-primary text-sm py-2 hover:bg-primary hover:text-primary-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        @click.prevent="addToCart"
      >
        {{ adding ? 'Adicionando...' : '+ Carrinho' }}
      </button>
    </div>
  </article>
</template>
