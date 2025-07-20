// src/app/how-it-works/page.tsx
"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Header } from "@/components/ui/header"
import { ContactModal } from "@/components/ui/contact-modal";
import { useAuth } from '@/app/context/AuthContext';

export default function HowItWorksPage() {
  const { user, isLoading, logout } = useAuth(); // Destructure user, isLoading, and logout from useAuth

  // Determine the correct pricing href based on user type for the Header and Footer
  const pricingHref = user?.user_type === "student" ? "/pricing#student" : "/pricing#employer";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      {/* Pass user, isLoading, logout, AND the dynamically determined pricingHref to the Header component */}
      <Header user={user} isLoading={isLoading} logout={logout} pricingHref={pricingHref} />

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">How It Works</h1>
          <p className="text-xl text-gray-600">Simple steps to find your perfect part-time job</p>
        </div>

        {/* Student Steps */}
        <div className="space-y-8 mb-16">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">For Students</h2>

          <div className="grid gap-8 md:grid-cols-3">
            <Card>
              <CardHeader className="text-center">
                <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                  1
                </div>
                <CardTitle>Sign Up & Verify</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-600">
                  Create your account using your university email address (.ac.uk) and verify your phone number.
                  This ensures you're a genuine student.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="text-center">
                <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                  2
                </div>
                <CardTitle>Browse & Filter Jobs</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-600">
                  Search through hundreds of part-time jobs. Filter by location, category, and work period
                  (term-time vs holidays) to find opportunities that fit your schedule.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="text-center">
                <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                  3
                </div>
                <CardTitle>Apply for £1</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-600">
                  Found a job you like? Pay £1 to reveal the employer's contact details and apply directly.
                  Your payment protects against spam and ensures serious applications.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Key Features */}
        <div className="bg-white rounded-lg p-8 mb-16">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">What Makes Us Different</h2>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                ✓
              </div>
              <div>
                <h3 className="font-semibold mb-2">Student-Focused</h3>
                <p className="text-gray-600 text-sm">
                  All jobs respect student working hour limits: 20 hours during term-time, 40 hours during holidays.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                ✓
              </div>
              <div>
                <h3 className="font-semibold mb-2">Verified Employers</h3>
                <p className="text-gray-600 text-sm">
                  All businesses are verified and jobs are moderated to ensure quality and legitimacy.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                ✓
              </div>
              <div>
                <h3 className="font-semibold mb-2">Affordable Access</h3>
                <p className="text-gray-600 text-sm">
                  Only £1 per application - much cheaper than traditional job boards and recruitment fees.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                ✓
              </div>
              <div>
                <h3 className="font-semibold mb-2">Direct Contact</h3>
                <p className="text-gray-600 text-sm">
                  Speak directly with employers - no middleman, no lengthy application processes.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Work Hour Guidelines */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-8 mb-16">
          <h2 className="text-2xl font-bold text-blue-900 mb-6">Student Work Hour Guidelines</h2>

          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <h3 className="font-semibold text-blue-800 mb-3">During Term-Time</h3>
              <ul className="space-y-2 text-blue-700">
                <li>• Maximum 20 hours per week</li>
                <li>• Perfect for weekend and evening shifts</li>
                <li>• Flexible scheduling around lectures</li>
                <li>• Ideal for ongoing commitments</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-blue-800 mb-3">During University Holidays</h3>
              <ul className="space-y-2 text-blue-700">
                <li>• Up to 40 hours per week (full-time)</li>
                <li>• Great for intensive work periods</li>
                <li>• Higher earning potential</li>
                <li>• Summer jobs and seasonal work</li>
              </ul>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">Frequently Asked Questions</h2>

          <div className="space-y-6">
            <div className="bg-white rounded-lg p-6">
              <h3 className="font-semibold mb-2">Why do I need to pay £1 to apply?</h3>
              <p className="text-gray-600">
                The £1 fee protects both students and employers from spam applications. It ensures only serious
                candidates apply and helps maintain the quality of our platform.
              </p>
            </div>

            <div className="bg-white rounded-lg p-6">
              <h3 className="font-semibold mb-2">Can I get a refund if the job is no longer available?</h3>
              <p className="text-gray-600">
                Yes! If a job posting is fraudulent, the contact information is incorrect, or the position was
                already filled, you can request a full refund.
              </p>
            </div>

            <div className="bg-white rounded-lg p-6">
              <h3 className="font-semibold mb-2">How do I verify my student status?</h3>
              <p className="text-gray-600">
                Simply sign up with your university email address (.ac.uk). We also verify your phone number
                to ensure account security.
              </p>
            </div>

            <div className="bg-white rounded-lg p-6">
              <h3 className="font-semibold mb-2">What if an employer doesn't respond?</h3>
              <p className="text-gray-600">
                While we can't guarantee responses, we encourage employers to reply within 48 hours. If you
                experience consistent issues, please report them to our support team.
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Ready to Start Your Job Search?</h2>
          <p className="text-xl text-gray-600 mb-6">Join thousands of students already finding flexible work through StudentJobs UK</p>
          <div className="flex gap-4 justify-center">
            <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700">
              <Link href="/signup">Sign Up Now</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/browse-jobs">Browse Jobs</Link>
            </Button>
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
                {/* Dynamically set pricing link for employers based on user type in the footer */}
                <Link
                  href={pricingHref} // Use the same pricingHref calculated above
                  className="text-gray-300 hover:text-white"
                >
                  Pricing
                </Link>
                <Link href="/employer-guide" className="text-gray-300 hover:text-white">Employer Guide</Link>
              </nav>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Legal</h4>
              <nav className="flex flex-col space-y-2 text-sm">
                <Link href="/privacy" className="text-gray-300 hover:text-white">Privacy Policy</Link>
                <Link href="/terms" className="text-gray-300 hover:text-white">Terms & Conditions</Link>
                <Link href="/refund-policy" className="text-gray-300 hover:text-white">Refund Policy</Link>
                {/* ContactModal component correctly placed here */}
                {/* Ensure the ContactModal's child is a button with appropriate styles */}
                <ContactModal>
                    <button className="text-gray-300 hover:text-white text-sm text-left w-full pl-0">Contact Us</button>
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