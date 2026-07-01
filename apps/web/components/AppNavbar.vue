<script setup lang="ts">
const auth = useAuthStore()
const cart = useCartStore()
const router = useRouter()

const search = ref('')
const menuOpen = ref(false)
const dropdownRef = ref<HTMLElement | null>(null)

onClickOutside(dropdownRef, () => { menuOpen.value = false })

function handleSearch() {
  if (search.value.trim()) {
    router.push({ path: '/', query: { search: search.value.trim() } })
    search.value = ''
  }
}

function logout() {
  menuOpen.value = false
  auth.logout()
}
</script>

<template>
  <header class="sticky top-0 z-50 border-b bg-background/95 backdrop-blur-sm">
    <div class="container mx-auto px-4 h-16 flex items-center gap-4">

      <!-- Logo -->
      <NuxtLink to="/" class="font-bold text-xl text-primary shrink-0 flex items-center gap-1.5">
        🔦 <span class="hidden sm:inline">Iluminati</span>
      </NuxtLink>

      <!-- Search bar -->
      <form class="flex-1 max-w-lg hidden sm:flex gap-2" @submit.prevent="handleSearch">
        <input
          v-model="search"
          type="text"
          placeholder="Buscar produtos..."
          class="flex-1 rounded-md border border-input bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <button
          type="submit"
          class="rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          Buscar
        </button>
      </form>

      <!-- Right Actions -->
      <div class="flex items-center gap-2 ml-auto shrink-0">

        <!-- Cart button (customers only) -->
        <NuxtLink
          v-if="auth.isAuthenticated && (auth.isCustomer || auth.isAdmin)"
          to="/cart"
          class="relative p-2 hover:bg-muted rounded-md transition-colors"
          aria-label="Carrinho"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <span
            v-if="cart.itemCount > 0"
            class="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full w-4 h-4 flex items-center justify-center font-semibold"
          >
            {{ cart.itemCount > 9 ? '9+' : cart.itemCount }}
          </span>
        </NuxtLink>

        <!-- Not authenticated -->
        <template v-if="!auth.isAuthenticated">
          <NuxtLink to="/login" class="text-sm hover:text-primary transition-colors px-2 py-1">
            Entrar
          </NuxtLink>
          <NuxtLink
            to="/register"
            class="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Criar conta
          </NuxtLink>
        </template>

        <!-- Authenticated: user menu -->
        <template v-else>
          <div class="relative">
            <button
              class="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-muted transition-colors"
              @click="menuOpen = !menuOpen"
            >
              <div class="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-semibold">
                {{ auth.initials }}
              </div>
              <span class="hidden sm:block max-w-[120px] truncate">{{ auth.displayName }}</span>
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            <!-- Dropdown -->
            <Transition
              enter-active-class="transition ease-out duration-100"
              enter-from-class="opacity-0 scale-95"
              enter-to-class="opacity-100 scale-100"
              leave-active-class="transition ease-in duration-75"
              leave-from-class="opacity-100 scale-100"
              leave-to-class="opacity-0 scale-95"
            >
              <div
                v-if="menuOpen"
                ref="dropdownRef"
                class="absolute right-0 top-full mt-1 w-52 rounded-xl border bg-popover shadow-lg z-50 overflow-hidden"
              >
                <div class="px-3 py-2 border-b">
                  <p class="text-sm font-medium truncate">{{ auth.displayName }}</p>
                  <p class="text-xs text-muted-foreground truncate">{{ auth.user?.email }}</p>
                </div>
                <div class="p-1">
                  <NuxtLink
                    to="/account/orders"
                    class="flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-muted transition-colors"
                    @click="menuOpen = false"
                  >
                    📦 Meus Pedidos
                  </NuxtLink>
                  <NuxtLink
                    to="/account/addresses"
                    class="flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-muted transition-colors"
                    @click="menuOpen = false"
                  >
                    📍 Endereços
                  </NuxtLink>
                  <NuxtLink
                    v-if="auth.isSeller || auth.isAdmin"
                    to="/seller/dashboard"
                    class="flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-muted transition-colors"
                    @click="menuOpen = false"
                  >
                    🏪 Painel do Vendedor
                  </NuxtLink>
                  <div class="border-t my-1" />
                  <button
                    class="flex w-full items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-muted transition-colors text-destructive"
                    @click="logout"
                  >
                    🚪 Sair
                  </button>
                </div>
              </div>
            </Transition>
          </div>
        </template>

      </div>
    </div>

    <!-- Mobile search -->
    <div class="sm:hidden border-t px-4 py-2">
      <form class="flex gap-2" @submit.prevent="handleSearch">
        <input
          v-model="search"
          type="text"
          placeholder="Buscar produtos..."
          class="flex-1 rounded-md border border-input bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <button type="submit" class="rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground">
          🔍
        </button>
      </form>
    </div>
  </header>
</template>
