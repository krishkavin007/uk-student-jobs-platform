"use client"; // <-- THIS IS THE CRUCIAL ADDITION

import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Header } from "@/components/ui/header" // Correctly imported
import { ContactModal } from "@/components/ui/contact-modal"; // <--- ADDED THIS IMPORT
import { useAuth } from '@/app/context/AuthContext';

export default function PrivacyPolicyPage() {
  const { user, isLoading, logout } = useAuth(); // This line now runs on the client

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      {/* Replaced the custom <header> with the reusable Header component */}
      <Header user={user} isLoading={isLoading} logout={logout} />

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">Privacy Policy</CardTitle>
            <p className="text-gray-600">Last updated: January 9, 2025</p>
          </CardHeader>
          <CardContent className="prose max-w-none space-y-6">
            <section>
              <h2 className="text-2xl font-semibold mb-3">1. Introduction</h2>
              <p>
                StudentJobs UK ("we", "our", or "us") is committed to protecting your privacy and ensuring the security of your personal information.
                This Privacy Policy explains how we collect, use, store, and protect your personal data when you use our platform.
              </p>
              <p>
                We are the data controller for the personal information we hold about you. Our registered office is located in the United Kingdom,
                and we are subject to UK GDPR and the Data Protection Act 2018.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">2. Information We Collect</h2>

              <h3 className="text-xl font-medium mb-2">Personal Information</h3>
              <ul className="list-disc pl-6 space-y-1">
                <li>Name and contact details (email address, phone number)</li>
                <li>University/college information (for students)</li>
                <li>Business information (for employers)</li>
                <li>Profile information and preferences</li>
                <li>Payment information (processed securely through third-party providers)</li>
              </ul>

              <h3 className="text-xl font-medium mb-2 mt-4">Usage Information</h3>
              <ul className="list-disc pl-6 space-y-1">
                <li>Job search and application history</li>
                <li>Communication between users through our platform</li>
                <li>Platform usage analytics and interaction data</li>
                <li>Device information and IP addresses</li>
              </ul>

              <h3 className="text-xl font-medium mb-2 mt-4">Verification Data</h3>
              <ul className="list-disc pl-6 space-y-1">
                <li>Student verification documents (.ac.uk email confirmation)</li>
                <li>Phone number verification codes</li>
                <li>Email verification status</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">3. How We Use Your Information</h2>
              <p>We use your personal information for the following purposes:</p>

              <h3 className="text-xl font-medium mb-2">Service Provision</h3>
              <ul className="list-disc pl-6 space-y-1">
                <li>Creating and managing your account</li>
                <li>Facilitating job postings and applications</li>
                <li>Processing payments and transactions</li>
                <li>Providing customer support</li>
              </ul>

              <h3 className="text-xl font-medium mb-2 mt-4">Communication</h3>
              <ul className="list-disc pl-6 space-y-1">
                <li>Sending service-related notifications</li>
                <li>Job matching and recommendation notifications</li>
                <li>Important updates about our platform</li>
                <li>Marketing communications (with your consent)</li>
              </ul>

              <h3 className="text-xl font-medium mb-2 mt-4">Legal and Security</h3>
              <ul className="list-disc pl-6 space-y-1">
                <li>Verifying user identity and preventing fraud</li>
                <li>Complying with legal obligations</li>
                <li>Ensuring platform safety and security</li>
                <li>Resolving disputes and enforcing our terms</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">4. Legal Basis for Processing</h2>
              <p>We process your personal data based on the following legal grounds:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>**Contract:** To provide our services and fulfill our contractual obligations</li>
                <li>**Legitimate Interest:** To improve our services, prevent fraud, and ensure platform security</li>
                <li>**Consent:** For marketing communications and optional features</li>
                <li>**Legal Obligation:** To comply with applicable laws and regulations</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">5. Information Sharing</h2>
              <p>We do not sell your personal information to third parties. We may share your information in the following circumstances:</p>

              <h3 className="text-xl font-medium mb-2">Between Platform Users</h3>
              <ul className="list-disc pl-6 space-y-1">
                <li>Contact information is shared with students after they pay the £1 fee</li>
                <li>Public profile information visible in job applications</li>
                <li>Communication through our platform messaging system</li>
              </ul>

              <h3 className="text-xl font-medium mb-2 mt-4">Service Providers</h3>
              <ul className="list-disc pl-6 space-y-1">
                <li>Payment processors (Stripe/PayPal) for transaction processing</li>
                <li>Email service providers for communications</li>
                <li>Cloud hosting providers for data storage</li>
                <li>Analytics providers for platform improvement</li>
              </ul>

              <h3 className="text-xl font-medium mb-2 mt-4">Legal Requirements</h3>
              <ul className="list-disc pl-6 space-y-1">
                <li>Law enforcement agencies when required by law</li>
                <li>Regulatory authorities for compliance purposes</li>
                <li>Legal proceedings and dispute resolution</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">6. Data Retention</h2>
              <p>We retain your personal information for as long as necessary to provide our services and comply with legal obligations:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>**Active accounts:** Data retained while your account is active</li>
                <li>**Closed accounts:** Data retained for 2 years after account closure</li>
                <li>**Transaction records:** Retained for 7 years for tax and legal compliance</li>
                <li>**Job postings:** Deleted 60 days after expiry unless required for legal purposes</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">7. Your Rights Under GDPR</h2>
              <p>You have the following rights regarding your personal data:</p>

              <div className="grid md:grid-cols-2 gap-4 mt-4">
                <div>
                  <h4 className="font-semibold">Access</h4>
                  <p className="text-sm text-gray-600">Request a copy of your personal data</p>
                </div>
                <div>
                  <h4 className="font-semibold">Rectification</h4>
                  <p className="text-sm text-gray-600">Correct inaccurate personal data</p>
                </div>
                <div>
                  <h4 className="font-semibold">Erasure</h4>
                  <p className="text-sm text-gray-600">Request deletion of your personal data</p>
                </div>
                <div>
                  <h4 className="font-semibold">Restriction</h4>
                  <p className="text-sm text-gray-600">Limit how we process your data</p>
                </div>
                <div>
                  <h4 className="font-semibold">Portability</h4>
                  <p className="text-sm text-gray-600">Transfer your data to another service</p>
                </div>
                <div>
                  <h4 className="font-semibold">Objection</h4>
                  <p className="text-sm text-gray-600">Object to certain types of processing</p>
                </div>
              </div>

              <p className="mt-4">
                To exercise any of these rights, please contact us at privacy@studentjobs.uk or through your account settings.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">8. Data Security</h2>
              <p>We implement appropriate technical and organizational measures to protect your personal information:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Encryption of data in transit and at rest</li>
                <li>Regular security assessments and updates</li>
                <li>Access controls and staff training</li>
                <li>Secure payment processing through certified providers</li>
                <li>Regular backups and disaster recovery procedures</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">9. Cookies and Tracking</h2>
              <p>
                We use cookies and similar technologies to improve your experience on our platform.
                Our Cookie Policy provides detailed information about the cookies we use and how to manage your preferences.
              </p>
              <p>
                You can control cookie settings through your browser, but please note that disabling certain cookies may affect platform functionality.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">10. Children's Privacy</h2>
              <p>
                Our platform is intended for users aged 18 and over. We do not knowingly collect personal information from children under 18.
                If you believe we have collected information from a child under 18, please contact us immediately.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">11. International Transfers</h2>
              <p>
                Your personal data may be transferred to and processed in countries outside the UK. When we do this, we ensure adequate
                protection through appropriate safeguards such as Standard Contractual Clauses or adequacy decisions.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">12. Updates to This Policy</h2>
              <p>
                We may update this Privacy Policy from time to time. We will notify you of significant changes through email or platform notifications.
                The "Last updated" date at the top indicates when this policy was last revised.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">13. Contact Information</h2>
              <p>If you have questions about this Privacy Policy or how we handle your personal data, please contact us:</p>
              <div className="bg-gray-50 p-4 rounded-lg mt-4">
                <p>**Email:** privacy@studentjobs.uk</p>
                <p>**Data Protection Officer:** dpo@studentjobs.uk</p>
                <p>**Address:** StudentJobs UK Ltd, London, United Kingdom</p>
              </div>
              <p className="mt-4">
                You also have the right to lodge a complaint with the Information Commissioner's Office (ICO) if you believe
                we have not handled your personal data appropriately.
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