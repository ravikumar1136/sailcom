"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LogOut, Settings, User, Download, ArrowLeft } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface AvailableStock {
  Grade: string;
  Width: number;
  PKTNO: string;
  CustomerName: string;
}

export default function AvailableStockPage() {
  const router = useRouter()
  const { user, logout, isAuthenticated, loading: authLoading } = useAuth()
  const [loading, setLoading] = useState(true)
  const [availableStock, setAvailableStock] = useState<AvailableStock[]>([])

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        router.push("/login")
      } else {
        // Load results from localStorage
        const storedStock = localStorage.getItem('availableStock')
        console.log('Stored Available Stock:', storedStock) // Debug log

        if (storedStock) {
          try {
            const parsedData = JSON.parse(storedStock)
            console.log('Parsed Available Stock:', parsedData) // Debug log
            setAvailableStock(parsedData)
          } catch (error) {
            console.error('Error parsing available stock:', error)
          }
        }

        setLoading(false)
      }
    }
  }, [isAuthenticated, authLoading, router])

  const handleLogout = () => {
    logout()
  }

  const handleDownload = () => {
    if (availableStock.length === 0) {
      alert('No data available to download')
      return
    }

    // Create CSV content
    const headers = Object.keys(availableStock[0]).join(',')
    const rows = availableStock.map(item => Object.values(item).join(','))
    const csv = [headers, ...rows].join('\n')

    // Create download link
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'available-stock.csv'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
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
            <Link href="/profile">
              <Button variant="ghost" size="icon">
                <User className="h-5 w-5" />
                <span className="sr-only">Profile</span>
              </Button>
            </Link>
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
          <div className="mb-6">
            <div className="flex items-center gap-4 mb-4">
              <Link href="/heatplan-results">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <h1 className="text-3xl font-bold">Available Stock</h1>
            </div>
            <p className="text-muted-foreground">
              View and download available stock information.
            </p>
          </div>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Available Stock</CardTitle>
              <Button variant="outline" size="sm" onClick={handleDownload} disabled={availableStock.length === 0}>
                <Download className="h-4 w-4 mr-2" />
                Download CSV
              </Button>
            </CardHeader>
            <CardContent>
              {availableStock.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No available stock data. Please generate heat plans first.
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Grade</TableHead>
                        <TableHead>Width</TableHead>
                        <TableHead>PKT No</TableHead>
                        <TableHead>Customer Name</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {availableStock.map((stock, index) => (
                        <TableRow key={index}>
                          <TableCell>{stock.Grade}</TableCell>
                          <TableCell>{stock.Width}</TableCell>
                          <TableCell>{stock.PKTNO}</TableCell>
                          <TableCell>{stock.CustomerName}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
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