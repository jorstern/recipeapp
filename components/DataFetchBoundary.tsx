'use client'

import { ReactNode } from 'react'

interface DataFetchBoundaryProps {
  loading: boolean
  error?: Error | null
  children: ReactNode
}

export default function DataFetchBoundary({ loading, error, children }: DataFetchBoundaryProps) {
  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <p className="text-red-600">Error: {error.message}</p>
      </div>
    )
  }

  return <>{children}</>
}