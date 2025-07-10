import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Header } from "@/components/ui/header" // Import the Header component
import { ContactModal } from "@/components/ui/contact-modal"; // <--- This import is correct and needed!

export default function EmployerGuidePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Header />

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Employer Guide</h1>
          <p className="text-xl text-gray-600">Everything you need to know about hiring students successfully</p>
        </div>

        {/* Benefits of Hiring Students */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl">Why Hire Students?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <h3 className="text-lg font-semibold mb-3 text-green-700">Advantages</h3>
                <ul className="space-y-2 text-gray-700">
                  <li>• **Flexible availability:** Evenings, weekends, holidays</li>
                  <li>• **Motivated workforce:** Students need income and experience</li>
                  <li>• **Fresh perspectives:** Up-to-date skills and enthusiasm</li>
                  <li>• **Tech-savvy:** Comfortable with digital tools and social media</li>
                  <li>• **Quick learners:** Used to acquiring new knowledge rapidly</li>
                  <li>• **Cost-effective:** Part-time roles with competitive wages</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3 text-blue-700">Best Fit Roles</h3>
                <ul className="space-y-2 text-gray-700">
                  <li>• Customer service and retail</li>
                  <li>• Hospitality and food service</li>
                  <li>• Administrative support</li>
                  <li>• Tutoring and education</li>
                  <li>• Event assistance</li>
                  <li>• Digital marketing and social media</li>
                  <li>• Data entry and research</li>
                  <li>• Delivery and logistics</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Legal Requirements */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl">Legal Requirements & Compliance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-3">Student Work Hour Limits</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-800 mb-2">UK/EU Students</h4>
                  <ul className="text-blue-700 text-sm space-y-1">
                    <li>• No restrictions on working hours</li>
                    <li>• Can work anytime during studies</li>
                    <li>• Full employment rights</li>
                  </ul>
                </div>
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <h4 className="font-semibold text-amber-800 mb-2">International Students</h4>
                  <ul className="text-amber-700 text-sm space-y-1">
                    <li>• Max 20 hours during term-time</li>
                    <li>• Up to 40 hours during holidays</li>
                    <li>• Must check visa conditions</li>
                  </ul>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3">Employment Essentials</h3>
              <ul className="space-y-2 text-gray-700">
                <li>• **Minimum Wage:** £10.42/hour (18-20), £11.44/hour (21+)</li>
                <li>• **Right to Work:** Check passport, visa, or settled status</li>
                <li>• **Employment Contract:** Written terms within 2 months</li>
                <li>• **Health & Safety:** Provide safe working environment</li>
                <li>• **Breaks:** 20 minutes for 6+ hour shifts</li>
                <li>• **Holiday Pay:** 5.6 weeks pro-rata for part-time workers</li>
              </ul>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h4 className="font-semibold text-red-800 mb-2">Important:</h4>
              <p className="text-red-700 text-sm">
                Always verify a student's right to work in the UK before employment. International students
                must not exceed their visa work hour limits as this can affect their immigration status.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Creating Effective Job Posts */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl">Writing Effective Job Posts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-3">Essential Information to Include</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <h4 className="font-medium mb-2">Job Details</h4>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• Clear, descriptive job title</li>
                    <li>• Specific duties and responsibilities</li>
                    <li>• Required skills and experience</li>
                    <li>• Training provided (if any)</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Practical Information</h4>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• Exact location or area</li>
                    <li>• Hours per week and shift patterns</li>
                    <li>• Hourly wage (at least minimum wage)</li>
                    <li>• Start date and duration</li>
                  </ul>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3">Student-Friendly Language</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <h4 className="font-medium text-green-600 mb-2">✓ Good Examples</h4>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• "Flexible hours to fit around studies"</li>
                    <li>• "Perfect for students"</li>
                    <li>• "Weekend and evening shifts available"</li>
                    <li>• "Understanding of academic schedules"</li>
                    <li>• "Term-time or holiday work"</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-red-600 mb-2">✗ Avoid</h4>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• "Must be available 9-5 weekdays"</li>
                    <li>• "Full-time commitment required"</li>
                    <li>• "No academic commitments"</li>
                    <li>• "Must prioritize work over studies"</li>
                    <li>• Unclear or misleading job descriptions</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-semibold text-green-800 mb-2">Pro Tip:</h4>
              <p className="text-green-700 text-sm">
                Mention if you offer flexible scheduling around exams, understanding of academic priorities,
                or opportunities for skill development. Students value employers who respect their education.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Interviewing Students */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl">Interviewing & Selecting Students</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-3">Interview Best Practices</h3>
              <ul className="space-y-2 text-gray-700">
                <li>• **Be flexible with timing:** Offer evening or weekend interviews</li>
                <li>• **Ask about availability:** Understand their academic calendar</li>
                <li>• **Focus on potential:** Many students lack work experience</li>
                <li>• **Assess soft skills:** Reliability, communication, willingness to learn</li>
                <li>• **Explain the role clearly:** Set realistic expectations</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3">Key Questions to Ask</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <h4 className="font-medium mb-2">Availability & Commitment</h4>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• "What's your weekly availability?"</li>
                    <li>• "How do your lectures/seminars fit?"</li>
                    <li>• "When are your exam periods?"</li>
                    <li>• "How long can you commit to this role?"</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Motivation & Skills</h4>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• "Why do you want this particular job?"</li>
                    <li>• "How will you balance work and studies?"</li>
                    <li>• "Tell me about a challenge you overcame"</li>
                    <li>• "What skills from your course apply here?"</li>
                  </ul>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3">Red Flags to Watch For</h3>
              <ul className="space-y-2 text-gray-700">
                <li>• Unrealistic availability (claiming 40+ hours during term-time)</li>
                <li>• No consideration of academic commitments</li>
                <li>• Multiple job applications without research</li>
                <li>• Inability to explain how they'll manage time</li>
                <li>• Poor communication or unprofessional approach</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Managing Student Employees */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl">Managing Student Employees</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-3">Setting Up for Success</h3>
              <ul className="space-y-2 text-gray-700">
                <li>• **Clear expectations:** Define roles, responsibilities, and standards</li>
                <li>• **Flexible scheduling:** Work around academic calendars</li>
                <li>• **Proper training:** Invest time in onboarding and skill development</li>
                <li>• **Regular check-ins:** Monitor performance and provide feedback</li>
                <li>• **Academic respect:** Prioritize their education when conflicts arise</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3">Common Challenges & Solutions</h3>
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium mb-2">Challenge: Exam periods and coursework deadlines</h4>
                  <p className="text-sm text-gray-700">
                    **Solution:** Build flexibility into your roster. Allow reduced hours during
                    exam periods and be understanding about academic priorities.
                  </p>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium mb-2">Challenge: High turnover at graduation</h4>
                  <p className="text-sm text-gray-700">
                    **Solution:** Maintain good relationships with universities and continuously
                    recruit. Consider offering references and career advice to departing students.
                  </p>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium mb-2">Challenge: Varying experience levels</h4>
                  <p className="text-sm text-gray-700">
                    **Solution:** Create comprehensive training programs and pair new students
                    with experienced staff. Focus on transferable skills development.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3">Retaining Good Student Employees</h3>
              <ul className="space-y-2 text-gray-700">
                <li>• Offer competitive wages and regular reviews</li>
                <li>• Provide opportunities for skill development</li>
                <li>• Recognize and reward good performance</li>
                <li>• Be understanding about academic commitments</li>
                <li>• Offer flexible contracts and holiday work</li>
                <li>• Write references and LinkedIn recommendations</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Platform Features for Employers */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl">Making the Most of StudentJobs UK</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-3">Sponsored vs Basic Listings</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium mb-2">Basic Listing (£1)</h4>
                  <p className="text-sm text-gray-700 mb-2">Best for:</p>
                  <ul className="text-xs text-gray-600 space-y-1">
                    <li>• Simple, straightforward roles</li>
                    <li>• Local businesses with specific location requirements</li>
                    <li>• When you have time to wait for applications</li>
                  </ul>
                </div>

                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="font-medium mb-2 text-blue-800">Sponsored Listing (£5)</h4>
                  <p className="text-sm text-gray-700 mb-2">Best for:</p>
                  <ul className="text-xs text-gray-600 space-y-1">
                    <li>• Urgent hiring needs</li>
                    <li>• Competitive job markets</li>
                    <li>• Premium or higher-paying roles</li>
                    <li>• When you want maximum visibility</li>
                  </ul>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3">Platform Features</h3>
              <ul className="space-y-2 text-gray-700">
                <li>• **Direct contact:** Students pay £1 to access your details, ensuring serious applications</li>
                <li>• **Verified students:** All users confirm their student status</li>
                <li>• **Edit anytime:** Update job details or requirements as needed</li>
                <li>• **30-day visibility:** Jobs remain active for a full month</li>
                <li>• **Application tracking:** See how many students have viewed/applied</li>
                <li>• **Support system:** Report any issues or inappropriate applications</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Success Stories Examples */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl">Success Stories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-semibold text-green-800 mb-2">Local Café Chain</h4>
                <p className="text-sm text-green-700">
                  "We've hired 15 students through StudentJobs UK. The £1 application fee means we only
                  get serious candidates, and the students understand our need for weekend coverage.
                  Great platform for hospitality businesses!"
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-800 mb-2">Marketing Agency</h4>
                <p className="text-sm text-blue-700">
                  "Students bring fresh ideas and digital native skills. We use sponsored listings for
                  our creative roles and always get excellent applications. The flexibility works for
                  both of us."
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CTA */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Ready to Hire Your First Student?</h2>
          <p className="text-gray-600 mb-6">Join hundreds of UK employers finding great student talent</p>
          <div className="flex gap-4 justify-center">
            <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700">
              <Link href="/post-job">Post Your First Job</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/pricing">View Pricing</Link>
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