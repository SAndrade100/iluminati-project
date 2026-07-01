<script setup lang="ts">
import type { Address } from '~/types'

definePageMeta({ middleware: 'auth' })

const api = useApi()
const toast = useToast()

const addresses = ref<Address[]>([])
const loading = ref(true)
const showForm = ref(false)
const saving = ref(false)
const editId = ref<string | null>(null)

type FormState = Omit<Address, 'id' | 'userId'>
const blankForm = (): FormState => ({
  label: 'HOME',
  street: '',
  number: '',
  complement: '',
  neighborhood: '',
  city: '',
  state: '',
  zipCode: '',
  isDefault: false,
})
const form = reactive<FormState>(blankForm())

async function load() {
  loading.value = true
  try {
    addresses.value = await api<Address[]>('/addresses')
  } finally {
    loading.value = false
  }
}

onMounted(load)

function openNew() {
  Object.assign(form, blankForm())
  editId.value = null
  showForm.value = true
}

function openEdit(addr: Address) {
  const { id, userId, ...rest } = addr
  Object.assign(form, { ...rest, complement: rest.complement ?? '' })
  editId.value = id
  showForm.value = true
}

function cancel() {
  showForm.value = false
  editId.value = null
}

async function save() {
  saving.value = true
  try {
    if (editId.value) {
      await api(`/addresses/${editId.value}`, { method: 'PATCH', body: form })
      toast.success('Endereço atualizado!')
    } else {
      await api('/addresses', { method: 'POST', body: form })
      toast.success('Endereço adicionado!')
    }
    showForm.value = false
    await load()
  } catch (e: any) {
    toast.error('Erro', e?.data?.message)
  } finally {
    saving.value = false
  }
}

async function setDefault(id: string) {
  try {
    await api(`/addresses/${id}/default`, { method: 'PUT' })
    await load()
    toast.success('Endereço padrão atualizado')
  } catch {
    toast.error('Erro ao definir padrão')
  }
}

async function remove(id: string) {
  if (!confirm('Remover este endereço?')) return
  try {
    await api(`/addresses/${id}`, { method: 'DELETE' })
    addresses.value = addresses.value.filter((a) => a.id !== id)
    toast.success('Endereço removido')
  } catch (e: any) {
    toast.error('Erro', e?.data?.message)
  }
}

const labelDisplay: Record<string, string> = {
  HOME: '🏠 Casa',
  WORK: '💼 Trabalho',
  OTHER: '📍 Outro',
}
</script>

<template>
  <div class="container mx-auto px-4 py-8 max-w-3xl">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold">Meus Endereços</h1>
      <button
        class="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
        @click="openNew"
      >
        + Adicionar
      </button>
    </div>

    <!-- Form -->
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0 -translate-y-2"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-2"
    >
      <div v-if="showForm" class="mb-6 p-6 border rounded-2xl bg-card shadow-sm">
        <h2 class="font-semibold text-lg mb-5">{{ editId ? 'Editar' : 'Novo' }} Endereço</h2>
        <form class="grid grid-cols-1 sm:grid-cols-2 gap-4" @submit.prevent="save">

          <!-- Label -->
          <div class="sm:col-span-2">
            <label class="block text-sm font-medium mb-2">Tipo</label>
            <div class="flex gap-2">
              <label
                v-for="(lbl, key) in labelDisplay"
                :key="key"
                class="flex items-center gap-2 px-3 py-2 border rounded-lg cursor-pointer text-sm transition-colors"
                :class="form.label === key ? 'border-primary bg-primary/5 font-medium' : 'hover:bg-muted'"
              >
                <input v-model="form.label" type="radio" :value="key" class="sr-only" />
                {{ lbl }}
              </label>
            </div>
          </div>

          <div class="sm:col-span-2">
            <label class="block text-sm font-medium mb-1.5">Rua / Avenida *</label>
            <input v-model="form.street" type="text" required class="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>

          <div>
            <label class="block text-sm font-medium mb-1.5">Número *</label>
            <input v-model="form.number" type="text" required class="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>

          <div>
            <label class="block text-sm font-medium mb-1.5">Complemento</label>
            <input v-model="form.complement" type="text" placeholder="Apto, bloco, casa..." class="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>

          <div>
            <label class="block text-sm font-medium mb-1.5">Bairro *</label>
            <input v-model="form.neighborhood" type="text" required class="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>

          <div>
            <label class="block text-sm font-medium mb-1.5">CEP *</label>
            <input v-model="form.zipCode" type="text" required maxlength="9" placeholder="00000-000" class="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>

          <div>
            <label class="block text-sm font-medium mb-1.5">Cidade *</label>
            <input v-model="form.city" type="text" required class="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>

          <div>
            <label class="block text-sm font-medium mb-1.5">Estado (UF) *</label>
            <input v-model="form.state" type="text" required maxlength="2" placeholder="SP" class="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm uppercase focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>

          <label class="flex items-center gap-2 text-sm cursor-pointer sm:col-span-2">
            <input v-model="form.isDefault" type="checkbox" class="rounded" />
            <span>Definir como endereço padrão</span>
          </label>

          <div class="sm:col-span-2 flex gap-3 pt-1">
            <button
              type="submit"
              :disabled="saving"
              class="rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
            >
              {{ saving ? 'Salvando...' : 'Salvar' }}
            </button>
            <button
              type="button"
              class="rounded-lg border px-5 py-2 text-sm font-medium hover:bg-muted transition-colors"
              @click="cancel"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </Transition>

    <!-- List -->
    <div v-if="loading" class="space-y-4">
      <div v-for="i in 2" :key="i" class="h-28 rounded-xl bg-muted animate-pulse" />
    </div>

    <div v-else-if="!addresses.length && !showForm" class="text-center py-16 text-muted-foreground">
      <div class="text-5xl mb-4">📍</div>
      <p>Nenhum endereço cadastrado ainda.</p>
    </div>

    <div v-else class="space-y-4">
      <div
        v-for="addr in addresses"
        :key="addr.id"
        class="p-5 border rounded-xl bg-card transition-colors"
        :class="addr.isDefault ? 'border-primary/40 bg-primary/5' : ''"
      >
        <div class="flex items-start justify-between gap-4">
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 mb-1.5">
              <span class="font-semibold text-sm">{{ labelDisplay[addr.label] }}</span>
              <span v-if="addr.isDefault" class="text-xs bg-primary/15 text-primary px-2 py-0.5 rounded-full font-semibold">
                Padrão
              </span>
            </div>
            <p class="text-sm text-muted-foreground">
              {{ addr.street }}, {{ addr.number }}<span v-if="addr.complement">, {{ addr.complement }}</span>
            </p>
            <p class="text-sm text-muted-foreground">
              {{ addr.neighborhood }} — {{ addr.city }}/{{ addr.state }} — CEP {{ addr.zipCode }}
            </p>
          </div>
          <div class="flex gap-3 items-center shrink-0">
            <button
              v-if="!addr.isDefault"
              class="text-xs text-primary hover:underline font-medium transition-colors"
              @click="setDefault(addr.id)"
            >
              Tornar padrão
            </button>
            <button
              class="text-xs text-muted-foreground hover:text-foreground transition-colors"
              @click="openEdit(addr)"
            >
              Editar
            </button>
            <button
              class="text-xs text-destructive hover:underline transition-colors"
              @click="remove(addr.id)"
            >
              Remover
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
