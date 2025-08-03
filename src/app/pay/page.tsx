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
// Removed: import Image from 'next/image' // No longer needed if no images are used

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

  // State for multi-stage form
  const [currentStage, setCurrentStage] = useState(1); // 1 for billing, 2 for payment options

  // State for billing details
  const [billingName, setBillingName] = useState('');
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [city, setCity] = useState('');
  const [postcode, setPostcode] = useState('');
  const [country] = useState('United Kingdom'); // Fixed to UK as per prompt
  const [saveBillingAddress, setSaveBillingAddress] = useState(false);


  // Get authentication state from useAuth hook
  const { user, isLoading: isAuthLoading, logout } = useAuth();

  const jobId = searchParams?.get('jobId')
  const purchaseType = searchParams?.get('type');

  let displayAmount = '0.00';
  let purchaseItemName = 'Purchase';
  let redirectPathOnSuccess = '/my-account';

  useEffect(() => {
    // Ensure the 'dark' class is present on the html element
    document.documentElement.classList.add('dark');
  }, []);

  if (purchaseType === 'pro_pack') {
    if (!isAuthLoading && user && user.user_type === 'employer') {
      router.replace('/post-job');
      return null;
    }
    displayAmount = '5.00';
    purchaseItemName = 'Student Pro Pack';
    redirectPathOnSuccess = '/my-account?tab=credits';
  } else if (purchaseType === 'phone') {
    displayAmount = '1.00';
    purchaseItemName = `Phone Number Reveal for Job ID: ${jobId || 'N/A'}`;
    redirectPathOnSuccess = `/browse-jobs?revealed=${jobId}`;
  } else {
    displayAmount = searchParams?.get('amount') || '1.00';
    purchaseItemName = `Service Fee for: ${purchaseType || 'Unknown Item'}`;
  }

  const simulatePaymentSuccess = async (method: string) => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate processing time

    console.log(`Payment successful via ${method} for ${purchaseItemName}.`);
    console.log(`User: ${user?.user_email || 'Logged Out User (just signed up)'}`);
    console.log(`Amount: £${displayAmount}`);
    console.log(`Billing Address:`, { billingName, addressLine1, addressLine2, city, postcode, country });
    if (method === 'Card') {
      console.log(`Saved card: ${saveCard}, Used saved card: ${useSavedCard}`);
    }
    console.log(`Save Billing Address: ${saveBillingAddress}`);


    alert(`Payment successful via ${method} for ${purchaseItemName}! Redirecting...`);

    router.push(redirectPathOnSuccess);
    setLoading(false);
  };

  const handleNextStage = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, you might validate billing fields here
    setCurrentStage(2);
  };

  const handleApplePay = (e: React.MouseEvent) => {
    e.preventDefault();
    // Here you would typically initiate Apple Pay SDK
    simulatePaymentSuccess('Apple Pay');
  };

  const handleGooglePay = (e: React.MouseEvent) => {
    e.preventDefault();
    // Here you would typically initiate Google Pay SDK
    simulatePaymentSuccess('Google Pay');
  };

  const handleCardPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate card payment processing
    simulatePaymentSuccess('Card');
  };


  if (isAuthLoading) {
      return (
          <div className="min-h-screen bg-gray-950 flex items-center justify-center">
              <p className="text-gray-300">Checking user authentication...</p>
          </div>
      );
  }

  if (purchaseType === 'pro_pack' && user?.user_type === 'employer') {
    return null;
  }

  const pricingHref = user?.user_type === "student" ? "/pricing#student" : "/pricing#employer";

  return (
    <div className="min-h-screen bg-[rgb(7,8,21)] text-white flex flex-col pt-[80px]">
      <Header
        user={user}
        isLoading={isAuthLoading}
        logout={logout}
        pricingHref={pricingHref}
        className="fixed top-0 left-0 right-0 z-[9999] bg-gray-900 text-white border-b-0"
      />

      <div className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <Card className="bg-gray-800 border border-gray-700 shadow-xl rounded-2xl text-white">
            <CardHeader className="border-b border-gray-700 pb-4">
              <CardTitle className="text-2xl font-bold text-white">
                {currentStage === 1 ? 'Billing Details' : 'Payment Method'}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="mb-6 p-4 bg-blue-900/20 rounded-lg border border-blue-700">
                <p className="text-sm font-medium text-blue-300">Payment Summary</p>
                <p className="text-2xl font-bold text-blue-400">£{displayAmount}</p>
                <p className="text-sm text-gray-400">
                  {purchaseItemName}
                </p>
                <div className="mt-2 pt-2 border-t border-blue-700">
                  <p className="text-xs text-gray-400">
                    No additional fees: What you see is what you pay.
                    Includes secure payment processing and instant access.
                  </p>
                </div>
              </div>

              {/* Stage 1: Billing Information */}
              {currentStage === 1 && (
                <form onSubmit={handleNextStage} className="space-y-4">
                  <div>
                    <Label htmlFor="billingName" className="text-gray-300">Full Name</Label>
                    <Input
                      id="billingName"
                      placeholder="John Smith"
                      required
                      value={billingName}
                      onChange={(e) => setBillingName(e.target.value)}
                      className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <Label htmlFor="addressLine1" className="text-gray-300">Address Line 1</Label>
                    <Input
                      id="addressLine1"
                      placeholder="123 Example Street"
                      required
                      value={addressLine1}
                      onChange={(e) => setAddressLine1(e.target.value)}
                      className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <Label htmlFor="addressLine2" className="text-gray-300">Address Line 2 (Optional)</Label>
                    <Input
                      id="addressLine2"
                      placeholder="Apt, Suite, Building"
                      value={addressLine2}
                      onChange={(e) => setAddressLine2(e.target.value)}
                      className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-blue-500"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="city" className="text-gray-300">City</Label>
                      <Input
                        id="city"
                        placeholder="London"
                        required
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <Label htmlFor="postcode" className="text-gray-300">Postcode</Label>
                      <Input
                        id="postcode"
                        placeholder="SW1A 0AA"
                        required
                        value={postcode}
                        onChange={(e) => setPostcode(e.target.value)}
                        className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="country" className="text-gray-300">Country</Label>
                    <Input
                      id="country"
                      placeholder="United Kingdom"
                      required
                      value={country}
                      readOnly
                      className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-blue-500 cursor-not-allowed"
                    />
                  </div>

                  <div className="flex items-center space-x-2 pt-2">
                    <Checkbox
                      id="saveBillingAddress"
                      checked={saveBillingAddress}
                      onCheckedChange={(checked) => setSaveBillingAddress(!!checked)}
                      className="border-gray-600 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white"
                    />
                    <Label htmlFor="saveBillingAddress" className="text-sm text-gray-300">Save this billing address for future payments</Label>
                  </div>

                  <div className="flex justify-end pt-4">
                    <Button
                      type="submit"
                      className="bg-blue-700 hover:bg-blue-800 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 shadow-md"
                    >
                      Next
                    </Button>
                  </div>
                </form>
              )}

              {/* Stage 2: Payment Method Selection */}
              {currentStage === 2 && (
                <div className="space-y-6">
                  {/* Apple Pay Button (text only) */}
                  <Button
                    onClick={handleApplePay}
                    className="w-full bg-black text-white py-3 px-6 rounded-lg flex items-center justify-center gap-2 font-semibold transition-colors duration-200 shadow-md hover:bg-gray-900"
                    disabled={loading}
                  >
                    Pay with Apple Pay
                  </Button>

                  {/* Google Pay Button (text only) */}
                  <Button
                    onClick={handleGooglePay}
                    className="w-full bg-gray-200 text-gray-900 py-3 px-6 rounded-lg flex items-center justify-center gap-2 font-semibold transition-colors duration-200 shadow-md hover:bg-gray-300"
                    disabled={loading}
                  >
                    Pay with Google Pay
                  </Button>

                  {/* Separator */}
                  <div className="relative flex items-center py-5">
                    <div className="flex-grow border-t border-gray-700"></div>
                    <span className="flex-shrink mx-4 text-gray-500 text-sm">Or pay by card</span>
                    <div className="flex-grow border-t border-gray-700"></div>
                  </div>

                  {/* Card Payment Form */}
                  <form onSubmit={handleCardPayment} className="space-y-4">
                    {savedCards.length > 0 && (
                      <div className="mb-4">
                        <div className="flex items-center space-x-2 mb-3">
                          <Checkbox
                            id="useSavedCard"
                            checked={useSavedCard}
                            onCheckedChange={(checked) => setUseSavedCard(!!checked)}
                            className="border-gray-600 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white"
                          />
                          <Label htmlFor="useSavedCard" className="text-gray-300">Use saved payment method</Label>
                        </div>

                        {useSavedCard && (
                          <div className="space-y-2">
                            {savedCards.map((card) => (
                              <div key={card.id} className="border border-gray-700 rounded-lg p-3 cursor-pointer bg-gray-700 hover:bg-gray-600 transition-colors">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-3">
                                    <input
                                      type="radio"
                                      name="savedCard"
                                      defaultChecked={card.id === 1}
                                      className="form-radio h-4 w-4 text-blue-600 bg-gray-600 border-gray-500 focus:ring-blue-500"
                                    />
                                    <div>
                                      <p className="font-medium text-white">{card.brand} {card.last4}</p>
                                      <p className="text-sm text-gray-400">Expires {card.expiryMonth}/{card.expiryYear}</p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {!useSavedCard && (
                      <>
                        <div>
                          <Label htmlFor="name" className="text-gray-300">Name on Card</Label>
                          <Input
                            id="name"
                            placeholder="John Smith"
                            required
                            className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-blue-500"
                          />
                        </div>

                        <div>
                          <Label htmlFor="cardNumber" className="text-gray-300">Card Number</Label>
                          <Input
                            id="cardNumber"
                            placeholder="1234 5678 9012 3456"
                            required
                            className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-blue-500"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="expiry" className="text-gray-300">Expiry</Label>
                            <Input
                              id="expiry"
                              placeholder="MM/YY"
                              required
                              className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <Label htmlFor="cvv" className="text-gray-300">CVV</Label>
                            <Input
                              id="cvv"
                              placeholder="123"
                              required
                              className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-blue-500"
                            />
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="saveCard"
                            checked={saveCard}
                            onCheckedChange={(checked) => setSaveCard(!!checked)}
                            className="border-gray-600 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white"
                          />
                          <Label htmlFor="saveCard" className="text-sm text-gray-300">Save this card for future payments</Label>
                        </div>
                      </>
                    )}

                    <div className="flex justify-between items-center pt-4">
                      <Button
                        type="button"
                        onClick={() => setCurrentStage(1)}
                        variant="outline"
                        className="border-gray-600 hover:bg-gray-700 text-gray-300 py-3 px-6 rounded-lg transition-colors duration-200"
                      >
                        Back
                      </Button>
                      <Button
                        type="submit"
                        className="bg-blue-700 hover:bg-blue-800 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 shadow-md"
                        disabled={loading}
                      >
                        {loading ? 'Processing...' : `Pay £${displayAmount}`}
                      </Button>
                    </div>
                  </form>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Footer - already dark, no changes needed */}
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
    <Suspense fallback={<div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-2 text-gray-300">Loading payment form...</p>
      </div>
    </div>}>
      <PaymentContent />
    </Suspense>
  )
}
