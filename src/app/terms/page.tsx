import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Header } from "@/components/ui/header" // Correctly imported
import { ContactModal } from "@/components/ui/contact-modal"; // <--- ADD THIS IMPORT

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      {/* Replaced the custom <header> with the reusable Header component */}
      <Header />

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">Terms & Conditions</CardTitle>
            <p className="text-gray-600">Last updated: January 9, 2025</p>
          </CardHeader>
          <CardContent className="prose max-w-none space-y-6">
            <section>
              <h2 className="text-2xl font-semibold mb-3">1. Introduction</h2>
              <p>
                Welcome to StudentJobs UK. These Terms and Conditions ("Terms") govern your use of our platform and services.
                By accessing or using StudentJobs UK, you agree to be bound by these Terms.
              </p>
              <p>
                StudentJobs UK is operated by StudentJobs UK Ltd, a company registered in England and Wales.
                These Terms constitute a legally binding agreement between you and us.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">2. Definitions</h2>
              <ul className="list-disc pl-6 space-y-1">
                <li>**"Platform"** refers to the StudentJobs UK website and mobile applications</li>
                <li>**"User"** refers to any person who accesses or uses our Platform</li>
                <li>**"Student"** refers to users seeking part-time employment opportunities</li>
                <li>**"Employer"** refers to users posting job opportunities</li>
                <li>**"Job Posting"** refers to employment opportunities listed on our Platform</li>
                <li>**"Services"** refers to all features and functionality provided through our Platform</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">3. Eligibility and Account Registration</h2>

              <h3 className="text-xl font-medium mb-2">General Eligibility</h3>
              <ul className="list-disc pl-6 space-y-1">
                <li>You must be at least 18 years old to use our Platform</li>
                <li>You must be legally authorized to work in the UK</li>
                <li>You must provide accurate and complete information during registration</li>
                <li>You are responsible for maintaining the security of your account</li>
              </ul>

              <h3 className="text-xl font-medium mb-2 mt-4">Student Accounts</h3>
              <ul className="list-disc pl-6 space-y-1">
                <li>Must be enrolled in a recognized UK educational institution</li>
                <li>Must verify student status through .ac.uk email address or other acceptable proof</li>
                <li>Must provide accurate university/college information</li>
              </ul>

              <h3 className="text-xl font-medium mb-2 mt-4">Employer Accounts</h3>
              <ul className="list-disc pl-6 space-y-1">
                <li>Must represent a legitimate business or organization</li>
                <li>Must have legal authority to post job opportunities</li>
                <li>Must comply with UK employment laws and regulations</li>
              </ul>

              <h3 className="text-xl font-medium mb-2 mt-4">Verification Requirements</h3>
              <ul className="list-disc pl-6 space-y-1">
                <li>All users must verify their email address and phone number</li>
                <li>We reserve the right to request additional verification documents</li>
                <li>Accounts that fail verification may be suspended or terminated</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">4. Platform Usage</h2>

              <h3 className="text-xl font-medium mb-2">Permitted Uses</h3>
              <ul className="list-disc pl-6 space-y-1">
                <li>Searching and applying for legitimate part-time job opportunities</li>
                <li>Posting genuine job vacancies for part-time positions</li>
                <li>Communicating with other users through our Platform</li>
                <li>Managing your account and profile information</li>
              </ul>

              <h3 className="text-xl font-medium mb-2 mt-4">Prohibited Activities</h3>
              <ul className="list-disc pl-6 space-y-1">
                <li>Posting false, misleading, or fraudulent information</li>
                <li>Using the Platform for illegal activities or purposes</li>
                <li>Harassing, threatening, or discriminating against other users</li>
                <li>Attempting to circumvent our payment systems</li>
                <li>Creating multiple accounts or impersonating others</li>
                <li>Posting jobs that violate employment laws or our content policies</li>
                <li>Scraping or automatically collecting data from our Platform</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">5. Job Postings and Applications</h2>

              <h3 className="text-xl font-medium mb-2">Employer Responsibilities</h3>
              <ul className="list-disc pl-6 space-y-1">
                <li>Ensure all job postings are accurate and current</li>
                <li>Comply with UK employment laws, including minimum wage requirements</li>
                <li>Provide safe and legal working conditions</li>
                <li>Respond to applications in a timely and professional manner</li>
                <li>Remove or update job postings when positions are filled</li>
              </ul>

              <h3 className="text-xl font-medium mb-2 mt-4">Student Responsibilities</h3>
              <ul className="list-disc pl-6 space-y-1">
                <li>Provide accurate information in applications and profiles</li>
                <li>Be professional in all communications with employers</li>
                <li>Honor commitments made to employers</li>
                <li>Report any inappropriate or illegal job postings</li>
              </ul>

              <h3 className="text-xl font-medium mb-2 mt-4">Job Posting Guidelines</h3>
              <ul className="list-disc pl-6 space-y-1">
                <li>All positions must be for legitimate part-time work</li>
                <li>Must comply with UK minimum wage laws (currently £10.42/hour)</li>
                <li>Must not discriminate based on protected characteristics</li>
                <li>Must not involve adult content, gambling, or illegal activities</li>
                <li>Must provide clear job descriptions and requirements</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">6. Payment Terms</h2>

              <h3 className="text-xl font-medium mb-2">Employer Payments</h3>
              <ul className="list-disc pl-6 space-y-1">
                <li>**Basic Job Posting:** £1.00 per job posting, valid for 30 days</li>
                <li>**Sponsored Job Posting:** £5.00 per job posting with enhanced visibility</li>
                <li>All payments are due at the time of job posting</li>
                <li>Payments are non-refundable except as outlined in our Refund Policy</li>
              </ul>

              <h3 className="text-xl font-medium mb-2 mt-4">Student Payments</h3>
              <ul className="list-disc pl-6 space-y-1">
                <li>**Contact Information Access:** £1.00 per job application</li>
                <li>Payment grants access to employer contact details</li>
                <li>No additional charges for applying to jobs</li>
                <li>Refunds available only in exceptional circumstances</li>
              </ul>

              <h3 className="text-xl font-medium mb-2 mt-4">Payment Processing</h3>
              <ul className="list-disc pl-6 space-y-1">
                <li>All payments processed through secure third-party providers (Stripe/PayPal)</li>
                <li>We do not store payment card information</li>
                <li>Transaction receipts provided via email</li>
                <li>All prices include applicable VAT</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">7. Content and Intellectual Property</h2>

              <h3 className="text-xl font-medium mb-2">User Content</h3>
              <ul className="list-disc pl-6 space-y-1">
                <li>You retain ownership of content you post on our Platform</li>
                <li>You grant us a license to use, display, and distribute your content</li>
                <li>You are responsible for ensuring your content doesn't infringe third-party rights</li>
                <li>We may remove content that violates these Terms</li>
              </ul>

              <h3 className="text-xl font-medium mb-2 mt-4">Platform Content</h3>
              <ul className="list-disc pl-6 space-y-1">
                <li>All Platform features, design, and code are our intellectual property</li>
                <li>You may not copy, modify, or distribute our Platform content</li>
                <li>Our trademarks and logos are protected by intellectual property law</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">8. Privacy and Data Protection</h2>
              <p>
                Your privacy is important to us. Our Privacy Policy explains how we collect, use, and protect your personal information.
                By using our Platform, you agree to our data practices as described in the Privacy Policy.
              </p>
              <p>
                We comply with UK GDPR and Data Protection Act 2018. You have rights regarding your personal data,
                including the right to access, correct, or delete your information.
              </p>
            </section>

            <section>
              <h2 className="2xl font-semibold mb-3">9. Platform Availability and Modifications</h2>
              <ul className="list-disc pl-6 space-y-1">
                <li>We strive to maintain Platform availability but cannot guarantee 100% uptime</li>
                <li>We may temporarily suspend the Platform for maintenance or updates</li>
                <li>We reserve the right to modify, update, or discontinue features</li>
                <li>We will provide reasonable notice of significant changes</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">10. Disclaimers and Limitation of Liability</h2>

              <h3 className="text-xl font-medium mb-2">Platform Disclaimers</h3>
              <ul className="list-disc pl-6 space-y-1">
                <li>We provide the Platform "as is" without warranties of any kind</li>
                <li>We do not guarantee the accuracy of job postings or user information</li>
                <li>We are not responsible for the actions of employers or students</li>
                <li>We do not guarantee job placement or hiring outcomes</li>
              </ul>

              <h3 className="text-xl font-medium mb-2 mt-4">Limitation of Liability</h3>
              <p>
                To the maximum extent permitted by law, our liability is limited to the amount you have paid to us in the
                12 months preceding the claim. We are not liable for indirect, incidental, or consequential damages.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">11. Indemnification</h2>
              <p>
                You agree to indemnify and hold us harmless from any claims, damages, or expenses arising from your use of
                the Platform, violation of these Terms, or infringement of any third-party rights.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">12. Termination</h2>

              <h3 className="text-xl font-medium mb-2">Your Right to Terminate</h3>
              <ul className="list-disc pl-6 space-y-1">
                <li>You may terminate your account at any time through your account settings</li>
                <li>Termination does not entitle you to refunds of fees already paid</li>
                <li>You remain responsible for any outstanding obligations</li>
              </ul>

              <h3 className="text-xl font-medium mb-2 mt-4">Our Right to Terminate</h3>
              <ul className="list-disc pl-6 space-y-1">
                <li>We may suspend or terminate accounts that violate these Terms</li>
                <li>We may terminate accounts for fraudulent or illegal activity</li>
                <li>We may terminate or modify services with reasonable notice</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">13. Dispute Resolution</h2>
              <p>
                Any disputes arising from these Terms or your use of the Platform will be governed by English law and
                subject to the exclusive jurisdiction of the English courts.
              </p>
              <p>
                We encourage users to first contact our support team to resolve any issues before pursuing legal action.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">14. Changes to Terms</h2>
              <p>
                We may update these Terms from time to time. Significant changes will be communicated through email or
                Platform notifications. Continued use of the Platform after changes constitutes acceptance of the new Terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">15. Contact Information</h2>
              <p>If you have questions about these Terms, please contact us:</p>
              <div className="bg-gray-50 p-4 rounded-lg mt-4">
                <p>**Email:** legal@studentjobs.uk</p>
                <p>**Support:** support@studentjobs.uk</p>
                <p>**Address:** StudentJobs UK Ltd, London, United Kingdom</p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">16. Entire Agreement</h2>
              <p>
                These Terms, together with our Privacy Policy and Refund Policy, constitute the entire agreement between
                you and StudentJobs UK regarding your use of the Platform.
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