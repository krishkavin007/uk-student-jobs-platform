// src/app/payment/page.tsx
'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from "next/link"
import { Header } from '@/components/ui/header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { ContactModal } from "@/components/ui/contact-modal"
import { useAuth } from '@/app/context/AuthContext'

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

  // Get authentication state from useAuth hook
  const { user, isLoading: isAuthLoading, logout } = useAuth();

  const jobId = searchParams?.get('jobId')
  const purchaseType = searchParams?.get('type'); // This will now correctly capture 'pro_pack'

  let displayAmount = '0.00';
  let purchaseItemName = 'Purchase';
  let redirectPathOnSuccess = '/my-account'; // Default redirect path

  // --- Logic to determine payment details based on 'type' query parameter ---
  if (purchaseType === 'pro_pack') {
    // IMPORTANT: Check if a logged-in employer is trying to buy a student pack
    if (!isAuthLoading && user && user.user_type === 'employer') {
      // Removed alert, now directly redirects
      router.replace('/post-job'); // Redirect employer to post job page
      return null; // Stop rendering this page for employers trying to buy student pack
    }
    displayAmount = '5.00'; // Fixed amount for Pro Pack
    purchaseItemName = 'Student Pro Pack';
    redirectPathOnSuccess = '/my-account?tab=credits'; // Redirect to a specific tab for credits
  } else if (purchaseType === 'phone') { // Existing 'phone' reveal flow
    displayAmount = '1.00'; // Fixed amount for phone reveal
    purchaseItemName = `Phone Number Reveal for Job ID: ${jobId || 'N/A'}`;
    redirectPathOnSuccess = `/browse-jobs?revealed=${jobId}`;
  } else {
    // Fallback for any other type or if 'type' is missing
    displayAmount = searchParams?.get('amount') || '1.00'; // Use 'amount' param if present, or default
    purchaseItemName = `Service Fee for: ${purchaseType || 'Unknown Item'}`;
    // Default redirectPathOnSuccess remains '/my-account'
  }
  // --- END OF KEY LOGIC ---


  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // --- In a real application, this is where actual payment gateway integration would happen ---
    // Example: Stripe.js tokenization, then sending token to your backend.
    // await stripe.confirmCardPayment(clientSecret, { payment_method: { card: cardElement } });
    // ---

    // Simulate payment processing for demonstration purposes
    await new Promise(resolve => setTimeout(resolve, 2000))

    // After simulated payment success:
    console.log(`Payment successful for ${purchaseItemName}.`);
    console.log(`User: ${user?.user_email || 'Logged Out User (just signed up)'}`); // User info from AuthContext
    console.log(`Amount: £${displayAmount}`);
    console.log(`Saved card: ${saveCard}, Used saved card: ${useSavedCard}`);

    alert(`Payment successful for ${purchaseItemName}! Redirecting...`);

    // Redirect to the determined success path
    router.push(redirectPathOnSuccess);

    setLoading(false);
  }

  // Render a loading state while authentication status is being determined
  if (isAuthLoading) {
      return (
          <div className="min-h-screen bg-gray-50 flex items-center justify-center">
              <p className="text-gray-700">Checking user authentication...</p>
          </div>
      );
  }

  // If a redirect happened above (for employer buying student pack), return null to stop rendering
  // This check is important as it ensures the redirect takes effect before the component renders fully.
  if (purchaseType === 'pro_pack' && user?.user_type === 'employer') {
    return null;
  }

  // Determine the correct pricing href based on user type for the Header and Footer
  const pricingHref = user?.user_type === "student" ? "/pricing#student" : "/pricing#employer";

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      {/* Pass user, isLoading, and logout to the Header component */}
      <Header user={user} isLoading={isAuthLoading} logout={logout} pricingHref={pricingHref} />

      <div className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>
                Complete Your Purchase {/* Generic title for payment page */}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-sm font-medium">Payment Summary</p>
                <p className="text-2xl font-bold text-blue-600">£{displayAmount}</p> {/* Uses dynamic amount */}
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {purchaseItemName} {/* Uses dynamic item name */}
                </p>
                <div className="mt-2 pt-2 border-t border-blue-200 dark:border-blue-700">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    No additional fees: What you see is what you pay.
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
                                <p className="font-medium">{card.brand} {card.last4}</p>
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
                  {loading ? 'Processing...' : `Pay £${displayAmount}`} {/* Uses dynamic amount */}
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
                <Link href={pricingHref} className="text-gray-300 hover:text-white">Pricing</Link>
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