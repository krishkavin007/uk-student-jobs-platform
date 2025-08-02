// app/forgot-password/page.tsx
"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Header } from "@/components/ui/header"
import { ContactModal } from "@/components/ui/contact-modal"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulate password reset process
    setTimeout(() => {
      setIsLoading(false)
      setIsSubmitted(true)
      console.log("Password reset request:", { email })
    }, 1000)
  }

  return (
    // MODIFIED: Outer container for the entire page, providing the main background color and relative positioning
    <div className="min-h-screen bg-gray-950 relative">
      {/* ADDED: Fixed background for blobs */}
      <div className="fixed inset-0 z-0 overflow-hidden">
        {/* Subtle glowing shapes for professional colorful aesthetic */}
        {/* Blob 1: Top-left, deep purple to deep blue */}
        <div className="absolute top-0 left-0 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-[#4a007f] to-[#004a7f] opacity-40 blur-[100px]" style={{ transform: 'translate(-40%, -40%)' }}></div>
        {/* Blob 2: Bottom-right, deep green to deep lime-green */}
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full bg-gradient-to-tl from-[#007f4a] to-[#4a7f00] opacity-35 blur-[90px]" style={{ transform: 'translate(40%, 40%)' }}></div>
        {/* Blob 3: Center-ish, deep orange to deep red-magenta */}
        <div className="absolute top-1/2 left-1/2 w-[450px] h-[450px] rounded-full bg-gradient-to-tr from-[#7f4a00] to-[#7f004a] opacity-5 blur-[80px]" style={{ transform: 'translate(-50%, -50%)' }}></div>
      </div>

      {/* FIXED HEADER (on top of everything) */}
      <Header showAuth={false} className="fixed top-0 left-0 right-0 z-[9999] bg-gray-900 text-white border-b-0" />

      {/* MODIFIED: Main content area, needs to be above the blobs */}
      <div className="relative z-10 flex-grow flex items-center justify-center px-4 pt-[120px] pb-16">
        {/* MODIFIED: Card styles */}
        <Card className="w-full max-w-md bg-gray-900 border border-gray-800 text-gray-100">
          <CardHeader className="space-y-1">
            <div className="text-center mb-4">
              <Link href="/" className="font-bold text-2xl text-gray-100"> {/* MODIFIED: Link text color */}
                StudentJobs UK
              </Link>
            </div>
            <CardTitle className="text-2xl font-bold text-center text-gray-100"> {/* MODIFIED: Title text color */}
              {isSubmitted ? "Check your email" : "Reset your password"}
            </CardTitle>
            <CardDescription className="text-center text-gray-300"> {/* MODIFIED: Description text color */}
              {isSubmitted
                ? "We've sent a password reset link to your email address"
                : "Enter your email address and we'll send you a link to reset your password"
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isSubmitted ? (
              <>
                <div className="text-center space-y-4">
                  {/* MODIFIED: Success icon background and color */}
                  <div className="mx-auto w-16 h-16 bg-green-900 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-gray-300"> {/* MODIFIED: Text color */}
                      We've sent a password reset email to <strong>{email}</strong>
                    </p>
                    <p className="text-sm text-gray-400 mt-2"> {/* MODIFIED: Text color */}
                      Didn't receive the email? Check your spam folder or try again.
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  {/* MODIFIED: Button styles */}
                  <Button
                    onClick={() => {
                      setIsSubmitted(false)
                      setEmail("")
                    }}
                    variant="outline"
                    className="w-full bg-gray-800 border-gray-700 text-gray-100 hover:bg-gray-700 hover:text-gray-50"
                  >
                    Try different email
                  </Button>
                  <Button asChild className="w-full bg-blue-600 hover:bg-blue-700">
                    <Link href="/login">Back to Sign In</Link>
                  </Button>
                </div>
              </>
            ) : (
              <>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-gray-200">Email address</Label> {/* MODIFIED: Label text color */}
                    <Input
                      id="email"
                      type="email"
                      placeholder="student@university.ac.uk"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      // MODIFIED: Input styles
                      className="bg-gray-800 text-gray-100 border-gray-700 placeholder:text-gray-500" 
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    disabled={isLoading}
                  >
                    {isLoading ? "Sending..." : "Send reset link"}
                  </Button>
                </form>

                <div className="text-center space-y-2">
                  <div className="text-sm text-gray-400"> {/* MODIFIED: Text color */}
                    Remember your password?{" "}
                    <Link href="/login" className="text-blue-400 hover:underline"> {/* MODIFIED: Link color */}
                      Sign in
                    </Link>
                  </div>
                  <div className="text-sm text-gray-400"> {/* MODIFIED: Text color */}
                    Don't have an account?{" "}
                    <Link href="/signup" className="text-blue-400 hover:underline"> {/* MODIFIED: Link color */}
                      Sign up
                    </Link>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* MODIFIED: Footer styles */}
      <footer className="w-full py-6 bg-gray-900 text-gray-300 mt-16 relative">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="grid gap-8 lg:grid-cols-4">
            <div>
              <h3 className="font-bold text-lg mb-4 text-white">StudentJobs UK</h3>
              <p className="text-gray-400 text-sm">
                Connecting UK students with flexible part-time opportunities.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-3 text-indigo-400">For Students</h4>
              <nav className="flex flex-col space-y-2 text-sm">
                <Link href="/browse-jobs" className="text-gray-400 hover:text-indigo-300">Browse Jobs</Link>
                <Link href="/how-it-works" className="text-gray-400 hover:text-indigo-300">How It Works</Link>
                <Link href="/student-guide" className="text-gray-400 hover:text-indigo-300">Student Guide</Link>
              </nav>
            </div>
            <div>
              <h4 className="font-semibold mb-3 text-indigo-300">For Employers</h4>
              <nav className="flex flex-col space-y-2 text-sm">
                <Link href="/post-job" className="text-gray-400 hover:text-indigo-200">Post a Job</Link>
                <Link href="/pricing" className="text-gray-400 hover:text-indigo-200">Pricing</Link>
                <Link href="/employer-guide" className="text-gray-400 hover:text-indigo-200">Employer Guide</Link>
              </nav>
            </div>
            <div>
              <h4 className="font-semibold mb-3 text-purple-300">Legal</h4>
              <nav className="flex flex-col space-y-2 text-sm">
                <Link href="/privacy" className="text-gray-400 hover:text-purple-200" target="_blank" rel="noopener noreferrer">Privacy Policy</Link>
                <Link href="/terms" className="text-gray-400 hover:text-purple-200" target="_blank" rel="noopener noreferrer">Terms & Conditions</Link>
                <Link href="/refund-policy" className="text-gray-400 hover:text-purple-200" target="_blank" rel="noopener noreferrer">Refund Policy</Link>
                <ContactModal>
                  {/* MODIFIED: Contact Us button styles */}
                  <button className="text-gray-400 hover:text-purple-200 text-left px-0 py-0 text-sm font-medium">
                    Contact Us
                  </button>
                </ContactModal>
              </nav>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-800 text-center text-sm text-gray-500">
            © 2025 StudentJobs UK. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}