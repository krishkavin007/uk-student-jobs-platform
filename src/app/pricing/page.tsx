"use client";

import Link from "next/link";
import { useState, useEffect, Fragment } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Header } from "@/components/ui/header";
import { ContactModal } from "@/components/ui/contact-modal";
import { useAuth } from '@/app/context/AuthContext';
import Tilt from "react-parallax-tilt";
// Import Framer Motion and a wider range of Icons
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight, Check, Plus, Minus, Star, Gift, X,
  UserCheckIcon, DollarSign, ShieldCheckIcon, RocketIcon, MegaphoneIcon, UsersRoundIcon,
  WalletIcon, HourglassIcon, ScaleIcon, HandshakeIcon, RepeatIcon, Target
} from "lucide-react";
// --- Animation Variants for the New, Detailed Design ---
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
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.4, 0.0, 0.2, 1] } },
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
// --- Page Component ---
export default function PricingPageFixed() {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();
  const [planType, setPlanType] = useState<'employers' | 'students'>('employers');
  useEffect(() => {
    const hash = window.location.hash.replace('#', '');
    if (hash === 'student') {
      setPlanType('students');
    } else {
      setPlanType('employers');
      if (window.location.hash && !['#employer', '#student'].includes(window.location.hash)) {
        router.replace('/pricing#employer');
      }
    }
  }, [router]);
  const handlePlanChange = (type: 'employers' | 'students') => {
    setPlanType(type);
    router.push(`/pricing#${type === "employers" ? "employer" : "student"}`);
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 font-sans antialiased">
      <Header
        user={user}
        logout={logout}
        isLoading={isLoading}
        pricingHref={user?.user_type === "student" ? "/pricing#student" : "/pricing#employer"}
className="fixed top-0 left-0 right-0 z-50 bg-gray-900/80 backdrop-blur-md border-b border-gray-800 text-gray-100"/>

      <motion.main
        variants={pageVariants}

        initial="initial"
        animate="animate"
        className="pt-24 sm:pt-32"
      >
        {/* --- Hero Section --- */}
        <motion.section
          variants={containerStagger}
          initial="hidden"
          animate="visible"
          className="text-center px-4"
        >

          <motion.h1
            variants={titleVariants}
            className="text-4xl pb-2 md:text-5xl lg:text-6xl font-extrabold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600"
          >
            Simple, Transparent Pricing
          </motion.h1>
          {/* Removed: <motion.p variants={titleVariants} className="mt-4 text-lg md:text-xl text-gray-400 max-w-2xl mx-auto"> No hidden fees, no monthly subscriptions. Just clear, upfront costs designed for maximum value. </motion.p> */}

          <motion.div
            variants={titleVariants}
            className="mt-10 flex justify-center items-center space-x-2 p-1.5 bg-gray-800 rounded-full w-fit mx-auto shadow-inner"
          >
            <button
              onClick={() => handlePlanChange('employers')}
              className={`px-6 py-2.5 text-base font-bold rounded-full transition-colors relative ${planType === 'employers' ?
                'text-white' : 'text-gray-400 hover:text-gray-200'}`}
            >
              {planType === 'employers' && <motion.div layoutId="plan-highlight" className="absolute inset-0 bg-indigo-600 rounded-full z-0" transition={{ type: 'spring', stiffness: 300, damping: 25 }} />}
              <span className="relative z-10">For Employers</span>
            </button>
            <button

              onClick={() => handlePlanChange('students')}
              className={`px-6 py-2.5 text-base font-bold rounded-full transition-colors relative ${planType === 'students' ?
                'text-white' : 'text-gray-400 hover:text-gray-200'}`}
            >
              {planType === 'students' && <motion.div layoutId="plan-highlight" className="absolute inset-0 bg-purple-600 rounded-full z-0" transition={{ type: 'spring', stiffness: 300, damping: 25 }} />}
              <span className="relative z-10">For Students</span>
            </button>
          </motion.div>
        </motion.section>


        {/* --- Main Content --- */}
        <div className="mt-16 sm:mt-20">
          <AnimatePresence mode="wait">
            <motion.div
              key={planType}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeInOut' } }}

              exit={{ opacity: 0, y: -20, transition: { duration: 0.3, ease: 'easeInOut' } }}
              className="px-4"
            >
              {planType === 'employers' ?
                <EmployerContent /> : <StudentContent />}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* --- Footer --- */}
        <footer className="w-full bg-gray-900 text-gray-300 py-10 mt-20 border-t border-gray-800">
          <div className="w-full px-4 md:px-6 max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center md:text-left">
              <div className="col-span-full md:col-span-1 flex flex-col items-center md:items-start mb-6 md:mb-0">
                <Link href="/" className="flex items-center justify-center md:justify-start space-x-2 mb-4">
                  <span className="text-2xl font-extrabold text-white">StudentJobs UK</span>
                </Link>
                <p className="text-gray-400 text-sm max-w-xs text-center md:text-left">
                  Connecting UK students with flexible part-time opportunities.
                </p>
              </div>

              <div>
                <h3 className="font-bold text-sm mb-3 text-indigo-400 uppercase tracking-wider">For Students</h3>
                <ul className="space-y-2 text-sm">
                  <li><Link href="/browse-jobs" className="text-gray-400 hover:text-indigo-300 transition-colors duration-200">Browse Jobs</Link></li>
                  <li><Link href="/how-it-works" className="text-gray-400 hover:text-indigo-300 transition-colors duration-200">How It Works</Link></li>
                  <li><Link href="/student-guide" className="text-gray-400 hover:text-indigo-300 transition-colors duration-200">Student Guide</Link></li>
                </ul>
              </div>

              <div>
                <h3 className="font-bold text-base mb-3 text-indigo-300">For Employers</h3>
                <ul className="space-y-2 text-sm">
                  <li><Link href="/post-job" className="text-gray-400 hover:text-indigo-300 transition-colors duration-200">Post a Job</Link></li>
                  <li><Link href="/pricing" className="text-gray-400 hover:text-indigo-300 transition-colors duration-200">Pricing</Link></li>
                  <li><Link href="/employer-guide" className="text-gray-400 hover:text-indigo-300 transition-colors duration-200">Employer Guide</Link></li>
                </ul>
              </div>

              <div>
              <h3 className="font-bold text-base mb-3 text-purple-300">Legal</h3>
                <ul className="space-y-1.5 text-sm">
                  <li><Link href="/privacy" className="text-gray-400 hover:text-purple-200 transition-colors duration-200">Privacy Policy</Link></li>
                  <li><Link href="/terms" className="text-gray-400 hover:text-purple-200 transition-colors duration-200">Terms & Conditions</Link></li>
                  <li><Link href="/refund-policy" className="text-gray-400 hover:text-purple-200 transition-colors duration-200">Refund Policy</Link></li>
                    <li>
                      <ContactModal>
                        <button className="text-gray-400 hover:text-purple-200 transition-colors duration-200 text-left text-sm">Contact Us</button>
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
      </motion.main>
    </div>
  );
}

