"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LogOut, Settings, User, Download, ArrowLeft } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { DataTable } from "@/components/ui/data-table"
import { columns } from "./columns"

interface HeatPlan {
  Grade: string;
  Width: number;
  NoOfSlabs: string;
  Quantity: number;
  NoOfHeat: number;
}

export default function HeatPlansPage() {
  const router = useRouter()
  const { user, logout, isAuthenticated, loading: authLoading } = useAuth()
  const [loading, setLoading] = useState(true)
  const [heatPlans, setHeatPlans] = useState<HeatPlan[]>([])

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        router.push("/login")
      } else {
        // Load results from localStorage
        const storedHeatPlans = localStorage.getItem('heatPlans')
        console.log('Stored Heat Plans:', storedHeatPlans) // Debug log

        if (storedHeatPlans) {
          try {
            const parsedData = JSON.parse(storedHeatPlans)
            console.log('Parsed Heat Plans:', parsedData) // Debug log
            setHeatPlans(parsedData)
          } catch (error) {
            console.error('Error parsing heat plans:', error)
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
    if (heatPlans.length === 0) {
      alert('No data available to download')
      return
    }

    // Create CSV content
    const headers = Object.keys(heatPlans[0]).join(',')
    const rows = heatPlans.map(item => Object.values(item).join(','))
    const csv = [headers, ...rows].join('\n')

    // Create download link
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'heat-plans.csv'
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
    <div className="container mx-auto py-10">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Heat Plans</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable columns={columns} data={heatPlans} />
        </CardContent>
      </Card>
    </div>
  )
} 