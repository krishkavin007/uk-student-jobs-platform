// src/app/signup/page.tsx
"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Header } from "@/components/ui/header"
import { ContactModal } from "@/components/ui/contact-modal";

// Define a TypeScript interface for the payload to satisfy ESLint
interface UserPayload {
  user_username: string;
  user_email: string;
  password: string;
  user_type: "student" | "employer";
  user_first_name: string;
  user_last_name: string;
  contact_phone_number: string;
  university_college?: string; // Optional for employer, required for student
  organization_name?: string; // Optional for student, required for employer
  // google_id is not included in this form, so it's omitted
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
    businessName: "",
    agreeToTerms: false,
  })
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState(''); // Added for success messages
  const [error, setError] = useState('');     // Added for error messages

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  // UPDATED handleSubmit function to connect to backend API and adhere to TypeScript
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(''); // Clear previous messages
    setError('');   // Clear previous errors

    // --- Frontend Validation ---
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      setIsLoading(false);
      return;
    }
    if (!formData.agreeToTerms) {
      setError("You must agree to the Terms & Conditions and Privacy Policy.");
      setIsLoading(false);
      return;
    }

    // Determine username (backend requires it, but form doesn't have an explicit field)
    // Using email prefix or a combination of names as a default username for the backend 'user_username'
    const user_username = formData.email.split('@')[0] || `${formData.firstName}${formData.lastName}`.toLowerCase();

    // Prepare payload based on user type, mapping to backend database fields
    // Using const for payload as the object itself is not reassigned, only its properties are modified.
    const payload: UserPayload = {
      user_username: user_username, // Dynamically set username for backend
      user_email: formData.email,
      password: formData.password, // Matches backend's 'password' field in server.js
      user_type: userType, // 'student' or 'employer'
      user_first_name: formData.firstName,
      user_last_name: formData.lastName,
      contact_phone_number: formData.phone,
    };

    // Add type-specific fields based on user_type
    if (userType === 'student') {
      payload.university_college = formData.university;
      // For employer, organization_name will be undefined as it's not set here
    } else if (userType === 'employer') {
      payload.organization_name = formData.businessName;
      // For student, university_college will be undefined as it's not set here
    }

    try {
      // Your backend is at /api/user. Ensure your Next.js project proxies this correctly,
      // or that you are using absolute paths if your Next.js is not on the same domain as Node.js.
      // For now, assuming /api/user correctly targets your Node.js backend.
      const res = await fetch('/api/user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage('Account created successfully! Welcome!');
        // Optionally clear form fields after successful submission
        setFormData({
          firstName: "", lastName: "", email: "", phone: "",
          password: "", confirmPassword: "", university: "",
          businessName: "", agreeToTerms: false,
        });
        // You might want to redirect the user to a login page or dashboard here
        // To use useRouter, you would import it: import { useRouter } from 'next/navigation';
        // const router = useRouter();
        // router.push('/login');
      } else {
        // Handle API errors (e.g., duplicate email from backend, validation errors)
        setError(data.error || 'Failed to create account. Please try again.');
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
    // This will require integration with Google's OAuth, which is a separate complex step.
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col">
      <Header showAuth={false} />

      <div className="flex-grow flex items-center justify-center p-4">
        <Card className="w-full max-w-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">Join StudentJobs UK</CardTitle>
            <CardDescription className="text-center">
              Create your account to get started
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={userType} onValueChange={(value) => setUserType(value as "student" | "employer")}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="student">
                  I'm a Student
                  <Badge variant="secondary" className="ml-2">Job Seeker</Badge>
                </TabsTrigger>
                <TabsTrigger value="employer">
                  I'm an Employer
                  <Badge variant="secondary" className="ml-2">Job Poster</Badge>
                </TabsTrigger>
              </TabsList>

              <div className="mt-6">
                {/* Google Sign Up */}
                <Button
                  variant="outline"
                  className="w-full mb-4"
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
                    <Separator className="w-full" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-gray-500">Or continue with email</span>
                  </div>
                </div>

                {/* Display messages for success or error */}
                {message && <p style={{ color: 'green', textAlign: 'center', marginBottom: '10px' }}>{message}</p>}
                {error && <p style={{ color: 'red', textAlign: 'center', marginBottom: '10px' }}>{error}</p>}


                <TabsContent value="student" className="mt-0">
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name</Label>
                        <Input
                          id="firstName"
                          value={formData.firstName}
                          onChange={(e) => handleInputChange("firstName", e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input
                          id="lastName"
                          value={formData.lastName}
                          onChange={(e) => handleInputChange("lastName", e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Student Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="yourname@university.ac.uk"
                        value={formData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        required
                      />
                      <p className="text-xs text-gray-500">Use your university email for verification</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="university">University/College</Label>
                      <Input
                        id="university"
                        placeholder="e.g., University of Manchester"
                        value={formData.university}
                        onChange={(e) => handleInputChange("university", e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="+44 7XXX XXX XXX"
                        value={formData.phone}
                        onChange={(e) => handleInputChange("phone", e.target.value)}
                        required
                      />
                      <p className="text-xs text-gray-500">Required for verification</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <Input
                          id="password"
                          type="password"
                          value={formData.password}
                          onChange={(e) => handleInputChange("password", e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirm Password</Label>
                        <Input
                          id="confirmPassword"
                          type="password"
                          value={formData.confirmPassword}
                          onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="terms"
                        checked={formData.agreeToTerms}
                        onCheckedChange={(checked) => handleInputChange("agreeToTerms", checked as boolean)}
                      />
                      <label htmlFor="terms" className="text-sm">
                        I agree to the{" "}
                        <Link href="/terms" className="text-blue-600 hover:underline">
                          Terms & Conditions
                        </Link>{" "}
                        and{" "}
                        <Link href="/privacy" className="text-blue-600 hover:underline">
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
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name</Label>
                        <Input
                          id="firstName"
                          value={formData.firstName}
                          onChange={(e) => handleInputChange("firstName", e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input
                          id="lastName"
                          value={formData.lastName}
                          onChange={(e) => handleInputChange("lastName", e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="businessName">Business/Organization Name</Label>
                      <Input
                        id="businessName"
                        placeholder="e.g., Local Coffee Shop Ltd"
                        value={formData.businessName}
                        onChange={(e) => handleInputChange("businessName", e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Business Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="you@business.co.uk"
                        value={formData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="+44 7XXX XXX XXX"
                        value={formData.phone}
                        onChange={(e) => handleInputChange("phone", e.target.value)}
                        required
                      />
                      <p className="text-xs text-gray-500">Required for verification</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <Input
                          id="password"
                          type="password"
                          value={formData.password}
                          onChange={(e) => handleInputChange("password", e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirm Password</Label>
                        <Input
                          id="confirmPassword"
                          type="password"
                          value={formData.confirmPassword}
                          onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="terms"
                        checked={formData.agreeToTerms}
                        onCheckedChange={(checked) => handleInputChange("agreeToTerms", checked as boolean)}
                      />
                      <label htmlFor="terms" className="text-sm">
                        I agree to the{" "}
                        <Link href="/terms" className="text-blue-600 hover:underline">
                          Terms & Conditions
                        </Link>{" "}
                        and{" "}
                        <Link href="/privacy" className="text-blue-600 hover:underline">
                          Privacy Policy
                        </Link>
                      </label>
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-blue-600 hover:bg-blue-700"
                      disabled={isLoading || !formData.agreeToTerms}
                    >
                      {isLoading ? "Creating Account..." : "Create Employer Account"}
                    </Button>
                  </form>
                </TabsContent>

                <div className="text-center mt-4">
                  <div className="text-sm text-gray-600">
                    Already have an account?{" "}
                    <Link href="/login" className="text-blue-600 hover:underline">
                      Sign in
                    </Link>
                  </div>
                </div>
              </div>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Footer */}
      <footer className="w-full py-6 bg-gray-900 text-white mt-16">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="grid gap-8 lg:grid-cols-4">
            <div>
              <h3 className="font-bold text-lg mb-4">StudentJobs UK</h3>
              <p className="text-gray-300 text-sm">
                Connecting UK students with flexible part-time opportunities.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-3">For Students</h4>
              <nav className="flex flex-col space-y-2 text-sm">
                <Link href="/browse-jobs" className="text-gray-300 hover:text-white">Browse Jobs</Link>
                <Link href="/how-it-works" className="text-gray-300 hover:text-white">How It Works</Link>
                <Link href="/student-guide" className="text-gray-300 hover:text-white">Student Guide</Link>
              </nav>
            </div>
            <div>
              <h4 className="font-semibold mb-3">For Employers</h4>
              <nav className="flex flex-col space-y-2 text-sm">
                <Link href="/post-job" className="text-gray-300 hover:text-white">Post a Job</Link>
                <Link href="/pricing" className="text-gray-300 hover:text-white">Pricing</Link>
                <Link href="/employer-guide" className="text-gray-300 hover:text-white">Employer Guide</Link>
              </nav>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Legal</h4>
              <nav className="flex flex-col space-y-2 text-sm">
                <Link href="/privacy" className="text-gray-300 hover:underline">Privacy Policy</Link>
                <Link href="/terms" className="text-gray-300 hover:underline">Terms & Conditions</Link>
                <Link href="/refund-policy" className="text-gray-300 hover:underline">Refund Policy</Link>
                <ContactModal>
                    <button className="text-gray-300 hover:text-white text-left px-0 py-0 text-sm font-medium">Contact Us</button>
                </ContactModal>
              </nav>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-800 text-center text-sm text-gray-300">
            © 2025 StudentJobs UK. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}