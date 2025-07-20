// src/app/browse-jobs/page.tsx
"use client"

import { useState, useMemo, useEffect, Suspense } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Header } from "@/components/ui/header"
import { ContactModal } from "@/components/ui/contact-modal"
import { useAuth } from "@/app/context/AuthContext" // Import the useAuth hook

// UPDATED: Job interface to match backend API response
interface Job {
  job_id: number; // Changed from 'id'
  job_title: string; // Changed from 'title'
  job_description: string; // Changed from 'description'
  job_category: string; // Changed from 'category'
  job_location: string; // Changed from 'location'
  hourly_pay: string; // Changed from 'hourlyPay', now string as per API example
  hours_per_week: string; // Changed from 'hoursPerWeek'
  contact_name: string; // Added from API
  contact_phone: string; // Added from API
  contact_email: string; // Added from API
  is_sponsored: boolean; // Changed from 'sponsored'
  posted_by_user_id: number; // Added from API
  created_at: string; // Added from API, now ISO string
  expires_at: string | null; // Added from API
  job_status: string; // Added from API
  // Frontend-only fields (these will be derived or managed client-side)
  hoursType: string; // Still needed for filtering/display logic
  applicationCount: number; // Still needed for display, might need API for real count
  employer: string; // Still needed for display, will be contact_name or derived
  applicationUrl: string | null; // Still needed, will likely be derived or null
}

