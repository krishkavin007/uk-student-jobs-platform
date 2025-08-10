// src/app/about/page.tsx
"use client"; // This directive is crucial for using hooks like useAuth

import { useAuth } from "@/app/context/AuthContext"; // Import the useAuth hook
import { Button } from "@/components/ui/button";
import { Header } from "@/components/ui/header"; // Import your global Header component
import { ContactModal } from "@/components/ui/contact-modal"; // Import ContactModal
import Tilt from "react-parallax-tilt"; // For subtle 3D tilt effects
import { motion, AnimatePresence } from "framer-motion"; // For advanced animations
import {
  ArrowRight, Check, X,
  UserCheckIcon, DollarSign, ShieldCheckIcon, RocketIcon, MegaphoneIcon, UsersRoundIcon,
  WalletIcon, HourglassIcon, ScaleIcon, HandshakeIcon, RepeatIcon, Target, MessageCircleMore
} from "lucide-react"; // Icons

// --- Animation Variants ---
const pageVariants = {
  initial: { opacity: 1, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } },
};

const containerStagger = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05, delayChildren: 0.1 },
  },
};

const titleVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.4, 0.0, 0.2, 1] as const } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" as const } },
};

const cardPop = { // This variant name is kept for consistency with framer-motion setup
  hidden: { opacity: 0, scale: 0.85, y: 50 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: "spring" as const, stiffness: 80, damping: 15, mass: 0.6 },
  },
};

