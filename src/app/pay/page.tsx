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
// Removed ContactModal import; global footer contains contact
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
  const { user, isLoading: isAuthLoading, logout, refreshUser } = useAuth();

  const jobId = searchParams?.get('jobId')
  const purchaseType = searchParams?.get('type');

  // If no type is provided, render themed 404 content inline (URL remains)
  if (!purchaseType) {
    const NotFoundContent = require('@/components/ui/not-found-content').default
    return <NotFoundContent />
  }
  const isSponsored = searchParams?.get('sponsored') === 'true';

  let displayAmount = '0.00';
  let purchaseItemName = 'Purchase';
  let redirectPathOnSuccess = '/my-account';

  // Removed forced dark theme; global theme logic in layout handles this

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
  } else if (purchaseType === 'apply') {
    displayAmount = '1.00';
    purchaseItemName = `Job Application Fee`;
    redirectPathOnSuccess = `/browse-jobs?applied=${jobId}`;
  } else if (purchaseType === 'reactivate') {
    displayAmount = isSponsored ? '5.00' : '1.00';
    purchaseItemName = isSponsored ? `Sponsored Job Reactivation Fee` : `Job Reactivation Fee`;
    redirectPathOnSuccess = '/my-account?tab=activity';
  } else if (purchaseType === 'upgrade') {
    displayAmount = '5.00';
    purchaseItemName = `Job Sponsorship Upgrade`;
    redirectPathOnSuccess = '/my-account?tab=activity';
  } else if (purchaseType === 'post_job') {
    displayAmount = isSponsored ? '5.00' : '1.00';
    purchaseItemName = isSponsored ? 'Sponsored Job Posting' : 'Job Posting Fee';
    redirectPathOnSuccess = '/my-account';
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

    // Handle job application submission if this is an apply payment
    if (purchaseType === 'apply' && jobId) {
      try {
        // Get the application message from sessionStorage
        const applicationMessage = sessionStorage.getItem('applicationMessage');
        
        if (!applicationMessage) {
          console.error('No application message found in sessionStorage');
          alert('There was an issue with your application. Please try again.');
          router.push('/browse-jobs');
          return;
        }
        
        // Submit the job application
        const response = await fetch('/api/job/apply', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            job_id: parseInt(jobId),
            application_message: applicationMessage
          })
        });

        // Clear the application message from sessionStorage after use
        sessionStorage.removeItem('applicationMessage');

        if (response.ok) {
          console.log('Job application submitted successfully after payment');
          // Redirect to browse-jobs with the job marked as applied
          router.push(`/browse-jobs?applied=${jobId}`);
        } else if (response.status === 409) {
          console.log('Already applied to this job');
          router.push(`/browse-jobs?applied=${jobId}`);
        } else {
          console.error('Failed to submit application after payment:', response.status);
          router.push('/browse-jobs');
        }
      } catch (error) {
        console.error('Error submitting application after payment:', error);
        router.push('/browse-jobs');
      }
    } else if (purchaseType === 'reactivate' && jobId) {
      // Handle job reactivation after payment
      try {
        const response = await fetch(`/api/job/${jobId}/reactivate-after-payment`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });

        if (response.ok) {
          console.log('Job reactivated successfully after payment');
          alert('Payment successful! Your job has been reactivated and is now visible to students again.');
          router.push('/my-account?tab=activity');
        } else {
          console.error('Failed to reactivate job after payment:', response.status);
          alert('Payment successful, but there was an issue reactivating your job. Please contact support.');
          router.push('/my-account?tab=activity');
        }
              } catch (error) {
          console.error('Error reactivating job after payment:', error);
          alert('Payment successful, but there was an issue reactivating your job. Please contact support.');
          router.push('/my-account?tab=activity');
        }
      } else if (purchaseType === 'upgrade' && jobId) {
        // Handle job sponsorship upgrade after payment
        try {
          const response = await fetch(`/api/job/${jobId}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({
              is_sponsored: true
            })
          });

          if (response.ok) {
            console.log('Job upgraded to sponsored successfully after payment');
            alert('Payment successful! Your job has been upgraded to sponsored and will now appear at the top of search results.');
            router.push('/my-account?tab=activity');
          } else {
            console.error('Failed to upgrade job after payment:', response.status);
            alert('Payment successful, but there was an issue upgrading your job. Please contact support.');
            router.push('/my-account?tab=activity');
          }
        } catch (error) {
          console.error('Error upgrading job after payment:', error);
          alert('Payment successful, but there was an issue upgrading your job. Please contact support.');
          router.push('/my-account?tab=activity');
        }
      } else if (purchaseType === 'post_job') {
        try {
          // 1) Retrieve job payload
          const jobPayloadRaw = sessionStorage.getItem('jobToPost');
          if (!jobPayloadRaw) {
            alert('Payment successful, but job details were not found. Please re-enter your job details.');
            router.push('/post-job');
            setLoading(false);
            return;
          }
          const jobPayload = JSON.parse(jobPayloadRaw);

          // Ensure is_sponsored matches the payment intent
          jobPayload.is_sponsored = isSponsored;

          // 2) If user not logged in, register employer first
          let postedByUserId = user?.user_id;
          if (!postedByUserId) {
            const employerRaw = sessionStorage.getItem('employerRegistration');
            if (!employerRaw) {
              alert('Payment successful, but employer details are missing. Please contact support.');
              router.push('/post-job');
              setLoading(false);
              return;
            }
            const employerRegistration = JSON.parse(employerRaw);

            const registerResponse = await fetch('/api/auth/register', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(employerRegistration),
            });

            if (!registerResponse.ok) {
              const errorData = await registerResponse.json().catch(() => ({}));
              console.error('Registration failed after payment:', errorData);
              alert('Payment successful, but account creation failed. Please contact support.');
              router.push('/post-job');
              setLoading(false);
              return;
            }

            const registerData = await registerResponse.json();
            postedByUserId = registerData.user?.user_id;
            await refreshUser();
          }

          if (!postedByUserId) {
            alert('Payment successful, but we could not identify your account.');
            router.push('/post-job');
            setLoading(false);
            return;
          }

          // 3) Post the job
          const finalJobPayload = { ...jobPayload, posted_by_user_id: postedByUserId };
          const jobPostResponse = await fetch('/api/job', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(finalJobPayload),
          });

          if (!jobPostResponse.ok) {
            const errorData = await jobPostResponse.json().catch(() => ({}));
            console.error('Job posting failed after payment:', errorData);
            alert('Payment successful, but job posting failed. Please contact support.');
            router.push('/post-job');
            setLoading(false);
            return;
          }

          // 4) Clear staged data and redirect
          sessionStorage.removeItem('jobToPost');
          sessionStorage.removeItem('employerRegistration');
          alert('Payment successful! Your job has been posted.');
          router.push('/my-account');
        } catch (err) {
          console.error('Error finalising job posting after payment:', err);
          alert('Payment successful, but there was an unexpected error finishing your job post.');
          router.push('/post-job');
        }
      } else {
        // For other payment types, use the original redirect
        alert(`Payment successful via ${method} for ${purchaseItemName}! Redirecting...`);
        router.push(redirectPathOnSuccess);
      }

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

  const handleBackToApplication = () => {
    // Go back to application message modal on browse-jobs page
    router.push(`/browse-jobs?applicationMessage=true&jobId=${jobId}`);
  };




  if (isAuthLoading) {
      return (
          <div className="min-h-screen bg-zinc-50 text-gray-900 dark:bg-gray-950 dark:text-gray-300 flex items-center justify-center">
              <p>Checking user authentication...</p>
          </div>
      );
  }

  if (purchaseType === 'pro_pack' && user?.user_type === 'employer') {
    return null;
  }

  const pricingHref = user?.user_type === "student" ? "/pricing#student" : "/pricing#employer";

  return (
    <div className="min-h-screen bg-zinc-50 text-gray-900 dark:bg-gray-950 dark:text-gray-100 flex flex-col pt-[80px]">
      <Header
        user={user}
        isLoading={isAuthLoading}
        logout={logout}
        pricingHref={pricingHref}
        currentPage="pay"
        className="fixed top-0 left-0 right-0 z-[9999] bg-white text-gray-900 border-b border-zinc-200 dark:bg-gray-900 dark:text-white dark:border-gray-800"
      />

      <div className="flex-grow container mx-auto px-4 py-8 pb-24 md:pb-16">
        {/* Back button for apply route */}

        <div className="max-w-md mx-auto">
          <Card className="bg-white border border-zinc-200 shadow-xl rounded-2xl text-gray-900 dark:bg-gray-800 dark:border-gray-700 dark:text-white">
            <CardHeader className="border-b border-zinc-200 pb-4 dark:border-gray-700">
              <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                {currentStage === 1 ? 'Billing Details' : 'Payment Method'}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="mb-6 p-4 rounded-lg border bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-700 dark:text-blue-200">
                <p className="text-sm font-medium">Payment Summary</p>
                <p className="text-2xl font-bold">£{displayAmount}</p>
                <p className="text-sm text-zinc-600 dark:text-gray-400">
                  {purchaseItemName}
                </p>
                <div className="mt-2 pt-2 border-t border-blue-200 dark:border-blue-700">
                  <p className="text-xs text-zinc-600 dark:text-gray-400">
                    No additional fees: What you see is what you pay.
                    Includes secure payment processing and instant access.
                  </p>
                </div>
              </div>

              {/* Stage 1: Billing Information */}
              {currentStage === 1 && (
                <form onSubmit={handleNextStage} className="space-y-4">
                  <div>
                    <Label htmlFor="billingName" className="text-gray-700 dark:text-gray-300">Full Name</Label>
                    <Input
                      id="billingName"
                      placeholder="John Smith"
                      required
                      value={billingName}
                      onChange={(e) => setBillingName(e.target.value)}
                      className="bg-white text-gray-900 border-zinc-300 placeholder:text-zinc-400 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                    />
                  </div>
                  <div>
                    <Label htmlFor="addressLine1" className="text-gray-700 dark:text-gray-300">Address Line 1</Label>
                    <Input
                      id="addressLine1"
                      placeholder="123 Example Street"
                      required
                      value={addressLine1}
                      onChange={(e) => setAddressLine1(e.target.value)}
                      className="bg-white text-gray-900 border-zinc-300 placeholder:text-zinc-400 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                    />
                  </div>
                  <div>
                    <Label htmlFor="addressLine2" className="text-gray-700 dark:text-gray-300">Address Line 2 (Optional)</Label>
                    <Input
                      id="addressLine2"
                      placeholder="Apt, Suite, Building"
                      value={addressLine2}
                      onChange={(e) => setAddressLine2(e.target.value)}
                      className="bg-white text-gray-900 border-zinc-300 placeholder:text-zinc-400 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="city" className="text-gray-700 dark:text-gray-300">City</Label>
                      <Input
                        id="city"
                        placeholder="London"
                        required
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="bg-white text-gray-900 border-zinc-300 placeholder:text-zinc-400 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                      />
                    </div>
                    <div>
                      <Label htmlFor="postcode" className="text-gray-700 dark:text-gray-300">Postcode</Label>
                      <Input
                        id="postcode"
                        placeholder="SW1A 0AA"
                        required
                        value={postcode}
                        onChange={(e) => setPostcode(e.target.value)}
                        className="bg-white text-gray-900 border-zinc-300 placeholder:text-zinc-400 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="country" className="text-gray-700 dark:text-gray-300">Country</Label>
                    <Input
                      id="country"
                      placeholder="United Kingdom"
                      required
                      value={country}
                      readOnly
                      className="bg-white text-gray-900 border-zinc-300 placeholder:text-zinc-400 focus:ring-blue-500 cursor-not-allowed dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                    />
                  </div>

                  <div className="flex items-center space-x-2 pt-2">
                    <Checkbox
                      id="saveBillingAddress"
                      checked={saveBillingAddress}
                      onCheckedChange={(checked) => setSaveBillingAddress(!!checked)}
                      className="border-zinc-400 dark:border-gray-600 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white"
                    />
                    <Label htmlFor="saveBillingAddress" className="text-sm text-zinc-700 dark:text-gray-300">Save this billing address for future payments</Label>
                  </div>

                  <div className="flex justify-between pt-4">
                    {purchaseType === 'apply' && jobId && (
                      <Button
                        type="button"
                        onClick={handleBackToApplication}
                        className="bg-blue-700 hover:bg-blue-800 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 shadow-md flex items-center gap-2"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-5 h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Back
                      </Button>
                    )}
                    <div className="flex-1"></div>
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
                    <div className="flex-grow border-t border-zinc-200 dark:border-gray-700"></div>
                    <span className="flex-shrink mx-4 text-zinc-500 text-sm dark:text-gray-500">Or pay by card</span>
                    <div className="flex-grow border-t border-zinc-200 dark:border-gray-700"></div>
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
                            className="border-zinc-400 dark:border-gray-600 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white"
                          />
                          <Label htmlFor="useSavedCard" className="text-gray-300">Use saved payment method</Label>
                        </div>

                        {useSavedCard && (
                          <div className="space-y-2">
                            {savedCards.map((card) => (
                              <div key={card.id} className="border rounded-lg p-3 cursor-pointer transition-colors border-zinc-200 bg-zinc-100 hover:bg-zinc-200 dark:border-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-3">
                                    <input
                                      type="radio"
                                      name="savedCard"
                                      defaultChecked={card.id === 1}
                                      className="form-radio h-4 w-4 text-blue-600 bg-white border-zinc-300 focus:ring-blue-500 dark:bg-gray-600 dark:border-gray-500"
                                    />
                                    <div>
                                      <p className="font-medium text-gray-900 dark:text-white">{card.brand} {card.last4}</p>
                                      <p className="text-sm text-zinc-600 dark:text-gray-400">Expires {card.expiryMonth}/{card.expiryYear}</p>
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
                          <Label htmlFor="name" className="text-gray-700 dark:text-gray-300">Name on Card</Label>
                          <Input
                            id="name"
                            placeholder="John Smith"
                            required
                            className="bg-white text-gray-900 border-zinc-300 placeholder:text-zinc-400 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                          />
                        </div>

                        <div>
                          <Label htmlFor="cardNumber" className="text-gray-700 dark:text-gray-300">Card Number</Label>
                          <Input
                            id="cardNumber"
                            placeholder="1234 5678 9012 3456"
                            required
                            className="bg-white text-gray-900 border-zinc-300 placeholder:text-zinc-400 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="expiry" className="text-gray-700 dark:text-gray-300">Expiry</Label>
                            <Input
                              id="expiry"
                              placeholder="MM/YY"
                              required
                              className="bg-white text-gray-900 border-zinc-300 placeholder:text-zinc-400 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                            />
                          </div>
                          <div>
                            <Label htmlFor="cvv" className="text-gray-700 dark:text-gray-300">CVV</Label>
                            <Input
                              id="cvv"
                              placeholder="123"
                              required
                              className="bg-white text-gray-900 border-zinc-300 placeholder:text-zinc-400 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                            />
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="saveCard"
                            checked={saveCard}
                            onCheckedChange={(checked) => setSaveCard(!!checked)}
                            className="border-zinc-400 dark:border-gray-600 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white"
                          />
                          <Label htmlFor="saveCard" className="text-sm text-zinc-700 dark:text-gray-300">Save this card for future payments</Label>
                        </div>
                      </>
                    )}

                    <div className="flex justify-between items-center pt-4">
                      <Button
                        type="button"
                        onClick={() => setCurrentStage(1)}
                        variant="outline"
                        className="border-zinc-300 text-gray-900 hover:bg-zinc-50 py-3 px-6 rounded-lg transition-colors duration-200 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
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

      {/* Global footer is included via RootLayout */}
    </div>
  )
}

export default function PaymentPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-zinc-50 text-gray-900 dark:bg-gray-950 dark:text-gray-300 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-2">Loading payment form...</p>
      </div>
    </div>}>
      <PaymentContent />
    </Suspense>
  )
}