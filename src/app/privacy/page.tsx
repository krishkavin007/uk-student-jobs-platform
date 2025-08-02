// src/app/privacy/page.tsx
"use client"

import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Header } from "@/components/ui/header"
import { ContactModal } from "@/components/ui/contact-modal";
import { useAuth } from '@/app/context/AuthContext';
import { motion } from "framer-motion"; // Import motion

// --- Animation Variants (Copied from EmployerGuide for consistency) ---
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

const sectionPop = { // Renamed from sectionVariants for consistency with previous guides
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 50, damping: 15, mass: 0.5 },
  },
};

// Variants for TOC links
const tocLinkVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
};

export default function PrivacyPolicyPage() {
  const { user, isLoading, logout } = useAuth();

  const pricingHref = user?.user_type === "student" ? "/pricing#student" : "/pricing#employer";

  // Define the table of contents data
  const tableOfContents = [
    { title: "1. Introduction", id: "introduction" },
    { title: "2. Information We Collect", id: "information-we-collect" },
    { title: "3. How We Use Your Information", id: "how-we-use-your-information" },
    { title: "4. Legal Basis for Processing", id: "legal-basis-for-processing" },
    { title: "5. Information Sharing", id: "information-sharing" },
    { title: "6. Data Retention", id: "data-retention" },
    { title: "7. Your Rights Under GDPR", id: "your-rights-under-gdpr" },
    { title: "8. Data Security", id: "data-security" },
    { title: "9. Cookies and Tracking", id: "cookies-and-tracking" },
    { title: "10. Children's Privacy", id: "childrens-privacy" },
    { title: "11. International Transfers", id: "international-transfers" },
    { title: "12. Updates to This Policy", id: "updates-to-this-policy" },
    { title: "13. Contact Information", id: "contact-information" },
  ];

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 font-sans antialiased scroll-smooth"> {/* Dark mode background and default text, added scroll-smooth */}
      <Header user={user} isLoading={isLoading} logout={logout} pricingHref={pricingHref} className="fixed top-0 left-0 right-0 z-50 bg-gray-900/80 backdrop-blur-md border-b border-gray-800 text-gray-100" /> {/* Added class for consistency */}

      <motion.div
        variants={pageVariants}
        initial="initial"
        animate="animate"
        className="container mx-auto px-4 py-8 max-w-screen-xl pt-24 sm:pt-32" // Increased max-width for two-column layout
      >
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8"> {/* Grid layout for two columns */}

          {/* Left Sidebar - Table of Contents (visible on large screens) */}
          <motion.nav
            variants={containerStagger}
            initial="hidden"
            animate="visible"
            className="lg:sticky lg:top-24 lg:h-fit mb-10 p-6 bg-gray-900 rounded-lg border border-gray-800 shadow-lg hidden lg:block" // Hidden on small, sticky on large
          >
            <h2 className="text-xl font-bold text-white mb-4">On this page</h2>
            <ul className="space-y-2">
              {tableOfContents.map((item) => (
                <motion.li key={item.id} variants={tocLinkVariants}>
                  <Link
                    href={`#${item.id}`}
                    className="text-gray-300 hover:text-blue-400 hover:underline transition-colors duration-200 text-base block"
                    scroll={true} // Ensure smooth scrolling
                  >
                    {item.title}
                  </Link>
                </motion.li>
              ))}
            </ul>
          </motion.nav>

          {/* Main Content - Privacy Policy Card */}
          <Card className="bg-gray-900 border border-gray-800 text-gray-100">
            <CardHeader>
              <motion.h1
                variants={titleVariants}
                className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500 mb-2 py-2" // Applied gradient and spacing like Employer Guide title
              >
                Privacy Policy
              </motion.h1>
              <motion.p variants={titleVariants} className="text-gray-400 text-lg">Last updated: July 24, 2025</motion.p>
            </CardHeader>
            <CardContent className="space-y-6 text-gray-300">

              {/* Table of Contents (visible on small/medium screens, hidden on large) */}
              <motion.nav
                variants={containerStagger}
                initial="hidden"
                animate="visible"
                className="mb-10 p-6 bg-gray-800 rounded-lg border border-gray-700 shadow-inner lg:hidden" // Hidden on large
              >
                <h2 className="text-xl font-bold text-white mb-4">On this page</h2>
                <ul className="space-y-2">
                  {tableOfContents.map((item) => (
                    <motion.li key={item.id} variants={tocLinkVariants}>
                      <Link
                        href={`#${item.id}`}
                        className="text-gray-300 hover:text-blue-400 hover:underline transition-colors duration-200 text-base block"
                        scroll={true} // Ensure smooth scrolling
                      >
                        {item.title}
                      </Link>
                    </motion.li>
                  ))}
                </ul>
              </motion.nav>

              <section>
                <motion.h2 id="introduction" variants={sectionPop} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }} className="text-2xl font-semibold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-teal-500 scroll-mt-24">1. Introduction</motion.h2>
                <p className="text-base mt-2">
                  StudentJobs UK ("we", "our", or "us") is committed to protecting your privacy and ensuring the security of your personal information.
                  This Privacy Policy explains how we collect, use, store, and protect your personal data when you use our platform.
                </p>
                <p className="text-base">
                  We are the data controller for the personal information we hold about you. Our registered office is located in the United Kingdom,
                  and we are subject to UK GDPR and the Data Protection Act 2018.
                </p>
              </section>

              <section>
                <motion.h2 id="information-we-collect" variants={sectionPop} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }} className="text-2xl font-semibold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-teal-500 scroll-mt-24">2. Information We Collect</motion.h2>

                <h3 className="text-xl font-medium mb-2 text-blue-300 mt-4">Personal Information</h3> {/* Styled h3 */}
                <ul className="list-disc pl-6 space-y-1 text-base">
                  <li>Name and contact details (email address, phone number)</li>
                  <li>University/college information (for students)</li>
                  <li>Business information (for employers)</li>
                  <li>Profile information and preferences</li>
                  <li>Payment information (processed securely through third-party providers)</li>
                </ul>

                <h3 className="text-xl font-medium mb-2 mt-4 text-blue-300">Usage Information</h3>
                <ul className="list-disc pl-6 space-y-1 text-base">
                  <li>Job search and application history</li>
                  <li>Communication between users through our platform</li>
                  <li>Platform usage analytics and interaction data</li>
                  <li>Device information and IP addresses</li>
                </ul>

                <h3 className="text-xl font-medium mb-2 mt-4 text-blue-300">Verification Data</h3>
                <ul className="list-disc pl-6 space-y-1 text-base">
                  <li>Student verification documents (.ac.uk email confirmation)</li>
                  <li>Phone number verification codes</li>
                  <li>Email verification status</li>
                </ul>
              </section>

              <section>
                <motion.h2 id="how-we-use-your-information" variants={sectionPop} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }} className="text-2xl font-semibold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-teal-500 scroll-mt-24">3. How We Use Your Information</motion.h2>
                <p className="text-base mt-2">
                  We use your personal information for the following purposes:
                </p>

                <h3 className="text-xl font-medium mb-2 text-blue-300">Service Provision</h3>
                <ul className="list-disc pl-6 space-y-1 text-base">
                  <li>Creating and managing your account</li>
                  <li>Facilitating job postings and applications</li>
                  <li>Processing payments and transactions</li>
                  <li>Providing customer support</li>
                </ul>

                <h3 className="text-xl font-medium mb-2 mt-4 text-blue-300">Communication</h3>
                <ul className="list-disc pl-6 space-y-1 text-base">
                  <li>Sending service-related notifications</li>
                  <li>Job matching and recommendation notifications</li>
                  <li>Important updates about our platform</li>
                  <li>Marketing communications (with your consent)</li>
                </ul>

                <h3 className="text-xl font-medium mb-2 mt-4 text-blue-300">Legal and Security</h3>
                <ul className="list-disc pl-6 space-y-1 text-base">
                  <li>Verifying user identity and preventing fraud</li>
                  <li>Complying with legal obligations</li>
                  <li>Ensuring platform safety and security</li>
                  <li>Resolving disputes and enforcing our terms</li>
                </ul>
              </section>

              <section>
                <motion.h2 id="legal-basis-for-processing" variants={sectionPop} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }} className="text-2xl font-semibold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-teal-500 scroll-mt-24">4. Legal Basis for Processing</motion.h2>
                <p className="text-base mt-2">
                  We process your personal data based on the following legal grounds:
                </p>
                <ul className="list-disc pl-6 space-y-1 text-base">
                  <li>To provide our services and fulfill our contractual obligations</li>
                  <li>To improve our services, prevent fraud, and ensure platform security</li>
                  <li>For marketing communications and optional features</li>
                  <li>To comply with applicable laws and regulations</li>
                </ul>
              </section>

              <section>
                <motion.h2 id="information-sharing" variants={sectionPop} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }} className="text-2xl font-semibold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-teal-500 scroll-mt-24">5. Information Sharing</motion.h2>
                <p className="text-base mt-2">
                  We do not sell your personal information to third parties. We may share your information in the following circumstances:
                </p>

                <h3 className="text-xl font-medium mb-2 text-blue-300">Between Platform Users</h3>
                <ul className="list-disc pl-6 space-y-1 text-base">
                  <li>Contact information is shared with students after they pay the £1 fee</li>
                  <li>Public profile information visible in job applications</li>
                  <li>Communication through our platform messaging system</li>
                </ul>

                <h3 className="text-xl font-medium mb-2 mt-4 text-blue-300">Service Providers</h3>
                <ul className="list-disc pl-6 space-y-1 text-base">
                  <li>Payment processors (Stripe/PayPal) for transaction processing</li>
                  <li>Email service providers for communications</li>
                  <li>Cloud hosting providers for data storage</li>
                  <li>Analytics providers for platform improvement</li>
                </ul>

                <h3 className="text-xl font-medium mb-2 mt-4 text-blue-300">Legal Requirements</h3>
                <ul className="list-disc pl-6 space-y-1 text-base">
                  <li>Law enforcement agencies when required by law</li>
                  <li>Regulatory authorities for compliance purposes</li>
                  <li>Legal proceedings and dispute resolution</li>
                </ul>
              </section>

              <section>
                <motion.h2 id="data-retention" variants={sectionPop} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }} className="text-2xl font-semibold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-teal-500 scroll-mt-24">6. Data Retention</motion.h2>
                <p className="text-base mt-2">
                  We retain your personal information for as long as necessary to provide our services and comply with legal obligations:
                </p>
                <ul className="list-disc pl-6 space-y-1 text-base">
                  <li>Active accounts: Data retained while your account is active</li>
                  <li>Closed accounts: Data retained for 2 years after account closure</li>
                  <li>Transaction records: Retained for 7 years for tax and legal compliance</li>
                  <li>Job postings: Deleted 60 days after expiry unless required for legal purposes</li>
                </ul>
              </section>

              <section>
                <motion.h2 id="your-rights-under-gdpr" variants={sectionPop} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }} className="text-2xl font-semibold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-teal-500 scroll-mt-24">7. Your Rights Under GDPR</motion.h2>
                <p className="text-base mt-2">
                  You have the following rights regarding your personal data:
                </p>

                <div className="grid md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <h4 className="font-semibold text-base text-gray-50">Access</h4>
                    <p className="text-gray-400 text-base">Request a copy of your personal data</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-base text-gray-50">Rectification</h4>
                    <p className="text-gray-400 text-base">Correct inaccurate personal data</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-base text-gray-50">Erasure</h4>
                    <p className="text-gray-400 text-base">Request deletion of your personal data</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-base text-gray-50">Restriction</h4>
                    <p className="text-gray-400 text-base">Limit how we process your data</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-base text-gray-50">Portability</h4>
                    <p className="text-gray-400 text-base">Transfer your data to another service</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-base text-gray-50">Objection</h4>
                    <p className="text-gray-400 text-base">Object to certain types of processing</p>
                  </div>
                </div>

                <p className="mt-4 text-base">
                  To exercise any of these rights, please contact us at privacy@studentjobs.uk or through your account settings.
                </p>
              </section>

              <section>
                <motion.h2 id="data-security" variants={sectionPop} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }} className="text-2xl font-semibold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-teal-500 scroll-mt-24">8. Data Security</motion.h2>
                <p className="text-base mt-2">
                  We implement appropriate technical and organizational measures to protect your personal information:
                </p>
                <ul className="list-disc pl-6 space-y-1 text-base">
                  <li>Encryption of data in transit and at rest</li>
                  <li>Regular security assessments and updates</li>
                  <li>Access controls and staff training</li>
                  <li>Secure payment processing through certified providers</li>
                  <li>Regular backups and disaster recovery procedures</li>
                </ul>
              </section>

              <section>
                <motion.h2 id="cookies-and-tracking" variants={sectionPop} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }} className="text-2xl font-semibold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-teal-500 scroll-mt-24">9. Cookies and Tracking</motion.h2>
                <p className="text-base mt-2">
                  We use cookies and similar technologies to improve your experience on our platform.
                  Our Cookie Policy provides detailed information about the cookies we use and how to manage your preferences.
                </p>
                <p className="text-base">
                  You can control cookie settings through your browser, but please note that disabling certain cookies may affect platform functionality.
                </p>
              </section>

              <section>
                <motion.h2 id="childrens-privacy" variants={sectionPop} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }} className="text-2xl font-semibold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-teal-500 scroll-mt-24">10. Children's Privacy</motion.h2>
                <p className="text-base mt-2">
                  Our platform is intended for users aged 18 and over. We do not knowingly collect personal information from children under 18.
                  If you believe we have collected information from a child under 18, please contact us immediately.
                </p>
              </section>

              <section>
                <motion.h2 id="international-transfers" variants={sectionPop} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }} className="text-2xl font-semibold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-teal-500 scroll-mt-24">11. International Transfers</motion.h2>
                <p className="text-base mt-2">
                  Your personal data may be transferred to and processed in countries outside the UK. When we do this, we ensure adequate
                  protection through appropriate safeguards such as Standard Contractual Clauses or adequacy decisions.
                </p>
              </section>

              <section>
                <motion.h2 id="updates-to-this-policy" variants={sectionPop} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }} className="text-2xl font-semibold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-teal-500 scroll-mt-24">12. Updates to This Policy</motion.h2>
                <p className="text-base mt-2">
                  We may update this Privacy Policy from time to time. We will notify you of significant changes through email or platform notifications.
                  The "Last updated" date at the top indicates when this policy was last revised.
                </p>
              </section>

              <section>
                <motion.h2 id="contact-information" variants={sectionPop} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }} className="text-2xl font-semibold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-teal-500 scroll-mt-24">13. Contact Information</motion.h2>
                <p className="text-base mt-2">If you have questions about this Privacy Policy or how we handle your personal data, please contact us:</p>
                <div className="bg-gray-800 p-4 rounded-lg mt-4 text-base text-gray-200"> {/* Darkened this info box */}
                  <p>Email: privacy@studentjobs.uk</p>
                  <p>Data Protection Officer: dpo@studentjobs.uk</p>
                  <p>Address: StudentJobs UK Ltd, London, United Kingdom</p>
                </div>
                <p className="mt-4 text-base">
                  You also have the right to lodge a complaint with the Information Commissioner's Office (ICO) if you believe
                  we have not handled your personal data appropriately.
                </p>
              </section>
            </CardContent>
          </Card>
        </div>
      </motion.div>

      {/* Footer (Matching Employer Guide) */}
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