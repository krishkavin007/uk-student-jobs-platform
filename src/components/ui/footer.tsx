"use client";

import Link from "next/link";
import { ContactModal } from "./contact-modal";
import { useAuth } from "@/app/context/AuthContext";

export function Footer() {
  const { user } = useAuth();
  const pricingHref = user?.user_type === "student" ? "/pricing#student" : "/pricing#employer";

  return (
    <footer className="w-full py-6 bg-slate-100 dark:bg-gray-900 text-slate-900 dark:text-white relative" role="contentinfo">
      <div className="container px-4 md:px-6 mx-auto">
        <div className="grid gap-2 lg:gap-1 lg:grid-cols-4">
          {/* Brand section - always visible */}
          <section className="text-center md:text-left" aria-labelledby="brand-heading">
            <h3 id="brand-heading" className="font-bold text-2xl md:text-xl mb-4 text-slate-900 dark:text-white">StudentJobs UK</h3>
            {/* Social Media Icons */}
            <nav className="flex justify-center md:justify-start space-x-6 md:space-x-4 mb-8 md:mb-4" aria-label="Social media links">
              {/* Facebook */}
              <Link href="#" className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors duration-200" aria-label="Follow us on Facebook">
                <svg className="h-6 w-6 md:h-5 md:w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </Link>
              {/* X (Twitter) */}
              <Link href="#" className="text-black hover:text-gray-700 dark:text-white dark:hover:text-gray-300 transition-colors duration-200" aria-label="Follow us on X (Twitter)">
                <svg className="h-6 w-6 md:h-5 md:w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </Link>
              {/* Instagram */}
              <Link href="#" className="text-pink-600 hover:text-pink-700 dark:text-pink-400 dark:hover:text-pink-300 transition-colors duration-200" aria-label="Follow us on Instagram">
                <svg className="h-6 w-6 md:h-5 md:w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </Link>
              {/* LinkedIn */}
              <Link href="#" className="text-blue-700 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors duration-200" aria-label="Follow us on LinkedIn">
                <svg className="h-6 w-6 md:h-5 md:w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </Link>
            </nav>
          </section>

          {/* Mobile 2x2 grid for link sections */}
          <div className="md:hidden grid grid-cols-2 gap-6">
            <section className="pl-4" aria-labelledby="students-heading">
              <h3 id="students-heading" className="font-bold text-base mb-3 text-blue-700 dark:text-blue-300">For Students</h3>
              <nav aria-label="Student resources">
                <ul className="space-y-1.5 text-base">
                  <li><Link href="/browse-jobs" className="text-slate-600 dark:text-gray-400 hover:text-blue-700 dark:hover:text-blue-200 transition-colors duration-200" aria-label="Browse available jobs">Browse Jobs</Link></li>
                  <li><Link href="/how-it-works" className="text-slate-600 dark:text-gray-400 hover:text-blue-700 dark:hover:text-blue-200 transition-colors duration-200" aria-label="Learn how the platform works">How It Works</Link></li>
                  <li><Link href="/student-guide" className="text-slate-600 dark:text-gray-400 hover:text-blue-700 dark:hover:text-blue-200 transition-colors duration-200" aria-label="Student guide and resources">Student Guide</Link></li>
                </ul>
              </nav>
            </section>
            <section aria-labelledby="employers-heading">
              <h3 id="employers-heading" className="font-bold text-base mb-3 text-indigo-700 dark:text-indigo-300">For Employers</h3>
              <nav aria-label="Employer resources">
                <ul className="space-y-1.5 text-base">
                  <li><Link href="/post-job" className="text-slate-600 dark:text-gray-400 hover:text-indigo-700 dark:hover:text-indigo-200 transition-colors duration-200" aria-label="Post a new job opportunity">Post a Job</Link></li>
                  <li><Link href={pricingHref} className="text-slate-600 dark:text-gray-400 hover:text-indigo-700 dark:hover:text-indigo-200 transition-colors duration-200" aria-label="View pricing plans">Pricing</Link></li>
                  <li><Link href="/employer-guide" className="text-slate-600 dark:text-gray-400 hover:text-indigo-700 dark:hover:text-indigo-200 transition-colors duration-200" aria-label="Employer guide and resources">Employer Guide</Link></li>
                </ul>
              </nav>
            </section>
            <section className="col-span-2 pl-4" aria-labelledby="legal-heading">
              <h3 id="legal-heading" className="font-bold text-base mb-3 text-purple-700 dark:text-purple-300">Legal</h3>
              <nav aria-label="Legal information">
                <ul className="space-y-1.5 text-base">
                  <li><Link href="/privacy" className="text-slate-600 dark:text-gray-400 hover:text-purple-700 dark:hover:text-purple-200 transition-colors duration-200" aria-label="Privacy policy">Privacy Policy</Link></li>
                  <li><Link href="/terms" className="text-slate-600 dark:text-gray-400 hover:text-purple-700 dark:hover:text-purple-200 transition-colors duration-200" aria-label="Terms and conditions">Terms & Conditions</Link></li>
                  <li><Link href="/refund-policy" className="text-slate-600 dark:text-gray-400 hover:text-purple-700 dark:hover:text-purple-200 transition-colors duration-200" aria-label="Refund policy">Refund Policy</Link></li>
                  <li>
                    <ContactModal isLoggedIn={!!user}>
                      <button className="text-slate-600 dark:text-gray-400 hover:text-purple-700 dark:hover:text-purple-200 transition-colors duration-200 text-left text-base" aria-label="Contact us">Contact Us</button>
                    </ContactModal>
                  </li>
                </ul>
              </nav>
            </section>
          </div>

          {/* Desktop layout */}
          <section className="hidden md:block" aria-labelledby="desktop-students-heading">
            <h3 id="desktop-students-heading" className="font-bold text-base mb-3 text-blue-700 dark:text-blue-300">For Students</h3>
            <nav aria-label="Student resources">
              <ul className="space-y-1.5 text-sm">
                <li><Link href="/browse-jobs" className="text-slate-600 dark:text-gray-400 hover:text-blue-700 dark:hover:text-blue-200 transition-colors duration-200" aria-label="Browse available jobs">Browse Jobs</Link></li>
                <li><Link href="/how-it-works" className="text-slate-600 dark:text-gray-400 hover:text-blue-700 dark:hover:text-blue-200 transition-colors duration-200" aria-label="Learn how the platform works">How It Works</Link></li>
                <li><Link href="/student-guide" className="text-slate-600 dark:text-gray-400 hover:text-blue-700 dark:hover:text-blue-200 transition-colors duration-200" aria-label="Student guide and resources">Student Guide</Link></li>
              </ul>
            </nav>
          </section>

          <section className="hidden md:block" aria-labelledby="desktop-employers-heading">
            <h3 id="desktop-employers-heading" className="font-bold text-base mb-3 text-indigo-700 dark:text-indigo-300">For Employers</h3>
            <nav aria-label="Employer resources">
              <ul className="space-y-1.5 text-sm">
                <li><Link href="/post-job" className="text-slate-600 dark:text-gray-400 hover:text-indigo-700 dark:hover:text-indigo-200 transition-colors duration-200" aria-label="Post a new job opportunity">Post a Job</Link></li>
                <li><Link href={pricingHref} className="text-slate-600 dark:text-gray-400 hover:text-indigo-700 dark:hover:text-indigo-200 transition-colors duration-200" aria-label="View pricing plans">Pricing</Link></li>
                <li><Link href="/employer-guide" className="text-slate-600 dark:text-gray-400 hover:text-indigo-700 dark:hover:text-indigo-200 transition-colors duration-200" aria-label="Employer guide and resources">Employer Guide</Link></li>
              </ul>
            </nav>
          </section>

          <section className="hidden md:block" aria-labelledby="desktop-legal-heading">
            <h3 id="desktop-legal-heading" className="font-bold text-base mb-3 text-purple-700 dark:text-purple-300">Legal</h3>
            <nav aria-label="Legal information">
              <ul className="space-y-1.5 text-sm">
                <li><Link href="/privacy" className="text-slate-600 dark:text-gray-400 hover:text-purple-700 dark:hover:text-purple-200 transition-colors duration-200" aria-label="Privacy policy">Privacy Policy</Link></li>
                <li><Link href="/terms" className="text-slate-600 dark:text-gray-400 hover:text-purple-700 dark:hover:text-purple-200 transition-colors duration-200" aria-label="Terms and conditions">Terms & Conditions</Link></li>
                <li><Link href="/refund-policy" className="text-slate-600 dark:text-gray-400 hover:text-purple-700 dark:hover:text-purple-200 transition-colors duration-200" aria-label="Refund policy">Refund Policy</Link></li>
                <li>
                  <ContactModal isLoggedIn={!!user}>
                    <button className="text-slate-600 dark:text-gray-400 hover:text-purple-700 dark:hover:text-purple-200 transition-colors duration-200 text-left text-sm" aria-label="Contact us">Contact Us</button>
                  </ContactModal>
                </li>
              </ul>
            </nav>
          </section>
        </div>

        <div className="border-slate-200 dark:border-gray-800 mt-4 pt-2 text-center text-xs text-slate-500 dark:text-gray-500">
          <p>© {new Date().getFullYear()} StudentJobs UK. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
