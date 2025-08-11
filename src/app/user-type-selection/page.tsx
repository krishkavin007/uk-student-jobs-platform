// src/app/user-type-selection/page.tsx
"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Header } from '@/components/ui/header'
import { useAuth } from '@/app/context/AuthContext'
import { GraduationCap, Building2, ArrowRight } from 'lucide-react'

export default function UserTypeSelectionPage() {
  const router = useRouter()
  const { user, isLoading, refreshUser } = useAuth()
  
  const [selectedType, setSelectedType] = useState<'student' | 'employer' | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Redirect if user is not authenticated or hasn't accepted terms
  useEffect(() => {
    if (!isLoading && (!user || !user.terms_accepted_at || !user.privacy_accepted_at)) {
      router.push('/terms-agreement')
    }
  }, [user, isLoading, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedType) {
      setError('Please select whether you are a student or employer.')
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
          user_type: selectedType,
        }),
      })

      if (response.ok) {
        const result = await response.json()
        console.log('--- DEBUG: User type selected successfully:', result)
        
        // Refresh user data to get updated user type
        if (refreshUser) {
          await refreshUser()
        }
        
        // Redirect to profile completion
        router.push('/profile-completion')
      } else {
        const errorData = await response.json()
        console.error('--- ERROR: Failed to save user type:', errorData)
        setError(errorData.error?.message || 'Failed to save user type. Please try again.')
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

  if (!user || !user.terms_accepted_at || !user.privacy_accepted_at) {
    return null
  }

  return (
    <div className="min-h-screen bg-background pt-[80px]">
      <Header
        user={user}
        isLoading={isLoading}
        currentPage="user-type-selection"
        className="fixed top-0 left-0 right-0 z-[9999] bg-background border-b border-border"
      />

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Choose Your Account Type
          </h1>
          <p className="text-lg text-muted-foreground">
            This helps us personalize your experience and ensure you see relevant content.
          </p>
        </div>

        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">
              I am a...
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Student Option */}
              <div className={`border-2 rounded-xl p-6 cursor-pointer transition-all duration-200 ${
                selectedType === 'student' 
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20' 
                  : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600'
              }`}
              onClick={() => setSelectedType('student')}>
                <div className="flex items-center space-x-4">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                    selectedType === 'student' 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                  }`}>
                    <GraduationCap className="w-8 h-8" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-foreground mb-2">Student</h3>
                    <p className="text-muted-foreground">
                      I'm looking for part-time work opportunities while studying. I want to browse jobs, 
                      apply to positions, and manage my applications.
                    </p>
                    <div className="mt-3 text-sm text-muted-foreground">
                      <strong>Perfect for:</strong> University students, college students, apprentices
                    </div>
                  </div>
                  {selectedType === 'student' && (
                    <div className="text-blue-500">
                      <ArrowRight className="w-6 h-6" />
                    </div>
                  )}
                </div>
              </div>

              {/* Employer Option */}
              <div className={`border-2 rounded-xl p-6 cursor-pointer transition-all duration-200 ${
                selectedType === 'employer' 
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20' 
                  : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600'
              }`}
              onClick={() => setSelectedType('employer')}>
                <div className="flex items-center space-x-4">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                    selectedType === 'employer' 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                  }`}>
                    <Building2 className="w-8 h-8" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-foreground mb-2">Employer</h3>
                    <p className="text-muted-foreground">
                      I want to post job opportunities, review applications, and hire students for 
                      part-time positions in my business or organization.
                    </p>
                    <div className="mt-3 text-sm text-muted-foreground">
                      <strong>Perfect for:</strong> Business owners, HR managers, recruiters
                    </div>
                  </div>
                  {selectedType === 'employer' && (
                    <div className="text-blue-500">
                      <ArrowRight className="w-6 h-6" />
                    </div>
                  )}
                </div>
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
                disabled={!selectedType || isSubmitting}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                size="lg"
              >
                {isSubmitting ? 'Processing...' : 'Continue to Profile Setup'}
              </Button>

              <p className="text-xs text-muted-foreground text-center">
                You can change this later by contacting support if needed.
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
