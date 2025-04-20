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

  const FileUploadBox = ({ id, label, description, file, setFile }: any) => (
    <div className="group relative transform transition-all duration-300 hover:scale-[1.02]">
      <div className={`
        relative overflow-hidden rounded-2xl border-3 border-dashed p-1
        transition-all duration-300 backdrop-blur-sm
        ${file 
          ? 'border-green-500 bg-gradient-to-br from-green-50/90 to-green-100/90 shadow-lg shadow-green-100' 
          : 'border-green-200 hover:border-green-400 bg-white/70 hover:bg-green-50/80 hover:shadow-lg'
        }
      `}>
        <input
          id={id}
          type="file"
          accept=".csv,.xlsx,.xls"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) setFile(file)
          }}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
        />
        <div className="p-8">
          <div className="text-center">
            <div className={`
              w-24 h-24 mx-auto rounded-2xl flex items-center justify-center mb-6
              transition-all duration-500 transform
              ${file 
                ? 'bg-green-100/80 scale-110' 
                : 'bg-green-50 group-hover:bg-green-100/60 group-hover:scale-110'
              }
            `}>
              <div className="relative">
                <Upload className={`
                  w-12 h-12 transition-all duration-300
                  ${file 
                    ? 'text-green-600 transform scale-110' 
                    : 'text-green-400 group-hover:text-green-500'
                  }
                `} />
                {file && (
                  <div className="absolute -top-1 -right-1 w-3 h-3">
                    <div className="absolute w-full h-full rounded-full bg-green-500 animate-ping opacity-75"></div>
                    <div className="relative w-full h-full rounded-full bg-green-500"></div>
                  </div>
                )}
              </div>
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-3">{label}</h3>
            <div className="space-y-3">
              {file ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="flex items-center px-4 py-2 bg-green-100 rounded-full">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse mr-2"/>
                    <span className="text-sm font-medium text-green-700 truncate max-w-[200px]">
                      {file.name}
                    </span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="shrink-0 hover:bg-red-50"
                    onClick={(e) => {
                      e.preventDefault()
                      setFile(null)
                    }}
                  >
                    <X className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-sm text-gray-500 font-medium">
                    Drop your file here, or click to browse
                  </p>
                  <p className="text-xs text-gray-400">
                    Supports Excel or CSV files
                  </p>
                </div>
              )}
              <div className="flex items-center justify-center space-x-2 bg-gray-50/80 rounded-lg px-3 py-2">
                <AlertCircle className="w-4 h-4 text-gray-400" />
                <span className="text-xs text-gray-500">{description}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-green-50/80 to-white">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex items-center gap-4 mb-12">
          <Link href="/dashboard">
            <Button variant="ghost" size="icon" className="rounded-full hover:bg-green-100">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-gray-900">Create Heat Plan</h1>
            <p className="text-lg text-gray-500 mt-2">Upload your data files to generate heat plans</p>
          </div>
        </div>

        <Card className="shadow-xl rounded-2xl border-green-100 overflow-hidden bg-white/80 backdrop-blur-sm">
          <CardHeader className="border-b border-green-100 bg-gradient-to-r from-green-50 to-white px-10 py-8">
            <CardTitle className="text-3xl font-bold text-gray-800 flex items-center gap-3">
              <Upload className="w-8 h-8 text-green-600" />
              Upload Files
            </CardTitle>
          </CardHeader>
          <CardContent className="p-10">
            {error && (
              <Alert variant="destructive" className="mb-8">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="grid gap-10 md:grid-cols-3">
              <FileUploadBox
                id="orderFile"
                label="Order Data File"
                description="Excel file with columns: Grade, Thi, Wid, F, Qty, Customer"
                file={orderFile}
                setFile={setOrderFile}
              />

              <FileUploadBox
                id="stockFile"
                label="Stock Data File"
                description="Excel file with columns: GRD, THK, WIDT, FIN, PKT"
                file={stockFile}
                setFile={setStockFile}
              />

              <FileUploadBox
                id="wipFile"
                label="WIP Data File"
                description="Excel file with columns: Coil No, Grade, Thk, Width"
                file={wipFile}
                setFile={setWipFile}
              />
            </div>

            <div className="mt-10">
              <div className="rounded-xl bg-muted p-6 mb-8">
                <div className="flex items-center gap-3 mb-4">
                  <AlertCircle className="h-5 w-5 text-muted-foreground" />
                  <h4 className="text-lg font-medium">File Requirements</h4>
                </div>
                <ul className="grid gap-3 text-sm text-muted-foreground">
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
                disabled={processing || !orderFile || !stockFile || !wipFile}
                className={`
                  w-full py-8 rounded-xl text-xl font-semibold
                  transition-all duration-300 flex items-center justify-center gap-3
                  shadow-lg hover:shadow-xl transform hover:-translate-y-0.5
                  ${processing 
                    ? 'bg-green-100 text-green-700 cursor-not-allowed'
                    : !orderFile || !stockFile || !wipFile
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white'
                  }
                `}
              >
                {processing ? (
                  <>
                    <div className="animate-spin rounded-full h-7 w-7 border-3 border-current border-t-transparent"></div>
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <Upload className="h-7 w-7" />
                    <span>Generate Heat Plans</span>
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 