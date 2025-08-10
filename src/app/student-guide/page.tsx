"use client";

import Link from "next/link";
import { useState, useMemo, useEffect, Fragment } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/ui/header";
import { useAuth } from "@/app/context/AuthContext";
import Tilt from "react-parallax-tilt";
import { motion, AnimatePresence } from "framer-motion";

// Import all necessary Lucide icons for consistency
import {
  ArrowRight,
  Check, // Used for custom list styling
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
  PlaneTakeoff,
  BookOpen,
  Laptop,
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

// Component for custom list items
const ListItem = ({ children }: { children: React.ReactNode }) => (
  <div className="flex items-start gap-2 text-base text-zinc-600 dark:text-gray-300">
    <Check className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
    <span>{children}</span>
  </div>
);


export default function StudentGuidePage() {
  const { user, isLoading: authLoading, logout } = useAuth();

  const pricingHref = user?.user_type === "student" ? "/pricing#student" : "/pricing#employer";

  return (
    <div className="min-h-screen bg-zinc-50 text-gray-900 font-sans antialiased dark:bg-gray-950 dark:text-gray-100">
      <Header
        user={user}
        isLoading={authLoading}
        logout={logout}
        pricingHref={pricingHref}
        className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-zinc-200 text-gray-900 dark:bg-gray-900/80 dark:border-gray-800 dark:text-gray-100"
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
              className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-800 dark:from-blue-400 dark:to-purple-600 mb-4"
            >
              Student Guide
            </motion.h1>
            <motion.p
              variants={titleVariants}
              className="mt-4 text-lg md:text-xl text-zinc-600 dark:text-gray-400 max-w-2xl mx-auto"
            >
              Everything you need to know about working while studying in the UK
            </motion.p>
          </div>

          {/* Legal Requirements */}
          <motion.section variants={sectionPop} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }} className="mb-16 bg-white rounded-2xl shadow-lg p-6 md:p-8 border border-zinc-200 dark:bg-gray-900 dark:border-gray-800">
            <h2 className="text-3xl md:text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-700 dark:from-blue-400 dark:to-purple-500 mb-8 text-center md:text-left">
              Legal Requirements & Work Rights
            </h2>
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <div className="bg-zinc-50 rounded-xl p-4 border border-zinc-200 dark:bg-gray-950 dark:border-gray-800">
                <h3 className="text-lg font-semibold mb-3 text-blue-600 dark:text-blue-400">UK/EU Students</h3>
                <div className="space-y-2 text-zinc-600 dark:text-gray-300">
                  <ListItem>No restrictions on working hours</ListItem>
                  <ListItem>Can work during term-time and holidays</ListItem>
                  <ListItem>Entitled to minimum wage (£10.42/hour for 18+)</ListItem>
                  <ListItem>Need National Insurance number for employment</ListItem>
                </div>
              </div>

              <div className="bg-zinc-50 rounded-xl p-4 border border-zinc-200 dark:bg-gray-950 dark:border-gray-800">
                <h3 className="text-lg font-semibold mb-3 text-purple-600 dark:text-purple-400">International Students (Tier 4/Student Visa)</h3>
                <div className="space-y-2 text-zinc-600 dark:text-gray-300">
                  <ListItem>Maximum 20 hours per week during term-time</ListItem>
                  <ListItem>Can work full-time (40 hours) during official university holidays</ListItem>
                  <ListItem>Must have &#34;work permitted&#34; stamp in passport or visa</ListItem>
                  <ListItem>e-Visa Share Code: Required for employers to verify your right to work</ListItem>
                  <ListItem>Generate your share code at <Link href="https://www.gov.uk/prove-right-to-work" className="text-blue-500 hover:underline">gov.uk/prove-right-to-work</Link></ListItem>
                  <ListItem>Cannot be self-employed or start a business</ListItem>
                  <ListItem>Some restrictions on certain job types (entertainers, professional sports)</ListItem>
                </div>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 dark:bg-amber-900/20 dark:border-amber-700">
              <h4 className="font-semibold text-amber-800 dark:text-amber-300 mb-2">Important:</h4>
              <p className="text-amber-700 dark:text-amber-200 text-base">
                Always check your specific visa conditions. Working more than permitted hours can affect your visa status and future applications.
              </p>
            </div>
          </motion.section>

          {/* Job Search Tips */}
          <motion.section variants={sectionPop} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }} className="mb-16 bg-white rounded-2xl shadow-md p-6 md:p-8 border border-zinc-200 dark:bg-gray-900 dark:border-gray-800">
            <h2 className="text-3xl md:text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-green-600 to-teal-700 dark:from-green-400 dark:to-teal-500 mb-8 text-center md:text-left">
              Job Search Tips
            </h2>
            <div className="grid gap-8 md:grid-cols-2">
              <div>
                <h3 className="text-lg font-semibold mb-3 text-green-600 dark:text-green-400">Building Your Profile</h3>
                <div className="space-y-2 border-l-2 border-green-500 pl-4 text-zinc-600 dark:text-gray-300">
                  <ListItem>Use a professional email address</ListItem>
                  <ListItem>Include your university and course</ListItem>
                  <ListItem>Mention your availability clearly</ListItem>
                  <ListItem>Be honest about your schedule</ListItem>
                  <ListItem>Proofread your application documents carefully</ListItem>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3 text-red-600 dark:text-red-400">Finding the Right Jobs</h3>
                <div className="space-y-2 border-l-2 border-red-500 pl-4 text-zinc-600 dark:text-gray-300">
                  <ListItem>Filter by location to save commute time</ListItem>
                  <ListItem>Look for &#34;student-friendly&#34; employers</ListItem>
                  <ListItem>Consider jobs near your university</ListItem>
                  <ListItem>Check work hours fit your timetable</ListItem>
                  <ListItem>Read job descriptions carefully</ListItem>
                </div>
              </div>
            </div>
          </motion.section>

          {/* Popular Student Jobs */}
          <motion.section variants={sectionPop} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }} className="mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-orange-600 to-red-700 dark:from-orange-400 dark:to-red-500 mb-8 text-center md:text-left">
              Popular Student Jobs
            </h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <Link href="/browse-jobs">
                <Tilt glareEnable={true} glareMaxOpacity={0.05} scale={1.02} perspective={1000} className="cursor-pointer">
                  <div className="bg-white rounded-xl p-4 border border-zinc-200 h-full dark:bg-gray-900 dark:border-gray-800">
                    <h3 className="font-semibold mb-2 text-gray-900 dark:text-white">Hospitality</h3>
                    <p className="text-base text-zinc-600 dark:text-gray-400 mb-2">Restaurants, cafes, pubs</p>
                    <div className="space-y-1 text-zinc-600 dark:text-gray-300">
                      <ListItem>Flexible evening/weekend shifts</ListItem>
                      <ListItem>Tips supplement wages</ListItem>
                      <ListItem>Great for social skills</ListItem>
                    </div>
                  </div>
                </Tilt>
              </Link>

              <Link href="/browse-jobs">
                <Tilt glareEnable={true} glareMaxOpacity={0.05} scale={1.02} perspective={1000} className="cursor-pointer">
                  <div className="bg-white rounded-xl p-4 border border-zinc-200 h-full dark:bg-gray-900 dark:border-gray-800">
                    <h3 className="font-semibold mb-2 text-gray-900 dark:text-white">Retail</h3>
                    <p className="text-base text-zinc-600 dark:text-gray-400 mb-2">Shops, supermarkets</p>
                    <div className="space-y-1 text-zinc-600 dark:text-gray-300">
                      <ListItem>Weekend and evening availability</ListItem>
                      <ListItem>Customer service experience</ListItem>
                      <ListItem>Often hiring during busy periods</ListItem>
                    </div>
                  </div>
                </Tilt>
              </Link>

              <Link href="/browse-jobs">
                <Tilt glareEnable={true} glareMaxOpacity={0.05} scale={1.02} perspective={1000} className="cursor-pointer">
                  <div className="bg-white rounded-xl p-4 border border-zinc-200 h-full dark:bg-gray-900 dark:border-gray-800">
                    <h3 className="font-semibold mb-2 text-gray-900 dark:text-white">Tutoring</h3>
                    <p className="text-base text-zinc-600 dark:text-gray-400 mb-2">Private or through agencies</p>
                    <div className="space-y-1 text-zinc-600 dark:text-gray-300">
                      <ListItem>Higher hourly rates (£15-25)</ListItem>
                      <ListItem>Flexible scheduling</ListItem>
                      <ListItem>Use your academic strengths</ListItem>
                    </div>
                  </div>
                </Tilt>
              </Link>

              <Link href="/browse-jobs">
                <Tilt glareEnable={true} glareMaxOpacity={0.05} scale={1.02} perspective={1000} className="cursor-pointer">
                  <div className="bg-white rounded-xl p-4 border border-zinc-200 h-full dark:bg-gray-900 dark:border-gray-800">
                    <h3 className="font-semibold mb-2 text-gray-900 dark:text-white">Campus Jobs</h3>
                    <p className="text-base text-zinc-600 dark:text-gray-400 mb-2">University employment</p>
                    <div className="space-y-1 text-zinc-600 dark:text-gray-300">
                      <ListItem>No commute required</ListItem>
                      <ListItem>Understanding of student needs</ListItem>
                      <ListItem>Academic support roles</ListItem>
                    </div>
                  </div>
                </Tilt>
              </Link>

              <Link href="/browse-jobs">
                <Tilt glareEnable={true} glareMaxOpacity={0.05} scale={1.02} perspective={1000} className="cursor-pointer">
                  <div className="bg-white rounded-xl p-4 border border-zinc-200 h-full dark:bg-gray-900 dark:border-gray-800">
                    <h3 className="font-semibold mb-2 text-gray-900 dark:text-white">Delivery Work</h3>
                    <p className="text-base text-zinc-600 dark:text-gray-400 mb-2">Food delivery, couriers</p>
                    <div className="space-y-1 text-zinc-600 dark:text-gray-300">
                      <ListItem>Flexible hours</ListItem>
                      <ListItem>Exercise while working</ListItem>
                      <ListItem>Peak time bonuses</ListItem>
                    </div>
                  </div>
                </Tilt>
              </Link>

              <Link href="/browse-jobs">
                <Tilt glareEnable={true} glareMaxOpacity={0.05} scale={1.02} perspective={1000} className="cursor-pointer">
                  <div className="bg-white rounded-xl p-4 border border-zinc-200 h-full dark:bg-gray-900 dark:border-gray-800">
                    <h3 className="font-semibold mb-2 text-gray-900 dark:text-white">Admin Support</h3>
                    <p className="text-base text-zinc-600 dark:text-gray-400 mb-2">Office assistance</p>
                    <div className="space-y-1 text-zinc-600 dark:text-gray-300">
                      <ListItem>Professional environment</ListItem>
                      <ListItem>Transferable skills</ListItem>
                      <ListItem>Often part-time friendly</ListItem>
                    </div>
                  </div>
                </Tilt>
              </Link>
            </div>
          </motion.section>

          {/* Money Management */}
          <motion.section variants={sectionPop} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }} className="mb-16 bg-white rounded-3xl shadow-2xl p-6 md:p-8 border-t-4 border-indigo-600 border-l border-r border-b border-zinc-200 dark:bg-gray-900 dark:border-gray-800">
            <h2 className="text-3xl md:text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-yellow-600 to-orange-700 dark:from-yellow-400 dark:to-orange-500 mb-8 text-center md:text-left">
              Money Management & Tax
            </h2>
            <div className="space-y-8">
              <div>
                <h3 className="text-lg font-semibold mb-3 text-orange-600 dark:text-orange-400">Understanding Your Pay</h3>
                <div className="space-y-2 text-zinc-600 dark:text-gray-300">
                  <ListItem>Minimum Wage: £10.42/hour (18-20), £11.44/hour (21+)</ListItem>
                  <ListItem>National Insurance: Paid automatically if earning over £12,570/year</ListItem>
                  <ListItem>Income Tax: Only pay if earning over £12,570/year</ListItem>
                  <ListItem>Emergency Tax: May apply initially - claim back if overpaid</ListItem>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3 text-teal-600 dark:text-teal-400">Tax Tips for Students</h3>
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 space-y-2 dark:bg-green-900/20 dark:border-green-700">
                  <ListItem>Get a National Insurance number before starting work</ListItem>
                  <ListItem>Keep payslips for tax records</ListItem>
                  <ListItem>You can claim back overpaid tax at year-end</ListItem>
                  <ListItem>Part-time earnings rarely exceed tax threshold</ListItem>
                  <ListItem>Use HMRC&#39;s income tax calculator to estimate take-home pay</ListItem>
                </div>
              </div>
            </div>
          </motion.section>

          {/* Balancing Work and Studies */}
          <motion.section variants={sectionPop} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }} className="mb-16 bg-gradient-to-br from-white to-zinc-50 rounded-2xl p-6 md:p-8 shadow-inner border border-zinc-200 dark:from-gray-900 dark:to-gray-950 dark:border-gray-800">
            <h2 className="text-3xl md:text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-cyan-600 to-blue-700 dark:from-cyan-400 dark:to-blue-500 mb-8 text-center md:text-left">
              Balancing Work and Studies
            </h2>
            <div className="grid gap-8 md:grid-cols-2">
              <div>
                <h3 className="text-lg font-semibold mb-3 text-cyan-600 dark:text-cyan-400">Time Management</h3>
                <div className="space-y-2 text-zinc-600 dark:text-gray-300">
                  <ListItem>Plan your schedule in advance</ListItem>
                  <ListItem>Block out study time and stick to it</ListItem>
                  <ListItem>Use breaks between lectures for work</ListItem>
                  <ListItem>Communicate your availability clearly</ListItem>
                  <ListItem>Don&#39;t overcommit - start with fewer hours</ListItem>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3 text-pink-600 dark:text-pink-400">Academic Priorities</h3>
                <div className="space-y-2 text-zinc-600 dark:text-gray-300">
                  <ListItem>Studies should always come first</ListItem>
                  <ListItem>Reduce work hours during exams</ListItem>
                  <ListItem>Find understanding employers</ListItem>
                  <ListItem>Use work to develop transferable skills</ListItem>
                  <ListItem>Consider how work complements your studies</ListItem>
                </div>
              </div>
            </div>

            <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-4 dark:bg-blue-900/20 dark:border-blue-700">
              <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">Recommended Schedule:</h4>
              <p className="text-base text-blue-700 dark:text-blue-200">
                Most students find 10-15 hours per week during term-time manageable. This allows for study time,
                social activities, and rest while earning useful income.
              </p>
            </div>
          </motion.section>

          {/* Safety and Rights */}
          <motion.section variants={sectionPop} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }} className="mb-16 bg-white rounded-lg shadow-lg p-6 md:p-8 border border-zinc-200 dark:bg-gray-900 dark:border-gray-800">
            <h2 className="text-3xl md:text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-700 dark:from-purple-400 dark:to-indigo-500 mb-8 text-center md:text-left">
              Workplace Rights & Safety
            </h2>
            <div className="space-y-8">
              <div>
                <h3 className="text-lg font-semibold mb-3 text-indigo-600 dark:text-indigo-400">Your Rights as a Worker</h3>
                <div className="space-y-2 text-zinc-600 dark:text-gray-300">
                  <ListItem>Right to minimum wage</ListItem>
                  <ListItem>Rest breaks (20 minutes if working 6+ hours)</ListItem>
                  <ListItem>Safe working environment</ListItem>
                  <ListItem>Protection from discrimination</ListItem>
                  <ListItem>Paid holiday entitlement (pro-rata)</ListItem>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3 text-red-600 dark:text-red-400">Red Flags to Avoid</h3>
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 space-y-2 dark:bg-red-900/20 dark:border-red-700">
                  <ListItem>Jobs requiring upfront payments</ListItem>
                  <ListItem>Employers asking for bank details before job offer</ListItem>
                  <ListItem>&#34;Too good to be true&#34; high pay for easy work</ListItem>
                  <ListItem>Pressure to work excessive hours</ListItem>
                  <ListItem>No proper employment contract</ListItem>
                </div>
              </div>
            </div>
          </motion.section>


          {/* CTA */}
          <section className="bg-white rounded-2xl shadow-lg border border-zinc-200 py-16 px-4 text-center mt-20 dark:bg-gray-900 dark:border-gray-800">
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
                Ready to Start Working?
              </motion.h2>
              <motion.p
                variants={titleVariants}
                className="text-zinc-600 dark:text-gray-300 text-lg mb-10 max-w-2xl mx-auto"
              >
                Find student-friendly employers who understand your schedule
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
                  <Link href="/browse-jobs" className="flex items-center justify-center">
                    <span>Browse Jobs</span> <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto h-14 px-8 text-base border-2 border-indigo-600 text-indigo-600 bg-transparent hover:bg-indigo-50 hover:text-indigo-700 font-bold rounded-full shadow-lg transform hover:scale-105 transition-transform dark:text-indigo-400 dark:bg-transparent dark:hover:bg-indigo-900/50 dark:hover:text-white"
                >
                  <Link href="/signup">Create Account</Link>
                </Button>
              </motion.div>
            </motion.div>
          </section>
        </motion.div>
      </motion.main>
    </div>
  )
}