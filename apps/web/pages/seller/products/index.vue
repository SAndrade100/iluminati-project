<script setup lang="ts">
import type { Product, PaginatedResult } from '~/types'

definePageMeta({ middleware: 'auth' })

const auth = useAuthStore()
const api = useApi()
const toast = useToast()

onMounted(() => {
  if (!auth.isSeller && !auth.isAdmin) navigateTo('/')
})

const page = ref(1)

const { data, pending, refresh } = await useAsyncData(
  'seller-products-list',
  () => api<PaginatedResult<Product>>('/products', {
    params: { page: page.value, limit: 12, sellerId: auth.user?.id },
  }),
  { watch: [page] },
)

async function toggleStatus(product: Product) {
  try {
    const newStatus = product.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'
    await api(`/products/${product.id}`, { method: 'PATCH', body: { status: newStatus } })
    await refresh()
    toast.success(`Produto ${newStatus === 'ACTIVE' ? 'ativado' : 'desativado'}`)
  } catch (e: any) {
    toast.error('Erro', e?.data?.message)
  }
}

async function remove(id: string, name: string) {
  if (!confirm(`Remover "${name}"?`)) return
  try {
    await api(`/products/${id}`, { method: 'DELETE' })
    await refresh()
    toast.success('Produto removido')
  } catch (e: any) {
    toast.error('Erro ao remover', e?.data?.message)
  }
}
</script>

<template>
  <div class="container mx-auto px-4 py-8">
    <div class="flex items-center justify-between mb-6">
      <div>
        <div class="flex items-center gap-2 mb-1">
          <NuxtLink to="/seller/dashboard" class="text-sm text-muted-foreground hover:text-foreground">Painel</NuxtLink>
          <span class="text-muted-foreground">/</span>
          <span class="text-sm font-medium">Produtos</span>
        </div>
        <h1 class="text-2xl font-bold">Meus Produtos</h1>
      </div>
      <NuxtLink
        to="/seller/products/new"
        class="rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
      >
        + Novo Produto
      </NuxtLink>
    </div>

    <!-- Skeleton -->
    <div v-if="pending" class="space-y-2">
      <div v-for="i in 5" :key="i" class="h-14 rounded-lg bg-muted animate-pulse" />
    </div>

    <!-- Empty -->
    <div v-else-if="!data?.data.length" class="text-center py-20 text-muted-foreground">
      <div class="text-5xl mb-4">📦</div>
      <p class="font-medium">Nenhum produto cadastrado</p>
      <NuxtLink to="/seller/products/new" class="text-primary hover:underline text-sm mt-2 inline-block">
        Criar primeiro produto →
      </NuxtLink>
    </div>

    <!-- Table -->
    <div v-else>
      <div class="overflow-x-auto rounded-2xl border bg-card">
        <table class="w-full text-sm">
          <thead class="border-b bg-muted/30">
            <tr>
              <th class="text-left px-4 py-3 font-semibold text-muted-foreground">Produto</th>
              <th class="text-left px-4 py-3 font-semibold text-muted-foreground hidden sm:table-cell">SKU</th>
              <th class="text-right px-4 py-3 font-semibold text-muted-foreground">Preço</th>
              <th class="text-right px-4 py-3 font-semibold text-muted-foreground hidden md:table-cell">Estoque</th>
              <th class="text-center px-4 py-3 font-semibold text-muted-foreground">Status</th>
              <th class="text-right px-4 py-3 font-semibold text-muted-foreground">Ações</th>
            </tr>
          </thead>
          <tbody class="divide-y">
            <tr
              v-for="product in data.data"
              :key="product.id"
              class="hover:bg-muted/30 transition-colors"
            >
              <td class="px-4 py-3">
                <NuxtLink :to="`/products/${product.id}`" class="font-medium hover:text-primary transition-colors line-clamp-1">
                  {{ product.name }}
                </NuxtLink>
                <p v-if="product.category" class="text-xs text-muted-foreground">{{ product.category.name }}</p>
              </td>
              <td class="px-4 py-3 text-muted-foreground hidden sm:table-cell font-mono text-xs">
                {{ product.sku }}
              </td>
              <td class="px-4 py-3 text-right font-semibold text-primary">
                {{ Number(product.price).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) }}
              </td>
              <td class="px-4 py-3 text-right text-muted-foreground hidden md:table-cell">
                {{ product.stock }}
              </td>
              <td class="px-4 py-3 text-center">
                <span
                  class="inline-flex text-xs px-2 py-0.5 rounded-full font-semibold"
                  :class="{
                    'bg-green-100 text-green-700': product.status === 'ACTIVE',
                    'bg-gray-100 text-gray-600': product.status === 'INACTIVE',
                    'bg-red-100 text-red-700': product.status === 'OUT_OF_STOCK',
                  }"
                >
                  {{ product.status === 'ACTIVE' ? 'Ativo' : product.status === 'INACTIVE' ? 'Inativo' : 'Esgotado' }}
                </span>
              </td>
              <td class="px-4 py-3">
                <div class="flex gap-3 justify-end">
                  <button
                    class="text-xs font-medium hover:underline"
                    :class="product.status === 'ACTIVE' ? 'text-muted-foreground' : 'text-primary'"
                    @click="toggleStatus(product)"
                  >
                    {{ product.status === 'ACTIVE' ? 'Desativar' : 'Ativar' }}
                  </button>
                  <button
                    class="text-xs text-destructive hover:underline font-medium"
                    @click="remove(product.id, product.name)"
                  >
                    Remover
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div v-if="data.meta.lastPage > 1" class="flex justify-center gap-1.5 mt-6">
        <button
          v-for="p in data.meta.lastPage"
          :key="p"
          class="px-3 py-1.5 rounded-lg text-sm border"
          :class="p === page ? 'bg-primary text-primary-foreground border-primary' : 'hover:bg-muted'"
          @click="page = p"
        >
          {{ p }}
        </button>
      </div>
    </div>
  </div>
</template>
