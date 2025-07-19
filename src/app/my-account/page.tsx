// app/my-account/page.tsx
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

import { useAuth } from "@/app/context/AuthContext";

// User, Transaction, AppliedJob, Applicant, PostedJob interfaces remain the same.
interface User {
  user_id: string;
  user_username: string;
  user_email: string;
  google_id?: string;
  user_type: "employer" | "student";
  organisation_name?: string; // CHANGED: Consistent British spelling for interface
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
  employerPhone: string;
  isContactInfoRevealed: boolean;
}

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


export default function MyAccountPage() {
  const { user, isLoading, refreshUser, logout } = useAuth();

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [activeTab, setActiveTab] = useState("profile");

  // --- NEW STATE FOR EDITABLE PROFILE FIELDS ---
  const [editedFirstName, setEditedFirstName] = useState<string>('');
  const [editedLastName, setEditedLastName] = useState<string>('');
  const [editedContactPhoneNumber, setEditedContactPhoneNumber] = useState<string>('');
  const [editedUniversityCollege, setEditedUniversityCollege] = useState<string>('');
  const [editedOrganisationName, setEditedOrganisationName] = useState<string>(''); // CHANGED: Local state name to match British spelling
  const [editedEmail, setEditedEmail] = useState<string>('');
  const [editedUserCity, setEditedUserCity] = useState<string>(''); // Added state for user_city
  // --- END NEW STATE ---

  const [appliedJobs, setAppliedJobs] = useState<AppliedJob[]>([]);
  const [postedJobs, setPostedJobs] = useState<PostedJob[]>([]);
  const [editingJobId, setEditingJobId] = useState<number | null>(null);
  const [editJobData, setEditJobData] = useState({
    title: "",
    applications: 0,
    sponsored: false
  });
  const [isProcessingUpgrade, setIsProcessingUpgrade] = useState(false);
  const [removingJobId, setRemovingJobId] = useState<number | null>(null);

  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [showDataDialog, setShowDataDialog] = useState(false);

  const router = useRouter();

  // Unified useEffect for initial data setup and redirect
  useEffect(() => {
    console.log("MyAccountPage useEffect: user:", user, "isLoading:", isLoading);

    // 1. Redirect to login if user is not authenticated and not in a loading state
    if (!isLoading && !user) {
      console.log("MyAccountPage: User not found and not loading, redirecting to /login.");
      router.push('/login');
      return;
    }

    // 2. Initialize local states when user data becomes available and AuthContext is not loading
    if (user && !isLoading) {
      console.log("MyAccountPage: User data available and not loading. Initializing profile states.");
      setProfileImage(user.user_image || null);
      setEditedFirstName(user.user_first_name || '');
      setEditedLastName(user.user_last_name || '');
      setEditedContactPhoneNumber(user.contact_phone_number || '');
      setEditedUniversityCollege(user.university_college || '');
      setEditedOrganisationName(user.organisation_name || ''); // Accessing user.organisation_name from AuthContext
      setEditedEmail(user.user_email || '');
      setEditedUserCity(user.user_city || '');
    }
  }, [user, isLoading, router]);


  // handleImageUpload now directly sets profileImage preview.
  // The selectedFile will be used by handleSaveProfile.
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result as string); // Update profileImage for preview
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;

    const formData = new FormData();
    if (selectedFile) {
      formData.append('userImage', selectedFile);
    }

    // --- USE EDITED STATES FOR FORM DATA ---
    formData.append('user_username', user.user_username);
    formData.append('user_email', editedEmail);
    formData.append('user_first_name', editedFirstName);
    formData.append('user_last_name', editedLastName);
    formData.append('contact_phone_number', editedContactPhoneNumber);
    formData.append('user_city', editedUserCity);

    if (user.user_type === "student") {
        formData.append('university_college', editedUniversityCollege);
    } else if (user.user_type === "employer") {
        formData.append('organisation_name', editedOrganisationName); // Sending to backend with British spelling
    }
    // --- END EDITED STATES ---

    try {
      const response = await fetch(`/api/user/${user.user_id}`, {
        method: 'PUT',
        body: formData,
      });

      if (response.ok) {
        await refreshUser(); // Refresh global user state from backend
        setSelectedFile(null); // Clear selected file after successful upload
        setIsEditingProfile(false);
        alert('Profile updated successfully!');
      } else {
        const errorData = await response.json();
        console.error('Failed to save profile:', response.status, errorData);
        alert(`Failed to save profile: ${errorData.message || response.statusText}`);
      }
    } catch (error) {
      console.error('Network error or unexpected issue saving profile:', error);
      alert('Network error while saving profile.');
    }
  };


  const handleResendVerification = (type: 'email' | 'phone') => {
    console.log(`Resending ${type} verification...`);
  };

  const handleDeleteAccount = () => {
    console.log("Deleting account...");
    logout();
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

  const handleRevealContactInfo = (jobId: number) => {
    setAppliedJobs(prevJobs =>
      prevJobs.map(job =>
        job.id === jobId ? { ...job, isContactInfoRevealed: true } : job
      )
    );
  };

  // Render loading state if still loading
  if (isLoading) {
    return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center">
        <p>Loading account details...</p>
      </div>
    );
  }

  // If not loading and no user, it means we've already redirected or should not render
  // The useEffect above ensures redirection, so this acts as a final safeguard.
  if (!user) {
    return null;
  }

  // Rest of the component renders only when user is available and not loading
  return (
    <div className="flex min-h-screen w-full flex-col">
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/">
              <Logo />
            </Link>
            <nav className="flex items-center gap-10">
              <Link href={user.user_type === "student" ? "/browse-jobs" : "/post-job"} className="text-sm font-medium hover:underline">
                {user.user_type === "student" ? "Browse Jobs" : "Post Job"}
              </Link>
              <ContactModal isLoggedIn={!!user}>
                <button className="text-sm font-medium hover:underline">
                  Contact Us
                </button>
              </ContactModal>
              <button onClick={logout} className="text-sm font-medium hover:underline">
                Sign Out
              </button>
            </nav>
          </div>
        </div>
      </header>

      <main className="flex min-h-[calc(100vh_-_theme(spacing.16))] flex-1 flex-col gap-4 bg-muted/40 p-4 md:gap-8 md:p-10">
        <div className="mx-auto grid w-full max-w-6xl gap-2">
          <h1 className="text-3xl font-semibold">My Account</h1>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mx-auto grid w-full max-w-6xl items-start gap-6 md:grid-cols-[180px_1fr] lg:grid-cols-[250px_1fr]">
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

          <div className="grid gap-6">
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
                    {/* --- ONLY ONE EDIT/CANCEL BUTTON HERE --- */}
                    <Button
                      variant={isEditingProfile ? "outline" : "default"}
                      onClick={() => setIsEditingProfile(!isEditingProfile)}
                    >
                      {isEditingProfile ? "Cancel" : "Edit Profile"}
                    </Button>
                    {/* --- END SINGLE BUTTON --- */}
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
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

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                      <span className="text-sm font-medium">Email Verified</span>
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        ✓ Verified
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                      <span className="text-sm font-medium">Phone Verified</span>
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        ✓ Verified
                      </Badge>
                    </div>
                  </div>

                  <Separator />

                  <div className="grid gap-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name</Label>
                        <Input
                          id="firstName"
                          value={isEditingProfile ? editedFirstName : user.user_first_name || ''}
                          onChange={(e) => setEditedFirstName(e.target.value)}
                          disabled={!isEditingProfile}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input
                          id="lastName"
                          value={isEditingProfile ? editedLastName : user.user_last_name || ''}
                          onChange={(e) => setEditedLastName(e.target.value)}
                          disabled={!isEditingProfile}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                       value={isEditingProfile ? editedEmail : user.user_email || ''}
    					onChange={(e) => setEditedEmail(e.target.value)}
    					disabled={!isEditingProfile}
 						 />
						</div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                          id="phone"
                          value={isEditingProfile ? editedContactPhoneNumber : user.contact_phone_number || ''}
                          onChange={(e) => setEditedContactPhoneNumber(e.target.value)}
                          disabled={!isEditingProfile}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="city">City</Label>
                        <Input
                          id="city"
                          placeholder="e.g., Manchester"
                          value={isEditingProfile ? editedUserCity : user.user_city || ''}
                          onChange={(e) => setEditedUserCity(e.target.value)}
                          disabled={!isEditingProfile}
                        />
                      </div>
                    </div>

                    {user.user_type === "student" ? (
                      <div className="space-y-2">
                        <Label htmlFor="university">University/College</Label>
                        <Input
                          id="university"
                          value={isEditingProfile ? editedUniversityCollege : user.university_college || ''}
                          onChange={(e) => setEditedUniversityCollege(e.target.value)}
                          disabled={!isEditingProfile}
                        />
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Label htmlFor="businessName">Business Name</Label>
                        <Input
                          id="businessName"
                          value={isEditingProfile ? editedOrganisationName : user.organisation_name || ''}
                          onChange={(e) => setEditedOrganisationName(e.target.value)}
                          disabled={!isEditingProfile}
                        />
                      </div>
                    )}

                    {isEditingProfile && (
                      <div className="flex gap-2">
                        <Button onClick={handleSaveProfile} className="bg-blue-600 hover:bg-blue-700">
                          Save Changes
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

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
                              <h4 className="font-semibold">{job.title} at {job.company}</h4>
                              <p className="text-sm text-gray-600">Applied: {job.appliedDate}</p>
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
                    if (!currentJob) return null;
                    return (
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="editTitle">Job Title</Label>
                          <Input
                            id="editTitle"
                            value={editJobData.title}
                            onChange={(e) => setEditJobData(prev => ({ ...prev, title: e.target.value }))}
                          />
                        </div>
                        <div>
                          <Label htmlFor="editApplications">Applications Received</Label>
                          <Input
                            id="editApplications"
                            type="number"
                            value={editJobData.applications}
                            onChange={(e) => setEditJobData(prev => ({ ...prev, applications: parseInt(e.target.value) || 0 }))}
                            disabled
                            className="bg-gray-50"
                          />
                          <p className="text-xs text-gray-500 mt-1">Applications count is read-only</p>
                        </div>

                        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                          <div className="flex items-start space-x-3">
                            <input
                              type="checkbox"
                              id="editSponsored"
                              checked={editJobData.sponsored}
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

            <TabsContent value="billing">
              <Card>
                <CardHeader>
                  <CardTitle>Billing History</CardTitle>
                  <CardDescription>
                    View all your transactions and download receipts
                  </CardDescription>
                </CardHeader>
                <CardContent>
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
                    {[] .map((transaction: Transaction) => (
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
                    {[] .length === 0 && (
                      <p className="text-muted-foreground">No transactions found.</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

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
                            <DialogTitle>Email Notification Preferences</DialogTitle> {/* FIX: Changed </CardTitle> to </DialogTitle> */}
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