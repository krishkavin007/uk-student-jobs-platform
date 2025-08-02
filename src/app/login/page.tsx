// app/login/page.tsx
"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Header } from "@/components/ui/header"
import { ContactModal } from "@/components/ui/contact-modal";
import { useAuth } from "@/app/context/AuthContext";
import { Eye, EyeOff } from "lucide-react"; // Import Eye and EyeOff icons

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [rememberMe, setRememberMe] = useState(false); // New state for "Remember me"
  const [showPassword, setShowPassword] = useState(false); // New state for password visibility
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null);
  const router = useRouter()
  const { login: authLogin, user } = useAuth();

  // Handle redirection if already logged in using useEffect
  useEffect(() => {
    if (user) {
      router.replace('/my-account');
    }
  }, [user, router]); // Dependencies: user and router

  // Effect to handle "Remember me" functionality on component mount
  useEffect(() => {
    // Check if an email was remembered
    const rememberedUserEmail = localStorage.getItem("rememberedUserEmail");
    if (rememberedUserEmail) {
      setEmail(rememberedUserEmail);
      setRememberMe(true); // Set rememberMe to true if email was found
    }
  }, []); // Empty dependency array means this runs once on mount

  // If user is already logged in, return null to prevent rendering the login form while redirecting
  if (user) {
    return null;
  }

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null); // Clear previous errors

    try {
      // Save or remove email based on rememberMe state
      if (rememberMe) {
        localStorage.setItem("rememberedUserEmail", email);
      } else {
        localStorage.removeItem("rememberedUserEmail");
      }

      // MODIFIED: Changed the API endpoint from '/api/login' to '/api/auth/login'
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        // Include the rememberMe flag in the request body
        body: JSON.stringify({ email, password, rememberMe }), // Assuming backend expects 'username' or 'email' for login
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Login failed. Please check your credentials.');
      }

      const userData = await response.json();
      console.log("LoginPage: API Response User Data:", userData);
      
      authLogin(userData);
      console.log("LoginPage: authLogin called, navigating to /my-account.");

      router.push('/my-account');

    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error("Login error:", err.message);
        setError(err.message || 'An unexpected error occurred. Please try again.');
      } else {
        console.error("Login error:", err);
        setError('An unknown error occurred. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  }

  const handleGoogleLogin = () => {
    console.log("Google login clicked")
    // IMPORTANT: In a real application, you should replace alert() with a custom modal or toast notification.
    alert("Google login is not yet implemented. Please use email registration.");
  }

  return (
    <div className="min-h-screen bg-gray-950 relative">
      <div className="fixed inset-0 z-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-[#4a007f] to-[#004a7f] opacity-40 blur-[100px]" style={{ transform: 'translate(-40%, -40%)' }}></div>
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full bg-gradient-to-tl from-[#007f4a] to-[#4a7f00] opacity-35 blur-[90px]" style={{ transform: 'translate(40%, 40%)' }}></div>
        <div className="absolute top-1/2 left-1/2 w-[450px] h-[450px] rounded-full bg-gradient-to-tr from-[#7f4a00] to-[#7f004a] opacity-5 blur-[80px]" style={{ transform: 'translate(-50%, -50%)' }}></div>
      </div>

      <Header user={user} isLoading={isLoading} logout={() => {}} className="fixed top-0 left-0 right-0 z-[9999] bg-gray-900 text-white border-b-0" />

      <div className="relative z-10 flex-grow flex items-center justify-center p-4 pt-[120px]">
        <Card className="w-full max-w-md bg-gray-900 border border-gray-800 text-gray-100">
          <CardHeader className="space-y-1">
            <div className="text-center mb-4">
              <Link href="/" className="font-bold text-2xl text-gray-100">
                StudentJobs UK
              </Link>
            </div>
            <CardTitle className="text-2xl font-bold text-center text-gray-100">Welcome back</CardTitle>
            <CardDescription className="text-center text-gray-300">
              Sign in to your StudentJobs UK account
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              variant="outline"
              className="w-full bg-gray-800 border-gray-700 text-gray-100 hover:bg-gray-700 hover:text-gray-50"
              onClick={handleGoogleLogin}
            >
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continue with Google
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full bg-gray-700" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-gray-900 px-2 text-gray-400">Or continue with email</span>
              </div>
            </div>

            <form onSubmit={handleEmailLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-200">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="student@university.ac.uk"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-gray-800 text-gray-100 border-gray-700 placeholder:text-gray-500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-200">Password</Label>
                {/* Password input with toggle icon */}
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"} // Toggle type based on state
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="bg-gray-800 text-gray-100 border-gray-700 placeholder:text-gray-500 pr-10" // Add padding-right for icon
                  />
                  <button
                    type="button" // Important: Prevent form submission
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-200 focus:outline-none"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Remember me checkbox */}
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="rememberMe"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                />
                <Label htmlFor="rememberMe" className="text-gray-300 cursor-pointer">
                  Remember me
                </Label>
              </div>

              {error && (
                <p className="text-red-400 text-sm text-center">{error}</p>
              )}

              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={isLoading}>
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
            </form>

            <div className="text-center space-y-2">
              <Link href="/forgot-password" className="text-blue-400 hover:underline">
                Forgot your password?
              </Link>
              <div className="text-sm text-gray-400">
                Don't have an account?{" "}
                <Link href="/signup" className="text-blue-400 hover:underline">
                  Sign up
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

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
                    <button className="text-gray-400 hover:text-purple-200 text-left px-0 py-0 text-sm font-medium">Contact Us</button>
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