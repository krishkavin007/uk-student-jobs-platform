// app/my-account/page.tsx
"use client"

import { useState, useEffect, Suspense } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"

// Shadcn UI components (assuming they are set up with a modern theme)
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Logo } from "@/components/ui/logo" // Assuming this is a custom logo component
import { ContactModal } from "@/components/ui/contact-modal" // Assuming this is a custom contact modal

import { useAuth } from "@/app/context/AuthContext";

// User, Transaction, AppliedJob, Applicant, PostedJob interfaces remain the same.
interface User {
  user_id: string;
  user_username: string;
  user_email: string;
  google_id?: string;
  user_type: "employer" | "student";
  organisation_name?: string;
  contact_phone_number?: string;
  user_first_name?: string;
  user_last_name?: string;
  university_college?: string;
  created_at: string;
  user_image?: string;
  user_city?: string;
}

interface Transaction {
  id: number;
  date: string;
  type: string;
  description: string;
  amount: number;
  status: string;
  invoiceNumber: string;
}

interface AppliedJob {
  id: number;
  title: string;
  company: string;
  appliedDate: string;
  status: string;
  studentOutcome: string;
  employerPhone: string;
  employerEmail: string;
  isContactInfoRevealed: boolean;
  jobId: number;
  confirmed?: boolean; // Whether employer has confirmed the hire
}

interface Applicant {
  id: number;
  name: string;
  email: string;
  university: string;
  appliedDate: string;
  status: "pending" | "applied" | "hired" | "rejected" | "cancelled";
  message: string;
  phone: string;
  studentOutcome?: string; // Add this for hire confirmation check
  confirmed?: boolean; // Add this to track if employer has confirmed the hire
  image?: string; // Add this for user profile image
}

interface PostedJob {
  id: number;
  title: string;
  description: string; // Added description field
  postedDate: string;
  expiryDate: string;
  applications: number;
  sponsored: boolean;
  status: string;
  applicants: Applicant[];
}


