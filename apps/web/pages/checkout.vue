<script setup lang="ts">
import type { Address } from '~/types'

definePageMeta({ middleware: 'auth' })

const api = useApi()
const cart = useCartStore()
const toast = useToast()

const addresses = ref<Address[]>([])
const selectedAddressId = ref('')
const couponCode = ref('')
const couponDiscount = ref(0)
const couponError = ref('')
const paymentMethod = ref<'PIX' | 'CREDIT_CARD' | 'BOLETO'>('PIX')
const loading = ref(false)
const applyingCoupon = ref(false)

onMounted(async () => {
  await cart.fetchCart()
  try {
    addresses.value = await api<Address[]>('/addresses')
    const def = addresses.value.find((a) => a.isDefault) ?? addresses.value[0]
    if (def) selectedAddressId.value = def.id
  } catch { /* no addresses */ }
})

const subtotal = computed(() => cart.total)
const finalTotal = computed(() => Math.max(0, subtotal.value - couponDiscount.value))

const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

const paymentMethods = [
  { value: 'PIX', label: 'PIX', icon: '⚡', description: 'Aprovação imediata' },
  { value: 'CREDIT_CARD', label: 'Crédito', icon: '💳', description: 'Até 12x' },
  { value: 'BOLETO', label: 'Boleto', icon: '📄', description: '1-3 dias úteis' },
] as const

async function applyCoupon() {
  if (!couponCode.value.trim()) return
  applyingCoupon.value = true
  couponError.value = ''
  couponDiscount.value = 0
  try {
    const data = await api<{ discount: number }>(
      `/coupons/${couponCode.value.trim().toUpperCase()}/validate`,
      { params: { orderSubtotal: subtotal.value } },
    )
    couponDiscount.value = data.discount
    toast.success(`Cupom aplicado! Desconto de ${fmt(data.discount)}`)
  } catch (e: any) {
    couponError.value = e?.data?.message || 'Cupom inválido ou expirado'
  } finally {
    applyingCoupon.value = false
  }
}

async function placeOrder() {
  if (!selectedAddressId.value) {
    toast.error('Selecione um endereço de entrega')
    return
  }
  loading.value = true
  try {
    const result = await api<{ orderId: string }>('/cart/checkout', {
      method: 'POST',
      body: {
        addressId: selectedAddressId.value,
        paymentMethod: paymentMethod.value,
        couponCode: couponCode.value.trim().toUpperCase() || undefined,
      },
    })
    cart.clearCart()
    await navigateTo(`/checkout/success?orderId=${result.orderId}`)
  } catch (e: any) {
    toast.error('Erro ao finalizar pedido', e?.data?.message)
  } finally {
    loading.value = false
  }
}

const addressLabel = (l: string) =>
  l === 'HOME' ? '🏠 Casa' : l === 'WORK' ? '💼 Trabalho' : '📍 Outro'
</script>

