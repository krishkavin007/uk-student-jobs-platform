// app/login/page.tsx
"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Header } from "@/components/ui/header"
import { GoogleSignInButton } from "@/components/ui/google-signin-button"
import { useAuth } from "@/app/context/AuthContext";
import { Eye, EyeOff } from "lucide-react"; // Import Eye and EyeOff icons

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [rememberMe, setRememberMe] = useState(false); // New state for "Remember me"
  const [showPassword, setShowPassword] = useState(false); // New state for password visibility
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [error, setError] = useState<string | null>(null);
  const router = useRouter()
  const { login: authLogin, user } = useAuth();
  const searchParams = useSearchParams();
  const nextUrl = searchParams?.get('next');
  
  // Debug logging
  console.log("LoginPage: nextUrl from searchParams:", nextUrl);

  // Handle redirection if already logged in using useEffect
  useEffect(() => {
    if (user) {
      console.log("LoginPage: User already logged in, checking nextUrl:", nextUrl);
      if (nextUrl) {
        console.log("LoginPage: Redirecting logged-in user to nextUrl:", nextUrl);
        router.replace(nextUrl);
      } else {
        console.log("LoginPage: Redirecting logged-in user to /my-account");
        router.replace('/my-account');
      }
    }
  }, [user, router, nextUrl]); // Added nextUrl to dependencies

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
      console.log("LoginPage: authLogin called, navigating to next URL or /my-account.");

      // Redirect to next URL if provided, otherwise go to my-account
      console.log("LoginPage: About to redirect. nextUrl:", nextUrl);
      if (nextUrl) {
        console.log("LoginPage: Redirecting to nextUrl:", nextUrl);
        router.push(nextUrl);
      } else {
        console.log("LoginPage: No nextUrl, redirecting to /my-account");
        router.push('/my-account');
      }

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

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true)
    setError(null)
    
    try {
      // Redirect to Google OAuth endpoint
      window.location.href = '/api/auth/google'
    } catch (err) {
      console.error("Google login error:", err)
      setError('Failed to initiate Google sign-in. Please try again.')
      setIsGoogleLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background relative">
      <div className="fixed inset-0 z-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-[#4a007f] to-[#004a7f] opacity-40 blur-[100px]" style={{ transform: 'translate(-40%, -40%)' }}></div>
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full bg-gradient-to-tl from-[#007f4a] to-[#4a7f00] opacity-35 blur-[90px]" style={{ transform: 'translate(40%, 40%)' }}></div>
        <div className="absolute top-1/2 left-1/2 w-[450px] h-[450px] rounded-full bg-gradient-to-tr from-[#7f4a00] to-[#7f004a] opacity-5 blur-[80px]" style={{ transform: 'translate(-50%, -50%)' }}></div>
      </div>

      <Header user={user} isLoading={isLoading} logout={() => {}} currentPage="login" className="fixed top-0 left-0 right-0 z-[9999] bg-background border-b border-border" />

      <div className="relative z-10 flex-grow flex items-center justify-center p-4 pt-[120px] md:mb-16">
        <Card className="w-full max-w-md bg-white text-slate-900 border border-slate-200 dark:bg-gray-900 dark:border-gray-800 dark:text-gray-100">
          <CardHeader className="space-y-1">
            <div className="text-center mb-4">
              <Link href="/" className="font-bold text-2xl text-slate-900 dark:text-gray-100">
                StudentJobs UK
              </Link>
            </div>
            <CardTitle className="text-2xl font-bold text-center text-slate-900 dark:text-gray-100">Welcome back</CardTitle>
            <CardDescription className="text-center text-slate-600 dark:text-gray-300">
              Sign in to your StudentJobs UK account
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <GoogleSignInButton
              onClick={handleGoogleLogin}
              loading={isGoogleLoading}
              disabled={isGoogleLoading}
              variant="outline"
              size="lg"
              className="w-full bg-white border-slate-300 text-slate-900 hover:bg-slate-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100 dark:hover:bg-gray-700"
            >
              Continue with Google
            </GoogleSignInButton>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full bg-slate-200 dark:bg-gray-700" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-slate-500 dark:bg-gray-900 dark:text-gray-400">Or continue with email</span>
              </div>
            </div>

            <form onSubmit={handleEmailLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-700 dark:text-gray-200">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="student@university.ac.uk"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-white text-slate-900 border-slate-300 placeholder:text-slate-400 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700 dark:placeholder:text-gray-500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-700 dark:text-gray-200">Password</Label>
                {/* Password input with toggle icon */}
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"} // Toggle type based on state
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="bg-white text-slate-900 border-slate-300 placeholder:text-slate-400 pr-10 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700 dark:placeholder:text-gray-500" // Add padding-right for icon
                  />
                  <button
                    type="button" // Important: Prevent form submission
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-700 focus:outline-none dark:text-gray-400 dark:hover:text-gray-200"
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
                  className="h-4 w-4 text-blue-600 bg-white border-slate-300 rounded focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                />
                <Label htmlFor="rememberMe" className="text-slate-600 dark:text-gray-300 cursor-pointer">
                  Remember me
                </Label>
              </div>

              {error && (
                <p className="text-red-600 dark:text-red-400 text-sm text-center">{error}</p>
              )}

              <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground dark:bg-blue-600 dark:hover:bg-blue-700" disabled={isLoading}>
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
            </form>

            <div className="text-center space-y-2">
              <Link href="/forgot-password" className="text-blue-600 hover:underline dark:text-blue-400">
                Forgot your password?
              </Link>
              <div className="text-sm text-slate-600 dark:text-gray-400">
                Don't have an account?{" "}
                <Link href="/signup" className="text-blue-600 hover:underline dark:text-blue-400">
                  Sign up
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}