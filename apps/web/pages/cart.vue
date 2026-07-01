<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

const cart = useCartStore()
const toast = useToast()

onMounted(() => cart.fetchCart())

async function handleRemove(itemId: string) {
  try {
    await cart.removeItem(itemId)
    toast.success('Item removido')
  } catch {
    toast.error('Erro ao remover item')
  }
}

async function handleUpdate(itemId: string, qty: number) {
  try {
    await cart.updateQuantity(itemId, qty)
  } catch {
    toast.error('Erro ao atualizar quantidade')
  }
}
</script>

<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-2xl font-bold mb-6">Meu Carrinho</h1>

    <!-- Loading -->
    <div v-if="cart.loading" class="space-y-4">
      <div v-for="i in 3" :key="i" class="h-24 rounded-xl bg-muted animate-pulse" />
    </div>

    <!-- Empty -->
    <div v-else-if="!cart.items.length" class="text-center py-20">
      <div class="text-6xl mb-4">🛒</div>
      <h2 class="text-xl font-semibold mb-2">Seu carrinho está vazio</h2>
      <p class="text-muted-foreground mb-6">Adicione produtos para continuar comprando</p>
      <NuxtLink
        to="/"
        class="inline-flex rounded-lg bg-primary px-6 py-2.5 font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
      >
        Explorar produtos
      </NuxtLink>
    </div>

    <!-- Cart content -->
    <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-8">

      <!-- Items -->
      <div class="lg:col-span-2 space-y-3">
        <div
          v-for="item in cart.items"
          :key="item.id"
          class="flex items-center gap-4 p-4 border rounded-xl bg-card"
        >
          <!-- Image -->
          <div class="w-16 h-16 bg-muted rounded-lg flex items-center justify-center text-2xl shrink-0">
            📦
          </div>

          <!-- Product info -->
          <div class="flex-1 min-w-0">
            <NuxtLink
              :to="`/products/${item.product.id}`"
              class="font-semibold text-sm line-clamp-2 hover:text-primary transition-colors"
            >
              {{ item.product.name }}
            </NuxtLink>
            <p class="text-xs text-muted-foreground mt-1">
              {{ Number(item.product.price).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) }} por unidade
            </p>
          </div>

          <!-- Quantity controls -->
          <div class="flex items-center border rounded-lg overflow-hidden shrink-0">
            <button
              class="px-2.5 py-1.5 text-sm hover:bg-muted transition-colors font-bold"
              @click="handleUpdate(item.id, item.quantity - 1)"
            >
              −
            </button>
            <span class="px-3 py-1.5 text-sm font-semibold min-w-[2.5rem] text-center">{{ item.quantity }}</span>
            <button
              class="px-2.5 py-1.5 text-sm hover:bg-muted transition-colors font-bold"
              @click="handleUpdate(item.id, item.quantity + 1)"
            >
              +
            </button>
          </div>

          <!-- Subtotal + remove -->
          <div class="text-right shrink-0">
            <p class="font-bold text-sm">
              {{ (Number(item.product.price) * item.quantity).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) }}
            </p>
            <button
              class="text-xs text-destructive hover:underline mt-1.5 transition-colors"
              @click="handleRemove(item.id)"
            >
              Remover
            </button>
          </div>
        </div>
      </div>

      <!-- Summary -->
      <div class="lg:col-span-1">
        <div class="p-6 border rounded-2xl bg-card sticky top-4">
          <h2 class="font-semibold text-lg mb-5">Resumo do Pedido</h2>

          <div class="space-y-3 mb-5">
            <div class="flex justify-between text-sm">
              <span class="text-muted-foreground">Subtotal ({{ cart.itemCount }} {{ cart.itemCount === 1 ? 'item' : 'itens' }})</span>
              <span class="font-medium">{{ cart.totalFormatted }}</span>
            </div>
            <div class="flex justify-between text-sm">
              <span class="text-muted-foreground">Frete</span>
              <span class="text-green-600 font-medium">Grátis</span>
            </div>
          </div>

          <div class="border-t pt-4 mb-6">
            <div class="flex justify-between font-bold text-lg">
              <span>Total</span>
              <span class="text-primary">{{ cart.totalFormatted }}</span>
            </div>
          </div>

          <NuxtLink
            to="/checkout"
            class="block w-full text-center rounded-lg bg-primary px-4 py-3 font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Finalizar Compra →
          </NuxtLink>

          <NuxtLink
            to="/"
            class="block w-full text-center mt-3 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Continuar comprando
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>
