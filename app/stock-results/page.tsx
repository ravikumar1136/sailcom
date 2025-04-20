"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, LogOut, Settings, User } from "lucide-react"
import { ResultCard } from "./result-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/contexts/AuthContext"

interface SearchResults {
  stockResult: {
    found: boolean
    exactMatch: boolean
    message: string
    data: any
  }
  wipResult: {
    found: boolean
    exactMatch: boolean
    message: string
    data: any
  }
}

interface SearchParams {
  grade: string
  width: string
  thickness: string
  finish: string
}

export default function StockResultsPage() {
  const router = useRouter()
  const { isAuthenticated, loading: authLoading, logout } = useAuth()
  const [loading, setLoading] = useState(true)
  const [results, setResults] = useState<SearchResults | null>(null)
  const [searchParams, setSearchParams] = useState<SearchParams | null>(null)

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        router.push("/login")
        return
      }

      // Get search results from localStorage
      const searchResults = localStorage.getItem("searchResults")
      if (!searchResults) {
        // If no results, redirect to search page
        router.push("/stock-search")
        return
      }

      // Get search parameters from localStorage
      const savedSearchParams = localStorage.getItem("searchParams")

      try {
        const parsedResults = JSON.parse(searchResults)
        setResults(parsedResults)
        
        if (savedSearchParams) {
          setSearchParams(JSON.parse(savedSearchParams))
        }
        
        setLoading(false)
      } catch (err) {
        console.error("Error parsing search results:", err)
        router.push("/stock-search")
      }
    }
  }, [router, isAuthenticated, authLoading])

  if (loading || authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  const handleLogout = () => {
    logout()
  }

  const handleNewSearch = () => {
    router.push("/stock-search")
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b">
        <div className="flex h-16 items-center justify-between px-4 md:px-6">
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
        <div className="w-full">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold">Search Results</h1>
              <p className="text-muted-foreground mt-2">Results for your stock search query</p>
              {searchParams && (
                <div className="mt-2 flex flex-wrap gap-2">
                  <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10 dark:bg-blue-900/10 dark:text-blue-400 dark:ring-blue-400/30">
                    Grade: {searchParams.grade}
                  </span>
                  <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10 dark:bg-blue-900/10 dark:text-blue-400 dark:ring-blue-400/30">
                    Width: {searchParams.width}
                  </span>
                  <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10 dark:bg-blue-900/10 dark:text-blue-400 dark:ring-blue-400/30">
                    Thickness: {searchParams.thickness}
                  </span>
                  <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10 dark:bg-blue-900/10 dark:text-blue-400 dark:ring-blue-400/30">
                    Finish: {searchParams.finish}
                  </span>
                </div>
              )}
            </div>
            <Button variant="outline" onClick={handleNewSearch}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              New Search
            </Button>
          </div>

          <Tabs defaultValue="stock" className="mb-8">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="stock">Stock Data Results</TabsTrigger>
              <TabsTrigger value="wip">WIP Data Results</TabsTrigger>
            </TabsList>
            <TabsContent value="stock" className="pt-4">
              {results && (
                <ResultCard
                  title="Stock Data"
                  found={results.stockResult.found}
                  exactMatch={results.stockResult.exactMatch}
                  message={results.stockResult.message}
                  data={results.stockResult.data}
                  notFoundMessage="No matching stock was found for your search criteria."
                />
              )}
            </TabsContent>
            <TabsContent value="wip" className="pt-4">
              {results && (
                <ResultCard
                  title="WIP Data"
                  found={results.wipResult.found}
                  exactMatch={results.wipResult.exactMatch}
                  message={results.wipResult.message}
                  data={results.wipResult.data}
                  notFoundMessage="No matching work in progress was found for your search criteria."
                />
              )}
            </TabsContent>
          </Tabs>

          <Card>
            <CardHeader>
              <CardTitle>Search Algorithm Explanation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium">Case 1: Exact Match</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    When all parameters (Grade, Width, Thickness, Finish) match exactly with the data.
                  </p>
                </div>
                <div>
                  <h3 className="font-medium">Case 2: Same Grade and Thickness</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    When the grade and thickness match exactly, but width or finish may differ.
                  </p>
                </div>
                <div>
                  <h3 className="font-medium">Case 3: Same Grade with Thickness Range</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    When the grade matches and thickness is within ±0.25 of the requested value.
                  </p>
                </div>
                <div>
                  <h3 className="font-medium">Case 4: Approximate Match</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    When the grade matches and either thickness is within ±0.5 or width is within ±100.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <footer className="border-t py-4">
        <div className="flex justify-between px-4 md:px-6">
          <p className="text-sm text-muted-foreground">© {new Date().getFullYear()} SAIL. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
