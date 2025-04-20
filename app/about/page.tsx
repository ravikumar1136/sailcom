import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b">
        <div className="container flex h-16 items-center justify-between px-4 md:px-6">
          <Link href="/" className="flex items-center gap-2">
            <img src="/logo.png" alt="SAIL Logo" className="h-8 w-auto" />
            <span className="text-xl font-bold">SAIL</span>
          </Link>
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
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">About SAIL</h1>
                <p className="max-w-[700px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Steel Authority of India Limited (SAIL) is one of the largest state-owned steel-making companies in
                  India.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-2 lg:gap-12">
              <img
                src="/placeholder.svg?height=400&width=600"
                alt="SAIL Factory"
                className="mx-auto aspect-video overflow-hidden rounded-xl object-cover object-center sm:w-full lg:order-last"
              />
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold tracking-tighter sm:text-3xl">Our Mission</h2>
                  <p className="text-muted-foreground md:text-lg/relaxed">
                    To provide quality steel and related products for building infrastructure and strengthening India.
                    We are committed to sustainable development and environmental protection.
                  </p>
                </div>
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold tracking-tighter sm:text-3xl">Our Vision</h2>
                  <p className="text-muted-foreground md:text-lg/relaxed">
                    To be a respected world-class corporation and the leader in Indian steel business in quality,
                    productivity, profitability and customer satisfaction.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32 bg-muted">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">Our History</h2>
                <p className="max-w-[700px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  SAIL traces its origin to the Hindustan Steel Limited (HSL) which was set up in 1954.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl gap-8 py-12">
              <div className="grid gap-1">
                <h3 className="text-xl font-bold">1954</h3>
                <p className="text-muted-foreground">Hindustan Steel Limited (HSL) was formed.</p>
              </div>
              <div className="grid gap-1">
                <h3 className="text-xl font-bold">1973</h3>
                <p className="text-muted-foreground">
                  Steel Authority of India Limited (SAIL) was created as a holding company to oversee most of India's
                  steel production.
                </p>
              </div>
              <div className="grid gap-1">
                <h3 className="text-xl font-bold">1978</h3>
                <p className="text-muted-foreground">SAIL was restructured as an operating company.</p>
              </div>
              <div className="grid gap-1">
                <h3 className="text-xl font-bold">Present</h3>
                <p className="text-muted-foreground">
                  Today, SAIL is one of India's largest state-owned manufacturing companies and one of the top steel
                  producers in the world.
                </p>
              </div>
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">Our Plants</h2>
                <p className="max-w-[700px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  SAIL operates several integrated steel plants across India.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl gap-8 py-12 md:grid-cols-2 lg:grid-cols-3">
              <div className="rounded-lg border bg-background p-6 shadow-sm">
                <h3 className="text-xl font-bold">Bhilai Steel Plant</h3>
                <p className="text-muted-foreground mt-2">
                  Located in Chhattisgarh, it is SAIL's largest and most profitable plant.
                </p>
              </div>
              <div className="rounded-lg border bg-background p-6 shadow-sm">
                <h3 className="text-xl font-bold">Durgapur Steel Plant</h3>
                <p className="text-muted-foreground mt-2">
                  Located in West Bengal, it specializes in producing steel for the railway sector.
                </p>
              </div>
              <div className="rounded-lg border bg-background p-6 shadow-sm">
                <h3 className="text-xl font-bold">Rourkela Steel Plant</h3>
                <p className="text-muted-foreground mt-2">
                  Located in Odisha, it was the first integrated steel plant in the public sector in India.
                </p>
              </div>
              <div className="rounded-lg border bg-background p-6 shadow-sm">
                <h3 className="text-xl font-bold">Bokaro Steel Plant</h3>
                <p className="text-muted-foreground mt-2">
                  Located in Jharkhand, it is one of the largest steel plants in India.
                </p>
              </div>
              <div className="rounded-lg border bg-background p-6 shadow-sm">
                <h3 className="text-xl font-bold">IISCO Steel Plant</h3>
                <p className="text-muted-foreground mt-2">
                  Located in West Bengal, it is one of the oldest steel plants in India.
                </p>
              </div>
              <div className="rounded-lg border bg-background p-6 shadow-sm">
                <h3 className="text-xl font-bold">Salem Steel Plant</h3>
                <p className="text-muted-foreground mt-2">
                  Located in Tamil Nadu, it specializes in the production of stainless steel.
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
            <span className="text-sm font-semibold">SAIL</span>
          </div>
          <p className="text-center text-sm text-muted-foreground md:text-left">
            © {new Date().getFullYear()} Steel Authority of India Limited. All rights reserved.
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
