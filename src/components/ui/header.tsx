// components/ui/header.tsx
"use client";

import Link from 'next/link';
import { Logo } from './logo';
import { Button } from './button';

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
  // MODIFIED: Make pricingHref optional and provide a default in the component
  pricingHref?: string; 
}

// Updated Header function to accept showAuth with a default value of true
// MODIFIED: Destructure pricingHref with a default value
export function Header({ user, logout, isLoading, showAuth = true, pricingHref = "/pricing#employer" }: HeaderProps) {
  return (
    <header className="bg-white dark:bg-gray-900 border-b dark:border-gray-700">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/">
            <Logo />
          </Link>

          {/* Main navigation with larger gap for primary items */}
          <nav className="flex items-center gap-10">
            {/* Use the pricingHref prop for the Pricing link */}
            <Link href={pricingHref} className="text-sm font-medium hover:underline dark:text-gray-300">
              Pricing
            </Link>

            {/* About Us link */}
            <Link href="/about" className="text-sm font-medium hover:underline dark:text-gray-300">
              About Us
            </Link>

            {/* Conditionally render authentication links based on showAuth prop */}
            {showAuth && (
              <>
                {isLoading ? (
                  <span className="text-sm font-medium dark:text-gray-300">Loading...</span>
                ) : user ? (
                  // User is logged in
                  <>
                    {user.user_type === 'admin' && (
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
                  // User is not logged in
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
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}