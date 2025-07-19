'use client'

import { useStore } from '@/lib/store'
import Toast from './Toast'

export default function ToastManager() {
  const { toast, hideToast } = useStore()

  if (!toast) return null

  return (
    <Toast
      message={toast.message}
      type={toast.type}
      onClose={hideToast}
    />
  )
}