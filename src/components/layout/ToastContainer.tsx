import { useEffect } from 'react'
import {
  ToastProvider, ToastViewport, Toast, ToastTitle, ToastDescription, ToastClose,
} from '@/components/ui/toast'
import { useToastState } from '@/hooks/useToast'

export function ToastContainer() {
  const { toasts, subscribe } = useToastState()
  useEffect(() => subscribe(), [subscribe])

  return (
    <ToastProvider>
      {toasts.map((t) => (
        <Toast key={t.id} open={t.open} variant={t.variant}>
          {t.title && <ToastTitle>{t.title}</ToastTitle>}
          {t.description && <ToastDescription>{t.description}</ToastDescription>}
          <ToastClose />
        </Toast>
      ))}
      <ToastViewport />
    </ToastProvider>
  )
}
