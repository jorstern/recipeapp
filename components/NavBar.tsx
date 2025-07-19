'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { clsx } from 'clsx'

export default function NavBar() {
  const pathname = usePathname()
  
  const links = [
    { href: '/', label: 'Chat' },
    { href: '/recipes', label: 'Recipes' },
    { href: '/ingredients', label: 'Ingredients' },
    { href: '/cook', label: 'Cook' },
    { href: '/shopping-list', label: 'List' },
  ]

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex space-x-8">
            {links.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className={clsx(
                  'inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium',
                  pathname === link.href
                    ? 'border-blue-500 text-gray-900'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  )
}