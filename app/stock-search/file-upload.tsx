"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Upload, X, FileIcon, AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface FileUploadProps {
  onStockFileChange: (file: File | null) => void
  onWipFileChange: (file: File | null) => void
}

export function FileUpload({ onStockFileChange, onWipFileChange }: FileUploadProps) {
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

  const handleStockFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null)
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      try {
        validateFile(file)
        setStockFile(file)
        onStockFileChange(file)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to upload file")
      }
    }
  }

  const handleWipFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null)
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      try {
        validateFile(file)
        setWipFile(file)
        onWipFileChange(file)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to upload file")
      }
    }
  }

  const removeStockFile = () => {
    setStockFile(null)
    onStockFileChange(null)
  }

  const removeWipFile = () => {
    setWipFile(null)
    onWipFileChange(null)
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Upload Data Files
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

        <div className="grid gap-6 md:grid-cols-2">
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
                    onChange={handleStockFileChange}
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
                            removeStockFile()
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
                    onChange={handleWipFileChange}
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
                            removeWipFile()
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
              Stock Data file must include: TYP, DTP, PKT, GRD, FIN, THK, WIDT columns
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
      </CardContent>
    </Card>
  )
}
