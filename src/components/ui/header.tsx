import Link from 'next/link'
import { Logo } from './logo'
import { Button } from './button'

interface HeaderProps {
  userType?: 'student' | 'employer' | 'admin' | null
  showAuth?: boolean
}

export function Header({ userType = null, showAuth = true }: HeaderProps) {
  return (
    <header className="bg-white dark:bg-gray-900 border-b dark:border-gray-700">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/">
            <Logo />
          </Link>

          {/* Main navigation with larger gap for primary items */}
          <nav className="flex items-center gap-10">
            <Link href="/pricing" className="text-sm font-medium hover:underline dark:text-gray-300">
              Pricing
            </Link>

            {/* ADDED: About Us link */}
            <Link href="/about" className="text-sm font-medium hover:underline dark:text-gray-300">
              About Us
            </Link>

            {userType === 'admin' && (
              <Link href="/admin" className="text-sm font-medium hover:underline dark:text-gray-300">
                Admin
              </Link>
            )}

            {userType === 'student' && (
              <>
                <Link href="/browse-jobs" className="text-sm font-medium hover:underline dark:text-gray-300">
                  Browse Jobs
                </Link>
                <Link href="/my-account" className="text-sm font-medium hover:underline dark:text-gray-300">
                  My Account
                </Link>
              </>
            )}

            {userType === 'employer' && (
              <>
                <Link href="/post-job" className="text-sm font-medium hover:underline dark:text-gray-300">
                  Post Job
                </Link>
                <Link href="/my-account" className="text-sm font-medium hover:underline dark:text-gray-300">
                  My Account
                </Link>
              </>
            )}

            {showAuth && !userType && (
              <div className="flex items-center gap-4">
                <Link href="/login" className="text-sm font-medium hover:underline dark:text-gray-300">
                  Sign In
                </Link>
                <Button asChild size="sm" className="bg-blue-600 hover:bg-blue-700">
                  <Link href="/signup">Sign Up</Link>
                </Button>
              </div>
            )}

            {userType && (
              <Link href="/login" className="text-sm font-medium hover:underline dark:text-gray-300">
                Sign Out
              </Link>
            )}
          </nav>
        </div>
      </div>
    </header>
  )
}