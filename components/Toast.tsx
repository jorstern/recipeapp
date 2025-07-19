'use client'

import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { clsx } from 'clsx'

interface ToastProps {
  message: string
  type?: 'success' | 'error' | 'info'
  onClose: () => void
  duration?: number
}

export default function Toast({ message, type = 'info', onClose, duration = 3000 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, duration)
    return () => clearTimeout(timer)
  }, [duration, onClose])

  return createPortal(
    <div className="fixed bottom-4 right-4 z-50">
      <div
        className={clsx(
          'rounded-lg px-4 py-3 shadow-lg text-white min-w-[250px]',
          {
            'bg-green-600': type === 'success',
            'bg-red-600': type === 'error',
            'bg-blue-600': type === 'info',
          }
        )}
      >
        {message}
      </div>
    </div>,
    document.body
  )
}