// app/post-job/page.tsx
"use client"

import { useState, useEffect, Suspense } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Logo } from "@/components/ui/logo"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ContactModal } from "@/components/ui/contact-modal";
import { Header } from '@/components/ui/header';
import { useAuth } from '@/app/context/AuthContext';
import { useRouter } from 'next/navigation';

// Define the interface for JobPayload
interface JobPayload {
  job_title: string;
  job_category: string;
  job_location: string;
  hourly_pay: number;
  hours_per_week: string;
  job_description: string;
  is_sponsored: boolean;
  contact_name: string;
  contact_phone: string;
  contact_email: string;
}

// MODIFIED: Define the interface for EmployerRegistrationPayload
// IMPORTANT: These keys MUST match what your server.js /api/auth/register endpoint is expecting
// If your backend expects 'user_first_name', 'user_last_name', etc., then change these keys accordingly.
// Based on typical backend structures, I'm using 'user_first_name', 'user_last_name', etc.
interface EmployerRegistrationPayload {
  user_first_name: string; // Changed from firstName
  user_last_name: string;  // Changed from lastName
  user_email: string;      // Changed from email
  contact_phone_number: string; // Changed from phoneNumber
  organisation_name: string;    // Changed from organisationName
  user_type: 'employer';
  password: string;
  user_city?: string;          // Changed from city
}


