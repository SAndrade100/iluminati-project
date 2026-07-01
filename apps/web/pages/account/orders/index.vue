<script setup lang="ts">
import type { Order, PaginatedResult } from '~/types'

definePageMeta({ middleware: 'auth' })

const api = useApi()
const page = ref(1)

const { data, pending } = await useAsyncData(
  'my-orders',
  () => api<PaginatedResult<Order>>('/orders', { params: { page: page.value, limit: 10 } }),
  { watch: [page] },
)

const statusConfig: Record<string, { label: string; class: string }> = {
  PENDING:   { label: 'Aguardando',  class: 'bg-yellow-100 text-yellow-700' },
  CONFIRMED: { label: 'Confirmado',  class: 'bg-blue-100 text-blue-700'   },
  CANCELLED: { label: 'Cancelado',   class: 'bg-red-100 text-red-700'     },
  DELIVERED: { label: 'Entregue',    class: 'bg-green-100 text-green-700' },
}

function setPage(p: number) {
  page.value = p
  window.scrollTo({ top: 0, behavior: 'smooth' })
}
</script>

<template>
  <div class="container mx-auto px-4 py-8 max-w-3xl">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold">Meus Pedidos</h1>
    </div>

    <!-- Skeleton -->
    <div v-if="pending" class="space-y-3">
      <div v-for="i in 4" :key="i" class="h-20 rounded-xl bg-muted animate-pulse" />
    </div>

    <!-- Empty -->
    <div v-else-if="!data?.data.length" class="text-center py-20">
      <div class="text-6xl mb-4">📦</div>
      <h2 class="text-xl font-semibold mb-2">Nenhum pedido ainda</h2>
      <p class="text-muted-foreground mb-6">Explore nossos produtos e faça seu primeiro pedido</p>
      <NuxtLink to="/" class="rounded-lg bg-primary px-6 py-2.5 font-semibold text-primary-foreground hover:bg-primary/90 transition-colors">
        Ver produtos
      </NuxtLink>
    </div>

    <!-- List -->
    <div v-else class="space-y-3">
      <NuxtLink
        v-for="order in data.data"
        :key="order.id"
        :to="`/account/orders/${order.id}`"
        class="flex items-center justify-between p-4 border rounded-xl bg-card hover:shadow-sm hover:border-primary/30 transition-all"
      >
        <div class="flex-1 min-w-0">
          <p class="font-semibold text-sm">
            Pedido #{{ order.id.slice(-8).toUpperCase() }}
          </p>
          <p class="text-xs text-muted-foreground mt-0.5">
            {{ new Date(order.createdAt).toLocaleDateString('pt-BR', { dateStyle: 'medium' }) }}
            · {{ order.items?.length ?? 0 }} {{ (order.items?.length ?? 0) === 1 ? 'item' : 'itens' }}
          </p>
        </div>
        <div class="text-right ml-4 shrink-0">
          <span
            class="text-xs px-2.5 py-1 rounded-full font-semibold"
            :class="statusConfig[order.status]?.class"
          >
            {{ statusConfig[order.status]?.label }}
          </span>
          <p class="text-sm font-bold mt-1.5 text-primary">
            {{ Number(order.totalPrice).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) }}
          </p>
        </div>
      </NuxtLink>

      <!-- Pagination -->
      <div v-if="data.meta.lastPage > 1" class="flex justify-center gap-1.5 mt-6 pt-4 border-t">
        <button
          :disabled="page === 1"
          class="px-3 py-1.5 rounded-lg text-sm border hover:bg-muted disabled:opacity-40"
          @click="setPage(page - 1)"
        >←</button>
        <button
          v-for="p in data.meta.lastPage"
          :key="p"
          class="px-3 py-1.5 rounded-lg text-sm border"
          :class="p === page ? 'bg-primary text-primary-foreground border-primary' : 'hover:bg-muted'"
          @click="setPage(p)"
        >{{ p }}</button>
        <button
          :disabled="page === data.meta.lastPage"
          class="px-3 py-1.5 rounded-lg text-sm border hover:bg-muted disabled:opacity-40"
          @click="setPage(page + 1)"
        >→</button>
      </div>
    </div>
  </div>
</template>
