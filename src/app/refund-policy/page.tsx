// src/app/refund-policy/page.tsx
"use client";

import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Header } from "@/components/ui/header"
import { ContactModal } from "@/components/ui/contact-modal";
import { useAuth } from '@/app/context/AuthContext';
import { motion } from "framer-motion"; // Import motion

// --- Animation Variants (Copied for consistency) ---
const pageVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.5, ease: "easeOut" } },
};

const containerStagger = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

const titleVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.4, 0.0, 0.2, 1] },
  },
};

const sectionPop = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 50, damping: 15, mass: 0.5 },
  },
};

const tocLinkVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
};


export default function RefundPolicyPage() {
  const { user, isLoading, logout } = useAuth();

  const pricingHref = user?.user_type === "student" ? "/pricing#student" : "/pricing#employer";

  // Define the table of contents data for Refund Policy
  const tableOfContents = [
    { title: "1. Overview", id: "overview" },
    { title: "2. Refund Eligibility", id: "refund-eligibility" },
    { title: "3. Refund Process", id: "refund-process" },
    { title: "4. Refund Methods", id: "refund-methods" },
    { title: "5. Special Circumstances", id: "special-circumstances" },
    { title: "6. Dispute Resolution", id: "dispute-resolution" },
    { title: "7. Prevention Tips", id: "prevention-tips" },
    { title: "8. Contact Information", id: "contact-information" },
    { title: "9. Policy Updates", id: "policy-updates" },
  ];

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 font-sans antialiased scroll-smooth">
      <Header user={user} isLoading={isLoading} logout={logout} pricingHref={pricingHref} className="fixed top-0 left-0 right-0 z-50 bg-gray-900/80 backdrop-blur-md border-b border-gray-800 text-gray-100" />

      <motion.div
        variants={pageVariants}
        initial="initial"
        animate="animate"
        className="container mx-auto px-4 py-8 max-w-screen-xl pt-24 sm:pt-32"
      >
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8">

          {/* Left Sidebar - Table of Contents (visible on large screens) */}
          <motion.nav
            variants={containerStagger}
            initial="hidden"
            animate="visible"
            className="lg:sticky lg:top-24 lg:h-fit mb-10 p-6 bg-gray-900 rounded-lg border border-gray-800 shadow-lg hidden lg:block"
          >
            <h2 className="text-xl font-bold text-white mb-4">On this page</h2>
            <ul className="space-y-2">
              {tableOfContents.map((item) => (
                <motion.li key={item.id} variants={tocLinkVariants}>
                  <Link
                    href={`#${item.id}`}
                    className="text-gray-300 hover:text-blue-400 hover:underline transition-colors duration-200 text-base block"
                    scroll={true}
                  >
                    {item.title}
                  </Link>
                </motion.li>
              ))}
            </ul>
          </motion.nav>

          {/* Main Content - Refund Policy Card */}
          <Card className="bg-gray-900 border border-gray-800 text-gray-100">
            <CardHeader>
              <motion.h1
                variants={titleVariants}
                className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500 mb-2 py-2"
              >
                Refund Policy
              </motion.h1>
              <motion.p variants={titleVariants} className="text-gray-400 text-lg">Last updated: January 9, 2025</motion.p>
            </CardHeader>
            <CardContent className="space-y-6 text-gray-300">

              {/* Table of Contents (visible on small/medium screens, hidden on large) */}
              <motion.nav
                variants={containerStagger}
                initial="hidden"
                animate="visible"
                className="mb-10 p-6 bg-gray-800 rounded-lg border border-gray-700 shadow-inner lg:hidden"
              >
                <h2 className="text-xl font-bold text-white mb-4">On this page</h2>
                <ul className="space-y-2">
                  {tableOfContents.map((item) => (
                    <motion.li key={item.id} variants={tocLinkVariants}>
                      <Link
                        href={`#${item.id}`}
                        className="text-gray-300 hover:text-blue-400 hover:underline transition-colors duration-200 text-base block"
                        scroll={true}
                      >
                        {item.title}
                      </Link>
                    </motion.li>
                  ))}
                </ul>
              </motion.nav>

              <section>
                <motion.h2 id="overview" variants={sectionPop} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }} className="text-2xl font-semibold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-teal-500 scroll-mt-24">1. Overview</motion.h2>
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
                <motion.h2 id="refund-eligibility" variants={sectionPop} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }} className="text-2xl font-semibold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-teal-500 scroll-mt-24">2. Refund Eligibility</motion.h2>

                <div className="grid md:grid-cols-2 gap-6">
                  {/* Student Card - Highlighted Blue */}
                  <Card className="bg-gray-800 border-2 border-blue-700"> {/* Changed border color for student card */}
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2 text-white">
                        <Badge className="bg-blue-900/50 text-blue-300 border border-blue-700">£1</Badge>
                        Student Contact Reveals
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <h4 className="font-semibold text-green-400 text-base">✓ Refund Available:</h4>
                        <ul className="text-base space-y-1 mt-1 text-gray-300">
                          <li>Job posting was fraudulent or misleading</li>
                          <li>Contact information provided was incorrect</li>
                          <li>Job was already filled but still listed</li>
                          <li>Technical error prevented access to contact info</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold text-red-400 text-base">✗ No Refund:</h4>
                        <ul className="text-base space-y-1 mt-1 text-gray-300">
                          <li>You changed your mind after revealing contact</li>
                          <li>Employer didn't respond to your application</li>
                          <li>You were not selected for the position</li>
                          <li>You found another job in the meantime</li>
                        </ul>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Employer Card - Highlighted Green */}
                  <Card className="bg-gray-800 border-2 border-green-700"> {/* Changed border color for employer card */}
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2 text-white">
                        <Badge className="bg-green-900/50 text-green-300 border border-green-700">£1 - £5</Badge>
                        Employer Job Posts
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <h4 className="font-semibold text-green-400 text-base">✓ Refund Available:</h4>
                        <ul className="text-base space-y-1 mt-1 text-gray-300">
                          <li>Technical error prevented job from being published</li>
                          <li>Platform error affected job visibility</li>
                          <li>Billing error or duplicate charges</li>
                          <li>Job was removed due to our error</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold text-red-400 text-base">✗ No Refund:</h4>
                        <ul className="text-base space-y-1 mt-1 text-gray-300">
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
                <motion.h2 id="refund-process" variants={sectionPop} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }} className="text-2xl font-semibold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-teal-500 scroll-mt-24">3. Refund Process</motion.h2>

                <h3 className="text-xl font-medium mb-2 text-blue-300">How to Request a Refund</h3>
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

                <h3 className="text-xl font-medium mb-2 mt-4 text-blue-300">Processing Times</h3>
                <div className="bg-blue-900/20 p-4 rounded-lg border border-blue-800 text-blue-200">
                  <ul className="space-y-2 text-base">
                    <li>Review Time: 2-3 business days</li>
                    <li>Card Refunds: 5-10 business days</li>
                    <li>PayPal Refunds: 3-5 business days</li>
                    <li>Bank Transfer: 3-5 business days</li>
                  </ul>
                </div>
              </section>

              <section>
                <motion.h2 id="refund-methods" variants={sectionPop} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }} className="text-2xl font-semibold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-teal-500 scroll-mt-24">4. Refund Methods</motion.h2>
                <p className="text-base">Refunds will be processed using the same payment method used for the original transaction:</p>

                <div className="grid md:grid-cols-3 gap-4 mt-4">
                  {/* Added border-2 border-purple-700 to each */}
                  <div className="text-center p-4 bg-gray-800 border-2 border-purple-700 rounded-lg">
                    <h4 className="font-semibold text-base text-white">Credit/Debit Cards</h4>
                    <p className="text-base text-gray-400 mt-1">Refunded to original card</p>
                    <p className="text-sm text-gray-500 mt-2">5-10 business days</p>
                  </div>
                  <div className="text-center p-4 bg-gray-800 border-2 border-purple-700 rounded-lg">
                    <h4 className="font-semibold text-base text-white">PayPal</h4>
                    <p className="text-base text-gray-400 mt-1">Refunded to PayPal account</p>
                    <p className="text-sm text-gray-500 mt-2">3-5 business days</p>
                  </div>
                  <div className="text-center p-4 bg-gray-800 border-2 border-purple-700 rounded-lg">
                    <h4 className="font-semibold text-base text-white">Alternative Methods</h4>
                    <p className="text-base text-gray-400 mt-1">Bank transfer if original method unavailable</p>
                    <p className="text-sm text-gray-500 mt-2">3-5 business days</p>
                  </div>
                </div>
              </section>

              <section>
                <motion.h2 id="special-circumstances" variants={sectionPop} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }} className="text-2xl font-semibold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-teal-500 scroll-mt-24">5. Special Circumstances</motion.h2>

                <h3 className="text-xl font-medium mb-2 text-blue-300">Platform Issues</h3>
                <p className="text-base">
                  If our platform experiences technical difficulties that prevent you from using paid services,
                  we will provide refunds or credits for affected transactions.
                </p>

                <h3 className="text-xl font-medium mb-2 mt-4 text-blue-300">Fraudulent Activity</h3>
                <p className="text-base">
                  If you encounter fraudulent job postings or users, report them immediately. We will investigate
                  and provide refunds for verified cases of fraud.
                </p>

                <h3 className="text-xl font-medium mb-2 mt-4 text-blue-300">Policy Violations</h3>
                <p className="text-base">
                  Jobs removed for violating our Terms of Service or content policies are not eligible for refunds.
                  We recommend reviewing our guidelines before posting.
                </p>

                <h3 className="text-xl font-medium mb-2 mt-4 text-blue-300">Account Suspension</h3>
                <p className="text-base">
                  If your account is suspended for violations, refunds will be considered on a case-by-case basis
                  for unused services purchased before the violation occurred.
                </p>
              </section>

              <section>
                <motion.h2 id="dispute-resolution" variants={sectionPop} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }} className="text-2xl font-semibold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-teal-500 scroll-mt-24">6. Dispute Resolution</motion.h2>

                <h3 className="text-xl font-medium mb-2 text-blue-300">Internal Process</h3>
                <ol className="list-decimal pl-6 space-y-1 text-base">
                  <li>Initial support team review</li>
                  <li>Escalation to management if needed</li>
                  <li>Final decision within 7 business days</li>
                </ol>

                <h3 className="text-xl font-medium mb-2 mt-4 text-blue-300">External Options</h3>
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
                <motion.h2 id="prevention-tips" variants={sectionPop} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }} className="text-2xl font-semibold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-teal-500 scroll-mt-24">7. Prevention Tips</motion.h2>

                <div className="grid md:grid-cols-2 gap-6">
                  {/* Student Card in Prevention Tips - Highlighted Blue */}
                  <Card className="bg-gray-800 border-2 border-blue-700"> {/* Added border-2 border-blue-700 */}
                    <CardHeader>
                      <CardTitle className="text-lg text-white">For Students</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="text-base space-y-1 text-gray-300">
                        <li>Read job descriptions carefully before paying</li>
                        <li>Check employer profiles and ratings</li>
                        <li>Report suspicious job postings</li>
                        <li>Contact support if something seems wrong</li>
                      </ul>
                    </CardContent>
                  </Card>

                  {/* Employer Card in Prevention Tips - Highlighted Green */}
                  <Card className="bg-gray-800 border-2 border-green-700"> {/* Added border-2 border-green-700 */}
                    <CardHeader>
                      <CardTitle className="text-lg text-white">For Employers</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="text-base space-y-1 text-gray-300">
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
                <motion.h2 id="contact-information" variants={sectionPop} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }} className="text-2xl font-semibold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-teal-500 scroll-mt-24">8. Contact Information</motion.h2>
                <p className="text-base">For refund requests or questions about this policy, please contact us:</p>

                <div className="bg-gray-800 p-4 rounded-lg mt-4 text-base text-gray-200">
                  {/* General Support section removed */}
                  <div className="grid grid-cols-1">
                    <div>
                      <h4 className="font-semibold text-base text-white">Refund Requests</h4>
                      <p className="text-base">Email: refunds@studentjobs.uk</p>
                      <p className="text-base">Response time: 2-3 business days</p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 p-4 bg-yellow-900/20 border border-yellow-800 rounded-lg">
                  <h4 className="font-semibold text-yellow-300 text-base">Important Note</h4>
                  <p className="text-base text-yellow-400 mt-1">
                    This refund policy does not affect your statutory rights as a consumer under UK law.
                    You may still have rights under the Consumer Rights Act 2015 and other applicable legislation.
                  </p>
                </div>
              </section>

              <section>
                <motion.h2 id="policy-updates" variants={sectionPop} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }} className="text-2xl font-semibold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-teal-500 scroll-mt-24">9. Policy Updates</motion.h2>
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
      </motion.div>

      {/* Footer (Matching consistent dark theme) */}
      <footer className="w-full bg-gray-900 text-gray-300 py-10 mt-1 border-t border-gray-800">
        <div className="w-full px-4 md:px-6 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center md:text-left">
            <div className="col-span-full md:col-span-1 flex flex-col items-center md:items-start mb-6 md:mb-0">
              <Link
                href="/"
                className="flex items-center justify-center md:justify-start space-x-2 mb-4"
              >
                <span className="text-2xl font-extrabold text-white">
                  StudentJobs UK
                </span>
              </Link>
              <p className="text-gray-400 text-sm max-w-xs text-center md:text-left">
                Connecting UK students with flexible part-time opportunities.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-sm mb-3 text-indigo-400 uppercase tracking-wider">
                For Students
              </h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link
                    href="/browse-jobs"
                    className="text-gray-400 hover:text-indigo-300 transition-colors duration-200"
                  >
                    Browse Jobs
                  </Link>
                </li>
                <li>
                  <Link
                    href="/how-it-works"
                    className="text-gray-400 hover:text-indigo-300 transition-colors duration-200"
                  >
                    How It Works
                  </Link>
                </li>
                <li>
                  <Link
                    href="/student-guide"
                    className="text-gray-400 hover:text-indigo-300 transition-colors duration-200"
                  >
                    Student Guide
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold text-base mb-3 text-indigo-300">
                For Employers
              </h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link
                    href="/post-job"
                    className="text-gray-400 hover:text-indigo-300 transition-colors duration-200"
                  >
                    Post a Job
                  </Link>
                </li>
                <li>
                  <Link
                    href={pricingHref}
                    className="text-gray-400 hover:text-indigo-300 transition-colors duration-200"
                  >
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link
                    href="/employer-guide"
                    className="text-gray-400 hover:text-indigo-300 transition-colors duration-200"
                  >
                    Employer Guide
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold text-base mb-3 text-purple-300">Legal</h3>
              <ul className="space-y-1.5 text-sm">
                <li>
                  <Link
                    href="/privacy"
                    className="text-gray-400 hover:text-purple-200 transition-colors duration-200"
                  >
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link
                    href="/terms"
                    className="text-gray-400 hover:text-purple-200 transition-colors duration-200"
                  >
                    Terms & Conditions
                  </Link>
                </li>
                <li>
                  <Link
                    href="/refund-policy"
                    className="text-gray-400 hover:text-purple-200 transition-colors duration-200"
                  >
                    Refund Policy
                  </Link>
                </li>
                <li>
                  <ContactModal>
                    <button className="text-gray-400 hover:text-purple-200 transition-colors duration-200 text-left text-sm">
                      Contact Us
                    </button>
                  </ContactModal>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-10 pt-6 text-center text-xs text-gray-500">
            © {new Date().getFullYear()} StudentJobs UK. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}