"use client"

import { useState } from "react"
import Link from "next/link"
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

// Mock user data
const mockUser = {
  type: "employer", //employer or student
  firstName: "Emma",
  lastName: "Thompson",
  email: "emma.thompson@manchester.ac.uk",
  phone: "+44 7123 456 789",
  city: "Manchester",
  university: "University of Manchester",
  businessName: "",
  profileImage: null as string | null,
  emailVerified: true,
  phoneVerified: true,
}

// Mock transaction history
const mockTransactions = [
  {
    id: 1,
    date: "2024-01-15",
    type: "Contact Reveal",
    description: "Barista position at Central Perk Coffee",
    amount: 1.00,
    status: "Completed",
    invoiceNumber: "INV-2024-001"
  },
  {
    id: 2,
    date: "2024-01-10",
    type: "Contact Reveal",
    description: "Tutoring position - Private Tutor",
    amount: 1.00,
    status: "Completed",
    invoiceNumber: "INV-2024-002"
  },
]

// Mock applied jobs for students (updated with employerPhone and isContactInfoRevealed)
const initialAppliedJobs = [
  {
    id: 1,
    title: "Barista - Weekend Shifts",
    company: "Central Perk Coffee",
    appliedDate: "2024-01-15",
    status: "Contacted",
    employerPhone: "+447911123456", // Example UK mobile number
    isContactInfoRevealed: false, // Default to false
  },
  {
    id: 2,
    title: "Tutoring - Maths & Science",
    company: "Private Tutor",
    appliedDate: "2024-01-10",
    status: "Contacted",
    employerPhone: "+447700900123", // Example UK mobile number
    isContactInfoRevealed: false, // Default to false
  },
]

// Mock posted jobs for employers
const mockPostedJobs = [
  {
    id: 1,
    title: "Shop Assistant",
    postedDate: "2024-01-12",
    expiryDate: "2024-02-11",
    applications: 8,
    sponsored: false,
    status: "Active",
    applicants: [
      { id: 1, name: "John Smith", email: "john@uni.ac.uk", university: "Manchester University", appliedDate: "2024-01-13", status: "pending", message: "I'm very interested in this position and have previous retail experience." },
      { id: 2, name: "Sarah Wilson", email: "sarah@college.ac.uk", university: "Leeds University", appliedDate: "2024-01-14", status: "contacted", message: "Available for weekend shifts as requested." },
      { id: 3, name: "Emma Thompson", email: "emma@uni.ac.uk", university: "Birmingham University", appliedDate: "2024-01-15", status: "pending", message: "Currently studying business and looking for practical experience." },
      { id: 4, name: "Tom Davis", email: "tom@student.ac.uk", university: "Warwick University", appliedDate: "2024-01-16", status: "rejected", message: "Flexible schedule and enthusiastic about customer service." },
      { id: 5, name: "Lucy Brown", email: "lucy@college.ac.uk", university: "Nottingham University", appliedDate: "2024-01-17", status: "pending", message: "Part-time work to support my studies." },
    ]
  },
  {
    id: 2,
    title: "Barista - Weekend Shifts",
    postedDate: "2024-01-10",
    expiryDate: "2024-02-09",
    applications: 12,
    sponsored: true,
    status: "Active",
    applicants: [
      { id: 6, name: "Alex Johnson", email: "alex@uni.ac.uk", university: "Manchester University", appliedDate: "2024-01-11", status: "contacted", message: "Love coffee and have barista experience from my gap year." },
      { id: 7, name: "Sophie Miller", email: "sophie@student.ac.uk", university: "Sheffield University", appliedDate: "2024-01-12", status: "pending", message: "Available weekends and some evenings." },
      { id: 8, name: "Ryan Clark", email: "ryan@college.ac.uk", university: "Liverpool University", appliedDate: "2024-01-13", status: "pending", message: "Quick learner with excellent customer service skills." },
    ]
  },
]

