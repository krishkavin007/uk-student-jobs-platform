"use client";

import { useState, useMemo, useEffect, Fragment } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/ui/header";
import { useAuth } from "@/app/context/AuthContext";
import Tilt from "react-parallax-tilt";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  Check,
  UserCheckIcon,
  BriefcaseBusiness,
  GraduationCap,
  Search,
  Handshake,
  DollarSign,
  ShieldCheckIcon,
  HourglassIcon,
  Globe,
  WalletIcon,
  MessageSquare,
  Smartphone,
  RepeatIcon,
  BadgeCent,
  Lightbulb,
  Building2,
  ListPlus,
  Rocket,
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

const cardPop = {
  hidden: { opacity: 0, scale: 0.9, y: 30 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: "spring", stiffness: 50, damping: 15, mass: 0.5 },
  },
};

const featureItemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

export default function HowItWorksPage() {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'student' | 'employer'>('student');

  // Determine the correct pricing href based on user type for the Header and Footer
  const pricingHref =
    user?.user_type === "student" ? "/pricing#student" : "/pricing#employer";

  return (
    <div className="min-h-screen bg-white text-slate-900 dark:bg-gray-950 dark:text-gray-100 font-sans antialiased">
      {/* Header */}
      <Header
        user={user}
        isLoading={isLoading}
        logout={logout}
        pricingHref={pricingHref}
        className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border"
      />

      <motion.main
        variants={pageVariants}
        initial="initial"
        animate="animate"
        className="pt-24 sm:pt-32 pb-20"
      >
        {/* --- Hero Section --- */}
        <motion.section
          variants={containerStagger}
          initial="hidden"
          animate="visible"
          className="text-center px-4 max-w-4xl mx-auto"
        >
          <motion.h1
            variants={titleVariants}
            className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-800 dark:from-blue-400 dark:to-purple-600"
          >
            How StudentJobs UK Works
          </motion.h1>
          <motion.p
            variants={titleVariants}
            className="mt-4 text-lg md:text-xl text-slate-600 dark:text-gray-400 max-w-2xl mx-auto"
          >
            Simple, effective steps to connect UK students with flexible
            part-time jobs.
          </motion.p>
        </motion.section>

        {/* --- Toggle Switch for Student/Employer (Updated Style) --- */}
        <div className="mt-10 flex justify-center items-center space-x-2 p-1.5 bg-slate-200 dark:bg-gray-800 rounded-full w-fit mx-auto shadow-inner">
          <button
            onClick={() => setActiveTab('student')}
            className={`px-6 py-2.5 text-base font-bold rounded-full transition-colors relative ${activeTab === 'student' ? 'text-white' : 'text-slate-600 dark:text-gray-400 hover:text-slate-800 dark:hover:text-gray-200'
              }`}
          >
            {activeTab === 'student' && (
              <motion.div
                layoutId="activeTabIndicator"
                className="absolute inset-0 bg-indigo-600 rounded-full z-0"
                transition={{ type: "spring", stiffness: 350, damping: 30 }}
              />
            )}
            <span className="relative z-10">For Students</span>
          </button>
          <button
            onClick={() => setActiveTab('employer')}
            className={`px-6 py-2.5 text-base font-bold rounded-full transition-colors relative ${activeTab === 'employer' ? 'text-white' : 'text-slate-600 dark:text-gray-400 hover:text-slate-800 dark:hover:text-gray-200'
              }`}
          >
            {activeTab === 'employer' && (
              <motion.div
                layoutId="activeTabIndicator"
                className="absolute inset-0 bg-green-600 rounded-full z-0"
                transition={{ type: "spring", stiffness: 350, damping: 30 }}
              />
            )}
            <span className="relative z-10">For Employers</span>
          </button>
        </div>

        {/* --- Dynamic Content based on Toggle --- */}
        <AnimatePresence mode="wait">
          {activeTab === 'student' && (
            <motion.section
              key="student-content"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="mt-12 max-w-7xl mx-auto px-4"
            >
              <motion.h2
                variants={titleVariants}
                initial="hidden"
                animate="visible"
                className="text-3xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-teal-600 to-green-700 dark:from-teal-400 dark:to-green-500 mb-12"
              >
                For Students: Find Your Perfect Part-Time Role
              </motion.h2>

              <motion.div
                variants={containerStagger}
                initial="hidden"
                animate="visible"
                className="grid gap-8 md:grid-cols-3"
              >
                <motion.div variants={cardPop}>
                  <Tilt glareEnable={true} glareMaxOpacity={0.05} scale={1.02} perspective={1000}>
                    <Card className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6 border border-slate-200 dark:border-gray-800 h-full flex flex-col">
                      <CardHeader className="p-0 text-center">
                        <div className="w-14 h-14 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                          1
                        </div>
                        <CardTitle className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                          Sign Up & Verify
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-0 text-center flex-grow">
                        <p className="text-slate-600 dark:text-gray-400 text-sm">
                          Create your account using your university email address
                          (.ac.uk) and verify your phone number. This ensures you're
                          a genuine student.
                        </p>
                      </CardContent>
                    </Card>
                  </Tilt>
                </motion.div>

                <motion.div variants={cardPop}>
                  <Tilt glareEnable={true} glareMaxOpacity={0.05} scale={1.02} perspective={1000}>
                    <Card className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6 border border-slate-200 dark:border-gray-800 h-full flex flex-col">
                      <CardHeader className="p-0 text-center">
                        <div className="w-14 h-14 bg-purple-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                          2
                        </div>
                        <CardTitle className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                          Browse & Filter
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-0 text-center flex-grow">
                        <p className="text-slate-600 dark:text-gray-400 text-sm">
                          Search through hundreds of part-time jobs. Filter by
                          location, category, and work period (term-time vs
                          holidays) to find opportunities that fit your schedule.
                        </p>
                      </CardContent>
                    </Card>
                  </Tilt>
                </motion.div>

                <motion.div variants={cardPop}>
                  <Tilt glareEnable={true} glareMaxOpacity={0.05} scale={1.02} perspective={1000}>
                    <Card className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6 border border-slate-200 dark:border-gray-800 h-full flex flex-col">
                      <CardHeader className="p-0 text-center">
                        <div className="w-14 h-14 bg-indigo-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                          3
                        </div>
                        <CardTitle className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                          Apply for £1
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-0 text-center flex-grow">
                        <p className="text-slate-600 dark:text-gray-400 text-sm">
                          Found a job you like? Pay just £1 to reveal the employer's
                          contact details and apply directly. Your payment ensures
                          serious applications.
                        </p>
                      </CardContent>
                    </Card>
                  </Tilt>
                </motion.div>
              </motion.div>

              {/* Student FAQ */}
              <section className="mt-16 max-w-5xl mx-auto px-4">
                <motion.h2
                  variants={titleVariants}
                  initial="hidden"
                  animate="visible"
                  className="text-3xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-pink-600 to-red-700 dark:from-pink-400 dark:to-red-500 mb-12"
                >
                  Student FAQs
                </motion.h2>

                <div className="space-y-6">
                  {[
                    {
                      title: "Why do I need to pay £1 to apply?",
                      content:
                        "The £1 fee ensures that only serious and genuinely interested students reveal contact details. This protects both students from spam listings and employers from receiving uncommitted applications, ensuring higher quality engagements.",
                    },
                    {
                      title: "Can I get a refund for a job application?",
                      content:
                        "Yes, refunds are available if a job posting is found to be fraudulent, the contact information is incorrect, or the position was already filled at the time of your application. Please refer to our Refund Policy for full details.",
                    },
                    {
                      title: "How is my student status verified?",
                      content:
                        "Students verify their status by signing up with their official university email address (.ac.uk). We also implement phone number verification for enhanced account security and authenticity.",
                    },
                    {
                      title: "What if an employer doesn't respond?",
                      content:
                        "While we encourage employers to respond within 48 hours, direct responses are at their discretion. If you encounter consistent issues or suspect a fraudulent listing, please report it to our support team.",
                    },
                  ].map((faq, idx) => (
                    <motion.div
                      key={idx}
                      variants={cardPop}
                      initial="hidden"
                      whileInView="visible"
                      viewport={{ once: true, amount: 0.5 }}
                      className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-md border border-slate-200 dark:border-gray-800"
                    >
                      <CardHeader className="p-0 mb-3">
                        <CardTitle className="text-xl font-bold text-slate-900 dark:text-white">
                          {faq.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-0">
                        <p className="text-slate-600 dark:text-gray-300 text-base">{faq.content}</p>
                      </CardContent>
                    </motion.div>
                  ))}
                </div>
              </section>
            </motion.section>
          )}

          {activeTab === 'employer' && (
            <motion.section
              key="employer-content"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="mt-12 max-w-7xl mx-auto px-4"
            >
              <motion.h2
                variants={titleVariants}
                initial="hidden"
                animate="visible"
                className="text-3xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-red-600 to-orange-700 dark:from-red-400 dark:to-orange-500 mb-12"
              >
                For Employers: Recruit Ideal Part-Time Talent
              </motion.h2>

              <motion.div
                variants={containerStagger}
                initial="hidden"
                animate="visible"
                className="grid gap-8 md:grid-cols-3"
              >
                <motion.div variants={cardPop}>
                  <Tilt glareEnable={true} glareMaxOpacity={0.05} scale={1.02} perspective={1000}>
                    <Card className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6 border border-slate-200 dark:border-gray-800 h-full flex flex-col">
                      <CardHeader className="p-0 text-center">
                        <div className="w-14 h-14 bg-yellow-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                          1
                        </div>
                        <CardTitle className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                          Post Your Job
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-0 text-center flex-grow">
                        <p className="text-slate-600 dark:text-gray-400 text-sm">
                          Create an account and post your part-time job vacancy.
                          Choose between a Basic (£1) or Sponsored (£5) listing for
                          enhanced visibility.
                        </p>
                      </CardContent>
                    </Card>
                  </Tilt>
                </motion.div>

                <motion.div variants={cardPop}>
                  <Tilt glareEnable={true} glareMaxOpacity={0.05} scale={1.02} perspective={1000}>
                    <Card className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6 border border-slate-200 dark:border-gray-800 h-full flex flex-col">
                      <CardHeader className="p-0 text-center">
                        <div className="w-14 h-14 bg-green-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                          2
                        </div>
                        <CardTitle className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                          Reach UK Students
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-0 text-center flex-grow">
                        <p className="text-slate-600 dark:text-gray-400 text-sm">
                          Your job goes live to thousands of verified UK university
                          students actively seeking flexible work to fit their
                          studies.
                        </p>
                      </CardContent>
                    </Card>
                  </Tilt>
                </motion.div>

                <motion.div variants={cardPop}>
                  <Tilt glareEnable={true} glareMaxOpacity={0.05} scale={1.02} perspective={1000}>
                    <Card className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6 border border-slate-200 dark:border-gray-800 h-full flex flex-col">
                      <CardHeader className="p-0 text-center">
                        <div className="w-14 h-14 bg-cyan-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                          3
                        </div>
                        <CardTitle className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                          Receive Applications
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-0 text-center flex-grow">
                        <p className="text-slate-600 dark:text-gray-400 text-sm">
                          Interested students pay a small fee to access your contact
                          details, ensuring you receive applications from serious
                          and motivated candidates.
                        </p>
                      </CardContent>
                    </Card>
                  </Tilt>
                </motion.div>
              </motion.div>

              {/* Employer FAQ */}
              <section className="mt-16 max-w-5xl mx-auto px-4">
                <motion.h2
                  variants={titleVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.5 }}
                  className="text-3xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-pink-600 to-red-700 dark:from-pink-400 dark:to-red-500 mb-12"
                >
                  Employer FAQs
                </motion.h2>

                <div className="space-y-6">
                  {[
                    {
                      title: "How do employers post jobs?",
                      content:
                        "Employers can create an account and post a job directly through our platform. They choose between a Basic (£1) or Sponsored (£5) listing, which is active for 30 or 45 days respectively.",
                    },
                    {
                      title: "Are all jobs part-time?",
                      content:
                        "Our platform primarily focuses on part-time and flexible opportunities tailored for students. While some listings might offer full-time options during holidays, the core emphasis is on roles that fit around academic commitments.",
                    },
                    {
                      title: "What is a 'Sponsored' listing?",
                      content:
                        "A Sponsored listing (for £5) provides enhanced visibility for your job post, appearing higher in search results and receiving more prominence, which can lead to a quicker response from qualified students.",
                    },
                    {
                      title: "How do I receive student applications?",
                      content:
                        "Students who are interested in your job listing will pay a small fee to unlock your contact details, allowing them to apply directly to you via your preferred contact method (e.g., email, phone, application link).",
                    },
                  ].map((faq, idx) => (
                    <motion.div
                      key={idx}
                      variants={cardPop}
                      initial="hidden"
                      whileInView="visible"
                      viewport={{ once: true, amount: 0.5 }}
                      className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-md border border-slate-200 dark:border-gray-800"
                    >
                      <CardHeader className="p-0 mb-3">
                        <CardTitle className="text-xl font-bold text-slate-900 dark:text-white">
                          {faq.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-0">
                        <p className="text-slate-600 dark:text-gray-300 text-base">{faq.content}</p>
                      </CardContent>
                    </motion.div>
                  ))}
                </div>
              </section>
            </motion.section>
          )}
        </AnimatePresence>

        {/* --- Key Benefits Section (Applies to both, general value proposition) --- */}
        <section className="mt-16 sm:mt-24 max-w-7xl mx-auto px-4">
          <motion.h2
            variants={titleVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.5 }}
            className="text-3xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-800 dark:from-blue-400 dark:to-purple-500 mb-12"
          >
            Why Choose StudentJobs UK?
          </motion.h2>

          <motion.div
            variants={containerStagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            <motion.div variants={cardPop}>
              <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-md border border-slate-200 dark:border-gray-800 h-full flex flex-col">
                <div className="flex items-center justify-center w-12 h-12 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 rounded-full mb-4">
                  <GraduationCap className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                  Student-Centric
                </h3>
                <p className="text-slate-600 dark:text-gray-400 text-sm">
                  Jobs are curated to respect student working hour limits (20 hrs
                  term-time, 40 hrs holidays), offering flexible opportunities.
                </p>
              </div>
            </motion.div>
            <motion.div variants={cardPop}>
              <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-md border border-slate-200 dark:border-gray-800 h-full flex flex-col">
                <div className="flex items-center justify-center w-12 h-12 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 rounded-full mb-4">
                  <ShieldCheckIcon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                  Verified & Quality
                </h3>
                <p className="text-slate-600 dark:text-gray-400 text-sm">
                  All employers are verified, and job postings are moderated to
                  ensure legitimacy and a high standard of opportunities.
                </p>
              </div>
            </motion.div>
            <motion.div variants={cardPop}>
              <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-md border border-slate-200 dark:border-gray-800 h-full flex flex-col">
                <div className="flex items-center justify-center w-12 h-12 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 rounded-full mb-4">
                  <BadgeCent className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                  Cost-Effective Access
                </h3>
                <p className="text-slate-600 dark:text-gray-400 text-sm">
                  Students pay just £1 per application, and employers £1-£5 per
                  post, making it affordable for everyone.
                </p>
              </div>
            </motion.div>
            <motion.div variants={cardPop}>
              <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-md border border-slate-200 dark:border-gray-800 h-full flex flex-col">
                <div className="flex items-center justify-center w-12 h-12 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 rounded-full mb-4">
                  <Handshake className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                  Direct Connections
                </h3>
                <p className="text-slate-600 dark:text-gray-400 text-sm">
                  Students connect directly with employers, eliminating middlemen
                  and speeding up the hiring process.
                </p>
              </div>
            </motion.div>
            <motion.div variants={cardPop}>
              <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-md border border-slate-200 dark:border-gray-800 h-full flex flex-col">
                <div className="flex items-center justify-center w-12 h-12 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 rounded-full mb-4">
                  <Globe className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                  UK-Wide Reach
                </h3>
                <p className="text-slate-600 dark:text-gray-400 text-sm">
                  Connecting students and employers across the United Kingdom,
                  providing a broad range of opportunities.
                </p>
              </div>
            </motion.div>
            <motion.div variants={cardPop}>
              <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-md border border-slate-200 dark:border-gray-800 h-full flex flex-col">
                <div className="flex items-center justify-center w-12 h-12 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 rounded-full mb-4">
                  <Lightbulb className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                  Innovation in Hiring
                </h3>
                <p className="text-slate-600 dark:text-gray-400 text-sm">
                  We streamline the part-time job market, making it easier for
                  students to find work and businesses to find student talent.
                </p>
              </div>
            </motion.div>
          </motion.div>
        </section>

        {/* --- Work Hour Guidelines (Student-focused, but broadly informative) --- */}
        <section className="mt-16 sm:mt-24 max-w-5xl mx-auto px-4">
          <motion.h2
            variants={titleVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.5 }}
            className="text-3xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-yellow-600 to-orange-700 dark:from-yellow-400 dark:to-orange-500 mb-12"
          >
            Understanding Student Work Hours
          </motion.h2>

          <motion.div
            variants={cardPop}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-slate-200 dark:border-gray-800 p-8 grid md:grid-cols-2 gap-8"
          >
            <div>
              <h3 className="font-bold text-2xl text-blue-600 dark:text-blue-400 mb-4 flex items-center gap-3">
                <HourglassIcon className="h-7 w-7 text-blue-600 dark:text-blue-400" /> During Term-Time
              </h3>
              <ul className="space-y-3 text-slate-600 dark:text-gray-300 text-base">
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-1" />
                  <span>Maximum 20 hours per week.</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-1" />
                  <span>Ideal for weekend and evening shifts.</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-1" />
                  <span>Flexible scheduling around your lectures.</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-1" />
                  <span>Perfect for ongoing, consistent commitments.</span>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-2xl text-purple-600 dark:text-purple-400 mb-4 flex items-center gap-3">
                <RepeatIcon className="h-7 w-7 text-purple-600 dark:text-purple-400" /> During University Holidays
              </h3>
              <ul className="space-y-3 text-slate-600 dark:text-gray-300 text-base">
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-1" />
                  <span>Up to 40 hours per week (full-time).</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-1" />
                  <span>Great for intensive work periods and higher earning.</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-1" />
                  <span>Includes summer breaks, Easter, and Christmas holidays.</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-1" />
                  <span>Opportunities for seasonal and project-based work.</span>
                </li>
              </ul>
            </div>
          </motion.div>
        </section>

        {/* --- CTA Section --- */}
        <section className="bg-slate-100 dark:bg-gray-900 rounded-2xl shadow-lg border border-slate-200 dark:border-gray-800 max-w-7xl mx-auto py-16 px-4 text-center mt-20">
          <motion.div
            variants={containerStagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <motion.h2
              variants={titleVariants}
              className="text-3xl sm:text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-800 dark:from-blue-400 dark:to-purple-500 mb-4"
            >
              Ready to Connect with Student Talent?
            </motion.h2>
            <motion.p
              variants={titleVariants}
              className="text-slate-600 dark:text-gray-300 text-lg mb-10 max-w-2xl mx-auto"
            >
              Whether you're a student looking for flexible work or an employer
              seeking bright, motivated part-time staff, StudentJobs UK is for you.
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
                <Link href={activeTab === 'student' ? "/signup" : "/post-job"} className="flex items-center justify-center">
                  <span>{activeTab === 'student' ? "Get Started Now" : "Post a Job Today"}</span>{" "}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="w-full sm:w-auto h-14 px-8 text-base border-2 border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-transparent hover:bg-indigo-100 dark:hover:bg-indigo-900/50 hover:text-indigo-700 dark:hover:text-white font-bold rounded-full shadow-lg transform hover:scale-105 transition-transform"
              >
                <Link href="/browse-jobs">Browse Latest Jobs</Link>
              </Button>
            </motion.div>
          </motion.div>
        </section>
      </motion.main>
    </div>
  );
}