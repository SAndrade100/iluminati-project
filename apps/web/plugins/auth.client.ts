// Initializes auth state from localStorage on client-side startup
export default defineNuxtPlugin(() => {
  const auth = useAuthStore()
  auth.initFromStorage()
})