export default function MyAccountPage() {
  const [user, setUser] = useState(mockUser)
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState(user)
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [showEmailDialog, setShowEmailDialog] = useState(false)
  const [showPasswordDialog, setShowPasswordDialog] = useState(false)
  const [showDataDialog, setShowDataDialog] = useState(false)
  const [editingJobId, setEditingJobId] = useState<number | null>(null)
  const [editJobData, setEditJobData] = useState({
    title: "",
    applications: 0,
    sponsored: false
  })
  const [isProcessingUpgrade, setIsProcessingUpgrade] = useState(false)
  const [removingJobId, setRemovingJobId] = useState<number | null>(null)
  const [appliedJobs, setAppliedJobs] = useState(initialAppliedJobs) // State for applied jobs

  const handleSaveProfile = () => {
    setUser({...editForm, profileImage: imagePreview})
    setIsEditing(false)
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedImage(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleResendVerification = (type: "email" | "phone") => {
    console.log(`Resending ${type} verification`)
    // In real app, trigger verification resend
  }

  const handleDeleteAccount = () => {
    console.log("Account deletion requested")
    // In real app, handle GDPR compliant account deletion
  }

  const downloadReceipt = (transaction: { id: number; date: string; type: string; amount: number; status: string; description: string; invoiceNumber: string }) => {
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

Student Name: ${user.firstName} ${user.lastName}
Email: ${user.email}

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
  }

  const downloadMyData = () => {
    // Create a comprehensive data export
    const userData = {
      profile: user,
      transactions: mockTransactions,
      appliedJobs: user.type === "student" ? appliedJobs : undefined, // Use appliedJobs state
      postedJobs: user.type === "employer" ? mockPostedJobs : undefined,
      exportDate: new Date().toISOString(),
    }

    const dataContent = JSON.stringify(userData, null, 2)
    const blob = new Blob([dataContent], { type: 'application/json' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `StudentJobs-MyData-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
  }

  const handleRemoveJob = async (jobId: number, reason: string) => {
    setRemovingJobId(jobId)
    // Simulate job removal process
    await new Promise(resolve => setTimeout(resolve, 1500))

    if (reason === "filled") {
      alert('Job marked as filled and removed from listings. Congratulations on finding your employee!')
    } else {
      alert('Job post removed successfully.')
    }

    setRemovingJobId(null)
    // In real app, would update the job list or refetch data
  }

  // Handler to reveal contact info for a specific job
  const handleRevealContactInfo = (jobId: number) => {
    setAppliedJobs(prevJobs =>
      prevJobs.map(job =>
        job.id === jobId ? { ...job, isContactInfoRevealed: true } : job
      )
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/">
              <Logo />
            </Link>
            <nav className="flex items-center gap-10">
              <Link href={user.type === "student" ? "/browse-jobs" : "/post-job"} className="text-sm font-medium hover:underline">
                {user.type === "student" ? "Browse Jobs" : "Post Job"}
              </Link>
              <ContactModal>
                <button className="text-sm font-medium hover:underline">
                  Contact Us
                </button>
              </ContactModal>
              <Link href="/login" className="text-sm font-medium hover:underline">
                Sign Out
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Account</h1>
          <p className="text-gray-600">
            Manage your profile and view your {user.type === "student" ? "job applications" : "job postings"}
          </p>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="activity">
              {user.type === "student" ? "Applied Jobs" : "Posted Jobs"}
            </TabsTrigger>
            <TabsTrigger value="billing">Billing</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
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
                    variant={isEditing ? "outline" : "default"}
                    onClick={() => setIsEditing(!isEditing)}
                  >
                    {isEditing ? "Cancel" : "Edit Profile"}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Profile Image */}
                <div className="flex items-center gap-6">
                  <div className="relative">
                    <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                      {(imagePreview || user.profileImage) ? (
                        <img
                          src={imagePreview || user.profileImage || ''}
                          alt="Profile"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="text-gray-400 text-2xl font-bold">
                          {user.firstName[0]}{user.lastName[0]}
                        </div>
                      )}
                    </div>
                  </div>
                  {isEditing && (
                    <div>
                      <Label htmlFor="profileImage" className="block mb-2">Profile Image (Optional)</Label>
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

                {/* Verification Status */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                    <span className="text-sm font-medium">Email Verified</span>
                    {user.emailVerified ? (
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        ✓ Verified
                      </Badge>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleResendVerification("email")}
                      >
                        Resend
                      </Button>
                    )}
                  </div>
                  <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                    <span className="text-sm font-medium">Phone Verified</span>
                    {user.phoneVerified ? (
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        ✓ Verified
                      </Badge>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleResendVerification("phone")}
                      >
                        Resend
                      </Button>
                    )}
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
                        value={isEditing ? editForm.firstName : user.firstName}
                        onChange={(e) => setEditForm(prev => ({ ...prev, firstName: e.target.value }))}
                        disabled={!isEditing}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        value={isEditing ? editForm.lastName : user.lastName}
                        onChange={(e) => setEditForm(prev => ({ ...prev, lastName: e.target.value }))}
                        disabled={!isEditing}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={isEditing ? editForm.email : user.email}
                      onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                      disabled={!isEditing}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        value={isEditing ? editForm.phone : user.phone}
                        onChange={(e) => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
                        disabled={!isEditing}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        placeholder="e.g., Manchester"
                        value={isEditing ? editForm.city : user.city}
                        onChange={(e) => setEditForm(prev => ({ ...prev, city: e.target.value }))}
                        disabled={!isEditing}
                      />
                    </div>
                  </div>

                  {user.type === "student" ? (
                    <div className="space-y-2">
                      <Label htmlFor="university">University/College</Label>
                      <Input
                        id="university"
                        value={isEditing ? editForm.university : user.university}
                        onChange={(e) => setEditForm(prev => ({ ...prev, university: e.target.value }))}
                        disabled={!isEditing}
                      />
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Label htmlFor="businessName">Business Name</Label>
                      <Input
                        id="businessName"
                        value={isEditing ? editForm.businessName : user.businessName}
                        onChange={(e) => setEditForm(prev => ({ ...prev, businessName: e.target.value }))}
                        disabled={!isEditing}
                      />
                    </div>
                  )}

                  {isEditing && (
                    <div className="flex gap-2">
                      <Button onClick={handleSaveProfile} className="bg-blue-600 hover:bg-blue-700">
                        Save Changes
                      </Button>
                      <Button variant="outline" onClick={() => setIsEditing(false)}>
                        Cancel
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Activity Tab */}
          <TabsContent value="activity">
            <Card>
              <CardHeader>
                <CardTitle>
                  {user.type === "student" ? "Applied Jobs" : "Posted Jobs"}
                </CardTitle>
                <CardDescription>
                  {user.type === "student"
                    ? "Track your job applications and their status"
                    : "Manage your job postings and view applications"
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                {user.type === "student" ? (
                  <div className="space-y-4">
                    {appliedJobs.map((job) => (
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
                            variant={job.status === "Contacted" ? "default" : "secondary"}
                            className={job.status === "Contacted" ? "bg-green-100 text-green-800" : ""}
                          >
                            {job.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {mockPostedJobs.map((job) => (
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
                                onClick={() => {
                                  setEditingJobId(job.id)
                                  setEditJobData({
                                    title: job.title,
                                    applications: job.applications,
                                    sponsored: job.sponsored
                                  })
                                }}
                              >
                                Edit
                              </Button>

                              {/* Remove Job Dropdown */}
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-green-600 border-green-300 hover:bg-green-50"
                                    disabled={removingJobId === job.id}
                                  >
                                    {removingJobId === job.id ? "Removing..." : "Position Filled"}
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
                                    Remove Job
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
                          <h5 className="font-medium mb-3">Applications Received ({job.applications}):</h5>
                          <div className="space-y-3">
                            {job.applicants.map((applicant) => (
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
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Edit Job Dialog */}
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
                  const currentJob = mockPostedJobs.find(j => j.id === editingJobId)
                  return (
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="editTitle">Job Title</Label>
                        <Input
                          id="editTitle"
                          value={editJobData.title || currentJob?.title || ""}
                          onChange={(e) => setEditJobData(prev => ({ ...prev, title: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="editApplications">Applications Received</Label>
                        <Input
                          id="editApplications"
                          type="number"
                          value={editJobData.applications || currentJob?.applications || 0}
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
                            checked={editJobData.sponsored !== undefined ? editJobData.sponsored : currentJob?.sponsored}
                            onChange={(e) => setEditJobData(prev => ({ ...prev, sponsored: e.target.checked }))}
                            className="mt-1"
                            disabled={currentJob?.sponsored} // Modified this line
                          />
                          <div className="flex-1">
                            <Label htmlFor="editSponsored" className="font-medium cursor-pointer">
                              {currentJob?.sponsored ? "Currently Sponsored" : "Upgrade to Sponsored (+£4)"}
                            </Label>
                            <p className="text-sm text-gray-600 mt-1">
                              {currentJob?.sponsored
                                ? "This job is already sponsored and appears at the top of search results"
                                : "Move your job to the top of search results and get 3x more visibility"
                              }
                            </p>
                            {!currentJob?.sponsored && editJobData.sponsored && (
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
                    onClick={async () => {
                      const currentJob = mockPostedJobs.find(j => j.id === editingJobId)
                      const needsPayment = !currentJob?.sponsored && editJobData.sponsored

                      if (needsPayment) {
                        setIsProcessingUpgrade(true)
                        // Simulate payment processing
                        await new Promise(resolve => setTimeout(resolve, 2000))
                        alert('Payment successful! Your job has been upgraded to sponsored and will now appear at the top of search results.')
                      } else {
                        alert('Job updated successfully!')
                      }

                      setIsProcessingUpgrade(false)
                      setEditingJobId(null)
                      setEditJobData({ title: "", applications: 0, sponsored: false })
                    }}
                    disabled={isProcessingUpgrade}
                  >
                    {isProcessingUpgrade ? 'Processing Payment...' : 'Save Changes'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </TabsContent>

          {/* Billing Tab */}
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
                  {mockTransactions.map((transaction) => (
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
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
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
        </Tabs>
      </div>

      {/* Footer */}
      <footer className="w-full py-6 bg-gray-900 text-white mt-16">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="grid gap-8 lg:grid-cols-4">
            <div>
              <h3 className="font-bold text-lg mb-4">StudentJobs UK</h3>
              <p className="text-gray-300 text-sm">
                Connecting UK students with flexible part-time opportunities since 2024.
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
            © 2024 StudentJobs UK. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}