export default function AboutPage() {
  const { user, isLoading, logout } = useAuth();

  const pricingHref = user?.user_type === "student" ? "/pricing#student" : "/pricing#employer";

  return (
    <motion.div
      className="min-h-screen bg-white text-slate-900 dark:bg-gray-950 dark:text-zinc-50 font-sans antialiased relative overflow-hidden"
      variants={pageVariants}
      initial="initial"
      animate="animate"
    >
      {/* Subtle background gradient overlay for depth */}
      <div className="absolute inset-0 z-0 opacity-10">
        <div className="w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-200 via-zinc-50 to-zinc-50 dark:from-zinc-800 dark:via-zinc-950 dark:to-zinc-950"></div>
      </div>

      {/* Conditional Header Rendering: Show placeholder if loading, else show actual Header */}
      {isLoading ? (
        // Placeholder for the Header - Renders immediately with a matching style
        <div className="fixed top-0 left-0 right-0 z-50 h-20 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 shadow-lg flex items-center px-4">
          <div className="animate-pulse flex items-center justify-between w-full max-w-5xl mx-auto">
            <div className="h-6 w-24 bg-zinc-300 dark:bg-zinc-700 rounded-md"></div> {/* Placeholder for logo */}
            <div className="flex space-x-4">
              <div className="h-6 w-16 bg-zinc-300 dark:bg-zinc-700 rounded-md"></div>
              <div className="h-6 w-16 bg-zinc-300 dark:bg-zinc-700 rounded-md"></div>
              <div className="h-6 w-20 bg-zinc-300 dark:bg-zinc-700 rounded-md"></div>
            </div>
          </div>
        </div>
      ) : (
        <Header
          user={user}
          logout={logout}
          isLoading={isLoading} // This will now be false when Header renders
          pricingHref={pricingHref}
          className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-50 shadow-lg"/>
      )}

      <div className="container mx-auto px-4 py-8 max-w-5xl pt-28 sm:pt-36 relative z-10">
        {/* Hero Section */}
        <motion.div
          className="text-center mb-20 relative"
          variants={containerStagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          <motion.h1
            variants={titleVariants}
            className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-teal-700 dark:from-blue-400 dark:to-teal-500 mb-6 drop-shadow-md dark:drop-shadow-[0_0_8px_rgba(0,255,255,0.4)]"
          >
            About StudentJobs UK
          </motion.h1>
        </motion.div>

        {/* Mission Section (already a distinct block) */}
        <motion.div
          variants={containerStagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          <div className="mb-20 p-10 bg-gradient-to-br from-zinc-100/80 to-zinc-50/80 dark:from-zinc-900/80 dark:to-zinc-950/80 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-2xl backdrop-blur-sm relative overflow-hidden">
            <div className="absolute inset-0 bg-blue-500 opacity-5 blur-3xl"></div>
            <motion.div variants={cardPop} className="relative z-10">
              <h2 className="text-4xl text-center text-zinc-900 dark:text-zinc-50 font-bold mb-6 tracking-tight">Our Mission</h2>
              <motion.p variants={itemVariants} className="text-xl text-zinc-600 dark:text-zinc-300 leading-relaxed text-center max-w-4xl mx-auto">
                Our core mission is to empower UK students by connecting them with flexible,
                meaningful part-time employment that seamlessly integrates with their academic journey.
                We strive to create an equitable, transparent, and efficient marketplace that respects
                student commitments and provides employers with access to a vibrant, motivated talent pool.
              </motion.p>
            </motion.div>
          </div>
        </motion.div>

        {/* The Problem We Solve Section - Changed to open lists */}
        <div // Changed from motion.div to div
          className="mb-20"
          // variants={containerStagger} // Removed
          // initial="hidden" // Removed
          // whileInView="visible" // Removed
          // viewport={{ once: true, amount: 0.5 }} // Removed
        >
          <motion.h2 variants={titleVariants} className="text-4xl font-bold text-center text-zinc-900 dark:text-zinc-50 mb-12">The Problem We Solve</motion.h2>

          <div className="grid gap-10 md:grid-cols-2">
            {/* For Students Block - Less boxed */}
            <motion.div variants={itemVariants} className="p-8"> {/* Removed bg, border, shadow from here */}
              <h3 className="text-2xl text-red-600 dark:text-red-400 font-semibold mb-6 flex items-center gap-3">
                <Target className="h-7 w-7 text-red-600 dark:text-red-500" /> For Students
              </h3>
              <motion.ul variants={containerStagger} className="space-y-4 text-zinc-600 dark:text-zinc-300 text-lg">
                <motion.li variants={itemVariants} className="flex items-start">
                  <X className="h-6 w-6 mr-3 mt-1 text-red-500 flex-shrink-0" /> Expensive job board subscriptions
                </motion.li>
                <motion.li variants={itemVariants} className="flex items-start">
                  <X className="h-6 w-6 mr-3 mt-1 text-red-500 flex-shrink-0" /> Jobs that don't respect academic schedules
                </motion.li>
                <motion.li variants={itemVariants} className="flex items-start">
                  <X className="h-6 w-6 mr-3 mt-1 text-red-500 flex-shrink-0" /> Complex application processes
                </motion.li>
                <motion.li variants={itemVariants} className="flex items-start">
                  <X className="h-6 w-6 mr-3 mt-1 text-red-500 flex-shrink-0" /> Competition with full-time job seekers
                </motion.li>
                <motion.li variants={itemVariants} className="flex items-start">
                  <X className="h-6 w-6 mr-3 mt-1 text-red-500 flex-shrink-0" /> Unclear work hour requirements
                </motion.li>
                <motion.li variants={itemVariants} className="flex items-start">
                  <X className="h-6 w-6 mr-3 mt-1 text-red-500 flex-shrink-0" /> Lack of student-specific opportunities
                </motion.li>
              </motion.ul>
            </motion.div>

            {/* For Employers Block - Less boxed */}
            <motion.div variants={itemVariants} className="p-8"> {/* Removed bg, border, shadow from here */}
              <h3 className="text-2xl text-red-600 dark:text-red-400 font-semibold mb-6 flex items-center gap-3">
                <Target className="h-7 w-7 text-red-600 dark:text-red-500" /> For Employers
              </h3>
              <motion.ul variants={containerStagger} className="space-y-4 text-zinc-600 dark:text-zinc-300 text-lg">
                <motion.li variants={itemVariants} className="flex items-start">
                  <X className="h-6 w-6 mr-3 mt-1 text-red-500 flex-shrink-0" /> High recruitment agency fees
                </motion.li>
                <motion.li variants={itemVariants} className="flex items-start">
                  <X className="h-6 w-6 mr-3 mt-1 text-red-500 flex-shrink-0" /> Irrelevant applications from non-students
                </motion.li>
                <motion.li variants={itemVariants} className="flex items-start">
                  <X className="h-6 w-6 mr-3 mt-1 text-red-500 flex-shrink-0" /> Difficulty finding flexible workers
                </motion.li>
                <motion.li variants={itemVariants} className="flex items-start">
                  <X className="h-6 w-6 mr-3 mt-1 text-red-500 flex-shrink-0" /> Unclear student work regulations
                </motion.li>
                <motion.li variants={itemVariants} className="flex items-start">
                  <X className="h-6 w-6 mr-3 mt-1 text-red-500 flex-shrink-0" /> Time-consuming filtering processes
                </motion.li>
                <motion.li variants={itemVariants} className="flex items-start">
                  <X className="h-6 w-6 mr-3 mt-1 text-red-500 flex-shrink-0" /> Limited access to student talent pools
                </motion.li>
              </motion.ul>
            </motion.div>
          </div>
        </div>

        {/* Our Solution Section - Softer feature boxes */}
        <motion.div
          className="mb-20"
          variants={containerStagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          <motion.h2 variants={titleVariants} className="text-4xl font-bold text-center text-zinc-900 dark:text-zinc-50 mb-12">Our Solution</motion.h2>

          <div className="grid gap-10 md:grid-cols-3">
            <Tilt className="w-full h-full" tiltMaxAngleX={5} tiltMaxAngleY={5} perspective={1000} transitionSpeed={1500}>
              <motion.div variants={cardPop} className="flex h-full">
                {/* Softer background, border, and shadow */}
                <div className="bg-white/40 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-700 rounded-xl p-8 shadow-md backdrop-blur-sm flex flex-col justify-between w-full">
                  <div className="text-center pb-4">
                    <DollarSign className="h-12 w-12 text-emerald-400 mx-auto mb-4" />
                    <h3 className="text-2xl text-zinc-900 dark:text-zinc-50 font-semibold">Affordable Access</h3>
                  </div>
                  <div className="text-center flex-grow flex items-center justify-center">
                    <motion.p variants={itemVariants} className="text-zinc-600 dark:text-zinc-300 text-lg">
                      £1 job posts for employers, £1 applications for students.
                      No subscriptions, no hidden fees, no expensive recruitment costs.
                    </motion.p>
                  </div>
                </div>
              </motion.div>
            </Tilt>

            <Tilt className="w-full h-full" tiltMaxAngleX={5} tiltMaxAngleY={5} perspective={1000} transitionSpeed={1500}>
              <motion.div variants={cardPop} className="flex h-full">
                {/* Softer background, border, and shadow */}
                <div className="bg-white/40 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-700 rounded-xl p-8 shadow-md backdrop-blur-sm flex flex-col justify-between w-full">
                  <div className="text-center pb-4">
                    <UserCheckIcon className="h-12 w-12 text-emerald-400 mx-auto mb-4" />
                    <h3 className="text-2xl text-zinc-900 dark:text-zinc-50 font-semibold">Student-Focused</h3>
                  </div>
                  <div className="text-center flex-grow flex items-center justify-center">
                    <motion.p variants={itemVariants} className="text-zinc-600 dark:text-zinc-300 text-lg">
                      Built specifically for UK students with verified accounts,
                      work hour compliance, and academic-friendly scheduling.
                    </motion.p>
                  </div>
                </div>
              </motion.div>
            </Tilt>

            <Tilt className="w-full h-full" tiltMaxAngleX={5} tiltMaxAngleY={5} perspective={1000} transitionSpeed={1500}>
              <motion.div variants={cardPop} className="flex h-full">
                {/* Softer background, border, and shadow */}
                <div className="bg-white/40 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-700 rounded-xl p-8 shadow-md backdrop-blur-sm flex flex-col justify-between w-full">
                  <div className="text-center pb-4">
                    <HandshakeIcon className="h-12 w-12 text-emerald-400 mx-auto mb-4" />
                    <h3 className="text-2xl text-zinc-900 dark:text-zinc-50 font-semibold">Quality Connections</h3>
                  </div>
                  <div className="text-center flex-grow flex items-center justify-center">
                    <motion.p variants={itemVariants} className="text-zinc-600 dark:text-zinc-300 text-lg">
                      Small application fees ensure serious candidates and legitimate jobs,
                      creating better matches for everyone.
                    </motion.p>
                  </div>
                </div>
              </motion.div>
            </Tilt>
          </div>
        </motion.div>

        {/* Our Values Section - Lighter blocks */}
        <motion.div
          variants={containerStagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          <div className="mb-20 p-10 bg-gradient-to-br from-zinc-100/80 to-zinc-50/80 dark:from-zinc-900/80 dark:to-zinc-950/80 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-purple-500 opacity-5 blur-3xl"></div>
            <h2 className="text-4xl text-zinc-900 dark:text-zinc-50 text-center font-bold mb-12 relative z-10">Our Values</h2>
            <div className="grid gap-10 md:grid-cols-2 relative z-10">
              {/* Lighter background, softer shadow */}
              <motion.div variants={itemVariants} className="p-6 rounded-xl bg-zinc-50/30 dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-800 shadow-sm group hover:border-blue-600 dark:hover:border-blue-500 transition-colors duration-300">
                <h3 className="text-2xl font-semibold mb-4 text-blue-600 dark:text-blue-400 flex items-center gap-3">
                  <RocketIcon className="h-7 w-7 text-blue-600 dark:text-blue-500 group-hover:scale-110 transition-transform" /> Education First
                </h3>
                <p className="text-zinc-600 dark:text-zinc-300 text-lg">
                  We believe students' academic success should always come first. Our platform is designed
                  to support, not interfere with, educational goals.
                </p>
              </motion.div>

              {/* Lighter background, softer shadow */}
              <motion.div variants={itemVariants} className="p-6 rounded-xl bg-zinc-50/30 dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-800 shadow-sm group hover:border-blue-600 dark:hover:border-blue-500 transition-colors duration-300">
                <h3 className="text-2xl font-semibold mb-4 text-blue-600 dark:text-blue-400 flex items-center gap-3">
                  <ScaleIcon className="h-7 w-7 text-blue-600 dark:text-blue-500 group-hover:scale-110 transition-transform" /> Fair & Transparent
                </h3>
                <p className="text-zinc-600 dark:text-zinc-300 text-lg">
                  Clear pricing, honest communication, and fair treatment for all users. No hidden costs
                  or misleading practices.
                </p>
              </motion.div>

              {/* Lighter background, softer shadow */}
              <motion.div variants={itemVariants} className="p-6 rounded-xl bg-zinc-50/30 dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-800 shadow-sm group hover:border-blue-600 dark:hover:border-blue-500 transition-colors duration-300">
                <h3 className="text-2xl font-semibold mb-4 text-blue-600 dark:text-blue-400 flex items-center gap-3">
                  <ShieldCheckIcon className="h-7 w-7 text-blue-600 dark:text-blue-500 group-hover:scale-110 transition-transform" /> Legal Compliance
                </h3>
                <p className="text-zinc-600 dark:text-zinc-300 text-lg">
                  Full adherence to UK employment law, student visa regulations, and GDPR requirements.
                  We protect both students and employers.
                </p>
              </motion.div>

              {/* Lighter background, softer shadow */}
              <motion.div variants={itemVariants} className="p-6 rounded-xl bg-zinc-50/30 dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-800 shadow-sm group hover:border-blue-600 dark:hover:border-blue-500 transition-colors duration-300">
                <h3 className="text-2xl font-semibold mb-4 text-blue-600 dark:text-blue-400 flex items-center gap-3">
                  <HourglassIcon className="h-7 w-7 text-blue-600 dark:text-blue-500 group-hover:scale-110 transition-transform" /> Accessibility
                </h3>
                <p className="text-zinc-600 dark:text-zinc-300 text-lg">
                  Affordable access for all. We believe financial constraints shouldn't prevent students
                  from finding work or employers from finding talent.
                </p>
              </motion.div>
            </div >
          </div >
        </motion.div >

        {/* How We're Different Section - Subtle border changes */}
        <motion.div
          className="mb-20"
          variants={containerStagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          <motion.h2 variants={titleVariants} className="text-4xl font-bold text-center text-zinc-900 dark:text-zinc-50 mb-12">How We're Different</motion.h2>

          <div className="grid gap-10 md:grid-cols-2">
            <motion.div variants={itemVariants} className="flex h-full">
              {/* Thinner, softer border, slightly less rounded for a panel feel */}
              <div className="bg-gradient-to-br from-emerald-50/30 to-zinc-50/30 dark:from-emerald-950/30 dark:to-zinc-950/30 border border-emerald-300 dark:border-emerald-800 rounded-xl p-8 shadow-lg flex flex-col w-full relative overflow-hidden group">
                <div className="absolute inset-0 bg-emerald-500 opacity-5 blur-3xl group-hover:opacity-10 transition-all duration-500"></div>
                <h3 className="font-semibold text-3xl text-emerald-700 dark:text-emerald-400 mb-6 flex items-center gap-4 relative z-10">
                  <Check className="h-8 w-8 text-emerald-700 dark:text-emerald-500" /> StudentJobs UK
                </h3>
                <motion.ul variants={containerStagger} className="space-y-4 text-emerald-700 dark:text-emerald-300 text-lg flex-grow relative z-10">
                  <motion.li variants={itemVariants} className="flex items-start">
                    <Check className="h-6 w-6 mr-3 mt-1 text-emerald-500 flex-shrink-0" /> £1-5 per job post, £1 per application
                  </motion.li>
                  <motion.li variants={itemVariants} className="flex items-start">
                    <Check className="h-6 w-6 mr-3 mt-1 text-emerald-500 flex-shrink-0" /> Verified student-only platform
                  </motion.li>
                  <motion.li variants={itemVariants} className="flex items-start">
                    <Check className="h-6 w-6 mr-3 mt-1 text-emerald-500 flex-shrink-0" /> Work hour compliance built-in
                  </motion.li>
                  <motion.li variants={itemVariants} className="flex items-start">
                    <Check className="h-6 w-6 mr-3 mt-1 text-emerald-500 flex-shrink-0" /> Academic calendar awareness
                  </motion.li>
                  <motion.li variants={itemVariants} className="flex items-start">
                    <Check className="h-6 w-6 mr-3 mt-1 text-emerald-500 flex-shrink-0" /> Direct employer-student contact
                  </motion.li>
                  <motion.li variants={itemVariants} className="flex items-start">
                    <Check className="h-6 w-6 mr-3 mt-1 text-emerald-500 flex-shrink-0" /> UK-specific regulations expertise
                  </motion.li>
                </motion.ul>
              </div >
            </motion.div >

            <motion.div variants={itemVariants} className="flex h-full">
              {/* Thinner, softer border, slightly less rounded for a panel feel */}
              <div className="bg-gradient-to-br from-zinc-50/30 to-zinc-100/30 dark:from-zinc-900/30 dark:to-zinc-950/30 border border-zinc-300 dark:border-zinc-800 rounded-xl p-8 shadow-lg flex flex-col w-full relative overflow-hidden group">
                <div className="absolute inset-0 bg-red-500 opacity-5 blur-3xl group-hover:opacity-10 transition-all duration-500"></div>
                <h3 className="font-semibold text-3xl text-zinc-900 dark:text-zinc-200 mb-6 flex items-center gap-4 relative z-10">
                  <X className="h-8 w-8 text-red-500" /> Traditional Job Boards
                </h3>
                <motion.ul variants={containerStagger} className="space-y-4 text-zinc-600 dark:text-zinc-300 text-lg flex-grow relative z-10">
                  <motion.li variants={itemVariants} className="flex items-start">
                    <X className="h-6 w-6 mr-3 mt-1 text-red-500 flex-shrink-0" /> £100s in monthly subscriptions
                  </motion.li>
                  <motion.li variants={itemVariants} className="flex items-start">
                    <X className="h-6 w-6 mr-3 mt-1 text-red-500 flex-shrink-0" /> Mixed audience (not student-focused)
                  </motion.li>
                  <motion.li variants={itemVariants} className="flex items-start">
                    <X className="h-6 w-6 mr-3 mt-1 text-red-500 flex-shrink-0" /> No work hour considerations
                  </motion.li>
                  <motion.li variants={itemVariants} className="flex items-start">
                    <X className="h-6 w-6 mr-3 mt-1 text-red-500 flex-shrink-0" /> Generic, one-size-fits-all approach
                  </motion.li>
                  <motion.li variants={itemVariants} className="flex items-start">
                    <X className="h-6 w-6 mr-3 mt-1 text-red-500 flex-shrink-0" /> Unclear work hour requirements
                  </motion.li>
                </motion.ul>
              </div >
            </motion.div >
          </div >
        </motion.div >

        {/* Future Vision Section (already a distinct block) */}
        <motion.div
          variants={containerStagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          <div className="mb-20 p-10 bg-gradient-to-br from-zinc-100/80 to-zinc-50/80 dark:from-zinc-900/80 dark:to-zinc-950/80 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-teal-500 opacity-5 blur-3xl"></div>
            <h2 className="text-4xl text-zinc-900 dark:text-zinc-50 text-center font-bold mb-12 relative z-10">Our Vision for the Future</h2>
            <motion.div variants={containerStagger} className="space-y-8 relative z-10">
              <motion.p variants={itemVariants} className="text-zinc-600 dark:text-zinc-300 text-lg text-center max-w-4xl mx-auto">
                We envision a UK where every student can easily find flexible work that enhances their
                education rather than detracting from it. Where employers see students as valuable
                contributors, not just temporary help. Our platform will continue evolving to serve
                this community better, driven by innovation and our core values.
              </motion.p>

              <motion.p variants={itemVariants} className="text-zinc-600 dark:text-zinc-300 text-lg text-center max-w-4xl mx-auto">
                Potential future expansions include
              </motion.p>

              <motion.ul variants={containerStagger} className="list-disc list-inside pl-6 space-y-3 text-zinc-600 dark:text-zinc-300 text-lg marker:text-emerald-500 dark:marker:text-emerald-400 max-w-3xl mx-auto">
                <motion.li variants={itemVariants}>Graduate placement programs</motion.li>
                <motion.li variants={itemVariants}>Skill development partnerships with universities</motion.li>
                <motion.li variants={itemVariants}>Internship and placement year opportunities</motion.li>
                <motion.li variants={itemVariants}>Career mentorship programs</motion.li>
                <motion.li variants={itemVariants}>Integration with university career services</motion.li>
              </motion.ul>
            </motion.div>
          </div >
        </motion.div >
{/* Team & Contact Section - Transformed into a distinct call-to-action block */}
        <motion.div
          className="mb-12"
          variants={containerStagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          <motion.h2 variants={titleVariants} className="text-4xl font-bold text-center text-zinc-900 dark:text-zinc-50 mb-12">Get in Touch</motion.h2>

          {/* New styling for a prominent contact block */}
          <div className="p-12 bg-blue-100 border border-blue-400 dark:bg-gradient-to-tr dark:from-purple-900/70 dark:to-blue-900/70 dark:border-blue-700 rounded-3xl shadow-2xl backdrop-blur-md text-zinc-900 dark:text-zinc-50 text-center">
            <motion.p variants={itemVariants} className="text-zinc-600 dark:text-zinc-300 mb-8 text-xl max-w-2xl mx-auto">
              Have questions, feedback, or need support? Our team is here to help you every step of the way.
            </motion.p>

            <motion.div variants={itemVariants} className="mx-auto w-fit">
              <ContactModal>
                <Button size="lg" className="h-14 px-8 text-base bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-full shadow-lg transform hover:scale-105 transition-transform flex items-center gap-2">
                  <MessageCircleMore className="h-6 w-6" />
                  <span>Connect to Support</span>
                </Button>
              </ContactModal>
            </motion.div>
          </div >
        </motion.div >

      </div >
    </motion.div>
  );
}