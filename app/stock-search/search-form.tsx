"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileUpload } from "./file-upload"
import { StockSearchAlgorithm } from "./stock-search-algorithm"
import { Search } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export function SearchForm() {
  const router = useRouter()
  const [grade, setGrade] = useState("")
  const [width, setWidth] = useState("")
  const [thickness, setThickness] = useState("")
  const [finish, setFinish] = useState("")
  const [stockFile, setStockFile] = useState<File | null>(null)
  const [wipFile, setWipFile] = useState<File | null>(null)
  const [searching, setSearching] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleStockFileChange = (file: File | null) => {
    setStockFile(file)
  }

  const handleWipFileChange = (file: File | null) => {
    setWipFile(file)
  }

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!stockFile || !wipFile) {
      setError("Please upload both Stock Data and WIP Data files")
      return
    }

    if (!grade || !width || !thickness || !finish) {
      setError("Please fill in all search parameters")
      return
    }

    setSearching(true)

    try {
      // In a real application, you would upload the files first
      const formData = new FormData()
      formData.append("stockFile", stockFile)
      formData.append("wipFile", wipFile)

      // Process files
      const fileResponse = await fetch("/api/process-files", {
        method: "POST",
        body: formData,
      })

      if (!fileResponse.ok) {
        throw new Error("Failed to process files")
      }

      const fileData = await fileResponse.json()

      // Search for stock
      const searchResponse = await fetch("/api/search-stock", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          grade,
          width,
          thickness,
          finish,
          stockData: fileData.stockData,
          wipData: fileData.wipData,
        }),
      })

      if (!searchResponse.ok) {
        throw new Error("Failed to search for stock")
      }

      // Store results in localStorage for the results page
      const searchResults = await searchResponse.json()
      localStorage.setItem("searchResults", JSON.stringify(searchResults))
      
      // Store search parameters for the results page
      localStorage.setItem("searchParams", JSON.stringify({
        grade,
        width,
        thickness,
        finish
      }))

      // Navigate to results page
      router.push("/stock-results")
    } catch (err) {
      console.error("Error during search:", err)
      setError("An error occurred during the search. Please try again.")
      setSearching(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Search Parameters</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="grade">Grade</Label>
                <Input
                  id="grade"
                  placeholder="Enter grade (e.g., 201LN, 204CU, 2D)"
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="width">Width</Label>
                <Input
                  id="width"
                  placeholder="Enter width in mm (e.g., 1250, 1275)"
                  value={width}
                  onChange={(e) => setWidth(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="thickness">Thickness</Label>
                <Input
                  id="thickness"
                  placeholder="Enter thickness in mm (e.g., 0.3, 2, 3)"
                  value={thickness}
                  onChange={(e) => setThickness(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="finish">Finish</Label>
                <Input
                  id="finish"
                  placeholder="Enter finish (e.g., 2D, NO1)"
                  value={finish}
                  onChange={(e) => setFinish(e.target.value)}
                  required
                />
              </div>
            </div>

            <FileUpload onStockFileChange={handleStockFileChange} onWipFileChange={handleWipFileChange} />

            <Button type="submit" className="w-full" disabled={searching}>
              {searching ? (
                <>
                  <div className="mr-2 animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-background"></div>
                  Searching...
                </>
              ) : (
                <>
                  <Search className="mr-2 h-4 w-4" />
                  Track Stock
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <StockSearchAlgorithm />
    </div>
  )
}
