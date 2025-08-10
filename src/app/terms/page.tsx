// src/app/terms/page.tsx
"use client"; // <-- ADD THIS LINE AT THE VERY TOP

import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Header } from "@/components/ui/header" // Correctly imported
// Removed ContactModal import; global footer handles contact
import { useAuth } from "@/app/context/AuthContext"; // Import useAuth hook
import { motion } from "framer-motion"; // Import motion

// --- Animation Variants (Copied from Privacy Policy for consistency) ---
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

// Variants for TOC links
const tocLinkVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
};

export default function TermsPage() {
  const { user, isLoading: authLoading, logout } = useAuth(); // Now correctly called on the client

  // Determine the correct pricing href based on user type for the Header and Footer
  const pricingHref = user?.user_type === "student" ? "/pricing#student" : "/pricing#employer";

  // Define the table of contents data for Terms & Conditions
  const tableOfContents = [
    { title: "1. Introduction", id: "introduction" },
    { title: "2. Definitions", id: "definitions" },
    { title: "3. Eligibility and Account Registration", id: "eligibility-and-registration" },
    { title: "4. Platform Usage", id: "platform-usage" },
    { title: "5. Job Postings and Applications", id: "job-postings-applications" },
    { title: "6. Payment Terms", id: "payment-terms" },
    { title: "7. Content and Intellectual Property", id: "content-ip" },
    { title: "8. Privacy and Data Protection", id: "privacy-data-protection" },
    { title: "9. Platform Availability and Modifications", id: "platform-availability" },
    { title: "10. Disclaimers and Limitation of Liability", id: "disclaimers-liability" },
    { title: "11. Indemnification", id: "indemnification" },
    { title: "12. Termination", id: "termination" },
    { title: "13. Dispute Resolution", id: "dispute-resolution" },
    { title: "14. Changes to Terms", id: "changes-to-terms" },
    { title: "15. Contact Information", id: "contact-information" },
    { title: "16. Entire Agreement", id: "entire-agreement" },
  ];

  return (
    <div className="min-h-screen bg-zinc-50 text-gray-900 dark:bg-gray-950 dark:text-gray-100 font-sans antialiased scroll-smooth">
      {/* Header */}
      <Header user={user} isLoading={authLoading} logout={logout} pricingHref={pricingHref} className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-zinc-200 text-gray-900 dark:bg-gray-900 dark:border-gray-800 dark:text-gray-100" />

      <motion.div
        variants={pageVariants}
        initial="initial"
        animate="animate"
        className="container mx-auto px-4 py-8 max-w-screen-xl pt-24 sm:pt-32 pb-24 md:pb-16" // breathing space above global footer
      >
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8"> {/* Grid layout for two columns */}

          {/* Left Sidebar - Table of Contents (visible on large screens) */}
          <motion.nav
            variants={containerStagger}
            initial="hidden"
            animate="visible"
            className="lg:sticky lg:top-24 lg:h-fit mb-10 p-6 bg-white text-gray-900 rounded-lg border border-zinc-200 shadow-lg hidden lg:block dark:bg-gray-900 dark:text-gray-100 dark:border-gray-800" // Hidden on small, sticky on large
          >
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">On this page</h2>
            <ul className="space-y-2">
              {tableOfContents.map((item) => (
                <motion.li key={item.id} variants={tocLinkVariants}>
                  <Link
                    href={`#${item.id}`}
                    className="text-zinc-600 hover:text-blue-700 hover:underline transition-colors duration-200 text-base block dark:text-gray-300 dark:hover:text-blue-400"
                    scroll={true} // Ensure smooth scrolling
                  >
                    {item.title}
                  </Link>
                </motion.li>
              ))}
            </ul>
          </motion.nav>

          {/* Main Content - Terms & Conditions Card */}
          <Card className="bg-white border border-zinc-200 text-gray-900 dark:bg-gray-900 dark:border-gray-800 dark:text-gray-100">
            <CardHeader>
              <motion.h1
                variants={titleVariants}
                className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-purple-800 dark:from-blue-400 dark:to-purple-500 mb-2 py-2"
              >
                Terms & Conditions
              </motion.h1>
              <motion.p variants={titleVariants} className="text-zinc-600 dark:text-gray-400 text-lg">Last updated: July 24, 2025</motion.p>
            </CardHeader>
            <CardContent className="space-y-6 text-zinc-700 dark:text-gray-300"> {/* Adjusted text color */}

              {/* Table of Contents (visible on small/medium screens, hidden on large) */}
              <motion.nav
                variants={containerStagger}
                initial="hidden"
                animate="visible"
                className="mb-10 p-6 bg-zinc-100 text-gray-900 rounded-lg border border-zinc-200 shadow-inner lg:hidden dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700" // Hidden on large
              >
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">On this page</h2>
                <ul className="space-y-2">
                  {tableOfContents.map((item) => (
                    <motion.li key={item.id} variants={tocLinkVariants}>
                      <Link
                        href={`#${item.id}`}
                        className="text-zinc-600 hover:text-blue-700 hover:underline transition-colors duration-200 text-base block dark:text-gray-300 dark:hover:text-blue-400"
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
                  Welcome to StudentJobs UK. These Terms and Conditions ("Terms") govern your use of our platform and services.
                  By accessing or using StudentJobs UK, you agree to be bound by these Terms.
                </p>
                <p className="text-base">
                  StudentJobs UK is operated by StudentJobs UK Ltd, a company registered in England and Wales.
                  These Terms constitute a legally binding agreement between you and us.
                </p>
              </section>

              <section>
                <motion.h2 id="definitions" variants={sectionPop} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }} className="text-2xl font-semibold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-teal-500 scroll-mt-24">2. Definitions</motion.h2>
                <ul className="list-disc pl-6 space-y-1 text-base">
                  <li>"Platform" refers to the StudentJobs UK website and mobile applications</li>
                  <li>"User" refers to any person who accesses or uses our Platform</li>
                  <li>"Student" refers to users seeking part-time employment opportunities</li>
                  <li>"Employer" refers to users posting job opportunities</li>
                  <li>"Job Posting" refers to employment opportunities listed on our Platform</li>
                  <li>"Services" refers to all features and functionality provided through our Platform</li>
                </ul>
              </section>

              <section>
                <motion.h2 id="eligibility-and-registration" variants={sectionPop} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }} className="text-2xl font-semibold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-teal-500 scroll-mt-24">3. Eligibility and Account Registration</motion.h2>

                <h3 className="text-xl font-medium mb-2 text-blue-700 mt-4 dark:text-blue-300">General Eligibility</h3>
                <ul className="list-disc pl-6 space-y-1 text-base">
                  <li>You must be at least 18 years old to use our Platform</li>
                  <li>You must be legally authorized to work in the UK</li>
                  <li>You must provide accurate and complete information during registration</li>
                  <li>You are responsible for maintaining the security of your account</li>
                </ul>

                <h3 className="text-xl font-medium mb-2 mt-4 text-blue-700 dark:text-blue-300">Student Accounts</h3>
                <ul className="list-disc pl-6 space-y-1 text-base">
                  <li>Must be enrolled in a recognized UK educational institution</li>
                  <li>Must verify student status through .ac.uk email address or other acceptable proof</li>
                  <li>Must provide accurate university/college information</li>
                </ul>

                <h3 className="text-xl font-medium mb-2 mt-4 text-blue-700 dark:text-blue-300">Employer Accounts</h3>
                <ul className="list-disc pl-6 space-y-1 text-base">
                  <li>Must represent a legitimate business or organization</li>
                  <li>Must have legal authority to post job opportunities</li>
                  <li>Must comply with UK employment laws and regulations</li>
                </ul>

                <h3 className="text-xl font-medium mb-2 mt-4 text-blue-700 dark:text-blue-300">Verification Requirements</h3>
                <ul className="list-disc pl-6 space-y-1 text-base">
                  <li>All users must verify their email address and phone number</li>
                  <li>We reserve the right to request additional verification documents</li>
                  <li>Accounts that fail verification may be suspended or terminated</li>
                </ul>
              </section>

              <section>
                <motion.h2 id="platform-usage" variants={sectionPop} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }} className="text-2xl font-semibold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-teal-500 scroll-mt-24">4. Platform Usage</motion.h2>

                <h3 className="text-xl font-medium mb-2 text-blue-700 dark:text-blue-300">Permitted Uses</h3>
                <ul className="list-disc pl-6 space-y-1 text-base">
                  <li>Searching and applying for legitimate part-time job opportunities</li>
                  <li>Posting genuine job vacancies for part-time positions</li>
                  <li>Communicating with other users through our Platform</li>
                  <li>Managing your account and profile information</li>
                </ul>

                <h3 className="text-xl font-medium mb-2 mt-4 text-blue-700 dark:text-blue-300">Prohibited Activities</h3>
                <ul className="list-disc pl-6 space-y-1 text-base">
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
                <motion.h2 id="job-postings-applications" variants={sectionPop} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }} className="text-2xl font-semibold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-teal-500 scroll-mt-24">5. Job Postings and Applications</motion.h2>

                <h3 className="text-xl font-medium mb-2 text-blue-700 dark:text-blue-300">Employer Responsibilities</h3>
                <ul className="list-disc pl-6 space-y-1 text-base">
                  <li>Ensure all job postings are accurate and current</li>
                  <li>Comply with UK employment laws, including minimum wage requirements</li>
                  <li>Provide safe and legal working conditions</li>
                  <li>Respond to applications in a timely and professional manner</li>
                  <li>Remove or update job postings when positions are filled</li>
                </ul>

                <h3 className="text-xl font-medium mb-2 mt-4 text-blue-700 dark:text-blue-300">Student Responsibilities</h3>
                <ul className="list-disc pl-6 space-y-1 text-base">
                  <li>Provide accurate information in applications and profiles</li>
                  <li>Be professional in all communications with employers</li>
                  <li>Honor commitments made to employers</li>
                  <li>Report any inappropriate or illegal job postings</li>
                </ul>

                <h3 className="text-xl font-medium mb-2 mt-4 text-blue-700 dark:text-blue-300">Job Posting Guidelines</h3>
                <ul className="list-disc pl-6 space-y-1 text-base">
                  <li>All positions must be for legitimate part-time work</li>
                  <li>Must comply with UK minimum wage laws (currently £10.42/hour)</li>
                  <li>Must not discriminate based on protected characteristics</li>
                  <li>Must not involve adult content, gambling, or illegal activities</li>
                  <li>Must provide clear job descriptions and requirements</li>
                </ul>
              </section>

              <section>
                <motion.h2 id="payment-terms" variants={sectionPop} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }} className="text-2xl font-semibold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-teal-500 scroll-mt-24">6. Payment Terms</motion.h2>

                <h3 className="text-xl font-medium mb-2 text-blue-700 dark:text-blue-300">Employer Payments</h3>
                <ul className="list-disc pl-6 space-y-1 text-base">
                  <li>Basic Job Posting: £1.00 per job posting, valid for 30 days</li>
                  <li>Sponsored Job Posting: £5.00 per job posting with enhanced visibility</li>
                  <li>All payments are due at the time of job posting</li>
                  <li>Payments are non-refundable except as outlined in our Refund Policy</li>
                </ul>

                <h3 className="text-xl font-medium mb-2 mt-4 text-blue-700 dark:text-blue-300">Student Payments</h3>
                <ul className="list-disc pl-6 space-y-1 text-base">
                  <li>Contact Information Access: £1.00 per job application</li>
                  <li>Payment grants access to employer contact details</li>
                  <li>No additional charges for applying to jobs</li>
                  <li>Refunds available only in exceptional circumstances</li>
                </ul>

                <h3 className="text-xl font-medium mb-2 mt-4 text-blue-700 dark:text-blue-300">Payment Processing</h3>
                <ul className="list-disc pl-6 space-y-1 text-base">
                  <li>All payments processed through secure third-party providers (Stripe/PayPal)</li>
                  <li>We do not store payment card information</li>
                  <li>Transaction receipts provided via email</li>
                  <li>All prices include applicable VAT</li>
                </ul>
              </section>

              <section>
                <motion.h2 id="content-ip" variants={sectionPop} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }} className="text-2xl font-semibold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-teal-500 scroll-mt-24">7. Content and Intellectual Property</motion.h2>

                <h3 className="text-xl font-medium mb-2 text-blue-700 dark:text-blue-300">User Content</h3>
                <ul className="list-disc pl-6 space-y-1 text-base">
                  <li>You retain ownership of content you post on our Platform</li>
                  <li>You grant us a license to use, display, and distribute your content</li>
                  <li>You are responsible for ensuring your content doesn't infringe third-party rights</li>
                  <li>We may remove content that violates these Terms</li>
                </ul>

                <h3 className="text-xl font-medium mb-2 mt-4 text-blue-700 dark:text-blue-300">Platform Content</h3>
                <ul className="list-disc pl-6 space-y-1 text-base">
                  <li>All Platform features, design, and code are our intellectual property</li>
                  <li>You may not copy, modify, or distribute our Platform content</li>
                  <li>Our trademarks and logos are protected by intellectual property law</li>
                </ul>
              </section>

              <section>
                <motion.h2 id="privacy-data-protection" variants={sectionPop} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }} className="text-2xl font-semibold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-teal-500 scroll-mt-24">8. Privacy and Data Protection</motion.h2>
                <p className="text-base">
                  Your privacy is important to us. Our Privacy Policy explains how we collect, use, and protect your personal information.
                  By using our Platform, you agree to our data practices as described in the Privacy Policy.
                </p>
                <p className="text-base">
                  We comply with UK GDPR and Data Protection Act 2018. You have rights regarding your personal data,
                  including the right to access, correct, or delete your information.
                </p>
              </section>

              <section>
                <motion.h2 id="platform-availability" variants={sectionPop} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }} className="text-2xl font-semibold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-teal-500 scroll-mt-24">9. Platform Availability and Modifications</motion.h2>
                <ul className="list-disc pl-6 space-y-1 text-base">
                  <li>We strive to maintain Platform availability but cannot guarantee 100% uptime</li>
                  <li>We may temporarily suspend the Platform for maintenance or updates</li>
                  <li>We reserve the right to modify, update, or discontinue features</li>
                  <li>We will provide reasonable notice of significant changes</li>
                </ul>
              </section>

              <section>
                <motion.h2 id="disclaimers-liability" variants={sectionPop} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }} className="text-2xl font-semibold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-teal-500 scroll-mt-24">10. Disclaimers and Limitation of Liability</motion.h2>

                <h3 className="text-xl font-medium mb-2 text-blue-700 dark:text-blue-300">Platform Disclaimers</h3>
                <ul className="list-disc pl-6 space-y-1 text-base">
                  <li>We provide the Platform "as is" without warranties of any kind</li>
                  <li>We do not guarantee the accuracy of job postings or user information</li>
                  <li>We are not responsible for the actions of employers or students</li>
                  <li>We do not guarantee job placement or hiring outcomes</li>
                </ul>

                <h3 className="text-xl font-medium mb-2 mt-4 text-blue-700 dark:text-blue-300">Limitation of Liability</h3>
                <p className="text-base">
                  To the maximum extent permitted by law, our liability is limited to the amount you have paid to us in the
                  12 months preceding the claim. We are not liable for indirect, incidental, or consequential damages.
                </p>
              </section>

              <section>
                <motion.h2 id="indemnification" variants={sectionPop} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }} className="text-2xl font-semibold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-teal-500 scroll-mt-24">11. Indemnification</motion.h2>
                <p className="text-base">
                  You agree to indemnify and hold us harmless from any claims, damages, or expenses arising from your use of
                  the Platform, violation of these Terms, or infringement of any third-party rights.
                </p>
              </section>

              <section>
                <motion.h2 id="termination" variants={sectionPop} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }} className="text-2xl font-semibold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-teal-500 scroll-mt-24">12. Termination</motion.h2>

                <h3 className="text-xl font-medium mb-2 text-blue-700 dark:text-blue-300">Your Right to Terminate</h3>
                <ul className="list-disc pl-6 space-y-1 text-base">
                  <li>You may terminate your account at any time through your account settings</li>
                  <li>Termination does not entitle you to refunds of fees already paid</li>
                  <li>You remain responsible for any outstanding obligations</li>
                </ul>

                <h3 className="text-xl font-medium mb-2 mt-4 text-blue-700 dark:text-blue-300">Our Right to Terminate</h3>
                <ul className="list-disc pl-6 space-y-1 text-base">
                  <li>We may suspend or terminate accounts that violate these Terms</li>
                  <li>We may terminate accounts for fraudulent or illegal activity</li>
                  <li>We may terminate or modify services with reasonable notice</li>
                </ul>
              </section>

              <section>
                <motion.h2 id="dispute-resolution" variants={sectionPop} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }} className="text-2xl font-semibold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-teal-500 scroll-mt-24">13. Dispute Resolution</motion.h2>
                <p className="text-base">
                  Any disputes arising from these Terms or your use of the Platform will be governed by English law and
                  subject to the exclusive jurisdiction of the English courts.
                </p>
                <p className="text-base">
                  We encourage users to first contact our support team to resolve any issues before pursuing legal action.
                </p>
              </section>

              <section>
                <motion.h2 id="changes-to-terms" variants={sectionPop} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }} className="text-2xl font-semibold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-teal-500 scroll-mt-24">14. Changes to Terms</motion.h2>
                <p className="text-base">
                  We may update these Terms from time to time. Significant changes will be communicated through email or
                  Platform notifications. Continued use of the Platform after changes constitutes acceptance of the new Terms.
                </p>
              </section>

              <section>
                <motion.h2 id="contact-information" variants={sectionPop} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }} className="text-2xl font-semibold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-teal-500 scroll-mt-24">15. Contact Information</motion.h2>
                <p className="text-base">If you have questions about these Terms, please contact us:</p>
                <div className="bg-zinc-100 border border-zinc-200 p-4 rounded-lg mt-4 text-base text-gray-900 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200"> {/* Info box theme-aware */}
                  <p>Email: legal@studentjobs.uk</p>
                  <p>Support: support@studentjobs.uk</p>
                  <p>Address: StudentJobs UK Ltd, London, United Kingdom</p>
                </div>
              </section>

              <section>
                <motion.h2 id="entire-agreement" variants={sectionPop} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }} className="text-2xl font-semibold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-teal-500 scroll-mt-24">16. Entire Agreement</motion.h2>
                <p className="text-base">
                  These Terms, together with our Privacy Policy and Refund Policy, constitute the entire agreement between
                  you and StudentJobs UK regarding your use of the Platform.
                </p>
              </section>
            </CardContent>
          </Card>
        </div>
      </motion.div>

      {/* Global footer is included via RootLayout */}
    </div>
  )
}