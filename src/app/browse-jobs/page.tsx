"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Header } from "@/components/ui/header"
import { ContactModal } from "@/components/ui/contact-modal"; // <--- This import is correctly present

interface Job {
  id: number
  title: string
  company: string
  location: string
  hourlyPay: string
  hoursPerWeek: string
  hoursType: string
  description: string
  postedDate: string
  sponsored: boolean
  category: string
  applicationUrl: string | null
  phoneNumber: string
  applicationCount: number
  employer: string
}

const mockJobs = [
  {
    id: 1,
    title: "Barista - Weekend Shifts",
    company: "Central Perk Coffee",
    location: "Manchester City Centre",
    hourlyPay: "£11.50",
    hoursPerWeek: "10-15",
    hoursType: "term-time",
    description: "Looking for friendly students to join our weekend team. Perfect for those studying during the week! Flexible hours available. Term-time position - up to 20 hours per week during studies.",
    postedDate: "2 days ago",
    sponsored: true,
    category: "Hospitality",
    applicationUrl: "https://centralperk.co.uk/careers/apply/barista-weekend",
    phoneNumber: "+44 161 234 5678",
    applicationCount: 12,
    employer: "John Smith",
  },
  {
    id: 2,
    title: "Tutoring - Maths & Science",
    company: "Private Tutor",
    location: "Leeds",
    hourlyPay: "£18.00",
    hoursPerWeek: "5-10",
    hoursType: "term-time",
    description: "Help secondary school students with GCSE Maths and Science. Flexible timing to fit around your studies. Available during term-time with flexible scheduling.",
    postedDate: "1 week ago",
    sponsored: false,
    category: "Education",
    applicationUrl: null, // No URL - contact employer only
    phoneNumber: "+44 113 987 6543",
    applicationCount: 8,
    employer: "Sarah Wilson",
  },
  {
    id: 3,
    title: "Shop Assistant",
    company: "Corner Shop Ltd",
    location: "Birmingham",
    hourlyPay: "£10.50",
    hoursPerWeek: "12-20",
    hoursType: "term-time",
    description: "Weekend and evening shifts available. Great for students wanting flexible hours during term-time (up to 20 hours/week).",
    postedDate: "3 days ago",
    sponsored: false,
    category: "Retail",
    applicationUrl: "mailto:jobs@cornershop.co.uk?subject=Shop Assistant Application",
    phoneNumber: "+44 121 555 0123",
    applicationCount: 5,
    employer: "Mike Johnson",
  },
  {
    id: 4,
    title: "Event Assistant - Summer Work",
    company: "Events Plus",
    location: "London",
    hourlyPay: "£13.00",
    hoursPerWeek: "30-40",
    hoursType: "holiday",
    description: "Help with event setup and management during university holidays. Full-time opportunity available during semester breaks (up to 40 hours/week).",
    postedDate: "5 days ago",
    sponsored: true,
    category: "Events",
    applicationUrl: "https://eventsplus.co.uk/apply/summer-assistant",
    phoneNumber: "+44 20 7123 4567",
    applicationCount: 23,
    employer: "Lisa Anderson",
  },
  {
    id: 5,
    title: "Warehouse Assistant - Holiday Cover",
    company: "Logistics Ltd",
    location: "Manchester",
    hourlyPay: "£12.00",
    hoursPerWeek: "35-40",
    hoursType: "holiday",
    description: "Full-time warehouse work during university holidays. Perfect for students looking to earn more during semester breaks.",
    postedDate: "1 week ago",
    sponsored: false,
    category: "Warehouse",
    applicationUrl: null, // No URL - contact employer only
    phoneNumber: "+44 161 888 9999",
    applicationCount: 15,
    employer: "David Brown",
  },
  // Add more mock jobs to test pagination
  ...Array.from({length: 20}, (_, i) => ({
    id: i + 6,
    title: `Sample Job ${i + 1}`,
    company: `Company ${i + 1}`,
    location: "UK",
    hourlyPay: "£11.00",
    hoursPerWeek: "10-15",
    hoursType: i % 2 === 0 ? "term-time" : "holiday",
    description: `Sample job description for testing pagination. Job number ${i + 1}.`,
    postedDate: "1 week ago",
    sponsored: i % 5 === 0,
    category: "Other",
    applicationUrl: i % 3 === 0 ? `https://company${i + 1}.com/apply` : null,
    phoneNumber: `+44 20 ${(7000 + i).toString().slice(0, 4)} ${(1000 + i).toString()}`,
    applicationCount: Math.floor(Math.random() * 20) + 1,
    employer: `Employer ${i + 1}`,
  })),
]

const JOBS_PER_PAGE = 20

