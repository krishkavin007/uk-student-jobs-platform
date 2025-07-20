"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Header } from "@/components/ui/header";
import { ContactModal } from "@/components/ui/contact-modal";
import { useAuth } from '@/app/context/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";

export default function PricingPage() {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();
  // Initialize activeTab based on URL hash, default to 'employers'
  const [activeTab, setActiveTab] = useState<"employers" | "students">("employers");

  // Effect to read URL hash and set initial activeTab
  useEffect(() => {
    const hash = window.location.hash.replace('#', ''); // Get hash without '#'
    if (hash === 'employer' || hash === 'student') {
      setActiveTab(hash === 'employer' ? 'employers' : 'students');
    } else {
      // If landing on /pricing without a valid hash, default to employers and update URL hash
      setActiveTab('employers');
      // Replace URL hash without adding to browser history on initial load if default
      if (window.location.hash !== '#employer') {
        router.replace({ hash: 'employer' }, { shallow: true });
      }
    }
  }, [router]); // Depend on router to re-run if URL changes (e.g., browser back/forward)

  // Function to handle tab change and update URL hash
  const handleTabChange = (value: "employers" | "students") => {
    setActiveTab(value);
    // Push new hash to URL, allowing browser history navigation
    router.push(`#${value === "employers" ? "employer" : "student"}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header user={user} isLoading={isLoading} logout={logout} />

      <div className="flex-grow container mx-auto px-4 py-8 max-w-6xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Simple, Transparent Pricing</h1>
          <p className="text-xl text-gray-600">No hidden fees, no monthly subscriptions. Pay only when you post jobs.</p>
        </div>

        {/* Pricing Toggle - Centered */}
        <div className="flex justify-center mb-12">
          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <TabsList className="grid w-full max-w-sm grid-cols-2 mx-auto">
              <TabsTrigger value="employers">For Employers</TabsTrigger>
              <TabsTrigger value="students">For Students</TabsTrigger>
            </TabsList>

            {/* ALL TabsContent MUST be inside the Tabs component */}
            <TabsContent value="employers" className="py-8">
                {/* Main Pricing Cards (Employer Specific) */}
                <div className="grid gap-8 md:grid-cols-2 mb-16 max-w-4xl mx-auto">
                    {/* Basic Job Post */}
                    <Card className="relative">
                        <CardHeader className="text-center pb-8">
                            <CardTitle className="text-2xl mb-2">Basic Job Post</CardTitle>
                            <div className="text-4xl font-bold text-gray-900 mb-2">£1</div>
                            <p className="text-gray-600">Per job posting</p>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                                        <span className="text-white text-xs">✓</span>
                                    </div>
                                    <span className="text-gray-700">30-day job listing</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                                        <span className="text-white text-xs">✓</span>
                                    </div>
                                    <span className="text-gray-700">Access to verified students</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                                        <span className="text-white text-xs">✓</span>
                                    </div>
                                    <span className="text-gray-700">Standard search visibility</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                                        <span className="text-white text-xs">✓</span>
                                    </div>
                                    <span className="text-gray-700">Direct student contact</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                                        <span className="text-white text-xs">✓</span>
                                    </div>
                                    <span className="text-gray-700">Edit/delete anytime</span>
                                </div>
                            </div>

                            <div className="pt-6">
                                <Button asChild className="w-full bg-gray-900 hover:bg-gray-800">
                                    <Link href="/post-job">
                                        <span>Post Basic Job</span>
                                    </Link>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Sponsored Job Post */}
                    <Card className="relative border-blue-200 bg-blue-50/50">
                        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                            <Badge className="bg-blue-600 text-white px-4 py-1">Most Popular</Badge>
                        </div>

                        <CardHeader className="text-center pb-8">
                            <CardTitle className="text-2xl mb-2">Sponsored Job Post</CardTitle>
                            <div className="text-4xl font-bold text-blue-600 mb-2">£5</div>
                            <p className="text-gray-600">Per job posting</p>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                                        <span className="text-white text-xs">✓</span>
                                    </div>
                                    <span className="text-gray-700">Everything in Basic, plus:</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                                        <span className="text-white text-xs">⭐</span>
                                    </div>
                                    <span className="text-gray-700">Top of search results</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                                        <span className="text-white text-xs">⭐</span>
                                    </div>
                                    <span className="text-gray-700">3x more visibility</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                                        <span className="text-white text-xs">⭐</span>
                                    </div>
                                    <span className="text-gray-700">Highlighted with badge</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                                        <span className="text-white text-xs">⭐</span>
                                    </div>
                                    <span className="text-gray-700">Priority customer support</span>
                                </div>
                            </div>

                            <div className="pt-6">
                                <Button asChild className="w-full bg-blue-600 hover:bg-blue-700">
                                    <Link href="/post-job?sponsored=true">
                                        <span>Post Sponsored Job</span>
                                    </Link>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Additional Information for Employers */}
                <div className="mb-16">
                  <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">Additional Information for Employers</h2>

                  <div className="grid gap-6 md:grid-cols-3 max-w-4xl mx-auto">
                    <Card>
                      <CardHeader className="text-center">
                        <CardTitle className="text-lg">Transaction Fees</CardTitle>
                      </CardHeader>
                      <CardContent className="text-center">
                        <div className="text-2xl font-bold text-gray-900 mb-2">£0</div>
                        <p className="text-gray-600">No additional fees</p>
                        <p className="text-sm text-gray-500 mt-2">
                          Standard payment processing included in job posting price
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="text-center">
                        <CardTitle className="text-lg">Refunds</CardTitle>
                      </CardHeader>
                      <CardContent className="text-center">
                        <div className="text-2xl font-bold text-blue-600 mb-2">Available</div>
                        <p className="text-gray-600">When applicable</p>
                        <p className="text-sm text-gray-500 mt-2">
                          See our{" "}
                          <Link href="/refund-policy" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">
                            <span>refund policy</span>
                          </Link>{" "}
                          for eligible circumstances
                        </p>
                      </CardContent>
                    </Card>
                     {/* UPDATED: Bulk Discounts card content */}
                    <Card>
                      <CardHeader className="text-center">
                        <CardTitle className="text-lg">Volume Hiring & Partnerships</CardTitle>
                      </CardHeader>
                      <CardContent className="text-center">
                        <div className="text-2xl font-bold text-gray-900 mb-2">Custom Pricing</div>
                        <p className="text-gray-600">For growing businesses</p>
                        <p className="text-sm text-gray-500 mt-2">
                          Planning to hire multiple students? Get tailored packages, dedicated support, and scalable solutions for your recruitment needs.
                        </p>
                        <div className="pt-4">
                          <ContactModal>
                              <button className="text-blue-600 hover:underline text-sm font-medium"><span>Talk to Sales</span></button>
                          </ContactModal>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                {/* Detailed Comparison for Employers */}
                <div className="mb-16">
                    <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">Detailed Comparison for Employers</h2>

                    <div className="bg-white rounded-lg overflow-hidden border">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="text-left p-4 font-semibold text-gray-900">Feature</th>
                                    <th className="text-center p-4 font-semibold text-gray-900">Basic (£1)</th>
                                    <th className="text-center p-4 font-semibold text-blue-600">Sponsored (£5)</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                <tr>
                                    <td className="p-4">Job listing duration</td>
                                    <td className="p-4 text-center">30 days</td>
                                    <td className="p-4 text-center">45 days</td>
                                </tr>
                                <tr className="bg-gray-50">
                                    <td className="p-4">Access to student applicants</td>
                                    <td className="p-4 text-center">✓</td>
                                    <td className="p-4 text-center">✓</td>
                                </tr>
                                <tr>
                                    <td className="p-4">Position in search results</td>
                                    <td className="p-4 text-center">Standard order</td>
                                    <td className="p-4 text-center">Top of results</td>
                                </tr>
                                <tr className="bg-gray-50">
                                    <td className="p-4">Visual highlighting</td>
                                    <td className="p-4 text-center">None</td>
                                    <td className="p-4 text-center">Blue highlight + badge</td>
                                </tr>
                                <tr>
                                    <td className="p-4">Expected visibility increase</td>
                                    <td className="p-4 text-center">Baseline</td>
                                    <td className="p-4 text-center">3x more views</td>
                                </tr>
                                <tr className="bg-gray-50">
                                    <td className="p-4">Customer support priority</td>
                                    <td className="p-4 text-center">Standard</td>
                                    <td className="p-4 text-center">Priority support</td>
                                </tr>
                                <tr>
                                    <td className="p-4">Edit/delete job</td>
                                    <td className="p-4 text-center">✓</td>
                                    <td className="p-4 text-center">✓</td>
                                </tr>
                                {/* REMOVED: Analytics dashboard row */}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Why Our Pricing Works for Employers */}
                <div className="mb-16">
                    <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">Why Our Pricing Model Works for Employers</h2>

                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Quality Over Quantity</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-gray-600 text-sm">
                                    The £1 application fee ensures students are genuinely interested, reducing spam and improving application quality for you.
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Cost-Effective for Employers</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-gray-600 text-sm">
                                    At £1-5 per posting, you get access to motivated students without expensive recruitment agency fees.
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">No Hidden Costs</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-gray-600 text-sm">
                                    What you see is what you pay. No setup fees, monthly subscriptions, or surprise charges.
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Immediate Results</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-gray-600 text-sm">
                                    Your job goes live immediately after payment, and students can start applying right away.
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Guaranteed Reach</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-gray-600 text-sm">
                                    With thousands of active student users, your job posting will be seen by qualified candidates.
                                </p>
                            </CardContent>
                        </Card>
                         <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Targeted Audience</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-gray-600 text-sm">
                                    Directly reach UK university students looking for part-time work, ensuring relevant applications.
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Employer Pricing FAQ */}
                <div className="mb-16">
                    <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">Employer Pricing FAQ</h2>

                    <div className="max-w-3xl mx-auto space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Do I pay anything if no one applies?</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-gray-600">
                                    You only pay the initial posting fee (£1 or £5). There are no additional charges based on applications received.
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Can I edit my job after posting?</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-gray-600">
                                    Yes, you can edit or delete your job at any time through your account dashboard at no extra cost.
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">What payment methods do you accept?</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-gray-600">
                                    We accept all major credit/debit cards and PayPal. All payments are processed securely through Stripe.
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                 {/* CTA (Employer Specific) */}
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Ready to Find Your Next Student Employee?</h2>
                    <p className="text-gray-600 mb-6">Join hundreds of employers already using StudentJobs UK</p>
                    <div className="flex gap-4 justify-center">
                        <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700">
                            <Link href="/post-job">
                                <span>Post a Job Now</span>
                            </Link>
                        </Button>
                        <Button asChild variant="outline" size="lg">
                            <Link href="/employer-guide">
                                <span>Employer Guide</span>
                            </Link>
                        </Button>
                    </div>
                </div>

            </TabsContent>


            <TabsContent value="students" className="py-8">
                {/* Main Pricing Cards for Students */}
                <div className="grid gap-8 md:grid-cols-2 mb-16 max-w-4xl mx-auto">
                    <Card>
                        <CardHeader className="text-center pb-8">
                            <CardTitle className="text-2xl mb-2">Basic Contact Reveal</CardTitle>
                            <div className="text-4xl font-bold text-green-600 mb-2">£1</div>
                            <p className="text-gray-600">Per job contact reveal</p>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                                        <span className="text-white text-xs">✓</span>
                                    </div>
                                    <span className="text-gray-700">Access full employer contact details</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                                        <span className="text-white text-xs">✓</span>
                                    </div>
                                    <span className="text-gray-700">Apply directly to the employer</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                                        <span className="text-white text-xs">✓</span>
                                    </div>
                                    <span className="text-gray-700">No hidden fees, pay only when you reveal</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                                        <span className="text-white text-xs">✓</span>
                                    </div>
                                    <span className="text-gray-700">Unlimited job Browse</span>
                                </div>
                            </div>
                            <div className="pt-6">
                                <Button asChild className="w-full bg-green-600 hover:bg-green-700">
                                    <Link href="/browse-jobs">
                                        <span>Find Your Next Job</span>
                                    </Link>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* UPDATED: Student Pro Pack with conditional CTA */}
                    <Card className="relative border-purple-200 bg-purple-50/50">
                        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                            <Badge className="bg-purple-600 text-white px-4 py-1">Best Value</Badge>
                        </div>
                        <CardHeader className="text-center pb-8">
                            <CardTitle className="text-2xl mb-2">Student Pro Pack</CardTitle>
                            <div className="text-4xl font-bold text-purple-600 mb-2">£5</div>
                            <p className="text-gray-600">For 8 contact reveals</p>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                                        <span className="text-white text-xs">✓</span>
                                    </div>
                                    <span className="text-gray-700">Includes 8 Basic Contact Reveals</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center">
                                        <span className="text-white text-xs">⚡</span>
                                    </div>
                                    <span className="text-gray-700">Save £3 compared to individual reveals</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center">
                                        <span className="text-white text-xs">⚡</span>
                                    </div>
                                    <span className="text-gray-700">Ideal for active job seekers</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center">
                                        <span className="text-white text-xs">⚡</span>
                                    </div>
                                    <span className="text-gray-700">Convenient, one-time purchase</span>
                                </div>
                            </div>
                            <div className="pt-6">
                                <Button
                                    className="w-full bg-purple-600 hover:bg-purple-700"
                                    onClick={() => {
                                        if (user) {
                                            // Logged in: Go directly to payment for pro pack
                                            router.push('/pay?type=pro_pack');
                                        } else {
                                            // Logged out: Go to signup, then redirect to payment
                                            router.push('/signup?next=/pay?type=pro_pack');
                                        }
                                    }}
                                >
                                    <span>Get Pro Pack</span>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Why Our Pricing Works (Student Specific) */}
                <div className="mb-16">
                    <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">Why Our Pricing Model Works for Students</h2>

                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Fair & Transparent</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-gray-600 text-sm">
                                    You only pay a small fee when you want to apply for a job, not for Browse or signing up.
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">No Subscriptions</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-gray-600 text-sm">
                                    No recurring monthly fees. You pay per successful contact reveal, giving you full control.
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Serious Employers</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-gray-600 text-sm">
                                    Employers pay to post jobs, ensuring they are serious about hiring and the roles are genuine.
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Reduce Spam</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-gray-600 text-sm">
                                    The small fee helps filter out non-serious applications, leading to higher quality engagement with employers.
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Direct Access</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-gray-600 text-sm">
                                    Once you pay, you get direct contact details, allowing you to reach out immediately.
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Student-Focused Jobs</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-gray-600 text-sm">
                                    All jobs on our platform are specifically curated for students, ensuring relevance to your needs.
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* FAQ (Student Specific) */}
                <div className="mb-16">
                    <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">Student Pricing FAQ</h2>

                    <div className="max-w-3xl mx-auto space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Do I pay £1 for every job I browse?</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-gray-600">
                                    No, you can browse unlimited jobs for free. You only pay £1 if you decide to reveal an employer's contact details to apply for a specific job.
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">What if the employer doesn't respond?</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-gray-600">
                                    We encourage all employers to respond to applicants. While we cannot guarantee a response, the fee is for the reveal of contact information. Please refer to our{" "}
                                    <Link href="/refund-policy" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">
                                        <span>refund policy</span>
                                    </Link>{" "}
                                    for details on eligible refunds.
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Can I get a refund?</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-gray-600">
                                    Refunds are generally not issued once contact details have been revealed, as the service has been rendered. Please see our full{" "}
                                    <Link href="/refund-policy" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">
                                        <span>refund policy</span>
                                    </Link>{" "}
                                    for specific conditions.
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* CTA (Student Specific) */}
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Ready to Find Your Next Part-Time Job?</h2>
                    <p className="text-gray-600 mb-6">Browse hundreds of student-friendly opportunities</p>
                    <div className="flex gap-4 justify-center">
                        <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700">
                            <Link href="/browse-jobs">
                                <span>Browse Jobs Now</span>
                            </Link>
                        </Button>
                        <Button asChild variant="outline" size="lg">
                            <Link href="/student-guide">
                                <span>Student Guide</span>
                            </Link>
                        </Button>
                    </div>
                </div>

            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Footer */}
      <footer className="w-full py-6 bg-gray-900 text-white mt-auto">
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
                <Link href="/browse-jobs" className="text-gray-300 hover:text-white"><span>Browse Jobs</span></Link>
                <Link href="/how-it-works" className="text-gray-300 hover:text-white"><span>How It Works</span></Link>
                <Link href="/student-guide" className="text-gray-300 hover:text-white"><span>Student Guide</span></Link>
              </nav>
            </div>
            <div>
              <h4 className="font-semibold mb-3">For Employers</h4>
              <nav className="flex flex-col space-y-2 text-sm">
                <Link href="/post-job" className="text-gray-300 hover:text-white"><span>Post a Job</span></Link>
                <Link href="/pricing" className="text-gray-300 hover:text-white"><span>Pricing</span></Link>
                <Link href="/employer-guide" className="text-gray-300 hover:text-white"><span>Employer Guide</span></Link>
              </nav>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Legal</h4>
              <nav className="flex flex-col space-y-2 text-sm">
                <Link href="/privacy" className="text-gray-300 hover:text-white" target="_blank" rel="noopener noreferrer"><span>Privacy Policy</span></Link>
                <Link href="/terms" className="text-gray-300 hover:text-white" target="_blank" rel="noopener noreferrer"><span>Terms & Conditions</span></Link>
                <Link href="/refund-policy" className="text-gray-300 hover:text-white" target="_blank" rel="noopener noreferrer"><span>Refund Policy</span></Link>
                <ContactModal>
                  <button className="text-gray-300 hover:text-white text-sm text-left w-full pl-0">
                    <span>Contact Us</span>
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