// Helper function to format dates as "X days ago", "X weeks ago", etc.
const formatDateAgo = (isoDateString: string): string => {
  const date = new Date(isoDateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  let interval = seconds / 31536000;
  if (interval > 1) {
    return Math.floor(interval) + " years ago";
  }
  interval = seconds / 2592000;
  if (interval > 1) {
    return Math.floor(interval) + " months ago";
  }
  interval = seconds / 604800; // seconds in a week
  if (interval > 1) {
    return Math.floor(interval) + " weeks ago";
  }
  interval = seconds / 86400;
  if (interval > 1) {
    return Math.floor(interval) + " days ago";
  }
  interval = seconds / 3600;
  if (interval > 1) {
    return Math.floor(interval) + " hours ago";
  }
  interval = seconds / 60;
  if (interval > 1) {
    return Math.floor(interval) + " minutes ago";
  }
  return "just now";
};


const JOBS_PER_PAGE = 15

export default function BrowseJobsPage() {
  const router = useRouter()
  const { user, isLoading: isAuthLoading, logout } = useAuth(); // Renamed isLoading to isAuthLoading to avoid conflict

  const [jobs, setJobs] = useState<Job[]>([]); // Changed from mockJobs
  const [jobsLoading, setJobsLoading] = useState(true); // New loading state for jobs
  const [jobsError, setJobsError] = useState<string | null>(null); // New error state for jobs

  const [searchTerm, setSearchTerm] = useState("")
  const [locationFilter, setLocationFilter] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("")
  const [hoursTypeFilter, setHoursTypeFilter] = useState("")
  const [dateFilter, setDateFilter] = useState("")
  const [selectedJobId, setSelectedJobId] = useState<number | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [revealedPhones, setRevealedPhones] = useState<Set<number>>(new Set())

  // Mock applied jobs for logged in user - KEEPING THIS AS IS FOR NOW
  const [appliedJobs] = useState<Set<number>>(new Set([1, 3])) // User has applied to jobs 1 and 3

  // NEW: Fetch jobs from the backend API
  useEffect(() => {
    const fetchJobs = async () => {
      setJobsLoading(true);
      setJobsError(null);
      try {
        const response = await fetch('/api/job');
        if (!response.ok) {
          throw new Error('Failed to fetch jobs');
        }
        const data: Job[] = await response.json();

        // Map API data to fit existing Job interface expectations for frontend display/logic
        const mappedJobs: Job[] = data.map(job => ({
          ...job,
          id: job.job_id, // Map job_id to id for existing frontend logic
          title: job.job_title,
          company: job.contact_name, // Using contact_name as company for display
          location: job.job_location,
          hourlyPay: job.hourly_pay,
          hoursPerWeek: job.hours_per_week,
          description: job.job_description,
          sponsored: job.is_sponsored,
          category: job.job_category,
          // UPDATED LOGIC: Determine hoursType based on hours_per_week using parseFloat
          hoursType: parseFloat(job.hours_per_week) > 20 ? "holiday" : "term-time", // If > 20, it's holiday work
          postedDate: formatDateAgo(job.created_at), // Format the date
          applicationUrl: job.contact_email ? `mailto:${job.contact_email}` : null, // Assuming contact_email for application URL
          phoneNumber: job.contact_phone,
          applicationCount: Math.floor(Math.random() * 20) + 1, // Still mock for now, until API provides it
          employer: job.contact_name, // Using contact_name as employer
        }));
        setJobs(mappedJobs);
      } catch (err) {
        console.error("Error fetching jobs:", err);
        setJobsError("Failed to load jobs. Please try again later.");
      } finally {
        setJobsLoading(false);
      }
    };

    fetchJobs();
  }, []); // Empty dependency array means this runs once on mount

  const filteredJobs = useMemo(() => {
    return jobs.filter(job => { // Filter the 'jobs' state
      let matchesDate = true
      if (dateFilter === 'today') {
        // For 'today', check if postedDate is "just now" or "X hours ago" (less than 24 hours)
        const date = new Date(job.created_at);
        const now = new Date();
        const diffHours = Math.abs(now.getTime() - date.getTime()) / (1000 * 60 * 60);
        matchesDate = diffHours < 24;
      } else if (dateFilter === 'week') {
        // For 'this week', check if postedDate is within the last 7 days
        const date = new Date(job.created_at);
        const now = new Date();
        const diffDays = Math.abs(now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24);
        matchesDate = diffDays <= 7;
      } else if (dateFilter === 'month') {
        // For 'this month', check if postedDate is within the last 30 days
        const date = new Date(job.created_at);
        const now = new Date();
        const diffDays = Math.abs(now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24);
        matchesDate = diffDays <= 30;
      }

      return (
        (searchTerm === "" || job.job_title.toLowerCase().includes(searchTerm.toLowerCase()) || // Use job_title
         job.contact_name.toLowerCase().includes(searchTerm.toLowerCase())) && // Use contact_name
        (locationFilter === "" || job.job_location.toLowerCase().includes(locationFilter.toLowerCase())) && // Use job_location
        (categoryFilter === "" || job.job_category === categoryFilter) && // Use job_category
        (hoursTypeFilter === "" || job.hoursType === hoursTypeFilter) &&
        matchesDate
      )
    })
  }, [jobs, searchTerm, locationFilter, categoryFilter, hoursTypeFilter, dateFilter]) // Add 'jobs' to dependencies

  // NEW ROBUST SORTING LOGIC: Sponsored first, then by latest created_at
  const sortedJobs = useMemo(() => {
    // Create a shallow copy to avoid mutating the original array, which can cause issues with React's memoization
    const jobsCopy = [...filteredJobs]; 

    return jobsCopy.sort((a, b) => {
      // Primary sort: Sponsored jobs come first (true comes before false)
      const sponsoredA = a.is_sponsored ? 0 : 1; // Give sponsored a lower "score" (0)
      const sponsoredB = b.is_sponsored ? 0 : 1;

      if (sponsoredA !== sponsoredB) {
        return sponsoredA - sponsoredB;
      }

      // Secondary sort: If sponsored status is the same, sort by created_at (latest first)
      // Convert ISO strings to Date objects for reliable comparison
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      
      // Handle cases where dates might be invalid (though they should be valid ISO strings from DB)
      // If dateB is invalid, put it after dateA. If dateA is invalid, put it after dateB.
      // If both are invalid, their relative order doesn't matter for date comparison.
      if (isNaN(dateB) && !isNaN(dateA)) return -1; // b is invalid, a is valid: a comes first
      if (isNaN(dateA) && !isNaN(dateB)) return 1;  // a is invalid, b is valid: b comes first
      if (isNaN(dateA) && isNaN(dateB)) return 0;   // both invalid, maintain relative order

      return dateB - dateA; // Descending order: newer date (larger timestamp) comes first
    });
  }, [filteredJobs]); // Dependency on filteredJobs to re-sort when filters change

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
    if (!user) {
      router.push('/login')
      return
    }
    router.push(`/pay?jobId=${job.job_id}&type=apply`) // Use job.job_id
  }

  return (
    // Added overflow-x-hidden to the main container to prevent horizontal scroll
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 overflow-x-hidden">
      <Header user={user} logout={logout} isLoading={isAuthLoading} />

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
              <label htmlFor="search" className="block text-sm font-medium text-gray-700"> {/* Removed mb-2 */}
                Search Jobs
              </label>
              {/* Added mt-4 to align inputs/selects with the "Clear Filters" button */}
              <input
                id="search"
                type="text"
                placeholder="Job title or company..."
                value={searchTerm}
                onChange={(e) => handleFilterChange(setSearchTerm, e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mt-4"
              />
            </div>
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700"> {/* Removed mb-2 */}
                Location
              </label>
              {/* Added mt-4 to align inputs/selects with the "Clear Filters" button */}
              <input
                id="location"
                type="text"
                placeholder="City or area..."
                value={locationFilter}
                onChange={(e) => handleFilterChange(setLocationFilter, e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mt-4"
              />
            </div>
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700"> {/* Removed mb-2 */}
                Category
              </label>
              {/* Added mt-4 to align inputs/selects with the "Clear Filters" button */}
              <select
                id="category"
                value={categoryFilter}
                onChange={(e) => handleFilterChange(setCategoryFilter, e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mt-4"
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
              <label htmlFor="hoursType" className="block text-sm font-medium text-gray-700"> {/* Removed mb-2 */}
                Work Period
              </label>
              {/* Added mt-4 to align inputs/selects with the "Clear Filters" button */}
              <select
                id="hoursType"
                value={hoursTypeFilter}
                onChange={(e) => handleFilterChange(setHoursTypeFilter, e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mt-4"
              >
                <option value="">All periods</option>
                <option value="term-time">Term-time (up to 20hrs)</option>
                <option value="holiday">Holidays (up to 40hrs)</option>
              </select>
            </div>
            <div>
              <label htmlFor="dateFilter" className="block text-sm font-medium text-gray-700"> {/* Removed mb-2 */}
                Posted Date
              </label>
              {/* Added mt-4 to align inputs/selects with the "Clear Filters" button */}
              <select
                id="dateFilter"
                value={dateFilter}
                onChange={(e) => handleFilterChange(setDateFilter, e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mt-4"
              >
                <option value="">All dates</option>
                <option value="today">Today</option>
                <option value="week">This week</option>
                <option value="month">This month</option>
              </select>
            </div>
            {/* CORRECTED ALIGNMENT AND STYLING FOR CLEAR FILTERS BUTTON */}
            <div className="flex items-end">
              <button
                onClick={clearFilters}
                // Tailwind classes for styling that matches primary color, but lighter for a secondary action.
                // Good contrast for accessibility (AA or AAA depending on exact blue shade).
                className="w-full px-4 py-2 bg-blue-100 text-blue-700 border border-blue-200 rounded-md hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
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

        {/* Job Loading/Error States */}
        {jobsLoading && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading jobs...</p>
          </div>
        )}

        {jobsError && (
          <div className="text-center py-8 text-red-600">
            <p>{jobsError}</p>
            <Button onClick={() => window.location.reload()} className="mt-4">Retry</Button>
          </div>
        )}

        {/* Job Listings (only show if not loading and no error) */}
        {!jobsLoading && !jobsError && sortedJobs.length > 0 && (
          <div className="space-y-4">
            {currentJobs.map((job) => (
              <div key={job.job_id} className={`bg-white p-4 sm:p-6 rounded-lg border break-words ${job.is_sponsored ? 'border-blue-200 bg-blue-50/50' : ''}`}>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-start gap-2 mb-1">
                      <h3 className="text-lg font-semibold break-words leading-tight">{job.job_title}</h3>
                      {job.is_sponsored && (
                        <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                          Sponsored
                        </span>
                      )}
                      {user && appliedJobs.has(job.job_id) && ( // Use job.job_id
                        <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                          Applied
                        </span>
                      )}
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        job.hoursType === 'holiday'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {job.hoursType === 'holiday' ? 'Holiday work' : 'Term-time'}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-2">{job.contact_name} • {job.job_location}</p>
                    <div className="flex items-center gap-4">
                      <span className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full">
                        {job.job_category}
                      </span>
                      <span className="text-sm text-gray-500">Posted {job.postedDate}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold text-green-600">£{job.hourly_pay}/hour</div>
                    <div className="text-sm text-gray-500">{job.hours_per_week} hours/week</div>
                    <div className="text-xs text-gray-400 mt-1">
                      {job.hoursType === 'holiday' ? 'Holiday work' : 'Term-time work'}
                    </div>
                  </div>
                </div>

                {/* Job Description (expandable) */}
                {selectedJobId === job.job_id && ( // Use job.job_id
                  <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-semibold mb-2">Job Description</h4>
                    {/* UPDATED: Render description with line breaks */}
                    <p className="text-gray-700" dangerouslySetInnerHTML={{ __html: job.job_description.replace(/\n/g, '<br />') }} />
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => handleJobDescriptionClick(job.job_id)} // Use job.job_id
                    className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {selectedJobId === job.job_id ? 'Hide Details' : 'Job Description'}
                  </button>

                  {/* Apply Button */}
                  <button
                    onClick={() => handleApply(job)}
                    className={`px-6 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      user && appliedJobs.has(job.job_id) // Use job.job_id
                        ? 'bg-green-600 text-white hover:bg-green-700'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                    disabled={!!user && appliedJobs.has(job.job_id)}
                  >
                    {user && appliedJobs.has(job.job_id) ? 'Applied ✓' : 'Apply Now'}
                  </button>

                  {/* Reveal Phone Number Button */}
                  <button
                    onClick={() => handleRevealPhone(job.job_id)} // Use job.job_id
                    className={`px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      revealedPhones.has(job.job_id) || (user && appliedJobs.has(job.job_id)) // Use job.job_id
                        ? 'border-green-300 bg-green-50 text-green-700'
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}
                    disabled={revealedPhones.has(job.job_id) || (!!user && appliedJobs.has(job.job_id))}
                  >
                    {revealedPhones.has(job.job_id) || (user && appliedJobs.has(job.job_id)) // Use job.job_id
                      ? `📞 ${job.contact_phone}` // Use job.contact_phone
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
        )}

        {/* No Results (only show if not loading, no error, and filteredJobs is empty) */}
        {!jobsLoading && !jobsError && sortedJobs.length === 0 && (
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

        {/* Pagination */}
        {totalPages > 1 && !jobsLoading && !jobsError && ( // Only show pagination if data is loaded
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
                  const showPage = page === 1 ||
                                   page === totalPages ||
                                   (page >= currentPage - 2 && page <= currentPage + 2)

                  if (!showPage) {
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