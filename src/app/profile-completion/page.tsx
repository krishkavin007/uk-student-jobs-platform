// src/app/profile-completion/page.tsx
"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Header } from '@/components/ui/header'
import { useAuth } from '@/app/context/AuthContext'
import { CheckCircle, AlertCircle } from 'lucide-react'

export default function ProfileCompletionPage() {
  const router = useRouter()
  const { user, isLoading, refreshUser } = useAuth()
  
  const [formData, setFormData] = useState({
    contact_phone_number: '',
    user_city: '',
    university_college: '',
    organisation_name: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Redirect if user is not authenticated or hasn't completed previous steps
  useEffect(() => {
    if (!isLoading && (!user || !user.terms_accepted_at || !user.privacy_accepted_at || !user.user_type)) {
      router.push('/user-type-selection')
    }
  }, [user, isLoading, router])

  // Initialize form with existing data
  useEffect(() => {
    if (user) {
      setFormData({
        contact_phone_number: user.contact_phone_number || '',
        user_city: user.user_city || '',
        university_college: user.university_college || '',
        organisation_name: user.organisation_name || '',
      })
    }
  }, [user])

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate required fields based on user type
    const requiredFields = ['contact_phone_number', 'user_city']
    if (user?.user_type === 'student') {
      requiredFields.push('university_college')
    } else if (user?.user_type === 'employer') {
      requiredFields.push('organisation_name')
    }

    const missingFields = requiredFields.filter(field => !formData[field as keyof typeof formData])
    
    if (missingFields.length > 0) {
      setError(`Please fill in all required fields: ${missingFields.join(', ')}`)
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
          contact_phone_number: formData.contact_phone_number,
          user_city: formData.user_city,
          university_college: user?.user_type === 'student' ? formData.university_college : null,
          organisation_name: user?.user_type === 'employer' ? formData.organisation_name : null,
          profile_completion_status: 'completed',
        }),
      })

      if (response.ok) {
        const result = await response.json()
        console.log('--- DEBUG: Profile completed successfully:', result)
        
        await refreshUser()
        // Redirect to my-account page
        router.push('/my-account')
      } else {
        const errorData = await response.json()
        console.error('--- ERROR: Failed to save profile:', errorData)
        setError(errorData.error?.message || 'Failed to save profile. Please try again.')
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

  if (!user || !user.terms_accepted_at || !user.privacy_accepted_at || !user.user_type) {
    return null
  }

  const isStudent = user.user_type === 'student'
  const isEmployer = user.user_type === 'employer'

  return (
    <div className="min-h-screen bg-background pt-[80px]">
      <Header
        user={user}
        isLoading={isLoading}
        currentPage="profile-completion"
        className="fixed top-0 left-0 right-0 z-[9999] bg-background border-b border-border"
      />

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Complete Your Profile
          </h1>
          <p className="text-lg text-muted-foreground">
            Almost there! Just a few more details to get you started.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">
              Profile Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Progress Indicator */}
              <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <CheckCircle className="w-5 h-5 text-blue-500" />
                  <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                    Account Type Selected: {isStudent ? 'Student' : 'Employer'}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-blue-500" />
                  <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                    Terms & Privacy Accepted
                  </span>
                </div>
              </div>

              {/* Phone Number - Required for all users */}
              <div className="space-y-2">
                <Label htmlFor="contact_phone_number" className="text-foreground">
                  Phone Number <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="contact_phone_number"
                  type="tel"
                  placeholder="+44 7XXX XXX XXX"
                  value={formData.contact_phone_number}
                  onChange={(e) => handleInputChange('contact_phone_number', e.target.value)}
                  required
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">
                  We'll use this to contact you about job opportunities or applications.
                </p>
              </div>

              {/* City - Required for all users */}
              <div className="space-y-2">
                <Label htmlFor="user_city" className="text-foreground">
                  City <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="user_city"
                  type="text"
                  placeholder="e.g., London, Manchester, Birmingham"
                  value={formData.user_city}
                  onChange={(e) => handleInputChange('user_city', e.target.value)}
                  required
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">
                  This helps us show you relevant local opportunities.
                </p>
              </div>

              {/* University/College - Required for students */}
              {isStudent && (
                <div className="space-y-2">
                  <Label htmlFor="university_college" className="text-foreground">
                    University/College <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="university_college"
                    type="text"
                    placeholder="e.g., University of Oxford, Manchester Metropolitan University"
                    value={formData.university_college}
                    onChange={(e) => handleInputChange('university_college', e.target.value)}
                    required
                    className="w-full"
                  />
                  <p className="text-xs text-muted-foreground">
                    Employers often prefer students from specific institutions.
                  </p>
                </div>
              )}

              {/* Organisation Name - Required for employers */}
              {isEmployer && (
                <div className="space-y-2">
                  <Label htmlFor="organisation_name" className="text-foreground">
                    Business/Organisation Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="organisation_name"
                    type="text"
                    placeholder="e.g., My Cafe Ltd., Tech Solutions Ltd."
                    value={formData.organisation_name}
                    onChange={(e) => handleInputChange('organisation_name', e.target.value)}
                    required
                    className="w-full"
                  />
                  <p className="text-xs text-muted-foreground">
                    This will be displayed on your job postings.
                  </p>
                </div>
              )}

              {/* Error Display */}
              {error && (
                <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="w-5 h-5 text-red-500" />
                    <p className="text-red-800 dark:text-red-200 text-sm">{error}</p>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                size="lg"
              >
                {isSubmitting ? 'Saving...' : 'Complete Profile & Continue'}
              </Button>

              <p className="text-xs text-muted-foreground text-center">
                You can update these details later in your account settings.
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