const EmployerContent = () => {
  return (
    <div className="space-y-20 sm:space-y-24">
      {/* --- Main Pricing Cards --- */}
      <motion.div
        variants={containerStagger}
        initial="visible"
        className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto"
      >
        <motion.div variants={cardPop}>

          <Tilt glareEnable={true} glareMaxOpacity={0.05} scale={1.02} perspective={1000}>
            <Card className="bg-gray-900 rounded-2xl shadow-lg p-8 border border-gray-800 h-full flex flex-col min-h-[550px]">
              <CardHeader className="p-0">
                <h3 className="text-2xl font-bold text-white">Basic Job Post</h3>
                <div className="flex items-baseline gap-2 mt-2">

                  <p className="text-5xl font-extrabold text-white">£1</p>
                  <p className="text-gray-400">/ per job post</p>
                </div>
              </CardHeader>
              <CardContent className="p-0 mt-8 flex-grow">
                <ul className="space-y-3 text-gray-300">

                  {["30-day active job listing", "Access to verified student profiles", "Standard search visibility", "Direct student contact & application management", "Edit or delete listing anytime"].map((f, i) =>
                    <motion.li key={i} variants={featureItemVariants} className="flex items-center gap-3">
                      <Check className="h-5 w-5 text-indigo-400 flex-shrink-0" /><span>{f}</span>

                    </motion.li>
                  )}
                </ul>
              </CardContent>
              <motion.div variants={titleVariants}>
                <Button asChild size="lg" className="w-full mt-1 bg-indigo-800 text-indigo-200 font-bold rounded-full py-6 text-base hover:bg-indigo-700 transition-colors">

                  <Link href="/post-job">Post Basic Job</Link>
                </Button>
              </motion.div>
            </Card>
          </Tilt>
        </motion.div>
        <motion.div variants={cardPop}>
          <Tilt
            glareEnable={true} glareMaxOpacity={0.05} scale={1.02} perspective={1000}>
            <Card className="bg-gray-900 rounded-2xl shadow-lg p-8 border-2 border-indigo-500 relative h-full flex flex-col min-h-[550px]">
              <Badge className="absolute -top-4 left-1/2 -translate-x-1/2 bg-indigo-600 text-white font-semibold py-1.5 px-4 rounded-full text-sm shadow-md">
                <Star className="h-4 w-4 mr-1.5 inline" /> Most Popular
              </Badge>

              <CardHeader className="p-0">
                <h3 className="text-2xl font-bold text-white">Sponsored Job Post</h3>
                <div className="flex items-baseline gap-2 mt-2">
                  <p className="text-5xl font-extrabold text-indigo-400">£5</p>
                  <p className="text-gray-400">/ per job post</p>

                </div>
              </CardHeader>
              <CardContent className="p-0 mt-8 flex-grow">
                <ul className="space-y-3 text-gray-300">
                  {["Everything in Basic, plus:", "45-day extended listing duration", "Prominent 'Top of Search Results' placement", "3x more visibility with dedicated highlighting", "Exclusive 'Sponsored' badge for trust & attention", "Priority customer support", "for rapid assistance"].map((f, i) =>
                    <motion.li key={i} variants={featureItemVariants} className="flex items-center gap-3">
                      {i === 0 ?
                        <Check className="h-5 w-5 text-indigo-400 flex-shrink-0" /> : <Gift className="h-5 w-5 text-yellow-400 flex-shrink-0" />}
                      <span>{f}</span>
                    </motion.li>
                  )}
                </ul>

              </CardContent>
              <motion.div variants={titleVariants}>
                <Button asChild size="lg" className="w-full mt-1 bg-indigo-600 text-white font-bold rounded-full py-6 text-base hover:bg-indigo-700 transition-colors">
                  <Link href="/post-job?sponsored=true">Post Sponsored Job</Link>
                </Button>
              </motion.div>

            </Card>
          </Tilt>
        </motion.div>
      </motion.div>

      {/* --- Detailed Comparison Table --- */}

      <section className="max-w-5xl mx-auto">
        <motion.h2 variants={titleVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.5 }} className="text-3xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-teal-500 mb-12">
          Choose Your Employer Plan
        </motion.h2>
        <motion.div variants={cardPop} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }}>
          <div className="bg-gray-900 rounded-2xl shadow-xl border border-gray-800 overflow-hidden">
            <div className="grid grid-cols-3 p-5 bg-gray-800 border-b border-gray-700">

              <h4 className="font-bold text-gray-200 text-lg">Feature</h4>
              <h4 className="font-bold text-gray-200 text-lg text-center">Basic (£1)</h4>
              <h4 className="font-bold text-indigo-400 text-lg text-center">Sponsored (£5)</h4>
            </div>
            <div className="divide-y divide-gray-800">
              {[

                { feature: "Job listing duration", basic: "30 days", sponsored: "45 days" },
                { feature: "Access to student applicants", basic: <Check className="h-6 w-6 text-green-500 mx-auto" />, sponsored: <Check className="h-6 w-6 text-green-500 mx-auto" /> },
                { feature: "Position in search results", basic: "Standard order", sponsored: <span className="font-bold text-indigo-400">Top of results</span> },

                { feature: "Visual highlighting", basic: <X className="h-6 w-6 text-gray-600 mx-auto" />, sponsored: <Badge className="bg-indigo-900/50 text-indigo-400">Sponsored</Badge> },
                { feature: "Expected visibility increase", basic: "Baseline", sponsored: <span className="font-bold text-indigo-400">~3x more views</span> },
                { feature: "Customer support priority", basic: "Standard", sponsored: <span className="font-bold text-indigo-400">Priority support</span> },
                { feature: "Edit/delete job", basic: <Check className="h-6 w-6 text-green-500
                mx-auto" />, sponsored: <Check className="h-6 w-6 text-green-500 mx-auto" /> },
              ].map((item, idx) => (
                <div key={idx} className={`grid grid-cols-3 p-5 text-center items-center ${idx % 2 === 0 ?
                  'bg-gray-900' : 'bg-gray-950'}`}>
                  <p className="text-left text-gray-300">{item.feature}</p>
                  <div className="font-medium text-gray-200 flex justify-center">{item.basic}</div>
                  <div className="font-medium text-gray-200 flex justify-center">{item.sponsored}</div>
                </div>
              ))}

            </div>
          </div>
        </motion.div>
      </section>

      {/* --- Why Our Pricing Model Works for Employers Section --- */}
      <section className="max-w-7xl mx-auto">
        <motion.h2 variants={titleVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.5 }} className="text-3xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-teal-500 mb-12">
          Why Our Pricing Model Works for Employers
        </motion.h2>

        <motion.div
          variants={containerStagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          <motion.div variants={cardPop}>
            <div className="bg-gray-900 p-6 rounded-xl shadow-md border border-gray-800 h-full">
              <div className="flex items-center justify-center w-12 h-12 bg-indigo-900/50 text-indigo-400 rounded-full mb-4">
                <UserCheckIcon className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Quality Over Quantity</h3>
              <p className="text-gray-400">The £1 application fee ensures students are genuinely interested, reducing spam and improving application quality for you.</p>
            </div>
          </motion.div>
          <motion.div variants={cardPop}>
            <div className="bg-gray-900 p-6 rounded-xl shadow-md border border-gray-800 h-full">
              <div className="flex items-center justify-center w-12 h-12 bg-indigo-900/50 text-indigo-400 rounded-full mb-4">
                <DollarSign className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Cost-Effective for Employers</h3>
              <p className="text-gray-400">At £1-5 per posting, you get access to motivated students without expensive recruitment agency fees.</p>
            </div>
          </motion.div>
          <motion.div variants={cardPop}>
            <div className="bg-gray-900 p-6 rounded-xl shadow-md border border-gray-800 h-full">
              <div className="flex items-center justify-center w-12 h-12 bg-indigo-900/50 text-indigo-400 rounded-full mb-4">
                <ShieldCheckIcon className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">No Hidden Costs</h3>
              <p className="text-gray-400">What you see is what you pay. No setup fees, monthly subscriptions, or surprise charges.</p>
            </div>
          </motion.div>
          <motion.div variants={cardPop}>
            <div className="bg-gray-900 p-6 rounded-xl shadow-md border border-gray-800 h-full">
              <div className="flex items-center justify-center w-12 h-12 bg-indigo-900/50 text-indigo-400 rounded-full mb-4">
                <RocketIcon className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Immediate Results</h3>
              <p className="text-gray-400">Your job goes live immediately after payment, and students can start applying right away.</p>
            </div>
          </motion.div>
          <motion.div variants={cardPop}>
            <div className="bg-gray-900 p-6 rounded-xl shadow-md border border-gray-800 h-full">
              <div className="flex items-center justify-center w-12 h-12 bg-indigo-900/50 text-indigo-400 rounded-full mb-4">
                <MegaphoneIcon className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Guaranteed Reach</h3>
              <p className="text-gray-400">With thousands of active student users, your job posting will be seen by qualified candidates.</p>
            </div>
          </motion.div>
          <motion.div variants={cardPop}>
            <div className="bg-gray-900 p-6 rounded-xl shadow-md border border-gray-800 h-full">
              <div className="flex items-center justify-center w-12 h-12 bg-indigo-900/50 text-indigo-400 rounded-full mb-4">
                <Target className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Targeted Audience</h3>
              <p className="text-gray-400">Directly reach UK university students looking for part-time work, ensuring relevant applications.</p>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* --- Employer Advantages Section --- */}
      <section className="max-w-7xl mx-auto">
        <motion.h2 variants={titleVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.5 }} className="text-3xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-500 mb-12">
          Employer Advantages & Partnerships
        </motion.h2>

        <motion.div
          variants={containerStagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          <motion.div variants={cardPop}>
            <div className="bg-gray-900 p-6 rounded-xl shadow-md border border-gray-800 h-full">

              <div className="flex items-center justify-center w-12 h-12 bg-indigo-900/50 text-indigo-400 rounded-full mb-4">
                <RepeatIcon className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Zero Transaction Fees</h3>
              <p className="text-gray-400">The price you see is the price you pay.
                No additional transaction fees or hidden costs on job postings.</p>
            </div>
          </motion.div>
          <motion.div variants={cardPop}>
            <div className="bg-gray-900 p-6 rounded-xl shadow-md border border-gray-800 h-full">
              <div className="flex items-center justify-center w-12 h-12 bg-indigo-900/50 text-indigo-400 rounded-full mb-4">
                <ShieldCheckIcon
                  className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Fair Refund Policy</h3>
              <p className="text-gray-400">Eligible refunds are available under specific circumstances.
                Review our <Link href="/refund-policy" className="text-indigo-400 hover:underline">refund policy</Link> for details.</p>
            </div>
          </motion.div>
          <motion.div variants={cardPop}>
            <div className="bg-gray-900 p-6 rounded-xl shadow-md border border-gray-800 h-full">
              <div className="flex items-center justify-center w-12 h-12 bg-indigo-900/50 text-indigo-400 rounded-full mb-4">
                <HandshakeIcon className="h-6
                w-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Custom Solutions & Partnerships</h3>
              <p className="text-gray-400 mb-4">For high-volume hiring or strategic partnerships, we offer tailored packages.</p>
              <ContactModal>
                <button className="font-semibold text-indigo-400 hover:text-indigo-300 transition-colors">

                  Talk to Sales <ArrowRight className="inline h-4 w-4" />
                </button>
              </ContactModal>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* --- Employer FAQ (FIXED: No Accordion) --- */}
      <section className="max-w-3xl mx-auto">
        <motion.h2 variants={titleVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.5 }} className="text-3xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-orange-500 mb-10">
          Employer FAQ

        </motion.h2>
        <div className="space-y-6">
          {[
            { title: "Do I pay anything if no one applies?", content: "You only pay the initial posting fee (£1 or £5). There are no additional charges based on applications received."
            },
            { title: "Can I edit my job after posting?", content: "Yes, you can edit or delete your job at any time through your account dashboard at no extra cost. Changes are reflected instantly."
            },
            { title: "What payment methods do you accept?", content: "We accept all major credit/debit cards (Visa, Mastercard, American Express) and PayPal. All payments are processed securely through Stripe."
            }
          ].map((faq, idx) => (
            <motion.div key={idx} variants={cardPop} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.5 }} className="bg-gray-900 p-6 rounded-xl shadow-md border border-gray-800">
              <CardHeader className="p-0 mb-3">

                <CardTitle className="text-xl font-bold text-white">{faq.title}</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <p className="text-gray-300 text-base">{faq.content}</p>
              </CardContent>

            </motion.div>
          ))}
        </div>
      </section>

      {/* --- Employer CTA --- */}
      <section className="bg-gray-900 rounded-2xl shadow-lg border border-gray-800 max-w-7xl mx-auto py-16 px-4 text-center mt-20">
        <motion.div variants={containerStagger} initial="hidden" whileInView="visible" viewport={{ once: true }}>
          <motion.h2
            variants={titleVariants} className="text-3xl sm:text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500 mb-4">
            Ready to Find Your Next Student Employee?
          </motion.h2>
          <motion.p variants={titleVariants} className="text-gray-300 text-lg mb-10 max-w-2xl mx-auto">
            Join hundreds of forward-thinking employers already thriving with student talent from StudentJobs UK.
          </motion.p>
          <motion.div variants={titleVariants} className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="w-full sm:w-auto h-14 px-8 text-base bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-full shadow-lg transform hover:scale-105 transition-transform">
              <Link href="/post-job" className="flex items-center justify-center">
                <span>Post a Job Now</span> <ArrowRight className="ml-2 h-5 w-5" />

              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="w-full sm:w-auto h-14 px-8 text-base border-2 border-indigo-600 text-indigo-400 bg-transparent hover:bg-indigo-900/50 hover:text-white font-bold rounded-full shadow-lg transform hover:scale-105 transition-transform">
              <Link href="/employer-guide">Explore Employer Guide</Link>
            </Button>
          </motion.div>
        </motion.div>
      </section>

    </div>
  )
}

