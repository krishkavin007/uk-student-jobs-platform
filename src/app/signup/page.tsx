// app/signup/page.tsx
"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Header } from "@/components/ui/header"
import { useAuth } from "@/app/context/AuthContext";

// Define a TypeScript interface for the payload to satisfy ESLint
interface UserPayload {
  user_username: string;
  user_email: string;
  password: string;
  user_type: "student" | "employer";
  user_first_name: string;
  user_last_name: string;
  contact_phone_number: string;
  university_college?: string;
  organisation_name?: string; // Corrected to 'organisation_name' for consistency
  user_city?: string; // Added user_city to payload interface
}

export default function SignupPage() {
  const [userType, setUserType] = useState<"student" | "employer">("student")
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    university: "",
    businessName: "", // This will be mapped to organisation_name in payload
    city: "", // ADDED: city to formData state
    agreeToTerms: false,
    // Honeypot field - should remain empty
    website: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Destructure 'login' from useAuth
  const { user, isLoading: authLoading, logout, login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextUrl = searchParams?.get('next');

  // Effect to redirect if user is already logged in
  useEffect(() => {
    if (!authLoading && user) {
      router.replace('/my-account');
    }
  }, [user, authLoading, router]);

  // UPDATED: Phone number validation regex for common UK formats.
const UK_PHONE_REGEX = /^(?:\+44\s?7|0044\s?7|44\s?7|07|7)\d{3}[\s-]?\d{3}[\s-]?\d{3}$/;
  const handleInputChange = (field: string, value: string | boolean) => {
    // Capitalize first letter for name fields (excluding email, phone, password)
    if (typeof value === 'string' && ['firstName', 'lastName', 'university', 'businessName', 'city'].includes(field)) {
      // Capitalize first letter of each word
      value = value.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());
    }
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');
    setError('');

    // Honeypot check - if website field is filled, it's likely a bot
    if (formData.website) {
      console.log('Bot detected via honeypot field');
      setIsLoading(false);
      return; // Silently reject without showing error
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      setIsLoading(false);
      return;
    }
    if (formData.password.length < 6) { // Basic password length check
      setError("Password must be at least 6 characters long.");
      setIsLoading(false);
      return;
    }
    if (!formData.agreeToTerms) {
      setError("You must agree to the Terms & Conditions and Privacy Policy.");
      setIsLoading(false);
      return;
    }

    const cleanedPhoneNumber = formData.phone.replace(/[\s()-]/g, '');

    if (!UK_PHONE_REGEX.test(cleanedPhoneNumber)) {
      setError("Please enter a valid UK phone number format (e.g., 07123456789 or +447123456789).");
      setIsLoading(false);
      return;
    }

    const user_username = formData.email; // Use the full email as the username

    const payload: UserPayload = {
      user_username: user_username,
      user_email: formData.email,
      password: formData.password,
      user_type: userType,
      user_first_name: formData.firstName,
      user_last_name: formData.lastName,
      contact_phone_number: cleanedPhoneNumber,
      user_city: formData.city, // ADDED: city to payload
    };

    if (userType === 'student') {
      payload.university_college = formData.university;
      delete payload.organisation_name; // Ensure it's not sent for student
    } else if (userType === 'employer') {
      payload.organisation_name = formData.businessName; // Mapping businessName to organisation_name
      delete payload.university_college; // Ensure it's not sent for employer
    }

    try {
      const res = await fetch('/api/user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage('Account created successfully! Redirecting you to your account...');
        
        if (data.user) {
          login(data.user);
        }

        // Redirect to next URL if provided, otherwise to my-account
        if (nextUrl) {
          router.replace(nextUrl);
        } else {
          router.replace('/my-account');
        }
      } else {
        // --- FIX APPLIED HERE ---
        // Ensure that error state is always set to a string.
        // Backend's 'data.error' might be a string or an object like { message: "..." }
        setError(data.error?.message || data.error || 'Failed to create account. Please try again.');
      }
    } catch (err) {
      console.error("Frontend signup error:", err);
      setError('An unexpected error occurred. Please try again. Check browser console for more details.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignup = () => {
    console.log("Google signup clicked for:", userType)
    alert("Google signup is not yet implemented. Please use email registration.");
  }

  // MODIFIED: Loading state div background
  if (authLoading || user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-slate-600 dark:text-gray-300">Loading user state...</p>
      </div>
    );
  }

  return (
    // MODIFIED: Outer container for the entire page, providing the main background color and relative positioning
    <div className="min-h-screen bg-background relative">
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
      <Header user={user} isLoading={authLoading} logout={logout} currentPage="signup" className="fixed top-0 left-0 right-0 z-[9999] bg-background border-b border-border" />

      {/* MODIFIED: Main content area, needs to be above the blobs */}
      <div className="relative z-10 flex-grow flex items-center justify-center p-4 pt-[120px] md:mb-16"> {/* Added md:mb-16 for desktop breathing space above footer */}
        {/* MODIFIED: Card styles */}
        <Card className="w-full max-w-lg bg-white text-slate-900 border border-slate-200 dark:bg-gray-900 dark:border-gray-800 dark:text-gray-100">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center text-slate-900 dark:text-gray-100">Join StudentJobs UK</CardTitle>
            <CardDescription className="text-center text-slate-600 dark:text-gray-300">
              Create your account to get started
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* MODIFIED: TabsList and TabsTrigger styles */}
            <Tabs value={userType} onValueChange={(value) => setUserType(value as "student" | "employer")}>
              <TabsList className="grid w-full grid-cols-2 bg-slate-100 dark:bg-gray-800 border border-slate-200 dark:border-gray-700">
              <TabsTrigger value="student" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 text-slate-600 dark:text-gray-300 data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-300 hover:text-blue-600 dark:hover:text-blue-300">
  I'm a Student
  <Badge 
    variant="secondary" 
    className="ml-2 bg-blue-100 text-blue-600 border border-blue-200 dark:bg-blue-900/50 dark:text-blue-300 dark:border-blue-700 hidden sm:inline-block"
  >
    Job Seeker
  </Badge>
</TabsTrigger>

<TabsTrigger value="employer" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 text-slate-600 dark:text-gray-300 data-[state=active]:text-green-600 dark:data-[state=active]:text-green-300 hover:text-green-600 dark:hover:text-green-300">
  I'm an Employer
  <Badge 
    variant="secondary" 
    className="ml-2 bg-green-100 text-green-600 border border-green-200 dark:bg-green-900/50 dark:text-green-300 dark:border-green-700 hidden sm:inline-block"
  >
    Job Poster
  </Badge>
                </TabsTrigger>
              </TabsList>

              <div className="mt-6">
                {/* Google Sign Up */}
                {/* MODIFIED: Google signup button styles */}
                <Button
                  variant="outline"
                  className="w-full mb-4 bg-white border-slate-300 text-slate-900 hover:bg-slate-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100 dark:hover:bg-gray-700"
                  onClick={handleGoogleSignup}
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

                <div className="relative mb-4">
                  <div className="absolute inset-0 flex items-center">
                    {/* MODIFIED: Separator color */}
                    <Separator className="w-full bg-slate-200 dark:bg-gray-700" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    {/* MODIFIED: Separator text color and background */}
                    <span className="bg-white dark:bg-gray-900 px-2 text-slate-500 dark:text-gray-400">Or continue with email</span>
                  </div>
                </div>

                {/* Display messages for success or error */}
                {/* MODIFIED: Message colors */}
                {message && <p className="text-green-600 dark:text-green-400 text-center mb-2">{message}</p>}
                {error && <p className="text-red-600 dark:text-red-400 text-center mb-2">{error}</p>}

                <TabsContent value="student" className="mt-0">
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Student Form Order: First Name, Last Name, University/College, City, Email, Phone Number, Password, Confirm Password */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        {/* MODIFIED: Label and Input styles */}
                        <Label htmlFor="firstName" className="text-slate-700 dark:text-gray-200">First Name</Label>
                        <Input
                          id="firstName"
                          value={formData.firstName}
                          onChange={(e) => handleInputChange("firstName", e.target.value)}
                          required
                          className="bg-white text-slate-900 border-slate-300 placeholder:text-slate-400 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700 dark:placeholder:text-gray-500"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName" className="text-slate-700 dark:text-gray-200">Last Name</Label>
                        <Input
                          id="lastName"
                          value={formData.lastName}
                          onChange={(e) => handleInputChange("lastName", e.target.value)}
                          required
                          className="bg-white text-slate-900 border-slate-300 placeholder:text-slate-400 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700 dark:placeholder:text-gray-500"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="university" className="text-slate-700 dark:text-gray-200">University/College</Label>
                      <Input
                        id="university"
                        placeholder="e.g., University of Manchester"
                        value={formData.university}
                        onChange={(e) => handleInputChange("university", e.target.value)}
                        required
                        className="bg-white text-slate-900 border-slate-300 placeholder:text-slate-400 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700 dark:placeholder:text-gray-500"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="city" className="text-slate-700 dark:text-gray-200">City</Label> {/* ADDED City input for Student */}
                      <Input
                        id="city"
                        placeholder="e.g., Manchester"
                        value={formData.city}
                        onChange={(e) => handleInputChange("city", e.target.value)}
                        required
                        className="bg-white text-slate-900 border-slate-300 placeholder:text-slate-400 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700 dark:placeholder:text-gray-500"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-slate-700 dark:text-gray-200">Student Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="yourname@university.ac.uk"
                        value={formData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        required
                        className="bg-white text-slate-900 border-slate-300 placeholder:text-slate-400 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700 dark:placeholder:text-gray-500"
                      />
                      <p className="text-xs text-slate-500 dark:text-gray-400">Use your university email for verification</p>
                    </div>

                    {/* Honeypot field - hidden from users, bots will fill this */}
                    <div style={{ display: 'none' }}>
                      <label htmlFor="website-student">Website URL (leave blank)</label>
                      <Input
                        id="website-student"
                        name="website"
                        type="text"
                        value={formData.website}
                        onChange={(e) => handleInputChange("website", e.target.value)}
                        autoComplete="off"
                        tabIndex={-1}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-slate-700 dark:text-gray-200">Phone Number</Label>
                      <Input
                        id="phone"
                        type="tel"
                        inputMode="numeric"
                        placeholder="+44 7XXX XXX XXX"
                        value={formData.phone}
                        onChange={(e) => handleInputChange("phone", e.target.value)}
                        required
                        className="bg-white text-slate-900 border-slate-300 placeholder:text-slate-400 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700 dark:placeholder:text-gray-500"
                      />
                      <p className="text-xs text-slate-500 dark:text-gray-400">Required for verification</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="password" className="text-slate-700 dark:text-gray-200">Password</Label>
                        <Input
                          id="password"
                          type="password"
                          value={formData.password}
                          onChange={(e) => handleInputChange("password", e.target.value)}
                          required
                          className="bg-white text-slate-900 border-slate-300 placeholder:text-slate-400 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700 dark:placeholder:text-gray-500"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword" className="text-slate-700 dark:text-gray-200">Confirm Password</Label>
                        <Input
                          id="confirmPassword"
                          type="password"
                          value={formData.confirmPassword}
                          onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                          required
                          className="bg-white text-slate-900 border-slate-300 placeholder:text-slate-400 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700 dark:placeholder:text-gray-500"
                        />
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      {/* MODIFIED: Checkbox and Label styles */}
                      <Checkbox
                        id="terms"
                        checked={formData.agreeToTerms}
                        onCheckedChange={(checked) => handleInputChange("agreeToTerms", checked as boolean)}
                        className="border-slate-400 dark:border-gray-500 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white"
                      />
                      <label htmlFor="terms" className="text-sm text-slate-600 dark:text-gray-300">
                        I agree to the{" "}
                        {/* MODIFIED: Link colors */}
                        <Link href="/terms" className="text-blue-600 hover:underline dark:text-blue-400" target="_blank" rel="noopener noreferrer">
                          Terms & Conditions
                        </Link>{" "}
                        and{" "}
                        <Link href="/privacy" className="text-blue-600 hover:underline dark:text-blue-400" target="_blank" rel="noopener noreferrer">
                          Privacy Policy
                        </Link>
                      </label>
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-blue-600 hover:bg-blue-700"
                      disabled={isLoading || !formData.agreeToTerms}
                    >
                      {isLoading ? "Creating Account..." : "Create Student Account"}
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="employer" className="mt-0">
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Employer Form Order: First Name, Last Name, Business/Organisation Name, City, Email, Phone Number, Password, Confirm Password */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName" className="text-slate-700 dark:text-gray-200">First Name</Label>
                        <Input
                          id="firstName"
                          value={formData.firstName}
                          onChange={(e) => handleInputChange("firstName", e.target.value)}
                          required
                          className="bg-white text-slate-900 border-slate-300 placeholder:text-slate-400 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700 dark:placeholder:text-gray-500"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName" className="text-slate-700 dark:text-gray-200">Last Name</Label>
                        <Input
                          id="lastName"
                          value={formData.lastName}
                          onChange={(e) => handleInputChange("lastName", e.target.value)}
                          required
                          className="bg-white text-slate-900 border-slate-300 placeholder:text-slate-400 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700 dark:placeholder:text-gray-500"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="businessName" className="text-slate-700 dark:text-gray-200">Business/Organisation Name</Label>
                      <Input
                        id="businessName"
                        placeholder="e.g., Local Coffee Shop Ltd"
                        value={formData.businessName}
                        onChange={(e) => handleInputChange("businessName", e.target.value)}
                        required
                        className="bg-white text-slate-900 border-slate-300 placeholder:text-slate-400 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700 dark:placeholder:text-gray-500"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="city" className="text-slate-700 dark:text-gray-200">City</Label> {/* ADDED City input for Employer */}
                      <Input
                        id="city"
                        placeholder="e.g., London"
                        value={formData.city}
                        onChange={(e) => handleInputChange("city", e.target.value)}
                        required
                        className="bg-white text-slate-900 border-slate-300 placeholder:text-slate-400 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700 dark:placeholder:text-gray-500"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-slate-700 dark:text-gray-200">Business Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="you@business.co.uk"
                        value={formData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        required
                        className="bg-white text-slate-900 border-slate-300 placeholder:text-slate-400 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700 dark:placeholder:text-gray-500"
                      />
                    </div>

                    {/* Honeypot field - hidden from users, bots will fill this */}
                    <div style={{ display: 'none' }}>
                      <label htmlFor="website-employer">Website URL (leave blank)</label>
                      <Input
                        id="website-employer"
                        name="website"
                        type="text"
                        value={formData.website}
                        onChange={(e) => handleInputChange("website", e.target.value)}
                        autoComplete="off"
                        tabIndex={-1}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-slate-700 dark:text-gray-200">Phone Number</Label>
                      <Input
                        id="phone"
                        type="tel"
                        inputMode="numeric"
                        placeholder="+44 7XXX XXX XXX"
                        value={formData.phone}
                        onChange={(e) => handleInputChange("phone", e.target.value)}
                        required
                        className="bg-white text-slate-900 border-slate-300 placeholder:text-slate-400 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700 dark:placeholder:text-gray-500"
                      />
                      <p className="text-xs text-slate-500 dark:text-gray-400">Required for verification</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="password" className="text-slate-700 dark:text-gray-200">Password</Label>
                        <Input
                          id="password"
                          type="password"
                          value={formData.password}
                          onChange={(e) => handleInputChange("password", e.target.value)}
                          required
                          className="bg-white text-slate-900 border-slate-300 placeholder:text-slate-400 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700 dark:placeholder:text-gray-500"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword" className="text-slate-700 dark:text-gray-200">Confirm Password</Label>
                        <Input
                          id="confirmPassword"
                          type="password"
                          value={formData.confirmPassword}
                          onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                          required
                          className="bg-white text-slate-900 border-slate-300 placeholder:text-slate-400 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700 dark:placeholder:text-gray-500"
                        />
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="terms"
                        checked={formData.agreeToTerms}
                        onCheckedChange={(checked) => handleInputChange("agreeToTerms", checked as boolean)}
                        className="border-slate-400 dark:border-gray-500 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white"
                      />
                      <label htmlFor="terms" className="text-sm text-slate-600 dark:text-gray-300">
                        I agree to the{" "}
                        <Link href="/terms" className="text-blue-600 hover:underline dark:text-blue-400" target="_blank" rel="noopener noreferrer">
                          Terms & Conditions
                        </Link>{" "}
                        and{" "}
                        <Link href="/privacy" className="text-blue-600 hover:underline dark:text-blue-400" target="_blank" rel="noopener noreferrer">
                          Privacy Policy
                        </Link>
                      </label>
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-green-600 hover:bg-green-700"
                      disabled={isLoading || !formData.agreeToTerms}
                    >
                      {isLoading ? "Creating Account..." : "Create Employer Account"}
                    </Button>
                  </form>
                </TabsContent>

                <div className="text-center mt-4">
                  <div className="text-sm text-slate-600 dark:text-gray-400"> {/* MODIFIED: Text color */}
                    Already have an account?{" "}
                    <Link href="/login" className="text-blue-600 hover:underline dark:text-blue-400"> {/* MODIFIED: Link color */}
                      Sign in
                    </Link>
                  </div>
                </div>
              </div>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}