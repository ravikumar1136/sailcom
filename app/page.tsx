import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, ArrowRight, BarChart3, Database, Search } from "lucide-react"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b">
        <div className="container flex h-16 items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2">
              <img src="/logo.png" alt="SAIL Logo" className="h-8 w-auto" />
              <span className="text-xl font-bold">SAIL </span>
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Link href="/login">
              <Button variant="outline">Login</Button>
            </Link>
            <Link href="/signup">
              <Button>Sign Up</Button>
            </Link>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <div className="container px-4 md:px-6 py-4">
          
        </div>
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
              <div className="space-y-4">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  Efficient Stock Management System
                </h1>
                <p className="text-muted-foreground md:text-xl">
                  Streamline your inventory tracking process with our advanced stock management system. Find available
                  stock quickly and efficiently.
                </p>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Link href="/login">
                    <Button size="lg" className="w-full min-[400px]:w-auto">
                      Get Started
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href="/about">
                    <Button size="lg" variant="outline" className="w-full min-[400px]:w-auto">
                      Learn More
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="flex justify-center">
                <div className="relative w-full max-w-md overflow-hidden rounded-lg border bg-background p-2">
                  <div className="bg-muted rounded-md p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <h3 className="font-medium">Stock Search</h3>
                        <p className="text-sm text-muted-foreground">Find available stock quickly</p>
                      </div>
                      <Search className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="rounded-lg bg-background p-3 shadow-sm">
                        <div className="flex items-center gap-2">
                          <Database className="h-4 w-4 text-primary" />
                          <span className="text-sm font-medium">Stock Data</span>
                        </div>
                      </div>
                      <div className="rounded-lg bg-background p-3 shadow-sm">
                        <div className="flex items-center gap-2">
                          <BarChart3 className="h-4 w-4 text-primary" />
                          <span className="text-sm font-medium">WIP Data</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32 bg-muted">
          <div className="container px-4 md:px-6">
            <div className="mx-auto flex max-w-[58rem] flex-col items-center justify-center gap-4 text-center">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Features</h2>
              <p className="max-w-[85%] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Our stock management system offers a comprehensive set of features to help you manage your inventory
                efficiently.
              </p>
            </div>
            <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-3">
              <div className="grid gap-2 rounded-lg border bg-background p-6 shadow-sm transition-all hover:shadow-md">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <Search className="h-5 w-5 text-primary" />
                </div>
                <h3 className="text-lg font-bold">Advanced Search</h3>
                <p className="text-sm text-muted-foreground">
                  Find stock based on Grade, Width, Thickness, and Finish with our intelligent search algorithm.
                </p>
              </div>
              <div className="grid gap-2 rounded-lg border bg-background p-6 shadow-sm transition-all hover:shadow-md">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <Database className="h-5 w-5 text-primary" />
                </div>
                <h3 className="text-lg font-bold">Data Integration</h3>
                <p className="text-sm text-muted-foreground">
                  Upload and analyze both Stock Data and WIP Data to get comprehensive inventory insights.
                </p>
              </div>
              <div className="grid gap-2 rounded-lg border bg-background p-6 shadow-sm transition-all hover:shadow-md">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <BarChart3 className="h-5 w-5 text-primary" />
                </div>
                <h3 className="text-lg font-bold">Real-time Results</h3>
                <p className="text-sm text-muted-foreground">
                  Get instant results with detailed information about available stock and work in progress.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="border-t py-6 md:py-8">
        <div className="container flex flex-col items-center justify-between gap-4 md:flex-row px-4 md:px-6">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="SAIL Logo" className="h-6 w-auto" />
            <span className="text-sm font-semibold">SAIL Stock Management</span>
          </div>
          <p className="text-center text-sm text-muted-foreground md:text-left">
            © {new Date().getFullYear()} SAIL. All rights reserved.
          </p>
          <div className="flex gap-4">
            <Link href="/about" className="text-sm text-muted-foreground hover:underline">
              About
            </Link>
            <Link href="/privacy" className="text-sm text-muted-foreground hover:underline">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-sm text-muted-foreground hover:underline">
              Terms
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
