import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"

export default function TermsPage() {
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
      <main className="flex-1 p-4 md:p-6">
        <div className="container max-w-4xl">
          <div className="space-y-2 mb-8">
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl">Terms of Service</h1>
            <p className="text-muted-foreground">Last updated: April 11, 2023</p>
          </div>

          <div className="space-y-8">
            <section className="space-y-4">
              <h2 className="text-2xl font-bold">Introduction</h2>
              <p>
                These terms and conditions outline the rules and regulations for the use of Steel Authority of India
                Limited's (SAIL) website and services.
              </p>
              <p>
                By accessing this website, we assume you accept these terms and conditions in full. Do not continue to
                use SAIL's website if you do not accept all of the terms and conditions stated on this page.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold">License</h2>
              <p>
                Unless otherwise stated, SAIL and/or its licensors own the intellectual property rights for all material
                on this website. All intellectual property rights are reserved. You may view and/or print pages from the
                website for your own personal use subject to restrictions set in these terms and conditions.
              </p>
              <p>You must not:</p>
              <ul className="list-disc list-inside space-y-2 pl-4">
                <li>Republish material from this website</li>
                <li>Sell, rent or sub-license material from this website</li>
                <li>Reproduce, duplicate or copy material from this website</li>
                <li>Redistribute content from this website</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold">User Account</h2>
              <p>
                If you create an account on this website, you are responsible for maintaining the security of your
                account and you are fully responsible for all activities that occur under the account and any other
                actions taken in connection with the account.
              </p>
              <p>
                You must immediately notify SAIL of any unauthorized uses of your account or any other breaches of
                security. SAIL will not be liable for any acts or omissions by you, including any damages of any kind
                incurred as a result of such acts or omissions.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold">Services</h2>
              <p>
                The Stock Management System provided by SAIL is designed to help users find available stock based on
                specific criteria. The system processes data provided by the user and returns results based on the
                search algorithm described in the system documentation.
              </p>
              <p>
                SAIL does not guarantee the accuracy, completeness, or timeliness of the results provided by the system.
                The results are based on the data provided by the user and the search algorithm implemented in the
                system.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold">Limitation of Liability</h2>
              <p>
                In no event shall SAIL, nor any of its officers, directors and employees, be liable to you for anything
                arising out of or in any way connected with your use of this website, whether such liability is under
                contract, tort or otherwise, and SAIL shall not be liable for any indirect, consequential or special
                liability arising out of or in any way related to your use of this website.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold">Indemnification</h2>
              <p>
                You hereby indemnify to the fullest extent SAIL from and against any and all liabilities, costs,
                demands, causes of action, damages and expenses (including reasonable attorney's fees) arising out of or
                in any way related to your breach of any of the provisions of these Terms.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold">Governing Law & Jurisdiction</h2>
              <p>
                These Terms will be governed by and construed in accordance with the laws of India, and you submit to
                the non-exclusive jurisdiction of the state and federal courts located in India for the resolution of
                any disputes.
              </p>
            </section>
          </div>
        </div>
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
