"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LogOut, Search, Settings, FileSpreadsheet, Plus } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"

export default function DashboardPage() {
  const router = useRouter()
  const { user, logout, isAuthenticated, loading: authLoading } = useAuth()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        router.push("/login")
      } else {
        setLoading(false)
      }
    }
  }, [isAuthenticated, authLoading, router])

  const handleLogout = () => {
    logout()
  }

  if (loading || authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b">
        <div className="container flex h-16 items-center justify-between px-4 md:px-6">
          <Link href="/dashboard" className="flex items-center gap-2">
            <img src="/logo.png" alt="SAIL Logo" className="h-8 w-auto" />
            <span className="text-xl font-bold">SAIL</span>
          </Link>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Link href="/settings">
              <Button variant="ghost" size="icon">
                <Settings className="h-5 w-5" />
                <span className="sr-only">Settings</span>
              </Button>
            </Link>
            <Button variant="ghost" size="icon" onClick={handleLogout}>
              <LogOut className="h-5 w-5" />
              <span className="sr-only">Logout</span>
            </Button>
          </div>
        </div>
      </header>
      <main className="flex-1 p-4 md:p-6">
        <div className="container">
          <div className="flex items-center justify-between space-y-2">
            <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
            <div className="flex items-center space-x-2">
              <Link href="/heatplan/create">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Heatplan
                </Button>
              </Link>
            </div>
          </div>
          <p className="text-muted-foreground mb-6">Welcome, {user?.name || 'User'}</p>
          <div className="grid gap-6 md:grid-cols-2">
            <Link href="/stock-search" className="block">
              <Card className="h-full transition-all hover:shadow-md">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-lg font-medium">Stock Search</CardTitle>
                  <Search className="h-5 w-5 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm">
                    Search for available stock based on Grade, Width, Thickness, and Finish.
                  </CardDescription>
                </CardContent>
              </Card>
            </Link>
            <Link href="/create-heatplan" className="block">
              <Card className="h-full transition-all hover:shadow-md">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-lg font-medium">Create Heatplan</CardTitle>
                  <FileSpreadsheet className="h-5 w-5 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm">
                    Upload order, stock, and WIP data to generate heat plans and check stock availability.
                  </CardDescription>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </main>
      <footer className="border-t py-4">
        <div className="container flex justify-between px-4 md:px-6">
          <p className="text-sm text-muted-foreground">© {new Date().getFullYear()} SAIL. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
