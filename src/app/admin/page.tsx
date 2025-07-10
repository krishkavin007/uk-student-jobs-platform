"use client"

import { useState } from "react"
import { Button } from "../../components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card"
import { Badge } from "../../components/ui/badge"
import { Avatar, AvatarFallback } from "../../components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs"
import { Input } from "../../components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "../../components/ui/alert-dialog"
import { Logo } from "../../components/ui/logo"
import Link from "next/link"

// Mock admin data
const mockStats = {
  totalUsers: 2847,
  totalJobs: 156,
  totalRevenue: 1234.50,
  pendingReports: 3,
  newUsersThisWeek: 87,
  jobsPostedThisWeek: 23,
  revenueThisWeek: 156.00,
}

// Mock chart data
const mockChartData = {
  weeklyRevenue: [120, 85, 200, 156, 180, 95, 210],
  weeklyUsers: [15, 12, 25, 18, 22, 8, 17],
  weeklyJobs: [8, 5, 12, 9, 11, 4, 7],
  categoryBreakdown: [
    { name: "Hospitality", value: 35, count: 54 },
    { name: "Retail", value: 25, count: 39 },
    { name: "Education", value: 20, count: 31 },
    { name: "Events", value: 12, count: 19 },
    { name: "Other", value: 8, count: 13 },
  ]
}

// Mock job postings
const mockJobs = [
  {
    id: 1,
    title: "Barista - Part Time",
    company: "Central Perk Coffee",
    employer: "John Smith",
    location: "Manchester",
    salary: "£10.50/hour",
    type: "sponsored",
    status: "active",
    applications: 12,
    datePosted: "2024-01-15",
    expiresOn: "2024-02-14",
    category: "Hospitality",
    description: "Looking for friendly barista for weekend shifts...",
    flagged: false
  },
  {
    id: 2,
    title: "Private Tutor - Maths",
    company: "Self-employed",
    employer: "Sarah Wilson",
    location: "Leeds",
    salary: "£15/hour",
    type: "basic",
    status: "active",
    applications: 8,
    datePosted: "2024-01-18",
    expiresOn: "2024-02-17",
    category: "Education",
    description: "Seeking maths tutor for GCSE level students...",
    flagged: false
  },
  {
    id: 3,
    title: "Retail Assistant",
    company: "Fashion Forward",
    employer: "Mike Johnson",
    location: "Birmingham",
    salary: "£9.50/hour",
    type: "basic",
    status: "flagged",
    applications: 3,
    datePosted: "2024-01-20",
    expiresOn: "2024-02-19",
    category: "Retail",
    description: "Part-time retail position in busy store...",
    flagged: true
  }
]

// Mock payment transactions
const mockTransactions = [
  {
    id: 1,
    invoiceNumber: "INV-2024-001",
    user: "Emma Thompson",
    userType: "student",
    amount: 1.00,
    type: "Contact Reveal",
    status: "completed",
    date: "2024-01-15 14:30",
    paymentMethod: "Card ending 4242",
    description: "Contact reveal for Barista position",
    refunded: false
  },
  {
    id: 2,
    invoiceNumber: "INV-2024-002",
    user: "John Smith",
    userType: "employer",
    amount: 5.00,
    type: "Sponsored Job Post",
    status: "completed",
    date: "2024-01-12 09:15",
    paymentMethod: "Card ending 1234",
    description: "Sponsored listing for Barista position",
    refunded: false
  },
  {
    id: 3,
    invoiceNumber: "INV-2024-003",
    user: "Sarah Wilson",
    userType: "employer",
    amount: 1.00,
    type: "Basic Job Post",
    status: "completed",
    date: "2024-01-18 16:45",
    paymentMethod: "PayPal",
    description: "Basic listing for Tutor position",
    refunded: false
  },
  {
    id: 4,
    invoiceNumber: "INV-2024-004",
    user: "Mike Johnson",
    userType: "employer",
    amount: 1.00,
    type: "Basic Job Post",
    status: "pending",
    date: "2024-01-20 11:20",
    paymentMethod: "Card ending 9999",
    description: "Basic listing for Retail Assistant",
    refunded: false
  }
]

