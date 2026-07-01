export default defineNuxtRouteMiddleware((to) => {
  if (import.meta.server) return
  const auth = useAuthStore()
  const requiredRole = to.meta.role as string | undefined
  if (requiredRole && auth.user?.role !== requiredRole && !auth.isAdmin) {
    return navigateTo('/')
  }
})
