"use client"

import Link from "next/link"
import { Header } from "@/components/ui/header"
import { useAuth } from "@/app/context/AuthContext"

export default function NotFoundContent() {
  const { user, isLoading, logout } = useAuth()
  const pricingHref = user?.user_type === "student" ? "/pricing#student" : "/pricing#employer"

  return (
    <div className="min-h-screen bg-zinc-50 text-gray-900 dark:bg-gray-950 dark:text-gray-100 flex flex-col pt-[80px]">
      <Header
        user={user}
        isLoading={isLoading}
        logout={logout}
        pricingHref={pricingHref}
        className="fixed top-0 left-0 right-0 z-[9999] bg-white text-gray-900 border-b border-zinc-200 dark:bg-gray-900 dark:text-white dark:border-gray-800"
      />

      <main className="flex-grow container mx-auto px-4 py-16 md:py-24 flex items-center justify-center">
        <div className="max-w-xl text-center">
          <div className="mx-auto mb-6 h-16 w-16 rounded-full bg-zinc-100 flex items-center justify-center dark:bg-gray-800">
            <svg className="h-8 w-8 text-zinc-500 dark:text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21-4.3-4.3"></path>
            </svg>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">Page not found</h1>
          <p className="mt-3 text-zinc-600 dark:text-gray-400">The page you’re looking for doesn’t exist or has moved.</p>
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Link href="/" className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
              Go home
            </Link>
            <Link href="/browse-jobs" className="inline-flex items-center justify-center rounded-md border border-zinc-300 px-4 py-2 text-gray-900 hover:bg-zinc-50 dark:border-gray-700 dark:text-gray-100 dark:hover:bg-gray-800">
              Browse jobs
            </Link>
            <Link href="/post-job" className="inline-flex items-center justify-center rounded-md border border-zinc-300 px-4 py-2 text-gray-900 hover:bg-zinc-50 dark:border-gray-700 dark:text-gray-100 dark:hover:bg-gray-800">
              Post a job
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}