function MyAccountContent() {
  const { user, isLoading, refreshUser, logout } = useAuth();

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [activeView, setActiveView] = useState<"overview" | "profile" | "activity" | "credits" | "billing" | "settings">("overview"); // Changed from activeTab to activeView

  // Profile fields state
  const [editedFirstName, setEditedFirstName] = useState<string>('');
  const [editedLastName, setEditedLastName] = useState<string>('');
  const [editedContactPhoneNumber, setEditedContactPhoneNumber] = useState<string>('');
  const [editedUniversityCollege, setEditedUniversityCollege] = useState<string>('');
  const [editedOrganisationName, setEditedOrganisationName] = useState<string>('');
  const [editedEmail, setEditedEmail] = useState<string>('');
  const [editedUserCity, setEditedUserCity] = useState<string>('');

  // Credits & Billing
  const [userCredits, setUserCredits] = useState<number>(0);
  const [creditHistory, setCreditHistory] = useState<Transaction[]>([
    { id: 101, date: '2025-07-19', type: 'Pro Pack Purchase', description: 'Student Pro Pack (8 Reveals)', amount: 5.00, status: 'Completed', invoiceNumber: 'INV001' },
    { id: 102, date: '2025-07-20', type: 'Credit Top-up', description: 'Manual Top-up', amount: 10.00, status: 'Pending', invoiceNumber: 'INV002' },
  ]);
  const [employerBillingHistory, setEmployerBillingHistory] = useState<Transaction[]>([
    { id: 201, date: '2025-06-01', type: 'Job Post', description: 'Basic Job Post', amount: 1.00, status: 'Completed', invoiceNumber: 'INVEMP001' },
    { id: 202, date: '2025-06-15', type: 'Job Upgrade', description: 'Sponsored Upgrade for "Retail Assistant"', amount: 4.00, status: 'Completed', invoiceNumber: 'INVEMP002' },
    { id: 203, date: '2025-07-01', type: 'Job Post', description: 'Basic Job Post', amount: 1.00, status: 'Pending', invoiceNumber: 'INVEMP003' },
  ]);

  const [appliedJobs, setAppliedJobs] = useState<AppliedJob[]>([]);
  const [postedJobs, setPostedJobs] = useState<PostedJob[]>([]);
  const [editingJobId, setEditingJobId] = useState<number | null>(null);
  const [editJobData, setEditJobData] = useState({
    title: "",
    description: "", // Added description field
    applications: 0,
    sponsored: false
  });
  const [isProcessingUpgrade, setIsProcessingUpgrade] = useState(false);
  const [removingJobId, setRemovingJobId] = useState<number | null>(null);
  const [isLoadingPostedJobs, setIsLoadingPostedJobs] = useState(false);
  const [isLoadingAppliedJobs, setIsLoadingAppliedJobs] = useState(false);
  const [selectedJobForModal, setSelectedJobForModal] = useState<any>(null);
  const [isJobModalOpen, setIsJobModalOpen] = useState(false);
  const [selectedJobForApplicants, setSelectedJobForApplicants] = useState<PostedJob | null>(null);
  const [isApplicantsModalOpen, setIsApplicantsModalOpen] = useState(false);
  
  // Applicants modal filters
  const [applicantSearchTerm, setApplicantSearchTerm] = useState('');
  const [showLast24Hours, setShowLast24Hours] = useState(false);

  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [showDataDialog, setShowDataDialog] = useState(false);

  // Employer confirmation modal state
  const [showEmployerConfirmation, setShowEmployerConfirmation] = useState(false);
  const [pendingHiredApplication, setPendingHiredApplication] = useState<any>(null);

  // Application filtering state - SEPARATE FOR STUDENT AND EMPLOYER
  // Student section filters
  const [studentSearchTerm, setStudentSearchTerm] = useState('');
  const [studentStatusFilter, setStudentStatusFilter] = useState('');
  const [studentTimeFilter, setStudentTimeFilter] = useState('');
  
  // Employer section filters
  const [employerSearchTerm, setEmployerSearchTerm] = useState('');
  const [employerStatusFilter, setEmployerStatusFilter] = useState('');
  const [employerTimeFilter, setEmployerTimeFilter] = useState('');

  // Prevent background scrolling when any modal is open
  useEffect(() => {
    if (isJobModalOpen || editingJobId !== null || isApplicantsModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isJobModalOpen, editingJobId, isApplicantsModalOpen]);

  // UPDATED: Phone number validation regex for common UK formats.
  const UK_PHONE_REGEX = /^(?:\+44\s?7|0044\s?7|44\s?7|07|7)\d{3}[\s-]?\d{3}[\s-]?\d{3}$/;

  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    console.log("🚀 Loaded user data in /my-account:", user);
    if (!isLoading && !user) {
      router.push('/login');
      return;
    }

    if (user && !isLoading) {
      setProfileImage(user.user_image || null);
      setEditedFirstName(user.user_first_name || '');
      setEditedLastName(user.user_last_name || '');
      setEditedContactPhoneNumber(user.contact_phone_number || '');
      setEditedUniversityCollege(user.university_college || '');
      setEditedOrganisationName(user.organisation_name || '');
      setEditedEmail(user.user_email || '');
      setEditedUserCity(user.user_city || '');

      const urlTab = searchParams?.get('tab');
      if (urlTab) {
        // Map old tab names to new view names
        if (urlTab === 'profile') setActiveView('profile');
        else if (urlTab === 'activity') setActiveView('activity');
        else if (urlTab === 'billing') setActiveView('billing');
        else if (urlTab === 'credits') setActiveView('credits');
        else if (urlTab === 'settings') setActiveView('settings');
        else setActiveView('overview'); // Default to overview
      }

      if (user.user_type === "student" && urlTab === 'credits' && !localStorage.getItem(`proPackPurchased_${user.user_id}`)) {
          setUserCredits(prev => prev + 8);
          localStorage.setItem(`proPackPurchased_${user.user_id}`, 'true');
      }
    }
  }, [user, isLoading, router, searchParams]);

  // Fetch posted jobs for employers
    const fetchPostedJobs = async () => {
    if (user && user.user_type === "employer") {
        setIsLoadingPostedJobs(true);
        try {
          const response = await fetch(`/api/job/user/${user.user_id}`, {
            credentials: 'include'
          });
          
          if (response.ok) {
            const jobsData = await response.json();
            
          // Transform the database jobs and fetch applications for each job
          const transformedJobs: PostedJob[] = await Promise.all(
            jobsData.map(async (job: any) => {
              // Fetch applications for this job
              let applications = [];
              let applicationCount = 0;
              
              try {
                const applicationsResponse = await fetch(`/api/job/${job.job_id}/applications`, {
                  credentials: 'include'
                });
                
                if (applicationsResponse.ok) {
                  const applicationsData = await applicationsResponse.json();
                  applicationCount = applicationsData.totalCount || applicationsData.length;
                  
                  console.log(`Job ${job.job_id}: applicationsData=`, applicationsData);
                  console.log(`Job ${job.job_id}: applicationCount=`, applicationCount);
                  
                  // Transform applications to match Applicant interface
                  applications = applicationsData.applications.map((app: any) => ({
                    id: app.application_id,
                    name: `${app.user_first_name} ${app.user_last_name}`,
                    email: app.user_email,
                    university: app.university_college || 'Not specified',
                    appliedDate: app.applied_at, // Keep ISO string for proper filtering
                                      status: app.application_status === 'applied' ? 'applied' : 
                         app.application_status === 'hired' ? 'hired' :
                         app.application_status === 'rejected' ? 'rejected' : 
                         app.application_status === 'cancelled' ? 'cancelled' :
                         app.application_status === 'pending' ? 'pending' : 'pending',
                    message: app.application_message || 'No message provided',
                    phone: app.contact_phone_number || 'Not provided',
                    image: app.user_image || null,
                    studentOutcome: app.student_outcome || 'applied', // Add this for hire confirmation check
                    confirmed: app.student_outcome === 'hired' && app.application_status === 'hired' // Only true when employer confirms (both must be 'hired')
                  }));
                }
              } catch (error) {
                console.error(`Error fetching applications for job ${job.job_id}:`, error);
              }
              
              return {
              id: job.job_id,
              title: job.job_title,
              description: job.job_description,
              postedDate: new Date(job.created_at).toLocaleDateString(),
              expiryDate: job.expires_at ? new Date(job.expires_at).toLocaleDateString() : 'No expiry',
                applications: applicationCount || 0,
              sponsored: job.is_sponsored || false,
              status: job.job_status || 'Active',
                applicants: applications
              };
            })
          );
            
            setPostedJobs(transformedJobs);
          } else {
            console.error('Failed to fetch posted jobs:', response.status);
          }
        } catch (error) {
          console.error('Error fetching posted jobs:', error);
        } finally {
          setIsLoadingPostedJobs(false);
        }
      }
    };

  // Handle refresh button click
  const handleRefreshJobs = () => {
    fetchPostedJobs();
  };

  useEffect(() => {
    fetchPostedJobs();
  }, [user]);

  // Fetch applied jobs for students
    const fetchAppliedJobs = async () => {
    if (user && user.user_type === "student") {
        setIsLoadingAppliedJobs(true);
        try {
          const response = await fetch(`/api/job/student/applications/${user.user_id}`, {
            credentials: 'include'
          });
          
          if (response.ok) {
            const applicationsData = await response.json();
            
            // Transform the database applications to match the AppliedJob interface
            const transformedApplications: AppliedJob[] = applicationsData.map((app: any) => ({
              id: app.application_id,
              title: app.job_title,
              company: app.contact_name,
              appliedDate: new Date(app.applied_at).toLocaleDateString(),
            status: app.application_status === 'pending' ? 'Applied' : 
                   app.application_status === 'applied' ? 'Applied' : 
                   app.application_status === 'hired' ? 'Hired' :
                   app.application_status === 'rejected' ? 'Declined' : 
                   app.application_status === 'cancelled' ? 'Cancelled' : 'Applied',
            studentOutcome: app.student_outcome || 'applied',
            employerPhone: (app.student_outcome === 'declined' || 
                           (app.job_status === 'expired') ||
                           (app.job_status === 'filled' && !(app.student_outcome === 'hired' && app.application_status === 'hired')) ||
                           (app.job_status === 'removed' && !(app.student_outcome === 'hired' && app.application_status === 'hired'))) 
                           ? 'No longer available' : (app.employer_phone || 'Not provided'),
            employerEmail: (app.student_outcome === 'declined' || 
                           (app.job_status === 'expired') ||
                           (app.job_status === 'filled' && !(app.student_outcome === 'hired' && app.application_status === 'hired')) ||
                           (app.job_status === 'removed' && !(app.student_outcome === 'hired' && app.application_status === 'hired'))) 
                           ? 'No longer available' : (app.employer_email || 'Not provided'),
            isContactInfoRevealed: true, // Since they applied, they have access to contact info
            jobId: app.job_id,
            confirmed: app.student_outcome === 'hired' && app.application_status === 'hired' // Only true when employer confirms (both must be 'hired')
            }));
            
            setAppliedJobs(transformedApplications);
          } else {
            console.error('Failed to fetch applied jobs:', response.status);
          }
        } catch (error) {
          console.error('Error fetching applied jobs:', error);
        } finally {
          setIsLoadingAppliedJobs(false);
        }
      }
    };

  // Initial fetch and auto-refresh for students
  useEffect(() => {
    fetchAppliedJobs();
    
    // Auto-refresh every 30 seconds for students to see status updates
    if (user && user.user_type === "student") {
      const interval = setInterval(fetchAppliedJobs, 30000); // 30 seconds
      return () => clearInterval(interval);
    }
  }, [user]);


  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;

    // Validate phone number if provided
    if (editedContactPhoneNumber && !UK_PHONE_REGEX.test(editedContactPhoneNumber)) {
      alert('Please enter a valid UK phone number. Examples: 07123456789, +447123456789, 07123 456789');
      return;
    }

    const formData = new FormData();
    if (selectedFile) {
      formData.append('userImage', selectedFile);
    }

    formData.append('user_username', user.user_username);
    formData.append('user_email', editedEmail);
    formData.append('user_first_name', editedFirstName);
    formData.append('user_last_name', editedLastName);
    formData.append('contact_phone_number', editedContactPhoneNumber);
    formData.append('user_city', editedUserCity);

    if (user.user_type === "student") {
        formData.append('university_college', editedUniversityCollege);
    } else if (user.user_type === "employer") {
        formData.append('organisation_name', editedOrganisationName);
    }

    try {
      const response = await fetch(`/api/user/${user.user_id}`, {
        method: 'PUT',
        body: formData,
        credentials: 'include'
      });

      if (response.ok) {
        await refreshUser();
        setSelectedFile(null);
        setIsEditingProfile(false);
        alert('Profile updated successfully!');
      } else {
        const errorData = await response.json();
        console.error('Failed to save profile:', response.status, errorData);
        // MODIFIED LINE: Access errorData.error.message first
        alert(`Failed to save profile: ${errorData.error?.message || errorData.message || response.statusText}`);
      }
    } catch (error) {
      console.error('Network error or unexpected issue saving profile:', error);
      alert('Network error while saving profile.');
    }
  };

  const handleResendVerification = (type: 'email' | 'phone') => {
    console.log(`Resending ${type} verification...`);
  };

  const handleDeleteAccount = async () => {
    if (!user) return;
    
    try {
      const response = await fetch('/api/user/delete-account', {
        method: 'DELETE',
        credentials: 'include'
      });

      if (response.ok) {
        alert('Your account has been permanently deleted. Thank you for using StudentJobs UK.');
    logout();
        router.push('/');
      } else {
        const errorData = await response.json();
        console.error('Failed to delete account:', response.status, errorData);
        alert(`Failed to delete account: ${errorData.error?.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Network error while deleting account:', error);
      alert('Network error while deleting account. Please try again.');
    }
  };

  const downloadReceipt = (transaction: Transaction) => {
    const receiptContent = `
STUDENTJOBS UK - RECEIPT
========================

Invoice Number: ${transaction.invoiceNumber}
Date: ${transaction.date}
Transaction Type: ${transaction.type}
Description: ${transaction.description}
Amount: £${transaction.amount.toFixed(2)}
Status: ${transaction.status}

User Email: ${user?.user_email || 'N/A'}

Thank you for using StudentJobs UK!
    `.trim()

    const blob = new Blob([receiptContent], { type: 'text/plain' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `StudentJobs-${transaction.invoiceNumber}.txt`
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
  };

  const downloadMyData = () => {
    const userData = {
      profile: user,
      exportDate: new Date().toISOString(),
    };

    const dataContent = JSON.stringify(userData, null, 2);
    const blob = new Blob([dataContent], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `StudentJobs-MyData-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
  };

  const handleRemoveJob = async (jobId: number, reason: "filled" | "removed") => {
    setRemovingJobId(jobId);

    try {
    if (reason === "filled") {
        // Call the new API endpoint to mark job as filled
        const response = await fetch(`/api/job/${jobId}/fill`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });

        if (response.ok) {
          // Update local state for employer
      setPostedJobs(prevJobs => prevJobs.map(job =>
            job.id === jobId ? { ...job, status: "filled" } : job
          ));
          
          // Update student applications to declined status
          setAppliedJobs(prevJobs => prevJobs.map(job =>
            job.jobId === jobId ? { 
              ...job, 
                                  studentOutcome: 'declined',
              status: 'Declined',
              employerPhone: 'No longer available',
              employerEmail: 'No longer available'
            } : job
          ));
          
          alert('Job marked as filled and moved to post history. Congratulations on finding your employee!');
    } else {
          const errorData = await response.json();
          alert(`Failed to mark job as filled: ${errorData.message || 'Unknown error'}`);
        }
      } else {
        // Handle job removal - move to post history instead of deleting
        const response = await fetch(`/api/job/${jobId}/remove`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });

        if (response.ok) {
          // Update local state for employer
          setPostedJobs(prevJobs => prevJobs.map(job =>
            job.id === jobId ? { ...job, status: "removed" } : job
          ));
          
          // Update student applications to declined status
          setAppliedJobs(prevJobs => prevJobs.map(job =>
            job.jobId === jobId ? { 
              ...job, 
                                  studentOutcome: 'declined',
              status: 'Declined',
              employerPhone: 'No longer available',
              employerEmail: 'No longer available'
            } : job
          ));
          
          alert('Job moved to post history successfully.');
        } else {
          const errorData = await response.json();
          alert(`Failed to remove job: ${errorData.message || 'Unknown error'}`);
        }
      }
    } catch (error) {
      console.error('Error handling job action:', error);
      alert('Failed to process job action. Please try again.');
    }

    setRemovingJobId(null);
  };

  const handleReactivateJob = async (jobId: number) => {
    setRemovingJobId(jobId);

    try {
      const response = await fetch(`/api/job/${jobId}/reactivate`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (response.status === 410) {
        // Job is expired - open in edit mode
        const errorData = await response.json();
        const job = postedJobs.find(j => j.id === jobId);
        if (job) {
          setEditingJobId(jobId);
          setEditJobData({
            title: job.title,
            description: job.description,
            applications: job.applications,
            sponsored: false // Don't pre-check sponsored for expired job reactivation
          });
          alert('This job has expired. Please update the details and save to reactivate it.');
        }
      } else if (response.ok) {
        setPostedJobs(prevJobs => prevJobs.map(job =>
          job.id === jobId ? { ...job, status: "active" } : job
        ));
        alert('Job reactivated successfully! It will now be visible to students again.');
      } else {
        const errorData = await response.json();
        alert(`Failed to reactivate job: ${errorData.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error reactivating job:', error);
      alert('Failed to reactivate job. Please try again.');
    }

    setRemovingJobId(null);
  };

  const handleEditJob = (job: PostedJob) => {
    setEditingJobId(job.id);
    setEditJobData({
      title: job.title,
      description: job.description,
      applications: job.applications,
      sponsored: job.sponsored
    });
  };

  const handleSaveJobChanges = async () => {
    if (!editingJobId) return;

    const currentJob = postedJobs.find(j => j.id === editingJobId);
    const needsPayment = currentJob && !currentJob.sponsored && editJobData.sponsored;
    const isExpiredJob = currentJob && (currentJob.status === "filled" || currentJob.status === "removed" || currentJob.status === "expired");

    try {
      // Send update to backend
      const response = await fetch(`/api/job/${editingJobId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          job_title: editJobData.title,
          job_description: editJobData.description,
          is_sponsored: editJobData.sponsored
        })
      });

      if (response.ok) {
        if (needsPayment || isExpiredJob) {
          // Redirect to payment page for expired job reactivation or sponsorship upgrade
          const paymentType = isExpiredJob ? 'reactivate' : 'upgrade';
          const sponsoredParam = editJobData.sponsored ? '&sponsored=true' : '';
          window.location.href = `/pay?jobId=${editingJobId}&type=${paymentType}${sponsoredParam}`;
          return;
        } else {
          alert('Job updated successfully!');
        }

        // Update local state
        setPostedJobs(prevJobs =>
          prevJobs.map(job =>
            job.id === editingJobId ? { 
              ...job, 
              title: editJobData.title, 
              description: editJobData.description, 
              sponsored: editJobData.sponsored,
              status: isExpiredJob ? "active" : job.status
            } : job
          )
        );
      } else {
        alert('Failed to update job. Please try again.');
      }
    } catch (error) {
      console.error('Error updating job:', error);
      alert('Failed to update job. Please try again.');
    }

    setIsProcessingUpgrade(false);
    setEditingJobId(null);
    setEditJobData({ title: "", description: "", applications: 0, sponsored: false });
  };

  const handleRevealContactInfo = (jobId: number) => {
    setAppliedJobs(prevJobs =>
      prevJobs.map(job =>
        job.id === jobId ? { ...job, isContactInfoRevealed: true } : job
      )
    );
  };

  const handleUpdateApplicationOutcome = async (applicationId: number, outcome: string) => {
    try {
      const response = await fetch(`/api/job/student/applications/${applicationId}/outcome`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ outcome }),
      });

      if (!response.ok) {
        throw new Error('Failed to update application outcome');
      }

      // Update local state
      setAppliedJobs(prev => prev.map(job => 
        job.id === applicationId 
          ? { ...job, studentOutcome: outcome }
          : job
      ));

      if (outcome === 'cancelled') {
        // For cancelled - remove from employer view but keep count
        setPostedJobs(prevJobs => 
          prevJobs.map(job => ({
            ...job,
            applicants: job.applicants.filter(applicant => applicant.id !== applicationId)
          }))
        );
      }

      console.log(`Application outcome updated to: ${outcome}`);
    } catch (error) {
      console.error('Error updating application outcome:', error);
      alert('Failed to update application outcome. Please try again.');
    }
  };

  const handleContactApplicant = async (applicationId: number) => {
    try {
      const response = await fetch(`/api/job/applications/${applicationId}/contact`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to contact applicant');
      }

      // Update local state immediately
      setPostedJobs(prevJobs => 
        prevJobs.map(job => ({
          ...job,
          applicants: job.applicants.map(applicant => 
            applicant.id === applicationId 
              ? { ...applicant, status: 'applied' }
              : applicant
          )
        }))
      );

      console.log(`Applicant ${applicationId} contacted successfully`);
      alert('Applicant contacted successfully!');
    } catch (error) {
      console.error('Error contacting applicant:', error);
      alert('Failed to contact applicant. Please try again.');
    }
  };

  const handleRejectApplicant = async (applicationId: number) => {
    try {
      const response = await fetch(`/api/job/applications/${applicationId}/reject`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to reject applicant');
      }

      // Update local state immediately
      setPostedJobs(prevJobs => 
        prevJobs.map(job => ({
          ...job,
          applicants: job.applicants.map(applicant => 
            applicant.id === applicationId 
              ? { ...applicant, status: 'rejected' }
              : applicant
          )
        }))
      );

      console.log(`Applicant ${applicationId} rejected successfully`);
      alert('Applicant rejected successfully!');
    } catch (error) {
      console.error('Error rejecting applicant:', error);
      alert('Failed to reject applicant. Please try again.');
    }
  };

  const handleViewJob = async (jobId: number, isEmployerConfirmedHired: boolean = false) => {
    try {
      // First fetch the job details to check its status
      const response = await fetch(`/api/job/${jobId}`, {
        credentials: 'include'
      });
      
      if (response.ok) {
        const jobData = await response.json();
        
        // Check if job is removed - show alert even for employer confirmed hired
        if (jobData.job_status === 'removed') {
          alert('This job is no longer available.');
          return;
        }
        
        // Check if job is expired - show alert for all
        if (jobData.job_status === 'expired') {
          alert('This job is no longer available.');
          return;
        }
        
        // For all other statuses (active, filled, etc.) show normal modal
        setSelectedJobForModal(jobData);
        setIsJobModalOpen(true);
      } else {
        console.error('Failed to fetch job details:', response.status);
      }
    } catch (error) {
      console.error('Error fetching job details:', error);
    }
  };

  const handleViewApplicants = (job: PostedJob) => {
    setSelectedJobForApplicants(job);
    setIsApplicantsModalOpen(true);
  };

  const handleEmployerConfirmHire = async (confirmed: boolean, applicantId?: number) => {
    const applicationId = applicantId || pendingHiredApplication?.id;
    if (!applicationId) return;
    
    try {
      // Use the new employer hire confirmation endpoint
      const response = await fetch(`/api/job/applications/${applicationId}/confirm-hire`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ confirmed }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to confirm hire');
      }

      const result = await response.json();

      if (confirmed) {
        // Update local state - keep as hired
        setAppliedJobs(prev => prev.map(job => 
          job.id === applicationId 
            ? { ...job, studentOutcome: 'hired' }
            : job
        ));

        // Update applicants list in the modal - change status to hired and mark as confirmed
        if (selectedJobForApplicants) {
          setSelectedJobForApplicants(prev => ({
            ...prev!,
            applicants: prev!.applicants.map(app => 
              app.id === applicationId 
                ? { ...app, status: 'hired' as const, studentOutcome: 'hired', confirmed: true }
                : app
            )
          }));
        }

        alert('Hire confirmed! The student has been marked as hired.');
        
        // Refresh the posted jobs data to reflect the confirmed hire status
        fetchPostedJobs();
      } else {
        // Update local state - set to rejected
        setAppliedJobs(prev => prev.map(job => 
          job.id === applicationId 
            ? { ...job, studentOutcome: 'declined' }
            : job
        ));

        // Update applicants list in the modal
        if (selectedJobForApplicants) {
          setSelectedJobForApplicants(prev => ({
            ...prev!,
            applicants: prev!.applicants.map(app => 
              app.id === applicationId 
                ? { ...app, status: 'rejected' as const, studentOutcome: 'declined' }
                : app
            )
          }));
        }

        alert('Hire declined. The student status has been set to rejected.');
        
        // Refresh the posted jobs data to reflect the declined hire status
        fetchPostedJobs();
      }
    } catch (error) {
      console.error('Error confirming hire:', error);
      alert(error instanceof Error ? error.message : 'Failed to confirm hire. Please try again.');
    } finally {
      setShowEmployerConfirmation(false);
      setPendingHiredApplication(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center bg-gray-950 text-gray-300">
        <svg className="animate-spin h-8 w-8 text-blue-500 mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p className="text-lg">Loading your account details...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // Filter applications based on search and filters
  const filteredApplications = appliedJobs.filter(job => {
    // Search filter
    const matchesSearch = studentSearchTerm === '' || 
      job.title.toLowerCase().includes(studentSearchTerm.toLowerCase()) ||
      job.company.toLowerCase().includes(studentSearchTerm.toLowerCase());

    // Status filter
    let matchesStatus = true;
    if (studentStatusFilter !== '') {
      if (studentStatusFilter === 'applied') {
        matchesStatus = job.studentOutcome === 'applied';
      } else if (studentStatusFilter === 'declined') {
        matchesStatus = job.studentOutcome === 'declined' || job.status === 'Declined';
      } else if (studentStatusFilter === 'cancelled') {
        matchesStatus = job.studentOutcome === 'cancelled';
      } else if (studentStatusFilter === 'hired') {
        matchesStatus = job.studentOutcome === 'hired';
      }
    }

    // Time filter - using appliedDate (which should be the applied_at date)
    let matchesTime = true;
    if (studentTimeFilter !== '') {
      try {
        // Parse the applied date - handle different formats
        let appliedDate: Date;
        
        // Log the date format for debugging
        console.log('Processing date:', job.appliedDate, 'for job:', job.title);
        
        if (job.appliedDate.includes('/')) {
          // Format: DD/MM/YYYY
          const [day, month, year] = job.appliedDate.split('/');
          appliedDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
        } else if (job.appliedDate.includes('-') && job.appliedDate.includes(':')) {
          // Format: DD-MM-YYYY HH:MM
          const [datePart] = job.appliedDate.split(' ');
          const [day, month, year] = datePart.split('-');
          appliedDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
        } else if (job.appliedDate.includes('-')) {
          // Format: YYYY-MM-DD or DD-MM-YYYY
          const parts = job.appliedDate.split('-');
          if (parts[0].length === 4) {
            // YYYY-MM-DD format
            appliedDate = new Date(job.appliedDate);
          } else {
            // DD-MM-YYYY format
            const [day, month, year] = parts;
            appliedDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
          }
        } else {
          // Try standard date parsing
          appliedDate = new Date(job.appliedDate);
        }
        
        // Check if date is valid
        if (isNaN(appliedDate.getTime())) {
          console.warn('Invalid date format:', job.appliedDate);
          matchesTime = false;
        } else {
          const now = new Date();
          const daysDiff = Math.floor((now.getTime() - appliedDate.getTime()) / (1000 * 60 * 60 * 24));
          
          console.log(`Date: ${appliedDate.toDateString()}, Days diff: ${daysDiff}, Filter: ${studentTimeFilter}`);
          
          if (studentTimeFilter === '7' && daysDiff > 7) matchesTime = false;
          else if (studentTimeFilter === '30' && daysDiff > 30) matchesTime = false;
          else if (studentTimeFilter === '90' && daysDiff > 90) matchesTime = false;
        }
      } catch (error) {
        console.error('Error parsing date:', job.appliedDate, error);
        matchesTime = false;
      }
    }

    return matchesSearch && matchesStatus && matchesTime;
  });

  // Get counts for stats
  const appliedCount = appliedJobs.filter(job => job.studentOutcome === 'applied').length;
      const hiredCount = appliedJobs.filter(job => job.studentOutcome === 'hired').length;
  const totalCount = appliedJobs.length;

  // Sort applications: applied first, then hired/cancelled, declined always at the end
  const sortedApplications = filteredApplications.sort((a, b) => {
    // First priority: declined applications always go to the end
    const aIsDeclined = a.studentOutcome === 'declined';
    const bIsDeclined = b.studentOutcome === 'declined';
    
    if (aIsDeclined && !bIsDeclined) return 1;
    if (!aIsDeclined && bIsDeclined) return -1;
    
    // Second priority: applied applications come first (among non-declined)
    const aIsApplied = a.studentOutcome === 'applied';
    const bIsApplied = b.studentOutcome === 'applied';
    
    if (aIsApplied && !bIsApplied) return -1;
    if (!aIsApplied && bIsApplied) return 1;
    
    // Third priority: sort by applied date (newest first)
    try {
      const aDate = new Date(a.appliedDate);
      const bDate = new Date(b.appliedDate);
      return bDate.getTime() - aDate.getTime(); // Newest first
    } catch (error) {
      return 0; // If date parsing fails, maintain original order
    }
  });

 const NavigationSegment = ({
  currentView,
  setView,
  userType,
}: {
  currentView: "overview" | "profile" | "activity" | "credits" | "billing" | "settings";
  setView: (view: "overview" | "profile" | "activity" | "credits" | "billing" | "settings") => void;
  userType: User["user_type"];
}) => {
  const tabBase =
    "px-4 py-2 rounded-md transition duration-200 text-gray-200 hover:bg-gray-700";

  return (
    <div className="flex flex-wrap justify-center bg-gray-800 rounded-lg p-1.5 space-x-1 mb-8 shadow-inner max-w-fit mx-auto">
      <Button
        onClick={() => setView("overview")}
        className={`${tabBase} ${
          currentView === "overview" ? "bg-gray-700 text-white" : "bg-transparent"
        }`}
      >
        Overview
      </Button>
      <Button
        onClick={() => setView("profile")}
        className={`${tabBase} ${
          currentView === "profile" ? "bg-gray-700 text-white" : "bg-transparent"
        }`}
      >
        Profile
      </Button>
      <Button
        onClick={() => setView("activity")}
        className={`${tabBase} ${
          currentView === "activity" ? "bg-gray-700 text-white" : "bg-transparent"
        }`}
      >
        {userType === "student" ? "My Applications" : "My Postings"}
      </Button>
      {userType === "student" && (
        <Button
          onClick={() => setView("credits")}
          className={`${tabBase} ${
            currentView === "credits" ? "bg-gray-700 text-white" : "bg-transparent"
          }`}
        >
          Credits
        </Button>
      )}
      <Button
        onClick={() => setView("billing")}
        className={`${tabBase} ${
          currentView === "billing" ? "bg-gray-700 text-white" : "bg-transparent"
        }`}
      >
        Billing
      </Button>
      <Button
        onClick={() => setView("settings")}
        className={`${tabBase} ${
          currentView === "settings" ? "bg-gray-700 text-white" : "bg-transparent"
        }`}
      >
        Settings
      </Button>
    </div>
  );
};


  return (
    <div className="flex min-h-screen w-full flex-col bg-gray-950 font-sans text-gray-100">
      <header className="bg-gray-900 border-b border-gray-800 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between">
          <Link href="/" className="flex items-center gap-2 mb-4 sm:mb-0">
            <Logo className="h-8 w-auto text-white" />
            <span className="sr-only">StudentJobs UK</span>
          </Link>
          <nav className="flex flex-wrap justify-center items-center gap-4 sm:gap-6">
            {user.user_type === "student" && (
              <Link href="/browse-jobs" className="text-sm font-medium text-gray-300 hover:text-blue-400 transition-colors">
                Browse Jobs
            </Link>
            )}
            {user.user_type === "employer" && (
              <Link href="/post-job" className="text-sm font-medium text-gray-300 hover:text-blue-400 transition-colors">
                Post Job
              </Link>
            )}
            <Link
              href={user.user_type === "student" ? "/pricing#student" : "/pricing#employer"}
              className="text-sm font-medium text-gray-300 hover:text-blue-400 transition-colors"
            >
              Pricing
            </Link>
            <ContactModal isLoggedIn={!!user}>
              <button className="text-sm font-medium text-gray-300 hover:text-blue-400 transition-colors">
                Contact Us
              </button>
            </ContactModal>
<Button onClick={logout} variant="outline" className="text-sm border-gray-600 text-white bg-gray-700 hover:bg-white hover:text-gray-900 transition-colors">
              Sign Out
            </Button>
          </nav>
        </div>
      </header>

      <main className="flex-1 p-6 md:p-10">
        <div className="mx-auto max-w-6xl">
                     <h1 className="text-2xl md:text-4xl font-extrabold text-white mb-8 text-center">Your Account Dashboard</h1>

          <NavigationSegment currentView={activeView} setView={setActiveView} userType={user.user_type} />

          {activeView === "overview" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="flex flex-col items-center justify-center p-6 text-center shadow-lg hover:shadow-xl transition-shadow duration-300 bg-gray-800 border-gray-700">
                <h3 className="text-2xl font-bold text-white mb-2">Welcome Back, {user.user_first_name || user.user_username}!</h3>
                <p className="text-gray-400 mb-20">You are logged in as a {user.user_type}.</p>
                <Button onClick={() => setActiveView("profile")} className="bg-blue-600 hover:bg-blue-500 text-white">
                  View Profile
                </Button>
              </Card>

              {user.user_type === "student" ? (
                <>
                  <Card className="flex flex-col items-center justify-center p-6 text-center shadow-lg hover:shadow-xl transition-shadow duration-300 bg-gray-800 border-gray-700">
                    <h3 className="text-2xl font-bold text-white mb-2">Your Applications</h3>
                                            <p className="text-5xl font-extrabold text-purple-500 mb-4">{appliedJobs.filter(job => job.studentOutcome === 'pending').length}</p>
                    <p className="text-gray-400 mb-4">Active applications.</p>
                    <Button onClick={() => setActiveView("activity")} className="bg-purple-600 hover:bg-purple-500 text-white">
                      View Applications
                    </Button>
                  </Card>
                  <Card className="flex flex-col items-center justify-center p-6 text-center shadow-lg hover:shadow-xl transition-shadow duration-300 bg-gray-800 border-gray-700">
                    <h3 className="text-2xl font-bold text-white mb-2">Available Credits</h3>
<Badge className="text-5xl py-3 px-6 text-white font-extrabold mb-4 animate-pulse bg-transparent border-none shadow-none hover:bg-transparent hover:border-none hover:shadow-none hover:text-white">
                      {userCredits}
                    </Badge>
                    <p className="text-gray-400 mb-4">For revealing employer contact details.</p>
                    <Button onClick={() => setActiveView("credits")} className="bg-green-600 hover:bg-green-500 text-white">
                      Manage Credits
                    </Button>
                  </Card>
                </>
              ) : (
                <>
                  <Card className="flex flex-col items-center justify-center p-6 text-center shadow-lg hover:shadow-xl transition-shadow duration-300 bg-gray-800 border-gray-700">
                    <h3 className="text-2xl font-bold text-white mb-2">Your Job Postings</h3>
                                            <p className="text-5xl font-extrabold text-orange-500 mb-4">{postedJobs.filter(job => job.status === "active").length}</p>
                                          <p className="text-gray-400 mb-4">Active job listings.</p>
                    <Button onClick={() => setActiveView("activity")} className="bg-orange-600 hover:bg-orange-500 text-white">
                      Manage Postings
                    </Button>
                  </Card>
                  <Card className="flex flex-col items-center justify-center p-6 text-center shadow-lg hover:shadow-xl transition-shadow duration-300 bg-gray-800 border-gray-700">
                    <h3 className="text-2xl font-bold text-white mb-2">Billing & Invoices</h3>
                    <p className="text-5xl font-extrabold text-teal-500 mb-4">{employerBillingHistory.length}</p>
                    <p className="text-gray-400 mb-4">Total transactions recorded.</p>
                    <Button onClick={() => setActiveView("billing")} className="bg-teal-600 hover:bg-teal-500 text-white">
                      View Billing
                    </Button>
                  </Card>
                </>
              )}

             <Card className="flex flex-col items-center justify-center p-6 text-center shadow-lg hover:shadow-xl transition-shadow duration-300 lg:col-span-1 bg-gray-800 border-gray-700">
  <h3 className="text-2xl font-bold text-white mb-2">Account Settings</h3>
  <p className="text-gray-400 mb-4">Update preferences, password, or delete account.</p>
  <Button onClick={() => setActiveView("settings")} className="bg-gradient-to-r from-pink-600 to-rose-500 hover:from-pink-500 hover:to-rose-400 text-white font-semibold py-2 px-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-opacity-75">
    Go to Settings
  </Button>
</Card>
            </div>
          )}

          {activeView === "profile" && (
            <Card className="shadow-lg bg-gray-800 border-gray-700">
              <CardHeader className="border-b border-gray-700 pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-3xl font-bold text-white">Your Profile</CardTitle>
                    <CardDescription className="text-gray-400">
                      Manage your personal details and contact information.
                    </CardDescription>
                  </div>
                  <Button
                    variant={isEditingProfile ? "outline" : "default"}
                    onClick={() => setIsEditingProfile(!isEditingProfile)}
className={isEditingProfile ? "border border-gray-600 bg-gray-700 text-white hover:brightness-110 transition duration-150" : "bg-blue-600 hover:bg-blue-500 text-white transition duration-150"}
                  >
                    {isEditingProfile ? "Cancel Edit" : "Edit Profile"}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-8">
                <div className="flex items-center gap-8">
                  <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-blue-400 bg-gray-700 flex items-center justify-center flex-shrink-0">
                    {(user.user_image) ? (
                       console.log("DEBUG: user.user_image value in component:", user.user_image),
                      <img
                        src={user.user_image}
                        alt="Profile Image"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-gray-500 text-5xl font-bold uppercase">
                        {user.user_first_name?.[0]}{user.user_last_name?.[0]}
                      </div>
                    )}
                  </div>
                  {isEditingProfile && (
                    <div className="">
                      <Label htmlFor="profileImage" className="block text-sm font-medium text-gray-300 mb-2">Upload New Profile Image</Label>
                      <Input
                        id="user.user_image"
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="block w-full text-sm py-2 text-gray-300 file:mr-4 file:py-0.01 file:px-6  file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-800 file:text-blue-200 hover:file:bg-blue-700 cursor-pointer bg-gray-700 border-gray-600"
                      />
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-center justify-between p-4 bg-green-900/20 border border-green-700 rounded-lg">
                    <span className="text-sm font-medium text-green-300">Email Status</span>
                    <Badge className="bg-green-900 text-green-300 px-3 py-1 rounded-full text-xs">
                      ✓ Verified
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-green-900/20 border border-green-700 rounded-lg">
                    <span className="text-sm font-medium text-green-300">Phone Status</span>
                    <Badge className="bg-green-900 text-green-300 px-3 py-1 rounded-full text-xs">
                      ✓ Verified
                    </Badge>
                  </div>
                </div>

                <Separator className="my-6 bg-gray-700" />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="firstName" className="text-sm font-medium text-gray-300">First Name</Label>
                    <Input
                      id="firstName"
                      value={isEditingProfile ? editedFirstName : user.user_first_name || ''}
                      onChange={(e) => setEditedFirstName(e.target.value)}
                      disabled={!isEditingProfile}
                      className="rounded-md border-gray-600 focus:border-blue-500 focus:ring-blue-500 bg-gray-700 text-gray-200 placeholder:text-gray-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName" className="text-sm font-medium text-gray-300">Last Name</Label>
                    <Input
                      id="lastName"
                      value={isEditingProfile ? editedLastName : user.user_last_name || ''}
                      onChange={(e) => setEditedLastName(e.target.value)}
                      disabled={!isEditingProfile}
                      className="rounded-md border-gray-600 focus:border-blue-500 focus:ring-blue-500 bg-gray-700 text-gray-200 placeholder:text-gray-500"
                    />
                  </div>
                  <div className="space-y-2 col-span-1 md:col-span-2">
                    <Label htmlFor="email" className="text-sm font-medium text-gray-300">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={isEditingProfile ? editedEmail : user.user_email || ''}
                      onChange={(e) => setEditedEmail(e.target.value)}
                      disabled={!isEditingProfile}
                      className="rounded-md border-gray-600 focus:border-blue-500 focus:ring-blue-500 bg-gray-700 text-gray-200 placeholder:text-gray-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-sm font-medium text-gray-300">Phone Number</Label>
                    <Input
                      id="phone"
                      value={isEditingProfile ? editedContactPhoneNumber : user.contact_phone_number || ''}
                      onChange={(e) => setEditedContactPhoneNumber(e.target.value)}
                      disabled={!isEditingProfile}
                      className="rounded-md border-gray-600 focus:border-blue-500 focus:ring-blue-500 bg-gray-700 text-gray-200 placeholder:text-gray-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city" className="text-sm font-medium text-gray-300">City</Label>
                    <Input
                      id="city"
                      placeholder="e.g., Manchester"
                      value={isEditingProfile ? editedUserCity : user.user_city || ''}
                      onChange={(e) => setEditedUserCity(e.target.value)}
                      disabled={!isEditingProfile}
                      className="rounded-md border-gray-600 focus:border-blue-500 focus:ring-blue-500 bg-gray-700 text-gray-200 placeholder:text-gray-500"
                    />
                  </div>

                  {user.user_type === "student" ? (
                    <div className="space-y-2 col-span-1 md:col-span-2">
                      <Label htmlFor="university" className="text-sm font-medium text-gray-300">University/College</Label>
                      <Input
                        id="university"
                        value={isEditingProfile ? editedUniversityCollege : user.university_college || ''}
                        onChange={(e) => setEditedUniversityCollege(e.target.value)}
                        disabled={!isEditingProfile}
                        className="rounded-md border-gray-600 focus:border-blue-500 focus:ring-blue-500 bg-gray-700 text-gray-200 placeholder:text-gray-500"
                      />
                    </div>
                  ) : (
                    <div className="space-y-2 col-span-1 md:col-span-2">
                      <Label htmlFor="businessName" className="text-sm font-medium text-gray-300">Business Name</Label>
                      <Input
                        id="businessName"
                        value={isEditingProfile ? editedOrganisationName : user.organisation_name || ''}
                        onChange={(e) => setEditedOrganisationName(e.target.value)}
                        disabled={!isEditingProfile}
                        className="rounded-md border-gray-600 focus:border-blue-500 focus:ring-blue-500 bg-gray-700 text-gray-200 placeholder:text-gray-500"
                      />
                    </div>
                  )}
                </div>

                {isEditingProfile && (
                  <div className="flex justify-end gap-3 mt-8">
                    <Button onClick={handleSaveProfile} className="bg-blue-600 hover:bg-blue-500 px-6 py-2 rounded-md transition-colors duration-200 text-white">
                      Save Changes
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {activeView === "activity" && (
            <> {/* Added React Fragment here */}
              <Card className="shadow-lg bg-gray-800 border-gray-700">
                <CardHeader className="border-b border-gray-700 pb-4">
                  <CardTitle className="text-3xl font-bold text-white">
                    {user.user_type === "student" ? "My Applications" : "My Job Postings"}
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    {user.user_type === "student"
                      ? "Track your job applications and their current status."
                      : "Manage your active and completed job listings."
                    }
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  {user.user_type === "student" ? (
                    <div className="space-y-8">
                      {/* Stats Overview */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
                        <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 rounded-xl p-3 md:p-4 border border-blue-500/20">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-blue-400 text-xs md:text-sm font-medium">Applied</p>
                              <p className="text-lg md:text-2xl font-bold text-white">{appliedCount}</p>
                            </div>
                            <div className="w-8 h-8 md:w-10 md:h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                              <svg className="w-4 h-4 md:w-5 md:h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            </div>
                          </div>
                        </div>
                        
                        <div className="bg-gradient-to-br from-green-500/10 to-green-600/10 rounded-xl p-3 md:p-4 border border-green-500/20">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-green-400 text-xs md:text-sm font-medium">Hired</p>
                              <p className="text-lg md:text-2xl font-bold text-white">{hiredCount}</p>
                            </div>
                            <div className="w-8 h-8 md:w-10 md:h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                              <svg className="w-4 h-4 md:w-5 md:h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                          </div>
                        </div>
                        
                        <div className="bg-gradient-to-br from-red-500/10 to-red-600/10 rounded-xl p-3 md:p-4 border border-red-500/20">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-red-400 text-xs md:text-sm font-medium">Declined</p>
                              <p className="text-lg md:text-2xl font-bold text-white">{appliedJobs.filter(job => job.studentOutcome === 'declined' || job.status === 'Declined').length}</p>
                            </div>
                            <div className="w-8 h-8 md:w-10 md:h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
                              <svg className="w-4 h-4 md:w-5 md:h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </div>
                          </div>
                        </div>
                        
                        <div className="bg-gradient-to-br from-gray-500/10 to-gray-600/10 rounded-xl p-3 md:p-4 border border-gray-500/20">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-gray-400 text-xs md:text-sm font-medium">Total</p>
                              <p className="text-lg md:text-2xl font-bold text-white">{totalCount}</p>
                            </div>
                            <div className="w-8 h-8 md:w-10 md:h-10 bg-gray-500/20 rounded-lg flex items-center justify-center">
                              <svg className="w-4 h-4 md:w-5 md:h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Search and Filter Bar */}
                      <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-3 md:p-4 border border-gray-700/50 mb-4 md:mb-6">
                        <div className="flex flex-col gap-3 md:flex-row md:gap-4 md:items-center">
                          <div className="flex-1 w-full">
                            <div className="relative">
                              <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                              </svg>
                              <input
                                type="text"
                                placeholder="Search by job title or company..."
                                value={studentSearchTerm}
                                onChange={(e) => setStudentSearchTerm(e.target.value)}
                                className="w-full pl-9 md:pl-10 pr-3 md:pr-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors text-sm md:text-base"
                              />
                            </div>
                          </div>
                          <div className="flex flex-col sm:flex-row gap-2">
                            <select 
                              value={studentStatusFilter} 
                              onChange={(e) => setStudentStatusFilter(e.target.value)}
                              className="px-3 md:px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500 transition-colors text-lg md:text-base min-w-[140px] md:min-w-[120px]"
                            >
                              <option value="" className="text-lg md:text-base">All Applications</option>
                              <option value="applied" className="text-lg md:text-base">Applied</option>
                              <option value="hired" className="text-lg md:text-base">Hired</option>
                              <option value="declined" className="text-lg md:text-base">Declined</option>
                              <option value="cancelled" className="text-lg md:text-base">Cancelled</option>
                            </select>
                            <select 
                              value={studentTimeFilter} 
                              onChange={(e) => setStudentTimeFilter(e.target.value)}
                              className="px-3 md:px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500 transition-colors text-lg md:text-base min-w-[140px] md:min-w-[120px]"
                            >
                              <option value="" className="text-lg md:text-base">All Time</option>
                              <option value="7" className="text-lg md:text-base">Last 7 days</option>
                              <option value="30" className="text-lg md:text-base">Last 30 days</option>
                              <option value="90" className="text-lg md:text-base">Last 3 months</option>
                            </select>
                            <button 
                              onClick={fetchAppliedJobs}
                              className="px-4 md:px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors text-sm md:text-base flex items-center gap-2"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                              </svg>
                              Refresh
                            </button>
                          </div>
                        </div>
                      </div>

                      {isLoadingAppliedJobs ? (
                        <div className="flex items-center justify-center py-12">
                          <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                            <p className="text-gray-400">Loading your applications...</p>
                          </div>
                        </div>
                      ) : appliedJobs.length > 0 ? (
                        <>
                          {/* Unified Applications List */}
                          <div className="space-y-6">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                              <div className="flex items-center gap-2 md:gap-3">
                                <div className="w-2 h-2 md:w-3 md:h-3 bg-blue-500 rounded-full animate-pulse"></div>
                                <h3 className="text-lg md:text-xl font-bold text-white">My Applications</h3>
                                <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 px-2 md:px-3 py-1 text-xs md:text-sm">
                                  {filteredApplications.length} of {totalCount}
                                </Badge>
                              </div>
                            </div>
                            
                            <div className="grid gap-3 md:gap-4">
                              {sortedApplications.length > 0 ? (
                                sortedApplications.map((job) => (
                                  <div key={job.id} className="group relative bg-gradient-to-r from-gray-900 to-gray-800 rounded-xl md:rounded-2xl p-4 md:p-6 border border-gray-700/50 hover:border-blue-500/30 transition-all duration-300 hover:shadow-xl">
                                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-3 md:mb-4">
                                      <div className="flex-1 min-w-0">
                                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 md:gap-3 mb-2">
                                          <h4 className="text-base md:text-lg font-semibold text-white group-hover:text-blue-400 transition-colors break-words">{job.title}</h4>
                                          <Badge className={`${
                                            job.studentOutcome === 'hired' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                                            job.studentOutcome === 'declined' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                                            job.studentOutcome === 'cancelled' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
                                            job.status === 'Declined' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                                            'bg-blue-500/20 text-blue-400 border-blue-500/30'
                                          } text-xs md:text-sm w-fit flex items-center gap-1`}>
                                            {job.studentOutcome === 'hired' ? 'Hired' :
                                             job.studentOutcome === 'declined' ? 'Declined' :
                                             job.studentOutcome === 'cancelled' ? 'Cancelled' :
                                             job.status === 'Declined' ? 'Declined' :
                                             job.studentOutcome === 'applied' ? 'Applied' :
                                             job.studentOutcome}
                                            {job.studentOutcome === 'hired' && job.confirmed && (
                                              <svg className="w-3 h-3 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                              </svg>
                                            )}
                                          </Badge>
                                        </div>
                                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 md:gap-4 text-xs md:text-sm text-gray-400 mb-2">
                                          <span className="flex items-center gap-1">
                                            <svg className="w-3 h-3 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                            </svg>
                                            {job.company}
                                          </span>
                                          <span className="flex items-center gap-1">
                                            <svg className="w-3 h-3 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                            {job.appliedDate}
                                          </span>
                                        </div>
                                      </div>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                        className="text-blue-400 border-blue-500/30 bg-blue-500/10 hover:bg-blue-500/20 transition-all duration-200 text-xs md:text-sm px-3 md:px-4 w-full sm:w-auto"
                                        onClick={() => handleViewJob(job.jobId, job.confirmed)}
                                  >
                                        View Job
                                  </Button>
                              </div>

                                    {/* Contact Info Section */}
                                    {job.studentOutcome !== 'cancelled' && job.studentOutcome !== 'declined' && job.isContactInfoRevealed && (
                                      <div className="bg-gradient-to-r from-green-500/10 to-blue-500/10 rounded-lg md:rounded-xl p-3 md:p-4 mb-3 md:mb-4 border border-green-500/20">
                                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
                                          <div className="flex flex-col sm:flex-row sm:items-center gap-3 md:gap-6">
                                            <div className="flex items-center gap-2">
                                              <div className="w-6 h-6 md:w-8 md:h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
                                                <svg className="w-3 h-3 md:w-4 md:h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                                </svg>
                                              </div>
                                              <span className="text-green-400 font-medium text-sm md:text-base break-all">{job.employerPhone}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                              <div className="w-6 h-6 md:w-8 md:h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                                                <svg className="w-3 h-3 md:w-4 md:h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                </svg>
                                              </div>
                                              <span className="text-blue-400 font-medium text-sm md:text-base break-all">{job.employerEmail}</span>
                                            </div>
                                          </div>
                                          <div className="flex gap-2">
                                            <Button
                                              size="sm"
                                              className="bg-green-500 hover:bg-green-600 text-white px-3 md:px-4 py-2 rounded-lg transition-all duration-200 text-xs md:text-sm"
                                              onClick={() => window.open(`tel:${job.employerPhone}`, '_self')}
                                            >
                                              <svg className="w-3 h-3 md:w-4 md:h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                              </svg>
                                              Call
                                            </Button>
                                            <Button
                                              size="sm"
                                              className="bg-blue-500 hover:bg-blue-600 text-white px-3 md:px-4 py-2 rounded-lg transition-all duration-200 text-xs md:text-sm"
                                              onClick={() => window.open(`mailto:${job.employerEmail}`, '_self')}
                                            >
                                              <svg className="w-3 h-3 md:w-4 md:h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                              </svg>
                                              Email
                                            </Button>
                              </div>
                            </div>
                                      </div>
                                    )}

                                    {/* Action Buttons */}
                                    {job.studentOutcome === 'applied' && job.status !== 'Declined' && (
                                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                        {!job.isContactInfoRevealed ? (
                                          <Button
                                            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-4 md:px-6 py-2 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl text-sm md:text-base w-full sm:w-auto"
                                            onClick={() => handleRevealContactInfo(job.id)}
                                          >
                                            <svg className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                            </svg>
                                            Reveal Contact (1 Credit)
                                          </Button>
                                        ) : (
                                          <div className="flex flex-col sm:flex-row gap-2 md:gap-3 w-full sm:w-auto">
                                            <Button
                                              className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-3 md:px-4 py-2 rounded-lg transition-all duration-200 text-xs md:text-sm"
                                              onClick={() => handleUpdateApplicationOutcome(job.id, 'hired')}
                                            >
                                              <svg className="w-3 h-3 md:w-4 md:h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                              </svg>
                                              Hired
                                            </Button>
                                            <Button
                                              className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-3 md:px-4 py-2 rounded-lg transition-all duration-200 text-xs md:text-sm"
                                              onClick={() => handleUpdateApplicationOutcome(job.id, 'declined')}
                                            >
                                              <svg className="w-3 h-3 md:w-4 md:h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                              </svg>
                                              Declined
                                            </Button>
                                            <Button
                                              className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white px-3 md:px-4 py-2 rounded-lg transition-all duration-200 text-xs md:text-sm"
                                              onClick={() => handleUpdateApplicationOutcome(job.id, 'cancelled')}
                                            >
                                              <svg className="w-3 h-3 md:w-4 md:h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                              </svg>
                                              Cancel
                                            </Button>
                                          </div>
                                        )}
                                      </div>
                                    )}
                          </div>
                        ))
                      ) : (
                                <div className="text-center py-12 bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl border border-gray-700/50">
                                  <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                  </div>
                                  <h3 className="text-lg font-semibold text-white mb-2">No Applications Found</h3>
                                  <p className="text-gray-400 mb-4">
                                    {studentSearchTerm || studentStatusFilter || studentTimeFilter 
                                      ? "Try adjusting your search or filters" 
                                      : "Start applying to jobs to see them here"}
                                  </p>
                                  {!studentSearchTerm && !studentStatusFilter && !studentTimeFilter && (
                          <Link href="/browse-jobs">
                                      <Button className="bg-blue-500 hover:bg-blue-600 text-white">
                                        Browse Jobs
                                      </Button>
                          </Link>
                                  )}
                        </div>
                      )}
                    </div>
                          </div>
                        </>
                      ) : (
                         <div className="text-center py-12 bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl border border-gray-700/50">
                           <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                             <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                             </svg>
                           </div>
                           <h3 className="text-lg font-semibold text-white mb-2">No Applications Yet</h3>
                           <p className="text-gray-400 mb-4">Start applying to jobs to see them here</p>
                           <Link href="/browse-jobs">
                             <Button className="bg-blue-500 hover:bg-blue-600 text-white">
                               Browse Jobs
                             </Button>
                           </Link>
                         </div>
                       )}
                     </div>
                   ) : (
                     <div className="space-y-6">
                      {isLoadingPostedJobs ? (
                         <div className="flex items-center justify-center py-12">
                           <div className="flex flex-col items-center gap-4">
                             <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent"></div>
                             <p className="text-gray-400">Loading your job postings...</p>
                           </div>
                        </div>
                      ) : postedJobs.length > 0 ? (
                         <>
                           {/* Stats Overview Dashboard */}
                           <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
                             <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 rounded-xl p-3 md:p-4 border border-purple-500/20">
                               <div className="flex items-center justify-between">
                                 <div>
                                   <p className="text-purple-400 text-xs md:text-sm font-medium">Sponsored Jobs</p>
                                   <p className="text-lg md:text-2xl font-bold text-white">
                                     {postedJobs.filter(job => job.sponsored).length}
                                   </p>
                                </div>
                                 <div className="w-8 h-8 md:w-10 md:h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                                   <svg className="w-4 h-4 md:w-5 md:h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                                   </svg>
                                 </div>
                               </div>
                             </div>
                             
                             <div className="bg-gradient-to-br from-green-500/10 to-green-600/10 rounded-xl p-3 md:p-4 border border-green-500/20">
                               <div className="flex items-center justify-between">
                                 <div>
                                   <p className="text-green-400 text-xs md:text-sm font-medium">Active Jobs</p>
                                   <p className="text-lg md:text-2xl font-bold text-white">
                                     {postedJobs.filter(job => job.status === "active").length}
                                   </p>
                                 </div>
                                 <div className="w-8 h-8 md:w-10 md:h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                                   <svg className="w-4 h-4 md:w-5 md:h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                   </svg>
                                 </div>
                               </div>
                             </div>
                             
                             <div className="bg-gradient-to-br from-yellow-500/10 to-yellow-600/10 rounded-xl p-3 md:p-4 border border-yellow-500/20">
                               <div className="flex items-center justify-between">
                                 <div>
                                   <p className="text-yellow-400 text-xs md:text-sm font-medium">Filled Positions</p>
                                   <p className="text-lg md:text-2xl font-bold text-white">
                                     {postedJobs.filter(job => job.status === "filled").length}
                                   </p>
                                 </div>
                                 <div className="w-8 h-8 md:w-10 md:h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                                   <svg className="w-4 h-4 md:w-5 md:h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                   </svg>
                                 </div>
                               </div>
                             </div>
                             
                             <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 rounded-xl p-3 md:p-4 border border-blue-500/20">
                               <div className="flex items-center justify-between">
                                 <div>
                                   <p className="text-blue-400 text-xs md:text-sm font-medium">Total Applications</p>
                                   <p className="text-lg md:text-2xl font-bold text-white">
                                     {postedJobs.reduce((total, job) => total + (job.applications || 0), 0)}
                                   </p>
                                 </div>
                                 <div className="w-8 h-8 md:w-10 md:h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                                   <svg className="w-4 h-4 md:w-5 md:h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                   </svg>
                                 </div>
                               </div>
                             </div>
                           </div>

                           {/* Search and Filter Bar */}
                           <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-3 md:p-4 border border-gray-700/50 mb-4 md:mb-6">
                             <div className="flex flex-col gap-3 md:flex-row md:gap-4 md:items-center">
                               <div className="flex-1 w-full">
                                 <div className="relative">
                                   <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                   </svg>
                                   <input
                                     type="text"
                                     placeholder="Search job titles, posted dates, expiry dates, status..."
                                     value={employerSearchTerm}
                                     onChange={(e) => setEmployerSearchTerm(e.target.value)}
                                     className="w-full pl-9 md:pl-10 pr-3 md:pr-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors text-sm md:text-base"
                                   />
                                 </div>
                               </div>
                               <div className="flex flex-col sm:flex-row gap-2">
                                 <select 
                                   value={employerStatusFilter} 
                                   onChange={(e) => setEmployerStatusFilter(e.target.value)}
                                   className="px-3 md:px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500 transition-colors text-lg md:text-base min-w-[140px] md:min-w-[120px]"
                                 >
                                   <option value="" className="text-lg md:text-base">All Status</option>
                                   <option value="active" className="text-lg md:text-base">Active</option>
                                   <option value="filled" className="text-lg md:text-base">Filled</option>
                                   <option value="removed" className="text-lg md:text-base">Removed</option>
                                   <option value="expired" className="text-lg md:text-base">Expired</option>
                                 </select>
                                 <select 
                                   value={employerTimeFilter} 
                                   onChange={(e) => setEmployerTimeFilter(e.target.value)}
                                   className="px-3 md:px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500 transition-colors text-lg md:text-base min-w-[140px] md:min-w-[120px]"
                                 >
                                   <option value="" className="text-lg md:text-base">All Time</option>
                                   <option value="7" className="text-lg md:text-base">Last 7 days</option>
                                   <option value="30" className="text-lg md:text-base">Last 30 days</option>
                                   <option value="90" className="text-lg md:text-base">Last 3 months</option>
                                 </select>
                                 <button 
                                   onClick={handleRefreshJobs}
                                   className="px-4 md:px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors text-sm md:text-base flex items-center gap-2"
                                 >
                                   <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                   </svg>
                                   Refresh
                                 </button>
                               </div>
                             </div>
                           </div>

                           {/* All Jobs Section */}
                           <div>
                             <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 md:mb-6">
                               <div className="flex items-center gap-3">
                                 <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                 <h3 className="text-lg md:text-xl font-semibold text-white">Job Postings</h3>
                                 <div className="px-2 py-1 bg-green-500/20 border border-green-500/30 rounded-full">
                                   <span className="text-green-400 font-medium text-xs md:text-sm">
                                     {postedJobs.length}
                                   </span>
                                 </div>
                               </div>
                               <div className="flex flex-col sm:flex-row gap-3 mb-6">
                                 <Button 
                                   onClick={() => router.push('/post-job')}
                                   className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-3 md:py-2 px-6 md:px-4 text-base md:text-sm rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl"
                                 >
                                   <svg className="w-5 h-5 md:w-4 md:h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                   </svg>
                                   Post New Jobs
                                 </Button>
                               </div>
                             </div>
                             
                             <div className="space-y-3 md:space-y-4">
                               {(() => {
                                 // Filter jobs based on search and status
                                 let filteredJobs = postedJobs;
                                 
                                 if (employerSearchTerm) {
                                   filteredJobs = filteredJobs.filter(job => 
                                     job.title.toLowerCase().includes(employerSearchTerm.toLowerCase()) ||
                                     job.description.toLowerCase().includes(employerSearchTerm.toLowerCase()) ||
                                     job.postedDate.toLowerCase().includes(employerSearchTerm.toLowerCase()) ||
                                     job.expiryDate.toLowerCase().includes(employerSearchTerm.toLowerCase()) ||
                                     job.status.toLowerCase().includes(employerSearchTerm.toLowerCase())
                                   );
                                 }
                                 
                                 if (employerStatusFilter) {
                                   filteredJobs = filteredJobs.filter(job => job.status === employerStatusFilter);
                                 }
                                 
                                 if (employerTimeFilter) {
                                   const now = new Date();
                                   const daysAgo = parseInt(employerTimeFilter);
                                   const cutoffDate = new Date(now.getTime() - (daysAgo * 24 * 60 * 60 * 1000));
                                   
                                   filteredJobs = filteredJobs.filter(job => {
                                     try {
                                       // Handle different date formats
                                       let postedDate;
                                       if (job.postedDate.includes('/')) {
                                         // Handle DD/MM/YYYY format
                                         const [day, month, year] = job.postedDate.split('/');
                                         postedDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
                                       } else if (job.postedDate.includes('-')) {
                                         // Handle YYYY-MM-DD or DD-MM-YYYY format
                                         postedDate = new Date(job.postedDate);
                                       } else {
                                         postedDate = new Date(job.postedDate);
                                       }
                                       return postedDate >= cutoffDate;
                                     } catch (error) {
                                       console.log('Date parsing error:', error, 'for date:', job.postedDate);
                                       return true; // If date parsing fails, include the job
                                     }
                                   });
                                 }
                                 
                                 // Sort jobs by status priority: Active → Filled → Removed → Expired
                                 filteredJobs.sort((a, b) => {
                                   const getStatusPriority = (status: string) => {
                                     switch (status) {
                                       case 'active': return 1;
                                       case 'filled': return 2;
                                       case 'removed': return 3;
                                       case 'expired': return 4;
                                       default: return 5; // Unknown statuses go to end
                                     }
                                   };
                                   
                                   const priorityA = getStatusPriority(a.status);
                                   const priorityB = getStatusPriority(b.status);
                                   
                                   // Sort by status priority, maintain original order within same status
                                   return priorityA - priorityB;
                                 });
                                 
                                 return filteredJobs.length > 0 ? (
                                   filteredJobs.map((job) => {
                                     // Check if this job has pending hire confirmations
                                     const hasPendingConfirmation = job.applicants && job.applicants.some(
                                       applicant => applicant.studentOutcome === 'hired' && !applicant.confirmed
                                     );
                                     
                                     return (
                                     <div key={job.id} className={`group relative bg-gradient-to-r rounded-2xl p-4 md:p-6 border transition-all duration-300 hover:shadow-xl ${
                                       hasPendingConfirmation 
                                         ? 'from-orange-900/30 to-orange-800/20 border-orange-500/50 hover:border-orange-400/70 shadow-lg shadow-orange-500/10 hover:shadow-orange-500/20' 
                                         : 'from-gray-900 to-gray-800 border-gray-700/50 hover:border-green-500/30 hover:shadow-green-500/10'
                                     }`}>
                                       <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                                         <div className="flex-1">
                                           <div className="flex items-center gap-2 mb-2">
                                             <h4 className="text-lg md:text-xl font-semibold text-white group-hover:text-green-300 transition-colors">{job.title}</h4>
                                             {hasPendingConfirmation && (
                                               <span className="px-3 py-1 bg-orange-500/20 text-orange-400 border border-orange-500/40 rounded-full text-xs font-medium flex items-center gap-1 animate-pulse">
                                                 <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                                   <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                                 </svg>
                                                 Action Required
                                               </span>
                                             )}
                                  {job.sponsored && (
                                               <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 rounded-full text-xs">
                                      Sponsored
                                               </span>
                                             )}
                                             <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                               job.status === 'active' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                                               job.status === 'filled' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
                                               job.status === 'expired' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                                               'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                                             }`}>
                                               {job.status === 'active' ? 'Active' : 
                                                job.status === 'filled' ? 'Filled' : 
                                                job.status === 'removed' ? 'Removed' :
                                                job.status === 'expired' ? 'Expired' : job.status}
                                             </span>
                                           </div>
                                           <div className="flex items-center gap-4 text-sm text-gray-400 mb-3">
                                             <span>Posted: {job.postedDate}</span>
                                             <span>Expires: {job.expiryDate}</span>
                                             <div className="text-center md:text-left">
                                               <span className="text-blue-400 font-medium text-lg md:text-base">{job.applications || 0} applications</span>
                                             </div>
                                           </div>
                                         </div>
                                         
                                         <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleEditJob(job)}
                                             className="text-gray-300 border-gray-600 bg-gray-700/20 hover:bg-gray-600/30 text-xs md:text-sm px-2 md:px-3 py-1"
                                  >
                                    Edit
                                  </Button>

                                           {job.applications > 0 && (
                                             <Button
                                               size="sm"
                                               variant="outline"
                                               onClick={() => handleViewApplicants(job)}
                                               className={`text-blue-400 border-blue-700 bg-blue-900/20 hover:bg-blue-800/30 text-xs md:text-sm px-2 md:px-3 py-1 ${
                                                 hasPendingConfirmation ? 'animate-pulse shadow-lg shadow-blue-500/20' : ''
                                               }`}
                                             >
                                               View ({job.applications})
                                               {hasPendingConfirmation && (
                                                 <svg className="w-3 h-3 ml-1" fill="currentColor" viewBox="0 0 20 20">
                                                   <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                                 </svg>
                                               )}
                                             </Button>
                                           )}

                                           {job.status === 'active' && (
                                             <>
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                                     className="text-green-400 border-green-700 bg-green-900/20 hover:bg-green-800/30 text-xs md:text-sm px-2 md:px-3 py-1"
                                                     disabled={removingJobId === job.id}
                                      >
                                                     {removingJobId === job.id ? "Marking..." : "Fill"}
                                      </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent className="bg-gray-800 border-gray-700 text-gray-100">
                                      <AlertDialogHeader>
                                        <AlertDialogTitle className="text-white">Mark Position as Filled</AlertDialogTitle>
                                        <AlertDialogDescription className="text-gray-400">
                                                       This will move your job to filled since you've found an employee.
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                                     <AlertDialogCancel className="px-5 py-2 rounded-md border border-gray-600 text-white bg-gray-600 hover:bg-gray-500 transition duration-150">Cancel</AlertDialogCancel>
                                        <AlertDialogAction
                                          onClick={() => handleRemoveJob(job.id, "filled")}
                                          className="bg-green-600 hover:bg-green-500 text-white"
                                        >
                                          Mark as Filled
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>

                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                                     className="text-red-400 border-red-700 bg-red-900/20 hover:bg-red-800/30 text-xs md:text-sm px-2 md:px-3 py-1"
                                        disabled={removingJobId === job.id}
                                      >
                                                     {removingJobId === job.id ? "Removing..." : "Remove"}
                                      </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent className="bg-gray-800 border-gray-700 text-gray-100">
                                      <AlertDialogHeader>
                                        <AlertDialogTitle className="text-white">Remove Job Posting</AlertDialogTitle>
                                        <AlertDialogDescription className="text-gray-400">
                                                       Are you sure you want to permanently remove this job posting?
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                                     <AlertDialogCancel className="px-5 py-2 rounded-md border border-gray-600 text-white bg-gray-600 hover:bg-gray-500 transition duration-150">Cancel</AlertDialogCancel>
                                        <AlertDialogAction
                                          onClick={() => handleRemoveJob(job.id, "removed")}
                                          className="bg-red-600 hover:bg-red-500 text-white"
                                        >
                                          Remove Job
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                             </>
                                           )}

                                           {job.status !== 'active' && (
                                             <Button
                                               size="sm"
                                               variant="outline"
                                               onClick={() => handleReactivateJob(job.id)}
                                               className="text-blue-400 border-blue-700 bg-blue-900/20 hover:bg-blue-800/30 text-xs md:text-sm px-2 md:px-3 py-1"
                                               disabled={removingJobId === job.id}
                                             >
                                               {removingJobId === job.id ? "Reactivating..." : "Reactivate"}
                                              </Button>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    );
                                   })
                                  ) : (
                                   <div className="text-center py-8 md:py-12 bg-gradient-to-br from-gray-900/50 to-gray-800/50 rounded-2xl border border-gray-700/30">
                                     <div className="w-12 h-12 md:w-16 md:h-16 bg-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
                                       <svg className="w-6 h-6 md:w-8 md:h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                       </svg>
                                    </div>
                                     <h3 className="text-lg md:text-xl font-semibold text-white mb-2">No Jobs Found</h3>
                                     <p className="text-gray-400">Try adjusting your search or filter criteria.</p>
                                </div>
                                 );
                               })()}
                              </div>
                           </div>
                         </>
                       ) : (
                         <div className="text-center py-12 md:py-16 bg-gradient-to-br from-gray-900/50 to-gray-800/50 rounded-2xl border border-gray-700/30">
                           <div className="w-16 h-16 md:w-20 md:h-20 bg-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-4 md:mb-6">
                             <svg className="w-8 h-8 md:w-10 md:h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6" />
                             </svg>
                           </div>
                           <h3 className="text-xl md:text-2xl font-bold text-white mb-3 md:mb-4">No Job Postings Yet</h3>
                           <p className="text-gray-400 mb-6 md:mb-8 max-w-md mx-auto">Start posting jobs to attract talented students and grow your business.</p>
                          <Link href="/post-job">
                             <button className="w-full sm:w-auto px-6 md:px-8 py-3 md:py-4 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors text-lg">
                               Post Your First Job
                             </button>
                          </Link>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Redesigned Edit Modal - World Class UX/UI */}
              {editingJobId !== null && (
                <div 
                  className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                  onClick={() => {
                    setEditingJobId(null)
                    setEditJobData({ title: "", description: "", applications: 0, sponsored: false })
                  }}
                >
                  <div 
                    className="bg-gray-900 rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col border border-gray-800"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {/* Modern Header */}
                    <div className="bg-gray-800 p-4 border-b border-gray-700 flex-shrink-0 rounded-t-3xl">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-green-500/20 rounded-2xl flex items-center justify-center">
                            <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </div>
                          <div>
                            <h2 className="text-2xl font-bold text-white mb-1">Edit Job Posting</h2>
                            <p className="text-gray-400 text-sm">Update your job details and settings</p>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            setEditingJobId(null)
                            setEditJobData({ title: "", description: "", applications: 0, sponsored: false })
                          }}
                          className="w-10 h-10 rounded-2xl bg-gray-700 hover:bg-gray-600 flex items-center justify-center transition-colors"
                        >
                          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>

                    {/* Content Section with Proper Scrolling */}
                    <div className="flex-grow overflow-y-auto p-6">
                      {editingJobId && (() => {
                        const currentJob = postedJobs.find(j => j.id === editingJobId)
                        if (!currentJob) return null;
                        return (
                          <div className="space-y-6">
                            {/* Job Title Section */}
                            <div className="space-y-3">
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                <label className="text-sm font-semibold text-white">Job Title</label>
                              </div>
                              <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 focus-within:border-blue-500/50 transition-colors">
                                <input
                                  value={editJobData.title}
                                  onChange={(e) => setEditJobData(prev => ({ ...prev, title: e.target.value }))}
                                  className="w-full p-4 bg-transparent text-gray-100 placeholder:text-gray-500 focus:outline-none rounded-xl"
                                  placeholder="Enter job title..."
                                />
                              </div>
                            </div>

                            {/* Job Description Section */}
                            <div className="space-y-3">
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                                <label className="text-sm font-semibold text-white">Job Description</label>
                              </div>
                              <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 focus-within:border-blue-500/50 transition-colors">
                                <textarea
                                  value={editJobData.description}
                                  onChange={(e) => setEditJobData(prev => ({ ...prev, description: e.target.value }))}
                                  className="w-full p-4 bg-transparent text-gray-100 placeholder:text-gray-500 focus:outline-none rounded-xl resize-none"
                                  rows={8}
                                  placeholder="Describe the job requirements, responsibilities, and benefits..."
                                />
                              </div>
                              <p className="text-xs text-gray-500">Provide detailed information to attract qualified candidates</p>
                            </div>

                            {/* Applications Count Section */}
                            <div className="space-y-3">
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                                <label className="text-sm font-semibold text-white">Applications Received</label>
                              </div>
                              <div className="bg-gray-800/30 rounded-xl border border-gray-700/50 opacity-60">
                                <div className="p-4 flex items-center gap-3">
                                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                  </svg>
                                  <span className="text-gray-400 font-medium">{editJobData.applications} applications</span>
                                </div>
                              </div>
                              <p className="text-xs text-gray-500">This value is automatically updated and cannot be modified</p>
                            </div>

                            {/* Sponsored Section */}
                            <div className="space-y-3">
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                                <label className="text-sm font-semibold text-white">Sponsorship</label>
                              </div>
                              <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 border border-blue-700/50 rounded-xl p-5">
                                <div className="flex items-start gap-4">
                                  <div className="flex-shrink-0 mt-1">
                                    <input
                                      type="checkbox"
                                      id="editSponsored"
                                      checked={editJobData.sponsored}
                                      onChange={(e) => setEditJobData(prev => ({ ...prev, sponsored: e.target.checked }))}
                                      className="w-5 h-5 text-blue-600 border-gray-600 rounded focus:ring-blue-500 cursor-pointer bg-gray-700"
                                      disabled={currentJob.sponsored}
                                    />
                                  </div>
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                      <label htmlFor="editSponsored" className="font-semibold text-white cursor-pointer">
                                        {currentJob.sponsored ? "Currently Sponsored" : "Upgrade to Sponsored"}
                                      </label>
                                      {!currentJob.sponsored && (
                                        <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs font-medium rounded-full border border-green-500/30">
                                          +£4
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-sm text-gray-300 mb-3">
                                      {currentJob.sponsored
                                        ? "This job is already sponsored and appears at the top of search results with priority visibility."
                                        : "Move your job to the top of search results and get 3x more visibility from qualified candidates."
                                      }
                                    </p>
                                    {!currentJob.sponsored && editJobData.sponsored && (
                                      <div className="bg-yellow-900/20 border border-yellow-600/50 rounded-lg p-3 flex items-start gap-3">
                                        <svg className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                                        </svg>
                                        <div>
                                          <p className="text-sm font-medium text-yellow-300 mb-1">Payment Required</p>
                                          <p className="text-xs text-yellow-400">You'll be charged £4 to upgrade this job to sponsored status upon saving.</p>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )
                      })()}
                    </div>

                    {/* Modern Footer */}
                    <div className="bg-gray-800/50 border-t border-gray-700 p-4 flex-shrink-0 rounded-b-3xl">
                      <div className="flex justify-end gap-3">
                        <button
                          onClick={() => {
                            setEditingJobId(null)
                            setEditJobData({ title: "", description: "", applications: 0, sponsored: false })
                          }}
                          className="px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-gray-300 font-medium transition-all duration-200 border border-gray-600 hover:border-gray-500 text-sm"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleSaveJobChanges}
                          disabled={isProcessingUpgrade}
                          className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-medium transition-all duration-200 shadow-lg hover:shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm"
                        >
                          {isProcessingUpgrade ? (
                            <>
                              <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                              </svg>
                              Processing Payment...
                            </>
                          ) : (
                            <>
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              Save Changes
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </> /* Closed React Fragment here */
          )}

          {activeView === "billing" && (
            <Card className="shadow-lg bg-gray-800 border-gray-700">
              <CardHeader className="border-b border-gray-700 pb-4">
                <CardTitle className="text-3xl font-bold text-white">Billing & Payments</CardTitle>
                <CardDescription className="text-gray-400">
                  Manage your payment methods and view past transactions.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="mb-10">
                  <h3 className="text-xl font-semibold text-white mb-4">Saved Payment Methods</h3>
                  <div className="space-y-4">
                    <div className="bg-gray-900 border border-gray-700 rounded-lg p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between shadow-sm">
                      <div className="flex items-center space-x-4 mb-3 sm:mb-0">
                        <div className="w-12 h-8 bg-blue-700 rounded-md flex items-center justify-center text-white text-xs font-bold shadow">
                          VISA
                        </div>
                        <div>
                          <p className="font-medium text-white">•••• •••• •••• 4242</p>
                          <p className="text-sm text-gray-400">Expires 12/2028</p>
                        </div>
                      </div>
                      <div className="flex gap-2 w-full sm:w-auto">
                      <Button size="sm" variant="outline" className="bg-gray-700 text-white border border-gray-600 hover:bg-gray-700 hover:text-white hover:border-gray-600 hover:brightness-110 transition duration-150 w-full sm:w-auto">Edit</Button>
                        <Button size="sm" variant="destructive" className="bg-red-600 hover:bg-red-500 text-white w-full sm:w-auto">Delete</Button>
                      </div>
                    </div>

                    <div className="bg-gray-900 border border-gray-700 rounded-lg p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between shadow-sm">
                      <div className="flex items-center space-x-4 mb-3 sm:mb-0">
                        <div className="w-12 h-8 bg-red-700 rounded-md flex items-center justify-center text-white text-xs font-bold shadow">
                          MC
                        </div>
                        <div>
                          <p className="font-medium text-white">•••• •••• •••• 1234</p>
                          <p className="text-sm text-gray-400">Expires 08/2027</p>
                        </div>
                      </div>
                      <div className="flex gap-2 w-full sm:w-auto">
                      <Button size="sm" variant="outline" className="bg-gray-700 text-white border border-gray-600 hover:bg-gray-700 hover:text-white hover:border-gray-600 hover:brightness-110 transition duration-150 w-full sm:w-auto">Edit</Button>
                        <Button size="sm" variant="destructive" className="bg-red-600 hover:bg-red-500 text-white w-full sm:w-auto">Delete</Button>
                      </div>
                    </div>

           <Button variant="outline" className="w-full py-2.5 rounded-md bg-gray-700 text-white border border-gray-600 hover:bg-gray-700 hover:text-white hover:border-gray-600 hover:brightness-110 transition duration-150"><span className="mr-2">+</span> Add New Payment Method</Button>


                  </div>
                </div>

                {user.user_type === "employer" && (
                  <>
                    <Separator className="my-8 bg-gray-700" />
                    <h3 className="text-xl font-semibold text-white mb-4">Transaction History</h3>
                    <div className="space-y-4">
                      {employerBillingHistory.length > 0 ? (
                        employerBillingHistory.map((transaction: Transaction) => (
                          <div key={transaction.id} className="bg-gray-900 border border-gray-700 rounded-lg p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between shadow-sm hover:shadow-md transition-shadow duration-200">
                            <div className="mb-3 sm:mb-0">
                              <h4 className="font-semibold text-lg text-white">{transaction.type}</h4>
                              <p className="text-sm text-gray-400">{transaction.description}</p>
                              <p className="text-xs text-gray-500">{transaction.date}</p>
                            </div>
                            <div className="text-right flex flex-col items-end w-full sm:w-auto">
                              <p className="font-bold text-lg text-white">£{transaction.amount.toFixed(2)}</p>
                              <Badge
                                className={`px-3 py-1 rounded-full text-xs mt-1 ${transaction.status === "Completed" ? "bg-green-900 text-green-300" : "bg-yellow-900 text-yellow-300"}`}
                              >
                                {transaction.status}
                              </Badge>
                              <div className="mt-3">
                                <Button size="sm" onClick={() => downloadReceipt(transaction)} className="inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 shadow h-8 rounded-md px-3 text-xs bg-blue-900 text-blue-400 border border-blue-700 hover:brightness-110 hover:text-blue-400 transition duration-150">
                                  Download Receipt
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-8 text-center bg-gray-900 rounded-lg border border-dashed border-gray-700">
                          <p className="text-lg text-gray-400">No transactions found.</p>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          )}

          {user.user_type === "student" && activeView === "credits" && (
            <Card className="shadow-lg bg-gray-800 border-gray-700">
              <CardHeader className="border-b border-gray-700 pb-4">
                <CardTitle className="text-3xl font-bold text-white">My Job Reveal Credits</CardTitle>
                <CardDescription className="text-gray-400">
                  Manage your available credits and view your credit history.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-8">
                <div className="flex flex-col md:flex-row items-center justify-between p-6 bg-blue-900/20 border border-blue-700 rounded-xl shadow-inner">
                  <h3 className="text-xl font-semibold text-blue-300 mb-3 md:mb-0">Available Job Reveals</h3>
                  <Badge className="text-4xl py-3 px-6 bg-blue-600 text-white font-extrabold animate-fade-in-up">
                    {userCredits}
                  </Badge>
                </div>

                <Separator className="my-6 bg-gray-700" />

                <h3 className="text-xl font-semibold text-white mb-4">Credit History</h3>
                <div className="space-y-4">
                  {creditHistory.length > 0 ? (
                    creditHistory.map((transaction) => (
                      <div key={transaction.id} className="bg-gray-900 border border-gray-700 rounded-lg p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between shadow-sm hover:shadow-md transition-shadow duration-200">
                        <div className="mb-3 sm:mb-0">
                          <h4 className="font-semibold text-lg text-white">{transaction.type}</h4>
                          <p className="text-sm text-gray-400">{transaction.description}</p>
                          <p className="text-xs text-gray-500">{transaction.date}</p>
                        </div>
                        <div className="text-right flex flex-col items-end w-full sm:w-auto">
                          <p className="font-bold text-lg text-white">£{transaction.amount.toFixed(2)}</p>
                          <Badge
                            className={`px-3 py-1 rounded-full text-xs mt-1 ${transaction.status === "Completed" ? "bg-green-900 text-green-300" : "bg-yellow-900 text-yellow-300"}`}
                          >
                            {transaction.status}
                          </Badge>
                          {transaction.status === "Completed" && (
                            <div className="mt-3">
                          <Button size="sm" onClick={() => downloadReceipt(transaction)} className="bg-blue-900 text-blue-400 border border-blue-700 hover:brightness-110 transition duration-150">Download Receipt</Button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-8 text-center bg-gray-900 rounded-lg border border-dashed border-gray-700">
                      <p className="text-lg text-gray-400">No credit transactions found.</p>
                    </div>
                  )}
                </div>

                <div className="mt-10 text-center">
                  <Button asChild className="bg-blue-600 hover:bg-blue-500 text-lg px-8 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 text-white">
                    <Link href="/pricing#student">
                      <span>Top Up My Credits</span>
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {activeView === "settings" && (
            <div className="space-y-8">
              <Card className="shadow-lg bg-gray-800 border-gray-700">
                <CardHeader className="border-b border-gray-700 pb-4">
                  <CardTitle className="text-3xl font-bold text-white">Account Preferences</CardTitle>
                  <CardDescription className="text-gray-400">
                    Adjust your notification settings, security, and data privacy.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 bg-gray-900 rounded-lg border border-gray-700">
                    <div className="mb-3 sm:mb-0">
                      <h4 className="font-semibold text-white">Email Notifications</h4>
                      <p className="text-sm text-gray-400">Receive updates about new jobs and applications.</p>
                    </div>
                    <Dialog open={showEmailDialog} onOpenChange={setShowEmailDialog}>
                      <DialogTrigger asChild>
                        <Button className="bg-blue-600 hover:bg-blue-500 text-white sm:w-auto">Manage</Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-lg p-6 bg-gray-800 border-gray-700 text-gray-100">
                        <DialogHeader>
                          <DialogTitle className="text-2xl font-bold text-white">Email Notification Preferences</DialogTitle>
                          <DialogDescription className="text-gray-400">
                            Choose which email notifications you'd like to receive.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="newJobMatches" className="text-gray-300">New job matches</Label>
                            <input id="newJobMatches" type="checkbox" defaultChecked className="h-5 w-5 rounded text-blue-600 border-gray-600 focus:ring-blue-500 bg-gray-700" />
                          </div>
                          <div className="flex items-center justify-between">
                            <Label htmlFor="applicationUpdates" className="text-gray-300">Application updates</Label>
                            <input id="applicationUpdates" type="checkbox" defaultChecked className="h-5 w-5 rounded text-blue-600 border-gray-600 focus:ring-blue-500 bg-gray-700" />
                          </div>
                          <div className="flex items-center justify-between">
                            <Label htmlFor="platformUpdates" className="text-gray-300">Platform updates</Label>
                            <input id="platformUpdates" type="checkbox" className="h-5 w-5 rounded text-blue-600 border-gray-600 focus:ring-blue-500 bg-gray-700" />
                          </div>
                        </div>
                        <DialogFooter className="flex justify-end gap-3">
                          <Button onClick={() => setShowEmailDialog(false)} className="bg-blue-600 hover:bg-blue-500 px-5 py-2 rounded-md transition-colors text-white">Save Preferences</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>

                  <Separator className="bg-gray-700" />

                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 bg-gray-900 rounded-lg border border-gray-700">
                    <div className="mb-3 sm:mb-0">
                      <h4 className="font-semibold text-white">Change Password</h4>
                      <p className="text-sm text-gray-400">Update your account password for enhanced security.</p>
                    </div>
                    <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
                      <DialogTrigger asChild>
                        <Button className="bg-blue-600 hover:bg-blue-500 text-white sm:w-auto">Change</Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-lg p-6 bg-gray-800 border-gray-700 text-gray-100">
                        <DialogHeader>
                          <DialogTitle className="text-2xl font-bold text-white">Change Password</DialogTitle>
                          <DialogDescription className="text-gray-400">
                            Enter your current password and choose a new one.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div>
                            <Label htmlFor="currentPassword" className="text-sm font-medium text-gray-300">Current Password</Label>
                            <Input id="currentPassword" type="password" className="rounded-md border-gray-600 focus:border-blue-500 focus:ring-blue-500 bg-gray-700 text-gray-200 placeholder:text-gray-500" />
                          </div>
                          <div>
                            <Label htmlFor="newPassword" className="text-sm font-medium text-gray-300">New Password</Label>
                            <Input id="newPassword" type="password" className="rounded-md border-gray-600 focus:border-blue-500 focus:ring-blue-500 bg-gray-700 text-gray-200 placeholder:text-gray-500" />
                          </div>
                          <div>
                            <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-300">Confirm New Password</Label>
                            <Input id="confirmPassword" type="password" className="rounded-md border-gray-600 focus:border-blue-500 focus:ring-blue-500 bg-gray-700 text-gray-200 placeholder:text-gray-500" />
                          </div>
                        </div>
                        <DialogFooter className="flex justify-end gap-3">
                        <Button variant="outline" onClick={() => setShowPasswordDialog(false)} className="px-5 py-2 rounded-md border border-gray-600 text-gray-300 bg-transparent hover:brightness-110 transition duration-150">Cancel</Button>
                          <Button onClick={() => setShowPasswordDialog(false)} className="bg-blue-600 hover:bg-blue-500 px-5 py-2 rounded-md transition-colors text-white">Update Password</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>

                  <Separator className="bg-gray-700" />

                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 bg-gray-900 rounded-lg border border-gray-700">
                    <div className="mb-3 sm:mb-0">
                      <h4 className="font-semibold text-white">Download My Data</h4>
                      <p className="text-sm text-gray-400">Export all your account data (GDPR compliant).</p>
                    </div>
                    <Dialog open={showDataDialog} onOpenChange={setShowDataDialog}>
                      <DialogTrigger asChild>
                        <Button className="bg-blue-600 hover:bg-blue-500 text-white sm:w-auto">Download</Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-lg p-6 bg-gray-800 border-gray-700 text-gray-100">
                        <DialogHeader>
                          <DialogTitle className="text-2xl font-bold text-white">Download Your Data</DialogTitle>
                          <DialogDescription className="text-gray-400">
                            This will download all your personal data in JSON format.
                          </DialogDescription>
                        </DialogHeader>
                        <p className="text-sm text-gray-400 mt-4">
                          Your download will include:
                        </p>
                       <ul className="text-sm text-gray-400 pl-5 mt-2 space-y-2">
  {[
    "Profile information",
    "Transaction history",
    "Job info",
    "Account activity logs",
  ].map((item, i) => (
    <li key={i} className="flex items-center gap-2">
      <svg
        className="w-5 h-5 text-green-500 animate-pulse"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
      </svg>
      {item}
    </li>
  ))}
</ul>

                        <DialogFooter className="flex justify-end gap-3 mt-6">
                        <Button variant="outline" onClick={() => setShowDataDialog(false)} className="px-5 py-2 rounded-md border border-gray-600 text-gray-300 bg-transparent hover:brightness-110 transition duration-150">Cancel</Button>
                          <Button onClick={() => {
                            downloadMyData()
                            setShowDataDialog(false)
                          }} className="bg-blue-600 hover:bg-blue-500 px-5 py-2 rounded-md transition-colors text-white">Download Data</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-red-600 bg-red-900/20 shadow-lg">
                <CardHeader className="border-b border-red-700 pb-4">
                  <CardTitle className="text-3xl font-bold text-red-400">Danger Zone</CardTitle>
                  <CardDescription className="text-red-300">
                    Proceed with caution: These actions are irreversible.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 bg-red-1 rounded-lg border border-red-700">
                    <div className="mb-3 sm:mb-0">
                      <h4 className="font-semibold text-red-400">Delete Account</h4>
                      <p className="text-sm text-red-300">
                        Permanently delete your account and all associated data. This cannot be undone.
                      </p>
                    </div>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" className="bg-red-600 hover:bg-red-500 px-5 py-2 rounded-md transition-colors text-white w-full sm:w-auto">Delete Account</Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="max-w-md p-6 bg-gray-800 border-gray-700 text-gray-100">
                        <AlertDialogHeader>
                          <AlertDialogTitle className="text-2xl font-bold text-white">Are you absolutely sure?</AlertDialogTitle>
                          <AlertDialogDescription className="text-gray-400">
                            This action cannot be undone. This will permanently delete your account and remove all your data from our servers.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter className="flex justify-end gap-3 mt-6">
<AlertDialogCancel className="px-5 py-2 rounded-md border border-gray-600 text-white bg-gray-600 hover:bg-gray-500 transition duration-150">Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={handleDeleteAccount} className="bg-red-600 hover:bg-red-500 px-5 py-2 rounded-md transition-colors text-white">
                            Yes, Delete My Account
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>

            {/* Job Details Modal */}
      {isJobModalOpen && selectedJobForModal && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[999] p-4 transition-all duration-300 overflow-hidden"
          onClick={() => setIsJobModalOpen(false)}
        >
          <div 
            className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-3xl shadow-2xl max-w-2xl w-full mx-auto relative flex flex-col max-h-[65vh] sm:max-h-[70vh] overflow-hidden transition-all duration-300 transform scale-100 opacity-100 border border-gray-700/50"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setIsJobModalOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-gray-800/80 backdrop-blur-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-all duration-200 z-10 focus:outline-none focus:ring-2 focus:ring-blue-500 active:scale-95"
              aria-label="Close job details"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Header Section */}
            <div className="p-6 pb-4 border-b border-gray-700/50">
              <div className="flex items-start justify-between gap-4 pr-8">
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-white leading-tight mb-3">
                    {selectedJobForModal.job_title}
                  </h2>
                  
                  {!selectedJobForModal.is_removed && (
                    <div className="space-y-3">
                                             {/* Company & Location */}
                       <div className="flex items-center gap-4 text-sm">
                         <span className="flex items-center gap-2 text-gray-300">
                           <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                             <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-blue-400">
                               <path d="M12 7V3H2v18h20V7H12zM6 19H4v-2h2v2zm0-4H4v-2h2v2zm0-4H4V9h2v2zm0-4H4V5h2v2zm4 12H8v-2h2v2zm0-4H8v-2h2v2zm0-4H8V9h2v2zm0-4H8V5h2v2zm10 12h-8v-2h2v-2h-2v-2h2v-2h-2V9h8v10z"/>
                             </svg>
                           </div>
                           <span className="font-medium text-white">{selectedJobForModal.contact_name}</span>
                         </span>
                         <span className="flex items-center gap-2 text-gray-300">
                           <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
                             <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-4 h-4 text-green-400">
                               <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none"/>
                               <path d="M2 12h20" stroke="currentColor" strokeWidth="2"/>
                               <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" stroke="currentColor" strokeWidth="2" fill="none"/>
                             </svg>
                           </div>
                           <span>{selectedJobForModal.job_location || 'Location not specified'}</span>
                         </span>
                       </div>

                                             {/* Pay & Hours */}
                       <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                         <div className="flex items-center gap-4">
                           <div className="bg-gradient-to-r from-green-500/20 to-green-600/20 rounded-xl px-4 py-2 border border-green-500/30">
                             <div className="text-lg font-bold text-green-400">£{selectedJobForModal.hourly_pay || 'TBD'}<span className="text-sm font-medium">/hr</span></div>
                           </div>
                           <div className="bg-gradient-to-r from-blue-500/20 to-blue-600/20 rounded-xl px-4 py-2 border border-blue-500/30">
                             <div className="text-sm font-medium text-blue-400">{selectedJobForModal.hours_per_week || 'Flexible'} hours/week</div>
                           </div>
                           <div className="bg-gradient-to-r from-orange-500/20 to-orange-600/20 rounded-xl px-4 py-2 border border-orange-500/30">
                                                            <div className="text-sm font-medium text-orange-400">
                                 {console.log('Application count in modal:', selectedJobForModal.application_count, 'Type:', typeof selectedJobForModal.application_count)} {/* Debug log */}
                                 {selectedJobForModal.application_count || 0} {Number(selectedJobForModal.application_count || 0) === 1 ? 'applicant' : 'applicants'}
                               </div>
                           </div>
                         </div>
                                                   <span className="px-3 py-1 text-sm bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded-full font-medium shadow-sm w-fit">
                            {selectedJobForModal.job_category || 'General'}
                          </span>
                       </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Content Section */}
            <div className="flex-grow overflow-y-auto p-6 pb-3">
              <div className="space-y-2">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <h3 className="text-lg font-semibold text-white">Job Description</h3>
                </div>
                
                <div className="bg-gray-800/50 rounded-xl p-3 border border-gray-700/50">
                  <div className="text-gray-300 leading-relaxed text-sm whitespace-pre-wrap">
                    {selectedJobForModal.job_description}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Redesigned Applicants Modal - World Class UX/UI */}
      {isApplicantsModalOpen && selectedJobForApplicants && (
        <div 
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setIsApplicantsModalOpen(false)}
        >
          <div 
            className="bg-gray-900 rounded-3xl shadow-2xl max-w-4xl w-full h-[90vh] flex flex-col border border-gray-800"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modern Header */}
            <div className="bg-gray-800 p-6 border-b border-gray-700 flex-shrink-0 rounded-t-3xl">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-500/20 rounded-2xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 01 5.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-1">{selectedJobForApplicants.title}</h2>
                    <p className="text-gray-400 text-sm">
                      {selectedJobForApplicants.applicants?.length || 0} 
                      {selectedJobForApplicants.applicants?.length === 1 ? ' applicant' : ' applicants'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsApplicantsModalOpen(false)}
                  className="w-10 h-10 bg-gray-700/50 hover:bg-gray-600/50 rounded-full flex items-center justify-center transition-all duration-200 group"
                >
                  <svg className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              {/* Search and Filter Controls */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search applicants..."
                      value={applicantSearchTerm}
                      onChange={(e) => setApplicantSearchTerm(e.target.value)}
                      className="w-full bg-gray-700/50 border border-gray-600/50 rounded-xl px-4 py-2 pl-10 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500/50 focus:bg-gray-700"
                    />
                    <svg className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="last24hours"
                    checked={showLast24Hours}
                    onChange={(e) => setShowLast24Hours(e.target.checked)}
                    className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
                  />
                  <label htmlFor="last24hours" className="text-sm text-gray-300 whitespace-nowrap">
                    Last 24 hours
                  </label>
                </div>
              </div>
            </div>
            
            {/* Scrollable Content - Fixed Height */}
            <div className="flex-1 overflow-y-auto p-6 min-h-0">
              {(() => {
                const filteredApplicants = selectedJobForApplicants.applicants ? selectedJobForApplicants.applicants
                  .filter(applicant => {
                    // Search filter - search all fields
                    const searchTerm = applicantSearchTerm.toLowerCase();
                    const matchesSearch = !searchTerm || 
                      applicant.name.toLowerCase().includes(searchTerm) ||
                      applicant.email.toLowerCase().includes(searchTerm) ||
                      applicant.university.toLowerCase().includes(searchTerm) ||
                      applicant.phone.toLowerCase().includes(searchTerm) ||
                      (applicant.message && applicant.message.toLowerCase().includes(searchTerm)) ||
                      new Date(applicant.appliedDate).toLocaleDateString().toLowerCase().includes(searchTerm);
                    
                    // Date filter (last 24 hours)
                    const matchesDate = !showLast24Hours || (() => {
                      const now = new Date();
                      const appliedDate = new Date(applicant.appliedDate);
                      const hoursDiff = (now.getTime() - appliedDate.getTime()) / (1000 * 60 * 60);
                      return hoursDiff <= 24;
                    })();
                    
                    return matchesSearch && matchesDate;
                  }) : [];

                if (!selectedJobForApplicants.applicants || selectedJobForApplicants.applicants.length === 0) {
                  // No applicants at all
                  return (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <div className="w-20 h-20 bg-gray-700/30 rounded-full flex items-center justify-center mx-auto mb-6">
                          <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 01-5.356 1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-3">No applicants for this job</h3>
                        <p className="text-gray-400 text-lg">This job hasn't received any applications yet.</p>
                      </div>
                    </div>
                  );
                } else if (filteredApplicants.length === 0) {
                  // Has applicants but none match filter
                  return (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <div className="w-20 h-20 bg-gray-700/30 rounded-full flex items-center justify-center mx-auto mb-6">
                          <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                          </svg>
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-3">
                          {applicantSearchTerm ? `No applicant available with "${applicantSearchTerm}"` : 'No applicants match the selected filters'}
                        </h3>
                        <p className="text-gray-400 text-lg">Try adjusting your search or filter criteria.</p>
                      </div>
                    </div>
                  );
                } else {
                  // Show filtered applicants
                  return (
                    <div className="space-y-6">
                      {filteredApplicants.map((applicant, index) => (
                    <div key={applicant.id} className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/30 hover:border-gray-600/50 transition-all duration-300">
                      {/* Applicant Header */}
                      <div className="flex items-start justify-between mb-6">
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 rounded-2xl overflow-hidden bg-gradient-to-br from-gray-600/20 to-gray-500/20 flex items-center justify-center">
                            {applicant.image ? (
                              console.log("DEBUG: applicant.image value in modal:", applicant.image),
                              <img 
                                src={applicant.image} 
                                alt={applicant.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <svg className="w-7 h-7 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                            )}
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-white">{applicant.name}</h3>
                          </div>
                        </div>
                        
                        {/* Status Badge */}
                        <div className={`px-4 py-2 rounded-full border ${
                          applicant.status === 'hired' ? 'bg-green-500/20 border-green-500/30 text-green-400' :
                          applicant.status === 'rejected' ? 'bg-red-500/20 border-red-500/30 text-red-400' :
                          applicant.status === 'cancelled' ? 'bg-gray-500/20 border-gray-500/30 text-gray-400' :
                          'bg-blue-500/20 border-blue-500/30 text-blue-400'
                        }`}>
                          <span className="text-sm font-semibold flex items-center gap-2">
                            {applicant.status === 'pending' ? 'Applied' :
                             applicant.status === 'applied' ? 'Applied' :
                             applicant.status === 'hired' ? 'Hired' :
                             applicant.status === 'rejected' ? 'Declined' :
                             applicant.status === 'cancelled' ? 'Cancelled' :
                             applicant.status}
                            {applicant.status === 'hired' && applicant.confirmed && (
                              <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            )}
                          </span>
                        </div>
                      </div>

                      {/* Contact Information Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div className="space-y-3">
                          <div className="flex items-center gap-3 p-3 bg-gray-700/30 rounded-xl">
                            <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                              <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                              </svg>
                            </div>
                            <div className="flex-1">
                              <p className="text-xs text-gray-400 mb-1">Email</p>
                              <p className="text-white font-medium">{applicant.email}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-3 p-3 bg-gray-700/30 rounded-xl">
                            <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
                              <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                              </svg>
                            </div>
                            <div className="flex-1">
                              <p className="text-xs text-gray-400 mb-1">Phone</p>
                              <p className="text-white font-medium">{applicant.phone}</p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-3">
                          <div className="flex items-center gap-3 p-3 bg-gray-700/30 rounded-xl">
                            <div className="w-8 h-8 bg-gray-500/20 rounded-lg flex items-center justify-center">
                              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a4 4 0 118 0v4m-4 8a2 2 0 100-4 2 2 0 000 4zm0 0v4m-4-8a2 2 0 100-4 2 2 0 000 4zm8 0a2 2 0 100-4 2 2 0 000 4z" />
                              </svg>
                            </div>
                            <div className="flex-1">
                              <p className="text-xs text-gray-400 mb-1">University</p>
                              <p className="text-white font-medium">{applicant.university}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-3 p-3 bg-gray-700/30 rounded-xl">
                            <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                              <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            </div>
                            <div className="flex-1">
                              <p className="text-xs text-gray-400 mb-1">Applied Date</p>
                              <p className="text-white font-medium">{new Date(applicant.appliedDate).toLocaleDateString()}</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Application Message */}
                      {applicant.message && (
                        <div className="mb-6">
                          <div className="bg-gradient-to-r from-gray-700/20 to-gray-600/20 rounded-xl p-4 border border-gray-600/30">
                            <div className="flex items-center gap-2 mb-3">
                              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                              </svg>
                              <h4 className="text-sm font-semibold text-gray-300">Application Message</h4>
                            </div>
                            <p className="text-gray-200 leading-relaxed">{applicant.message}</p>
                          </div>
                        </div>
                      )}

                      {/* Hire Confirmation Section */}
                      {applicant.studentOutcome === 'hired' && !applicant.confirmed && (
                        <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/30 rounded-xl p-4 mb-6">
                          <div className="flex items-center gap-2 mb-3">
                            <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.732 15.5c-.77.833.192 2.5 1.732 2.5z" />
                            </svg>
                            <h4 className="text-sm font-semibold text-yellow-400">Student marked as hired - Confirm?</h4>
                          </div>
                          <div className="flex gap-3">
                            <Button
                              onClick={() => handleEmployerConfirmHire(true, applicant.id)}
                              className="bg-green-600 hover:bg-green-500 text-white px-6 py-2 rounded-lg font-medium transition-all duration-200"
                            >
                              ✓ Confirm Hire
                            </Button>
                            <Button
                              onClick={() => handleEmployerConfirmHire(false, applicant.id)}
                              className="bg-red-600 hover:bg-red-500 text-white px-6 py-2 rounded-lg font-medium transition-all duration-200"
                            >
                              ✗ Decline
                            </Button>
                          </div>
                        </div>
                      )}

                      {/* Action Buttons */}
                      {!(applicant.studentOutcome === 'hired' && !applicant.confirmed) && (
                        <div className="flex items-center gap-3 pt-4 border-t border-gray-700/50">
                          <Button
                            onClick={() => handleRejectApplicant(applicant.id)}
                            className="bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-600/30 hover:border-red-600/50 px-6 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            Reject
                          </Button>
                        </div>
                      )}
                    </div>
                      ))}
                    </div>
                  );
                }
              })()}
  
            </div>
          </div>
        </div>
      )}

      <footer className="w-full py-10 bg-gray-900 text-white mt-16 shadow-lg">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="grid gap-10 lg:grid-cols-4 text-center lg:text-left">
            <div>
              <h3 className="font-bold text-xl mb-4 text-blue-300">StudentJobs UK</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Connecting UK students with flexible part-time opportunities, building careers one step at a time.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-lg mb-4 text-blue-300">For Students</h4>
              <nav className="flex flex-col space-y-3 text-sm">
                <Link href="/browse-jobs" className="text-gray-400 hover:text-white transition-colors"><span>Browse Jobs</span></Link>
                <Link href="/how-it-works" className="text-gray-400 hover:text-white transition-colors"><span>How It Works</span></Link>
                <Link href="/student-guide" className="text-gray-400 hover:text-white transition-colors"><span>Student Guide</span></Link>
              </nav>
            </div>
            <div>
              <h4 className="font-semibold text-lg mb-4 text-blue-300">For Employers</h4>
              <nav className="flex flex-col space-y-3 text-sm">
                <Link href="/post-job" className="text-gray-400 hover:text-white transition-colors"><span>Post a Job</span></Link>
                <Link href="/pricing" className="text-gray-400 hover:text-white transition-colors"><span>Pricing</span></Link>
                <Link href="/employer-guide" className="text-gray-400 hover:text-white transition-colors"><span>Employer Guide</span></Link>
              </nav>
            </div>
            <div>
              <h4 className="font-semibold text-lg mb-4 text-blue-300">Legal & Support</h4>
              <nav className="flex flex-col space-y-3 text-sm">
                <Link href="/privacy" className="text-gray-400 hover:text-white transition-colors" target="_blank" rel="noopener noreferrer"><span>Privacy Policy</span></Link>
                <Link href="/terms" className="text-gray-400 hover:text-white transition-colors" target="_blank" rel="noopener noreferrer"><span>Terms & Conditions</span></Link>
                <Link href="/refund-policy" className="text-gray-400 hover:text-white transition-colors" target="_blank" rel="noopener noreferrer"><span>Refund Policy</span></Link>
                <ContactModal>
                  <button className="text-gray-400 hover:text-white text-sm text-left w-full pl-0 transition-colors">
                    <span>Contact Us</span>
                  </button>
                </ContactModal>
              </nav>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-gray-800 text-center text-sm text-gray-500">
            © {new Date().getFullYear()} StudentJobs UK. All rights reserved.
          </div>
        </div>
      </footer>

      {/* Employer Confirmation Modal for Student Hire */}
      {showEmployerConfirmation && pendingHiredApplication && user?.user_type === "employer" && (
        <AlertDialog open={showEmployerConfirmation} onOpenChange={setShowEmployerConfirmation}>
          <AlertDialogContent className="max-w-md p-6 bg-gray-800 border-gray-700 text-gray-100">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-2xl font-bold text-white">Confirm Student Hire</AlertDialogTitle>
              <AlertDialogDescription className="text-gray-400">
                A student has marked themselves as hired for the job "{pendingHiredApplication.title}". 
                Do you want to confirm this hire?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="flex justify-end gap-3 mt-6">
              <AlertDialogCancel 
                onClick={() => handleEmployerConfirmHire(false)}
                className="px-5 py-2 rounded-md border border-gray-600 text-white bg-gray-600 hover:bg-gray-500 transition duration-150"
              >
                Decline
              </AlertDialogCancel>
              <AlertDialogAction 
                onClick={() => handleEmployerConfirmHire(true)}
                className="bg-green-600 hover:bg-green-500 px-5 py-2 rounded-md transition-colors text-white"
              >
                Confirm Hire
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}

// Export a default function that wraps MyAccountContent in a Suspense boundary
export default function MyAccountPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen w-full flex-col items-center justify-center bg-gray-950 text-gray-300">
        <svg className="animate-spin h-8 w-8 text-blue-500 mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p className="text-lg">Loading account details...</p>
      </div>
    }>
      <MyAccountContent />
    </Suspense>
  );
}