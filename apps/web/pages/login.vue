<script setup lang="ts">
definePageMeta({ layout: 'auth', middleware: 'guest' })

const auth = useAuthStore()
const api = useApi()
const toast = useToast()

const form = reactive({ email: '', password: '' })
const loading = ref(false)
const error = ref('')

async function handleLogin() {
  loading.value = true
  error.value = ''
  try {
    const data = await api<{ accessToken: string; refreshToken: string }>(
      '/auth/login',
      { method: 'POST', body: form },
    )
    auth.setTokens(data)
    toast.success('Bem-vindo de volta!')
    await navigateTo('/')
  } catch (e: any) {
    error.value = e?.data?.message || 'E-mail ou senha inválidos'
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
        <h1 class="text-2xl font-bold">Entrar</h1>
        <p class="text-muted-foreground text-sm mt-1">Bem-vindo de volta à Iluminati</p>
      </div>

      <form class="space-y-4" @submit.prevent="handleLogin">
        <div>
          <label class="block text-sm font-medium mb-1.5">E-mail</label>
          <input
            v-model="form.email"
            type="email"
            required
            autocomplete="email"
            placeholder="seu@email.com"
            class="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
          />
        </div>

        <div>
          <label class="block text-sm font-medium mb-1.5">Senha</label>
          <input
            v-model="form.password"
            type="password"
            required
            autocomplete="current-password"
            placeholder="••••••••"
            class="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
          />
        </div>

        <p v-if="error" class="text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2">
          {{ error }}
        </p>

        <button
          type="submit"
          :disabled="loading"
          class="w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ loading ? 'Entrando...' : 'Entrar' }}
        </button>
      </form>

      <div class="mt-6 text-center text-sm text-muted-foreground">
        <div class="border-t pt-4">
          Não tem conta?
          <NuxtLink to="/register" class="text-primary font-semibold hover:underline ml-1">
            Criar conta grátis
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>
