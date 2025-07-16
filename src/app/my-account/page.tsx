"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Logo } from "@/components/ui/logo"
import { ContactModal } from "@/components/ui/contact-modal"

interface User {
  user_id: string;
  user_username: string;
  user_email: string;
  google_id?: string;
  user_type: "employer" | "student";
  organization_name?: string;
  contact_phone_number?: string;
  user_first_name?: string;
  user_last_name?: string;
  university_college?: string;
  created_at: string;
}

// Re-defining Transaction interface to match the old code's mockTransactions structure more closely
interface Transaction {
  id: number;
  date: string;
  type: string;
  description: string;
  amount: number;
  status: string;
  invoiceNumber: string;
}

// Re-defining AppliedJob interface based on the old code's structure
interface AppliedJob {
  id: number;
  title: string;
  company: string;
  appliedDate: string;
  status: string;
  employerPhone: string;
  isContactInfoRevealed: boolean;
}

// Re-defining PostedJob interface based on the old code's structure
interface Applicant {
  id: number;
  name: string;
  email: string;
  university: string;
  appliedDate: string;
  status: "pending" | "contacted" | "rejected";
  message: string;
}

interface PostedJob {
  id: number;
  title: string;
  postedDate: string;
  expiryDate: string;
  applications: number;
  sponsored: boolean;
  status: string;
  applicants: Applicant[];
}


// Removed mock data for transactions, appliedJobs, and postedJobs
// const mockTransactions: Transaction[] = []; // Will be an empty array now
// const initialAppliedJobs: AppliedJob[] = []; // Will be an empty array now
// const mockPostedJobs: PostedJob[] = []; // Will be an empty array now


