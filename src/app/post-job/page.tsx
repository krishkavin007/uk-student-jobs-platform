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
import { ContactModal } from "@/components/ui/contact-modal"; // <--- ADD THIS IMPORT HERE

function PostJobContent() {
  const searchParams = useSearchParams()
  const [formData, setFormData] = useState({
    title: "",
    category: "",
    location: "",
    hourlyPay: "",
    hoursPerWeek: "",
    description: "",
    contactName: "",
    contactPhone: "",
    contactEmail: "",
    externalUrl: "",
    sponsored: false,
  })
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    // --- MODIFIED LINE START HERE ---
    if (searchParams?.get('sponsored') === 'true') { // Added '?' for optional chaining
    // --- MODIFIED LINE END HERE ---
      setFormData(prev => ({ ...prev, sponsored: true }))
    }
  }, [searchParams])

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulate job posting and payment process
    setTimeout(() => {
      // Create employer account after successful payment
      const employerAccount = {
        type: 'employer',
        email: formData.contactEmail,
        businessName: formData.contactName + "'s Business",
        contactName: formData.contactName,
        contactPhone: formData.contactPhone,
        createdAt: new Date().toISOString(),
        firstJobPost: {
          title: formData.title,
          sponsored: formData.sponsored,
          amount: postingCost,
          location: formData.location
        }
      }

      console.log("Employer account created:", employerAccount)
      console.log("Job posting:", formData)

      setIsLoading(false)
      alert(`Payment successful! Employer account created for ${formData.contactEmail}. Job posted successfully!`)

      // Redirect to account page
      window.location.href = '/my-account'
    }, 2000)
  }

  const postingCost = formData.sponsored ? 5 : 1

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/">
              <Logo />
            </Link>
            <nav className="flex items-center gap-4">
              <Link href="/my-account" className="text-sm font-medium hover:underline">
                My Account
              </Link>
              <Link href="/login" className="text-sm font-medium hover:underline">
                Sign Out
              </Link>
            </nav>
          </div>
        </div>
      </header>

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
                      <Label htmlFor="location">Location *</Label>
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
                    <h3 className="text-lg font-semibold">Contact Information</h3>
                    <p className="text-sm text-gray-600">
                      Students will pay £1 to reveal your contact details
                    </p>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="contactName">Contact Name *</Label>
                        <Input
                          id="contactName"
                          placeholder="Your name"
                          value={formData.contactName}
                          onChange={(e) => handleInputChange("contactName", e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="contactPhone">Phone Number *</Label>
                        <Input
                          id="contactPhone"
                          type="tel"
                          placeholder="+44 7XXX XXX XXX"
                          value={formData.contactPhone}
                          onChange={(e) => handleInputChange("contactPhone", e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="contactEmail">Contact Email *</Label>
                      <Input
                        id="contactEmail"
                        type="email"
                        placeholder="you@business.co.uk"
                        value={formData.contactEmail}
                        onChange={(e) => handleInputChange("contactEmail", e.target.value)}
                        required
                      />
                    </div>
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

                <Button
                  onClick={handleSubmit}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  disabled={isLoading || !formData.title || !formData.category}
                  size="lg"
                >
                  {isLoading ? "Processing..." : `Post Job - £${postingCost}`}
                </Button>

                <p className="text-xs text-gray-500 text-center">
                  Secure payment processed by Stripe. You'll receive a receipt via email.
                </p>
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
                {/* ADD THE CONTACT MODAL HERE */}
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