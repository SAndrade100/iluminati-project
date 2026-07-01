export default defineNuxtRouteMiddleware(() => {
  // Skip on SSR — auth state is only available client-side (localStorage)
  if (import.meta.server) return
  const auth = useAuthStore()
  if (!auth.isAuthenticated) {
    return navigateTo('/login')
  }
})
