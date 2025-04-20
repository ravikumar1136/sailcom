"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Upload, ArrowLeft, FileIcon, AlertCircle, X } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function CreateHeatplanPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [processing, setProcessing] = useState(false)
  const [orderFile, setOrderFile] = useState<File | null>(null)
  const [stockFile, setStockFile] = useState<File | null>(null)
  const [wipFile, setWipFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)

  const validateFile = (file: File) => {
    const validTypes = [".csv", ".xlsx", ".xls"]
    const fileExtension = file.name.substring(file.name.lastIndexOf(".")).toLowerCase()
    
    if (!validTypes.includes(fileExtension)) {
      throw new Error("Invalid file type. Please upload a CSV or Excel file.")
    }

    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      throw new Error("File size exceeds 10MB limit.")
    }
  }

  const handleFileChange = (file: File | null, setFile: (file: File | null) => void) => {
    setError(null)
    if (file) {
      try {
        validateFile(file)
        setFile(file)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to upload file")
      }
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const handleSubmit = async () => {
    if (!orderFile || !stockFile || !wipFile) {
      toast({
        title: "Error",
        description: "Please upload all required files",
        variant: "destructive",
      })
      return
    }

    setProcessing(true)

    try {
      const formData = new FormData()
      formData.append('orderFile', orderFile)
      formData.append('stockFile', stockFile)
      formData.append('wipFile', wipFile)

      const response = await fetch('/api/process-heat-plans', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to process heatplan')
      }

      const data = await response.json()
      localStorage.setItem('heatPlans', JSON.stringify(data.heatPlans))
      localStorage.setItem('availableStock', JSON.stringify(data.availableStock))

      toast({
        title: "Success",
        description: "Heat plans generated successfully",
      })

      router.push('/heatplan-results')
    } catch (error) {
      console.error('Error:', error)
      toast({
        title: "Error",
        description: error.message || "Failed to process heatplan",
        variant: "destructive",
      })
    } finally {
      setProcessing(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-green-50/80 to-white">
      <div className="container max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/dashboard">
            <Button variant="ghost" size="icon" className="rounded-full hover:bg-green-100">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Create Heat Plan</h1>
            <p className="text-muted-foreground mt-2">Upload your data files to generate heat plans</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Upload Files
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="grid gap-6 md:grid-cols-3">
              {/* Order File Upload */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="order-file" className="text-sm font-medium">
                    Order Data File
                  </Label>
                  <div className="relative">
                    <div className={`group relative rounded-lg border-2 border-dashed ${orderFile ? 'border-border bg-muted/50' : 'border-muted-foreground/25 hover:border-muted-foreground/50'} transition-colors`}>
                      <Input
                        id="order-file"
                        type="file"
                        accept=".csv,.xlsx,.xls"
                        onChange={(e) => handleFileChange(e.target.files?.[0] || null, setOrderFile)}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                      <div className="p-4 text-center">
                        {orderFile ? (
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 truncate">
                              <FileIcon className="h-4 w-4 shrink-0" />
                              <span className="truncate text-sm">{orderFile.name}</span>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="shrink-0"
                              onClick={(e) => {
                                e.preventDefault()
                                setOrderFile(null)
                              }}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <Upload className="mx-auto h-8 w-8 text-muted-foreground/50 group-hover:text-muted-foreground/75" />
                            <p className="text-sm font-medium">Drop your file here or click to browse</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  {orderFile && (
                    <p className="text-xs text-muted-foreground">Size: {formatFileSize(orderFile.size)}</p>
                  )}
                </div>
              </div>

              {/* Stock File Upload */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="stock-file" className="text-sm font-medium">
                    Stock Data File
                  </Label>
                  <div className="relative">
                    <div className={`group relative rounded-lg border-2 border-dashed ${stockFile ? 'border-border bg-muted/50' : 'border-muted-foreground/25 hover:border-muted-foreground/50'} transition-colors`}>
                      <Input
                        id="stock-file"
                        type="file"
                        accept=".csv,.xlsx,.xls"
                        onChange={(e) => handleFileChange(e.target.files?.[0] || null, setStockFile)}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                      <div className="p-4 text-center">
                        {stockFile ? (
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 truncate">
                              <FileIcon className="h-4 w-4 shrink-0" />
                              <span className="truncate text-sm">{stockFile.name}</span>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="shrink-0"
                              onClick={(e) => {
                                e.preventDefault()
                                setStockFile(null)
                              }}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <Upload className="mx-auto h-8 w-8 text-muted-foreground/50 group-hover:text-muted-foreground/75" />
                            <p className="text-sm font-medium">Drop your file here or click to browse</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  {stockFile && (
                    <p className="text-xs text-muted-foreground">Size: {formatFileSize(stockFile.size)}</p>
                  )}
                </div>
              </div>

              {/* WIP File Upload */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="wip-file" className="text-sm font-medium">
                    WIP Data File
                  </Label>
                  <div className="relative">
                    <div className={`group relative rounded-lg border-2 border-dashed ${wipFile ? 'border-border bg-muted/50' : 'border-muted-foreground/25 hover:border-muted-foreground/50'} transition-colors`}>
                      <Input
                        id="wip-file"
                        type="file"
                        accept=".csv,.xlsx,.xls"
                        onChange={(e) => handleFileChange(e.target.files?.[0] || null, setWipFile)}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                      <div className="p-4 text-center">
                        {wipFile ? (
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 truncate">
                              <FileIcon className="h-4 w-4 shrink-0" />
                              <span className="truncate text-sm">{wipFile.name}</span>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="shrink-0"
                              onClick={(e) => {
                                e.preventDefault()
                                setWipFile(null)
                              }}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <Upload className="mx-auto h-8 w-8 text-muted-foreground/50 group-hover:text-muted-foreground/75" />
                            <p className="text-sm font-medium">Drop your file here or click to browse</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  {wipFile && (
                    <p className="text-xs text-muted-foreground">Size: {formatFileSize(wipFile.size)}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="rounded-lg bg-muted p-4">
              <div className="flex items-center gap-2 mb-3">
                <AlertCircle className="h-4 w-4 text-muted-foreground" />
                <h4 className="font-medium">File Requirements</h4>
              </div>
              <ul className="grid gap-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/50" />
                  Order Data file must include: Grade, Thi, Wid, F, Qty, Customer columns
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/50" />
                  Stock Data file must include: GRD, THK, WIDT, FIN, PKT columns
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/50" />
                  WIP Data file must include: Coil No, Grade, Thk, Width columns
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/50" />
                  Accepted formats: CSV, Excel (.xlsx, .xls)
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/50" />
                  Maximum file size: 10MB
                </li>
              </ul>
            </div>

            <Button
              onClick={handleSubmit}
              className="w-full"
              disabled={processing || !orderFile || !stockFile || !wipFile}
            >
              {processing ? (
                <>
                  <div className="mr-2 animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-background"></div>
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  <span>Generate Heat Plans</span>
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 