export default function MyAccountPage() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("profile");

  // State variables for old code's functionality, initialized as empty or default
  const [appliedJobs, setAppliedJobs] = useState<AppliedJob[]>([]); // Now an empty array
  const [postedJobs, setPostedJobs] = useState<PostedJob[]>([]); // Now an empty array
  const [editingJobId, setEditingJobId] = useState<number | null>(null);
  const [editJobData, setEditJobData] = useState({
    title: "",
    applications: 0,
    sponsored: false
  });
  const [isProcessingUpgrade, setIsProcessingUpgrade] = useState(false);
  const [removingJobId, setRemovingJobId] = useState<number | null>(null);

  // Dialog states for settings tab
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [showDataDialog, setShowDataDialog] = useState(false);

  const router = useRouter();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch('/api/auth/me');
        if (response.ok) {
          const userData: User = await response.json();
          setUser(userData);
          // Initialize profile image with a placeholder or actual image URL if available
          setProfileImage(null);
          // In a real app, you would fetch actual applied/posted jobs here
          // For now, they remain empty arrays as per request.
        } else if (response.status === 401) {
          router.push('/login');
        } else {
          console.error('Failed to fetch user data:', response.status, response.statusText);
          router.push('/login');
        }
      } catch (error) {
        console.error('Network error or unexpected issue fetching user data:', error);
        router.push('/login');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [router]);

  const handleSaveProfile = () => {
    // In a real app, you would send this updated `user` object to your backend
    console.log("Saving profile changes for:", user);
    setIsEditingProfile(false);
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleResendVerification = (type: 'email' | 'phone') => {
    console.log(`Resending ${type} verification...`);
    // In real app, trigger verification resend
  };

  const handleDeleteAccount = () => {
    console.log("Deleting account...");
    // In real app, handle GDPR compliant account deletion
    router.push('/login'); // Redirect after deletion
  };

  const downloadReceipt = (transaction: Transaction) => {
    // Create a simple receipt document
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
    // Create a comprehensive data export
    const userData = {
      profile: user,
      // transactions: mockTransactions, // Removed mock data, actual data would be fetched
      // appliedJobs: user?.user_type === "student" ? appliedJobs : undefined, // Removed mock data
      // postedJobs: user?.user_type === "employer" ? postedJobs : undefined, // Removed mock data
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
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const handleRemoveJob = async (jobId: number, reason: "filled" | "removed") => {
    setRemovingJobId(jobId);
    // Simulate job removal process
    await new Promise(resolve => setTimeout(resolve, 1500));

    if (reason === "filled") {
      setPostedJobs(prevJobs => prevJobs.map(job =>
        job.id === jobId ? { ...job, status: "Filled" } : job
      ));
      alert('Job marked as filled and removed from listings. Congratulations on finding your employee!');
    } else {
      setPostedJobs(prevJobs => prevJobs.filter(job => job.id !== jobId));
      alert('Job post removed successfully.');
    }

    setRemovingJobId(null);
  };

  const handleEditJob = (job: PostedJob) => {
    setEditingJobId(job.id);
    setEditJobData({
      title: job.title,
      applications: job.applications,
      sponsored: job.sponsored
    });
  };

  const handleSaveJobChanges = async () => {
    const currentJob = postedJobs.find(j => j.id === editingJobId);
    const needsPayment = currentJob && !currentJob.sponsored && editJobData.sponsored;

    if (needsPayment) {
      setIsProcessingUpgrade(true);
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      alert('Payment successful! Your job has been upgraded to sponsored and will now appear at the top of search results.');
    } else {
      alert('Job updated successfully!');
    }

    setPostedJobs(prevJobs =>
      prevJobs.map(job =>
        job.id === editingJobId ? { ...job, title: editJobData.title, sponsored: editJobData.sponsored } : job
      )
    );

    setIsProcessingUpgrade(false);
    setEditingJobId(null);
    setEditJobData({ title: "", applications: 0, sponsored: false });
  };

  // Handler to reveal contact info for a specific job (student view)
  const handleRevealContactInfo = (jobId: number) => {
    setAppliedJobs(prevJobs =>
      prevJobs.map(job =>
        job.id === jobId ? { ...job, isContactInfoRevealed: true } : job
      )
    );
  };


  if (isLoading) {
    return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center">
        <p>Loading account details...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="flex min-h-screen w-full flex-col">
      {/* Header adapted from old code for alignment and URLs */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between"> {/* Use justify-between for left/right alignment */}
            <Link href="/">
              <Logo />
            </Link>
            <nav className="flex items-center gap-10"> {/* Gap-10 from old code */}
              <Link href={user.user_type === "student" ? "/browse-jobs" : "/post-job"} className="text-sm font-medium hover:underline">
                {user.user_type === "student" ? "Browse Jobs" : "Post Job"}
              </Link>
              <ContactModal isLoggedIn={!!user}>
                <button className="text-sm font-medium hover:underline"> {/* button inside ContactModal */}
                  Contact Us
                </button>
              </ContactModal>
              <Link href="/login" className="text-sm font-medium hover:underline"> {/* Old code used /login for Sign Out */}
                Sign Out
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="flex min-h-[calc(100vh_-_theme(spacing.16))] flex-1 flex-col gap-4 bg-muted/40 p-4 md:gap-8 md:p-10">
        <div className="mx-auto grid w-full max-w-6xl gap-2">
          <h1 className="text-3xl font-semibold">My Account</h1>
        </div>

        {/* Outer Tabs structure maintained from new code for vertical layout */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mx-auto grid w-full max-w-6xl items-start gap-6 md:grid-cols-[180px_1fr] lg:grid-cols-[250px_1fr]">
          {/* TabsList for vertical navigation */}
          <nav className="grid gap-4 text-sm text-muted-foreground">
            <TabsList className="flex flex-col h-auto p-2 justify-start items-start">
              <TabsTrigger value="profile" className="w-full text-left" onClick={() => setActiveTab("profile")}>Profile</TabsTrigger>
              <TabsTrigger value="activity" className="w-full text-left" onClick={() => setActiveTab("activity")}>
                {user.user_type === "student" ? "Applied Jobs" : "Posted Jobs"}
              </TabsTrigger>
              <TabsTrigger value="billing" className="w-full text-left" onClick={() => setActiveTab("billing")}>Billing</TabsTrigger>
              <TabsTrigger value="settings" className="w-full text-left" onClick={() => setActiveTab("settings")}>Settings</TabsTrigger>
            </TabsList>
          </nav>

          {/* Content area for tabs */}
          <div className="grid gap-6">
            {/* Profile Tab Content (adapted from old code) */}
            <TabsContent value="profile">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Profile Information</CardTitle>
                      <CardDescription>
                        Your personal details and verification status
                      </CardDescription>
                    </div>
                    <Button
                      variant={isEditingProfile ? "outline" : "default"}
                      onClick={() => setIsEditingProfile(!isEditingProfile)}
                    >
                      {isEditingProfile ? "Cancel" : "Edit Profile"}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Profile Image (style adapted from old code) */}
                  <div className="flex items-center gap-6">
                    <div className="relative">
                      <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                        {(profileImage) ? (
                          <img
                            src={profileImage}
                            alt="Profile Image"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="text-gray-600 text-2xl font-bold">
                            {user.user_first_name?.[0]}{user.user_last_name?.[0]}
                          </div>
                        )}
                      </div>
                    </div>
                    {isEditingProfile && (
                      <div>
                        <Label htmlFor="profileImage" className="block mb-2">Profile Image </Label>
                        <input
                          id="profileImage"
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        />
                      </div>
                    )}
                  </div>

                  {/* Verification Status (simplified as per new code's mock data) */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                      <span className="text-sm font-medium">Email Verified</span>
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        ✓ Verified
                      </Badge> {/* Assuming verified as per API success */}
                    </div>
                    <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                      <span className="text-sm font-medium">Phone Verified</span>
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        ✓ Verified
                      </Badge> {/* Assuming verified as per API success */}
                    </div>
                  </div>

                  <Separator />

                  {/* Profile Form */}
                  <div className="grid gap-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name</Label>
                        <Input
                          id="firstName"
                          value={user.user_first_name || ''}
                          onChange={(e) => setUser(prev => prev ? { ...prev, user_first_name: e.target.value } : null)}
                          disabled={!isEditingProfile}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input
                          id="lastName"
                          value={user.user_last_name || ''}
                          onChange={(e) => setUser(prev => prev ? { ...prev, user_last_name: e.target.value } : null)}
                          disabled={!isEditingProfile}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={user.user_email || ''}
                        onChange={(e) => setUser(prev => prev ? { ...prev, user_email: e.target.value } : null)}
                        disabled={!isEditingProfile}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                          id="phone"
                          value={user.contact_phone_number || ''}
                          onChange={(e) => setUser(prev => prev ? { ...prev, contact_phone_number: e.target.value } : null)}
                          disabled={!isEditingProfile}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="city">City</Label>
                        <Input
                          id="city"
                          placeholder="e.g., Manchester"
                          value={user.university_college || user.organization_name || ''} // Adjusted to use existing fields
                          onChange={(e) => user.user_type === "student" ? setUser(prev => prev ? { ...prev, university_college: e.target.value } : null) : setUser(prev => prev ? { ...prev, organization_name: e.target.value } : null)}
                          disabled={!isEditingProfile}
                        />
                      </div>
                    </div>

                    {user.user_type === "student" ? (
                      <div className="space-y-2">
                        <Label htmlFor="university">University/College</Label>
                        <Input
                          id="university"
                          value={user.university_college || ''}
                          onChange={(e) => setUser(prev => prev ? { ...prev, university_college: e.target.value } : null)}
                          disabled={!isEditingProfile}
                        />
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Label htmlFor="businessName">Business Name</Label>
                        <Input
                          id="businessName"
                          value={user.organization_name || ''}
                          onChange={(e) => setUser(prev => prev ? { ...prev, organization_name: e.target.value } : null)}
                          disabled={!isEditingProfile}
                        />
                      </div>
                    )}

                    {isEditingProfile && (
                      <div className="flex gap-2">
                        <Button onClick={handleSaveProfile} className="bg-blue-600 hover:bg-blue-700">
                          Save Changes
                        </Button>
                        <Button variant="outline" onClick={() => setIsEditingProfile(false)}>
                          Cancel
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Activity Tab Content (adapted from old code, mock data removed) */}
            <TabsContent value="activity">
              <Card>
                <CardHeader>
                  <CardTitle>
                    {user.user_type === "student" ? "Applied Jobs" : "Posted Jobs"}
                  </CardTitle>
                  <CardDescription>
                    {user.user_type === "student"
                      ? "Track your job applications and their status"
                      : "Manage your job postings and view applications"
                    }
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {user.user_type === "student" ? (
                    <div className="space-y-4">
                      {appliedJobs.length > 0 ? (
                        appliedJobs.map((job) => (
                          <div key={job.id} className="flex items-center justify-between p-4 border rounded-lg">
                            <div>
                              <h4 className="font-semibold">{job.title}</h4>
                              <p className="text-sm text-gray-600">{job.company}</p>
                              <p className="text-xs text-gray-500">Applied: {job.appliedDate}</p>
                              {/* Conditional rendering for employer phone number */}
                              {job.isContactInfoRevealed ? (
                                <p className="text-sm text-blue-600 font-medium mt-1">
                                  Employer Phone: {job.employerPhone}
                                </p>
                              ) : (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="mt-2"
                                  onClick={() => handleRevealContactInfo(job.id)}
                                >
                                  Reveal Contact Info
                                </Button>
                              )}
                            </div>
                            <div className="text-right">
                              <Badge
                                variant={job.status === "Contacted" ? "default" : job.status === "Interviewing" ? "default" : job.status === "Declined" ? "destructive" : "secondary"}
                                className={job.status === "Contacted" || job.status === "Interviewing" ? "bg-green-100 text-green-800" : job.status === "Declined" ? "bg-red-100 text-red-800" : ""}
                              >
                                {job.status}
                              </Badge>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-muted-foreground">You haven't applied for any jobs yet.</p>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {postedJobs.length > 0 ? (
                        postedJobs.map((job) => (
                          <div key={job.id} className="border rounded-lg p-4">
                            <div className="flex items-center justify-between mb-4">
                              <div>
                                <h4 className="font-semibold">{job.title}</h4>
                                <p className="text-sm text-gray-600">
                                  Posted: {job.postedDate} • Expires: {job.expiryDate}
                                </p>
                                <p className="text-xs text-gray-500">{job.applications} applications received</p>
                              </div>
                              <div className="text-right space-x-2">
                                <Badge variant="secondary">{job.status}</Badge>
                                {job.sponsored && (
                                  <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                                    Sponsored
                                  </Badge>
                                )}
                                <div className="mt-2 flex gap-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleEditJob(job)}
                                  >
                                    Edit
                                  </Button>

                                  {/* Mark Position as Filled Dialog */}
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        className="text-green-600 border-green-300 hover:bg-green-50"
                                        disabled={removingJobId === job.id || job.status === "Filled"}
                                      >
                                        {job.status === "Filled" ? "Position Filled" : (removingJobId === job.id ? "Marking..." : "Mark as Filled")}
                                      </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>Mark Position as Filled</AlertDialogTitle>
                                        <AlertDialogDescription>
                                          Congratulations! This will remove your job listing since you've found an employee. The job will no longer be visible to students.
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction
                                          onClick={() => handleRemoveJob(job.id, "filled")}
                                          className="bg-green-600 hover:bg-green-700"
                                        >
                                          Mark as Filled
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>

                                  {/* Remove Job Dialog */}
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        className="text-red-600 border-red-300 hover:bg-red-50"
                                        disabled={removingJobId === job.id}
                                      >
                                        {removingJobId === job.id ? "Removing..." : "Remove Job"}
                                      </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>Remove Job Posting</AlertDialogTitle>
                                        <AlertDialogDescription>
                                          Are you sure you want to remove this job posting? This action cannot be undone and the job will no longer be visible to students.
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction
                                          onClick={() => handleRemoveJob(job.id, "removed")}
                                          className="bg-red-600 hover:bg-red-700"
                                        >
                                          Remove Job
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                </div>
                              </div>
                            </div>

                            {/* Applications */}
                            <div className="mt-4">
                              <h5 className="font-medium mb-3">Applicants ({job.applicants.length}):</h5>
                              <div className="space-y-3">
                                {job.applicants.length > 0 ? (
                                  job.applicants.map((applicant) => (
                                    <div key={applicant.id} className="p-4 bg-gray-50 rounded-lg border">
                                      <div className="flex items-start justify-between mb-3">
                                        <div className="flex-1">
                                          <div className="flex items-center gap-2 mb-1">
                                            <p className="font-medium">{applicant.name}</p>
                                            <Badge
                                              variant={applicant.status === "contacted" ? "default" :
                                                applicant.status === "rejected" ? "destructive" : "secondary"}
                                              className={
                                                applicant.status === "contacted" ? "bg-green-100 text-green-800" :
                                                  applicant.status === "rejected" ? "bg-red-100 text-red-800" : ""
                                              }
                                            >
                                              {applicant.status}
                                            </Badge>
                                          </div>
                                          <p className="text-sm text-gray-600">{applicant.email}</p>
                                          <p className="text-sm text-blue-600">{applicant.university}</p>
                                          <p className="text-xs text-gray-500">Applied: {applicant.appliedDate}</p>
                                        </div>
                                        <div className="flex gap-2">
                                          {applicant.status === "pending" && (
                                            <>
                                              <Button size="sm" variant="outline" className="text-green-600 border-green-300 hover:bg-green-50">
                                                Contact
                                              </Button>
                                              <Button size="sm" variant="outline" className="text-red-600 border-red-300 hover:bg-red-50">
                                                Reject
                                              </Button>
                                            </>
                                          )}
                                          {applicant.status === "contacted" && (
                                            <Button size="sm" variant="outline" disabled>
                                              ✓ Contacted
                                            </Button>
                                          )}
                                          {applicant.status === "rejected" && (
                                            <Button size="sm" variant="outline" disabled>
                                              ✗ Rejected
                                            </Button>
                                          )}
                                        </div>
                                      </div>

                                      {/* Application Message */}
                                      <div className="mt-3 p-3 bg-white rounded border">
                                        <p className="text-sm font-medium text-gray-700 mb-1">Application Message:</p>
                                        <p className="text-sm text-gray-600">{applicant.message}</p>
                                      </div>
                                    </div>
                                  ))
                                ) : (
                                  <p className="text-muted-foreground text-sm">No applicants yet.</p>
                                )}
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-muted-foreground">You haven't posted any jobs yet.</p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Edit Job Dialog (adapted from old code) */}
              <Dialog open={editingJobId !== null} onOpenChange={() => {
                setEditingJobId(null)
                setEditJobData({ title: "", applications: 0, sponsored: false })
              }}>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Edit Job Posting</DialogTitle>
                    <DialogDescription>
                      Update your job details. Changes will be visible immediately.
                    </DialogDescription>
                  </DialogHeader>
                  {editingJobId && (() => {
                    const currentJob = postedJobs.find(j => j.id === editingJobId)
                    if (!currentJob) return null; // Should not happen if editingJobId is valid
                    return (
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="editTitle">Job Title</Label>
                          <Input
                            id="editTitle"
                            value={editJobData.title || currentJob.title || ""}
                            onChange={(e) => setEditJobData(prev => ({ ...prev, title: e.target.value }))}
                          />
                        </div>
                        <div>
                          <Label htmlFor="editApplications">Applications Received</Label>
                          <Input
                            id="editApplications"
                            type="number"
                            value={editJobData.applications || currentJob.applications || 0}
                            onChange={(e) => setEditJobData(prev => ({ ...prev, applications: parseInt(e.target.value) || 0 }))}
                            disabled
                            className="bg-gray-50"
                          />
                          <p className="text-xs text-gray-500 mt-1">Applications count is read-only</p>
                        </div>

                        {/* Sponsored Upgrade Section */}
                        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                          <div className="flex items-start space-x-3">
                            <input
                              type="checkbox"
                              id="editSponsored"
                              checked={editJobData.sponsored !== undefined ? editJobData.sponsored : currentJob.sponsored}
                              onChange={(e) => setEditJobData(prev => ({ ...prev, sponsored: e.target.checked }))}
                              className="mt-1"
                              disabled={currentJob.sponsored}
                            />
                            <div className="flex-1">
                              <Label htmlFor="editSponsored" className="font-medium cursor-pointer">
                                {currentJob.sponsored ? "Currently Sponsored" : "Upgrade to Sponsored (+£4)"}
                              </Label>
                              <p className="text-sm text-gray-600 mt-1">
                                {currentJob.sponsored
                                  ? "This job is already sponsored and appears at the top of search results"
                                  : "Move your job to the top of search results and get 3x more visibility"
                                }
                              </p>
                              {!currentJob.sponsored && editJobData.sponsored && (
                                <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
                                  💳 You'll be charged £4 to upgrade this job to sponsored
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })()}
                  <DialogFooter>
                    <Button variant="outline" onClick={() => {
                      setEditingJobId(null)
                      setEditJobData({ title: "", applications: 0, sponsored: false })
                    }}>
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSaveJobChanges}
                      disabled={isProcessingUpgrade}
                    >
                      {isProcessingUpgrade ? 'Processing Payment...' : 'Save Changes'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </TabsContent>

            {/* Billing Tab Content (adapted from old code, mock data removed) */}
            <TabsContent value="billing">
              <Card>
                <CardHeader>
                  <CardTitle>Billing History</CardTitle>
                  <CardDescription>
                    View all your transactions and download receipts
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {/* Saved Payment Methods */}
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold mb-4">Saved Payment Methods</h3>
                    <div className="space-y-3">
                      <div className="border rounded-lg p-4 flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-6 bg-blue-600 rounded text-white text-xs font-bold flex items-center justify-center">
                            VISA
                          </div>
                          <div>
                            <p className="font-medium">•••• •••• •••• 4242</p>
                            <p className="text-sm text-gray-500">Expires 12/2028</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">Edit</Button>
                          <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">Delete</Button>
                        </div>
                      </div>

                      <div className="border rounded-lg p-4 flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-6 bg-red-600 rounded text-white text-xs font-bold flex items-center justify-center">
                            MC
                          </div>
                          <div>
                            <p className="font-medium">•••• •••• •••• 1234</p>
                            <p className="text-sm text-gray-500">Expires 08/2027</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">Edit</Button>
                          <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">Delete</Button>
                        </div>
                      </div>

                      <Button variant="outline" className="w-full">
                        + Add New Payment Method
                      </Button>
                    </div>
                  </div>

                  <Separator className="my-6" />

                  <h3 className="text-lg font-semibold mb-4">Transaction History</h3>
                  <div className="space-y-4">
                    {/* Render transaction history only if data is present */}
                    {/* Currently, mockTransactions is an empty array per request */}
                    {[] /* Replace mockTransactions with an empty array or actual fetched data */.map((transaction: Transaction) => (
                      <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <h4 className="font-semibold">{transaction.type}</h4>
                          <p className="text-sm text-gray-600">{transaction.description}</p>
                          <p className="text-xs text-gray-500">{transaction.date}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">£{transaction.amount.toFixed(2)}</p>
                          <Badge
                            variant="secondary"
                            className="bg-green-100 text-green-800"
                          >
                            {transaction.status}
                          </Badge>
                          <div className="mt-2">
                            <Button size="sm" variant="outline" onClick={() => downloadReceipt(transaction)}>
                              Download Receipt
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                    {/* Display message if no transactions */}
                    {[] /* Replace mockTransactions with an empty array or actual fetched data */.length === 0 && (
                      <p className="text-muted-foreground">No transactions found.</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Settings Tab Content (adapted from old code, mock data removed) */}
            <TabsContent value="settings">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Account Settings</CardTitle>
                    <CardDescription>
                      Manage your account preferences and privacy settings
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold">Email Notifications</h4>
                        <p className="text-sm text-gray-600">Receive updates about new jobs and applications</p>
                      </div>
                      <Dialog open={showEmailDialog} onOpenChange={setShowEmailDialog}>
                        <DialogTrigger asChild>
                          <Button variant="outline">Manage</Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Email Notification Preferences</DialogTitle>
                            <DialogDescription>
                              Choose which email notifications you'd like to receive
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <span>New job matches</span>
                              <input type="checkbox" defaultChecked />
                            </div>
                            <div className="flex items-center justify-between">
                              <span>Application updates</span>
                              <input type="checkbox" defaultChecked />
                            </div>
                            <div className="flex items-center justify-between">
                              <span>Platform updates</span>
                              <input type="checkbox" />
                            </div>
                          </div>
                          <DialogFooter>
                            <Button onClick={() => setShowEmailDialog(false)}>Save Preferences</Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold">Change Password</h4>
                        <p className="text-sm text-gray-600">Update your account password</p>
                      </div>
                      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
                        <DialogTrigger asChild>
                          <Button variant="outline">Change</Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Change Password</DialogTitle>
                            <DialogDescription>
                              Enter your current password and choose a new one
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <Label htmlFor="currentPassword">Current Password</Label>
                              <Input id="currentPassword" type="password" />
                            </div>
                            <div>
                              <Label htmlFor="newPassword">New Password</Label>
                              <Input id="newPassword" type="password" />
                            </div>
                            <div>
                              <Label htmlFor="confirmPassword">Confirm New Password</Label>
                              <Input id="confirmPassword" type="password" />
                            </div>
                          </div>
                          <DialogFooter>
                            <Button variant="outline" onClick={() => setShowPasswordDialog(false)}>Cancel</Button>
                            <Button onClick={() => setShowPasswordDialog(false)}>Update Password</Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold">Download My Data</h4>
                        <p className="text-sm text-gray-600">Export all your account data (GDPR)</p>
                      </div>
                      <Dialog open={showDataDialog} onOpenChange={setShowDataDialog}>
                        <DialogTrigger asChild>
                          <Button variant="outline">Download</Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Download Your Data</DialogTitle>
                            <DialogDescription>
                              This will download all your personal data in JSON format
                            </DialogDescription>
                          </DialogHeader>
                          <p className="text-sm text-gray-600">
                            Your download will include:
                          </p>
                          <ul className="text-sm text-gray-600 list-disc pl-4">
                            <li>Profile information</li>
                            <li>Transaction history</li>
                            <li>Job applications/postings</li>
                            <li>Account activity logs</li>
                          </ul>
                          <DialogFooter>
                            <Button variant="outline" onClick={() => setShowDataDialog(false)}>Cancel</Button>
                            <Button onClick={() => {
                              downloadMyData()
                              setShowDataDialog(false)
                            }}>Download Data</Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-red-200">
                  <CardHeader>
                    <CardTitle className="text-red-800">Danger Zone</CardTitle>
                    <CardDescription>
                      Irreversible actions for your account
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-red-800">Delete Account</h4>
                        <p className="text-sm text-gray-600">
                          Permanently delete your account and all associated data
                        </p>
                      </div>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive">Delete Account</Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Account</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will permanently delete your account and remove all your data from our servers.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleDeleteAccount} className="bg-red-600 hover:bg-red-700">
                              Delete Account
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </main>

      {/* Footer (remains same as previous iteration, adapted from old code) */}
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
                <Link href="/about" className="text-gray-300 hover:text-white">About Us</Link>
              </nav>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-800 text-center text-sm text-gray-300">
            © 2025 StudentJobs UK. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}