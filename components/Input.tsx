import { InputHTMLAttributes } from 'react'
import { clsx } from 'clsx'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
}

export default function Input({ label, className, id, ...props }: InputProps) {
  return (
    <div>
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <input
        id={id}
        className={clsx(
          'w-full rounded-md border border-gray-300 px-3 py-2',
          'focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500',
          className
        )}
        {...props}
      />
    </div>
  )
}