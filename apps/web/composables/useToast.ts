import { toast as sonnerToast } from 'vue-sonner'

export const useToast = () => {
  return {
    success: (message: string, description?: string) =>
      sonnerToast.success(message, { description }),
    error: (message: string, description?: string) =>
      sonnerToast.error(message, { description }),
    info: (message: string, description?: string) =>
      sonnerToast(message, { description }),
  }
}
