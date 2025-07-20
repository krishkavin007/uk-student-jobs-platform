// src/app/refund-policy/page.tsx
"use client";

import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Header } from "@/components/ui/header"
import { ContactModal } from "@/components/ui/contact-modal";
import { useAuth } from '@/app/context/AuthContext';

export default function RefundPolicyPage() {
  const { user, isLoading, logout } = useAuth();

  const pricingHref = user?.user_type === "student" ? "/pricing#student" : "/pricing#employer";

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={user} isLoading={isLoading} logout={logout} pricingHref={pricingHref} />

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">Refund Policy</CardTitle>
            <p className="text-gray-600">Last updated: January 9, 2025</p>
          </CardHeader>
          <CardContent className="prose max-w-none space-y-6">
            <section>
              <h2 className="text-2xl font-semibold mb-3">1. Overview</h2>
              <p className="text-base">
                At StudentJobs UK, we strive to provide excellent service to both students and employers. This Refund Policy
                outlines the circumstances under which refunds may be granted and the process for requesting them.
              </p>
              <p className="text-base">
                We understand that sometimes issues may arise, and we are committed to fair and transparent refund practices
                while maintaining the integrity of our platform.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">2. Refund Eligibility</h2>

              <div className="grid md:grid-cols-2 gap-6">
                <Card className="border-blue-200">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Badge className="bg-blue-100 text-blue-800">£1</Badge>
                      Student Contact Reveals
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <h4 className="font-semibold text-green-600 text-base">✓ Refund Available:</h4>
                      <ul className="text-base space-y-1 mt-1">
                        <li>Job posting was fraudulent or misleading</li>
                        <li>Contact information provided was incorrect</li>
                        <li>Job was already filled but still listed</li>
                        <li>Technical error prevented access to contact info</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-red-600 text-base">✗ No Refund:</h4>
                      <ul className="text-base space-y-1 mt-1">
                        <li>You changed your mind after revealing contact</li>
                        <li>Employer didn't respond to your application</li>
                        <li>You were not selected for the position</li>
                        <li>You found another job in the meantime</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-green-200">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Badge className="bg-green-100 text-green-800">£1 - £5</Badge>
                      Employer Job Posts
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <h4 className="font-semibold text-green-600 text-base">✓ Refund Available:</h4>
                      <ul className="text-base space-y-1 mt-1">
                        <li>Technical error prevented job from being published</li>
                        <li>Platform error affected job visibility</li>
                        <li>Billing error or duplicate charges</li>
                        <li>Job was removed due to our error</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-red-600 text-base">✗ No Refund:</h4>
                      <ul className="text-base space-y-1 mt-1">
                        <li>Position was filled quickly</li>
                        <li>Not enough suitable applicants</li>
                        <li>Job was removed for policy violations</li>
                        <li>Change of business circumstances</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">3. Refund Process</h2>

              <h3 className="text-xl font-medium mb-2">How to Request a Refund</h3>
              <ol className="list-decimal pl-6 space-y-2 text-base">
                <li>
                  Contact our support team at support@studentjobs.uk or through your account dashboard
                </li>
                <li>
                  Provide the following information:
                  <ul className="list-disc pl-6 mt-1 space-y-1 text-base">
                    <li>Your account email address</li>
                    <li>Transaction ID or receipt number</li>
                    <li>Detailed reason for the refund request</li>
                    <li>Any supporting evidence (screenshots, emails, etc.)</li>
                  </ul>
                </li>
                <li>
                  Wait for review: Our team will review your request within 2-3 business days
                </li>
                <li>
                  Receive decision: We'll email you with our decision and next steps
                </li>
              </ol>

              <h3 className="text-xl font-medium mb-2 mt-4">Processing Times</h3>
              <div className="bg-blue-50 p-4 rounded-lg">
                <ul className="space-y-2 text-base">
                  <li>Review Time: 2-3 business days</li>
                  <li>Card Refunds: 5-10 business days</li>
                  <li>PayPal Refunds: 3-5 business days</li>
                  <li>Bank Transfer: 3-5 business days</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">4. Refund Methods</h2>
              <p className="text-base">Refunds will be processed using the same payment method used for the original transaction:</p>

              <div className="grid md:grid-cols-3 gap-4 mt-4">
                <div className="text-center p-4 border rounded-lg">
                  <h4 className="font-semibold text-base">Credit/Debit Cards</h4>
                  <p className="text-base text-gray-600 mt-1">Refunded to original card</p>
                  <p className="text-sm text-gray-500 mt-2">5-10 business days</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <h4 className="font-semibold text-base">PayPal</h4>
                  <p className="text-base text-gray-600 mt-1">Refunded to PayPal account</p>
                  <p className="text-sm text-gray-500 mt-2">3-5 business days</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <h4 className="font-semibold text-base">Alternative Methods</h4>
                  <p className="text-base text-gray-600 mt-1">Bank transfer if original method unavailable</p>
                  <p className="text-sm text-gray-500 mt-2">3-5 business days</p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">5. Special Circumstances</h2>

              <h3 className="text-xl font-medium mb-2">Platform Issues</h3>
              <p className="text-base">
                If our platform experiences technical difficulties that prevent you from using paid services,
                we will provide refunds or credits for affected transactions.
              </p>

              <h3 className="text-xl font-medium mb-2 mt-4">Fraudulent Activity</h3>
              <p className="text-base">
                If you encounter fraudulent job postings or users, report them immediately. We will investigate
                and provide refunds for verified cases of fraud.
              </p>

              <h3 className="text-xl font-medium mb-2 mt-4">Policy Violations</h3>
              <p className="text-base">
                Jobs removed for violating our Terms of Service or content policies are not eligible for refunds.
                We recommend reviewing our guidelines before posting.
              </p>

              <h3 className="text-xl font-medium mb-2 mt-4">Account Suspension</h3>
              <p className="text-base">
                If your account is suspended for violations, refunds will be considered on a case-by-case basis
                for unused services purchased before the violation occurred.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">6. Dispute Resolution</h2>

              <h3 className="text-xl font-medium mb-2">Internal Process</h3>
              <ol className="list-decimal pl-6 space-y-1 text-base">
                <li>Initial support team review</li>
                <li>Escalation to management if needed</li>
                <li>Final decision within 7 business days</li>
              </ol>

              <h3 className="text-xl font-medium mb-2 mt-4">External Options</h3>
              <p className="text-base">
                If you're not satisfied with our decision, you may:
              </p>
              <ul className="list-disc pl-6 space-y-1 text-base">
                <li>Contact your payment provider for chargeback options</li>
                <li>Seek mediation through relevant consumer protection agencies</li>
                <li>Pursue legal remedies under UK consumer protection laws</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">7. Prevention Tips</h2>

              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">For Students</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="text-base space-y-1">
                      <li>Read job descriptions carefully before paying</li>
                      <li>Check employer profiles and ratings</li>
                      <li>Report suspicious job postings</li>
                      <li>Contact support if something seems wrong</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">For Employers</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="text-base space-y-1">
                      <li>Review our posting guidelines before publishing</li>
                      <li>Ensure job information is accurate and current</li>
                      <li>Update listings when positions are filled</li>
                      <li>Provide clear contact information</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">8. Contact Information</h2>
              <p className="text-base">For refund requests or questions about this policy, please contact us:</p>

              <div className="bg-gray-50 p-4 rounded-lg mt-4 text-base">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-base">Refund Requests</h4>
                    <p className="text-base">Email: refunds@studentjobs.uk</p>
                    <p className="text-base">Response time: 2-3 business days</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-base">General Support</h4>
                    <p className="text-base">Email: support@studentjobs.uk</p>
                    <p className="text-base">Through your account dashboard</p>
                  </div>
                </div>
              </div>

              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h4 className="font-semibold text-yellow-800 text-base">Important Note</h4>
                <p className="text-base text-yellow-700 mt-1">
                  This refund policy does not affect your statutory rights as a consumer under UK law.
                  You may still have rights under the Consumer Rights Act 2015 and other applicable legislation.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">9. Policy Updates</h2>
              <p className="text-base">
                We may update this Refund Policy from time to time. Changes will be communicated through email
                and platform notifications. The "Last updated" date indicates when this policy was last revised.
              </p>
              <p className="text-base">
                Continued use of our platform after policy updates constitutes acceptance of the revised terms.
              </p>
            </section>
          </CardContent>
        </Card>
      </div>

      {/* Footer */}
      <footer className="w-full py-6 bg-gray-900 text-white mt-16">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="grid gap-8 lg:grid-cols-4">
            <div>
              <h3 className="font-bold text-lg mb-4">StudentJobs UK</h3>
              <p className="text-gray-300 text-base">
                Connecting UK students with flexible part-time opportunities.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-3">For Students</h4>
              <nav className="flex flex-col space-y-2 text-base">
                <Link href="/browse-jobs" className="text-gray-300 hover:text-white">Browse Jobs</Link>
                <Link href="/how-it-works" className="text-gray-300 hover:text-white">How It Works</Link>
                <Link href="/student-guide" className="text-gray-300 hover:text-white">Student Guide</Link>
              </nav>
            </div>
            <div>
              <h4 className="font-semibold mb-3">For Employers</h4>
              <nav className="flex flex-col space-y-2 text-base">
                <Link href="/post-job" className="text-gray-300 hover:text-white">Post a Job</Link>
                <Link
                  href={pricingHref}
                  className="text-gray-300 hover:text-white"
                >
                  Pricing
                </Link>
                <Link href="/employer-guide" className="text-gray-300 hover:text-white">Employer Guide</Link>
              </nav>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Legal</h4>
              <nav className="flex flex-col space-y-2 text-base">
                <Link href="/privacy" className="text-gray-300 hover:text-white">Privacy Policy</Link>
                <Link href="/terms" className="text-gray-300 hover:text-white">Terms & Conditions</Link>
                <Link href="/refund-policy" className="text-gray-300 hover:text-white">Refund Policy</Link>
                {/* Removed asChild prop as it seems to be causing issues with ContactModal's internal rendering */}
                <ContactModal>
                    <button className="text-gray-300 hover:text-white text-base text-left w-full pl-0">Contact Us</button>
                </ContactModal>
              </nav>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-800 text-center text-base text-gray-300">
            © 2025 StudentJobs UK. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}