// Mock user reports
const mockReports = [
  {
    id: 1,
    reportType: "Inappropriate Job",
    reportedBy: "Emma Thompson",
    reportedUser: "Unknown Employer",
    jobId: 15,
    jobTitle: "Easy Money Job",
    reason: "Suspicious job posting - too good to be true pay rates",
    description: "This job is offering £50/hour for basic data entry which seems like a scam",
    status: "pending",
    priority: "high",
    dateReported: "2024-01-19 10:30",
    evidence: "Screenshot attached"
  },
  {
    id: 2,
    reportType: "User Harassment",
    reportedBy: "Sarah Wilson",
    reportedUser: "David Brown",
    jobId: null,
    jobTitle: null,
    reason: "Inappropriate messages",
    description: "User sent inappropriate messages after I applied for their tutoring position",
    status: "under_review",
    priority: "high",
    dateReported: "2024-01-17 15:45",
    evidence: "Message screenshots"
  },
  {
    id: 3,
    reportType: "Fake Profile",
    reportedBy: "Anonymous",
    reportedUser: "Lisa Anderson",
    jobId: null,
    jobTitle: null,
    reason: "Suspected fake student account",
    description: "Profile uses stock photos and university details don't match",
    status: "resolved",
    priority: "medium",
    dateReported: "2024-01-14 08:20",
    evidence: "Profile analysis"
  }
]

// Mock activity logs
const mockActivityLogs = [
  {
    id: 1,
    userId: 1,
    userName: "Emma Thompson",
    action: "Login",
    details: "User logged in successfully",
    timestamp: "2024-01-20 14:30:15",
    ipAddress: "192.168.1.101",
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
  },
  {
    id: 2,
    userId: 1,
    userName: "Emma Thompson",
    action: "Job Application",
    details: "Applied to Barista position at Central Perk Coffee",
    timestamp: "2024-01-20 14:32:22",
    ipAddress: "192.168.1.101",
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
  },
  {
    id: 3,
    userId: 2,
    userName: "John Smith",
    action: "Job Post",
    details: "Posted new job: Shop Assistant",
    timestamp: "2024-01-19 09:15:33",
    ipAddress: "10.0.0.25",
    userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"
  },
  {
    id: 4,
    userId: 3,
    userName: "Sarah Wilson",
    action: "Registration",
    details: "New user account created",
    timestamp: "2024-01-15 11:22:45",
    ipAddress: "172.16.0.55",
    userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15"
  },
  {
    id: 5,
    userId: 1,
    userName: "Emma Thompson",
    action: "Payment",
    details: "Contact reveal payment processed - £1.00",
    timestamp: "2024-01-20 14:32:45",
    ipAddress: "192.168.1.101",
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
  },
]

// Mock users data
const mockUsers = [
  {
    id: 1,
    name: "Emma Thompson",
    email: "emma.thompson@manchester.ac.uk",
    type: "student",
    university: "University of Manchester",
    city: "Manchester",
    joinDate: "2024-01-10",
    verified: true,
    status: "active",
    lastActive: "2024-01-20 14:30",
    ipAddress: "192.168.1.101",
    totalSpent: 3.00,
    invoices: [
      { id: "INV-2024-001", amount: 1.00, date: "2024-01-15", type: "Contact Reveal" },
      { id: "INV-2024-003", amount: 1.00, date: "2024-01-18", type: "Contact Reveal" },
      { id: "INV-2024-007", amount: 1.00, date: "2024-01-20", type: "Contact Reveal" },
    ]
  },
  {
    id: 2,
    name: "John Smith",
    email: "john@coffeeshop.co.uk",
    type: "employer",
    businessName: "Central Perk Coffee",
    city: "Manchester",
    joinDate: "2024-01-05",
    verified: true,
    status: "active",
    lastActive: "2024-01-19 09:15",
    ipAddress: "10.0.0.25",
    totalSpent: 11.00,
    invoices: [
      { id: "INV-2024-002", amount: 5.00, date: "2024-01-12", type: "Sponsored Job Post" },
      { id: "INV-2024-004", amount: 1.00, date: "2024-01-16", type: "Basic Job Post" },
      { id: "INV-2024-006", amount: 5.00, date: "2024-01-19", type: "Sponsored Job Post" },
    ]
  },
  {
    id: 3,
    name: "Sarah Wilson",
    email: "sarah.wilson@leeds.ac.uk",
    type: "student",
    university: "University of Leeds",
    city: "Leeds",
    joinDate: "2024-01-15",
    verified: false,
    status: "pending",
    lastActive: "2024-01-20 16:45",
    ipAddress: "172.16.0.55",
    totalSpent: 0.00,
    invoices: []
  },
]