<template>
  <div class="container mx-auto px-4 py-8 max-w-5xl">
    <h1 class="text-2xl font-bold mb-8">Finalizar Compra</h1>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">

      <!-- Left column: Delivery + Payment + Coupon -->
      <div class="lg:col-span-2 space-y-6">

        <!-- Delivery Address -->
        <section class="p-6 border rounded-2xl bg-card">
          <h2 class="font-semibold text-lg mb-4 flex items-center gap-2">
            <span>📍</span> Endereço de Entrega
          </h2>
          <div v-if="!addresses.length" class="text-sm text-muted-foreground">
            Nenhum endereço cadastrado.
            <NuxtLink to="/account/addresses" class="text-primary hover:underline">
              Adicionar endereço →
            </NuxtLink>
          </div>
          <div v-else class="space-y-3">
            <label
              v-for="addr in addresses"
              :key="addr.id"
              class="flex items-start gap-3 p-3 border rounded-xl cursor-pointer transition-colors"
              :class="selectedAddressId === addr.id ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'"
            >
              <input v-model="selectedAddressId" type="radio" :value="addr.id" class="mt-1" />
              <div class="text-sm">
                <p class="font-semibold">{{ addressLabel(addr.label) }}</p>
                <p class="text-muted-foreground">
                  {{ addr.street }}, {{ addr.number }}<span v-if="addr.complement">, {{ addr.complement }}</span>
                </p>
                <p class="text-muted-foreground">
                  {{ addr.neighborhood }} — {{ addr.city }}/{{ addr.state }} — CEP {{ addr.zipCode }}
                </p>
              </div>
              <span v-if="addr.isDefault" class="ml-auto text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium shrink-0">
                Padrão
              </span>
            </label>
          </div>
        </section>

        <!-- Payment Method -->
        <section class="p-6 border rounded-2xl bg-card">
          <h2 class="font-semibold text-lg mb-4 flex items-center gap-2">
            <span>💳</span> Forma de Pagamento
          </h2>
          <div class="grid grid-cols-3 gap-3">
            <label
              v-for="method in paymentMethods"
              :key="method.value"
              class="flex flex-col items-center gap-2 p-4 border rounded-xl cursor-pointer transition-colors text-center"
              :class="paymentMethod === method.value ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'"
            >
              <input v-model="paymentMethod" type="radio" :value="method.value" class="sr-only" />
              <span class="text-2xl">{{ method.icon }}</span>
              <span class="text-sm font-semibold">{{ method.label }}</span>
              <span class="text-xs text-muted-foreground">{{ method.description }}</span>
            </label>
          </div>
        </section>

        <!-- Coupon -->
        <section class="p-6 border rounded-2xl bg-card">
          <h2 class="font-semibold text-lg mb-4 flex items-center gap-2">
            <span>🎟️</span> Cupom de Desconto
          </h2>
          <div class="flex gap-2">
            <input
              v-model="couponCode"
              type="text"
              placeholder="Digite o código do cupom"
              :disabled="couponDiscount > 0"
              class="flex-1 rounded-lg border border-input bg-background px-3 py-2 text-sm uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
              @keyup.enter="applyCoupon"
            />
            <button
              :disabled="applyingCoupon || couponDiscount > 0"
              class="rounded-lg bg-secondary px-4 py-2 text-sm font-medium hover:bg-secondary/80 transition-colors disabled:opacity-50"
              @click="applyCoupon"
            >
              {{ applyingCoupon ? '...' : couponDiscount > 0 ? '✓' : 'Aplicar' }}
            </button>
            <button
              v-if="couponDiscount > 0"
              class="rounded-lg border px-3 py-2 text-sm text-destructive hover:bg-muted transition-colors"
              @click="couponCode = ''; couponDiscount = 0; couponError = ''"
            >
              ✕
            </button>
          </div>
          <p v-if="couponError" class="text-sm text-destructive mt-2">{{ couponError }}</p>
          <p v-if="couponDiscount > 0" class="text-sm text-green-600 mt-2 font-medium">
            ✓ Desconto de {{ fmt(couponDiscount) }} aplicado!
          </p>
        </section>
      </div>

      <!-- Right column: Order Summary -->
      <div>
        <div class="p-6 border rounded-2xl bg-card sticky top-4">
          <h2 class="font-semibold text-lg mb-5">Resumo</h2>

          <!-- Items list -->
          <div class="space-y-2 mb-5 max-h-52 overflow-y-auto">
            <div
              v-for="item in cart.items"
              :key="item.id"
              class="flex justify-between text-sm"
            >
              <span class="text-muted-foreground line-clamp-1 flex-1 pr-2">
                {{ item.product.name }}
                <span class="text-xs">(×{{ item.quantity }})</span>
              </span>
              <span class="font-medium shrink-0">
                {{ fmt(Number(item.product.price) * item.quantity) }}
              </span>
            </div>
          </div>

          <div class="border-t pt-4 space-y-2 text-sm">
            <div class="flex justify-between">
              <span class="text-muted-foreground">Subtotal</span>
              <span>{{ fmt(subtotal) }}</span>
            </div>
            <div v-if="couponDiscount > 0" class="flex justify-between text-green-600">
              <span>Desconto ({{ couponCode }})</span>
              <span>−{{ fmt(couponDiscount) }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-muted-foreground">Frete</span>
              <span class="text-green-600 font-medium">Grátis</span>
            </div>
          </div>

          <div class="border-t pt-4 mt-4 mb-6">
            <div class="flex justify-between font-bold text-xl">
              <span>Total</span>
              <span class="text-primary">{{ fmt(finalTotal) }}</span>
            </div>
          </div>

          <button
            :disabled="loading || !cart.items.length || !selectedAddressId"
            class="w-full rounded-lg bg-primary px-4 py-3 font-semibold text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            @click="placeOrder"
          >
            {{ loading ? 'Processando...' : '✓ Confirmar Pedido' }}
          </button>

          <p class="text-xs text-muted-foreground text-center mt-3">
            Ao confirmar, você concorda com os termos de compra.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