const StudentContent = () => {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  const handleProPackClick = () => {
    if (isLoading) return; // Don't do anything while loading

    if (!user) {
      // Not logged in - redirect to login with next parameter
      router.push('/login?next=/pay?type=pro_pack&amount=5.00');
      return;
    }

    if (user.user_type === 'employer') {
      // Employer trying to access student pricing - redirect to employer pricing
      router.push('/pricing#employer');
      return;
    }

    // Logged in student - redirect to payment
    router.push('/pay?type=pro_pack&amount=5.00');
  };

  return (
    <div className="space-y-20 sm:space-y-24">
      {/* --- Main Pricing Cards --- */}
      <motion.div
        variants={containerStagger}
        initial="visible"
        className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto"
      >
        <motion.div variants={cardPop}>

          <Tilt glareEnable={true} glareMaxOpacity={0.05} scale={1.02} perspective={1000}>
            <Card className="bg-gray-900 rounded-2xl shadow-lg p-8 border border-gray-800 h-full flex flex-col min-h-[550px]">
              <CardHeader className="p-0">
                <h3 className="text-2xl font-bold text-white">Basic Contact Reveal</h3>
                <div className="flex items-baseline gap-2 mt-2">

                  <p className="text-5xl font-extrabold text-white">£1</p>
                  <p className="text-gray-400">/ per job reveal</p>
                </div>
              </CardHeader>
              <CardContent className="p-0 mt-8 flex-grow">
                <ul className="space-y-3 text-gray-300">

                  {["Unlock full employer contact details", "Apply directly to the employer (off-platform)", "No recurring fees – pay per reveal", "Unlimited free job Browse", "Access to UK-wide student job listings"].map((f, i) =>
                    <motion.li key={i} variants={featureItemVariants} className="flex items-center gap-3">
                      <Check className="h-5 w-5 text-purple-400 flex-shrink-0" /><span>{f}</span>

                    </motion.li>
                  )}
                </ul>
              </CardContent>
              <motion.div variants={titleVariants}>
                <Button asChild size="lg" className="w-full mt-1 bg-purple-800
                text-purple-200 font-bold rounded-full py-6 text-base hover:bg-purple-700 transition-colors">
                  <Link href="/browse-jobs">Find Your Next Job</Link>
                </Button>
              </motion.div>
            </Card>
          </Tilt>
        </motion.div>
        <motion.div variants={cardPop}>

          <Tilt glareEnable={true} glareMaxOpacity={0.05} scale={1.02} perspective={1000}>
            <Card className="bg-gray-900 rounded-2xl shadow-lg p-8 border-2 border-purple-500 relative h-full flex flex-col min-h-[550px]">
              <Badge className="absolute -top-4 left-1/2 -translate-x-1/2 bg-purple-600 text-white font-semibold py-1.5 px-4 rounded-full text-sm shadow-md">
                <Gift className="h-4 w-4 mr-1.5 inline" /> Best Value
              </Badge>

              <CardHeader className="p-0">
                <h3 className="text-2xl font-bold text-white">Student Pro Pack</h3>
                <div className="flex items-baseline gap-2 mt-2">
                  <p className="text-5xl font-extrabold text-purple-400">£5</p>
                  <p className="text-gray-400">for 8 reveals</p>

                </div>
              </CardHeader>
                <CardContent className="p-0 mt-8 flex-grow">
                  <p className="font-semibold text-gray-200 mb-4">Includes 8 Contact Reveals (Save £3!)</p>
                  <ul className="space-y-3 text-gray-300">

                    {["Includes 8 Basic Contact Reveals", "Save £3 compared to individual reveals", "Ideal for active job seekers", "Convenient, one-time purchase", "Fast-track your job search"].map((f, i) =>
                      <motion.li key={i} variants={featureItemVariants} className="flex items-center gap-3">
                        {i === 0 ?
                          <Check className="h-5 w-5 text-purple-400 flex-shrink-0" /> : <Star className="h-5 w-5 text-yellow-400 flex-shrink-0" />}
                        <span>{f}</span>
                      </motion.li>
                    )}
                  </ul>

                </CardContent>
                <motion.div variants={titleVariants}>
                  <Button 
                    size="lg" 
                    className="w-full mt-1 bg-purple-600 text-white font-bold rounded-full py-6 text-base hover:bg-purple-700 transition-colors"
                    onClick={handleProPackClick}
                  >
                    Get Pro Pack
                  </Button>
                </motion.div>

              </Card>
            </Tilt>
          </motion.div>
        </motion.div>

        {/* --- Detailed Comparison Table --- */}
        <section className="max-w-5xl mx-auto">
          <motion.h2 variants={titleVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.5 }} className="text-3xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-teal-500 mb-12">

            Compare Your Student Options
          </motion.h2>
          <motion.div variants={cardPop} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }}>
            <div className="bg-gray-900 rounded-2xl shadow-xl border border-gray-800 overflow-hidden">
              <div className="grid grid-cols-3 p-5 bg-gray-800 border-b border-gray-700">
                <h4 className="font-bold text-gray-200 text-lg">Feature</h4>
                <h4 className="font-bold text-gray-200 text-lg text-center">Basic (£1)</h4>

                <h4 className="font-bold text-purple-400 text-lg text-center">Pro Pack (£5)</h4>
              </div>
              <div className="divide-y divide-gray-800">
                {[
                  { feature: "Cost per contact reveal", basic: "£1", pro: <span className="font-bold text-purple-400">~£0.63</span> },

                  { feature: "Number of reveals included", basic: "1", pro: "8" },
                  { feature: "Savings", basic: "None", pro: <span className="font-bold text-purple-400">£3</span> },
                  { feature: "Payment model", basic: "Pay-per-reveal", pro: "Bundle purchase" },
                  { feature: "Ideal for", basic: "Casual job searching", pro: "Active job searching" },

                  { feature: "Access to all listings", basic: <Check className="h-6 w-6 text-green-500 mx-auto" />, pro: <Check className="h-6 w-6 text-green-500 mx-auto" /> },
                  { feature: "Direct employer contact", basic: <Check className="h-6 w-6 text-green-500 mx-auto" />, pro: <Check className="h-6 w-6 text-green-500 mx-auto" /> },
                ].map((item, idx) => (
                  <div key={idx} className={`grid grid-cols-3 p-5 text-center
                items-center ${idx % 2 === 0 ? 'bg-gray-900' : 'bg-gray-950'}`}>
                    <p className="text-left text-gray-300">{item.feature}</p>
                    <div className="font-medium text-gray-200 flex justify-center">{item.basic}</div>
                    <div className="font-medium text-gray-200 flex justify-center">{item.pro}</div>
                  </div>

                ))}
              </div>
            </div>
          </motion.div>
        </section>

        {/* --- Why Our Pricing Model Works for Students Section --- */}
        <section className="max-w-7xl mx-auto">
          <motion.h2 variants={titleVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.5 }} className="text-3xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-teal-500 mb-12">
            Why Our Pricing Model Works for Students
          </motion.h2>

          <motion.div
            variants={containerStagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            <motion.div variants={cardPop}>
              <div className="bg-gray-900 p-6 rounded-xl shadow-md border border-gray-800 h-full">
                <div className="flex items-center justify-center w-12 h-12 bg-purple-900/50 text-purple-400 rounded-full mb-4">
                  <ScaleIcon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Fair & Transparent</h3>
                <p className="text-gray-400">You only pay a small fee when you want to apply for a job, not for Browse or signing up.</p>
              </div>
            </motion.div>
            <motion.div variants={cardPop}>
              <div className="bg-gray-900 p-6 rounded-xl shadow-md border border-gray-800 h-full">
                <div className="flex items-center justify-center w-12 h-12 bg-purple-900/50 text-purple-400 rounded-full mb-4">
                  <X className="h-6 w-6" /> {/* Using X to denote 'No Subscriptions' */}
                </div>
                <h3 className="text-lg font-bold text-white mb-2">No Subscriptions</h3>
                <p className="text-gray-400">No recurring monthly fees. You pay per successful contact reveal, giving you full control.</p>
              </div>
            </motion.div>
            <motion.div variants={cardPop}>
              <div className="bg-gray-900 p-6 rounded-xl shadow-md border border-gray-800 h-full">
                <div className="flex items-center justify-center w-12 h-12 bg-purple-900/50 text-purple-400 rounded-full mb-4">
                  <UserCheckIcon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Serious Employers</h3>
                <p className="text-gray-400">Employers pay to post jobs, ensuring they are serious about hiring and the roles are genuine.</p>
              </div>
            </motion.div>
            <motion.div variants={cardPop}>
              <div className="bg-gray-900 p-6 rounded-xl shadow-md border border-gray-800 h-full">
                <div className="flex items-center justify-center w-12 h-12 bg-purple-900/50 text-purple-400 rounded-full mb-4">
                  <ShieldCheckIcon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Reduce Spam</h3>
                <p className="text-gray-400">The small fee helps filter out non-serious applications, leading to higher quality engagement with employers.</p>
              </div>
            </motion.div>
            <motion.div variants={cardPop}>
              <div className="bg-gray-900 p-6 rounded-xl shadow-md border border-gray-800 h-full">
                <div className="flex items-center justify-center w-12 h-12 bg-purple-900/50 text-purple-400 rounded-full mb-4">
                  <ArrowRight className="h-6 w-6" /> {/* Using ArrowRight for Direct Access */}
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Direct Access</h3>
                <p className="text-gray-400">Once you pay, you get direct contact details, allowing you to reach out immediately.</p>
              </div>
            </motion.div>
            <motion.div variants={cardPop}>
              <div className="bg-gray-900 p-6 rounded-xl shadow-md border border-gray-800 h-full">
                <div className="flex items-center justify-center w-12 h-12 bg-purple-900/50 text-purple-400 rounded-full mb-4">
                  <Target className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Student-Focused Jobs</h3>
                <p className="text-gray-400">All jobs on our platform are specifically curated for students, ensuring relevance to your needs.</p>
              </div>
            </motion.div>
          </motion.div>
        </section>

        {/* --- Student Advantages Section --- */}
        <section className="max-w-7xl mx-auto">
          <motion.h2 variants={titleVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.5 }} className="text-3xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500 mb-12">
            Student Advantages & Support
          </motion.h2>

          <motion.div
            variants={containerStagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            <motion.div variants={cardPop}>
              <div className="bg-gray-900 p-6 rounded-xl shadow-md border border-gray-800 h-full">

                <div className="flex items-center justify-center w-12 h-12 bg-purple-900/50 text-purple-400 rounded-full mb-4">
                  <WalletIcon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Cost-Effective Job Search</h3>
                <p className="text-gray-400">Only pay when you want to apply.
                  No subscriptions, no hidden fees.</p>
              </div>
            </motion.div>
            <motion.div variants={cardPop}>
              <div className="bg-gray-900 p-6 rounded-xl shadow-md border border-gray-800 h-full">
                <div className="flex items-center justify-center w-12 h-12 bg-purple-900/50 text-purple-400 rounded-full mb-4">
                  <HourglassIcon className="h-6 w-6" />

                </div>
                <h3 className="text-lg font-bold text-white mb-2">Save Time & Effort</h3>
                <p className="text-gray-400">Quickly access employer details for jobs that genuinely interest you, streamlining your application process.</p>
              </div>
            </motion.div>
            <motion.div variants={cardPop}>

              <div className="bg-gray-900 p-6 rounded-xl shadow-md border border-gray-800 h-full">
                <div className="flex items-center justify-center w-12 h-12 bg-purple-900/50 text-purple-400 rounded-full mb-4">
                  <ScaleIcon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Fair & Flexible</h3>

                <p className="text-gray-400">Choose between individual unlocks or cost-saving packs, adapting to your job search intensity.</p>
              </div>
            </motion.div>
          </motion.div>
        </section>


        {/* --- Student FAQ (FIXED: No Accordion) --- */}
        <section className="max-w-3xl mx-auto">
          <motion.h2 variants={titleVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.5 }} className="text-3xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-orange-500 mb-10">
            Student
            FAQ
          </motion.h2>
          <div className="space-y-6">
            {[
              { title: "What happens after I reveal contact details?", content: "Once you reveal, you get instant access to the employer's direct contact information. You then apply to them directly, off-platform."
              },
              { title: "Do contact reveals expire?", content: "No, once you've purchased a contact reveal or a Pro Pack, your reveals do not expire. You can use them whenever you find a suitable job."
              },
              { title: "Is my payment information secure?", content: "Yes, all payments are securely processed through Stripe, a leading payment processor, ensuring your financial details are protected."
              },
              { title: "Can I get a refund if I don't get the job?", content: "Our pricing model is for access to contact information, not job placement. Therefore, refunds are not issued based on job application outcomes. Please review our refund policy for eligible cases."
              }
            ].map((faq, idx) => (
              <motion.div key={idx} variants={cardPop} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.5 }} className="bg-gray-900 p-6 rounded-xl shadow-md border border-gray-800">
                <CardHeader className="p-0 mb-3">

                  <CardTitle className="text-xl font-bold text-white">{faq.title}</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <p className="text-gray-300 text-base">{faq.content}</p>
                </CardContent>

              </motion.div>
            ))}
          </div>
        </section>

        {/* --- Student CTA --- */}
        <section className="bg-gray-900 rounded-2xl shadow-lg border border-gray-800 max-w-7xl mx-auto py-16 px-4 text-center mt-20">
          <motion.div variants={containerStagger} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <motion.h2
              variants={titleVariants} className="text-3xl sm:text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-teal-500 mb-4">
              Ready to Find Your Dream Student Job?
            </motion.h2>
            <motion.p variants={titleVariants} className="text-gray-300 text-lg mb-10 max-w-2xl mx-auto">
              Browse through thousands of part-time, internship, and graduate roles specifically for students like you.
            </motion.p>
            <motion.div variants={titleVariants} className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="w-full sm:w-auto h-14 px-8 text-base bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-full shadow-lg transform hover:scale-105 transition-transform">
                <Link href="/browse-jobs" className="flex items-center justify-center">
                  <span>Browse Jobs Now</span> <ArrowRight className="ml-2 h-5 w-5" />
                </Link>

              </Button>
              <Button asChild variant="outline" size="lg" className="w-full sm:w-auto h-14 px-8 text-base border-2 border-purple-600 text-purple-400 bg-transparent hover:bg-purple-900/50 hover:text-white font-bold rounded-full shadow-lg transform hover:scale-105 transition-transform">
                <Link href="/student-guide">Explore Student Guide</Link>
              </Button>
            </motion.div>
          </motion.div>
        </section>
      </div>

    )
}