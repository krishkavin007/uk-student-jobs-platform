// src/components/ui/google-signin-button.tsx
"use client"

import { Button } from '@/components/ui/button'
import { FcGoogle } from 'react-icons/fc'

interface GoogleSignInButtonProps {
  onClick: () => void
  disabled?: boolean
  loading?: boolean
  variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  className?: string
  children?: React.ReactNode
}

export function GoogleSignInButton({
  onClick,
  disabled = false,
  loading = false,
  variant = 'outline',
  size = 'default',
  className = '',
  children
}: GoogleSignInButtonProps) {
  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      onClick={onClick}
      disabled={disabled || loading}
      className={`w-full border-2 hover:bg-gray-50 dark:hover:bg-gray-900 ${className}`}
    >
      {loading ? (
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
      ) : (
        <FcGoogle className="w-5 h-5 mr-2" />
      )}
      {children || 'Continue with Google'}
    </Button>
  )
}

// Alternative styled version for different contexts
export function GoogleSignInButtonAlt({
  onClick,
  disabled = false,
  loading = false,
  className = '',
  children
}: Omit<GoogleSignInButtonProps, 'variant' | 'size'>) {
  return (
    <Button
      type="button"
      variant="outline"
      size="lg"
      onClick={onClick}
      disabled={disabled || loading}
      className={`w-full bg-white hover:bg-gray-50 text-gray-700 border-gray-300 hover:border-gray-400 shadow-sm ${className}`}
    >
      {loading ? (
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
      ) : (
        <FcGoogle className="w-5 h-5 mr-2" />
      )}
      {children || 'Sign in with Google'}
    </Button>
  )
}