export default function BrowseJobsPage() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [locationFilter, setLocationFilter] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("")
  const [hoursTypeFilter, setHoursTypeFilter] = useState("")
  const [dateFilter, setDateFilter] = useState("")
  const [selectedJobId, setSelectedJobId] = useState<number | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [revealedPhones, setRevealedPhones] = useState<Set<number>>(new Set())

  // Mock applied jobs for logged in user
  const [appliedJobs] = useState<Set<number>>(new Set([1, 3])) // User has applied to jobs 1 and 3
  const [isLoggedIn] = useState(true) // Mock logged in state

  const filteredJobs = useMemo(() => {
    return mockJobs.filter(job => {
      let matchesDate = true
      if (dateFilter === 'today') {
        matchesDate = job.postedDate.includes('hours ago') || job.postedDate === 'today'
      } else if (dateFilter === 'week') {
        matchesDate = job.postedDate.includes('days ago') || job.postedDate.includes('hours ago') || job.postedDate === 'today'
      } else if (dateFilter === 'month') {
        matchesDate = !job.postedDate.includes('months ago')
      }

      return (
        (searchTerm === "" || job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
         job.company.toLowerCase().includes(searchTerm.toLowerCase())) &&
        (locationFilter === "" || job.location.toLowerCase().includes(locationFilter.toLowerCase())) &&
        (categoryFilter === "" || job.category === categoryFilter) &&
        (hoursTypeFilter === "" || job.hoursType === hoursTypeFilter) &&
        matchesDate
      )
    })
  }, [searchTerm, locationFilter, categoryFilter, hoursTypeFilter, dateFilter])

  // Sort jobs so sponsored ones appear first
  const sortedJobs = useMemo(() => {
    return filteredJobs.sort((a, b) => {
      if (a.sponsored && !b.sponsored) return -1
      if (!a.sponsored && b.sponsored) return 1
      return 0
    })
  }, [filteredJobs])

  // Pagination calculations
  const totalPages = Math.ceil(sortedJobs.length / JOBS_PER_PAGE)
  const startIndex = (currentPage - 1) * JOBS_PER_PAGE
  const endIndex = startIndex + JOBS_PER_PAGE
  const currentJobs = sortedJobs.slice(startIndex, endIndex)

  const handleJobDescriptionClick = (jobId: number) => {
    setSelectedJobId(selectedJobId === jobId ? null : jobId)
  }

  const clearFilters = () => {
    setSearchTerm("")
    setLocationFilter("")
    setCategoryFilter("")
    setHoursTypeFilter("")
    setDateFilter("")
    setCurrentPage(1)
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    setSelectedJobId(null) // Close any open job descriptions
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Reset to page 1 when filters change
  const handleFilterChange = (filterSetter: (value: string) => void, value: string) => {
    filterSetter(value)
    setCurrentPage(1)
  }

  const handleRevealPhone = (jobId: number) => {
    router.push(`/pay?jobId=${jobId}&type=phone`)
  }

  const handleApply = (job: Job) => {
    // Check if user is logged in (mock check)
    const isLoggedIn = false // In real app, check auth state
    if (!isLoggedIn) {
      router.push('/login')
      return
    }
    router.push(`/pay?jobId=${job.id}&type=apply`)
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header userType="student" />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Browse Part-Time Jobs</h1>
          <p className="text-gray-600">Find flexible opportunities that fit around your studies</p>

          {/* Student Work Hours Info */}
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">Student Work Hour Limits</h3>
            <div className="text-sm text-blue-800 space-y-1">
              <p><strong>During term-time:</strong> Up to 20 hours per week while studying</p>
              <p><strong>During holidays/semester breaks:</strong> Up to 40 hours per week (full-time)</p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-6 rounded-lg border mb-6">
          <h2 className="text-lg font-semibold mb-4">Search & Filter Jobs</h2>
          <div className="grid gap-4 md:grid-cols-6">
            <div>
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                Search Jobs
              </label>
              <input
                id="search"
                type="text"
                placeholder="Job title or company..."
                value={searchTerm}
                onChange={(e) => handleFilterChange(setSearchTerm, e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                Location
              </label>
              <input
                id="location"
                type="text"
                placeholder="City or area..."
                value={locationFilter}
                onChange={(e) => handleFilterChange(setLocationFilter, e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                id="category"
                value={categoryFilter}
                onChange={(e) => handleFilterChange(setCategoryFilter, e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All categories</option>
                <option value="Hospitality">Hospitality</option>
                <option value="Retail">Retail</option>
                <option value="Education">Education</option>
                <option value="Events">Events</option>
                <option value="Warehouse">Warehouse</option>
                <option value="Admin">Admin</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label htmlFor="hoursType" className="block text-sm font-medium text-gray-700 mb-2">
                Work Period
              </label>
              <select
                id="hoursType"
                value={hoursTypeFilter}
                onChange={(e) => handleFilterChange(setHoursTypeFilter, e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All periods</option>
                <option value="term-time">Term-time (up to 20hrs)</option>
                <option value="holiday">Holidays (up to 40hrs)</option>
              </select>
            </div>
            <div>
              <label htmlFor="dateFilter" className="block text-sm font-medium text-gray-700 mb-2">
                Posted Date
              </label>
              <select
                id="dateFilter"
                value={dateFilter}
                onChange={(e) => handleFilterChange(setDateFilter, e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All dates</option>
                <option value="today">Today</option>
                <option value="week">This week</option>
                <option value="month">This month</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={clearFilters}
                className="w-full px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-4 flex items-center justify-between">
          <p className="text-gray-600">
            {sortedJobs.length} job{sortedJobs.length !== 1 ? 's' : ''} found
            {totalPages > 1 && (
              <span className="text-gray-500"> • Page {currentPage} of {totalPages}</span>
            )}
          </p>
          {totalPages > 1 && (
            <p className="text-sm text-gray-500">
              Showing {startIndex + 1}-{Math.min(endIndex, sortedJobs.length)} of {sortedJobs.length} jobs
            </p>
          )}
        </div>

        {/* Job Listings */}
        <div className="space-y-4">
          {currentJobs.map((job) => (
            <div key={job.id} className={`bg-white p-4 sm:p-6 rounded-lg border break-words ${job.sponsored ? 'border-blue-200 bg-blue-50/50' : ''}`}>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-start gap-2 mb-1">
                    <h3 className="text-lg font-semibold break-words leading-tight">{job.title}</h3>
                    {job.sponsored && (
                      <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                        Sponsored
                      </span>
                    )}
                    {isLoggedIn && appliedJobs.has(job.id) && (
                      <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                        Applied
                      </span>
                    )}
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      job.hoursType === 'holiday'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {job.hoursType === 'holiday' ? 'Holiday Work' : 'Term-time'}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-2">{job.company} • {job.location}</p>
                  <div className="flex items-center gap-4">
                    <span className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full">
                      {job.category}
                    </span>
                    <span className="text-sm text-gray-500">Posted {job.postedDate}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-semibold text-green-600">{job.hourlyPay}/hour</div>
                  <div className="text-sm text-gray-500">{job.hoursPerWeek} hours/week</div>
                  <div className="text-xs text-gray-400 mt-1">
                    {job.hoursType === 'holiday' ? 'Holidays only' : 'Term-time work'}
                  </div>
                </div>
              </div>

              {/* Job Description (expandable) */}
              {selectedJobId === job.id && (
                <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold mb-2">Job Description</h4>
                  <p className="text-gray-700">{job.description}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => handleJobDescriptionClick(job.id)}
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {selectedJobId === job.id ? 'Hide Details' : 'Job Description'}
                </button>

                {/* Apply Button */}
                <button
                  onClick={() => handleApply(job)}
                  className={`px-6 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    isLoggedIn && appliedJobs.has(job.id)
                      ? 'bg-green-600 text-white hover:bg-green-700'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                  disabled={isLoggedIn && appliedJobs.has(job.id)}
                >
                  {isLoggedIn && appliedJobs.has(job.id) ? 'Applied ✓' : 'Apply Now'}
                </button>

                {/* Reveal Phone Number Button */}
                <button
                  onClick={() => handleRevealPhone(job.id)}
                  className={`px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    revealedPhones.has(job.id) || (isLoggedIn && appliedJobs.has(job.id))
                      ? 'border-green-300 bg-green-50 text-green-700'
                      : 'border-gray-300 hover:bg-gray-50'
                  }`}
                  disabled={revealedPhones.has(job.id) || (isLoggedIn && appliedJobs.has(job.id))}
                >
                  {revealedPhones.has(job.id) || (isLoggedIn && appliedJobs.has(job.id))
                    ? `📞 ${job.phoneNumber}`
                    : '📞 Reveal Phone (£1)'
                  }
                </button>

                {/* Application Count */}
                <div className="flex items-center px-3 py-2 bg-gray-100 rounded-md text-sm text-gray-600">
                  👥 {job.applicationCount} applications
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8 flex items-center justify-center">
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>

              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                  // Show first page, last page, current page, and pages around current page
                  const showPage = page === 1 ||
                                   page === totalPages ||
                                   (page >= currentPage - 2 && page <= currentPage + 2)

                  if (!showPage) {
                    // Show ellipsis
                    if (page === currentPage - 3 || page === currentPage + 3) {
                      return <span key={page} className="px-2 text-gray-500">...</span>
                    }
                    return null
                  }

                  return (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`px-3 py-2 border rounded-md ${
                        currentPage === page
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  )
                })}
              </div>

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* No Results */}
        {sortedJobs.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg border">
            <h3 className="text-lg font-semibold mb-2">No jobs found</h3>
            <p className="text-gray-600 mb-4">
              Try adjusting your search criteria or check back later for new opportunities.
            </p>
            <Link href="/" className="inline-block px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50">
              Back to Home
            </Link>
          </div>
        )}
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
                {/* ContactModal component correctly placed here */}
                <ContactModal>
                    <button className="text-gray-300 hover:text-white text-left px-0 py-0 text-sm font-medium">Contact Us</button>
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