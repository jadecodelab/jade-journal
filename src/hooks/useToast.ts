import { useState, useCallback } from 'react'

interface ToastState {
  id: string
  title?: string
  description?: string
  variant?: 'default' | 'destructive'
  open: boolean
}

let toastListeners: ((toasts: ToastState[]) => void)[] = []
let toasts: ToastState[] = []

function emit() {
  toastListeners.forEach((l) => l([...toasts]))
}

export function toast(opts: Omit<ToastState, 'id' | 'open'>) {
  const id = Math.random().toString(36).slice(2)
  toasts = [...toasts, { ...opts, id, open: true }]
  emit()
  setTimeout(() => {
    toasts = toasts.map((t) => (t.id === id ? { ...t, open: false } : t))
    emit()
    setTimeout(() => {
      toasts = toasts.filter((t) => t.id !== id)
      emit()
    }, 300)
  }, 3000)
}

export function useToastState() {
  const [state, setState] = useState<ToastState[]>([])
  const subscribe = useCallback(() => {
    toastListeners.push(setState)
    return () => { toastListeners = toastListeners.filter((l) => l !== setState) }
  }, [])
  return { toasts: state, subscribe }
}