function PostJobContent() {
  const router = useRouter();
  // MODIFIED: Ensure refreshUser is destructured here, as it's provided by AuthContext
  const { user, isLoading: isAuthLoading, logout, refreshUser } = useAuth(); // <--- CORRECTED LINE

  const searchParams = useSearchParams()

  // MODIFIED: Updated formData state with 'organisationName' and 'agreeToTerms'
  const [formData, setFormData] = useState({
    title: "",
    category: "",
    location: "",
    hourlyPay: "",
    hoursPerWeek: "",
    description: "",
    // Employer Contact/Account Info
    firstName: "", // Frontend field name
    lastName: "",  // Frontend field name
    email: "",     // Frontend field name
    phoneNumber: "", // Frontend field name
    city: "",      // Frontend field name
    organisationName: "", // Frontend field name

    password: "",
    confirmPassword: "",
    externalUrl: "",
    sponsored: false,
    agreeToTerms: false, // ADDED: New state for terms agreement
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null);

  // Redirect logic for logged-in students
  useEffect(() => {
    if (!isAuthLoading && user && user.user_type === 'student') {
      console.log("LOG: Redirecting student to browse-jobs page.");
      router.push('/browse-jobs');
    }
  }, [user, isAuthLoading, router]);

  // If a user is logged in (specifically an employer), pre-fill relevant contact details
  useEffect(() => {
    if (!isAuthLoading && user && user.user_type === 'employer') {
      setFormData(prev => ({
        ...prev,
        firstName: user.user_first_name || "",
        lastName: user.user_last_name || "",
        email: user.user_email || "",
        phoneNumber: user.contact_phone_number || "",
        city: user.user_city || "",
        organisationName: user.organisation_name || "", // Pre-fill from user.organisation_name
      }));
      console.log("LOG: Employer data pre-filled:", user);
    }
  }, [user, isAuthLoading]);


  useEffect(() => {
    if (searchParams?.get('sponsored') === 'true') {
      setFormData(prev => ({ ...prev, sponsored: true }))
    }
  }, [searchParams])

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    console.log("LOG 0: handleSubmit initiated.");

    // Frontend validation for password fields if displayed (non-logged-in flow)
    if (!user && !isAuthLoading) {
      if (!formData.password) {
        setError("Password is required to create an account.");
        setIsLoading(false);
        console.log("LOG V1: Password missing.");
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        setError("Passwords do not match.");
        setIsLoading(false);
        console.log("LOG V2: Passwords do not match.");
        return;
      }
      if (formData.password.length < 6) {
        setError("Password must be at least 6 characters long.");
        setIsLoading(false);
        console.log("LOG V3: Password too short.");
        return;
      }
      if (!formData.agreeToTerms) {
        setError("You must agree to the Terms & Conditions and Privacy Policy.");
        setIsLoading(false);
        console.log("LOG V4: Terms not agreed.");
        return;
      }
    }

    // Basic client-side validation for job fields
    if (!formData.title || !formData.category || !formData.location || !formData.hourlyPay || !formData.hoursPerWeek || !formData.description || (!user && !formData.agreeToTerms)) {
      setError("Please fill in all required job details and accept the terms and conditions (if creating an account).");
      setIsLoading(false);
      console.log("LOG V5: Missing job or terms data.");
      return;
    }


    try {
      // 1. Prepare Job Payload
      const jobPayload: JobPayload = {
        job_title: formData.title,
        job_category: formData.category,
        job_location: formData.location,
        hourly_pay: parseFloat(formData.hourlyPay),
        hours_per_week: formData.hoursPerWeek,
        job_description: formData.description,
        is_sponsored: formData.sponsored,
        // Use user data if logged in, otherwise use form data for contact
        contact_name: user ? `${user.user_first_name || ''} ${user.user_last_name || ''}`.trim() : `${formData.firstName} ${formData.lastName}`.trim(),
        contact_phone: user ? (user.contact_phone_number || '') : formData.phoneNumber,
        contact_email: user ? (user.user_email || '') : formData.email,
      };

      // Define a variable to hold the user ID that will be used for posting the job
      let postedByUserId = user?.user_id; // Initialize with current user's ID if logged in

      // 2. Handle Employer Account Creation (if not logged in)
      if (!user && !isAuthLoading) {
        console.log("LOG A1: Attempting to create new employer account...");

        const employerRegistrationDataForBackend: EmployerRegistrationPayload = {
          user_first_name: formData.firstName,
          user_last_name: formData.lastName,
          user_email: formData.email,
          contact_phone_number: formData.phoneNumber,
          user_city: formData.city,
          organisation_name: formData.organisationName,
          user_type: 'employer',
          password: formData.password,
        };

        console.log("LOG A2: Sending registration data:", employerRegistrationDataForBackend);

        const registerResponse = await fetch('/api/auth/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(employerRegistrationDataForBackend),
        });

        console.log("LOG A3: Registration fetch response object:", registerResponse);

        if (!registerResponse.ok) {
          const errorData = await registerResponse.json();
          const errorMessage = errorData.message || errorData.error || 'Failed to create employer account.';
          console.error("LOG A4: Registration failed with error:", errorMessage, errorData);
          throw new Error(errorMessage);
        }

        const registerResponseData = await registerResponse.json();
        console.log("LOG A5: Employer account created successfully:", registerResponseData);

        // CRITICAL CHANGE: Get the user_id directly from the registration response
        // This ensures we have the ID immediately for job posting without waiting for state re-render
        postedByUserId = registerResponseData.user?.user_id; // <--- ADDED/MODIFIED LINE

        await refreshUser(); // This updates the global context state for subsequent renders
        console.log("LOG A6: Auth context re-fetched after registration.");
      }

      // 3. Post the Job (This will now run AFTER account creation if needed, or directly if logged in)
      console.log("LOG B1: Attempting to post job...");

      // Use the postedByUserId variable that now correctly contains the ID (either existing or new)
      const finalJobPayload = {
        ...jobPayload,
        posted_by_user_id: postedByUserId // <--- MODIFIED LINE
      };

      if (!finalJobPayload.posted_by_user_id) {
        throw new Error("User ID is missing. Cannot post job.");
      }

      console.log("LOG B2: Sending job payload:", finalJobPayload);

      const jobPostResponse = await fetch('/api/job', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(finalJobPayload),
      });

      console.log("LOG B3: Job post fetch response object:", jobPostResponse);


      if (!jobPostResponse.ok) {
        const errorData = await jobPostResponse.json();
        const errorMessage = errorData.message || errorData.error || 'Failed to post job.';
        console.error("LOG B4: Job posting failed with error:", errorMessage, errorData);
        throw new Error(errorMessage);
      }

      const jobResponseData = await jobPostResponse.json();
      console.log("LOG B5: Job posted successfully:", jobResponseData);

      alert(`Job posted successfully!`);

      // Redirect to account page or job list
      router.push('/my-account');
      console.log("LOG B6: Redirecting to /my-account.");

    } catch (err: unknown) {
      console.error("LOG C1: Error in job posting flow (full error object):", err);
      setError(err instanceof Error ? err.message : "An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
      console.log("LOG C3: Loading state set to false.");
    }
  };


  const postingCost = formData.sponsored ? 5 : 1

  // Render loading spinner if authentication is still loading
  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mx-auto"></div>
          <p className="mt-2 text-gray-300">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Redirect for logged-in students
  if (user && user.user_type === 'student') {
    return (
        <div className="min-h-screen bg-gray-950 flex items-center justify-center">
            <p className="text-lg text-gray-300">Redirecting to job listings for students...</p>
        </div>
    );
  }

  return (
    // Outer container for the entire page, providing the main background color and relative positioning
    // This div will ensure the bg-gray-950 covers the entire height and prevent white space below the footer.
    <div className="min-h-screen bg-gray-950 relative">

      {/* Fixed background for blobs. This div will stay in place when content scrolls. */}
      {/* It uses z-0 to be behind everything else, but is visible because the main content below is z-10 or higher. */}
      <div className="fixed inset-0 z-0 overflow-hidden">
        {/* Subtle glowing shapes for professional colorful aesthetic */}
        {/* Blob 1: Top-left, deep purple to deep blue */}
        <div className="absolute top-0 left-0 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-[#4a007f] to-[#004a7f] opacity-40 blur-[100px]" style={{ transform: 'translate(-40%, -40%)' }}></div>
        {/* Blob 2: Bottom-right, deep green to deep lime-green */}
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full bg-gradient-to-tl from-[#007f4a] to-[#4a7f00] opacity-35 blur-[90px]" style={{ transform: 'translate(40%, 40%)' }}></div>
        {/* Blob 3: Center-ish, deep orange to deep red-magenta */}
        <div className="absolute top-1/2 left-1/2 w-[450px] h-[450px] rounded-full bg-gradient-to-tr from-[#7f4a00] to-[#7f004a] opacity-5 blur-[80px]" style={{ transform: 'translate(-50%, -50%)' }}></div>
      </div>


      {/* Main content area, including header, form, and footer. This needs a z-index higher than the blobs. */}
      {/* We apply z-index directly to this div. The Header already has a very high z-index. */}
      {/* The background of this div needs to be effectively transparent if it's over the blobs. */}
      {/* However, since the blobs are fixed and the parent has the bg-gray-950, this structure is key. */}
      {/* This div will handle the scrolling content, including the sticky sidebar. */}
      <div className="relative z-10">

        {/* FIXED HEADER (on top of everything) */}
        <Header
          key={user ? user.user_id || 'employer-logged-in' : 'logged-out'}
          user={user}
          isLoading={isAuthLoading}
          logout={logout}
          className="fixed top-0 left-0 right-0 z-[9999] bg-gray-900 text-white border-b-0"
        />

        {/* Actual page content, starting below the fixed header */}
        <div className="container mx-auto px-4 py-8 max-w-4xl pt-[120px]">
          <div className="mb-8">
            <h1 className="text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-500 mb-2">
              Post a Part-Time Job
            </h1>
            <p className="text-gray-300">Connect with talented students in your area</p>
          </div>

          <div className="grid gap-8 lg:grid-cols-3">
            {/* Main Form */}
            <div className="lg:col-span-2">
              <Card className="bg-gray-900 border border-gray-800 text-gray-100">
                <CardHeader>
                  <CardTitle className="text-gray-100">Job Details</CardTitle>
                  <CardDescription className="text-gray-300">
                    Fill in the details about your part-time position
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="title" className="text-gray-200">Job Title *</Label>
                      <Input
                        id="title"
                        placeholder="e.g., Barista - Weekend Shifts"
                        value={formData.title}
                        onChange={(e) => handleInputChange("title", e.target.value)}
                        required
                        className="bg-gray-800 text-gray-100 border-gray-700 placeholder:text-gray-500"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="category" className="text-gray-200">Category *</Label>
                        <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
                          <SelectTrigger className="bg-gray-800 text-gray-100 border-gray-700 placeholder:text-gray-500">
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent className="bg-gray-800 text-gray-100 border-gray-700">
                            <SelectItem value="Hospitality">Hospitality</SelectItem>
                            <SelectItem value="Retail">Retail</SelectItem>
                            <SelectItem value="Education">Education</SelectItem>
                            <SelectItem value="Events">Events</SelectItem>
                            <SelectItem value="Admin">Admin</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="location" className="text-gray-200">Job Location *</Label>
                        <Input
                          id="location"
                          placeholder="e.g., Manchester City Centre"
                          value={formData.location}
                          onChange={(e) => handleInputChange("location", e.target.value)}
                          required
                          className="bg-gray-800 text-gray-100 border-gray-700 placeholder:text-gray-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="hourlyPay" className="text-gray-200">Hourly Pay (£) *</Label>
                        <Input
                          id="hourlyPay"
                          type="number"
                          step="0.01"
                          min="10.42"
                          placeholder="11.50"
                          value={formData.hourlyPay}
                          onChange={(e) => handleInputChange("hourlyPay", e.target.value)}
                          required
                          className="bg-gray-800 text-gray-100 border-gray-700 placeholder:text-gray-500"
                        />
                        <p className="text-xs text-gray-400">Minimum wage: £10.42/hour</p>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="hoursPerWeek" className="text-gray-200">Hours per Week *</Label>
                        <Input
                          id="hoursPerWeek"
                          placeholder="e.g., 10-15 or 20"
                          value={formData.hoursPerWeek}
                          onChange={(e) => handleInputChange("hoursPerWeek", e.target.value)}
                          required
                          className="bg-gray-800 text-gray-100 border-gray-700 placeholder:text-gray-500"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description" className="text-gray-200">Job Description *</Label>
                      <Textarea
                        id="description"
                        placeholder="Describe the role, responsibilities, and what kind of student you're looking for..."
                        className="min-h-32 bg-gray-800 text-gray-100 border-gray-700 placeholder:text-gray-500"
                        value={formData.description}
                        onChange={(e) => handleInputChange("description", e.target.value)}
                        required
                      />
                    </div>

                    <Separator className="bg-gray-700" />

                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-100">Contact Information & Account Creation</h3>
                      <p className="text-sm text-gray-400">
                        This information will be used for your employer account.
                        {user ? " Your account details will be used." : " Create an employer account to manage your jobs."}
                      </p>

                      <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                              <Label htmlFor="firstName" className="text-gray-200">First Name *</Label>
                              <Input
                                  id="firstName"
                                  placeholder="Your first name"
                                  value={formData.firstName}
                                  onChange={(e) => handleInputChange("firstName", e.target.value)}
                                  required
                                  disabled={!!user}
                                  className="bg-gray-800 text-gray-100 border-gray-700 placeholder:text-gray-500 disabled:bg-gray-700 disabled:text-gray-400"
                              />
                          </div>
                          <div className="space-y-2">
                              <Label htmlFor="lastName" className="text-gray-200">Last Name *</Label>
                              <Input
                                  id="lastName"
                                  placeholder="Your last name"
                                  value={formData.lastName}
                                  onChange={(e) => handleInputChange("lastName", e.target.value)}
                                  required
                                  disabled={!!user}
                                  className="bg-gray-800 text-gray-100 border-gray-700 placeholder:text-gray-500 disabled:bg-gray-700 disabled:text-gray-400"
                              />
                          </div>
                      </div>

                      <div className="space-y-2">
                          <Label htmlFor="email" className="text-gray-200">Email *</Label>
                          <Input
                              id="email"
                              type="email"
                              placeholder="you@business.co.uk"
                              value={formData.email}
                              onChange={(e) => handleInputChange("email", e.target.value)}
                              required
                              disabled={!!user}
                              className="bg-gray-800 text-gray-100 border-gray-700 placeholder:text-gray-500 disabled:bg-gray-700 disabled:text-gray-400"
                          />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                              <Label htmlFor="phoneNumber" className="text-gray-200">Phone Number *</Label>
                              <Input
                                  id="phoneNumber"
                                  type="tel"
                                  placeholder="+44 7XXX XXX XXX"
                                  value={formData.phoneNumber}
                                  onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
                                  required
                                  disabled={!!user}
                                  className="bg-gray-800 text-gray-100 border-gray-700 placeholder:text-gray-500 disabled:bg-gray-700 disabled:text-gray-400"
                              />
                          </div>
                          <div className="space-y-2">
                              <Label htmlFor="city" className="text-gray-200">City *</Label>
                              <Input
                                  id="city"
                                  placeholder="e.g., London"
                                  value={formData.city}
                                  onChange={(e) => handleInputChange("city", e.target.value)}
                                  required
                                  disabled={!!user}
                                  className="bg-gray-800 text-gray-100 border-gray-700 placeholder:text-gray-500 disabled:bg-gray-700 disabled:text-gray-400"
                              />
                          </div>
                      </div>

                      <div className="space-y-2">
                          <Label htmlFor="organisationName" className="text-gray-200">Business/Organisation Name *</Label>
                          <Input
                              id="organisationName"
                              placeholder="e.g., My Cafe Ltd."
                              value={formData.organisationName}
                              onChange={(e) => handleInputChange("organisationName", e.target.value)}
                              required
                              disabled={!!user}
                              className="bg-gray-800 text-gray-100 border-gray-700 placeholder:text-gray-500 disabled:bg-gray-700 disabled:text-gray-400"
                          />
                      </div>


                      {/* Password and Confirm Password fields, shown only if not logged in */}
                      {!user && (
                        <>
                          <div className="space-y-2">
                            <Label htmlFor="password" className="text-gray-200">Password *</Label>
                            <Input
                              id="password"
                              type="password"
                              placeholder="Set a password for your employer account"
                              value={formData.password}
                              onChange={(e) => handleInputChange("password", e.target.value)}
                              required
                              className="bg-gray-800 text-gray-100 border-gray-700 placeholder:text-gray-500"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="confirmPassword" className="text-gray-200">Confirm Password *</Label>
                            <Input
                              id="confirmPassword"
                              type="password"
                              placeholder="Re-enter your password"
                              value={formData.confirmPassword}
                              onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                              required
                              className="bg-gray-800 text-gray-100 border-gray-700 placeholder:text-gray-500"
                            />
                          </div>
                          {/* ADDED: Terms and Conditions Checkbox for non-logged-in users */}
                          <div className="flex items-center space-x-2 mt-4">
                            <Checkbox
                              id="postJobTerms"
                              checked={formData.agreeToTerms}
                              onCheckedChange={(checked) => handleInputChange("agreeToTerms", checked as boolean)}
                              className="border-gray-500 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white"
                            />
                            <label htmlFor="postJobTerms" className="text-sm text-gray-300">
                              I agree to the{" "}
                              <Link href="/terms" className="text-blue-400 hover:underline" target="_blank" rel="noopener noreferrer">
                                Terms & Conditions
                              </Link>{" "}
                              and{" "}
                              <Link href="/privacy" className="text-blue-400 hover:underline" target="_blank" rel="noopener noreferrer">
                                Privacy Policy
                              </Link>
                            </label>
                          </div>
                        </>
                      )}

                    </div>

                    <Separator className="bg-gray-700" />

                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-100">Visibility Options</h3>

                      <div className="flex items-start space-x-3">
                        <Checkbox
                          id="sponsored"
                          checked={formData.sponsored}
                          onCheckedChange={(checked) => handleInputChange("sponsored", checked as boolean)}
                          className="border-gray-500 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white"
                        />
                        <div className="space-y-1">
                          <label htmlFor="sponsored" className="text-sm font-medium cursor-pointer text-gray-200">
                            Make this a Sponsored Job (+£4)
                            <Badge variant="secondary" className="ml-2 bg-yellow-900/50 text-yellow-300 border border-yellow-700">
                              Recommended
                            </Badge>
                          </label>
                          <p className="text-sm text-gray-400">
                            Sponsored jobs appear at the top of search results and get 3x more views
                          </p>
                        </div>
                      </div>
                    </div>

                    {error && (
                      <p className="text-red-400 text-sm text-center">{error}</p>
                    )}

                    <Button
                      type="submit"
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                      disabled={isLoading || !formData.title || !formData.category || (!!user && user.user_type === 'student') || (!user && !formData.agreeToTerms)}
                      size="lg"
                    >
                      {isLoading ? "Processing..." : `Post Job - £${postingCost}`}
                    </Button>

                    <p className="text-xs text-gray-400 text-center">
                      Secure payment processed by Stripe. You'll receive a receipt via email.
                    </p>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Pricing Sidebar */}
            <div className="lg:col-span-1">
              <Card className="sticky top-[100px] bg-gray-900 border-2 border-blue-700 text-gray-100">
                <CardHeader>
                  <CardTitle className="text-gray-100">Pricing Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="max-h-[200px] overflow-y-auto pr-2">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center text-gray-200">
                        <span>Basic Job Post</span>
                        <span>£1.00</span>
                      </div>

                      {formData.sponsored && (
                        <div className="flex justify-between items-center text-yellow-400">
                          <span>Sponsored Upgrade</span>
                          <span>£4.00</span>
                        </div>
                      )}

                      <Separator className="bg-gray-700" />

                      <div className="flex justify-between items-center font-semibold text-lg text-gray-100">
                        <span>Total</span>
                        <span>£{postingCost}.00</span>
                      </div>
                    </div>

                    <div className="space-y-3 text-sm text-gray-400 mt-4">
                      {formData.sponsored && (
                        <>
                          <div className="text-yellow-400">⭐ Top of search results</div>
                          <div className="text-yellow-400">⭐ 3x more visibility</div>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="mt-4 bg-gray-900 border-2 border-purple-700 text-gray-100">
                <CardHeader>
                  <CardTitle className="text-lg text-gray-100">Why Post on StudentJobs UK?</CardTitle>
                </CardHeader>
                <CardContent className="text-sm space-y-2 text-gray-300">
                  <div>• Access to verified UK students</div>
                  <div>• Students actively seeking part-time work</div>
                  <div>• Flexible workers who understand study schedules</div>
                  <div>• Direct contact with applicants</div>
                  <div>• GDPR compliant and secure</div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Footer */}
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
    </div>
  )
}

export default function PostJobPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mx-auto"></div>
        <p className="mt-2 text-gray-300">Loading...</p>
      </div>
    </div>}>
      <PostJobContent />
    </Suspense>
  )
}