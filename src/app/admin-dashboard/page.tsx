// src/app/admin-dashboard/page.tsx
"use client"

import { useState, useEffect, useCallback } from "react"
// Standardized imports using @/components/ui alias
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Header } from "@/components/ui/header"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Logo } from "@/components/ui/logo"
import Link from "next/link"
import { Textarea } from "@/components/ui/textarea"
import { Toggle } from "@/components/ui/toggle"
import { X, UserCog } from "lucide-react"
import { Label } from "@/components/ui/label";

// Import types and data utilities
import { AdminStats, User, Job, Payment, Refund, Report, DetailedJob, DetailedPayment, AdminUser } from '@/types/admin-types'; // DetailedUser removed
import { fetchAdminStats, fetchUsers, fetchJobs, fetchPayments, fetchRefunds, fetchReports, fetchAdminUsers, deleteAdminUser, updateAdminUser } from '@/lib/data-utils';

// Import all existing admin components
import { OverviewDashboard } from '@/components/admin/OverviewDashboard';
import { UserManagementTable } from '@/components/admin/UserManagementTable';
// import { UserDetailsModal } from '@/components/admin/UserDetailsModal'; // UserDetailsModal removed
import { JobManagementTable } from '@/components/admin/JobManagementTable';
import { JobDetailsModal } from '@/components/admin/JobDetailsModal';
import { PaymentManagementTable } from '@/components/admin/PaymentManagementTable';
import { PaymentDetailsModal } from '@/components/admin/PaymentDetailsModal';
import { RefundManagementTable } from '@/components/admin/RefundManagementTable';
import { ReportManagementTable } from '@/components/admin/ReportManagementTable';
import { AdminUserManagementTable } from '@/components/admin/AdminUserManagementTable';
import { AddAdminUserModal } from '@/components/admin/AddAdminUserModal';
import { EditAdminUserModal } from '@/components/admin/EditAdminUserModal';
import { DeleteAdminUserConfirmation } from '@/components/admin/DeleteAdminUserConfirmation';
// Import the new AddUserModal
import { AddUserModal } from "@/components/admin/AddUserModal"; // Import AddUserModal

// --- UPDATED IMPORTS FOR AUTHENTICATION ---
import { useRouter } from "next/navigation";
import { useAdminAuth } from '@/app/admin-auth/AdminAuthContext';
// --- END UPDATED IMPORTS ---