// Simple chart components
const SimpleBarChart = ({ data, title, color = "#3B82F6" }: { data: number[], title: string, color?: string }) => {
  const maxValue = Math.max(...data)

  return (
    <div>
      <h4 className="text-sm font-medium mb-3">{title}</h4>
      <div className="flex items-end justify-between h-32 gap-2">
        {data.map((value, index) => (
          <div key={index} className="flex flex-col items-center gap-1 flex-1">
            <div
              className="w-full rounded-t"
              style={{
                height: `${(value / maxValue) * 100}%`,
                backgroundColor: color,
                minHeight: value > 0 ? '4px' : '0px'
              }}
            />
            <span className="text-xs text-gray-500">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][index]}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

const SimplePieChart = ({ data }: { data: typeof mockChartData.categoryBreakdown }) => {
  const total = data.reduce((sum, item) => sum + item.value, 0)
  let currentAngle = 0

  return (
    <div className="flex items-center gap-4">
      <div className="relative w-32 h-32">
        <svg viewBox="0 0 42 42" className="w-full h-full">
          <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="#E5E7EB" strokeWidth="3"/>
          {data.map((item, index) => {
            const strokeDasharray = `${item.value} ${100 - item.value}`
            const strokeDashoffset = 100 - currentAngle
            currentAngle += item.value
            const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6']

            return (
              <circle
                key={index}
                cx="21"
                cy="21"
                r="15.915"
                fill="transparent"
                stroke={colors[index % colors.length]}
                strokeWidth="3"
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                transform="rotate(-90 21 21)"
              />
            )
          })}
        </svg>
      </div>
      <div className="space-y-2">
        {data.map((item, index) => {
          const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6']
          return (
            <div key={index} className="flex items-center gap-2 text-sm">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: colors[index % colors.length] }}
              />
              <span>{item.name}: {item.count}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function AdminDashboard() {
  const [selectedTab, setSelectedTab] = useState("overview")
  const [searchTerm, setSearchTerm] = useState("")
  const [logFilter, setLogFilter] = useState("")
  const [revenueFilter, setRevenueFilter] = useState("7days")
  const [jobFilter, setJobFilter] = useState("all")
  const [paymentFilter, setPaymentFilter] = useState("all")
  const [reportFilter, setReportFilter] = useState("all")

  const handleSuspendUser = (userId: number) => {
    console.log("Suspending user:", userId)
    // In real app, handle user suspension
  }

  const handleDeleteJob = (jobId: number) => {
    console.log("Deleting job:", jobId)
    // In real app, handle job deletion
  }

  const handleResolveReport = (reportId: number, action: "approve" | "reject") => {
    console.log("Resolving report:", reportId, action)
    // In real app, handle report resolution
  }

  const handleRefund = (transactionId: number) => {
    console.log("Processing refund for transaction:", transactionId)
    // In real app, process refund
  }

  const filteredJobs = mockJobs.filter(job => {
    const matchesSearch = searchTerm === "" ||
                         job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.employer.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = jobFilter === "all" || job.status === jobFilter || job.type === jobFilter
    return matchesSearch && matchesFilter
  })

  const filteredTransactions = mockTransactions.filter(transaction => {
    const matchesSearch = searchTerm === "" ||
                         transaction.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = paymentFilter === "all" || transaction.status === paymentFilter || transaction.type.toLowerCase().includes(paymentFilter.toLowerCase())
    return matchesSearch && matchesFilter
  })

  const filteredReports = mockReports.filter(report => {
    const matchesSearch = searchTerm === "" ||
                         report.reportedBy.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.reportedUser.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (report.jobTitle && report.jobTitle.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesFilter = reportFilter === "all" || report.status === reportFilter || report.priority === reportFilter
    return matchesSearch && matchesFilter
  })

  const filteredUsers = mockUsers.filter(user => {
    const matchesSearch = searchTerm === "" ||
                         user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (user.university && user.university.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (user.businessName && user.businessName.toLowerCase().includes(searchTerm.toLowerCase()))
    return matchesSearch
  })

  const filteredRevenue = (() => {
    const data = mockChartData.weeklyRevenue
    switch (revenueFilter) {
      case "7days":
        return data.slice(-7)
      case "30days":
        return data.slice(-30).length > 7 ? data.slice(-30, -23) : data // Show week from last 30 days
      case "quarter":
        return data.map(v => v * 1.2) // Simulate quarterly growth
      case "year":
        return data.map(v => v * 1.5) // Simulate yearly growth
      default:
        return data
    }
  })()

  const filteredLogs = mockActivityLogs.filter(log =>
    logFilter === "" || log.action.toLowerCase().includes(logFilter.toLowerCase()) ||
    log.userName.toLowerCase().includes(logFilter.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 md:gap-4">
              <Link href="/">
                <Logo className="scale-75 md:scale-100" />
              </Link>
              <Badge variant="secondary" className="bg-red-100 text-red-800 text-xs md:text-sm">
                Admin
              </Badge>
            </div>
            <nav className="flex items-center gap-2 md:gap-4">
              <Link href="/" className="text-xs md:text-sm font-medium hover:underline">
                Public Site
              </Link>
              <Link href="/login" className="text-xs md:text-sm font-medium hover:underline">
                Sign Out
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Manage users, jobs, payments, and platform moderation</p>
        </div>

        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
          <div className="overflow-x-auto">
            <TabsList className="inline-flex h-9 items-center justify-start rounded-lg bg-muted p-1 text-muted-foreground min-w-full md:grid md:w-full md:grid-cols-7">
              <TabsTrigger value="overview" className="whitespace-nowrap">Overview</TabsTrigger>
              <TabsTrigger value="users" className="whitespace-nowrap">Users</TabsTrigger>
              <TabsTrigger value="jobs" className="whitespace-nowrap">Jobs</TabsTrigger>
              <TabsTrigger value="payments" className="whitespace-nowrap">Payments</TabsTrigger>
              <TabsTrigger value="reports" className="whitespace-nowrap">Reports</TabsTrigger>
              <TabsTrigger value="logs" className="whitespace-nowrap hidden sm:block">Activity Logs</TabsTrigger>
              <TabsTrigger value="analytics" className="whitespace-nowrap">Analytics</TabsTrigger>
            </TabsList>
          </div>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{mockStats.totalUsers.toLocaleString()}</div>
                  <p className="text-xs text-gray-500">+{mockStats.newUsersThisWeek} this week</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Jobs</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{mockStats.totalJobs}</div>
                  <p className="text-xs text-gray-500">+{mockStats.jobsPostedThisWeek} this week</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">£{mockStats.totalRevenue.toFixed(2)}</div>
                  <p className="text-xs text-gray-500">+£{mockStats.revenueThisWeek.toFixed(2)} this week</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending Reports</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">{mockStats.pendingReports}</div>
                  <p className="text-xs text-gray-500">Requires attention</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {mockActivityLogs.slice(0, 5).map((log) => (
                    <div key={log.id} className="flex items-center justify-between text-sm">
                      <span>{log.userName}: {log.action}</span>
                      <span className="text-gray-500">{new Date(log.timestamp).toLocaleTimeString()}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full" variant="outline">
                    Export User Data
                  </Button>
                  <Button className="w-full" variant="outline">
                    Generate Revenue Report
                  </Button>
                  <Button className="w-full" variant="outline">
                    Send Platform Announcement
                  </Button>
                  <Button className="w-full" variant="outline">
                    Download GDPR Report
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>View and manage all platform users</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 mb-6">
                  <Input
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="max-w-sm"
                  />
                  <Select>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="User type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All users</SelectItem>
                      <SelectItem value="students">Students</SelectItem>
                      <SelectItem value="employers">Employers</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-4">
                  {filteredUsers.map((user) => (
                    <div key={user.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="font-semibold">{user.name}</h4>
                            <Badge variant={user.type === "student" ? "default" : "secondary"}>
                              {user.type}
                            </Badge>
                            <Badge variant={user.verified ? "secondary" : "destructive"}>
                              {user.verified ? "Verified" : "Unverified"}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                            <div>
                              <p><strong>Email:</strong> {user.email}</p>
                              <p><strong>City:</strong> {user.city}</p>
                              <p><strong>Joined:</strong> {user.joinDate}</p>
                            </div>
                            <div>
                              <p><strong>Last Active:</strong> {user.lastActive}</p>
                              <p><strong>IP Address:</strong> {user.ipAddress}</p>
                              <p><strong>Total Spent:</strong> £{user.totalSpent.toFixed(2)}</p>
                            </div>
                          </div>
                          <p className="text-sm text-gray-500 mt-2">
                            {user.type === "student" ? user.university : user.businessName}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">View</Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="sm" variant="destructive">Suspend</Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Suspend User</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will suspend the user's account and prevent them from accessing the platform.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <Button variant="outline">Cancel</Button>
                                <Button variant="destructive" onClick={() => handleSuspendUser(user.id)}>
                                  Suspend
                                </Button>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>

                      {/* User Invoices */}
                      {user.invoices.length > 0 && (
                        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                          <h5 className="font-medium mb-2">Recent Invoices:</h5>
                          <div className="space-y-1">
                            {user.invoices.slice(0, 3).map((invoice) => (
                              <div key={invoice.id} className="flex items-center justify-between text-sm">
                                <span>{invoice.id} - {invoice.type}</span>
                                <span className="font-medium">£{invoice.amount.toFixed(2)}</span>
                                <span className="text-gray-500">{invoice.date}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Jobs Tab */}
          <TabsContent value="jobs">
            <Card>
              <CardHeader>
                <CardTitle>Job Management</CardTitle>
                <CardDescription>Monitor and moderate job postings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mb-6">
                  <Input
                    placeholder="Search jobs, companies, employers..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full sm:max-w-sm"
                  />
                  <Select value={jobFilter} onValueChange={setJobFilter}>
                    <SelectTrigger className="w-full sm:w-40">
                      <SelectValue placeholder="Filter jobs" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Jobs</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="flagged">Flagged</SelectItem>
                      <SelectItem value="expired">Expired</SelectItem>
                      <SelectItem value="sponsored">Sponsored</SelectItem>
                      <SelectItem value="basic">Basic</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-4">
                  {filteredJobs.map((job) => (
                    <div key={job.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold">{job.title}</h3>
                            <Badge variant={job.type === "sponsored" ? "default" : "secondary"}>
                              {job.type}
                            </Badge>
                            <Badge variant={job.status === "flagged" ? "destructive" : "secondary"}>
                              {job.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600">{job.company} • {job.location} • {job.salary}</p>
                          <p className="text-sm text-gray-500 mt-1">Posted by: {job.employer}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm">
                            View Details
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="destructive" size="sm">
                                Delete
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Job Posting</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete "{job.title}"? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeleteJob(job.id)}>
                                  Delete Job
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>

                      <div className="grid grid-cols-4 gap-4 text-sm text-gray-600 mb-3">
                        <div><strong>Applications:</strong> {job.applications}</div>
                        <div><strong>Category:</strong> {job.category}</div>
                        <div><strong>Posted:</strong> {job.datePosted}</div>
                        <div><strong>Expires:</strong> {job.expiresOn}</div>
                      </div>

                      <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                        {job.description}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Payments Tab */}
          <TabsContent value="payments">
            <Card>
              <CardHeader>
                <CardTitle>Payment Management</CardTitle>
                <CardDescription>View transactions and process refunds</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mb-6">
                  <Input
                    placeholder="Search by user, invoice number..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full sm:max-w-sm"
                  />
                  <Select value={paymentFilter} onValueChange={setPaymentFilter}>
                    <SelectTrigger className="w-full sm:w-40">
                      <SelectValue placeholder="Filter payments" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Payments</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                      <SelectItem value="job">Job Posts</SelectItem>
                      <SelectItem value="contact">Contact Reveals</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-4">
                  {filteredTransactions.map((transaction) => (
                    <div key={transaction.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold">{transaction.invoiceNumber}</span>
                            <Badge variant={transaction.userType === "employer" ? "default" : "secondary"}>
                              {transaction.userType}
                            </Badge>
                            <Badge variant={transaction.status === "completed" ? "default" :
                                           transaction.status === "pending" ? "secondary" : "destructive"}>
                              {transaction.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600">{transaction.user} • {transaction.type}</p>
                          <p className="text-sm text-gray-500 mt-1">{transaction.description}</p>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-lg">£{transaction.amount.toFixed(2)}</div>
                          <div className="text-sm text-gray-500">{transaction.date}</div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <div>
                          <strong>Payment Method:</strong> {transaction.paymentMethod}
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            View Receipt
                          </Button>
                          {!transaction.refunded && transaction.status === "completed" && (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="destructive" size="sm">
                                  Process Refund
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Process Refund</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to refund £{transaction.amount.toFixed(2)} to {transaction.user}?
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleRefund(transaction.id)}>
                                    Process Refund
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports">
            <Card>
              <CardHeader>
                <CardTitle>Content Moderation</CardTitle>
                <CardDescription>Review and resolve user reports</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mb-6">
                  <Input
                    placeholder="Search reports..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full sm:max-w-sm"
                  />
                  <Select value={reportFilter} onValueChange={setReportFilter}>
                    <SelectTrigger className="w-full sm:w-40">
                      <SelectValue placeholder="Filter reports" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Reports</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="under_review">Under Review</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                      <SelectItem value="high">High Priority</SelectItem>
                      <SelectItem value="medium">Medium Priority</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-4">
                  {filteredReports.map((report) => (
                    <div key={report.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold">{report.reportType}</h3>
                            <Badge variant={report.priority === "high" ? "destructive" : "secondary"}>
                              {report.priority} priority
                            </Badge>
                            <Badge variant={report.status === "resolved" ? "default" : "secondary"}>
                              {report.status.replace("_", " ")}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600">
                            Reported by: {report.reportedBy} • Target: {report.reportedUser}
                          </p>
                          {report.jobTitle && (
                            <p className="text-sm text-gray-500">Job: {report.jobTitle}</p>
                          )}
                        </div>
                        <div className="text-sm text-gray-500">{report.dateReported}</div>
                      </div>

                      <div className="mb-3">
                        <p className="text-sm font-medium text-gray-700 mb-1">Reason:</p>
                        <p className="text-sm text-gray-600">{report.reason}</p>
                      </div>

                      <div className="mb-3">
                        <p className="text-sm font-medium text-gray-700 mb-1">Description:</p>
                        <p className="text-sm text-gray-600">{report.description}</p>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <div className="text-gray-500">
                          <strong>Evidence:</strong> {report.evidence}
                        </div>
                        {report.status !== "resolved" && (
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleResolveReport(report.id, "reject")}
                            >
                              Dismiss
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleResolveReport(report.id, "approve")}
                            >
                              Take Action
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Activity Logs Tab */}
          <TabsContent value="logs">
            <Card>
              <CardHeader>
                <CardTitle>Activity Logs</CardTitle>
                <CardDescription>Monitor user activity and system events</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mb-6">
                  <Input
                    placeholder="Filter by action or user..."
                    value={logFilter}
                    onChange={(e) => setLogFilter(e.target.value)}
                    className="w-full sm:max-w-sm"
                  />
                  <Select>
                    <SelectTrigger className="w-full sm:w-40">
                      <SelectValue placeholder="Action type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All actions</SelectItem>
                      <SelectItem value="login">Login</SelectItem>
                      <SelectItem value="payment">Payment</SelectItem>
                      <SelectItem value="job">Job Actions</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  {filteredLogs.map((log) => (
                    <div key={log.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold">{log.userName}</span>
                            <Badge variant="outline" className="text-xs">
                              {log.action}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600">{log.details}</p>
                        </div>
                        <span className="text-sm text-gray-500">{log.timestamp}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-xs text-gray-500 mt-2 pt-2 border-t">
                        <div>
                          <strong>IP Address:</strong> {log.ipAddress}
                        </div>
                        <div>
                          <strong>User ID:</strong> {log.userId}
                        </div>
                      </div>
                      <div className="text-xs text-gray-400 mt-1 truncate">
                        <strong>User Agent:</strong> {log.userAgent}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <CardTitle className="text-lg">Revenue Analytics</CardTitle>
                    <Select value={revenueFilter} onValueChange={setRevenueFilter}>
                      <SelectTrigger className="w-full sm:w-40">
                        <SelectValue placeholder="Time period" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="7days">Last 7 Days</SelectItem>
                        <SelectItem value="30days">Last 30 Days</SelectItem>
                        <SelectItem value="quarter">This Quarter</SelectItem>
                        <SelectItem value="year">This Year</SelectItem>
                        <SelectItem value="all">All Time</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardHeader>
                <CardContent>
                  <SimpleBarChart data={filteredRevenue} title="Revenue Trend" color="#10B981" />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>New Users</CardTitle>
                </CardHeader>
                <CardContent>
                  <SimpleBarChart
                    data={mockChartData.weeklyUsers}
                    title="User Registrations"
                    color="#3B82F6"
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Jobs Posted</CardTitle>
                </CardHeader>
                <CardContent>
                  <SimpleBarChart
                    data={mockChartData.weeklyJobs}
                    title="Job Postings"
                    color="#F59E0B"
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Job Categories</CardTitle>
                </CardHeader>
                <CardContent>
                  <SimplePieChart data={mockChartData.categoryBreakdown} />
                </CardContent>
              </Card>

              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Platform Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-6 md:grid-cols-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">94.2%</div>
                      <p className="text-sm text-gray-600">User Satisfaction</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">£8.50</div>
                      <p className="text-sm text-gray-600">Avg. Revenue per User</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">72%</div>
                      <p className="text-sm text-gray-600">Job Success Rate</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">3.2</div>
                      <p className="text-sm text-gray-600">Avg. Applications per Job</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
