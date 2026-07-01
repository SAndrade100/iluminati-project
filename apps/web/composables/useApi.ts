export const useApi = () => {
  const config = useRuntimeConfig()
  const authStore = useAuthStore()

  return $fetch.create({
    baseURL: config.public.apiUrl as string,

    onRequest({ options }) {
      if (authStore.accessToken) {
        const headers = (options.headers ??= {}) as Record<string, string>
        headers['Authorization'] = `Bearer ${authStore.accessToken}`
      }
    },

    async onResponseError({ response }) {
      // Only log out if the user was actually authenticated.
      // Avoids redirecting to /login when, e.g., wrong credentials are sent.
      if (response.status === 401 && authStore.accessToken) {
        await authStore.logout()
      }
    },
  })
}
