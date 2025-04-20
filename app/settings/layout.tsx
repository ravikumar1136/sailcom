'use client'

import { ThemeToggle } from '@/components/theme-toggle'
import Link from 'next/link'

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b">
        <div className="container flex h-16 items-center justify-between px-4 md:px-6">
          <Link href="/" className="flex items-center gap-2">
            <img src="/logo.png" alt="SAIL Logo" className="h-8 w-auto" />
            <span className="text-xl font-bold">SAIL</span>
          </Link>
          <ThemeToggle />
        </div>
      </header>
      {children}
      <footer className="border-t py-4">
        <div className="container flex justify-between px-4 md:px-6">
          <p className="text-sm text-muted-foreground">© {new Date().getFullYear()} SAIL. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
} 