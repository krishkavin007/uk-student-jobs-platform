// components/ui/header.tsx
"use client";

import Link from 'next/link';
import { Logo } from './logo';
import { Button } from './button'; // Ensure this import is correct
import { twMerge } from 'tailwind-merge'; // Import twMerge for combining class names safely

// Import necessary types for User if not already defined globally or in a shared types file
// Assuming User interface is defined in your AuthContext or similar place
interface User {
  user_id: string;
  user_username: string;
  user_email: string;
  google_id?: string;
  user_type: "employer" | "student" | "admin"; // Added admin to user_type
  organization_name?: string;
  contact_phone_number?: string;
  user_first_name?: string;
  user_last_name?: string;
  university_college?: string;
  created_at: string;
  user_image?: string;
}

interface HeaderProps {
  user?: User | null;
  logout?: () => void;
  isLoading?: boolean;
  showAuth?: boolean;
  pricingHref?: string;
  // Allow accepting a className prop
  className?: string;
  // NEW PROP: To enable admin dashboard specific header behavior
  adminDashboardMode?: boolean;
}

// Updated Header function to accept showAuth with a default value of true
// MODIFIED: Destructure pricingHref with a default value, accept className, and add adminDashboardMode
export function Header({ user, logout, isLoading, showAuth = true, pricingHref = "/pricing#employer", className, adminDashboardMode = false }: HeaderProps) {
  return (
    // MODIFIED: Apply the incoming className prop using twMerge to the outermost <header> element
    <header className={twMerge("bg-white dark:bg-gray-900 border-b dark:border-gray-700", className)}>
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/">
            <Logo />
          </Link>

          {/* Main navigation */}
          <nav className="flex items-center gap-10">
            {/* Conditionally render Pricing and About Us based on adminDashboardMode */}
            {!adminDashboardMode && (
              <>
                {/* Use the pricingHref prop for the Pricing link */}
                <Link href={pricingHref} className="text-sm font-medium hover:underline dark:text-gray-300">
                  Pricing
                </Link>

                {/* About Us link */}
                <Link href="/about" className="text-sm font-medium hover:underline dark:text-gray-300">
                  About Us
                </Link>
              </>
            )}

            {/* Authentication/User specific links */}
            {/* If in adminDashboardMode, only show Sign Out for admin user */}
            {adminDashboardMode ? (
              user && user.user_type === 'admin' && (
                // MODIFIED: Using the Button component with the specified styles
                <Button
                  onClick={logout}
                  variant="outline"
                  className="bg-red-600 hover:bg-red-700 text-white border-red-700"
                >
                  Sign Out
                </Button>
              )
            ) : (
              // Original showAuth logic for non-admin pages
              showAuth && (
                <>
                  {isLoading ? (
                    <span className="text-sm font-medium dark:text-gray-300">Loading...</span>
                  ) : user ? (
                    // User is logged in (not admin dashboard mode)
                    <>
                      {user.user_type === 'admin' && ( // This case handles if a non-admin page is accessed by an admin.
                        <Link href="/admin" className="text-sm font-medium hover:underline dark:text-gray-300">
                          Admin
                        </Link>
                      )}
                      {user.user_type === 'student' && (
                        <Link href="/browse-jobs" className="text-sm font-medium hover:underline dark:text-gray-300">
                          Browse Jobs
                        </Link>
                      )}
                      {user.user_type === 'employer' && (
                        <Link href="/post-job" className="text-sm font-medium hover:underline dark:text-gray-300">
                          Post Job
                        </Link>
                      )}
                      {/* My Account link for both students and employers */}
                      {(user.user_type === 'student' || user.user_type === 'employer') && (
                        <Link href="/my-account" className="text-sm font-medium hover:underline dark:text-gray-300">
                          My Account
                        </Link>
                      )}
                      <button onClick={logout} className="text-sm font-medium hover:underline dark:text-gray-300">
                        Sign Out
                      </button>
                    </>
                  ) : (
                    // User is not logged in (non-admin dashboard mode)
                    <div className="flex items-center gap-4">
                      <Link href="/login" className="text-sm font-medium hover:underline dark:text-gray-300">
                        Sign In
                      </Link>
                      <Button asChild size="sm" className="bg-blue-600 hover:bg-blue-700">
                        <Link href="/signup">Sign Up</Link>
                      </Button>
                    </div>
                  )}
                </>
              )
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}