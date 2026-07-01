<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

const route = useRoute()
const orderId = computed(() => route.query.orderId as string | undefined)
</script>

<template>
  <div class="container mx-auto px-4 py-20 text-center max-w-md">
    <div class="text-8xl mb-6 animate-bounce">🎉</div>
    <h1 class="text-3xl font-extrabold mb-3">Pedido Confirmado!</h1>
    <p class="text-muted-foreground text-lg mb-2">
      Seu pedido foi criado com sucesso e está sendo processado.
    </p>
    <p v-if="orderId" class="text-sm text-muted-foreground mb-8 font-mono bg-muted inline-block px-3 py-1 rounded-lg">
      Pedido #{{ orderId.slice(-8).toUpperCase() }}
    </p>

    <div class="flex flex-col sm:flex-row gap-3 justify-center mt-6">
      <NuxtLink
        to="/account/orders"
        class="rounded-lg bg-primary px-6 py-2.5 font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
      >
        📦 Ver Meus Pedidos
      </NuxtLink>
      <NuxtLink
        to="/"
        class="rounded-lg border px-6 py-2.5 font-semibold hover:bg-muted transition-colors"
      >
        Continuar Comprando
      </NuxtLink>
    </div>
  </div>
</template>
