import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Header } from "@/components/ui/header"
import { ContactModal } from "@/components/ui/contact-modal"; // <--- This import is correct and needed!

export default function StudentGuidePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Header />

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Student Guide</h1>
          <p className="text-xl text-gray-600">Everything you need to know about working while studying in the UK</p>
        </div>

        {/* Legal Requirements */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl">Legal Requirements & Work Rights</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-3">UK/EU Students</h3>
              <ul className="space-y-2 text-gray-700">
                <li>• No restrictions on working hours</li>
                <li>• Can work during term-time and holidays</li>
                <li>• Entitled to minimum wage (£10.42/hour for 18+)</li>
                <li>• Need National Insurance number for employment</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3">International Students (Tier 4/Student Visa)</h3>
              <ul className="space-y-2 text-gray-700">
                <li>• Maximum 20 hours per week during term-time</li>
                <li>• Can work full-time (40 hours) during official university holidays</li>
                <li>• Must have "work permitted" stamp in passport or visa</li>
                <li>• <strong>e-Visa Share Code:</strong> Required for employers to verify your right to work</li>
                <li>• Generate your share code at gov.uk/prove-right-to-work</li>
                <li>• Cannot be self-employed or start a business</li>
                <li>• Some restrictions on certain job types (entertainers, professional sports)</li>
              </ul>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <h4 className="font-semibold text-amber-800 mb-2">Important:</h4>
              <p className="text-amber-700 text-sm">
                Always check your specific visa conditions. Working more than permitted hours can affect your visa status and future applications.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Job Search Tips */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl">Job Search Tips</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <h3 className="text-lg font-semibold mb-3">Building Your Profile</h3>
                <ul className="space-y-2 text-gray-700 text-sm">
                  <li>• Use a professional email address</li>
                  <li>• Include your university and course</li>
                  <li>• Mention your availability clearly</li>
                  <li>• Highlight relevant skills and experience</li>
                  <li>• Be honest about your schedule</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">Finding the Right Jobs</h3>
                <ul className="space-y-2 text-gray-700 text-sm">
                  <li>• Filter by location to save commute time</li>
                  <li>• Look for "student-friendly" employers</li>
                  <li>• Consider jobs near your university</li>
                  <li>• Check work hours fit your timetable</li>
                  <li>• Read job descriptions carefully</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Popular Student Jobs */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl">Popular Student Jobs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold mb-2">Hospitality</h3>
                <p className="text-sm text-gray-600 mb-2">Restaurants, cafes, pubs</p>
                <ul className="text-xs text-gray-700 space-y-1">
                  <li>• Flexible evening/weekend shifts</li>
                  <li>• Tips supplement wages</li>
                  <li>• Great for social skills</li>
                </ul>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold mb-2">Retail</h3>
                <p className="text-sm text-gray-600 mb-2">Shops, supermarkets</p>
                <ul className="text-xs text-gray-700 space-y-1">
                  <li>• Weekend and evening availability</li>
                  <li>• Customer service experience</li>
                  <li>• Often hiring during busy periods</li>
                </ul>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold mb-2">Tutoring</h3>
                <p className="text-sm text-gray-600 mb-2">Private or through agencies</p>
                <ul className="text-xs text-gray-700 space-y-1">
                  <li>• Higher hourly rates (£15-25)</li>
                  <li>• Flexible scheduling</li>
                  <li>• Use your academic strengths</li>
                </ul>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold mb-2">Campus Jobs</h3>
                <p className="text-sm text-gray-600 mb-2">University employment</p>
                <ul className="text-xs text-gray-700 space-y-1">
                  <li>• No commute required</li>
                  <li>• Understanding of student needs</li>
                  <li>• Academic support roles</li>
                </ul>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold mb-2">Delivery Work</h3>
                <p className="text-sm text-gray-600 mb-2">Food delivery, couriers</p>
                <ul className="text-xs text-gray-700 space-y-1">
                  <li>• Flexible hours</li>
                  <li>• Exercise while working</li>
                  <li>• Peak time bonuses</li>
                </ul>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold mb-2">Admin Support</h3>
                <p className="text-sm text-gray-600 mb-2">Office assistance</p>
                <ul className="text-xs text-gray-700 space-y-1">
                  <li>• Professional environment</li>
                  <li>• Transferable skills</li>
                  <li>• Often part-time friendly</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Money Management */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl">Money Management & Tax</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-3">Understanding Your Pay</h3>
              <ul className="space-y-2 text-gray-700">
                <li>• <strong>Minimum Wage:</strong> £10.42/hour (18-20), £11.44/hour (21+)</li>
                <li>• <strong>National Insurance:</strong> Paid automatically if earning over £12,570/year</li>
                <li>• <strong>Income Tax:</strong> Only pay if earning over £12,570/year</li>
                <li>• <strong>Emergency Tax:</strong> May apply initially - claim back if overpaid</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3">Tax Tips for Students</h3>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <ul className="space-y-2 text-green-800 text-sm">
                  <li>• Get a National Insurance number before starting work</li>
                  <li>• Keep payslips for tax records</li>
                  <li>• You can claim back overpaid tax at year-end</li>
                  <li>• Part-time earnings rarely exceed tax threshold</li>
                  <li>• Use HMRC's income tax calculator to estimate take-home pay</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Balancing Work and Studies */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl">Balancing Work and Studies</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <h3 className="text-lg font-semibold mb-3">Time Management</h3>
                <ul className="space-y-2 text-gray-700 text-sm">
                  <li>• Plan your schedule in advance</li>
                  <li>• Block out study time and stick to it</li>
                  <li>• Use breaks between lectures for work</li>
                  <li>• Communicate your availability clearly</li>
                  <li>• Donce overcommit - start with fewer hours</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">Academic Priorities</h3>
                <ul className="space-y-2 text-gray-700 text-sm">
                  <li>• Studies should always come first</li>
                  <li>• Reduce work hours during exams</li>
                  <li>• Find understanding employers</li>
                  <li>• Use work to develop transferable skills</li>
                  <li>• Consider how work complements your studies</li>
                </ul>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-800 mb-2">Recommended Schedule:</h4>
              <p className="text-blue-700 text-sm">
                Most students find 10-15 hours per week during term-time manageable. This allows for study time,
                social activities, and rest while earning useful income.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Safety and Rights */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl">Workplace Rights & Safety</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-3">Your Rights as a Worker</h3>
              <ul className="space-y-2 text-gray-700">
                <li>• Right to minimum wage</li>
                <li>• Rest breaks (20 minutes if working 6+ hours)</li>
                <li>• Safe working environment</li>
                <li>• Protection from discrimination</li>
                <li>• Paid holiday entitlement (pro-rata)</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3">Red Flags to Avoid</h3>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <ul className="space-y-2 text-red-700 text-sm">
                  <li>• Jobs requiring upfront payments</li>
                  <li>• Employers asking for bank details before job offer</li>
                  <li>• "Too good to be true" high pay for easy work</li>
                  <li>• Pressure to work excessive hours</li>
                  <li>• No proper employment contract</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CTA */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Ready to Start Working?</h2>
          <p className="text-gray-600 mb-6">Find student-friendly employers who understand your schedule</p>
          <div className="flex gap-4 justify-center">
            <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700">
              <Link href="/browse-jobs">Browse Jobs</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/signup">Create Account</Link>
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
                {/* ADD THE CONTACT MODAL HERE */}
                <ContactModal>
                    <button className="text-gray-300 hover:text-white text-left px-0 py-0 text-sm font-medium">Contact Us</button>
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