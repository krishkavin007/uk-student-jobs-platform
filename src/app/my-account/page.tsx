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
}

interface Applicant {
  id: number;
  name: string;
  email: string;
  university: string;
  appliedDate: string;
  status: "pending" | "contacted" | "rejected";
  message: string;
  phone: string;
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

  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [showDataDialog, setShowDataDialog] = useState(false);

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
  useEffect(() => {
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
                    const applicationsArray = applicationsData.applications || applicationsData;
                    applications = applicationsArray.map((app: any) => ({
                      id: app.application_id,
                      name: `${app.user_first_name} ${app.user_last_name}`,
                      email: app.user_email,
                      university: app.university_college || 'Not specified',
                      appliedDate: new Date(app.applied_at).toLocaleDateString(),
                      status: app.application_status,
                      message: app.application_message || 'No message provided',
                      phone: app.contact_phone_number || 'Not provided'
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
                  applications: applicationCount,
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

    fetchPostedJobs();
  }, [user]);

  // Fetch applied jobs for students
  useEffect(() => {
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
              status: app.application_status === 'pending' ? 'Pending' : 
                     app.application_status === 'contacted' ? 'Contacted' : 
                     app.application_status === 'rejected' ? 'Declined' : 
                     app.application_status === 'withdrawn' ? 'Withdrawn' : 'Pending',
              studentOutcome: app.student_outcome || 'pending',
              employerPhone: app.employer_phone || 'Not provided',
              employerEmail: app.employer_email || 'Not provided',
              isContactInfoRevealed: true, // Since they applied, they have access to contact info
              jobId: app.job_id
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

    fetchAppliedJobs();
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
          setPostedJobs(prevJobs => prevJobs.map(job =>
            job.id === jobId ? { ...job, status: "filled" } : job
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
          setPostedJobs(prevJobs => prevJobs.map(job =>
            job.id === jobId ? { ...job, status: "removed" } : job
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

      console.log(`Applicant ${applicationId} rejected successfully`);
      alert('Applicant rejected successfully!');
    } catch (error) {
      console.error('Error rejecting applicant:', error);
      alert('Failed to reject applicant. Please try again.');
    }
  };

  const handleViewJob = async (jobId: number) => {
    try {
      const response = await fetch(`/api/job/${jobId}`, {
        credentials: 'include'
      });

      if (response.status === 404) {
        // Job not found - likely removed or filled
        setSelectedJobForModal({
          job_title: 'Job No Longer Available',
          contact_name: 'N/A',
          job_description: 'This job posting has been removed or is no longer available.',
          job_location: 'N/A',
          job_category: 'N/A',
          hourly_pay: 'N/A',
          hours_per_week: 'N/A',
          contact_phone: 'N/A',
          contact_email: 'N/A',
          is_sponsored: false,
          is_removed: true
        });
        setIsJobModalOpen(true);
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to fetch job details');
      }

      const jobData = await response.json();
      
      // Check if job is inactive (filled, removed, or expired)
      if (jobData.job_status && jobData.job_status !== 'active') {
        // Job is in post history - show inactive message
        setSelectedJobForModal({
          job_title: 'Job No Longer Available',
          contact_name: 'N/A',
          job_description: `This job posting is no longer active. Status: ${jobData.job_status === 'filled' ? 'Position Filled' : jobData.job_status === 'removed' ? 'Job Removed' : 'Job Expired'}.`,
          job_location: 'N/A',
          job_category: 'N/A',
          hourly_pay: 'N/A',
          hours_per_week: 'N/A',
          contact_phone: 'N/A',
          contact_email: 'N/A',
          is_sponsored: false,
          is_removed: true
        });
        setIsJobModalOpen(true);
        return;
      }
      
      setSelectedJobForModal(jobData);
      setIsJobModalOpen(true);
    } catch (error) {
      console.error('Error fetching job details:', error);
      alert('Failed to load job details. Please try again.');
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
            <Link href={user.user_type === "student" ? "/browse-jobs" : "/post-job"} className="text-sm font-medium text-gray-300 hover:text-blue-400 transition-colors">
              {user.user_type === "student" ? "Browse Jobs" : "Post Job"}
            </Link>
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
                    <h3 className="text-2xl font-bold text-white mb-2">Available Credits</h3>
<Badge className="text-5xl py-3 px-6 text-white font-extrabold mb-4 animate-pulse bg-transparent border-none shadow-none hover:bg-transparent hover:border-none hover:shadow-none hover:text-white">
                      {userCredits}
                    </Badge>
                    <p className="text-gray-400 mb-4">For revealing employer contact details.</p>
                    <Button onClick={() => setActiveView("credits")} className="bg-green-600 hover:bg-green-500 text-white">
                      Manage Credits
                    </Button>
                  </Card>
                  <Card className="flex flex-col items-center justify-center p-6 text-center shadow-lg hover:shadow-xl transition-shadow duration-300 bg-gray-800 border-gray-700">
                    <h3 className="text-2xl font-bold text-white mb-2">Your Applications</h3>
                    <p className="text-5xl font-extrabold text-purple-500 mb-4">{appliedJobs.filter(job => job.studentOutcome === 'pending' && job.status !== 'Declined').length}</p>
                    <p className="text-gray-400 mb-4">Active applications.</p>
                    <Button onClick={() => setActiveView("activity")} className="bg-purple-600 hover:bg-purple-500 text-white">
                      View Applications
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
                    <div className="space-y-6">
                      {isLoadingAppliedJobs ? (
                        <div className="p-8 text-center bg-gray-900 rounded-lg border border-dashed border-gray-700">
                          <p className="text-lg text-gray-400">Loading your applications...</p>
                        </div>
                      ) : appliedJobs.length > 0 ? (
                        <>
                          {/* Active Applications Section */}
                          <div>
                            <div className="flex items-center justify-between mb-4">
                              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                Active Applications
                                <Badge className="ml-2 bg-blue-900 text-blue-300">
                                  {appliedJobs.filter(job => job.studentOutcome === 'pending' && job.status !== 'Declined').length}
                                </Badge>
                              </h3>
                            </div>
                            <div className="grid gap-3">
                              {appliedJobs.filter(job => job.studentOutcome === 'pending' && job.status !== 'Declined').length > 0 ? (
                                appliedJobs.filter(job => job.studentOutcome === 'pending' && job.status !== 'Declined').map((job) => (
                                  <Card key={job.id} className="bg-gray-900 border-gray-700 hover:bg-gray-850 transition-colors">
                                    <CardContent className="p-4">
                                      {/* Header Row */}
                                      <div className="flex items-start justify-between mb-3">
                                        <div className="flex-1 min-w-0">
                                          <div className="flex items-center gap-2 mb-1">
                                            <h4 className="font-semibold text-white truncate">{job.title}</h4>
                                            <Badge className="flex-shrink-0 text-xs">
                                              {job.status}
                                            </Badge>
                                          </div>
                                          <p className="text-sm text-gray-400">{job.company}</p>
                                          <p className="text-xs text-gray-500">Applied: {job.appliedDate}</p>
                                        </div>
                                        <div className="flex items-center gap-2 flex-shrink-0">
                                          <Button
                                            size="sm"
                                            variant="outline"
                                            className="text-blue-400 border-blue-700 hover:bg-blue-900 h-8 px-3"
                                            onClick={() => handleViewJob(job.jobId)}
                                          >
                                            View
                                          </Button>
                                        </div>
                                      </div>

                                      {/* Contact Info Section */}
                                      {job.studentOutcome !== 'withdrawn' && job.isContactInfoRevealed && (
                                        <div className="bg-gray-800 rounded-lg p-3 mb-3">
                                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-sm">
                                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                                              <span className="text-green-400">📞 {job.employerPhone}</span>
                                              <span className="text-blue-400">📧 {job.employerEmail}</span>
                                            </div>
                                            <div className="flex gap-3">
                                              <Button
                                                size="sm"
                                                variant="outline"
                                                className="text-green-400 border-green-700 hover:bg-green-900 h-7 px-2 text-xs"
                                                onClick={() => window.open(`tel:${job.employerPhone}`, '_self')}
                                              >
                                                Call
                                              </Button>
                                              <Button
                                                size="sm"
                                                variant="outline"
                                                className="text-blue-400 border-blue-700 hover:bg-blue-900 h-7 px-2 text-xs"
                                                onClick={() => window.open(`mailto:${job.employerEmail}`, '_self')}
                                              >
                                                Email
                                              </Button>
                                            </div>
                                          </div>
                                        </div>
                                      )}

                                      {/* Action Buttons */}
                                      {job.studentOutcome !== 'withdrawn' && (
                                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                          {!job.isContactInfoRevealed ? (
                                            <Button
                                              size="sm"
                                              variant="outline"
                                              className="text-blue-400 border-blue-700 hover:bg-blue-900"
                                              onClick={() => handleRevealContactInfo(job.id)}
                                            >
                                              Reveal Contact (1 Credit)
                                            </Button>
                                          ) : (
                                            <div className="flex flex-wrap gap-2">
                                              <Button
                                                size="sm"
                                                variant="outline"
                                                className="text-green-400 border-green-700 hover:bg-green-900"
                                                onClick={() => handleUpdateApplicationOutcome(job.id, 'got_job')}
                                              >
                                                Got Job
                                              </Button>
                                              <Button
                                                size="sm"
                                                variant="outline"
                                                className="text-red-400 border-red-700 hover:bg-red-900"
                                                onClick={() => handleUpdateApplicationOutcome(job.id, 'not_got_job')}
                                              >
                                                Not Got Job
                                              </Button>
                                              <Button
                                                size="sm"
                                                variant="outline"
                                                className="text-yellow-400 border-yellow-700 hover:bg-yellow-900"
                                                onClick={() => handleUpdateApplicationOutcome(job.id, 'withdrawn')}
                                              >
                                                Withdraw
                                              </Button>
                                            </div>
                                          )}
                                        </div>
                                      )}
                                    </CardContent>
                                  </Card>
                                ))
                              ) : (
                                <div className="p-6 text-center bg-gray-900 rounded-lg border border-dashed border-gray-700">
                                  <p className="text-gray-400">No active applications.</p>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Application History Section */}
                          <div>
                            <div className="flex items-center justify-between mb-4">
                              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                                <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                                Application History
                                <Badge className="ml-2 bg-gray-700 text-gray-300">
                                  {appliedJobs.filter(job => job.studentOutcome !== 'pending' || job.status === 'Declined').length}
                                </Badge>
                              </h3>
                            </div>
                            <div className="grid gap-3">
                              {appliedJobs.filter(job => job.studentOutcome !== 'pending' || job.status === 'Declined').length > 0 ? (
                                appliedJobs.filter(job => job.studentOutcome !== 'pending' || job.status === 'Declined').map((job) => (
                                  <Card key={job.id} className="bg-gray-900 border-gray-700 hover:bg-gray-850 transition-colors">
                                    <CardContent className="p-4">
                                      {/* Header Row */}
                                      <div className="flex items-start justify-between mb-3">
                                        <div className="flex-1 min-w-0">
                                          <div className="flex items-center gap-2 mb-1">
                                            <h4 className="font-semibold text-white truncate">{job.title}</h4>
                                            <Badge className={`flex-shrink-0 text-xs ${
                                              job.studentOutcome === 'got_job' ? 'bg-green-900 text-green-300' :
                                              job.studentOutcome === 'not_got_job' ? 'bg-red-900 text-red-300' :
                                              job.studentOutcome === 'withdrawn' ? 'bg-yellow-900 text-yellow-300' :
                                              'bg-gray-700 text-gray-300'
                                            }`}>
                                              {job.studentOutcome === 'got_job' ? 'Got Job' :
                                               job.studentOutcome === 'not_got_job' ? 'Not Got Job' :
                                               job.studentOutcome === 'withdrawn' ? 'Withdrawn' :
                                               job.studentOutcome}
                                            </Badge>
                                          </div>
                                          <p className="text-sm text-gray-400">{job.company}</p>
                                          <p className="text-xs text-gray-500">Applied: {job.appliedDate}</p>
                                        </div>
                                        <div className="flex items-center gap-2 flex-shrink-0">
                                          <Button
                                            size="sm"
                                            variant="outline"
                                            className="text-blue-400 border-blue-700 hover:bg-blue-900 h-8 px-3"
                                            onClick={() => handleViewJob(job.jobId)}
                                          >
                                            View
                                          </Button>
                                        </div>
                                      </div>

                                      {/* Contact Info Section - Only for non-withdrawn */}
                                      {job.studentOutcome !== 'withdrawn' && job.isContactInfoRevealed && (
                                        <div className="bg-gray-800 rounded-lg p-3">
                                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-sm">
                                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                                              <span className="text-green-400">📞 {job.employerPhone}</span>
                                              <span className="text-blue-400">📧 {job.employerEmail}</span>
                                            </div>
                                            <div className="flex gap-3">
                                              <Button
                                                size="sm"
                                                variant="outline"
                                                className="text-green-400 border-green-700 hover:bg-green-900 h-7 px-2 text-xs"
                                                onClick={() => window.open(`tel:${job.employerPhone}`, '_self')}
                                              >
                                                Call
                                              </Button>
                                              <Button
                                                size="sm"
                                                variant="outline"
                                                className="text-blue-400 border-blue-700 hover:bg-blue-900 h-7 px-2 text-xs"
                                                onClick={() => window.open(`mailto:${job.employerEmail}`, '_self')}
                                              >
                                                Email
                                              </Button>
                                            </div>
                                          </div>
                                        </div>
                                      )}
                                    </CardContent>
                                  </Card>
                                ))
                              ) : (
                                <div className="p-6 text-center bg-gray-900 rounded-lg border border-dashed border-gray-700">
                                  <p className="text-gray-400">No application history.</p>
                                </div>
                              )}
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="p-8 text-center bg-gray-900 rounded-lg border border-dashed border-gray-700">
                          <p className="text-lg text-gray-400">You haven't applied for any jobs yet.</p>
                          <Link href="/browse-jobs">
                            <Button className="mt-4 bg-blue-600 hover:bg-blue-500 text-white">Browse Available Jobs</Button>
                          </Link>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-8">
                      {isLoadingPostedJobs ? (
                        <div className="p-8 text-center bg-gray-900 rounded-lg border border-dashed border-gray-700">
                          <p className="text-lg text-gray-400">Loading your job postings...</p>
                        </div>
                      ) : postedJobs.filter(job => job.status === "active").length > 0 || postedJobs.filter(job => job.status === "filled" || job.status === "removed").length > 0 ? (
                        <>
                                                     {/* Active Jobs Section */}
                           <div>
                             <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                               <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                               Active Job Postings
                             </h3>
                             <div className="space-y-4">
                               {postedJobs.filter(job => job.status === "active").length > 0 ? (
                                 postedJobs.filter(job => job.status === "active").map((job) => (
                                <Card key={job.id} className="shadow-sm hover:shadow-md transition-shadow duration-200 bg-gray-900 border-gray-700">
                                  <CardContent className="p-5">
                                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4">
                                      <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                          <h4 className="font-semibold text-xl text-white">{job.title}</h4>
                                          {job.sponsored && (
                                            <Badge className="bg-yellow-900 text-yellow-300 px-2 py-1 rounded-full text-xs">
                                              Sponsored
                                            </Badge>
                                          )}
                                        </div>
                                        <p className="text-sm text-gray-400">
                                          Posted: {job.postedDate} • Expires: {job.expiryDate}
                                        </p>
                                        <p className="text-sm text-blue-400 font-medium mt-1">{job.applications} applications received</p>
                                      </div>
                                      <div className="flex flex-wrap gap-2 lg:justify-end">
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={() => handleEditJob(job)}
                                          className="text-gray-300 border-gray-600 hover:bg-gray-700 transition-colors"
                                        >
                                          Edit
                                        </Button>

                                        <AlertDialog>
                                          <AlertDialogTrigger asChild>
                                            <Button
                                              size="sm"
                                              variant="outline"
                                              className="text-green-400 border-green-700 hover:bg-green-900 transition-colors"
                                              disabled={removingJobId === job.id}
                                            >
                                              {removingJobId === job.id ? "Marking..." : "Mark as Filled"}
                                            </Button>
                                          </AlertDialogTrigger>
                                          <AlertDialogContent className="bg-gray-800 border-gray-700 text-gray-100">
                                            <AlertDialogHeader>
                                              <AlertDialogTitle className="text-white">Mark Position as Filled</AlertDialogTitle>
                                              <AlertDialogDescription className="text-gray-400">
                                                Congratulations! This will move your job to post history since you've found an employee. The job will no longer be visible to students.
                                              </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                              <AlertDialogCancel className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white">Cancel</AlertDialogCancel>
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
                                              className="text-red-400 border-red-700 hover:bg-red-900 transition-colors"
                                              disabled={removingJobId === job.id}
                                            >
                                              {removingJobId === job.id ? "Removing..." : "Remove Job"}
                                            </Button>
                                          </AlertDialogTrigger>
                                          <AlertDialogContent className="bg-gray-800 border-gray-700 text-gray-100">
                                            <AlertDialogHeader>
                                              <AlertDialogTitle className="text-white">Remove Job Posting</AlertDialogTitle>
                                              <AlertDialogDescription className="text-gray-400">
                                                Are you sure you want to permanently remove this job posting? This action cannot be undone.
                                              </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                              <AlertDialogCancel className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white">Cancel</AlertDialogCancel>
                                              <AlertDialogAction
                                                onClick={() => handleRemoveJob(job.id, "removed")}
                                                className="bg-red-600 hover:bg-red-500 text-white"
                                              >
                                                Remove Job
                                              </AlertDialogAction>
                                            </AlertDialogFooter>
                                          </AlertDialogContent>
                                        </AlertDialog>
                                      </div>
                                                                         </div>

                              <Separator className="my-4 bg-gray-700" />

                              <div>
                                <h5 className="font-medium text-gray-200 mb-3">Applicants ({job.applications}):</h5>
                                <div className="space-y-4">
                                  {job.applicants.length > 0 ? (
                                    job.applicants
                                      .sort((a, b) => {
                                        // Sort by status: pending first, then contacted, then rejected
                                        const statusOrder = { pending: 1, contacted: 2, rejected: 3 };
                                        return (statusOrder[a.status as keyof typeof statusOrder] || 4) - (statusOrder[b.status as keyof typeof statusOrder] || 4);
                                      })
                                      .map((applicant) => (
                                      <div key={applicant.id} className="bg-gray-800 rounded-lg p-4 border border-gray-700 shadow-inner">
                                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
                                          <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                              <p className="font-medium text-white">{applicant.name}</p>
                                              <Badge
                                                className={`px-2 py-0.5 rounded-full text-xs ${applicant.status === "contacted" ? "bg-green-900 text-green-300" :
                                                  applicant.status === "rejected" ? "bg-red-900 text-red-300" : "bg-gray-700 text-gray-300"}`}
                                              >
                                                {applicant.status}
                                              </Badge>
                                            </div>
                                            <p className="text-sm text-gray-400">{applicant.email}</p>
                                            <p className="text-sm text-green-400">Phone: {applicant.phone}</p>
                                            <p className="text-sm text-blue-400">{applicant.university}</p>
                                            <p className="text-xs text-gray-500">Applied: {applicant.appliedDate}</p>
                                            

                                          </div>
                                          <div className="flex flex-wrap gap-2 flex-shrink-0">
                                            {applicant.status === "pending" && (
                                              <>
                                                {applicant.phone !== 'Not provided' && (
                                                  <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="text-green-400 border-green-700 hover:bg-green-900 transition-colors"
                                                    onClick={() => window.open(`tel:${applicant.phone}`, '_self')}
                                                  >
                                                    Call
                                                  </Button>
                                                )}
                                                <Button
                                                  size="sm"
                                                  variant="outline"
                                                  className="text-blue-400 border-blue-700 hover:bg-blue-900 transition-colors"
                                                  onClick={() => window.open(`mailto:${applicant.email}`, '_self')}
                                                >
                                                  Email
                                                </Button>
                                                <Button 
                                                  size="sm" 
                                                  variant="outline" 
                                                  className="text-red-400 border-red-700 hover:bg-red-900"
                                                  onClick={() => handleRejectApplicant(applicant.id)}
                                                >
                                                  Reject
                                                </Button>
                                              </>
                                            )}
                                            {applicant.status === "contacted" && (
                                              <>
                                                {applicant.phone !== 'Not provided' && (
                                                  <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="text-green-400 border-green-700 hover:bg-green-900 transition-colors"
                                                    onClick={() => window.open(`tel:${applicant.phone}`, '_self')}
                                                  >
                                                    Call
                                                  </Button>
                                                )}
                                                <Button
                                                  size="sm"
                                                  variant="outline"
                                                  className="text-blue-400 border-blue-700 hover:bg-blue-900 transition-colors"
                                                  onClick={() => window.open(`mailto:${applicant.email}`, '_self')}
                                                >
                                                  Email
                                                </Button>
                                                <Button size="sm" variant="outline" disabled className="text-gray-500 border-gray-700">
                                                  ✓ Contacted
                                                </Button>
                                              </>
                                            )}
                                            {applicant.status === "rejected" && (
                                              <>
                                                {applicant.phone !== 'Not provided' && (
                                                  <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="text-green-400 border-green-700 hover:bg-green-900 transition-colors"
                                                    onClick={() => window.open(`tel:${applicant.phone}`, '_self')}
                                                  >
                                                    Call
                                                  </Button>
                                                )}
                                                <Button
                                                  size="sm"
                                                  variant="outline"
                                                  className="text-blue-400 border-blue-700 hover:bg-blue-900 transition-colors"
                                                  onClick={() => window.open(`mailto:${applicant.email}`, '_self')}
                                                >
                                                  Email
                                                </Button>
                                                <Button size="sm" variant="outline" disabled className="text-gray-500 border-gray-700">
                                                  ✗ Rejected
                                                </Button>
                                              </>
                                            )}

                                          </div>
                                        </div>

                                        <div className="mt-3 p-3 bg-gray-900 rounded border border-gray-700 shadow-sm">
                                          <p className="text-sm font-medium text-gray-300 mb-1">Application Message:</p>
                                          <p className="text-sm text-gray-400">{applicant.message}</p>
                                        </div>
                                      </div>
                                    ))
                                  ) : (
                                    <div className="p-6 text-center bg-gray-900 rounded-lg border border-dashed border-gray-700">
                                      <p className="text-md text-gray-400">No applicants yet for this job.</p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                                 ))
                               ) : (
                                 <div className="p-6 text-center bg-gray-900 rounded-lg border border-dashed border-gray-700">
                                   <p className="text-md text-gray-400">No active job postings.</p>
                                 </div>
                               )}
                             </div>
                           </div>

                           {/* Post History Section */}
                           {postedJobs.filter(job => job.status === "filled" || job.status === "removed" || job.status === "expired").length > 0 && (
                             <div>
                               <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                 <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                                 Post History
                               </h3>
                               <div className="space-y-4">
                                 {postedJobs.filter(job => job.status === "filled" || job.status === "removed" || job.status === "expired").map((job) => (
                                   <Card key={job.id} className="shadow-sm hover:shadow-md transition-shadow duration-200 bg-gray-800 border-gray-600">
                                     <CardContent className="p-5">
                                       <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                                         <div className="flex-1">
                                           <div className="flex items-center gap-2 mb-1">
                                             <h4 className="font-semibold text-lg text-gray-200">{job.title}</h4>
                                             {job.sponsored && (
                                               <Badge className="bg-yellow-900 text-yellow-300 px-2 py-1 rounded-full text-xs">
                                                 Sponsored
                                               </Badge>
                                             )}
                                           </div>
                                           <p className="text-sm text-gray-400">
                                             Posted: {job.postedDate} • Expired: {job.expiryDate}
                                           </p>
                                           <p className="text-sm text-blue-400 font-medium mt-1">{job.applications} applications received</p>
                                         </div>
                                         <div className="flex flex-wrap gap-2 lg:justify-end">
                                           <Button
                                             size="sm"
                                             variant="outline"
                                             onClick={() => handleReactivateJob(job.id)}
                                             className="text-blue-400 border-blue-700 hover:bg-blue-900 transition-colors"
                                             disabled={removingJobId === job.id}
                                           >
                                             {removingJobId === job.id ? "Reactivating..." : "Reactivate Job"}
                                           </Button>
                                         </div>
                                       </div>
                                     </CardContent>
                                   </Card>
                                 ))}
                               </div>
                             </div>
                           )}
                         </>
                      ) : (
                        <div className="p-8 text-center bg-gray-900 rounded-lg border border-dashed border-gray-700">
                          <p className="text-lg text-gray-400">You haven't posted any jobs yet.</p>
                          <Link href="/post-job">
                            <Button className="mt-4 bg-blue-600 hover:bg-blue-500 text-white">Post Your First Job</Button>
                          </Link>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Dialog open={editingJobId !== null} onOpenChange={() => {
                setEditingJobId(null)
                setEditJobData({ title: "", description: "", applications: 0, sponsored: false })
              }}>
                <DialogContent className="max-w-lg p-6 bg-gray-800 border-gray-700 text-gray-100">
                  <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-white">Edit Job Posting</DialogTitle>
                    <DialogDescription className="text-gray-400">
                      Update your job details. Changes will be visible immediately.
                    </DialogDescription>
                  </DialogHeader>
                  {editingJobId && (() => {
                    const currentJob = postedJobs.find(j => j.id === editingJobId)
                    if (!currentJob) return null;
                    return (
                      <div className="space-y-5 mt-4">
                        <div>
                          <Label htmlFor="editTitle" className="text-sm font-medium text-gray-300">Job Title</Label>
                          <Input
                            id="editTitle"
                            value={editJobData.title}
                            onChange={(e) => setEditJobData(prev => ({ ...prev, title: e.target.value }))}
                            className="rounded-md border-gray-600 focus:border-blue-500 focus:ring-blue-500 bg-gray-700 text-gray-200 placeholder:text-gray-500"
                          />
                        </div>
                        <div>
                          <Label htmlFor="editDescription" className="text-sm font-medium text-gray-300">Job Description</Label>
                          <textarea
                            id="editDescription"
                            value={editJobData.description}
                            onChange={(e) => setEditJobData(prev => ({ ...prev, description: e.target.value }))}
                            className="w-full h-32 rounded-md border-gray-600 focus:border-blue-500 focus:ring-blue-500 bg-gray-700 text-gray-200 placeholder:text-gray-500 p-3 resize-none"
                            placeholder="Enter job description..."
                          />
                        </div>
                        <div>
                          <Label htmlFor="editApplications" className="text-sm font-medium text-gray-300">Applications Received</Label>
                          <Input
                            id="editApplications"
                            type="number"
                            value={editJobData.applications}
                            onChange={(e) => setEditJobData(prev => ({ ...prev, applications: parseInt(e.target.value) || 0 }))}
                            disabled
                            className="bg-gray-700 cursor-not-allowed rounded-md border-gray-600 text-gray-400"
                          />
                          <p className="text-xs text-gray-500 mt-1">Applications count is read-only.</p>
                        </div>

                        <div className="p-4 bg-blue-900/20 border border-blue-700 rounded-lg">
                          <div className="flex items-start space-x-3">
                            <input
                              type="checkbox"
                              id="editSponsored"
                              checked={editJobData.sponsored}
                              onChange={(e) => setEditJobData(prev => ({ ...prev, sponsored: e.target.checked }))}
                              className="mt-1 h-5 w-5 text-blue-600 border-gray-600 rounded focus:ring-blue-500 cursor-pointer bg-gray-700"
                              disabled={currentJob.sponsored}
                            />
                            <div className="flex-1">
                              <Label htmlFor="editSponsored" className="font-medium text-gray-300 cursor-pointer">
                                {currentJob.sponsored ? "Currently Sponsored" : "Upgrade to Sponsored (+£4)"}
                              </Label>
                              <p className="text-sm text-gray-400 mt-1">
                                {currentJob.sponsored
                                  ? "This job is already sponsored and appears at the top of search results."
                                  : "Move your job to the top of search results and get 3x more visibility."
                                }
                              </p>
                              {!currentJob.sponsored && editJobData.sponsored && (
                                <div className="mt-2 p-2 bg-yellow-900/20 border border-yellow-700 rounded text-sm text-yellow-300 flex items-center gap-2">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                                  </svg>
                                  <span>You'll be charged £4 to upgrade this job to sponsored.</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })()}
                  <DialogFooter className="mt-6 flex justify-end gap-3">
                    <Button variant="outline" onClick={() => {
                      setEditingJobId(null)
                      setEditJobData({ title: "", description: "", applications: 0, sponsored: false })
                    }} className="px-5 py-2 rounded-md transition-colors duration-200 border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white">
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSaveJobChanges}
                      disabled={isProcessingUpgrade}
                      className="bg-blue-600 hover:bg-blue-500 px-5 py-2 rounded-md transition-colors duration-200 text-white"
                    >
                      {isProcessingUpgrade ? 'Processing Payment...' : 'Save Changes'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
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
                  <Badge className="text-4xl py-3 px-6 rounded-full bg-blue-600 text-white font-extrabold animate-fade-in-up">
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
<AlertDialogCancel className="px-5 py-2 rounded-md border border-gray-600 text-gray-300 bg-transparent hover:brightness-110 transition duration-150">Cancel</AlertDialogCancel>
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
          className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[999] transition-opacity duration-300"
          onClick={() => setIsJobModalOpen(false)}
        >
          <div 
            className="bg-gray-900 p-6 rounded-3xl shadow-3xl max-w-lg w-full mx-4 my-8 relative flex flex-col max-h-[90vh] overflow-hidden transition-all duration-300 transform scale-100 opacity-100"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setIsJobModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-gray-800 text-gray-300 hover:bg-gray-700 transition-colors duration-200 z-10 focus:outline-none focus:ring-2 focus:ring-blue-500 active:scale-90"
              aria-label="Close job details"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="mb-3 pb-3 border-b border-gray-700 pr-8">
              <div className="flex items-center flex-wrap gap-2 mb-2">
                <h2 className="text-xl font-bold text-white leading-tight">
                  {selectedJobForModal.job_title}
                </h2>
              </div>
              {!selectedJobForModal.is_removed && (
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-gray-300 mb-2">
                  <span className="flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-gray-400">
                      <path fillRule="evenodd" d="M8.25 6.75a3.75 3.75 0 1 1 7.5 0 3.75 3.75 0 0 1-7.5 0ZM15.75 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0ZM12 18.75a.75.75 0 0 1 .75-.75h.75a.75.75 0 0 1 .75.75v1.5a.75.75 0 0 1-1.5 0v-.75h-.75a.75.75 0 0 1-.75-.75v-.75Zm-5.495-2.261A9.752 9.752 0 0 0 6 12a6 6 0 0 1 6-6h.75a.75.75 0 0 0 0-1.5H12a7.5 7.5 0 0 0-7.5 7.5c0 1.574.341 3.085.992 4.475C6.425 18.17 7.72 18.75 9 18.75h.75a.75.75 0 0 1 0 1.5H9c-1.802 0-3.52-.693-4.821-1.994A10.455 10.455 0 0 1 2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75a9.752 9.752 0 0 0-.992 4.475 7.472 7.472 0 0 1-1.282 1.832 7.5 7.5 0 0 0-6.177 1.62.75.75 0 0 1-.954-.937Z" clipRule="evenodd" />
                    </svg>
                    {selectedJobForModal.contact_name}
                  </span>
                  <span className="flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-gray-400">
                      <path fillRule="evenodd" d="m11.54 22.351.07.04.028.016a.76.76 0 0 0 .723 0l.028-.015.071-.041a8.75 8.75 0 0 0 4.721-6.786c1.294-4.507-1.697-9.078-6.75-9.078s-8.044 4.571-6.75 9.078a8.75 8.75 0 0 0 4.72 6.786ZM12 12.75a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z" clipRule="evenodd" />
                    </svg>
                    {selectedJobForModal.job_location || 'Not specified'}
                  </span>
                </div>
              )}
              {!selectedJobForModal.is_removed && (
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div className="flex items-center gap-4">
                    <div className="text-base font-bold text-green-400">£{selectedJobForModal.hourly_pay || 'Not specified'}<span className="text-sm font-medium">/hr</span></div>
                    <div className="text-sm text-gray-300">{selectedJobForModal.hours_per_week || 'Not specified'} hours/week</div>
                  </div>
                  <span className="px-2 py-1 text-xs bg-blue-900 text-blue-300 rounded-full font-medium shadow-sm self-start sm:self-auto">
                    {selectedJobForModal.job_category || 'Not specified'}
                  </span>
                </div>
              )}
            </div>

            <div className="flex-grow overflow-y-auto pr-1">
              <div className="text-gray-300 leading-relaxed text-sm">
                <p dangerouslySetInnerHTML={{ __html: selectedJobForModal.job_description.replace(/\n/g, '<br />') }} />
              </div>
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