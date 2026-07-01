<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

const auth = useAuthStore()
const api = useApi()

onMounted(() => {
  if (!auth.isSeller && !auth.isAdmin) navigateTo('/')
})

const { data: products } = await useAsyncData('seller-products-dash', () =>
  api<{ data: any[]; meta: { total: number } }>('/products?limit=5').catch(() => null),
)
</script>

<template>
  <div class="container mx-auto px-4 py-8">

    <!-- Header -->
    <div class="mb-8">
      <p class="text-sm text-muted-foreground font-medium uppercase tracking-wider mb-1">Painel do Vendedor</p>
      <h1 class="text-3xl font-extrabold">Olá, {{ auth.displayName }} 👋</h1>
    </div>

    <!-- Quick Actions -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      <NuxtLink
        to="/seller/products/new"
        class="group p-5 border rounded-2xl bg-card hover:border-primary hover:bg-primary/5 transition-all text-center"
      >
        <div class="text-3xl mb-2">➕</div>
        <p class="text-sm font-semibold group-hover:text-primary transition-colors">Novo Produto</p>
      </NuxtLink>

      <NuxtLink
        to="/seller/products"
        class="group p-5 border rounded-2xl bg-card hover:border-primary hover:bg-primary/5 transition-all text-center"
      >
        <div class="text-3xl mb-2">📦</div>
        <p class="text-sm font-semibold">Meus Produtos</p>
        <p v-if="products?.meta" class="text-xs text-muted-foreground mt-0.5">
          {{ products.meta.total }} cadastrado{{ products.meta.total !== 1 ? 's' : '' }}
        </p>
      </NuxtLink>

      <NuxtLink
        to="/account/orders"
        class="group p-5 border rounded-2xl bg-card hover:border-primary hover:bg-primary/5 transition-all text-center"
      >
        <div class="text-3xl mb-2">🛒</div>
        <p class="text-sm font-semibold">Pedidos</p>
      </NuxtLink>

      <NuxtLink
        to="/"
        class="group p-5 border rounded-2xl bg-card hover:border-primary hover:bg-primary/5 transition-all text-center"
      >
        <div class="text-3xl mb-2">🏪</div>
        <p class="text-sm font-semibold">Ver Loja</p>
      </NuxtLink>
    </div>

    <!-- Recent Products -->
    <div class="p-6 border rounded-2xl bg-card">
      <div class="flex items-center justify-between mb-5">
        <h2 class="font-semibold text-lg">Produtos Recentes</h2>
        <NuxtLink to="/seller/products" class="text-sm text-primary hover:underline font-medium">
          Ver todos →
        </NuxtLink>
      </div>

      <div v-if="!products?.data?.length" class="text-center py-8 text-muted-foreground">
        <div class="text-4xl mb-3">📦</div>
        <p>Nenhum produto cadastrado.</p>
        <NuxtLink to="/seller/products/new" class="text-primary hover:underline text-sm mt-2 inline-block">
          Criar primeiro produto →
        </NuxtLink>
      </div>

      <div v-else class="divide-y">
        <div
          v-for="p in products.data"
          :key="p.id"
          class="flex items-center justify-between py-3"
        >
          <div class="flex-1 min-w-0">
            <NuxtLink :to="`/products/${p.id}`" class="text-sm font-medium hover:text-primary transition-colors line-clamp-1">
              {{ p.name }}
            </NuxtLink>
            <p class="text-xs text-muted-foreground">SKU: {{ p.sku }} · Estoque: {{ p.stock }}</p>
          </div>
          <div class="ml-4 text-right shrink-0">
            <p class="text-sm font-bold text-primary">
              {{ Number(p.price).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) }}
            </p>
            <span
              class="text-xs px-1.5 py-0.5 rounded-full"
              :class="{
                'bg-green-100 text-green-700': p.status === 'ACTIVE',
                'bg-gray-100 text-gray-600': p.status === 'INACTIVE',
                'bg-red-100 text-red-700': p.status === 'OUT_OF_STOCK',
              }"
            >
              {{ p.status === 'ACTIVE' ? 'Ativo' : p.status === 'INACTIVE' ? 'Inativo' : 'Esgotado' }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
