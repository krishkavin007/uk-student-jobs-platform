import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Header } from "@/components/ui/header"
import { ContactModal } from "@/components/ui/contact-modal"
import Link from "next/link"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <Header />

      {/* Hero Section */}
      <section className="w-full py-12 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
            <div className="flex flex-col justify-center space-y-4">
              <div className="space-y-2">
                <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                  ✓ Trusted by 25,000+ Students
                </Badge>
                <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none text-gray-900">
                  Connect Students with{" "}
                  <span className="text-blue-600">Part-Time Jobs</span>
                </h1>
                <p className="max-w-[600px] text-gray-600 md:text-xl">
                  The UK's premier platform connecting local businesses with talented students seeking flexible
                  part-time work. Start at just £1 per job post.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700">
                    <Link href="/browse-jobs">Find Part-Time Jobs</Link>
                  </Button>
                  <Button asChild variant="outline" size="lg">
                    <Link href="/post-job">Post a Job</Link>
                  </Button>
                </div>

                {/* REMOVED: Trust Indicators */}
                {/*
                <div className="flex items-center gap-6 pt-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <span className="text-yellow-500">★★★★★</span>
                    <span>4.8/5 (2,847 reviews)</span>
                  </div>
                  <div>25,000+ active students</div>
                  <div>1,200+ verified employers</div>
                </div>
                */}
              </div>
            </div>
            <div className="flex items-center justify-center">
              <div className="grid gap-4 grid-cols-2">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">For Students</CardTitle>
                    <CardDescription>Browse flexible part-time opportunities</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-center text-sm">
                      <span className="text-green-600 mr-2">✓</span>
                      Verified local businesses
                    </div>
                    <div className="flex items-center text-sm">
                      <span className="text-green-600 mr-2">✓</span>
                      Flexible schedules
                    </div>
                    <div className="flex items-center text-sm">
                      <span className="text-green-600 mr-2">✓</span>
                      Direct contact with employers
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">For Employers</CardTitle>
                    <CardDescription>Find motivated student workers</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-center text-sm">
                      <span className="text-green-600 mr-2">✓</span>
                      £1 basic job posts
                    </div>
                    <div className="flex items-center text-sm">
                      <span className="text-green-600 mr-2">✓</span>
                      £5 sponsored listings
                    </div>
                    <div className="flex items-center text-sm">
                      <span className="text-green-600 mr-2">✓</span>
                      Access to student talent pool
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="w-full py-12 bg-white">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="grid gap-6 md:grid-cols-4 text-center">
            <div>
              <div className="text-3xl font-bold text-blue-600">25,000+</div>
              <p className="text-gray-600">Active Students</p>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-600">1,200+</div>
              <p className="text-gray-600">Verified Employers</p>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-600">15,000+</div>
              <p className="text-gray-600">Jobs Posted</p>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-600">98%</div>
              <p className="text-gray-600">Success Rate</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Jobs Section */}
      <section className="w-full py-12 bg-gray-50">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Popular Part-Time Jobs</h2>
            <p className="text-gray-600">Discover opportunities from trusted UK employers</p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            <Link href="/browse-jobs" className="hover:no-underline group">
              <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer group-hover:scale-105">
              <div className="h-48 bg-cover bg-center rounded-t-lg"
                   style={{backgroundImage: "url('https://keystoneacademic-res.cloudinary.com/image/upload/element/15/157646_Parttimestudentjob.jpg')"}}>
              </div>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Barista</CardTitle>
                  <Badge>Hospitality</Badge>
                </div>
                <CardDescription>Central Perk Coffee • Manchester</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-3">
                  Looking for friendly barista for weekend shifts. Perfect for students with flexible scheduling.
                </p>
                <div className="flex items-center justify-between mb-3">
                  <span className="font-semibold text-blue-600">£10.50/hour</span>
                  <span className="text-sm text-gray-500">12 applications</span>
                </div>
                <Button size="sm" className="w-full bg-blue-600 hover:bg-blue-700">
                  Apply Now
                </Button>
              </CardContent>
            </Card>
            </Link>

            <Link href="/browse-jobs" className="hover:no-underline group">
              <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer group-hover:scale-105">
                <div className="h-48 bg-cover bg-center rounded-t-lg"
                     style={{backgroundImage: "url('https://www.savethestudent.org/uploads/part-time-job-retailers.jpg')"}}>
                </div>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Retail Assistant</CardTitle>
                  <Badge variant="secondary">Retail</Badge>
                </div>
                <CardDescription>Fashion Forward • Birmingham</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-3">
                  Part-time retail position in busy store. Great experience for students studying business.
                </p>
                <div className="flex items-center justify-between mb-3">
                  <span className="font-semibold text-blue-600">£9.50/hour</span>
                  <span className="text-sm text-gray-500">8 applications</span>
                </div>
                <Button size="sm" className="w-full bg-blue-600 hover:bg-blue-700">
                  Apply Now
                </Button>
              </CardContent>
            </Card>
            </Link>

            <Link href="/browse-jobs" className="hover:no-underline group">
              <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer group-hover:scale-105">
                <div className="h-48 bg-cover bg-center rounded-t-lg"
                     style={{backgroundImage: "url('https://d3njjcbhbojbot.cloudfront.net/api/utilities/v1/imageproxy/https://images.ctfassets.net/wp1lcwdav1p1/5aNgdstZ4Gij3O6m60pk4B/19292dcdd541f0e8f422d93653290c97/GettyImages-557715963.jpg?w=1500&h=680&q=60&fit=fill&f=faces&fm=jpg&fl=progressive&auto=format%2Ccompress&dpr=1&w=1000')"}}>
                </div>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Private Tutor</CardTitle>
                  <Badge className="bg-green-100 text-green-800">Education</Badge>
                </div>
                <CardDescription>Self-employed • Leeds</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-3">
                  Seeking maths tutor for GCSE level students. Perfect for education or maths students.
                </p>
                <div className="flex items-center justify-between mb-3">
                  <span className="font-semibold text-blue-600">£15/hour</span>
                  <span className="text-sm text-gray-500">5 applications</span>
                </div>
                <Button size="sm" className="w-full bg-blue-600 hover:bg-blue-700">
                  Apply Now
                </Button>
              </CardContent>
            </Card>
            </Link>
          </div>
          <div className="text-center mt-8">
            <Button asChild variant="outline" size="lg">
              <Link href="/browse-jobs">View All Jobs</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="w-full py-12 bg-white">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">What Our Users Say</h2>
            <p className="text-gray-600">Real experiences from students and employers across the UK</p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-semibold">E</span>
                  </div>
                  <div className="ml-3">
                    <div className="font-semibold">Emma Thompson</div>
                    <div className="text-sm text-gray-500">Manchester University Student</div>
                  </div>
                </div>
                <p className="text-gray-600 mb-4">
                  "Found my perfect barista job within a week! The platform made it so easy to connect
                  with local employers who understand student schedules."
                </p>
                <div className="flex text-yellow-500">★★★★★</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-600 font-semibold">J</span>
                  </div>
                  <div className="ml-3">
                    <div className="font-semibold">John Smith</div>
                    <div className="text-sm text-gray-500">Coffee Shop Owner</div>
                  </div>
                </div>
                <p className="text-gray-600 mb-4">
                  "As a small business owner, StudentJobs UK helped me find reliable, motivated students.
                  The quality of applicants has been exceptional."
                </p>
                <div className="flex text-yellow-500">★★★★★</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                    <span className="text-purple-600 font-semibold">S</span>
                  </div>
                  <div className="ml-3">
                    <div className="font-semibold">Sarah Wilson</div>
                    <div className="text-sm text-gray-500">Leeds University Student</div>
                  </div>
                </div>
                <p className="text-gray-600 mb-4">
                  "The platform is so student-friendly! I love that I can see exactly how many hours
                  I'm allowed to work and find jobs that fit my study schedule."
                </p>
                <div className="flex text-yellow-500">★★★★★</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Why Choose StudentJobs UK? */}
      <section className="w-full py-12 bg-gray-50">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose StudentJobs UK?</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Trusted by thousands of students and businesses across the UK
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            <Card className="text-center">
              <CardHeader>
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">£</span>
                </div>
                <CardTitle>Affordable Job Posts</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Post basic jobs for just £1, or upgrade to sponsored listings for £5 to get maximum visibility.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">✓</span>
                </div>
                <CardTitle>Verified Students</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  All job seekers verify their student status and contact details, ensuring you connect with genuine students.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🔒</span>
                </div>
                <CardTitle>Secure & Trusted</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  GDPR compliant with secure payments, reporting tools, and full transaction history for peace of mind.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Universities We Serve */}
      <section className="w-full py-12 bg-white">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Trusted by Students From</h2>
            <p className="text-gray-600">Leading universities across the United Kingdom</p>
          </div>
          <div className="grid gap-4 grid-cols-2 md:grid-cols-4 lg:grid-cols-6 text-center text-gray-600">
            <div className="p-4">University of Manchester</div>
            <div className="p-4">University of Leeds</div>
            <div className="p-4">University of Birmingham</div>
            <div className="p-4">King's College London</div>
            <div className="p-4">University of Edinburgh</div>
            <div className="p-4">University of Bristol</div>
            <div className="p-4">University of Warwick</div>
            <div className="p-4">University of Glasgow</div>
            <div className="p-4">Durham University</div>
            <div className="p-4">University of Nottingham</div>
            <div className="p-4">University of Sheffield</div>
            <div className="p-4">University of Liverpool</div>
          </div>
        </div>
      </section>

      {/* Work Hour Compliance Notice */}
      <section className="w-full py-8 bg-blue-50">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium mb-4">
              <span>📚</span>
              UK Student Work Regulations Compliant
            </div>
            <p className="text-gray-700 max-w-3xl mx-auto">
              All job postings comply with UK student work hour limits: <strong>20 hours during term-time</strong> and
              <strong> 40 hours during holidays</strong>. We help both students and employers stay within legal requirements.
            </p>
          </div>
        </div>
      </section>

      {/* Ready to Get Started */}
      <section className="w-full py-16 bg-gray-900 text-white">
        <div className="container px-4 md:px-6 mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
            Join thousands of students and employers already using StudentJobs UK
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700">
              <Link href="/signup">Sign Up Now</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="border-white text-white bg-transparent hover:bg-white hover:text-gray-900">
              <Link href="/how-it-works">Learn More</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 md:grid-cols-4">
            <div>
              <div className="mb-4">
                <span className="font-bold text-xl text-white">StudentJobs UK</span>
              </div>
              <p className="text-gray-300 text-sm">
                Connecting UK students with flexible part-time opportunities since 2024.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-4">For Students</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="/browse-jobs" className="text-gray-300 hover:text-white">Browse Jobs</Link></li>
                <li><Link href="/how-it-works" className="text-gray-300 hover:text-white">How It Works</Link></li>
                <li><Link href="/student-guide" className="text-gray-300 hover:text-white">Student Guide</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">For Employers</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="/post-job" className="text-gray-300 hover:text-white">Post a Job</Link></li>
                <li><Link href="/pricing" className="text-gray-300 hover:text-white">Pricing</Link></li>
                <li><Link href="/employer-guide" className="text-gray-300 hover:text-white">Employer Guide</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="/privacy" className="text-gray-300 hover:text-white">Privacy Policy</Link></li>
                <li><Link href="/terms" className="text-gray-300 hover:text-white">Terms & Conditions</Link></li>
                <li><Link href="/refund-policy" className="text-gray-300 hover:text-white">Refund Policy</Link></li>
                <li>
                  <ContactModal>
                    <button className="text-gray-300 hover:text-white text-left">Contact Us</button>
                  </ContactModal>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-sm text-gray-400">
            © 2024 StudentJobs UK. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}