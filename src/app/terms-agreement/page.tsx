// src/app/terms-agreement/page.tsx
"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Header } from '@/components/ui/header'
import { useAuth } from '@/app/context/AuthContext'

export default function TermsAgreementPage() {
  const router = useRouter()
  const { user, isLoading, refreshUser } = useAuth()
  
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [privacyAccepted, setPrivacyAccepted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Redirect if user is not authenticated or not a new Google user
  useEffect(() => {
    if (!isLoading && (!user || !user.google_oauth_completed)) {
      router.push('/login')
    }
  }, [user, isLoading, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!termsAccepted || !privacyAccepted) {
      setError('You must accept both the Terms & Conditions and Privacy Policy to continue.')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch(`/api/auth/user/${user?.user_id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          terms_accepted_at: new Date().toISOString(),
          privacy_accepted_at: new Date().toISOString(),
        }),
      })

      if (response.ok) {
        const result = await response.json()
        console.log('--- DEBUG: Terms accepted successfully:', result)
        
        // Refresh user data to get updated terms acceptance
        if (refreshUser) {
          await refreshUser()
        }
        
        // Redirect to user type selection
        router.push('/user-type-selection')
      } else {
        const errorData = await response.json()
        console.error('--- ERROR: Failed to save terms:', errorData)
        setError(errorData.error?.message || 'Failed to save agreement. Please try again.')
      }
    } catch (err) {
      console.error('--- ERROR: Network error:', err)
      setError('Network error. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className="text-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user || !user.google_oauth_completed) {
    return null
  }

  return (
    <div className="min-h-screen bg-background pt-[80px]">
      <Header
        user={user}
        isLoading={isLoading}
        currentPage="terms-agreement"
        className="fixed top-0 left-0 right-0 z-[9999] bg-background border-b border-border"
      />

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Welcome to StudentJobs UK!
          </h1>
          <p className="text-lg text-muted-foreground">
            Before you can access your account, please review and accept our terms and privacy policy.
          </p>
        </div>

        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">
              Terms & Conditions & Privacy Policy Agreement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Terms & Conditions */}
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="terms"
                    checked={termsAccepted}
                    onCheckedChange={(checked) => setTermsAccepted(checked as boolean)}
                    className="mt-1"
                  />
                  <div className="space-y-2">
                    <label htmlFor="terms" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      I accept the Terms & Conditions
                    </label>
                    <p className="text-sm text-muted-foreground">
                      I have read and agree to the{' '}
                      <Link href="/terms" target="_blank" className="text-blue-600 hover:underline">
                        Terms & Conditions
                      </Link>
                      {' '}governing my use of StudentJobs UK.
                    </p>
                  </div>
                </div>
              </div>

              {/* Privacy Policy */}
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="privacy"
                    checked={privacyAccepted}
                    onCheckedChange={(checked) => setPrivacyAccepted(checked as boolean)}
                    className="mt-1"
                  />
                  <div className="space-y-2">
                    <label htmlFor="privacy" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      I accept the Privacy Policy
                    </label>
                    <p className="text-sm text-muted-foreground">
                      I have read and agree to the{' '}
                      <Link href="/privacy" target="_blank" className="text-blue-600 hover:underline">
                        Privacy Policy
                      </Link>
                      {' '}and consent to the processing of my personal data in accordance with GDPR and UK data protection laws.
                    </p>
                  </div>
                </div>
              </div>

              {/* GDPR Compliance Notice */}
              <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                  Your Data Rights (GDPR Compliance)
                </h3>
                <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                  <li>• You have the right to access, correct, or delete your personal data</li>
                  <li>• You can withdraw consent at any time</li>
                  <li>• Your data is processed securely and only for specified purposes</li>
                  <li>• You can contact us about any data protection concerns</li>
                </ul>
              </div>

              {/* Error Display */}
              {error && (
                <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                  <p className="text-red-800 dark:text-red-200 text-sm">{error}</p>
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={!termsAccepted || !privacyAccepted || isSubmitting}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                size="lg"
              >
                {isSubmitting ? 'Processing...' : 'Continue to Account Setup'}
              </Button>

              <p className="text-xs text-muted-foreground text-center">
                By continuing, you acknowledge that you have read and understood our terms and privacy policy.
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
