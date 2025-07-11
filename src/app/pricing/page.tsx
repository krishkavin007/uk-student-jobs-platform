import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Header } from "@/components/ui/header"
import { ContactModal } from "@/components/ui/contact-modal" // Added ContactModal import here!

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Simple, Transparent Pricing</h1>
          <p className="text-xl text-gray-600">No hidden fees, no monthly subscriptions. Pay only when you post jobs.</p>
        </div>

        {/* Main Pricing Cards */}
        <div className="grid gap-8 md:grid-cols-2 mb-16 max-w-4xl mx-auto">
          {/* Basic Job Post */}
          <Card className="relative">
            <CardHeader className="text-center pb-8">
              <CardTitle className="text-2xl mb-2">Basic Job Post</CardTitle>
              <div className="text-4xl font-bold text-gray-900 mb-2">£1</div>
              <p className="text-gray-600">Per job posting</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">✓</span>
                  </div>
                  <span className="text-gray-700">30-day job listing</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">✓</span>
                  </div>
                  <span className="text-gray-700">Access to verified students</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">✓</span>
                  </div>
                  <span className="text-gray-700">Standard search visibility</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">✓</span>
                  </div>
                  <span className="text-gray-700">Direct student contact</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">✓</span>
                  </div>
                  <span className="text-gray-700">Edit/delete anytime</span>
                </div>
              </div>

              <div className="pt-6">
                <Button asChild className="w-full bg-gray-900 hover:bg-gray-800">
                  <Link href="/post-job">Post Basic Job</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Sponsored Job Post */}
          <Card className="relative border-blue-200 bg-blue-50/50">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <Badge className="bg-blue-600 text-white px-4 py-1">Most Popular</Badge>
            </div>

            <CardHeader className="text-center pb-8">
              <CardTitle className="text-2xl mb-2">Sponsored Job Post</CardTitle>
              <div className="text-4xl font-bold text-blue-600 mb-2">£5</div>
              <p className="text-gray-600">Per job posting</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">✓</span>
                  </div>
                  <span className="text-gray-700">Everything in Basic, plus:</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">⭐</span>
                  </div>
                  <span className="text-gray-700"><strong>Top of search results</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">⭐</span>
                  </div>
                  <span className="text-gray-700"><strong>3x more visibility</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">⭐</span>
                  </div>
                  <span className="text-gray-700"><strong>Highlighted with badge</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">⭐</span>
                  </div>
                  <span className="text-gray-700"><strong>Priority customer support</strong></span>
                </div>
              </div>

              <div className="pt-6">
                <Button asChild className="w-full bg-blue-600 hover:bg-blue-700">
                  <Link href="/post-job?sponsored=true">Post Sponsored Job</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Additional Costs */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">Additional Information</h2>

          <div className="grid gap-6 md:grid-cols-3 max-w-4xl mx-auto">
            <Card>
              <CardHeader className="text-center">
                <CardTitle className="text-lg">For Students</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <div className="text-2xl font-bold text-green-600 mb-2">£1</div>
                <p className="text-gray-600">Per job application</p>
                <p className="text-sm text-gray-500 mt-2">
                  Students pay £1 to reveal your contact details and apply
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="text-center">
                <CardTitle className="text-lg">Transaction Fees</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <div className="text-2xl font-bold text-gray-900 mb-2">£0</div>
                <p className="text-gray-600">No additional fees</p>
                <p className="text-sm text-gray-500 mt-2">
                  Standard payment processing included in job posting price
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="text-center">
                <CardTitle className="text-lg">Refunds</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <div className="text-2xl font-bold text-blue-600 mb-2">Available</div>
                <p className="text-gray-600">When applicable</p>
                <p className="text-sm text-gray-500 mt-2">
                  See our refund policy for eligible circumstances
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Comparison Table */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">Detailed Comparison</h2>

          <div className="bg-white rounded-lg overflow-hidden border">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left p-4 font-semibold text-gray-900">Feature</th>
                  <th className="text-center p-4 font-semibold text-gray-900">Basic (£1)</th>
                  <th className="text-center p-4 font-semibold text-blue-600">Sponsored (£5)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr>
                  <td className="p-4">Job listing duration</td>
                  <td className="p-4 text-center">30 days</td>
                  <td className="p-4 text-center">30 days</td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="p-4">Access to student applicants</td>
                  <td className="p-4 text-center">✓</td>
                  <td className="p-4 text-center">✓</td>
                </tr>
                <tr>
                  <td className="p-4">Position in search results</td>
                  <td className="p-4 text-center">Standard order</td>
                  <td className="p-4 text-center"><strong>Top of results</strong></td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="p-4">Visual highlighting</td>
                  <td className="p-4 text-center">None</td>
                  <td className="p-4 text-center"><strong>Blue highlight + badge</strong></td>
                </tr>
                <tr>
                  <td className="p-4">Expected visibility increase</td>
                  <td className="p-4 text-center">Baseline</td>
                  <td className="p-4 text-center"><strong>3x more views</strong></td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="p-4">Customer support priority</td>
                  <td className="p-4 text-center">Standard</td>
                  <td className="p-4 text-center"><strong>Priority support</strong></td>
                </tr>
                <tr>
                  <td className="p-4">Edit/delete job</td>
                  <td className="p-4 text-center">✓</td>
                  <td className="p-4 text-center">✓</td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="p-4">Analytics dashboard</td>
                  <td className="p-4 text-center">Basic</td>
                  <td className="p-4 text-center"><strong>Enhanced metrics</strong></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Why Our Pricing Works */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">Why Our Pricing Model Works</h2>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quality Over Quantity</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-sm">
                  The £1 application fee ensures students are genuinely interested, reducing spam and improving application quality.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Fair for Students</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-sm">
                  Students only pay when they find a job they want to apply for, making it much more affordable than traditional job boards.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Cost-Effective for Employers</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-sm">
                  At £1-5 per posting, you get access to motivated students without expensive recruitment agency fees.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">No Hidden Costs</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-sm">
                  What you see is what you pay. No setup fees, monthly subscriptions, or surprise charges.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Immediate Results</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-sm">
                  Your job goes live immediately after payment, and students can start applying right away.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Guaranteed Reach</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-sm">
                  With thousands of active student users, your job posting will be seen by qualified candidates.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* FAQ */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">Pricing FAQ</h2>

          <div className="max-w-3xl mx-auto space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Do I pay anything if no one applies?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  You only pay the initial posting fee (£1 or £5). There are no additional charges based on applications received.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Can I edit my job after posting?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Yes, you can edit or delete your job at any time through your account dashboard at no extra cost.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">What payment methods do you accept?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  We accept all major credit/debit cards and PayPal. All payments are processed securely through Stripe.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Is there a bulk discount for multiple jobs?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Currently, each job is priced individually. Contact us if you're planning to post 10+ jobs for potential volume discounts.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Ready to Find Your Next Student Employee?</h2>
          <p className="text-gray-600 mb-6">Join hundreds of employers already using StudentJobs UK</p>
          <div className="flex gap-4 justify-center">
            <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700">
              <Link href="/post-job">Post a Job Now</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/employer-guide">Employer Guide</Link>
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
                Connecting UK students with flexible part-time opportunities since 2024.
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
                  <button className="text-gray-300 hover:text-white text-sm text-left w-full pl-0">
                    Contact Us
                  </button>
                </ContactModal>
              </nav>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-800 text-center text-sm text-gray-300">
            © 2024 StudentJobs UK. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}