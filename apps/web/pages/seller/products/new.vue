<script setup lang="ts">
import type { Category } from '~/types'

definePageMeta({ middleware: 'auth' })

const auth = useAuthStore()
const api = useApi()
const toast = useToast()

onMounted(() => {
  if (!auth.isSeller && !auth.isAdmin) navigateTo('/')
})

const { data: categories } = await useAsyncData('cats-new-product', () =>
  api<Category[]>('/categories').catch(() => [] as Category[]),
)

const form = reactive({
  name: '',
  description: '',
  price: '',
  stock: '',
  sku: '',
  categoryId: '',
})

const loading = ref(false)
const error = ref('')

async function handleSubmit() {
  loading.value = true
  error.value = ''
  try {
    await api('/products', {
      method: 'POST',
      body: {
        name: form.name,
        description: form.description || undefined,
        price: Number(form.price),
        stock: Number(form.stock),
        sku: form.sku,
        categoryId: form.categoryId || undefined,
      },
    })
    toast.success('Produto criado com sucesso!')
    await navigateTo('/seller/products')
  } catch (e: any) {
    error.value = e?.data?.message || 'Erro ao criar produto'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="container mx-auto px-4 py-8 max-w-2xl">

    <!-- Breadcrumb -->
    <div class="flex items-center gap-2 text-sm text-muted-foreground mb-6">
      <NuxtLink to="/seller/dashboard" class="hover:text-foreground">Painel</NuxtLink>
      <span>/</span>
      <NuxtLink to="/seller/products" class="hover:text-foreground">Produtos</NuxtLink>
      <span>/</span>
      <span class="text-foreground font-medium">Novo</span>
    </div>

    <h1 class="text-2xl font-bold mb-6">Novo Produto</h1>

    <form class="space-y-5 p-6 border rounded-2xl bg-card" @submit.prevent="handleSubmit">

      <div>
        <label class="block text-sm font-medium mb-1.5">Nome do produto *</label>
        <input
          v-model="form.name"
          type="text"
          required
          placeholder="Ex: Smartphone XYZ 128GB"
          class="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      <div>
        <label class="block text-sm font-medium mb-1.5">Descrição</label>
        <textarea
          v-model="form.description"
          rows="4"
          placeholder="Descreva o produto em detalhes..."
          class="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
        />
      </div>

      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium mb-1.5">Preço (R$) *</label>
          <input
            v-model="form.price"
            type="number"
            required
            min="0.01"
            step="0.01"
            placeholder="0,00"
            class="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <div>
          <label class="block text-sm font-medium mb-1.5">Estoque *</label>
          <input
            v-model="form.stock"
            type="number"
            required
            min="0"
            placeholder="0"
            class="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      </div>

      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium mb-1.5">SKU *</label>
          <input
            v-model="form.sku"
            type="text"
            required
            placeholder="PROD-001"
            class="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm uppercase focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <div>
          <label class="block text-sm font-medium mb-1.5">Categoria</label>
          <select
            v-model="form.categoryId"
            class="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="">Sem categoria</option>
            <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
            <template v-for="cat in categories" :key="`children-${cat.id}`">
              <option v-for="child in cat.children" :key="child.id" :value="child.id">
                &nbsp;&nbsp;{{ child.name }}
              </option>
            </template>
          </select>
        </div>
      </div>

      <p v-if="error" class="text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2">
        {{ error }}
      </p>

      <div class="flex gap-3 pt-2">
        <button
          type="submit"
          :disabled="loading"
          class="rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          {{ loading ? 'Criando...' : 'Criar Produto' }}
        </button>
        <NuxtLink
          to="/seller/products"
          class="rounded-lg border px-6 py-2.5 text-sm font-medium hover:bg-muted transition-colors"
        >
          Cancelar
        </NuxtLink>
      </div>
    </form>
  </div>
</template>
