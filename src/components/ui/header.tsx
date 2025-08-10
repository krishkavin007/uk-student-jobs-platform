// components/ui/header.tsx
"use client";

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { Menu, X, User, Settings, LogOut, ChevronDown } from 'lucide-react';
import { Logo } from './logo';
import { Button } from './button'; // Ensure this import is correct
import { twMerge } from 'tailwind-merge'; // Import twMerge for combining class names safely
import { ThemeToggle } from './theme-toggle'; // Import the theme toggle
import { AdminAccountSettingsModal } from './admin-account-settings';

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

// Admin user interface for admin dashboard
interface AdminUser {
  admin_id: string;
  username: string;
  admin_email: string;
  first_name?: string;
  last_name?: string;
  role: string;
}

interface HeaderProps {
  user?: User | AdminUser | null;
  logout?: () => void;
  isLoading?: boolean;
  showAuth?: boolean;
  pricingHref?: string;
  // Allow accepting a className prop
  className?: string;
  // NEW PROP: To enable admin dashboard specific header behavior
  adminDashboardMode?: boolean;
  // NEW PROP: To track current page for conditional navigation
  currentPage?: string;
  // NEW PROP: For admin account settings modal control
  onAccountSettingsOpen?: () => void;
}

// Updated Header function to accept showAuth with a default value of true
// MODIFIED: Destructure pricingHref with a default value, accept className, and add adminDashboardMode
export function Header({ user, logout, isLoading, showAuth = true, pricingHref = "/pricing#employer", className, adminDashboardMode = false, currentPage, onAccountSettingsOpen }: HeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const profileDropdownRef = useRef<HTMLDivElement>(null);

  // Type guard to check if user is AdminUser
  const isAdminUser = (user: User | AdminUser | null): user is AdminUser => {
    return user !== null && 'admin_id' in user;
  };

  // Type guard to check if user is regular User
  const isRegularUser = (user: User | AdminUser | null): user is User => {
    return user !== null && 'user_id' in user;
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node)) {
        setProfileDropdownOpen(false);
      }
    }

    if (profileDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [profileDropdownOpen]);
  return (
    // MODIFIED: Apply the incoming className prop using twMerge to the outermost <header> element
    <header className={twMerge("relative bg-background border-b border-border", className)}>
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/">
            <Logo variant={adminDashboardMode ? 'admin-dark' : 'default'} />
          </Link>

          {/* Mobile actions: Theme toggle + Hamburger */}
          <div className="flex items-center gap-3 sm:hidden">
            {!adminDashboardMode && <ThemeToggle />}
            <button
              type="button"
              aria-label="Toggle menu"
              aria-expanded={mobileOpen}
              onClick={() => setMobileOpen((v) => !v)}
              className="p-2 rounded-md border border-border bg-background text-foreground"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>

          {/* Main navigation (hidden on mobile) */}
          <nav className="hidden sm:flex items-center gap-6">

            {/* Conditionally render Pricing and About Us based on adminDashboardMode */}
            {!adminDashboardMode && (
              <>
                {/* Use the pricingHref prop for the Pricing link */}
                <Link href={pricingHref} className="text-sm font-medium text-foreground hover:text-primary transition-colors">
                  Pricing
                </Link>

                {/* How it works (show only when logged out) */}
                {!user && (
                  <Link href="/how-it-works" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
                    How it works
                  </Link>
                )}

                {/* About Us link */}
                <Link href="/about" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
                  About Us
                </Link>
              </>
            )}

            {/* Authentication/User specific links */}
            {/* If in adminDashboardMode, show profile dropdown for admin user */}
            {adminDashboardMode ? (
              user && isAdminUser(user) && (
                <div className="relative" ref={profileDropdownRef}>
                  <button
                    onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                    className="flex items-center gap-2 p-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-white transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                      <User className="h-4 w-4 text-white" />
                    </div>
                    <span className="hidden sm:block text-sm font-medium">
                      {user.first_name && user.last_name 
                        ? `${user.first_name} ${user.last_name}` 
                        : user.username || 'Admin'}
                    </span>
                    <ChevronDown className={`h-4 w-4 transition-transform ${profileDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Profile Dropdown */}
                  {profileDropdownOpen && (
                    <div className="absolute right-0 mt-2 min-w-64 max-w-80 bg-gray-800 rounded-lg shadow-lg border border-gray-700 z-50">
                      <div className="py-1">
                        <div className="px-4 py-2 border-b border-gray-700">
                          <p className="text-sm font-medium text-white truncate">
                            {user.first_name && user.last_name 
                              ? `${user.first_name} ${user.last_name}` 
                              : user.username || 'Admin'}
                          </p>
                          <p className="text-xs text-gray-400 break-all">
                            {user.admin_email}
                          </p>
                        </div>
                        
                        <button 
                          onClick={() => {
                            setProfileDropdownOpen(false);
                            onAccountSettingsOpen?.();
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 flex items-center gap-2"
                        >
                          <Settings className="h-4 w-4" />
                          Account Settings
                        </button>
                        
                        <button 
                          onClick={() => {
                            setProfileDropdownOpen(false);
                            logout && logout();
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-gray-700 flex items-center gap-2"
                        >
                          <LogOut className="h-4 w-4" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )
            ) : (
              // Original showAuth logic for non-admin pages
              showAuth && (
                <>
                  {isLoading ? (
                    <span className="text-sm font-medium text-muted-foreground">Loading...</span>
                  ) : user ? (
                    // User is logged in (not admin dashboard mode)
                    <>
                      {isRegularUser(user) && user.user_type === 'admin' && ( // This case handles if a non-admin page is accessed by an admin.
                        <Link href="/admin" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
                          Admin
                        </Link>
                      )}
                      {isRegularUser(user) && user.user_type === 'student' && currentPage !== 'browse-jobs' && (
                        <Link href="/browse-jobs" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
                          Browse Jobs
                        </Link>
                      )}
                      {isRegularUser(user) && user.user_type === 'employer' && currentPage !== 'post-job' && (
                        <Link href="/post-job" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
                          Post Job
                        </Link>
                      )}
                      {/* My Account link for both students and employers */}
                      {isRegularUser(user) && (user.user_type === 'student' || user.user_type === 'employer') && (
                        <Link href="/my-account" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
                          My Account
                        </Link>
                      )}
                      <button onClick={logout} className="text-sm font-medium text-foreground hover:text-primary transition-colors">
                        Sign Out
                      </button>
                    </>
                  ) : (
                    // User is not logged in (non-admin dashboard mode)
                    <div className="flex items-center gap-4">
                      <Link href="/login" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
                        Sign In
                      </Link>
                      <Button asChild size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                        <Link href="/signup">Sign Up</Link>
                      </Button>
                    </div>
                  )}
                </>
              )
            )}

            {/* Theme Toggle - Always at the far right on desktop */}
            {!adminDashboardMode && (
              <div className="hidden sm:block">
                <ThemeToggle />
              </div>
            )}
          </nav>
        </div>

        {/* Mobile dropdown menu */}
        {mobileOpen && (
          <div className="sm:hidden absolute top-full right-0 z-50 mt-1">
            <div className="mr-4 border border-border bg-background rounded-lg shadow-lg w-fit">
              <div className="p-2 flex flex-col gap-1.5">
              {!adminDashboardMode && (
                <>
                  <Link href={pricingHref} className="block px-4 py-2 text-sm font-medium text-foreground hover:text-primary transition-colors" onClick={() => setMobileOpen(false)}>
                    Pricing
                  </Link>
                  {!user && (
                    <Link href="/how-it-works" className="block px-4 py-2 text-sm font-medium text-foreground hover:text-primary transition-colors" onClick={() => setMobileOpen(false)}>
                      How it works
                    </Link>
                  )}
                  <Link href="/about" className="block px-4 py-2 text-sm font-medium text-foreground hover:text-primary transition-colors" onClick={() => setMobileOpen(false)}>
                    About Us
                  </Link>
                </>
              )}

              {adminDashboardMode ? (
                user && isAdminUser(user) && (
                  <div className="px-3 py-2">
                    <Button
                      onClick={() => {
                        setMobileOpen(false);
                        logout && logout();
                      }}
                      variant="outline"
                      className="bg-red-600 hover:bg-red-700 text-white border-red-700"
                    >
                      Sign Out
                    </Button>
                  </div>
                )
              ) : (
                showAuth && (
                  <>
                    {isLoading ? (
                      <span className="text-sm font-medium text-muted-foreground">Loading...</span>
                    ) : user ? (
                      <>
                        {isRegularUser(user) && user.user_type === 'admin' && (
                          <Link href="/admin" className="block px-4 py-2 text-sm font-medium text-foreground hover:text-primary transition-colors" onClick={() => setMobileOpen(false)}>
                            Admin
                          </Link>
                        )}
                        {isRegularUser(user) && user.user_type === 'student' && currentPage !== 'browse-jobs' && (
                          <Link href="/browse-jobs" className="block px-4 py-2 text-sm font-medium text-foreground hover:text-primary transition-colors" onClick={() => setMobileOpen(false)}>
                            Browse Jobs
                          </Link>
                        )}
                        {isRegularUser(user) && user.user_type === 'employer' && currentPage !== 'post-job' && (
                          <Link href="/post-job" className="block px-4 py-2 text-sm font-medium text-foreground hover:text-primary transition-colors" onClick={() => setMobileOpen(false)}>
                            Post Job
                          </Link>
                        )}
                        {isRegularUser(user) && (user.user_type === 'student' || user.user_type === 'employer') && (
                          <Link href="/my-account" className="block px-4 py-2 text-sm font-medium text-foreground hover:text-primary transition-colors" onClick={() => setMobileOpen(false)}>
                            My Account
                          </Link>
                        )}
                        <div className="px-4 py-2">
                          <button
                            onClick={() => {
                              setMobileOpen(false);
                              logout && logout();
                            }}
                            className="text-left text-sm font-medium text-foreground hover:text-primary transition-colors"
                          >
                            Sign Out
                          </button>
                        </div>
                      </>
                    ) : (
                      <div className="px-4 py-2 flex items-center gap-3">
                        <Link href="/login" className="text-sm font-medium text-foreground hover:text-primary transition-colors" onClick={() => setMobileOpen(false)}>
                          Sign In
                        </Link>
                        <Button asChild size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                          <Link href="/signup" onClick={() => setMobileOpen(false)}>Sign Up</Link>
                        </Button>
                      </div>
                    )}
                  </>
                )
              )}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}