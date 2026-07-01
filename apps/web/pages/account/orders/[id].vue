<script setup lang="ts">
import type { Order } from '~/types'

definePageMeta({ middleware: 'auth' })

const route = useRoute()
const api = useApi()

const { data: order, error } = await useAsyncData(
  `order-${route.params.id}`,
  () => api<Order>(`/orders/${route.params.id}`),
)

if (error.value) {
  throw createError({ statusCode: 404, message: 'Pedido não encontrado' })
}

const statusConfig: Record<string, { label: string; class: string; icon: string }> = {
  PENDING:   { label: 'Aguardando pagamento', class: 'bg-yellow-100 text-yellow-700', icon: '⏳' },
  CONFIRMED: { label: 'Confirmado',           class: 'bg-blue-100 text-blue-700',     icon: '✓'  },
  CANCELLED: { label: 'Cancelado',            class: 'bg-red-100 text-red-700',       icon: '✕'  },
  DELIVERED: { label: 'Entregue',             class: 'bg-green-100 text-green-700',   icon: '📦' },
}

const paymentMethodLabel: Record<string, string> = {
  PIX: '⚡ PIX',
  CREDIT_CARD: '💳 Cartão de crédito',
  BOLETO: '📄 Boleto bancário',
}

const paymentStatusConfig: Record<string, { label: string; class: string }> = {
  PENDING:  { label: 'Aguardando',  class: 'text-yellow-600' },
  APPROVED: { label: 'Aprovado',    class: 'text-green-600'  },
  REFUSED:  { label: 'Recusado',    class: 'text-red-600'    },
  REFUNDED: { label: 'Reembolsado', class: 'text-blue-600'   },
}

const fmt = (v: number | string) =>
  Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
</script>

<template>
  <div v-if="order" class="container mx-auto px-4 py-8 max-w-3xl">

    <!-- Back -->
    <NuxtLink to="/account/orders" class="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6">
      ← Voltar aos pedidos
    </NuxtLink>

    <!-- Header -->
    <div class="flex items-start justify-between mb-6 flex-wrap gap-3">
      <div>
        <h1 class="text-2xl font-bold">Pedido #{{ order.id.slice(-8).toUpperCase() }}</h1>
        <p class="text-muted-foreground text-sm mt-1">
          {{ new Date(order.createdAt).toLocaleDateString('pt-BR', { dateStyle: 'full' }) }}
        </p>
      </div>
      <span
        class="px-3 py-1.5 rounded-full text-sm font-semibold flex items-center gap-1.5"
        :class="statusConfig[order.status]?.class"
      >
        {{ statusConfig[order.status]?.icon }}
        {{ statusConfig[order.status]?.label }}
      </span>
    </div>

    <!-- Items -->
    <div class="p-6 border rounded-2xl bg-card mb-5">
      <h2 class="font-semibold text-base mb-4">Itens do Pedido</h2>
      <div class="space-y-4">
        <div v-for="item in order.items" :key="item.id" class="flex items-center gap-4">
          <div class="w-12 h-12 bg-muted rounded-lg flex items-center justify-center text-xl shrink-0">📦</div>
          <div class="flex-1 min-w-0">
            <p class="font-medium text-sm line-clamp-1">{{ item.product?.name ?? `Produto #${item.productId.slice(-6)}` }}</p>
            <p class="text-xs text-muted-foreground">
              {{ fmt(item.unitPrice) }} × {{ item.quantity }} unidade{{ item.quantity !== 1 ? 's' : '' }}
            </p>
          </div>
          <p class="font-semibold text-sm shrink-0">{{ fmt(Number(item.unitPrice) * item.quantity) }}</p>
        </div>
      </div>
    </div>

    <!-- Payment -->
    <div v-if="order.payment" class="p-6 border rounded-2xl bg-card mb-5">
      <h2 class="font-semibold text-base mb-4">Pagamento</h2>
      <div class="grid grid-cols-2 gap-3 text-sm">
        <div>
          <p class="text-muted-foreground text-xs uppercase tracking-wide mb-1">Método</p>
          <p class="font-medium">{{ paymentMethodLabel[order.payment.method] }}</p>
        </div>
        <div>
          <p class="text-muted-foreground text-xs uppercase tracking-wide mb-1">Status</p>
          <p class="font-semibold" :class="paymentStatusConfig[order.payment.status]?.class">
            {{ paymentStatusConfig[order.payment.status]?.label }}
          </p>
        </div>
      </div>
    </div>

    <!-- Price Breakdown -->
    <div class="p-6 border rounded-2xl bg-card">
      <h2 class="font-semibold text-base mb-4">Valores</h2>
      <div class="space-y-2.5 text-sm">
        <div class="flex justify-between">
          <span class="text-muted-foreground">Subtotal</span>
          <span>{{ fmt(order.totalPrice) }}</span>
        </div>
        <div v-if="order.discountAmount" class="flex justify-between text-green-600">
          <span>Desconto (cupom)</span>
          <span>−{{ fmt(order.discountAmount) }}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-muted-foreground">Frete</span>
          <span class="text-green-600 font-medium">Grátis</span>
        </div>
        <div class="border-t pt-3 mt-3 flex justify-between font-bold text-lg">
          <span>Total</span>
          <span class="text-primary">{{ fmt(order.totalPrice) }}</span>
        </div>
      </div>
    </div>

  </div>
</template>
