// src/app/about/page.tsx
"use client"; // This directive is crucial for using hooks like useAuth

import { useAuth } from "@/app/context/AuthContext"; // Import the useAuth hook
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Header } from "@/components/ui/header" // Import your global Header component
// The Logo component is not directly used in AboutPage, only inside Header, so it's not needed here.
// import { Logo } from "@/components/ui/logo" // Import the Logo component as it's used in Header
import { ContactModal } from "@/components/ui/contact-modal" // NEW: Import ContactModal

export default function AboutPage() {
  const { user, isLoading, logout } = useAuth(); // Use the useAuth hook to get user, loading state, and logout function

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Replaced the local header with the global Header component */}
      {/* Pass user, logout, and isLoading to the Header component */}
      <Header user={user} logout={logout} isLoading={isLoading} />

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">About StudentJobs UK</h1>
          <p className="text-xl text-gray-600">Bridging the gap between student ambition and employer opportunity</p>
        </div>

        {/* Mission */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Our Mission</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-lg text-gray-700 leading-relaxed">
              To create a fair, affordable, and efficient platform that connects UK students with
              flexible part-time employment opportunities while respecting their academic commitments
              and legal working restrictions.
            </p>
          </CardContent>
        </Card>

        {/* The Problem We Solve */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">The Problem We Solve</h2>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg text-red-600">For Students</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-gray-700 text-sm">
                  <li>• Expensive job board subscriptions</li>
                  <li>• Jobs that don't respect academic schedules</li>
                  <li>• Complex application processes</li>
                  <li>• Competition with full-time job seekers</li>
                  <li>• Unclear work hour requirements</li>
                  <li>• Lack of student-specific opportunities</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg text-red-600">For Employers</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-gray-700 text-sm">
                  <li>• High recruitment agency fees</li>
                  <li>• Irrelevant applications from non-students</li>
                  <li>• Difficulty finding flexible workers</li>
                  <li>• Unclear student work regulations</li>
                  <li>• Time-consuming filtering processes</li>
                  <li>• Limited access to student talent pools</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Our Solution */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">Our Solution</h2>

          <div className="grid gap-6 md:grid-cols-3">
            <Card>
              <CardHeader className="text-center">
                <CardTitle className="text-lg">Affordable Access</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-600 text-sm">
                  £1 job posts for employers, £1 applications for students.
                  No subscriptions, no hidden fees, no expensive recruitment costs.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="text-center">
                <CardTitle className="text-lg">Student-Focused</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-600 text-sm">
                  Built specifically for UK students with verified accounts,
                  work hour compliance, and academic-friendly scheduling.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="text-center">
                <CardTitle className="text-lg">Quality Connections</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-600 text-sm">
                  Small application fees ensure serious candidates and legitimate jobs,
                  creating better matches for everyone.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Our Values */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl">Our Values</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <h3 className="text-lg font-semibold mb-3 text-blue-600">Education First</h3>
                <p className="text-gray-700 text-sm">
                  We believe students' academic success should always come first. Our platform is designed
                  to support, not interfere with, educational goals.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3 text-blue-600">Fair & Transparent</h3>
                <p className="text-gray-700 text-sm">
                  Clear pricing, honest communication, and fair treatment for all users. No hidden costs
                  or misleading practices.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3 text-blue-600">Legal Compliance</h3>
                <p className="text-gray-700 text-sm">
                  Full adherence to UK employment law, student visa regulations, and GDPR requirements.
                  We protect both students and employers.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3 text-blue-600">Accessibility</h3>
                <p className="text-gray-700 text-sm">
                  Affordable access for all. We believe financial constraints shouldn't prevent students
                  from finding work or employers from finding talent.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* How We're Different */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">How We're Different</h2>

          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <h3 className="font-semibold text-green-800 mb-3">StudentJobs UK</h3>
                <ul className="space-y-2 text-green-700 text-sm">
                  <li>• £1-5 per job post, £1 per application</li>
                  <li>• Verified student-only platform</li>
                  <li>• Work hour compliance built-in</li>
                  <li>• Academic calendar awareness</li>
                  <li>• Direct employer-student contact</li>
                  <li>• UK-specific regulations expertise</li>
                </ul>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                <h3 className="font-semibold text-gray-800 mb-3">Traditional Job Boards</h3>
                <ul className="space-y-2 text-gray-600 text-sm">
                  <li>• £100s in monthly subscriptions</li>
                  <li>• Mixed audience (not student-focused)</li>
                  <li>• No work hour considerations</li>
                  <li>• Generic, one-size-fits-all approach</li>
                  <li>• Multiple intermediaries</li>
                  <li>• Complex application processes</li>
                  <li>• Unclear work hour requirements</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Platform Stats */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">Platform Impact</h2>

          <div className="grid gap-6 md:grid-cols-4 text-center">
            <Card>
              <CardContent className="pt-6">
                <div className="text-3xl font-bold text-blue-600 mb-2">2,847</div>
                <p className="text-gray-600 text-sm">Active Students</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-3xl font-bold text-blue-600 mb-2">1,000+</div>
                <p className="text-gray-600 text-sm">Employers</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-3xl font-bold text-blue-600 mb-2">156</div>
                <p className="text-gray-600 text-sm">Active Jobs</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-3xl font-bold text-blue-600 mb-2">£1.2K</div>
                <p className="text-gray-600 text-sm">Total Revenue</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Future Vision */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl">Our Vision for the Future</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-gray-700">
                We envision a UK where every student can easily find flexible work that enhances their
                education rather than detracting from it. Where employers see students as valuable
                contributors, not just temporary help.
              </p>

              <p className="text-gray-700">
                Our platform will continue evolving to serve this community better, potentially expanding to include:
              </p>

              <ul className="list-disc pl-6 space-y-1 text-gray-700">
                <li>Graduate placement programs</li>
                <li>Skill development partnerships with universities</li>
                <li>Internship and placement year opportunities</li>
                <li>Career mentorship programs</li>
                <li>Integration with university career services</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Team & Contact */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">Get in Touch</h2>

          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-gray-700 mb-6">
                Have questions, feedback, or want to partner with us? We'd love to hear from you.
              </p>

              <div className="space-y-2 text-sm text-gray-600">
                <p><strong>General Inquiries:</strong> hello@studentjobs.uk</p>
                <p><strong>Support:</strong> support@studentjobs.uk</p>
                <p><strong>Partnerships:</strong> partnerships@studentjobs.uk</p>
                <p><strong>Legal/Privacy:</strong> legal@studentjobs.uk</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* CTA */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Join Our Community</h2>
          <p className="text-gray-600 mb-6">
            Whether you're a student looking for flexible work or an employer seeking motivated talent,
            we're here to help you connect.
          </p>
          <div className="flex gap-4 justify-center">
            <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700">
              <Link href="/signup">Get Started</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/how-it-works">Learn More</Link>
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
                {/* NEW: Contact Us Modal Button */}
                <ContactModal>
                  <button className="text-gray-300 hover:text-white text-sm text-left w-full pl-0">
                    Contact Us
                  </button>
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