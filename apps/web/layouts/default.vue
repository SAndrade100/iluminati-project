<script setup lang="ts">
const cartStore = useCartStore()
const auth = useAuthStore()

onMounted(async () => {
  if (auth.isAuthenticated && auth.isCustomer) {
    await cartStore.fetchCart()
  }
})
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <AppNavbar />
    <main class="flex-1">
      <NuxtPage />
    </main>
    <AppFooter />
    <ClientOnly><Toaster rich-colors position="bottom-right" /></ClientOnly>
  </div>
</template>
