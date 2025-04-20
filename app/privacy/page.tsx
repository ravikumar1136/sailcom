import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"

export default function PrivacyPolicyPage() {
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
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl">Privacy Policy</h1>
            <p className="text-muted-foreground">Last updated: April 11, 2023</p>
          </div>

          <div className="space-y-8">
            <section className="space-y-4">
              <h2 className="text-2xl font-bold">Introduction</h2>
              <p>
                Steel Authority of India Limited (SAIL) respects your privacy and is committed to protecting your
                personal data. This privacy policy will inform you about how we look after your personal data when you
                visit our website and tell you about your privacy rights and how the law protects you.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold">The Data We Collect About You</h2>
              <p>
                Personal data, or personal information, means any information about an individual from which that person
                can be identified. It does not include data where the identity has been removed (anonymous data).
              </p>
              <p>
                We may collect, use, store and transfer different kinds of personal data about you which we have grouped
                together as follows:
              </p>
              <ul className="list-disc list-inside space-y-2 pl-4">
                <li>Identity Data includes first name, last name, username or similar identifier.</li>
                <li>Contact Data includes email address and telephone numbers.</li>
                <li>
                  Technical Data includes internet protocol (IP) address, your login data, browser type and version,
                  time zone setting and location, browser plug-in types and versions, operating system and platform, and
                  other technology on the devices you use to access this website.
                </li>
                <li>Usage Data includes information about how you use our website, products and services.</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold">How We Use Your Personal Data</h2>
              <p>
                We will only use your personal data when the law allows us to. Most commonly, we will use your personal
                data in the following circumstances:
              </p>
              <ul className="list-disc list-inside space-y-2 pl-4">
                <li>Where we need to perform the contract we are about to enter into or have entered into with you.</li>
                <li>
                  Where it is necessary for our legitimate interests (or those of a third party) and your interests and
                  fundamental rights do not override those interests.
                </li>
                <li>Where we need to comply with a legal obligation.</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold">Data Security</h2>
              <p>
                We have put in place appropriate security measures to prevent your personal data from being accidentally
                lost, used or accessed in an unauthorized way, altered or disclosed. In addition, we limit access to
                your personal data to those employees, agents, contractors and other third parties who have a business
                need to know. They will only process your personal data on our instructions and they are subject to a
                duty of confidentiality.
              </p>
              <p>
                We have put in place procedures to deal with any suspected personal data breach and will notify you and
                any applicable regulator of a breach where we are legally required to do so.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold">Your Legal Rights</h2>
              <p>
                Under certain circumstances, you have rights under data protection laws in relation to your personal
                data, including the right to:
              </p>
              <ul className="list-disc list-inside space-y-2 pl-4">
                <li>Request access to your personal data.</li>
                <li>Request correction of your personal data.</li>
                <li>Request erasure of your personal data.</li>
                <li>Object to processing of your personal data.</li>
                <li>Request restriction of processing your personal data.</li>
                <li>Request transfer of your personal data.</li>
                <li>Right to withdraw consent.</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold">Contact Us</h2>
              <p>If you have any questions about this privacy policy or our privacy practices, please contact us at:</p>
              <div className="pl-4">
                <p>Steel Authority of India Limited</p>
                <p>Ispat Bhawan, Lodhi Road</p>
                <p>New Delhi - 110003, India</p>
                <p>Email: privacy@sail.co.in</p>
              </div>
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
