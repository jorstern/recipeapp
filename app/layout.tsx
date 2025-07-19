import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { StoreProvider } from '@/lib/store'
import AppLayout from '@/components/AppLayout'
import ToastManager from '@/components/ToastManager'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Recipe App',
  description: 'AI-assisted cooking app',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <StoreProvider>
          <AppLayout>
            {children}
          </AppLayout>
          <ToastManager />
        </StoreProvider>
      </body>
    </html>
  )
}