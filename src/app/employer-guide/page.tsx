// src/app/employer-guide/page.tsx
"use client";

import Link from "next/link";
import { useState, useMemo, useEffect, Fragment } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/ui/header";
import { ContactModal } from "@/components/ui/contact-modal";
import { useAuth } from "@/app/context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";

// Import all necessary Lucide icons for consistency
import {
  ArrowRight,
  Check, // Used for custom list styling
  BriefcaseBusiness, // For 'Why Hire Students?' section
  Scale, // For 'Legal Requirements' section
  FileText, // For 'Creating Effective Job Posts' section
  Users, // For 'Interviewing Students' section
  Handshake, // For 'Managing Student Employees' section
  Smartphone, // For 'Platform Features' section
  // HeartHandshake, // No longer needed as Success Stories is removed
} from "lucide-react";

// --- Animation Variants ---
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

// Component for custom list items (reused from student-guide)
const ListItem = ({ children }: { children: React.ReactNode }) => (
  <div className="flex items-start gap-2 text-base text-gray-300">
    <Check className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5" />
    <span>{children}</span>
  </div>
);

export default function EmployerGuidePage() {
  const { user, isLoading: authLoading, logout } = useAuth();

  const pricingHref = user?.user_type === "student" ? "/pricing#student" : "/pricing#employer";

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 font-sans antialiased">
      <Header
        user={user}
        isLoading={authLoading}
        logout={logout}
        pricingHref={pricingHref}
        className="fixed top-0 left-0 right-0 z-50 bg-gray-900/80 backdrop-blur-md border-b border-gray-800 text-gray-100"
      />

      <motion.main
        variants={pageVariants}
        initial="initial"
        animate="animate"
        className="pt-24 sm:pt-32 pb-20"
      >
        <motion.div
          variants={containerStagger}
          initial="hidden"
          animate="visible"
          className="container mx-auto px-4 py-1 max-w-6xl"
        >
          <div className="text-center mb-12">
            <motion.h1
              variants={titleVariants}
              className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-teal-600 mb-4 leading-[1.7] py-2"
            >
              Employer Guide
            </motion.h1>
            <motion.p
              variants={titleVariants}
              className="mt-4 text-lg md:text-xl text-gray-400 max-w-2xl mx-auto"
            >
              Everything you need to know about hiring students successfully
            </motion.p>
          </div>

          {/* Benefits of Hiring Students */}
          <motion.section variants={sectionPop} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }} className="mb-16 bg-gray-900 rounded-2xl shadow-lg p-6 md:p-8 border border-gray-800">
            <h2 className="text-3xl md:text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500 mb-8 text-center md:text-left flex items-center gap-3">
              <BriefcaseBusiness className="h-8 w-8 text-blue-400 flex-shrink-0" /> Why Hire Students?
            </h2>
            <div className="grid gap-8 md:grid-cols-2">
              <div className="bg-gray-950 rounded-xl p-4 border border-gray-800">
                <h3 className="text-lg font-semibold mb-3 text-green-400">Advantages</h3>
                <div className="space-y-2">
                  <ListItem>Flexible availability: Evenings, weekends, holidays</ListItem>
                  <ListItem>Motivated workforce: Students need income and experience</ListItem>
                  <ListItem>Fresh perspectives: Up-to-date skills and enthusiasm</ListItem>
                  <ListItem>Tech-savvy: Comfortable with digital tools and social media</ListItem>
                  <ListItem>Quick learners: Used to acquiring new knowledge rapidly</ListItem>
                  <ListItem>Cost-effective: Part-time roles with competitive wages</ListItem>
                </div>
              </div>

              <div className="bg-gray-950 rounded-xl p-4 border border-gray-800">
                <h3 className="text-lg font-semibold mb-3 text-purple-400">Best Fit Roles</h3>
                <div className="space-y-2">
                  <ListItem>Customer service and retail</ListItem>
                  <ListItem>Hospitality and food service</ListItem>
                  <ListItem>Administrative support</ListItem>
                  <ListItem>Tutoring and education</ListItem>
                  <ListItem>Event assistance</ListItem>
                  <ListItem>Digital marketing and social media</ListItem>
                  <ListItem>Data entry and research</ListItem>
                  <ListItem>Delivery and logistics</ListItem>
                </div>
              </div>
            </div>
          </motion.section>

          {/* Legal Requirements */}
          <motion.section variants={sectionPop} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }} className="mb-16 bg-gray-850 rounded-2xl shadow-md p-6 md:p-8 border border-gray-700">
            <h2 className="text-3xl md:text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-red-500 mb-8 text-center md:text-left flex items-center gap-3">
              <Scale className="h-8 w-8 text-orange-400 flex-shrink-0" /> Legal Requirements & Compliance
            </h2>
            <div className="space-y-8">
              <div>
                <h3 className="text-lg font-semibold mb-3 text-red-400">Student Work Hour Limits</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-300 mb-2">UK/EU Students</h4>
                    <ul className="list-none space-y-1 text-blue-200 text-base">
                      <ListItem>No restrictions on working hours</ListItem>
                      <ListItem>Can work anytime during studies</ListItem>
                      <ListItem>Full employment rights</ListItem>
                    </ul>
                  </div>
                  <div className="bg-amber-900/20 border border-amber-700 rounded-lg p-4">
                    <h4 className="font-semibold text-amber-300 mb-2">International Students</h4>
                    <ul className="list-none space-y-1 text-amber-200 text-base">
                      <ListItem>Max 20 hours during term-time</ListItem>
                      <ListItem>Up to 40 hours during holidays</ListItem>
                      <ListItem>Must check visa conditions</ListItem>
                    </ul>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3 text-green-400">Employment Essentials</h3>
                <div className="space-y-2">
                  <ListItem>Minimum Wage: £10.42/hour (18-20), £11.44/hour (21+)</ListItem>
                  <ListItem>Right to Work: Check passport, visa, or settled status</ListItem>
                  <ListItem>Employment Contract: Written terms within 2 months</ListItem>
                  <ListItem>Health & Safety: Provide safe working environment</ListItem>
                  <ListItem>Breaks: 20 minutes for 6+ hour shifts</ListItem>
                  <ListItem>Holiday Pay: 5.6 weeks pro-rata for part-time workers</ListItem>
                </div>
              </div>

              <div className="bg-red-900/20 border border-red-700 rounded-xl p-4">
                <h4 className="font-semibold text-red-300 mb-2">Important:</h4>
                <p className="text-red-200 text-base">
                  Always verify a student's right to work in the UK before employment. International students
                  must not exceed their visa work hour limits as this can affect their immigration status.
                </p>
              </div>
            </div>
          </motion.section>

          {/* Creating Effective Job Posts */}
          <motion.section variants={sectionPop} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }} className="mb-16 bg-gray-900 rounded-3xl shadow-2xl p-6 md:p-8 border-t-4 border-indigo-600 border-l border-r border-b border-gray-800">
            <h2 className="text-3xl md:text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-orange-500 mb-8 text-center md:text-left flex items-center gap-3">
              <FileText className="h-8 w-8 text-yellow-400 flex-shrink-0" /> Writing Effective Job Posts
            </h2>
            <div className="space-y-8">
              <div>
                <h3 className="text-lg font-semibold mb-3 text-orange-400">Essential Information to Include</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <h4 className="font-medium mb-2 text-white">Job Details</h4>
                    <div className="space-y-1">
                      <ListItem>Clear, descriptive job title</ListItem>
                      <ListItem>Specific duties and responsibilities</ListItem>
                      <ListItem>Required skills and experience</ListItem>
                      <ListItem>Training provided (if any)</ListItem>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2 text-white">Practical Information</h4>
                    <div className="space-y-1">
                      <ListItem>Exact location or area</ListItem>
                      <ListItem>Hours per week and shift patterns</ListItem>
                      <ListItem>Hourly wage (at least minimum wage)</ListItem>
                      <ListItem>Start date and duration</ListItem>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3 text-teal-400">Student-Friendly Language</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="bg-green-900/20 border border-green-700 rounded-xl p-4">
                    <h4 className="font-medium text-green-300 mb-2">✓ Good Examples</h4>
                    <div className="space-y-1">
                      <ListItem>&#34;Flexible hours to fit around studies&#34;</ListItem>
                      <ListItem>&#34;Perfect for students&#34;</ListItem>
                      <ListItem>&#34;Weekend and evening shifts available&#34;</ListItem>
                      <ListItem>&#34;Understanding of academic schedules&#34;</ListItem>
                      <ListItem>&#34;Term-time or holiday work&#34;</ListItem>
                    </div>
                  </div>
                  <div className="bg-red-900/20 border border-red-700 rounded-xl p-4">
                    <h4 className="font-medium text-red-300 mb-2">✗ Avoid</h4>
                    <div className="space-y-1">
                      <ListItem>&#34;Must be available 9-5 weekdays&#34;</ListItem>
                      <ListItem>&#34;Full-time commitment required&#34;</ListItem>
                      <ListItem>&#34;No academic commitments&#34;</ListItem>
                      <ListItem>&#34;Must prioritize work over studies&#34;</ListItem>
                      <ListItem>Unclear or misleading job descriptions</ListItem>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-green-900/20 border border-green-700 rounded-xl p-4">
                <h4 className="font-semibold text-green-300 mb-2">Pro Tip:</h4>
                <p className="text-green-200 text-base">
                  Mention if you offer flexible scheduling around exams, understanding of academic priorities,
                  or opportunities for skill development. Students value employers who respect their education.
                </p>
              </div>
            </div>
          </motion.section>

          {/* Interviewing Students */}
          <motion.section variants={sectionPop} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }} className="mb-16 bg-gradient-to-br from-gray-900 to-gray-950 rounded-2xl p-6 md:p-8 shadow-inner border border-gray-800">
            <h2 className="text-3xl md:text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500 mb-8 text-center md:text-left flex items-center gap-3">
              <Users className="h-8 w-8 text-cyan-400 flex-shrink-0" /> Interviewing & Selecting Students
            </h2>
            <div className="space-y-8">
              <div>
                <h3 className="text-lg font-semibold mb-3 text-cyan-400">Interview Best Practices</h3>
                <div className="space-y-2">
                  <ListItem>Be flexible with timing: Offer evening or weekend interviews</ListItem>
                  <ListItem>Ask about availability: Understand their academic calendar</ListItem>
                  <ListItem>Focus on potential: Many students lack work experience</ListItem>
                  <ListItem>Assess soft skills: Reliability, communication, willingness to learn</ListItem>
                  <ListItem>Explain the role clearly: Set realistic expectations</ListItem>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3 text-pink-400">Key Questions to Ask</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <h4 className="font-medium mb-2 text-white">Availability & Commitment</h4>
                    <div className="space-y-1">
                      <ListItem>&#34;What&#39;s your weekly availability?&#34;</ListItem>
                      <ListItem>&#34;How do your lectures/seminars fit?&#34;</ListItem>
                      <ListItem>&#34;When are your exam periods?&#34;</ListItem>
                      <ListItem>&#34;How long can you commit to this role?&#34;</ListItem>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2 text-white">Motivation & Skills</h4>
                    <div className="space-y-1">
                      <ListItem>&#34;Why do you want this particular job?&#34;</ListItem>
                      <ListItem>&#34;How will you balance work and studies?&#34;</ListItem>
                      <ListItem>&#34;Tell me about a challenge you overcame&#34;</ListItem>
                      <ListItem>&#34;What skills from your course apply here?&#34;</ListItem>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3 text-red-400">Red Flags to Watch For</h3>
                <div className="space-y-2">
                  <ListItem>Unrealistic availability (claiming 40+ hours during term-time)</ListItem>
                  <ListItem>No consideration of academic commitments</ListItem>
                  <ListItem>Multiple job applications without research</ListItem>
                  <ListItem>Inability to explain how they&#39;ll manage time</ListItem>
                  <ListItem>Poor communication or unprofessional approach</ListItem>
                </div>
              </div>
            </div>
          </motion.section>

          {/* Managing Student Employees */}
          <motion.section variants={sectionPop} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }} className="mb-16 bg-gray-850 rounded-lg shadow-lg p-6 md:p-8 border border-gray-750">
            <h2 className="text-3xl md:text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-indigo-500 mb-8 text-center md:text-left flex items-center gap-3">
              <Handshake className="h-8 w-8 text-purple-400 flex-shrink-0" /> Managing Student Employees
            </h2>
            <div className="space-y-8">
              <div>
                <h3 className="text-lg font-semibold mb-3 text-indigo-400">Setting Up for Success</h3>
                <div className="space-y-2">
                  <ListItem>Clear expectations: Define roles, responsibilities, and standards</ListItem>
                  <ListItem>Flexible scheduling: Work around academic calendars</ListItem>
                  <ListItem>Proper training: Invest time in onboarding and skill development</ListItem>
                  <ListItem>Regular check-ins: Monitor performance and provide feedback</ListItem>
                  <ListItem>Academic respect: Prioritize their education when conflicts arise</ListItem>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3 text-red-400">Common Challenges & Solutions</h3>
                <div className="space-y-4">
                  <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
                    <h4 className="font-medium mb-2 text-white">Challenge: Exam periods and coursework deadlines</h4>
                    <p className="text-gray-300 text-base">
                      Solution: Build flexibility into your roster. Allow reduced hours during
                      exam periods and be understanding about academic priorities.
                    </p>
                  </div>

                  <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
                    <h4 className="font-medium mb-2 text-white">Challenge: High turnover at graduation</h4>
                    <p className="text-gray-300 text-base">
                      Solution: Maintain good relationships with universities and continuously
                      recruit. Consider offering references and career advice to departing students.
                    </p>
                  </div>

                  <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
                    <h4 className="font-medium mb-2 text-white">Challenge: Varying experience levels</h4>
                    <p className="text-gray-300 text-base">
                      Solution: Create comprehensive training programs and pair new students
                      with experienced staff. Focus on transferable skills development.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3 text-green-400">Retaining Good Student Employees</h3>
                <div className="space-y-2">
                  <ListItem>Offer competitive wages and regular reviews</ListItem>
                  <ListItem>Provide opportunities for skill development</ListItem>
                  <ListItem>Recognize and reward good performance</ListItem>
                  <ListItem>Be understanding about academic commitments</ListItem>
                  <ListItem>Offer flexible contracts and holiday work</ListItem>
                  <ListItem>Write references and LinkedIn recommendations</ListItem>
                </div>
              </div>
            </div>
          </motion.section>

          {/* Platform Features for Employers */}
          <motion.section variants={sectionPop} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }} className="mb-16 bg-gray-900 rounded-2xl shadow-lg p-6 md:p-8 border border-gray-800">
            <h2 className="text-3xl md:text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-teal-500 mb-8 text-center md:text-left flex items-center gap-3">
              <Smartphone className="h-8 w-8 text-blue-400 flex-shrink-0" /> Making the Most of StudentJobs UK
            </h2>
            <div className="space-y-8">
              <div>
                <h3 className="text-lg font-semibold mb-3 text-teal-400">Sponsored vs Basic Listings</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="bg-gray-950 rounded-lg p-4 border border-gray-800">
                    <h4 className="font-medium mb-2 text-white">Basic Listing (£1)</h4>
                    <p className="text-base text-gray-400 mb-2">Best for:</p>
                    <div className="space-y-1">
                      <ListItem>Simple, straightforward roles</ListItem>
                      <ListItem>Local businesses with specific location requirements</ListItem>
                      <ListItem>When you have time to wait for applications</ListItem>
                    </div>
                  </div>

                  <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-4">
                    <h4 className="font-medium mb-2 text-blue-300">Sponsored Listing (£5)</h4>
                    <p className="text-base text-gray-300 mb-2">Best for:</p>
                    <div className="space-y-1">
                      <ListItem>Urgent hiring needs</ListItem>
                      <ListItem>Competitive job markets</ListItem>
                      <ListItem>Premium or higher-paying roles</ListItem>
                      <ListItem>When you want maximum visibility</ListItem>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3 text-purple-400">Platform Features</h3>
                <div className="space-y-2">
                  <ListItem>Direct contact: Students pay £1 to access your details, ensuring serious applications</ListItem>
                  <ListItem>Verified students: All users confirm their student status</ListItem>
                  <ListItem>Edit anytime: Update job details or requirements as needed</ListItem>
                  <ListItem>30-day visibility: Jobs remain active for a full month</ListItem>
                  <ListItem>Application tracking: See how many students have viewed/applied</ListItem>
                  <ListItem>Support system: Report any issues or inappropriate applications</ListItem>
                </div>
              </div>
            </div>
          </motion.section>

          {/* CTA */}
          <section className="bg-gray-900 rounded-2xl shadow-lg border border-gray-800 py-16 px-4 text-center mt-20">
            <motion.div
              variants={containerStagger}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <motion.h2
                variants={titleVariants}
                className="text-3xl sm:text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-teal-500 mb-4"
              >
                Ready to Hire Your First Student?
              </motion.h2>
              <motion.p
                variants={titleVariants}
                className="text-gray-300 text-lg mb-10 max-w-2xl mx-auto"
              >
                Join hundreds of UK employers finding great student talent
              </motion.p>
              <motion.div
                variants={titleVariants}
                className="flex flex-col sm:flex-row gap-4 justify-center"
              >
                <Button
                  asChild
                  size="lg"
                  className="w-full sm:w-auto h-14 px-8 text-base bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-full shadow-lg transform hover:scale-105 transition-transform"
                >
                  <Link href="/post-job" className="flex items-center justify-center">
                    <span>Post Your First Job</span> <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto h-14 px-8 text-base border-2 border-indigo-600 text-indigo-400 bg-transparent hover:bg-indigo-900/50 hover:text-white font-bold rounded-full shadow-lg transform hover:scale-105 transition-transform"
                >
                  <Link href={pricingHref}>View Pricing</Link>
                </Button>
              </motion.div>
            </motion.div>
          </section>
        </motion.div>
      </motion.main>

      {/* Footer (Copied directly from student-guide for consistency) */}
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
  );
}