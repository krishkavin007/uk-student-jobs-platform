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
// These keys must match what your server.js is expecting to destructure directly
interface EmployerRegistrationPayload {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  organisationName: string; // CHANGED: This key now explicitly matches the backend's 'organisationName'
  user_type: 'employer';
  password: string;
  city?: string;
}


function PostJobContent() {
  const searchParams = useSearchParams()
  const { user, isLoading: isAuthLoading, logout } = useAuth();

  // MODIFIED: Updated formData state with 'organisationName' instead of 'businessName'
  const [formData, setFormData] = useState({
    title: "",
    category: "",
    location: "",
    hourlyPay: "",
    hoursPerWeek: "",
    description: "",
    // Employer Contact/Account Info
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    city: "",
    organisationName: "", // CHANGED: This state field is now 'organisationName'

    password: "",
    confirmPassword: "",
    externalUrl: "",
    sponsored: false,
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null);

  // Redirect logic for logged-in students
  useEffect(() => {
    if (!isAuthLoading && user && user.user_type === 'student') {
      window.location.href = '/browse-jobs';
    }
  }, [user, isAuthLoading]);

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
        organisationName: user.organisation_name || "", // CHANGED: Pre-fill from user.organisation_name
      }));
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
    e.preventDefault()
    setIsLoading(true)
    setError(null);

    // Frontend validation for password fields if displayed (non-logged-in flow)
    if (!user && !isAuthLoading) {
      if (!formData.password) {
        setError("Password is required to create an account.");
        setIsLoading(false);
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        setError("Passwords do not match.");
        setIsLoading(false);
        return;
      }
      if (formData.password.length < 6) {
        setError("Password must be at least 6 characters long.");
        setIsLoading(false);
        return;
      }
    }

    try {
      // Prepare data for the API request for the Job Posting
      const jobPayload: JobPayload = {
        job_title: formData.title,
        job_category: formData.category,
        job_location: formData.location,
        hourly_pay: parseFloat(formData.hourlyPay),
        hours_per_week: formData.hoursPerWeek,
        job_description: formData.description,
        is_sponsored: formData.sponsored,
        contact_name: user ? `${user.user_first_name || ''} ${user.user_last_name || ''}`.trim() : `${formData.firstName} ${formData.lastName}`.trim(),
        contact_phone: user ? (user.contact_phone_number || '') : formData.phoneNumber,
        contact_email: user ? (user.user_email || '') : formData.email,
      };

      // MODIFIED: Payload for new employer account creation (if not logged in)
      // These keys now directly match what the backend's `employer_registration_data` expects to destructure.
      const employerRegistrationDataForBackend: EmployerRegistrationPayload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        city: formData.city,
        organisationName: formData.organisationName, // CHANGED: Sending 'organisationName' to backend
        user_type: 'employer',
        password: formData.password,
      };

      // Combine payloads for the single API call, the backend will decide what to use
      const finalPayload = {
        ...jobPayload,
        ...(!user && !isAuthLoading ? { employer_registration_data: employerRegistrationDataForBackend } : {})
      };


      const response = await fetch('/api/job', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(finalPayload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to post job.');
      }

      const responseData = await response.json();
      console.log("Job posted successfully:", responseData);

      alert(`Job posted successfully!`);

      // Redirect to account page or job list
      window.location.href = '/my-account'; // Or '/browse-jobs'

    } catch (err: unknown) {
      console.error("Error posting job:", err instanceof Error ? err.message : "An unknown error occurred.");
      setError(err instanceof Error ? err.message : "An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  const postingCost = formData.sponsored ? 5 : 1

  // Render loading spinner if authentication is still loading
  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Redirect for logged-in students
  if (user && user.user_type === 'student') {
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <p className="text-lg text-gray-700">Redirecting to job listings for students...</p>
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
     <Header
        key={user ? user.user_id || 'employer-logged-in' : 'logged-out'}
        user={user}
        isLoading={isAuthLoading}
        logout={logout}
      />
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Post a Part-Time Job</h1>
          <p className="text-gray-600">Connect with talented students in your area</p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Job Details</CardTitle>
                <CardDescription>
                  Fill in the details about your part-time position
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="title">Job Title *</Label>
                    <Input
                      id="title"
                      placeholder="e.g., Barista - Weekend Shifts"
                      value={formData.title}
                      onChange={(e) => handleInputChange("title", e.target.value)}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="category">Category *</Label>
                      <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
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
                      <Label htmlFor="location">Job Location *</Label>
                      <Input
                        id="location"
                        placeholder="e.g., Manchester City Centre"
                        value={formData.location}
                        onChange={(e) => handleInputChange("location", e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="hourlyPay">Hourly Pay (£) *</Label>
                      <Input
                        id="hourlyPay"
                        type="number"
                        step="0.01"
                        min="10.42"
                        placeholder="11.50"
                        value={formData.hourlyPay}
                        onChange={(e) => handleInputChange("hourlyPay", e.target.value)}
                        required
                      />
                      <p className="text-xs text-gray-500">Minimum wage: £10.42/hour</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="hoursPerWeek">Hours per Week *</Label>
                      <Input
                        id="hoursPerWeek"
                        placeholder="e.g., 10-15 or 20"
                        value={formData.hoursPerWeek}
                        onChange={(e) => handleInputChange("hoursPerWeek", e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Job Description *</Label>
                    <Textarea
                      id="description"
                      placeholder="Describe the role, responsibilities, and what kind of student you're looking for..."
                      className="min-h-32"
                      value={formData.description}
                      onChange={(e) => handleInputChange("description", e.target.value)}
                      required
                    />
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Contact Information & Account Creation</h3>
                    <p className="text-sm text-gray-600">
                      Students will pay £1 to reveal your contact details.
                      {user ? " Your account details will be used." : " Create an employer account to manage your jobs."}
                    </p>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="firstName">First Name *</Label>
                            <Input
                                id="firstName"
                                placeholder="Your first name"
                                value={formData.firstName}
                                onChange={(e) => handleInputChange("firstName", e.target.value)}
                                required
                                disabled={!!user}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="lastName">Last Name *</Label>
                            <Input
                                id="lastName"
                                placeholder="Your last name"
                                value={formData.lastName}
                                onChange={(e) => handleInputChange("lastName", e.target.value)}
                                required
                                disabled={!!user}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email">Email *</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="you@business.co.uk"
                            value={formData.email}
                            onChange={(e) => handleInputChange("email", e.target.value)}
                            required
                            disabled={!!user}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="phoneNumber">Phone Number *</Label>
                            <Input
                                id="phoneNumber"
                                type="tel"
                                placeholder="+44 7XXX XXX XXX"
                                value={formData.phoneNumber}
                                onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
                                required
                                disabled={!!user}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="city">City *</Label>
                            <Input
                                id="city"
                                placeholder="e.g., London"
                                value={formData.city}
                                onChange={(e) => handleInputChange("city", e.target.value)}
                                required
                                disabled={!!user}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        {/* CHANGED: Input field uses 'organisationName' */}
                        <Label htmlFor="organisationName">Business/Organisation Name *</Label>
                        <Input
                            id="organisationName" // CHANGED: id now matches 'organisationName'
                            placeholder="e.g., My Cafe Ltd."
                            value={formData.organisationName} // CHANGED: value uses formData.organisationName
                            onChange={(e) => handleInputChange("organisationName", e.target.value)} // CHANGED: onChange uses "organisationName"
                            required
                            disabled={!!user}
                        />
                    </div>


                    {/* Password and Confirm Password fields, shown only if not logged in */}
                    {!user && (
                      <>
                        <div className="space-y-2">
                          <Label htmlFor="password">Password *</Label>
                          <Input
                            id="password"
                            type="password"
                            placeholder="Set a password for your employer account"
                            value={formData.password}
                            onChange={(e) => handleInputChange("password", e.target.value)}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="confirmPassword">Confirm Password *</Label>
                          <Input
                            id="confirmPassword"
                            type="password"
                            placeholder="Re-enter your password"
                            value={formData.confirmPassword}
                            onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                            required
                          />
                        </div>
                      </>
                    )}

                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Visibility Options</h3>

                    <div className="flex items-start space-x-3">
                      <Checkbox
                        id="sponsored"
                        checked={formData.sponsored}
                        onCheckedChange={(checked) => handleInputChange("sponsored", checked as boolean)}
                      />
                      <div className="space-y-1">
                        <label htmlFor="sponsored" className="text-sm font-medium cursor-pointer">
                          Make this a Sponsored Job (+£4)
                          <Badge variant="secondary" className="ml-2 bg-yellow-100 text-yellow-800">
                            Recommended
                          </Badge>
                        </label>
                        <p className="text-sm text-gray-600">
                          Sponsored jobs appear at the top of search results and get 3x more views
                        </p>
                      </div>
                    </div>
                  </div>

                  {error && (
                    <p className="text-red-500 text-sm text-center">{error}</p>
                  )}

                  <Button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    disabled={isLoading || !formData.title || !formData.category || (!!user && user.user_type === 'student')}
                    size="lg"
                  >
                    {isLoading ? "Processing..." : `Post Job - £${postingCost}`}
                  </Button>

                  <p className="text-xs text-gray-500 text-center">
                    Secure payment processed by Stripe. You'll receive a receipt via email.
                  </p>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Pricing Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Pricing Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span>Basic Job Post</span>
                    <span>£1.00</span>
                  </div>

                  {formData.sponsored && (
                    <div className="flex justify-between items-center text-yellow-700">
                      <span>Sponsored Upgrade</span>
                      <span>£4.00</span>
                    </div>
                  )}

                  <Separator />

                  <div className="flex justify-between items-center font-semibold text-lg">
                    <span>Total</span>
                    <span>£{postingCost}.00</span>
                  </div>
                </div>

                <div className="space-y-3 text-sm text-gray-600">
                  <div>✓ Visible for 30 days</div>
                  <div>✓ Student applications via phone</div>
                  <div>✓ Edit or delete anytime</div>
                  {formData.sponsored && (
                    <>
                      <div className="text-yellow-700">⭐ Top of search results</div>
                      <div className="text-yellow-700">⭐ 3x more visibility</div>
                    </>
                  )}
                </div>

              </CardContent>
            </Card>

            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="text-lg">Why Post on StudentJobs UK?</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2">
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
                <Link href="/privacy" className="text-gray-300 hover:text-white">Privacy Policy</Link>
                <Link href="/terms" className="text-gray-300 hover:text-white">Terms & Conditions</Link>
                <Link href="/refund-policy" className="text-gray-300 hover:text-white">Refund Policy</Link>
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
  )
}

export default function PostJobPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-2 text-gray-600">Loading...</p>
      </div>
    </div>}>
      <PostJobContent />
    </Suspense>
  )
}