<script setup lang="ts">
definePageMeta({ layout: 'auth', middleware: 'guest' })

const auth = useAuthStore()
const api = useApi()
const toast = useToast()

const form = reactive({
  name: '',
  email: '',
  password: '',
  role: 'CUSTOMER' as 'CUSTOMER' | 'SELLER',
})
const loading = ref(false)
const error = ref('')

async function handleRegister() {
  loading.value = true
  error.value = ''
  try {
    // Register returns the user
    await api('/auth/register', { method: 'POST', body: form })

    // Auto-login after register
    const tokens = await api<{ accessToken: string; refreshToken: string }>(
      '/auth/login',
      { method: 'POST', body: { email: form.email, password: form.password } },
    )
    auth.setTokens(tokens)
    toast.success('Conta criada com sucesso!')
    await navigateTo('/')
  } catch (e: any) {
    error.value = e?.data?.message || 'Erro ao criar conta'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="w-full max-w-sm">
    <div class="rounded-2xl border bg-card shadow-sm p-8">
      <div class="text-center mb-8">
        <div class="text-4xl mb-3">🔦</div>
        <h1 class="text-2xl font-bold">Criar conta</h1>
        <p class="text-muted-foreground text-sm mt-1">Junte-se à Iluminati</p>
      </div>

      <form class="space-y-4" @submit.prevent="handleRegister">
        <div>
          <label class="block text-sm font-medium mb-1.5">Nome</label>
          <input
            v-model="form.name"
            type="text"
            required
            autocomplete="name"
            placeholder="Seu nome completo"
            class="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        <div>
          <label class="block text-sm font-medium mb-1.5">E-mail</label>
          <input
            v-model="form.email"
            type="email"
            required
            autocomplete="email"
            placeholder="seu@email.com"
            class="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        <div>
          <label class="block text-sm font-medium mb-1.5">Senha</label>
          <input
            v-model="form.password"
            type="password"
            required
            minlength="8"
            autocomplete="new-password"
            placeholder="Mínimo 8 caracteres"
            class="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        <div>
          <label class="block text-sm font-medium mb-1.5">Tipo de conta</label>
          <div class="grid grid-cols-2 gap-2">
            <label
              class="flex items-center gap-2 rounded-lg border p-3 cursor-pointer transition-colors"
              :class="form.role === 'CUSTOMER' ? 'border-primary bg-primary/5' : 'hover:bg-muted'"
            >
              <input v-model="form.role" type="radio" value="CUSTOMER" class="sr-only" />
              <span class="text-lg">🛒</span>
              <div>
                <p class="text-sm font-medium">Comprador</p>
                <p class="text-xs text-muted-foreground">Comprar produtos</p>
              </div>
            </label>
            <label
              class="flex items-center gap-2 rounded-lg border p-3 cursor-pointer transition-colors"
              :class="form.role === 'SELLER' ? 'border-primary bg-primary/5' : 'hover:bg-muted'"
            >
              <input v-model="form.role" type="radio" value="SELLER" class="sr-only" />
              <span class="text-lg">🏪</span>
              <div>
                <p class="text-sm font-medium">Vendedor</p>
                <p class="text-xs text-muted-foreground">Vender produtos</p>
              </div>
            </label>
          </div>
        </div>

        <p v-if="error" class="text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2">
          {{ error }}
        </p>

        <button
          type="submit"
          :disabled="loading"
          class="w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ loading ? 'Criando conta...' : 'Criar conta' }}
        </button>
      </form>

      <div class="mt-6 text-center text-sm text-muted-foreground border-t pt-4">
        Já tem conta?
        <NuxtLink to="/login" class="text-primary font-semibold hover:underline ml-1">
          Entrar
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
