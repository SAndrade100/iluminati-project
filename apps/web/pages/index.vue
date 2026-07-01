<script setup lang="ts">
import type { Product, Category, PaginatedResult } from '~/types'

const api = useApi()
const route = useRoute()
const router = useRouter()

const page = ref(Number(route.query.page) || 1)
const search = ref(String(route.query.search || ''))
const categoryId = ref(String(route.query.category || ''))

const { data: categories } = await useAsyncData(
  'categories',
  () => api<Category[]>('/categories'),
  { server: false },
)

const { data: productsData, pending } = await useAsyncData(
  'products',
  () =>
    api<PaginatedResult<Product>>('/products', {
      params: {
        page: page.value,
        limit: 12,
        search: search.value || undefined,
        categoryId: categoryId.value || undefined,
      },
    }),
  { server: false, watch: [page, search, categoryId] },
)

function applySearch(q: string) {
  search.value = q
  page.value = 1
  router.replace({ query: { ...(search.value && { search: search.value }), ...(categoryId.value && { category: categoryId.value }) } })
}

function toggleCategory(id: string) {
  categoryId.value = categoryId.value === id ? '' : id
  page.value = 1
}

function setPage(p: number) {
  page.value = p
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// Flat category list for sidebar (skip children duplicates)
const flatCategories = computed(() => categories.value ?? [])
</script>

<template>
  <div>
    <!-- Hero -->
    <section class="bg-gradient-to-br from-primary/5 to-primary/10 border-b py-14">
      <div class="container mx-auto px-4 text-center">
        <h1 class="text-4xl sm:text-5xl font-extrabold mb-3 text-foreground">
          Bem-vindo à <span class="text-primary">Iluminati</span>
        </h1>
        <p class="text-muted-foreground text-lg mb-8 max-w-xl mx-auto">
          Encontre os melhores produtos com os melhores preços
        </p>
        <form class="flex gap-2 max-w-md mx-auto" @submit.prevent="applySearch(search)">
          <input
            v-model="search"
            type="text"
            placeholder="Buscar produtos..."
            class="flex-1 rounded-lg border border-input bg-background px-4 py-2.5 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <button
            type="submit"
            class="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm"
          >
            Buscar
          </button>
        </form>
      </div>
    </section>

    <!-- Content -->
    <div class="container mx-auto px-4 py-8">
      <div class="flex flex-col md:flex-row gap-8">

        <!-- Sidebar -->
        <aside class="w-full md:w-56 shrink-0">
          <h2 class="font-semibold text-sm uppercase tracking-wider text-muted-foreground mb-3">Categorias</h2>
          <ul class="space-y-0.5">
            <li>
              <button
                class="w-full text-left px-3 py-2 rounded-lg text-sm transition-colors font-medium"
                :class="!categoryId ? 'bg-primary text-primary-foreground' : 'hover:bg-muted text-foreground'"
                @click="categoryId = ''; page = 1"
              >
                Todas
              </button>
            </li>
            <template v-for="cat in flatCategories" :key="cat.id">
              <li>
                <button
                  class="w-full text-left px-3 py-2 rounded-lg text-sm transition-colors"
                  :class="categoryId === cat.id ? 'bg-primary text-primary-foreground font-medium' : 'hover:bg-muted text-foreground'"
                  @click="toggleCategory(cat.id)"
                >
                  {{ cat.name }}
                </button>
              </li>
              <li v-for="child in cat.children" :key="child.id" class="pl-3">
                <button
                  class="w-full text-left px-3 py-1.5 rounded-lg text-sm transition-colors"
                  :class="categoryId === child.id ? 'bg-primary/80 text-primary-foreground font-medium' : 'hover:bg-muted text-muted-foreground'"
                  @click="toggleCategory(child.id)"
                >
                  {{ child.name }}
                </button>
              </li>
            </template>
          </ul>
        </aside>

        <!-- Products -->
        <div class="flex-1 min-w-0">

          <!-- Count -->
          <div class="flex items-center justify-between mb-5">
            <p class="text-sm text-muted-foreground">
              <template v-if="productsData?.meta">
                {{ productsData.meta.total }} produto{{ productsData.meta.total !== 1 ? 's' : '' }} encontrado{{ productsData.meta.total !== 1 ? 's' : '' }}
              </template>
            </p>
            <button
              v-if="search || categoryId"
              class="text-xs text-muted-foreground hover:text-destructive transition-colors"
              @click="search = ''; categoryId = ''; page = 1"
            >
              Limpar filtros ✕
            </button>
          </div>

          <!-- Skeleton -->
          <div v-if="pending" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <div v-for="i in 9" :key="i" class="rounded-xl border bg-muted h-72 animate-pulse" />
          </div>

          <!-- Empty -->
          <div v-else-if="!productsData?.data?.length" class="text-center py-20 text-muted-foreground">
            <div class="text-5xl mb-4">🔍</div>
            <p class="font-medium">Nenhum produto encontrado</p>
            <p class="text-sm mt-1">Tente outros termos ou categorias</p>
          </div>

          <!-- Grid -->
          <div v-else>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              <ProductCard
                v-for="product in productsData?.data"
                :key="product.id"
                :product="product"
              />
            </div>

            <!-- Pagination -->
            <div v-if="(productsData?.meta?.lastPage ?? 0) > 1" class="flex justify-center gap-1.5 mt-10">
              <button
                :disabled="page === 1"
                class="px-3 py-1.5 rounded-lg text-sm border hover:bg-muted disabled:opacity-40"
                @click="setPage(page - 1)"
              >
                ←
              </button>
              <button
                v-for="p in (productsData?.meta?.lastPage ?? 0)"
                :key="p"
                class="px-3 py-1.5 rounded-lg text-sm border"
                :class="p === page ? 'bg-primary text-primary-foreground border-primary' : 'hover:bg-muted'"
                @click="setPage(p)"
              >
                {{ p }}
              </button>
              <button
                :disabled="page === (productsData?.meta?.lastPage ?? 0)"
                class="px-3 py-1.5 rounded-lg text-sm border hover:bg-muted disabled:opacity-40"
                @click="setPage(page + 1)"
              >
                →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
