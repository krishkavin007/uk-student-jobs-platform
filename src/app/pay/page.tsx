'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from "next/link" // Ensure Link is imported
import { Header } from '@/components/ui/header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { ContactModal } from "@/components/ui/contact-modal" // Ensure ContactModal is imported

function PaymentContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [saveCard, setSaveCard] = useState(false)
  const [useSavedCard, setUseSavedCard] = useState(false)
  const [savedCards] = useState([
    { id: 1, last4: "4242", brand: "Visa", expiryMonth: 12, expiryYear: 2028 },
    { id: 2, last4: "1234", brand: "Mastercard", expiryMonth: 8, expiryYear: 2027 }
  ])

  const jobId = searchParams.get('jobId')
  const type = searchParams.get('type') // 'phone' or 'apply'
  const amount = type === 'phone' ? '1.00' : '1.00'

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000))

    // Auto account creation after successful payment
    const userEmail = "user@example.com" // In real app, get from form or context
    const userType = type === 'phone' ? 'student' : 'employer'

    // Create account with payment details
    const newAccount = {
      email: userEmail,
      type: userType,
      createdAt: new Date().toISOString(),
      paymentMethod: useSavedCard ? 'saved_card' : 'new_card',
      firstPayment: {
        amount: parseFloat(amount),
        type: type === 'phone' ? 'Phone Reveal' : 'Job Application',
        jobId: jobId
      }
    }

    console.log('Account created:', newAccount)

    if (saveCard && !useSavedCard) {
      console.log('Card saved for future payments')
    }

    alert(`Payment successful! ${userType === 'employer' ? 'Employer' : 'Student'} account created. Redirecting...`)

    if (type === 'phone') {
      router.push(`/browse-jobs?revealed=${jobId}`)
    } else {
      router.push('/my-account?tab=activity')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header userType="student" />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>
                {type === 'phone' ? 'Reveal Phone Number' : 'Apply to Job'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-sm font-medium">Payment Summary</p>
                <p className="text-2xl font-bold text-blue-600">£{amount}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {type === 'phone' ? 'Phone number reveal' : 'Job application fee'}
                </p>
                <div className="mt-2 pt-2 border-t border-blue-200 dark:border-blue-700">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    <strong>No additional fees:</strong> What you see is what you pay.
                    Includes secure payment processing and instant access.
                  </p>
                </div>
              </div>

              {savedCards.length > 0 && (
                <div className="mb-4">
                  <div className="flex items-center space-x-2 mb-3">
                    <Checkbox
                      id="useSavedCard"
                      checked={useSavedCard}
                      onCheckedChange={(checked) => setUseSavedCard(!!checked)}
                    />
                    <Label htmlFor="useSavedCard">Use saved payment method</Label>
                  </div>

                  {useSavedCard && (
                    <div className="space-y-2">
                      {savedCards.map((card) => (
                        <div key={card.id} className="border rounded-lg p-3 cursor-pointer hover:bg-gray-50">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <input type="radio" name="savedCard" defaultChecked={card.id === 1} />
                              <div>
                                <p className="font-medium">{card.brand} •••• {card.last4}</p>
                                <p className="text-sm text-gray-500">Expires {card.expiryMonth}/{card.expiryYear}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <form onSubmit={handlePayment} className="space-y-4">
                {!useSavedCard && (
                  <>
                    <div>
                      <Label htmlFor="cardNumber">Card Number</Label>
                      <Input id="cardNumber" placeholder="1234 5678 9012 3456" required />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="expiry">Expiry</Label>
                        <Input id="expiry" placeholder="MM/YY" required />
                      </div>
                      <div>
                        <Label htmlFor="cvv">CVV</Label>
                        <Input id="cvv" placeholder="123" required />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="name">Name on Card</Label>
                      <Input id="name" placeholder="John Smith" required />
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="saveCard"
                        checked={saveCard}
                        onCheckedChange={(checked) => setSaveCard(!!checked)}
                      />
                      <Label htmlFor="saveCard" className="text-sm">Save this card for future payments</Label>
                    </div>
                  </>
                )}

                <Button
                  type="submit"
                  className="w-full"
                  disabled={loading}
                >
                  {loading ? 'Processing...' : `Pay £${amount}`}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Footer */}
      <footer className="w-full py-6 bg-gray-900 text-white mt-16">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="grid gap-8 lg:grid-cols-4">
            <div>
              <h3 className="font-bold text-lg mb-4">StudentJobs UK</h3>
              <p className="text-gray-300 text-sm">
                Connecting UK students with flexible part-time opportunities.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-3">For Students</h4>
              <nav className="flex flex-col space-y-2 text-sm">
                <Link href="/browse-jobs" className="text-gray-300 hover:text-white">Browse Jobs</Link>
                <Link href="/how-it-works" className="text-gray-300 hover:text-white">How It Works</Link>
                <Link href="/student-guide" className="text-gray-300 hover:text-white">Student Guide</Link>
              </nav>
            </div>
            <div>
              <h4 className="font-semibold mb-3">For Employers</h4>
              <nav className="flex flex-col space-y-2 text-sm">
                <Link href="/post-job" className="text-gray-300 hover:text-white">Post a Job</Link>
                <Link href="/pricing" className="text-gray-300 hover:text-white">Pricing</Link>
                <Link href="/employer-guide" className="text-gray-300 hover:text-white">Employer Guide</Link>
              </nav>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Legal</h4>
              <nav className="flex flex-col space-y-2 text-sm">
                <Link href="/privacy" className="text-gray-300 hover:text-white">Privacy Policy</Link>
                <Link href="/terms" className="text-gray-300 hover:text-white">Terms & Conditions</Link>
                <Link href="/refund-policy" className="text-gray-300 hover:text-white">Refund Policy</Link>
                <Link href="/about" className="text-gray-300 hover:text-white">About Us</Link>
                <ContactModal>
                  <button className="text-gray-300 hover:text-white text-sm text-left w-full pl-0">
                    Contact Us
                  </button>
                </ContactModal>
              </nav>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-800 text-center text-sm text-gray-300">
            © 2025 StudentJobs UK. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}

export default function PaymentPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-2 text-gray-600">Loading payment form...</p>
      </div>
    </div>}>
      <PaymentContent />
    </Suspense>
  )
}