// src/app/browse-jobs/page.tsx
"use client"

import { useState, useMemo, useEffect, Suspense, useRef } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Header } from "@/components/ui/header"
import { Footer } from "@/components/ui/footer"
import { Building2Icon, GlobeIcon, ClockIcon } from "lucide-react"

import { useAuth } from "@/app/context/AuthContext"
import ApplicationMessageModal from '@/app/application-message/application-message';

interface Job {
  job_id: number;
  job_title: string;
  job_description: string;
  job_category: string;
  job_location: string;
  hourly_pay: string;
  hours_per_week: string;
  contact_name: string;
  contact_phone: string;
  contact_email: string;
  is_sponsored: boolean;
  posted_by_user_id: number;
  created_at: string;
  expires_at: string | null;
  job_status: string;
  application_count?: number; // Real application count from database
  positions_available?: number;
  positions_filled?: number;
  positions_remaining?: number;

  // Frontend-only fields (these will be derived or managed client-side)
  hoursType: string;
  applicationCount: number;
  employer: string;
  applicationUrl: string | null;
  postedDate: string;
  id: number;
  title: string;
  company: string;
  location: string;
  hourlyPay: string;
  hoursPerWeek: string;
  description: string;
  sponsored: boolean;
  category: string;
  phoneNumber: string;
}

