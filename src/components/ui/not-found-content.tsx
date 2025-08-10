"use client"

import Link from "next/link"
import { Header } from "@/components/ui/header"
import { useAuth } from "@/app/context/AuthContext"
import { motion } from "framer-motion"
import { Home, Search, Briefcase, ArrowRight } from "lucide-react"

const pageVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.6, ease: "easeOut" } },
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.2 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.4, 0.0, 0.2, 1] } },
}

const iconVariants = {
  hidden: { opacity: 0, scale: 0.8, rotateY: 180 },
  visible: { 
    opacity: 1, 
    scale: 1, 
    rotateY: 0, 
    transition: { 
      duration: 0.8, 
      ease: [0.4, 0.0, 0.2, 1],
      rotateY: { duration: 1 }
    } 
  },
}

export default function NotFoundContent() {
  const { user, isLoading, logout } = useAuth()
  const pricingHref = user?.user_type === "student" ? "/pricing#student" : "/pricing#employer"

  return (
    <motion.div 
      variants={pageVariants}
      initial="initial"
      animate="animate"
      className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-950 dark:via-blue-950 dark:to-purple-950 text-slate-900 dark:text-gray-100 flex flex-col pt-[80px] relative overflow-hidden"
    >
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 rounded-full bg-gradient-to-br from-blue-400/20 to-purple-600/20 blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-gradient-to-tl from-indigo-400/20 to-blue-600/20 blur-3xl animate-pulse delay-1000"></div>
      </div>

      <Header
        user={user}
        isLoading={isLoading}
        logout={logout}
        pricingHref={pricingHref}
        className="fixed top-0 left-0 right-0 z-[9999] bg-white/80 backdrop-blur-md text-gray-900 border-b border-zinc-200 dark:bg-gray-900/80 dark:text-white dark:border-gray-800"
      />

      <main className="flex-grow container mx-auto px-4 py-16 md:py-24 flex items-center justify-center relative z-10">
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-2xl text-center"
        >
          {/* Icon */}
          <motion.div 
            variants={iconVariants}
            className="mx-auto mb-8"
          >
            <div className="relative inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 shadow-2xl">
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 animate-ping opacity-20"></div>
              <svg className="w-12 h-12 text-white relative z-10" viewBox="0 0 32 32" fill="currentColor">
                <path d="M26 10H22V8C22 6.34 20.66 5 19 5H13C11.34 5 10 6.34 10 8V10H6C4.34 10 3 11.34 3 13V24C3 25.66 4.34 27 6 27H26C27.66 27 29 25.66 29 24V13C29 11.34 27.66 10 26 10ZM12 8C12 7.45 12.45 7 13 7H19C19.55 7 20 7.45 20 8V10H12V8ZM27 24C27 24.55 26.55 25 26 25H6C5.45 25 5 24.55 5 24V18H13V20C13 20.55 13.45 21 14 21H18C18.55 21 19 20.55 19 20V18H27V24ZM27 16H19V18H13V16H5V13C5 12.45 5.45 12 6 12H26C26.55 12 27 12.45 27 13V16Z"/>
              </svg>
            </div>
          </motion.div>



          {/* Title */}
          <motion.h1 
            variants={itemVariants}
            className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tighter mb-6"
          >
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-800 dark:from-blue-400 dark:to-purple-600">
              Oops! Page Not Found
            </span>
          </motion.h1>

          {/* Description */}
          <motion.p 
            variants={itemVariants}
            className="text-lg md:text-xl text-slate-600 dark:text-gray-400 mb-10 max-w-lg mx-auto leading-relaxed"
          >
            The page you're looking for seems to have wandered off. Don't worry, let's get you back on track!
          </motion.p>

          {/* Action Buttons */}
          <motion.div 
            variants={containerVariants}
            className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto"
          >
            <motion.div variants={itemVariants}>
              <Link 
                href="/" 
                className="group inline-flex items-center justify-center w-full px-6 py-4 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 hover:from-blue-700 hover:to-blue-800"
              >
                <Home className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform duration-300" />
                Go Home
                <ArrowRight className="w-4 h-4 ml-2 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
              </Link>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Link 
                href="/browse-jobs" 
                className="group inline-flex items-center justify-center w-full px-6 py-4 rounded-xl bg-white dark:bg-gray-800 border-2 border-blue-200 dark:border-blue-800 text-slate-700 dark:text-gray-200 font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 hover:border-blue-300 dark:hover:border-blue-700 hover:bg-blue-50 dark:hover:bg-gray-700"
              >
                <Search className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform duration-300" />
                Browse Jobs
                <ArrowRight className="w-4 h-4 ml-2 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
              </Link>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Link 
                href="/post-job" 
                className="group inline-flex items-center justify-center w-full px-6 py-4 rounded-xl bg-white dark:bg-gray-800 border-2 border-blue-200 dark:border-blue-800 text-slate-700 dark:text-gray-200 font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 hover:border-blue-300 dark:hover:border-blue-700 hover:bg-blue-50 dark:hover:bg-gray-700"
              >
                <Briefcase className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform duration-300" />
                Post a Job
                <ArrowRight className="w-4 h-4 ml-2 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
              </Link>
            </motion.div>
          </motion.div>


        </motion.div>
      </main>
    </motion.div>
  )
}