export default function Home() {
  const router = useRouter();
  const { isAuthenticated, isLoading, logout } = useAdminAuth();

  const [activeTab, setActiveTab] = useState("overview");

  // Inside src/app/admin-dashboard/page.tsx, within the Home component:
  const [isAddAdminUserModalOpen, setIsAddAdminUserModalOpen] = useState(false);
  const [isEditAdminUserModalOpen, setIsEditAdminUserModalOpen] = useState(false);
  const [isDeleteAdminUserConfirmationOpen, setIsDeleteAdminUserConfirmationOpen] = useState(false);
  const [selectedAdminUserId, setSelectedAdminUserId] = useState<string | null>(null);

  // NEW: State for the Add User Modal (for normal users)
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false); // NEW STATE

  // State for Overview tab data
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState<string | null>(null);

  // State for User Management
  const [users, setUsers] = useState<User[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [usersError, setUsersError] = useState<string | null>(null);
  // const [isUserDetailsModalOpen, setIsUserDetailsModalOpen] = useState(false); // Removed
  // const [selectedUserId, setSelectedUserId] = useState<string | null>(null); // Removed

  // State for Job Management
  const [jobs, setJobs] = useState<Job[]>([]);
  const [jobsLoading, setJobsLoading] = useState(true);
  const [jobsError, setJobsError] = useState<string | null>(null);
  const [isJobDetailsModalOpen, setIsJobDetailsModalOpen] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);

  // State for Payment Management
  const [payments, setPayments] = useState<Payment[]>([]);
  const [paymentsLoading, setPaymentsLoading] = useState(true);
  const [paymentsError, setPaymentsError] = useState<string | null>(null);
  const [isPaymentDetailsModalOpen, setIsPaymentDetailsModalOpen] = useState(false);
  const [selectedPaymentId, setSelectedPaymentId] = useState<string | null>(null);

  // State for Refund Management
  const [refunds, setRefunds] = useState<Refund[]>([]);
  const [refundsLoading, setRefundsLoading] = useState(true);
  const [refundsError, setRefundsError] = useState<string | null>(null);

  // State for Report Management (Moderation)
  const [reports, setReports] = useState<Report[]>([]);
  const [reportsLoading, setReportsLoading] = useState(true);
  const [reportsError, setReportsError] = useState<string | null>(null);

  // --- NEW STATES FOR NEW TABS ---
  // Updated type definition for email templates to include content
  interface EmailTemplate {
    id: string;
    name: string;
    subject: string;
    type: string;
    status: string;
    lastUpdated: string;
    channel: string;
    htmlContent: string;
    textContent: string;
  }
  const [emailTemplates, setEmailTemplates] = useState<EmailTemplate[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [fraudulentAds, setFraudulentAds] = useState<any[]>([]);
  // NEW: State for Admin Users Management
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [adminUsersLoading, setAdminUsersLoading] = useState(true);
  const [adminUsersError, setAdminUsersError] = useState<string | null>(null);

  // State for current template being edited
  const [currentTemplateId, setCurrentTemplateId] = useState<string | null>(null);
  const [currentTemplateName, setCurrentTemplateName] = useState('');
  const [currentTemplateSubject, setCurrentTemplateSubject] = useState('');
  const [currentTemplateTypeSelected, setCurrentTemplateTypeSelected] = useState('');
  const [currentTemplateChannel, setCurrentTemplateChannel] = useState('');
  const [currentTemplateContent, setCurrentTemplateContent] = useState('');
  const [currentContentFormat, setCurrentContentFormat] = useState('html');
  const [selectedTheme, setSelectedTheme] = useState('default');

  const [isRogueDetectionEnabled, setIsRogueDetectionEnabled] = useState(true);
  const [jobFilterKeywords, setJobFilterKeywords] = useState<string[]>(['badword', 'scam', 'fraud']);
  const [newFilterKeyword, setNewFilterKeyword] = useState('');

  // --- Data Fetching Functions (Wrapped in useCallback for memoization) ---

  const getStats = useCallback(async () => {
    try {
      setStatsLoading(true);
      const data = await fetchAdminStats();
      setStats(data);
    } catch (err) {
      console.error("Error fetching admin stats:", err);
      setStatsError("Failed to fetch admin statistics.");
    } finally {
      setStatsLoading(false);
    }
  }, []);

  const getUsers = useCallback(async () => {
    try {
      setUsersLoading(true);
      const data = await fetchUsers();
      setUsers(data);
    } catch (err) {
      console.error("Error fetching users:", err);
      setUsersError("Failed to fetch users.");
    } finally {
      setUsersLoading(false);
    }
  }, []);

  const getJobs = useCallback(async () => {
    try {
      setJobsLoading(true);
      const data = await fetchJobs();
      setJobs(data);
    } catch (err) {
      console.error("Error fetching jobs:", err);
      setJobsError("Failed to fetch jobs.");
    } finally {
      setJobsLoading(false);
    }
  }, []);

  const getPayments = useCallback(async () => {
    try {
      setPaymentsLoading(true);
      const data = await fetchPayments();
      setPayments(data);
    } catch (err) {
      console.error("Error fetching payments:", err);
      setPaymentsError("Failed to fetch payments.");
    } finally {
      setPaymentsLoading(false);
    }
  }, []);

  // --- NEW DATA FETCHING FUNCTIONS ---
  const getRefunds = useCallback(async () => {
    try {
      setRefundsLoading(true);
      const data = await fetchRefunds();
      setRefunds(data);
    } catch (err) {
      console.error("Error fetching refunds:", err);
      setRefundsError("Failed to fetch refunds.");
    } finally {
      setRefundsLoading(false);
    }
  }, []);

  const getReports = useCallback(async () => {
    try {
      setReportsLoading(true);
      const data = await fetchReports();
      setReports(data);
    } catch (err) {
      console.error("Error fetching reports:", err);
      setReportsError("Failed to fetch reports.");
    } finally {
      setReportsLoading(false);
    }
  }, []);

  const getEmailTemplates = useCallback(async () => {
    console.log("Fetching email templates...");
    // This is mock data; replace with actual API call
    setEmailTemplates([
      {
        id: '1', name: 'Welcome Email', subject: 'Welcome to Our Platform!', type: 'User', status: 'Active', lastUpdated: '2025-07-20', channel: 'Email',
        htmlContent: `<p>Dear {{userName}},</p><p>Welcome to our platform! We're excited to have you.</p><p>Best regards,<br/>The Team</p>`,
        textContent: `Dear {{userName}},\n\nWelcome to our platform! We're excited to have you.\n\nBest regards,\nThe Team`
      },
      {
        id: '2', name: 'Job Application Confirmation', subject: 'Your Application for {{jobTitle}}', type: 'Job Seeker', status: 'Active', lastUpdated: '2025-07-21', channel: 'Email',
        htmlContent: `<p>Hi {{userName}},</p><p>Your application for <strong>{{jobTitle}}</strong> at {{companyName}} has been received.</p><p>View your application: <a href="{{applicationLink}}">{{applicationLink}}</a></p>`,
        textContent: `Hi {{userName}},\n\nYour application for {{jobTitle}} at {{companyName}} has been received.\n\nView your application: {{applicationLink}}`
      },
      {
        id: '3', name: 'Job Post Approved Notification', subject: 'Your Job Post Has Been Approved!', type: 'Employer', status: 'Draft', lastUpdated: '2025-07-22', channel: 'In-App',
        htmlContent: `<p>Great news, {{companyName}}!</p><p>Your job post for <strong>{{jobTitle}}</strong> has been approved and is now live.</p>`,
        textContent: `Great news, {{companyName}}!\n\nYour job post for {{jobTitle}} has been approved and is now live.`
      },
      {
        id: '4', name: 'Password Reset SMS', subject: 'Password Reset Code', type: 'User', status: 'Active', lastUpdated: '2025-07-19', channel: 'SMS',
        htmlContent: `Your password reset code is: {{resetCode}}. It expires in 10 minutes.`,
        textContent: `Your password reset code is: {{resetCode}}. It expires in 10 minutes.`
      },
    ]);
  }, []);

  const getAuditLogs = useCallback(async () => {
    // Implement API call to fetch audit logs
    console.log("Fetching audit logs...");
    // This is mock data; replace with actual API call
    setAuditLogs([
      { id: '1', timestamp: '2025-07-25 10:00:00', user: 'Admin User 1', action: 'Approved Job: Job A', ip: '192.168.1.1', browser: 'Chrome' },
      { id: '2', timestamp: '2025-07-25 09:30:00', user: 'Admin User 2', action: 'Suspended User: User B', ip: '10.0.0.5', browser: 'Firefox' },
    ]);
  }, []);

  const getFraudulentAds = useCallback(async () => {
    // Implement API call to fetch fraudulent ads
    console.log("Fetching fraudulent ads...");
    // This is mock data; replace with actual API call
    setFraudulentAds([
      { id: '1', title: 'Work from home - Easy Money', reportedBy: 'User C', status: 'Pending Review' },
      { id: '2', title: 'Urgent: Investment Opportunity', reportedBy: 'System', status: 'Flagged by AI' },
    ]);
  }, []);

 // ✅ Updated Data Fetching for Admin Users (CORRECTED MAPPING to include first_name and last_name)
const getAdminUsers = useCallback(async () => {
  try {
    setAdminUsersLoading(true);
    setAdminUsersError(null);

    const data = await fetchAdminUsers();
    console.log("✅ Raw admin users fetched in page.tsx:", data);
    
    // CORRECTED: Ensure first_name and last_name are included in normalizedData
    const normalizedData = data.map((admin: any) => ({
      admin_id: admin.admin_id || admin.id,
      username: admin.username,
      admin_email: admin.admin_email,
      first_name: admin.first_name, // <-- ADDED THIS LINE
      last_name: admin.last_name,   // <-- ADDED THIS LINE
      role: admin.role || 'admin',
      is_active: admin.is_active,
      admin_roles: admin.admin_roles || [],
      access_level: admin.access_level ?? 1,
      created_at: admin.created_at || new Date().toISOString(),
      updated_at: admin.updated_at || new Date().toISOString(),
      last_login_at: admin.last_login_at || null,
    }));

    console.log("✅ Normalized admin users in page.tsx:", normalizedData);

    setAdminUsers(normalizedData);
  } catch (err: any) {
    console.error("❌ Error fetching admin users in page.tsx:", err);
    setAdminUsersError(err.message || "Failed to fetch admin users.");
  } finally {
    setAdminUsersLoading(false);
  }
}, []);


  // --- Handlers for Modals (existing) ---

  // User Details Modal - REMOVED
  // const handleViewUserDetails = (userId: string) => {
  //   setSelectedUserId(userId);
  //   setIsUserDetailsModalOpen(true);
  // };

  // const handleCloseUserDetailsModal = () => {
  //   setIsUserDetailsModalOpen(false);
  //   setSelectedUserId(null);
  //   getUsers(); // Refresh user list after modal closes, in case of changes
  // };

  // Job Details Modal
  const handleViewJobDetails = (jobId: string) => {
    setSelectedJobId(jobId);
    setIsJobDetailsModalOpen(true);
  };

  const handleCloseJobDetailsModal = () => {
    setIsJobDetailsModalOpen(false);
    setSelectedJobId(null);
    getJobs(); // Refresh job list after modal closes, in case of changes
  };

  // Payment Details Modal
  const handleViewPaymentDetails = (paymentId: string) => {
    setSelectedPaymentId(paymentId);
    setIsPaymentDetailsModalOpen(true);
  };

  const handleClosePaymentDetailsModal = () => {
    setIsPaymentDetailsModalOpen(false);
    setSelectedPaymentId(null);
    getPayments(); // Refresh payment list after modal closes, in case of changes
  };

  // Handler for refund actions (placeholder)
  const handleProcessRefund = (refundId: string, action: string) => {
    console.log(`Processing refund ${refundId}: ${action}`);
    // Implement API call to process refund
    getRefunds(); // Refresh refunds list
  };

  // Handler for report actions (placeholder)
  const handleUpdateReportStatus = (reportId: string, newStatus: string) => {
    console.log(`Updating report ${reportId} status to ${newStatus}`);
    // Implement API call to update report status
    getReports(); // Refresh reports list
  };

  // --- Handlers for new sections (placeholders) ---

  // Handle loading a template into the editor
  const handleEditTemplate = (template: EmailTemplate) => {
    setCurrentTemplateId(template.id);
    setCurrentTemplateName(template.name);
    setCurrentTemplateSubject(template.subject);
    setCurrentTemplateTypeSelected(template.type);
    setCurrentTemplateChannel(template.channel);
    // Determine which content to load based on the currentContentFormat
    setCurrentTemplateContent(currentContentFormat === 'html' ? template.htmlContent : template.textContent);
  };

  // Handle saving the current template
  const handleSaveEmailTemplate = () => {
    if (!currentTemplateId) {
      console.log("No template selected to save or creating a new template.");
      console.log("Saving new/modified template content:", currentTemplateContent);
      console.log("Template Name:", currentTemplateName);
      console.log("Template Subject:", currentTemplateSubject);
      console.log("Template Type:", currentTemplateTypeSelected);
      console.log("Template Channel:", currentTemplateChannel);
      console.log("Selected Theme:", selectedTheme);
      return;
    }
    setEmailTemplates(prevTemplates =>
      prevTemplates.map(template =>
        template.id === currentTemplateId
          ? {
            ...template,
            name: currentTemplateName,
            subject: currentTemplateSubject,
            type: currentTemplateTypeSelected,
            channel: currentTemplateChannel,
            htmlContent: currentContentFormat === 'html' ? currentTemplateContent : template.htmlContent,
            textContent: currentContentFormat === 'text' ? currentTemplateContent : template.textContent,
            lastUpdated: new Date().toISOString().slice(0, 10),
          }
          : template
      )
    );
    console.log(`Saving template ${currentTemplateId} with content: ${currentTemplateContent}`);
  };

  const handleToggleRogueDetection = () => {
    setIsRogueDetectionEnabled(prevState => !prevState);
    console.log(`Rogue word detection toggled to ${!isRogueDetectionEnabled}`);
  };

  const handleAddJobFilterKeyword = () => {
    if (newFilterKeyword.trim() !== '') {
      setJobFilterKeywords(prev => [...prev, newFilterKeyword.trim()]);
      setNewFilterKeyword('');
      console.log(`Adding job filter keyword: ${newFilterKeyword}`);
    }
  };

  const handleRemoveJobFilterKeyword = (keywordToRemove: string) => {
    setJobFilterKeywords(prev => prev.filter(k => k !== keywordToRemove));
    console.log(`Removing job filter keyword: ${keywordToRemove}`);
  };

  const handleReviewFraudAd = (adId: string, action: string) => {
    console.log(`Reviewing fraud ad ${adId}: ${action}`);
    getFraudulentAds();
  };

  const handleBotProtectionSetting = (setting: string) => {
    console.log(`Updating bot protection setting: ${setting}`);
  };

  // NEW: Admin User Management Handlers
  const handleAddAdminUser = () => {
    console.log("Add New Admin User clicked.");
    setIsAddAdminUserModalOpen(true); // Open Add Admin User Modal
  };

  const handleEditAdminUser = (userId: string) => {
    console.log(`Edit Admin User ${userId} clicked.`);
    setSelectedAdminUserId(userId);
    setIsEditAdminUserModalOpen(true); // Open Edit Admin User Modal
  };

  const confirmDeleteAdminUser = useCallback(async () => {
    if (selectedAdminUserId) {
      try {
        await deleteAdminUser(selectedAdminUserId);
        getAdminUsers(); // Refresh the list of admin users
        setIsDeleteAdminUserConfirmationOpen(false); // Close the modal
        setSelectedAdminUserId(null); // Clear selected user ID
        console.log(`Admin user ${selectedAdminUserId} deleted successfully.`);
      } catch (error) {
        console.error("Failed to delete admin user:", error);
        // Handle error, e.g., show a toast notification
      }
    }
  }, [selectedAdminUserId, getAdminUsers]);

  // NEW: Handler for toggling admin user status
  const handleToggleAdminUserStatus = useCallback(async (adminId: string, isActive: boolean) => {
    try {
      // Optimistically update the UI
      setAdminUsers(prevUsers =>
        prevUsers.map(user =>
          user.admin_id === adminId ? { ...user, is_active: isActive } : user
        )
      );

      // Call the API to update the status in the backend
      await updateAdminUser(adminId, { is_active: isActive });
      console.log(`Admin user ${adminId} status updated to ${isActive}`);
      // Re-fetch users to ensure data consistency, or handle error if API call fails
      getAdminUsers();
    } catch (error) {
      console.error("Failed to update admin user status:", error);
      // Revert UI if API call fails
      setAdminUsers(prevUsers =>
        prevUsers.map(user =>
          user.admin_id === adminId ? { ...user, is_active: !isActive } : user
        )
      );
      // Optionally show an error message to the user
    }
  }, [getAdminUsers]);


  // --- useEffects for Data Fetching based on Active Tab and Authentication ---

  // Only fetch stats if authenticated
  useEffect(() => {
    if (isAuthenticated) {
      getStats();
    }
  }, [isAuthenticated, getStats]); // Dependency on isAuthenticated

  useEffect(() => {
    if (isAuthenticated && activeTab === "users") {
      getUsers();
    }
  }, [isAuthenticated, activeTab, getUsers]);

  useEffect(() => {
    if (isAuthenticated && activeTab === "jobs") {
      getJobs();
    }
  }, [isAuthenticated, activeTab, getJobs]);

  useEffect(() => {
    if (isAuthenticated && activeTab === "payments") {
      getPayments();
    }
  }, [isAuthenticated, activeTab, getPayments]);

  // --- NEW USEEFFECTS FOR ADDITIONAL FEATURES ---
  useEffect(() => {
    if (isAuthenticated && activeTab === "refunds") {
      getRefunds();
    }
  }, [isAuthenticated, activeTab, getRefunds]);

  useEffect(() => {
    if (isAuthenticated && activeTab === "reports") {
      getReports();
    }
  }, [isAuthenticated, activeTab, getReports]);

  useEffect(() => {
    if (isAuthenticated && activeTab === "email-templates") {
      getEmailTemplates();
    }
  }, [isAuthenticated, activeTab, getEmailTemplates]);

  useEffect(() => {
    if (isAuthenticated && activeTab === "audit-consent") {
      getAuditLogs();
    }
  }, [isAuthenticated, activeTab, getAuditLogs]);

  useEffect(() => {
    if (isAuthenticated && activeTab === "content-moderation") {
      getFraudulentAds();
    }
  }, [isAuthenticated, activeTab, getFraudulentAds]);

  // NEW: useEffect for Admin Users
  useEffect(() => {
    if (isAuthenticated && activeTab === "admin-users") {
      console.log("✅ useEffect triggered: Fetching Admin Users");
      getAdminUsers();
    }
  }, [isAuthenticated, activeTab, getAdminUsers]);


  // --- AUTHENTICATION CHECK useEffect ---
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/admin-login');
    }
  }, [isAuthenticated, isLoading, router]);

  // Construct a dummy user object for the header if authenticated
  const adminUser: User | null = isAuthenticated ? {
    user_id: 'admin-user-id',
    user_username: 'Admin',
    user_email: 'admin@example.com',
    user_type: 'admin',
    registration_date: new Date().toISOString(), // Use registration_date to match User type
  } : null;


  // Render nothing or a loading spinner while authentication status is being checked
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-900 text-gray-100">
        <p>Loading authentication status...</p>
      </div>
    );
  }

  // Render the admin panel only if authenticated
  if (!isAuthenticated) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-900 text-gray-100">
        <p>Redirecting to login...</p>
      </div>
    );
  }

  // If authenticated, render the full admin panel
  return (
    <div className="flex min-h-screen w-full flex-col bg-gray-900 text-gray-100">
      {/* HEADER COMPONENT - className added for page-specific styling */}
      <Header
        className="fixed top-0 left-0 right-0 z-50 bg-gray-900/80 backdrop-blur-md border-b border-gray-800 text-gray-100"
        adminDashboardMode={true}
        user={adminUser}
        logout={logout}
      />

      {/* Main content area - added pt-16 to push content below the fixed header */}
      <div className="flex flex-1 pt-16">
        <aside className="w-64 border-r border-gray-800 bg-gray-900 p-4">
          <nav className="space-y-2">
            {/* Sidebar Links - These now exclusively control the active tab */}
            <Link href="#" onClick={() => setActiveTab("overview")} className={`flex items-center gap-2 rounded-md px-3 py-2 transition-colors ${activeTab === "overview" ? "bg-gray-800 text-white" : "text-gray-300 hover:bg-gray-800 hover:text-white"}`}>
              <span className="text-lg">📊</span> Overview
            </Link>
            <Link href="#" onClick={() => setActiveTab("users")} className={`flex items-center gap-2 rounded-md px-3 py-2 transition-colors ${activeTab === "users" ? "bg-gray-800 text-white" : "text-gray-300 hover:bg-gray-800 hover:text-white"}`}>
              <span className="text-lg">👥</span> Users
            </Link>
            {/* NEW ADMIN USERS TAB */}
            <Link href="#" onClick={() => setActiveTab("admin-users")} className={`flex items-center gap-2 rounded-md px-3 py-2 transition-colors ${activeTab === "admin-users" ? "bg-gray-800 text-white" : "text-gray-300 hover:bg-gray-800 hover:text-white"}`}>
              <UserCog className="h-5 w-5" /> Admin Users
            </Link>
            <Link href="#" onClick={() => setActiveTab("jobs")} className={`flex items-center gap-2 rounded-md px-3 py-2 transition-colors ${activeTab === "jobs" ? "bg-gray-800 text-white" : "text-gray-300 hover:bg-gray-800 hover:text-white"}`}>
              <span className="text-lg">💼</span> Jobs
            </Link>
            <Link href="#" onClick={() => setActiveTab("payments")} className={`flex items-center gap-2 rounded-md px-3 py-2 transition-colors ${activeTab === "payments" ? "bg-gray-800 text-white" : "text-gray-300 hover:bg-gray-800 hover:text-white"}`}>
              <span className="text-lg">💰</span> Payments
            </Link>
            <Link href="#" onClick={() => setActiveTab("refunds")} className={`flex items-center gap-2 rounded-md px-3 py-2 transition-colors ${activeTab === "refunds" ? "bg-gray-800 text-white" : "text-gray-300 hover:bg-gray-800 hover:text-white"}`}>
              <span className="text-lg">↩️</span> Refunds
            </Link>
            <Link href="#" onClick={() => setActiveTab("reports")} className={`flex items-center gap-2 rounded-md px-3 py-2 transition-colors ${activeTab === "reports" ? "bg-gray-800 text-white" : "text-gray-300 hover:bg-gray-800 hover:text-white"}`}>
              <span className="text-lg">🛡️</span> Moderation
            </Link>
            <Link href="#" onClick={() => setActiveTab("analytics")} className={`flex items-center gap-2 rounded-md px-3 py-2 transition-colors ${activeTab === "analytics" ? "bg-gray-800 text-white" : "text-gray-300 hover:bg-gray-800 hover:text-white"}`}>
              <span className="text-lg">📈</span> Analytics & Insights
            </Link>
            <Link href="#" onClick={() => setActiveTab("promotions")} className={`flex items-center gap-2 rounded-md px-3 py-2 transition-colors ${activeTab === "promotions" ? "bg-gray-800 text-white" : "text-gray-300 hover:bg-gray-800 hover:text-white"}`}>
              <span className="text-lg">🎁</span> Promotions
            </Link>
            {/* NEW ADVANCED SIDEBAR LINKS - Renamed to email-templates */}
            <Link href="#" onClick={() => setActiveTab("email-templates")} className={`flex items-center gap-2 rounded-md px-3 py-2 transition-colors ${activeTab === "email-templates" ? "bg-gray-800 text-white" : "text-gray-300 hover:bg-gray-700 hover:text-white"}`}>
              <span className="text-lg">📧</span> Email Templates
            </Link>
            <Link href="#" onClick={() => setActiveTab("audit-consent")} className={`flex items-center gap-2 rounded-md px-3 py-2 transition-colors ${activeTab === "audit-consent" ? "bg-gray-800 text-white" : "text-gray-300 hover:bg-gray-700 hover:text-white"}`}>
              <span className="text-lg">📝</span> Consent
            </Link>
            <Link href="#" onClick={() => setActiveTab("content-moderation")} className={`flex items-center gap-2 rounded-md px-3 py-2 transition-colors ${activeTab === "content-moderation" ? "bg-gray-800 text-white" : "text-gray-300 hover:bg-gray-700 hover:text-white"}`}>
              <span className="text-lg">🚫</span> Content Moderation
            </Link>
            <Link href="#" onClick={() => setActiveTab("security")} className={`flex items-center gap-2 rounded-md px-3 py-2 transition-colors ${activeTab === "security" ? "bg-gray-800 text-white" : "text-gray-300 hover:bg-gray-700 hover:text-white"}`}>
              <span className="text-lg">🔒</span> Security Settings
            </Link>
          </nav>
        </aside>

        <div className="flex-1 p-8 overflow-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            {/* Hidden TabsList - controlled by sidebar navigation */}
            <TabsList className="hidden">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="users">User Management</TabsTrigger>
              <TabsTrigger value="admin-users">Admin User Management</TabsTrigger>
              <TabsTrigger value="jobs">Job Management</TabsTrigger>
              <TabsTrigger value="payments">Payment Management</TabsTrigger>
              <TabsTrigger value="refunds">Refund Management</TabsTrigger>
              <TabsTrigger value="reports">Report Management</TabsTrigger>
              <TabsTrigger value="analytics">Analytics & Insights</TabsTrigger>
              <TabsTrigger value="promotions">Promotions</TabsTrigger>
              <TabsTrigger value="email-templates">Email Templates</TabsTrigger>
              <TabsTrigger value="audit-consent">Audit & Consent</TabsTrigger>
              <TabsTrigger value="content-moderation">Content Moderation</TabsTrigger>
              <TabsTrigger value="security">Security Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <OverviewDashboard stats={stats} loading={statsLoading} error={statsError} />
            </TabsContent>

            <TabsContent value="users" className="pt-0"> {/* Added pt-0 to remove top padding from TabsContent */}
              <UserManagementTable
                initialUsers={users}
                onUserUpdated={getUsers}
                onAddUser={() => setIsAddUserModalOpen(true)} // CORRECTED: Now opens the AddUserModal
                // onViewDetails={handleViewUserDetails} // Removed
              />
            </TabsContent>

            {/* NEW TAB CONTENT: Admin User Management */}
            <TabsContent value="admin-users">
              <Card className="bg-gray-800 text-gray-100 border-gray-700">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-white">Admin User Accounts</CardTitle>
                  <Button
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                    onClick={handleAddAdminUser}
                  >
                    Add New Admin
                  </Button>
                </CardHeader>
                <CardContent>
                   <AdminUserManagementTable
                    adminUsers={adminUsers}
                    loading={adminUsersLoading}
                    error={adminUsersError}
                    onEditAdminUser={handleEditAdminUser}
                    onDeleteAdminUser={(userId) => {
                      setSelectedAdminUserId(userId);
                      setIsDeleteAdminUserConfirmationOpen(true);
                    }}
                    onToggleAdminUserStatus={handleToggleAdminUserStatus}
                  />
                </CardContent>
              </Card>
            </TabsContent>


            <TabsContent value="jobs">
              <Card className="bg-gray-800 text-gray-100 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Job Management</CardTitle>
                  <CardDescription className="text-gray-400">Approve, reject, or edit job listings.</CardDescription>
                </CardHeader>
                <CardContent>
                  <JobManagementTable
                    jobs={jobs}
                    loading={jobsLoading}
                    error={jobsError}
                    onViewDetails={handleViewJobDetails}
                    onJobUpdated={getJobs} // Pass the refresh function
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="payments">
              <Card className="bg-gray-800 text-gray-100 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Payment Management</CardTitle>
                  <CardDescription className="text-gray-400">Track and manage all platform payments.</CardDescription>
                </CardHeader>
                <CardContent>
                  <PaymentManagementTable
                    payments={payments}
                    loading={paymentsLoading}
                    error={paymentsError}
                    onViewDetails={handleViewPaymentDetails}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            {/* NEW TAB CONTENT: Refund Management */}
            <TabsContent value="refunds">
              <Card className="bg-gray-800 text-gray-100 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Refund Management</CardTitle>
                  <CardDescription className="text-gray-400">Process and track refund requests.</CardDescription>
                </CardHeader>
                <CardContent>
                  <RefundManagementTable
                    refunds={refunds}
                    loading={refundsLoading}
                    error={refundsError}
                    onProcessRefund={handleProcessRefund}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            {/* NEW TAB CONTENT: Report Management (Moderation) */}
            <TabsContent value="reports">
              <Card className="bg-gray-800 text-gray-100 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Moderation Reports</CardTitle>
                  <CardDescription className="text-gray-400">Review and act on user-submitted reports.</CardDescription>
                </CardHeader>
                <CardContent>
                  <ReportManagementTable
                    reports={reports}
                    loading={reportsLoading}
                    error={reportsError}
                    onUpdateReportStatus={handleUpdateReportStatus}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            {/* NEW TAB CONTENT: Analytics & Insights */}
            <TabsContent value="analytics">
              <Card className="bg-gray-800 text-gray-100 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Analytics & Insights</CardTitle>
                  <CardDescription className="text-gray-400">Comprehensive data visualizations for platform performance.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <Card className="bg-gray-700 text-gray-100 border-gray-600">
                      <CardHeader>
                        <CardTitle className="text-white">User Growth (Last 30 Days)</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {/* Placeholder for a Chart component (e.g., from Recharts or Chart.js) */}
                        <div className="h-48 bg-gray-600 rounded flex items-center justify-center">
                          <p className="text-gray-400">Chart Placeholder</p>
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="bg-gray-700 text-gray-100 border-gray-600">
                      <CardHeader>
                        <CardTitle className="text-white">Revenue Trend</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="h-48 bg-gray-600 rounded flex items-center justify-center">
                          <p className="text-gray-400">Chart Placeholder</p>
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="bg-gray-700 text-gray-100 border-gray-600">
                      <CardHeader>
                        <CardTitle className="text-white">Job Postings vs. Applications</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="h-48 bg-gray-600 rounded flex items-center justify-center">
                          <p className="text-gray-400">Chart Placeholder</p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* NEW TAB CONTENT: Promotions */}
            <TabsContent value="promotions">
              <Card className="bg-gray-800 text-gray-100 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Promotions & Campaigns</CardTitle>
                  <CardDescription className="text-gray-400">Manage promotional codes, discounts, and marketing campaigns.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-200">Create New Promotion</h3>
                      <p className="text-gray-400">Define new discount codes or special offers.</p>
                      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input placeholder="Promotion Code" className="bg-gray-700 border-gray-600 text-white" />
                        <Input type="number" placeholder="Discount Percentage (%)" className="bg-gray-700 border-gray-600 text-white" />
                        <Input type="date" className="bg-gray-700 border-gray-600 text-white" />
                        <Input type="date" className="bg-gray-700 border-gray-600 text-white" />
                        <Select>
                          <SelectTrigger className="w-full bg-gray-700 border-gray-600 text-white">
                            <SelectValue placeholder="Applies to" />
                          </SelectTrigger>
                          <SelectContent className="bg-gray-800 text-gray-100 border-gray-700">
                            <SelectItem value="all">All Users</SelectItem>
                            <SelectItem value="new">New Users</SelectItem>
                            <SelectItem value="employers">Employers</SelectItem>
                            <SelectItem value="job_seekers">Job Seekers</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <Button className="mt-4 bg-blue-600 hover:bg-blue-700 text-white">Create Promotion</Button>
                    </div>

                    <div className="border-t border-gray-700 pt-6">
                      <h3 className="text-lg font-semibold text-gray-200">Active Promotions</h3>
                      <p className="text-gray-400">List of currently active promotions.</p>
                      <div className="mt-4">
                        {/* Placeholder for a table of promotions */}
                        <div className="bg-gray-700 p-4 rounded text-gray-400">
                          <p>No active promotions.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* NEW TAB CONTENT: Email Templates - Renamed from Communications */}
            <TabsContent value="email-templates">
              <Card className="bg-gray-800 text-gray-100 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Email & In-App Templates</CardTitle>
                  <CardDescription className="text-gray-400">Manage and customize communication templates for various user interactions.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex space-x-4 mb-6">
                    {/* List of templates */}
                    <div className="w-1/3 border-r border-gray-700 pr-4 space-y-2 max-h-96 overflow-y-auto">
                      <h4 className="text-md font-semibold text-gray-200 mb-3">Available Templates</h4>
                      {emailTemplates.map(template => (
                        <Button
                          key={template.id}
                          variant="ghost"
                          className={`w-full justify-start text-left px-3 py-2 rounded-md transition-colors ${currentTemplateId === template.id ? 'bg-blue-600 text-white hover:bg-blue-700' : 'text-gray-300 hover:bg-gray-700 hover:text-white'}`}
                          onClick={() => handleEditTemplate(template)}
                        >
                          <span className="font-medium">{template.name}</span>
                          <Badge className="ml-auto bg-gray-600 text-gray-200">{template.status}</Badge>
                        </Button>
                      ))}
                    </div>

                    {/* Template editor */}
                    <div className="w-2/3">
                      <h3 className="text-lg font-semibold text-gray-200 mb-4">Template Editor</h3>
                      {currentTemplateId ? (
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="templateName" className="text-gray-300">Template Name</Label>
                            <Input
                              id="templateName"
                              value={currentTemplateName}
                              onChange={(e) => setCurrentTemplateName(e.target.value)}
                              className="bg-gray-700 border-gray-600 text-white mt-1"
                            />
                          </div>
                          <div>
                            <Label htmlFor="templateSubject" className="text-gray-300">Subject/Title</Label>
                            <Input
                              id="templateSubject"
                              value={currentTemplateSubject}
                              onChange={(e) => setCurrentTemplateSubject(e.target.value)}
                              className="bg-gray-700 border-gray-600 text-white mt-1"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="templateType" className="text-gray-300">Type</Label>
                              <Select value={currentTemplateTypeSelected} onValueChange={setCurrentTemplateTypeSelected}>
                                <SelectTrigger id="templateType" className="w-full bg-gray-700 border-gray-600 text-white mt-1">
                                  <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                                <SelectContent className="bg-gray-800 text-gray-100 border-gray-700">
                                  <SelectItem value="User">User</SelectItem>
                                  <SelectItem value="Employer">Employer</SelectItem>
                                  <SelectItem value="Job Seeker">Job Seeker</SelectItem>
                                  <SelectItem value="System">System</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label htmlFor="templateChannel" className="text-gray-300">Channel</Label>
                              <Select value={currentTemplateChannel} onValueChange={setCurrentTemplateChannel}>
                                <SelectTrigger id="templateChannel" className="w-full bg-gray-700 border-gray-600 text-white mt-1">
                                  <SelectValue placeholder="Select channel" />
                                <SelectContent className="bg-gray-800 text-gray-100 border-gray-700">
                                  <SelectItem value="Email">Email</SelectItem>
                                  <SelectItem value="In-App">In-App Notification</SelectItem>
                                  <SelectItem value="SMS">SMS</SelectItem>
                                </SelectContent>
                              </SelectTrigger>
                            </Select>
                          </div>
                          </div>

                          <div>
                            <Label htmlFor="contentFormat" className="text-gray-300">Content Format</Label>
                            <Select value={currentContentFormat} onValueChange={(value) => {
                              setCurrentContentFormat(value);
                              // Load appropriate content when format changes
                              const template = emailTemplates.find(t => t.id === currentTemplateId);
                              if (template) {
                                setCurrentTemplateContent(value === 'html' ? template.htmlContent : template.textContent);
                              }
                            }}>
                              <SelectTrigger id="contentFormat" className="w-full bg-gray-700 border-gray-600 text-white mt-1">
                                <SelectValue placeholder="Select format" />
                              </SelectTrigger>
                              <SelectContent className="bg-gray-800 text-gray-100 border-gray-700">
                                <SelectItem value="html">HTML</SelectItem>
                                <SelectItem value="text">Plain Text</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <Label htmlFor="templateContent" className="text-gray-300">Content</Label>
                            <Textarea
                              id="templateContent"
                              value={currentTemplateContent}
                              onChange={(e) => setCurrentTemplateContent(e.target.value)}
                              rows={10}
                              className="bg-gray-700 border-gray-600 text-white mt-1"
                            />
                          </div>

                          <div>
                            <Label htmlFor="templateTheme" className="text-gray-300">Template Theme/Layout</Label>
                            <Select value={selectedTheme} onValueChange={setSelectedTheme}>
                              <SelectTrigger id="templateTheme" className="w-full bg-gray-700 border-gray-600 text-white mt-1">
                                <SelectValue placeholder="Select theme" />
                              </SelectTrigger>
                              <SelectContent className="bg-gray-800 text-gray-100 border-gray-700">
                                <SelectItem value="default">Default Theme</SelectItem>
                                <SelectItem value="minimal">Minimal Layout</SelectItem>
                                <SelectItem value="promotional">Promotional Layout</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={handleSaveEmailTemplate}>Save Template</Button>
                        </div>
                      ) : (
                        <p className="text-gray-400">Select a template to edit or create a new one.</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* NEW TAB CONTENT: Audit & Consent */}
            <TabsContent value="audit-consent">
              <Card className="bg-gray-800 text-gray-100 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Audit Logs & Consent Management</CardTitle>
                  <CardDescription className="text-gray-400">Review system activities and manage user consent settings.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-200">Audit Trail</h3>
                      <p className="text-gray-400">View a detailed log of administrative actions and system events.</p>
                      <div className="mt-4 bg-gray-700 p-4 rounded max-h-80 overflow-y-auto">
                        {auditLogs.length > 0 ? (
                          <ul className="space-y-2">
                            {auditLogs.map(log => (
                              <li key={log.id} className="text-gray-300 text-sm">
                                <span className="font-semibold text-gray-100">[{log.timestamp}]</span> {log.user} ({log.ip}, {log.browser}): {log.action}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-gray-400">No audit logs available.</p>
                        )}
                      </div>
                    </div>

                    <div className="border-t border-gray-700 pt-6">
                      <h3 className="text-lg font-semibold text-gray-200">User Consent Preferences</h3>
                      <p className="text-gray-400">Overview of user consent for data processing and communications.</p>
                      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Card className="bg-gray-700 border-gray-600 p-4">
                          <h4 className="font-semibold text-gray-200">Marketing Emails</h4>
                          <p className="text-gray-400 text-sm">Total users opted in/out.</p>
                          <Badge className="mt-2 bg-green-600">85% Opted In</Badge>
                        </Card>
                        <Card className="bg-gray-700 border-gray-600 p-4">
                          <h4 className="font-semibold text-gray-200">Data Sharing</h4>
                          <p className="text-gray-400 text-sm">Consent for third-party data sharing.</p>
                          <Badge className="mt-2 bg-yellow-600">60% Consented</Badge>
                        </Card>
                      </div>
                      <Button className="mt-4 bg-blue-600 hover:bg-blue-700 text-white">View Detailed Consent Records</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* NEW TAB CONTENT: Content Moderation */}
            <TabsContent value="content-moderation">
              <Card className="bg-gray-800 text-gray-100 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Advanced Content Moderation</CardTitle>
                  <CardDescription className="text-gray-400">Tools for managing inappropriate content and detecting fraudulent activity.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-200">Rogue Word Detection</h3>
                      <p className="text-gray-400">Automatically flag job postings or user content containing specified keywords.</p>
                      <div className="flex items-center space-x-2 mt-4">
                        <Toggle
                          aria-label="Toggle rogue word detection"
                          pressed={isRogueDetectionEnabled}
                          onPressedChange={handleToggleRogueDetection}
                          className="data-[state=on]:bg-blue-600 data-[state=off]:bg-gray-700"
                        >
                          {isRogueDetectionEnabled ? 'Enabled' : 'Disabled'}
                        </Toggle>
                        <span className="text-gray-300">{isRogueDetectionEnabled ? "Rogue word detection is ON" : "Rogue word detection is OFF"}</span>
                      </div>
                      <div className="mt-4">
                        <h4 className="text-md font-semibold text-gray-200 mb-2">Current Filter Keywords:</h4>
                        <div className="flex flex-wrap gap-2">
                          {jobFilterKeywords.map((keyword, index) => (
                            <Badge key={index} className="bg-red-600 text-white flex items-center gap-1">
                              {keyword}
                              <Button variant="ghost" size="icon" className="h-4 w-4 p-0 text-white hover:bg-red-700" onClick={() => handleRemoveJobFilterKeyword(keyword)}>
                                <X className="h-3 w-3" />
                              </Button>
                            </Badge>
                          ))}
                        </div>
                        <div className="flex mt-3 space-x-2">
                          <Input
                            placeholder="Add new keyword"
                            value={newFilterKeyword}
                            onChange={(e) => setNewFilterKeyword(e.target.value)}
                            className="bg-gray-700 border-gray-600 text-white"
                          />
                          <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={handleAddJobFilterKeyword}>Add</Button>
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-gray-700 pt-6">
                      <h3 className="text-lg font-semibold text-gray-200">Fraudulent Ad Review</h3>
                      <p className="text-gray-400">Review job postings flagged as potentially fraudulent by users or AI.</p>
                      <div className="mt-4 bg-gray-700 p-4 rounded max-h-80 overflow-y-auto">
                        {fraudulentAds.length > 0 ? (
                          <ul className="space-y-3">
                            {fraudulentAds.map(ad => (
                              <li key={ad.id} className="border-b border-gray-600 pb-2 last:border-b-0 flex justify-between items-center">
                                <div>
                                  <p className="font-semibold text-gray-100">{ad.title}</p>
                                  <p className="text-gray-400 text-sm">Reported by: {ad.reportedBy} | Status: {ad.status}</p>
                                </div>
                                <div className="space-x-2">
                                  <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white" onClick={() => handleReviewFraudAd(ad.id, 'Approve')}>Approve</Button>
                                  <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white" onClick={() => handleReviewFraudAd(ad.id, 'Reject')}>Reject</Button>
                                </div>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-gray-400">No fraudulent ads currently flagged.</p>
                        )}
                      </div>
                    </div>

                    <div className="border-t border-gray-700 pt-6">
                      <h3 className="text-lg font-semibold text-gray-200">Automated Bot Protection</h3>
                      <p className="text-gray-400">Configure settings to protect against automated bots and spam.</p>
                      <Select onValueChange={handleBotProtectionSetting}>
                        <SelectTrigger className="w-full bg-gray-700 text-white border-gray-600">
                          <SelectValue placeholder="Select protection level" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 text-gray-100 border-gray-700">
                          <SelectItem value="low">Low (Captcha on suspicious activity)</SelectItem>
                          <SelectItem value="medium">Medium (Moderate bot detection)</SelectItem>
                          <SelectItem value="high">High (Aggressive bot detection & blocking)</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button className="mt-4 bg-blue-600 hover:bg-blue-700 text-white">Save Bot Protection Setting</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* NEW TAB CONTENT: Security Settings */}
            <TabsContent value="security">
              <Card className="bg-gray-800 text-gray-100 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Security Settings</CardTitle>
                  <CardDescription className="text-gray-400">Manage platform security features.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="mfa-toggle" className="text-gray-300">Multi-Factor Authentication (MFA)</Label>
                    <Toggle
                      id="mfa-toggle"
                      aria-label="Toggle MFA"
                      pressed={true} // This would ideally come from state
                      onPressedChange={() => console.log("Toggle MFA")} // Implement MFA toggle logic
                      className="data-[state=on]:bg-blue-600 data-[state=off]:bg-gray-700"
                    >
                      Enabled
                    </Toggle>
                  </div>
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white">MFA Settings</Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Modals for Details (rendered conditionally) */}
      {/* <UserDetailsModal // Removed
        userId={selectedUserId}
        isOpen={isUserDetailsModalOpen}
        onClose={handleCloseUserDetailsModal}
      /> */}
      <JobDetailsModal
        jobId={selectedJobId}
        isOpen={isJobDetailsModalOpen}
        onClose={handleCloseJobDetailsModal}
        onJobUpdated={getJobs}
      />
      <PaymentDetailsModal
        paymentId={selectedPaymentId}
        isOpen={isPaymentDetailsModalOpen}
        onClose={handleClosePaymentDetailsModal}
        onPaymentUpdated={getPayments}
      />

      {/* Admin User Management Modals */}
      <AddAdminUserModal
        isOpen={isAddAdminUserModalOpen}
        onClose={() => setIsAddAdminUserModalOpen(false)}
        onUserAdded={getAdminUsers}
      />
      <EditAdminUserModal
        userId={selectedAdminUserId}
        isOpen={isEditAdminUserModalOpen}
        onClose={() => setIsEditAdminUserModalOpen(false)}
        onUserUpdated={getAdminUsers}
      />
      <DeleteAdminUserConfirmation
        userId={selectedAdminUserId}
        isOpen={isDeleteAdminUserConfirmationOpen}
        onClose={() => setIsDeleteAdminUserConfirmationOpen(false)}
        onConfirm={confirmDeleteAdminUser}
      />

      {/* NEW: Add User Modal (for normal users) */}
      <AddUserModal
        isOpen={isAddUserModalOpen}
        onClose={() => setIsAddUserModalOpen(false)}
        onUserAdded={getUsers} // Pass getUsers to refresh the list after a new user is added
      />
    </div>
  );
}