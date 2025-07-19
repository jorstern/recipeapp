import { SelectHTMLAttributes } from 'react'
import { clsx } from 'clsx'

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  options: { value: string; label: string }[]
}

export default function Select({ label, className, id, options, ...props }: SelectProps) {
  return (
    <div>
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <select
        id={id}
        className={clsx(
          'w-full rounded-md border border-gray-300 px-3 py-2',
          'focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500',
          className
        )}
        {...props}
      >
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  )
}