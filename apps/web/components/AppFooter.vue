<template>
  <footer class="border-t bg-muted/30 mt-auto">
    <div class="container mx-auto px-4 py-10">
      <div class="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
        <div class="col-span-2 md:col-span-1">
          <div class="font-bold text-lg mb-3">🔦 Iluminati</div>
          <p class="text-sm text-muted-foreground leading-relaxed">
            Marketplace completo com os melhores produtos e vendedores.
          </p>
        </div>

        <div>
          <h4 class="font-semibold text-sm mb-3 uppercase tracking-wider text-muted-foreground">Comprar</h4>
          <ul class="space-y-2 text-sm">
            <li><NuxtLink to="/" class="text-muted-foreground hover:text-foreground transition-colors">Todos os Produtos</NuxtLink></li>
            <li><NuxtLink to="/cart" class="text-muted-foreground hover:text-foreground transition-colors">Carrinho</NuxtLink></li>
          </ul>
        </div>

        <div>
          <h4 class="font-semibold text-sm mb-3 uppercase tracking-wider text-muted-foreground">Minha Conta</h4>
          <ul class="space-y-2 text-sm">
            <li><NuxtLink to="/account/orders" class="text-muted-foreground hover:text-foreground transition-colors">Pedidos</NuxtLink></li>
            <li><NuxtLink to="/account/addresses" class="text-muted-foreground hover:text-foreground transition-colors">Endereços</NuxtLink></li>
          </ul>
        </div>

        <div>
          <h4 class="font-semibold text-sm mb-3 uppercase tracking-wider text-muted-foreground">Vender</h4>
          <ul class="space-y-2 text-sm">
            <li><NuxtLink to="/register" class="text-muted-foreground hover:text-foreground transition-colors">Criar Conta</NuxtLink></li>
            <li><NuxtLink to="/seller/dashboard" class="text-muted-foreground hover:text-foreground transition-colors">Painel Vendedor</NuxtLink></li>
          </ul>
        </div>
      </div>

      <div class="border-t pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
        <span>© {{ new Date().getFullYear() }} Iluminati Marketplace. Todos os direitos reservados.</span>
        <span>Feito com NestJS + Nuxt 3</span>
      </div>
    </div>
  </footer>
</template>