const formatDateAgo = (isoDateString: string): string => {
  const date = new Date(isoDateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  let interval = seconds / 31536000;
  if (interval > 1) {
    return Math.floor(interval) + (Math.floor(interval) === 1 ? " year ago" : " years ago");
  }
  interval = seconds / 2592000;
  if (interval > 1) {
    return Math.floor(interval) + (Math.floor(interval) === 1 ? " month ago" : " months ago");
  }
  interval = seconds / 604800;
  if (interval > 1) {
    return Math.floor(interval) + (Math.floor(interval) === 1 ? " week ago" : " weeks ago");
  }
  interval = seconds / 86400;
  if (interval > 1) {
    return Math.floor(interval) + (Math.floor(interval) === 1 ? " day ago" : " days ago");
  }
  interval = seconds / 3600;
  if (interval > 1) {
    return Math.floor(interval) + (Math.floor(interval) === 1 ? " hour ago" : " hours ago");
  }
  interval = seconds / 60;
  if (interval > 1) {
    return Math.floor(interval) + (Math.floor(interval) === 1 ? " minute ago" : " minutes ago");
  }
  return "just now";
};

const JOBS_PER_PAGE = 15;

// --- Loading Skeleton Component ---
const LoadingSkeleton = () => (
  <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-zinc-200 dark:border-gray-700 animate-pulse">
    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4">
      <div className="flex-grow">
        <div className="h-7 bg-gray-300 dark:bg-gray-700 rounded w-4/5 mb-3"></div>
        <div className="h-5 bg-gray-300 dark:bg-gray-700 rounded w-3/5 mb-3"></div>
        <div className="flex gap-2 mt-2">
          <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded-full w-24"></div>
          <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded-full w-28"></div>
        </div>
      </div>
      <div className="text-right mt-4 sm:mt-0">
        <div className="h-7 bg-gray-300 dark:bg-gray-700 rounded w-28 ml-auto"></div>
        <div className="h-5 bg-gray-300 dark:bg-gray-700 rounded w-24 ml-auto mt-1"></div>
      </div>
    </div>
    <div className="flex flex-wrap gap-3 mt-4">
      <div className="h-11 bg-gray-300 dark:bg-gray-700 rounded-lg w-36"></div>
      <div className="h-11 bg-gray-300 dark:bg-gray-700 rounded-lg w-32"></div>
      <div className="h-11 bg-gray-300 dark:bg-gray-700 rounded-lg w-44"></div>
      <div className="h-11 bg-gray-300 dark:bg-gray-700 rounded-lg w-28"></div>
    </div>
  </div>
);

// --- Job Details Modal Component ---
interface JobDetailsModalProps {
  job: Job | null;
  onClose: () => void;
  onApply: (job: Job) => void;
  onRevealPhone: (jobId: number) => void;
  revealedPhones: Set<number>;
  appliedJobs: Set<number>;
  user: any;
  isMobile: boolean; // Keep this prop, but the component itself won't be rendered on mobile
  applicationsStatus: Map<number, {status: string, applicationStatus: string, confirmed: boolean}>;
}

const JobDetailsModal: React.FC<JobDetailsModalProps> = ({ job, onClose, onApply, onRevealPhone, revealedPhones, appliedJobs, user, applicationsStatus }) => {
  const modalContentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Disable background scroll when modal is open
    document.body.style.overflow = 'hidden';
    
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    const handleClickOutside = (event: MouseEvent) => {
      if (modalContentRef.current && !modalContentRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      // Re-enable background scroll when modal is closed
      document.body.style.overflow = 'unset';
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  if (!job) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[999] transition-opacity duration-300 pt-0 sm:pt-20">
      <div ref={modalContentRef} className="bg-white dark:bg-gray-900 p-4 sm:p-8 rounded-3xl shadow-3xl w-full sm:max-w-4xl mx-4 mt-20 mb-4 sm:my-8 relative flex flex-col max-h-[75vh] sm:max-h-[85vh] overflow-hidden transition-all duration-300 transform scale-100 opacity-100">
        <button
          onClick={onClose}
          className="absolute top-3 sm:top-5 right-3 sm:right-5 p-2 sm:p-2 rounded-full bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors duration-200 z-10 focus:outline-none focus:ring-2 focus:ring-blue-500 active:scale-90"
          aria-label="Close job details"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-7 h-7">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="mb-3 sm:mb-6 pb-3 sm:pb-6 border-b border-zinc-200 dark:border-gray-700 pr-10 sm:pr-12">
          <div className="flex items-center flex-wrap gap-2 mb-3">
            <h2 className="text-xl sm:text-3xl font-extrabold text-gray-900 dark:text-white leading-tight">
              {job.job_title}
            </h2>
            {job.is_sponsored && (
              <span className="px-3 py-1 text-xs font-semibold bg-blue-600 text-white rounded-full flex items-center gap-1 shadow-md">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
                  <path fillRule="evenodd" d="M10 1c4.97 0 9 4.03 9 9s-4.03 9-9 9-9-4.03-9-9 4.03-9 9-9ZM9.375 6a.75.75 0 0 0-1.5 0v4.25c0 .414.336.75.75.75h4.25a.75.75 0 0 0 0-1.5h-3.5V6Z" clipRule="evenodd" />
                </svg>
                SPONSORED
              </span>
            )}
            <span className={`px-3 py-1 text-sm font-semibold rounded-full ${
              job.hoursType === 'holiday'
                ? 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200'
            } shadow-sm`}>
              {job.hoursType === 'holiday' ? 'Holiday Work' : 'Term-Time'}
            </span>
          </div>
          <p className="text-sm sm:text-lg text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
            <Building2Icon className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500 dark:text-gray-400" />
            {job.contact_name} <GlobeIcon className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500 dark:text-gray-400" />
            {job.job_location}
          </p>
          <div className="flex items-center gap-4 mb-3">
            <div className="text-lg font-bold text-green-600 dark:text-green-400">£{job.hourly_pay}<span className="text-base font-medium">/hr</span></div>
            <div className="text-sm text-gray-600 dark:text-gray-300 flex items-center gap-1">
              <ClockIcon className="h-4 w-4" />
              {job.hours_per_week} hours/week
            </div>
          </div>
          <div className="flex items-center flex-wrap gap-x-4 gap-y-2">
            <span className="px-3 py-1 text-sm bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full font-medium shadow-sm">
              {job.job_category}
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-gray-500 dark:text-gray-400">
                <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25ZM12.75 6a.75.75 0 0 0-1.5 0v6a.75.75 0 0 0 .174.45l3.5 4.499a.75.75 0 0 0 1.14-.948L13.5 12.579V6Z" clipRule="evenodd" />
              </svg>
              Posted {job.postedDate}
            </span>
            <div className="flex items-center gap-3">
              <div className="flex items-center px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded-full text-sm text-gray-700 dark:text-gray-300 font-medium shadow-sm">
                {job.applicationCount} applications
              </div>
              <div className="px-3 py-1 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg text-sm text-yellow-800 dark:text-yellow-400 font-semibold border border-yellow-300 dark:border-yellow-500/20">
                {Math.max(0, (job.positions_available || 1) - (job.positions_filled || 0))} open
              </div>
            </div>
          </div>
        </div>

        <div className="flex-grow overflow-y-auto pr-2 custom-scrollbar min-h-0">
          <h3 className="font-bold text-lg sm:text-xl text-gray-900 dark:text-white mb-3">Full Job Description</h3>
          <div className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm sm:text-base prose dark:prose-invert max-w-none">
            <p dangerouslySetInnerHTML={{ __html: job.job_description.replace(/\n/g, '<br />') }} />
          </div>
        </div>

        <div className="mt-4 sm:mt-8 pt-4 sm:pt-6 border-t border-zinc-200 dark:border-gray-700 flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center sm:justify-start">
          <button
            onClick={() => onApply(job)}
            className={`px-6 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 active:scale-98 shadow-md text-lg font-semibold ${
              user && applicationsStatus.get(job.job_id)?.status === 'declined'
                ? 'bg-red-700 text-white hover:bg-red-800 cursor-not-allowed opacity-90'
                : user && applicationsStatus.get(job.job_id)?.status === 'hired'
                ? 'bg-purple-600 text-white hover:bg-purple-700 cursor-not-allowed opacity-90'
                : user && appliedJobs.has(job.job_id)
                ? 'bg-green-700 text-white hover:bg-green-800 cursor-not-allowed opacity-90'
                : 'bg-blue-600 text-white hover:bg-blue-600 hover:scale-105'
            }`}
            disabled={!!user && (appliedJobs.has(job.job_id) || applicationsStatus.get(job.job_id)?.status === 'declined' || applicationsStatus.get(job.job_id)?.status === 'hired')}
          >
            {user && (appliedJobs.has(job.job_id) || applicationsStatus.get(job.job_id)?.status === 'declined' || applicationsStatus.get(job.job_id)?.status === 'hired') 
              ? (applicationsStatus.get(job.job_id)?.status === 'declined' 
                  ? 'Declined ✗' 
                  : applicationsStatus.get(job.job_id)?.status === 'hired' && applicationsStatus.get(job.job_id)?.confirmed
                    ? 'Hired 💪🏻'
                    : applicationsStatus.get(job.job_id)?.status === 'hired'
                      ? 'Hired ✓'
                      : 'Applied ✓')
              : 'Apply Now'}
          </button>

          {/* Hide phone reveal button for declined applications */}
          {!(user && applicationsStatus.get(job.job_id)?.status === 'declined') && (
            <button
              onClick={() => onRevealPhone(job.job_id)}
              className={`px-6 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 active:scale-98 shadow-sm ${
                revealedPhones.has(job.job_id) || (user && appliedJobs.has(job.job_id))
                  ? 'border-green-500 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300 cursor-not-allowed opacity-90'
                  : 'border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200'
              }`}
              disabled={revealedPhones.has(job.job_id) || (!!user && appliedJobs.has(job.job_id))}
            >
              {revealedPhones.has(job.job_id) || (user && appliedJobs.has(job.job_id))
                ? `📞 ${job.contact_phone}`
                : '📞 Reveal Phone (£1)'
              }
            </button>
          )}
        </div>
      </div>
    </div>
  );
};




// --- Main BrowseJobsPage Component ---
export default function BrowseJobsPage() {
  const router = useRouter()
  const { user, isLoading: isAuthLoading, logout } = useAuth();
  
  // No longer forcing dark mode - let theme toggle handle it

  const [jobs, setJobs] = useState<Job[]>([]);
  const [jobsLoading, setJobsLoading] = useState(true);
  const [jobsError, setJobsError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState("")
  const [locationFilter, setLocationFilter] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("")
  const [hoursTypeFilter, setHoursTypeFilter] = useState("")
  const [dateFilter, setDateFilter] = useState("")
  // New state for applied jobs filter
  const [appliedFilter, setAppliedFilter] = useState<"all" | "applied" | "not-applied">("all");
  
  const [selectedJobForModal, setSelectedJobForModal] = useState<Job | null>(null);
  const [showJobDetailsModal, setShowJobDetailsModal] = useState(false);

  // Application message modal states
  const [showApplicationMessageModal, setShowApplicationMessageModal] = useState(false);
  const [selectedJobForApplication, setSelectedJobForApplication] = useState<Job | null>(null);
  const [applicationMessage, setApplicationMessage] = useState('');

  // Check if we should show the application message modal
  const shouldShowModal = useSearchParams()?.get('applicationMessage') === 'true';
  const jobIdFromUrl = useSearchParams()?.get('jobId');




  const [currentPage, setCurrentPage] = useState(1)
  
  // Using sessionStorage for state persistence across soft navigations (like redirect to /pay and back)
  const [revealedPhones, setRevealedPhones] = useState<Set<number>>(() => {
    if (typeof sessionStorage !== 'undefined') {
      const savedRevealed = sessionStorage.getItem('revealedPhones');
      return savedRevealed ? new Set(JSON.parse(savedRevealed)) : new Set();
    }
    return new Set();
  });

  const [appliedJobs, setAppliedJobs] = useState<Set<number>>(() => {
    if (typeof sessionStorage !== 'undefined') {
      const savedApplied = sessionStorage.getItem('appliedJobs');
      return savedApplied ? new Set(JSON.parse(savedApplied)) : new Set();
    }
    return new Set();
  });

  const [applicationsStatus, setApplicationsStatus] = useState<Map<number, {status: string, applicationStatus: string, confirmed: boolean}>>(new Map());

  // Effect to save to sessionStorage whenever the sets change
  useEffect(() => {
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.setItem('revealedPhones', JSON.stringify(Array.from(revealedPhones)));
    }
  }, [revealedPhones]);

  useEffect(() => {
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.setItem('appliedJobs', JSON.stringify(Array.from(appliedJobs)));
    }
  }, [appliedJobs]);


  const [isMobile, setIsMobile] = useState<boolean>(() => 
    typeof window !== 'undefined' ? window.innerWidth < 768 : false
  ); 

  useEffect(() => {
    const checkMobile = () => window.innerWidth < 768;
    setIsMobile(checkMobile());

    const handleResize = () => {
      setIsMobile(checkMobile());
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);

  }, []);

 

  // Handle URL parameters for filters (when coming from home page categories and search)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const categoryFromUrl = urlParams.get('category');
    const queryFromUrl = urlParams.get('query');
    
    if (categoryFromUrl) {
      // Decode the URL parameter to handle spaces and special characters
      const decodedCategory = decodeURIComponent(categoryFromUrl);
      setCategoryFilter(decodedCategory);
    }
    
    if (queryFromUrl) {
      // Decode the URL parameter to handle spaces and special characters
      const decodedQuery = decodeURIComponent(queryFromUrl);
      setSearchTerm(decodedQuery);
    }
  }, []);

  // Handle URL parameters for applied jobs (when returning from payment)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const appliedJobId = urlParams.get('applied');
    
    if (appliedJobId) {
      const jobId = parseInt(appliedJobId);
      if (!isNaN(jobId)) {
        // Add the job to applied jobs set
        setAppliedJobs(prev => {
          const newSet = new Set(prev);
          newSet.add(jobId);
          return newSet;
        });
        
        // Clean up the URL parameter
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.delete('applied');
        window.history.replaceState({}, '', newUrl.toString());
      }
    }
  }, []);

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

        const mappedJobs: Job[] = data.map(job => ({
          ...job,
          id: job.job_id,
          title: job.job_title,
          company: job.contact_name,
          location: job.job_location,
          hourlyPay: job.hourly_pay,
          hoursPerWeek: job.hours_per_week,
          description: job.job_description,
          sponsored: job.is_sponsored,
          category: job.job_category,
          hoursType: parseFloat(job.hours_per_week) > 20 ? "holiday" : "term-time",
          postedDate: formatDateAgo(job.created_at),
          applicationUrl: job.contact_email ? `mailto:${job.contact_email}` : null,
          phoneNumber: job.contact_phone,
          applicationCount: job.application_count || 0,
          employer: job.contact_name,
          // Preserve position data from backend
          positions_available: job.positions_available || 1,
          positions_filled: job.positions_filled || 0,
          positions_remaining: job.positions_remaining || Math.max(0, (job.positions_available || 1) - (job.positions_filled || 0)),
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
  }, []);

  // Fetch student's applied jobs from backend
  useEffect(() => {
    const fetchAppliedJobs = async () => {
      if (user && user.user_type === "student") {
        try {
          const response = await fetch(`/api/job/student/applications/${user.user_id}`, {
            credentials: 'include'
          });
          
          if (response.ok) {
            const applicationsData = await response.json();
            
            // Store all applications with their status for reference
            const applicationsMap = new Map();
            applicationsData.forEach((app: any) => {
              applicationsMap.set(app.job_id, {
                status: app.student_outcome || 'applied',
                applicationStatus: app.application_status,
                confirmed: app.student_outcome === 'hired' && app.application_status === 'hired'
              });
            });
            setApplicationsStatus(applicationsMap);
            
            // Only include non-declined applications in appliedJobs
            const appliedJobIds = applicationsData
              .filter((app: any) => app.student_outcome !== 'declined')
              .map((app: any) => app.job_id);
            
            // Update sessionStorage with backend data
            if (typeof sessionStorage !== 'undefined') {
              sessionStorage.setItem('appliedJobs', JSON.stringify(appliedJobIds));
            }
            
            // Update local state
            setAppliedJobs(new Set(appliedJobIds));
          }
        } catch (error) {
          console.error('Error fetching applied jobs:', error);
        }
      }
    };

    fetchAppliedJobs();
  }, [user]);

  // Handle application message modal
  useEffect(() => {
    if (shouldShowModal && jobIdFromUrl && jobs.length > 0) {
      const job = jobs.find(j => j.job_id.toString() === jobIdFromUrl);
      if (job) {
        setSelectedJobForApplication(job);
        setShowApplicationMessageModal(true);
        // Restore saved message from sessionStorage
        const savedMessage = sessionStorage.getItem('applicationMessage');
        if (savedMessage) {
          setApplicationMessage(savedMessage);
        }
      }
    }
  }, [shouldShowModal, jobIdFromUrl, jobs]);

  const filteredJobs = useMemo(() => {
    return jobs.filter(job => {
      let matchesDate = true
      if (dateFilter === 'today') {
        const date = new Date(job.created_at);
        const now = new Date();
        const diffHours = Math.abs(now.getTime() - date.getTime()) / (1000 * 60 * 60);
        matchesDate = diffHours < 24;
      } else if (dateFilter === 'week') {
        const date = new Date(job.created_at);
        const now = new Date();
        const diffDays = Math.abs(now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24);
        matchesDate = diffDays <= 7;
      } else if (dateFilter === 'month') {
        const date = new Date(job.created_at);
        const now = new Date();
        const diffDays = Math.abs(now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24);
        matchesDate = diffDays <= 30;
      }

      // Filter logic for applied jobs (includes declined status)
      let matchesApplied = true;
      if (appliedFilter === 'applied') {
        matchesApplied = appliedJobs.has(job.job_id) || applicationsStatus.get(job.job_id)?.status === 'declined';
      } else if (appliedFilter === 'not-applied') {
        matchesApplied = !appliedJobs.has(job.job_id) && applicationsStatus.get(job.job_id)?.status !== 'declined';
      }

      return (
        (searchTerm === "" || job.job_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
         job.contact_name.toLowerCase().includes(searchTerm.toLowerCase())) &&
        (locationFilter === "" || job.job_location.toLowerCase().includes(locationFilter.toLowerCase())) &&
        (categoryFilter === "" || job.job_category === categoryFilter) &&
        (hoursTypeFilter === "" || job.hoursType === hoursTypeFilter) &&
        matchesDate &&
        matchesApplied // Include applied status in filter
      )
    })
  }, [jobs, searchTerm, locationFilter, categoryFilter, hoursTypeFilter, dateFilter, appliedFilter, appliedJobs, applicationsStatus])

  const sortedJobs = useMemo(() => {
    const jobsCopy = [...filteredJobs]; 

    return jobsCopy.sort((a, b) => {
      const sponsoredA = a.is_sponsored ? 0 : 1;
      const sponsoredB = b.is_sponsored ? 0 : 1;

      if (sponsoredA !== sponsoredB) {
        return sponsoredA - sponsoredB;
      }

      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
     
      if (isNaN(dateB) && !isNaN(dateA)) return -1;
      if (isNaN(dateA) && !isNaN(dateB)) return 1;
      if (isNaN(dateA) && isNaN(dateB)) return 0;

      return dateB - dateA;
    });
  }, [filteredJobs]);

  const totalPages = Math.ceil(sortedJobs.length / JOBS_PER_PAGE)
  const startIndex = (currentPage - 1) * JOBS_PER_PAGE
  const endIndex = startIndex + JOBS_PER_PAGE
  const currentJobs = sortedJobs.slice(startIndex, endIndex)

  const handleJobDescriptionClick = (job: Job) => {
    // Show modal on both mobile and desktop
    setSelectedJobForModal(job);
    setShowJobDetailsModal(true);
  }

  const handleCloseJobDetailsModal = () => {
    setSelectedJobForModal(null);
    setShowJobDetailsModal(false);
  }

  const clearFilters = () => {
    setSearchTerm("")
    setLocationFilter("")
    setCategoryFilter("")
    setHoursTypeFilter("")
    setDateFilter("")
    setAppliedFilter("all");

    handleCloseJobDetailsModal();
  }

  const handleFilterChange = (filterSetter: (value: any) => void, value: string) => {
    filterSetter(value)
    setCurrentPage(1)
    handleCloseJobDetailsModal();
  }

  // MODIFIED: handleRevealPhone to update local state AND sessionStorage
  const handleRevealPhone = (jobId: number) => {
    if (!user) {
      router.push('/login');
      return;
    }
    // Update the local state to mark this phone number as revealed
    setRevealedPhones(prev => {
      const newState = new Set(prev).add(jobId);
      // sessionStorage will be updated via the useEffect hook
      return newState;
    }); // Fixed: Added closing curly brace
    
    router.push(`/pay?jobId=${jobId}&type=phone`); 
  }

  // MODIFIED: handleApply to update local state AND sessionStorage
  const handleApply = async (job: Job) => {
    if (!user) {
      router.push('/login');
      return;
    }

    // Check if user is an employer - they shouldn't be able to apply for jobs
    if (user.user_type === 'employer') {
      alert('This feature is only available for students. Employers can post jobs instead.');
      router.push('/post-job');
      return;
    }

    // Show application message modal on the same page without scrolling
    setSelectedJobForApplication(job);
    setShowApplicationMessageModal(true);
    // Update URL to show modal state without causing scroll
    const currentUrl = new URL(window.location.href);
    currentUrl.searchParams.set('applicationMessage', 'true');
    currentUrl.searchParams.set('jobId', job.job_id.toString());
    window.history.replaceState({}, '', currentUrl.toString());
  };

  const handleApplicationMessageSubmit = async () => {
    if (!selectedJobForApplication || !applicationMessage.trim()) {
      alert('Please enter an application message');
      return;
    }

    // Store the message in sessionStorage
    sessionStorage.setItem('applicationMessage', applicationMessage);
    
    // Close modal and redirect to payment
    setShowApplicationMessageModal(false);
    setApplicationMessage('');
    setSelectedJobForApplication(null);
    
    // Redirect to payment page
    router.push(`/pay?type=apply&jobId=${selectedJobForApplication.job_id}`);
  };

  const handleApplicationMessageChange = (message: string) => {
    setApplicationMessage(message);
    // Save to sessionStorage as user types
    sessionStorage.setItem('applicationMessage', message);
  };

  const handleCloseApplicationMessageModal = () => {
    setShowApplicationMessageModal(false);
    setApplicationMessage('');
    setSelectedJobForApplication(null);
    // Clear the saved message when closing
    sessionStorage.removeItem('applicationMessage');
    // Remove modal parameters from URL without causing scroll
    const currentUrl = new URL(window.location.href);
    currentUrl.searchParams.delete('applicationMessage');
    currentUrl.searchParams.delete('jobId');
    window.history.replaceState({}, '', currentUrl.toString());
  };


  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll to top on page change
  };


  const pricingHref = user?.user_type === "student" ? "/pricing#student" : "/pricing#employer";

  return (
    // IMPORTANT: Wrap your main content and apply padding-top
    // to account for the fixed header's height.
    // Assuming your header's height is around 80px based on common designs.
    // Changed bg-gray-950 to bg-[rgb(7,8,21)] for the main page background.
    <div className="pt-[80px] min-h-screen bg-background text-foreground font-sans antialiased overflow-x-hidden relative">
      <Header
        user={user}
        logout={logout}
        isLoading={isAuthLoading}
        pricingHref={pricingHref}
        currentPage="browse-jobs"
        // Apply the same explicit styling as app/page.tsx Header
        className="fixed top-0 left-0 right-0 z-[9999] bg-background border-b border-border"
        // The isDarkMode prop is not needed for the Header's background anymore based on its internal styling
      />

      {/* Your existing page content will go here within this div.
          For example, the browse-jobs content: */}
      <div className="container mx-auto px-4 py-8">
        <div className="mb-12 text-center pt-4">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 dark:text-white mb-4 leading-tight tracking-tight">
            Your Next <span className="text-blue-600 dark:text-blue-400">Part-Time Opportunity</span> Awaits!
          </h1>
        </div>

        {/* Filter Section */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl border border-zinc-200 dark:border-gray-700 mb-10 transition-all duration-300">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Refine Your Job Search</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
            <div className="flex flex-col">
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Search Jobs
              </label>
              <input
                id="search"
                type="text"
                placeholder="e.g., barista, retail assistant..."
                value={searchTerm}
                onChange={(e) => handleFilterChange(setSearchTerm, e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200"
              />
            </div>
            <div className="flex flex-col">
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Location
              </label>
              <input
                id="location"
                type="text"
                placeholder="e.g., London, Manchester..."
                value={locationFilter}
                onChange={(e) => handleFilterChange(setLocationFilter, e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200"
              />
            </div>
            <div className="flex flex-col">
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Category
              </label>
              <select
                id="category"
                value={categoryFilter}
                onChange={(e) => handleFilterChange(setCategoryFilter, e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white appearance-none pr-8 transition-all duration-200"
              >
                <option value="">All categories</option>
                <option value="Hospitality">Hospitality</option>
                <option value="Retail">Retail</option>
                <option value="Tutoring">Tutoring</option>
                <option value="Admin Support">Admin Support</option>
                <option value="Tech Support">Tech Support</option>
                <option value="Marketing">Marketing</option>
                <option value="Customer Service">Customer Service</option>
                <option value="Warehouse & Logistics">Warehouse & Logistics</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="flex flex-col">
              <label htmlFor="hoursType" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Work Period
              </label>
              <select
                id="hoursType"
                value={hoursTypeFilter}
                onChange={(e) => handleFilterChange(setHoursTypeFilter, e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white appearance-none pr-8 transition-all duration-200"
              >
                <option value="">All periods</option>
                <option value="term-time">Term-time (up to 20hrs)</option>
                <option value="holiday">Holidays (up to 40hrs)</option>
              </select>
            </div>
            <div className="flex flex-col">
              <label htmlFor="dateFilter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Posted Date
              </label>
              <select
                id="dateFilter"
                value={dateFilter}
                onChange={(e) => handleFilterChange(setDateFilter, e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white appearance-none pr-8 transition-all duration-200"
              >
                <option value="">All dates</option>
                <option value="today">Today</option>
                <option value="week">This week</option>
                <option value="month">This month</option>
              </select>
            </div>
            {/* New Applied Jobs Filter */}
            <div className="flex flex-col">
              <label htmlFor="appliedFilter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Application Status
              </label>
              <select
                id="appliedFilter"
                value={appliedFilter}
                onChange={(e) => handleFilterChange(setAppliedFilter, e.target.value as "all" | "applied" | "not-applied")}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white appearance-none pr-8 transition-all duration-200"
              >
                <option value="all">All Jobs</option>
                <option value="applied">Applied Jobs</option>
                <option value="not-applied">Not Applied Jobs</option>
              </select>
            </div>
            {/* End New Applied Jobs Filter */}
            {/* Clear Filters Button - Centered */}
            <div className="flex items-end justify-center col-span-full mt-4 md:mt-0">
              <button
                onClick={clearFilters}
                className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-600 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-lg transition-all duration-200 text-lg font-semibold"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6 flex items-center justify-between text-gray-700 dark:text-gray-300">
          <p className="text-lg font-medium">
            <span className="text-blue-600 dark:text-blue-400 font-bold">{sortedJobs.length}</span> job{sortedJobs.length !== 1 ? 's' : ''} found
            {totalPages > 1 && (
              <span className="text-gray-500 dark:text-gray-500 dark:text-gray-400 ml-2"> • Page {currentPage} of {totalPages}</span>
            )}
          </p>
          {totalPages > 1 && (
            <p className="text-sm text-gray-500 dark:text-gray-500 dark:text-gray-400">
              Showing {startIndex + 1}-{Math.min(endIndex, sortedJobs.length)} of {sortedJobs.length} jobs
            </p>
          )}
        </div>

        {/* Job Loading/Error States */}
        {jobsLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: JOBS_PER_PAGE }).map((_, i) => (
              <LoadingSkeleton key={i} />
            ))}
          </div>
        )}

        {jobsError && (
          <div className="text-center py-12 bg-red-50 dark:bg-red-950 rounded-2xl border border-red-300 dark:border-red-700 text-red-700 dark:text-red-400 shadow-lg">
            <p className="text-xl font-semibold mb-4">Oops! Something went wrong.</p>
            <p className="mb-6">{jobsError}</p>
            <Button onClick={() => window.location.reload()} className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition duration-200">
              Retry Loading Jobs
            </Button>
          </div>
        )}

        {/* Job Listings */}
        {!jobsLoading && !jobsError && sortedJobs.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentJobs.map((job) => (
              // START OF TOTALLY NEW JOB CARD BLOCK DESIGN
              <div key={job.job_id} className={`
                bg-white dark:bg-gray-800
                p-6 rounded-xl shadow-lg transition-all duration-300 flex flex-col justify-between
                hover:shadow-2xl hover:scale-[1.01]
                ${job.is_sponsored
                  ? 'border-4 border-blue-400 bg-gradient-to-br from-blue-50 to-white dark:from-blue-900 dark:to-gray-850 transform -translate-y-1' // More prominent sponsored style
                  : 'border border-zinc-200 dark:border-gray-700'
                }
              `}>
                {/* Job Info Header - Flex container for Title, Company/Location & Price */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-grow pr-4">
                    {/* Job Title */}
                    <h3 className="text-xl md:text-2xl font-extrabold text-gray-900 dark:text-white leading-tight mb-1 break-words">
                      {job.job_title}
                    </h3>
                    {/* Employer Name & Location */}
                    <p className="text-sm text-gray-600 dark:text-gray-300 flex flex-col overflow-hidden">
                      <span className="flex items-center gap-1 overflow-hidden whitespace-nowrap mb-1">
                        <Building2Icon className="h-3.5 w-3.5 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                        <span className="flex-grow truncate">{job.contact_name}</span>
                      </span>
                      <span className="flex items-center gap-1 overflow-hidden whitespace-nowrap">
                        <GlobeIcon className="h-3.5 w-3.5 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                        <span className="flex-shrink-0 truncate">{job.job_location}</span>
                      </span>
                    </p>
                  </div>
                  {/* Hourly Pay / Hours Per Week */}
                  <div className="text-right flex-shrink-0 mt-1">
                    <div className="text-xl font-bold text-green-600 dark:text-green-400 leading-tight">
                      £{job.hourly_pay}<span className="text-base font-medium">/hr</span>
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 flex items-center gap-1">
                      <ClockIcon className="h-3 w-3" />
                      {job.hours_per_week} hrs/wk
                    </div>
                  </div>
                </div>

                {/* Tags & Meta Info Section */}
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  {/* Work Period Tag */}
                  <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                    job.hoursType === 'holiday'
                      ? 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200'
                  }`}>
                    {job.hoursType === 'holiday' ? 'Holiday' : 'Term-Time'}
                  </span>
                  {/* Category Tag */}
                  <span className="px-2 py-0.5 text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full font-medium">
                    {job.job_category}
                  </span>
                  {/* Posted Date */}
                  <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400 flex-shrink-0">
                      <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25ZM12.75 6a.75.75 0 0 0-1.5 0v6a.75.75 0 0 0 .174.45l3.5 4.499a.75.75 0 0 0 1.14-.948L13.5 12.579V6Z" clipRule="evenodd" />
                    </svg>
                    {job.postedDate}
                  </span>
                  {/* Application Count Badge */}
                  <span className="inline-flex items-center px-2 py-0.5 bg-gray-200 dark:bg-gray-700 rounded-full text-xs text-gray-700 dark:text-gray-300 font-medium">
                    {job.applicationCount} applications
                  </span>
                  {/* Positions Available Badge */}
                  <span className="inline-flex items-center px-2 py-0.5 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg text-xs text-yellow-800 dark:text-yellow-400 font-semibold border border-yellow-300 dark:border-yellow-500/20">
                    {Math.max(0, (job.positions_available || 1) - (job.positions_filled || 0))} open
                  </span>
                   {/* Sponsored Badge (internal, if desired) */}
                  {job.is_sponsored && (
                    <span className="inline-flex items-center px-2 py-0.5 text-xs font-semibold bg-blue-600 text-white rounded-full gap-1">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
                        <path fillRule="evenodd" d="M10 1c4.97 0 9 4.03 9 9s-4.03 9-9 9-9-4.03-9-9 4.03-9 9-9ZM9.375 6a.75.75 0 0 0-1.5 0v4.25c0 .414.336.75.75.75h4.25a.75.75 0 0 0 0-1.5h-3.5V6Z" clipRule="evenodd" />
                      </svg>
                      SPONSORED
                    </span>
                  )}
                </div>



                {/* Action Buttons - aligned to bottom, full width container */}
                <div className="mt-auto pt-4 border-t border-gray-200 dark:border-gray-700 flex flex-wrap gap-3 items-center justify-center sm:justify-start">
                  <button
                    onClick={() => handleJobDescriptionClick(job)}
                    className="px-5 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700 dark:text-gray-200 transition-all duration-200 active:scale-98 shadow-sm"
                  >
                    View Description
                  </button>

                  <button
                    onClick={() => handleApply(job)}
                    className={`px-6 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 active:scale-98 shadow-md ${
                      user && applicationsStatus.get(job.job_id)?.status === 'declined'
                        ? 'bg-red-700 text-white hover:bg-red-800 cursor-not-allowed opacity-90'
                        : user && applicationsStatus.get(job.job_id)?.status === 'hired'
                        ? 'bg-purple-600 text-white hover:bg-purple-700 cursor-not-allowed opacity-90'
                        : user && appliedJobs.has(job.job_id)
                        ? 'bg-green-700 text-white hover:bg-green-800 cursor-not-allowed opacity-90'
                        : 'bg-blue-600 text-white hover:bg-blue-600 hover:scale-105'
                    }`}
                    disabled={!!user && (appliedJobs.has(job.job_id) || applicationsStatus.get(job.job_id)?.status === 'declined' || applicationsStatus.get(job.job_id)?.status === 'hired')}
                  >
                    {user && (appliedJobs.has(job.job_id) || applicationsStatus.get(job.job_id)?.status === 'declined' || applicationsStatus.get(job.job_id)?.status === 'hired') 
                      ? (applicationsStatus.get(job.job_id)?.status === 'declined' 
                          ? 'Declined ✗' 
                          : applicationsStatus.get(job.job_id)?.status === 'hired' && applicationsStatus.get(job.job_id)?.confirmed
                            ? 'Hired 💪🏻'
                            : applicationsStatus.get(job.job_id)?.status === 'hired'
                              ? 'Hired ✓'
                              : 'Applied ✓')
                      : 'Apply Now'}
                  </button>

                  {/* Hide phone reveal button for declined applications */}
                  {!(user && applicationsStatus.get(job.job_id)?.status === 'declined') && (
                    <button
                      onClick={() => handleRevealPhone(job.job_id)}
                      className={`px-5 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 active:scale-98 shadow-sm ${
                        revealedPhones.has(job.job_id) || (user && appliedJobs.has(job.job_id))
                          ? 'border-green-500 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300 cursor-not-allowed opacity-90'
                          : 'border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200'
                      }`}
                      disabled={revealedPhones.has(job.job_id) || (!!user && appliedJobs.has(job.job_id))}
                    >
                      {revealedPhones.has(job.job_id) || (user && appliedJobs.has(job.job_id))
                        ? `📞 ${job.contact_phone}`
                        : '📞 Reveal Phone (£1)'
                      }
                    </button>
                  )}
                </div>
              </div>
              // END OF TOTALLY NEW JOB CARD BLOCK DESIGN
            ))}
          </div>
        )}

        {/* No Results (only show if not loading, no error, and filteredJobs is empty) */}
        {!jobsLoading && !jobsError && sortedJobs.length === 0 && (
          <div className="text-center py-7 bg-white dark:bg-gray-800 rounded-2xl border border-zinc-200 dark:border-gray-700 shadow-lg">
            <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">No jobs found matching your criteria!</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Try broadening your search or check back later as new opportunities are posted frequently.
            </p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && !jobsLoading && !jobsError && (
          <div className="mt-12 flex items-center justify-center">
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-gray-200 transition-all duration-200 active:scale-98 shadow-sm"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                  <path fillRule="evenodd" d="M11.72 9.47a.75.75 0 0 1 0 1.06L7.47 15.72a.75.75 0 0 1-1.06 0L2.22 11.47a.75.75 0 0 1 0-1.06l4.25-4.25a.75.75 0 0 1 1.06 0l4.25 4.25Z" clipRule="evenodd" />
                  <path fillRule="evenodd" d="M16.72 9.47a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0l-4.25-4.25a.75.75 0 0 1 0-1.06l4.25-4.25a.75.75 0 0 1 1.06 0l4.25 4.25Z" clipRule="evenodd" />
                </svg>
                <span className="sr-only">Previous Page</span>
              </button>

              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                  const showPage = page === 1 ||
                                   page === totalPages ||
                                   (page >= currentPage - 2 && page <= currentPage + 2)

                  if (!showPage) {
                    if (page === currentPage - 3 || page === currentPage + 3) {
                      return <span key={page} className="px-2 py-2 text-gray-500 dark:text-gray-400">...</span>
                    }
                    return null
                  }

                  return (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`px-4 py-2 border rounded-lg transition-all duration-200 active:scale-98 shadow-sm ${
                        currentPage === page
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200'
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
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-gray-200 transition-all duration-200 active:scale-98 shadow-sm"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                  <path fillRule="evenodd" d="M8.28 9.47a.75.75 0 0 1 0 1.06l4.25 4.25a.75.75 0 0 1-1.06 0L7.22 10.53a.75.75 0 0 1 0-1.06l4.25-4.25a.75.75 0 0 1 1.06 0l-4.25 4.25Z" clipRule="evenodd" />
                  <path fillRule="evenodd" d="M3.28 9.47a.75.75 0 0 1 0 1.06l4.25 4.25a.75.75 0 0 1-1.06 0L2.22 10.53a.75.75 0 0 1 0-1.06l4.25-4.25a.75.75 0 0 1 1.06 0l-4.25 4.25Z" clipRule="evenodd" />
                </svg>
                <span className="sr-only">Next Page</span>
              </button>
            </div>
          </div>
        )}

        {/* Important Work Hour Limits Block - Moved Here and re-centered */}
        <div className="mt-12 p-6 bg-blue-50 dark:bg-blue-950 border border-blue-300 dark:border-blue-700 rounded-2xl shadow-xl max-w-2xl w-full mx-auto text-center transform transition-transform duration-300 hover:scale-[1.01] hover:shadow-2xl">
          <h3 className="font-bold text-blue-700 dark:text-blue-200 mb-3 flex items-center justify-center gap-3 text-lg">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-blue-600 dark:text-blue-400">
              <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25ZM12.75 6a.75.75 0 0 0-1.5 0v6a.75.75 0 0 0 .174.45l3.5 4.499a.75.75 0 0 0 1.14-.948L13.5 12.579V6Z" clipRule="evenodd" />
            </svg>
            Important: Understand Student Work Hour Limits
          </h3>
          <div className="text-base text-blue-700 dark:text-blue-300 space-y-2 text-left">
            <p><strong>During term-time:</strong> Up to <span className="font-semibold text-blue-800 dark:text-blue-100">20 hours</span> per week while studying.</p>
            <p><strong>During holidays/semester breaks:</strong> Up to <span className="font-semibold text-blue-800 dark:text-blue-100">40 hours</span> per week (full-time).</p>
          </div>
        </div>
      </div>

      {/* Add breathing space before footer */}
      <div className="pb-16"></div>

      {/* The JobDetailsModal is rendered for both mobile and desktop */}
      {showJobDetailsModal && (
        <JobDetailsModal
          job={selectedJobForModal}
          onClose={handleCloseJobDetailsModal}
          onApply={handleApply}
          onRevealPhone={handleRevealPhone}
          revealedPhones={revealedPhones}
          appliedJobs={appliedJobs}
          user={user}
          isMobile={isMobile}
          applicationsStatus={applicationsStatus}
        />
      )}

      {/* Application Message Modal */}
      {showApplicationMessageModal && selectedJobForApplication && (
        <ApplicationMessageModal
          job={selectedJobForApplication}
          message={applicationMessage}
          onMessageChange={handleApplicationMessageChange}
          onSubmit={handleApplicationMessageSubmit}
          onClose={handleCloseApplicationMessageModal}
          isOpen={showApplicationMessageModal}
                />
      )}

      </div>
  )
}