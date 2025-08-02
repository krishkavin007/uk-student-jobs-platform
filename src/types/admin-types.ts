// src/types/admin-types.ts

// Basic types for common entities
export interface User {
  user_id: string;
  user_username: string | null;
  user_email: string;
  password_hash?: string;
  google_id?: string | null;
  user_type: 'student' | 'employer' | 'admin' | 'super_admin';
  user_first_name: string | null;
  user_last_name: string | null;
  organisation_name?: string | null;
  contact_phone_number?: string | null;
  university_college?: string | null;
  user_image?: string | null;
  user_city?: string | null;
  user_bio?: string | null;
  user_status: 'active' | 'inactive' | 'suspended' | 'pending-email-verification' | 'pending-admin-approval';
  created_at: string;
  last_login?: string | null;
}

export interface Job {
  job_id: number;
  job_title: string;
  job_description: string;
  employer_id: string;
  job_location: string;
  job_type: 'full-time' | 'part-time' | 'contract' | 'internship';
  job_salary?: string;
  job_category: string;
  posted_date: string;
  job_status: 'active' | 'inactive' | 'expired';
}

export interface Payment {
  payment_id: number;
  user_id: string;
  amount: number;
  payment_date: string;
  status: 'completed' | 'pending' | 'failed' | 'refunded' | 'partially-refunded';
  type: 'job-post' | 'subscription' | 'other';
  transaction_id: string;
}

export interface Refund {
  refund_id: number;
  payment_id: number;
  amount: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
}

export interface Report {
  report_id: number;
  reported_by_user_id: string;
  target_type: 'user' | 'job' | 'other';
  target_id: string | number;
  reason: string;
  status: 'pending' | 'processed' | 'resolved';
}

export interface AdminUser {
  admin_id: string;
  username: string;
  admin_email: string;
  role: string;
  is_active: boolean;
  admin_roles: string[];
  access_level: number;
  created_at: string;
  updated_at: string;
  last_login_at: string | null;
}

export interface DetailedUser extends User {
  job_applications?: { job_id: number; job_title: string; application_status: string }[];
  posted_jobs?: { job_id: number; job_title: string; job_status: string }[];
  payments_history?: Payment[];
  reports_filed?: { report_id: number; reason: string; status: string }[];
  activity_log?: { timestamp: string; action: string; details: string }[];
}

export interface DetailedJob extends Job {
  applicants?: { user_id: string; user_username: string; user_email: string; application_status: string }[];
  job_analytics?: { views: number; clicks: number; applications: number; };
  moderation_notes?: string[];
}

export interface DetailedPayment extends Payment {
  invoice_url?: string;
  gateway_response?: any;
  refund_history?: { amount: number; date: string; reason: string }[];
}

// UPDATED: AdminStats for OverviewDashboard
export interface AdminStats {
  totalStudents: number;
  totalEmployers: number;
  totalAdmins: number;
  activeLogins: number;
}