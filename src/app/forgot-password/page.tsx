// app/forgot-password/page.tsx
"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Header } from "@/components/ui/header"
// Removed ContactModal import; global footer contains contact

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  // Honeypot field - should remain empty
  const [website, setWebsite] = useState("")
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    // Honeypot check - if website field is filled, it's likely a bot
    if (website) {
      console.log("Bot detected via honeypot field")
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setIsSubmitted(true);
      } else {
        setError(data.error || 'Failed to process request');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    // MODIFIED: Outer container for the entire page, providing the main background color and relative positioning
    <div className="min-h-screen bg-zinc-50 text-gray-900 dark:bg-gray-950 dark:text-gray-100 relative">
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
      <Header showAuth={false} className="fixed top-0 left-0 right-0 z-[9999] bg-white text-gray-900 border-b border-zinc-200 dark:bg-gray-900 dark:text-white dark:border-gray-800" />

      {/* MODIFIED: Main content area, needs to be above the blobs */}
      <div className="relative z-10 flex-grow flex items-center justify-center px-4 pt-[120px] pb-24 md:pb-16">
        {/* MODIFIED: Card styles */}
        <Card className="w-full max-w-md bg-white border border-zinc-200 text-gray-900 dark:bg-gray-900 dark:border-gray-800 dark:text-gray-100">
          <CardHeader className="space-y-1">
            <div className="text-center mb-4">
              <Link href="/" className="font-bold text-2xl text-gray-900 dark:text-gray-100"> {/* Link text colour */}
                StudentJobs UK
              </Link>
            </div>
            <CardTitle className="text-2xl font-bold text-center text-gray-900 dark:text-gray-100"> {/* Title text colour */}
              {isSubmitted ? "Check your email" : "Reset your password"}
            </CardTitle>
            <CardDescription className="text-center text-zinc-600 dark:text-gray-300"> {/* Description text colour */}
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
                  <div className="mx-auto w-16 h-16 rounded-full flex items-center justify-center bg-green-100 dark:bg-green-900">
                    <svg className="w-8 h-8 text-green-700 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-zinc-700 dark:text-gray-300"> {/* Text colour */}
                      We've sent a password reset email to <strong>{email}</strong>
                    </p>
                    <p className="text-sm text-zinc-500 dark:text-gray-400 mt-2"> {/* Text colour */}
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
                    className="w-full bg-white border-zinc-300 text-gray-900 hover:bg-zinc-50 hover:text-gray-900 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100 dark:hover:bg-gray-700"
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
                    <Label htmlFor="email" className="text-gray-700 dark:text-gray-200">Email address</Label> {/* Label text colour */}
                    <Input
                      id="email"
                      type="email"
                      placeholder="student@university.ac.uk"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      // MODIFIED: Input styles
                      className="bg-white text-gray-900 border-zinc-300 placeholder:text-zinc-400 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700 dark:placeholder:text-gray-500" 
                    />
                  </div>

                  {/* Honeypot field - hidden from users, bots will fill this */}
                  <div style={{ display: 'none' }}>
                    <label htmlFor="website-forgot">Website URL (leave blank)</label>
                    <Input
                      id="website-forgot"
                      name="website"
                      type="text"
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      autoComplete="off"
                      tabIndex={-1}
                    />
                  </div>

                  {error && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                        <p className="text-sm text-red-700">{error}</p>
                    </div>
                  )}

                  <Button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    disabled={isLoading}
                  >
                    {isLoading ? "Sending..." : "Send reset link"}
                  </Button>
                </form>

                <div className="text-center space-y-2">
                  <div className="text-sm text-zinc-600 dark:text-gray-400"> {/* Text colour */}
                    Remember your password?{" "}
                    <Link href="/login" className="text-blue-700 hover:underline dark:text-blue-400"> {/* Link colour */}
                      Sign in
                    </Link>
                  </div>
                  <div className="text-sm text-zinc-600 dark:text-gray-400"> {/* Text colour */}
                    Don't have an account?{" "}
                    <Link href="/signup" className="text-blue-700 hover:underline dark:text-blue-400"> {/* Link colour */}
                      Sign up
                    </Link>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Global footer is included via RootLayout */}
    </div>
  )
}