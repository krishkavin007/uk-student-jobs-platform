// src/lib/data-utils.ts

import {
    AdminStats,
    ChartDataPoint,
    User,
    DetailedUser,
    Job,
    DetailedJob,
    Payment,
    DetailedPayment,
    Refund,
    Report,
    AdminUser,
} from '@/types/admin-types';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'; // Ensure this matches your backend URL

// Helper to get authenticated fetch options with httpOnly cookie handling
function getAuthenticatedFetchOptions(method = 'GET', body?: any) {
    const options: RequestInit = {
        method,
        headers: {
            'Content-Type': 'application/json',
        },
        // IMPORTANT: 'include' sends cookies (including httpOnly) with cross-origin requests
        credentials: 'include',
    };

    if (body) {
        options.body = JSON.stringify(body);
    }
    return options;
}

// Interface for data sent to add/update admin user (password only for add)
interface AdminUserData {
    username: string;
    admin_email: string;
    password?: string; // Only for adding, not for updating
    first_name?: string;
    last_name?: string;
    role?: string;
    is_active?: boolean;
    admin_roles?: string[];
    access_level?: number;
}

// Interface for the paginated users response from the backend
interface FetchUsersPaginatedResponse {
  users: User[];
  totalCount: number; // Assuming your API provides a total count
  hasMore: boolean; // Or infer from users.length === limit
}

// NEW: Interface for data sent to create a regular user
interface CreateUserData {
    user_email: string;
    user_password: string;
    user_first_name: string;
    user_last_name: string;
    user_type: "student" | "employer";
    user_status: "active" | "inactive" | "suspended";
    // Add any other fields relevant to new user creation
}


// --- Admin User Management API Calls (These are for admin_users table) ---

export async function addAdminUser(userData: AdminUserData): Promise<AdminUser> {
    try {
        const response = await fetch(`${BACKEND_URL}/api/admin/admin-users`, getAuthenticatedFetchOptions('POST', userData));

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to add admin user');
        }
        return response.json();
    } catch (error) {
        console.error('Error in addAdminUser:', error);
        throw error;
    }
}

export async function fetchAdminUsers(): Promise<AdminUser[]> {
    try {
        const response = await fetch(`${BACKEND_URL}/api/admin/admin-users`, getAuthenticatedFetchOptions());

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to fetch admin users');
        }
        return response.json();
    } catch (error) {
        console.error('Error in fetchAdminUsers:', error);
        throw error;
    }
}

export async function fetchAdminUserDetails(userId: string): Promise<AdminUser> {
    try {
        const response = await fetch(`${BACKEND_URL}/api/admin/admin-users/${userId}`, getAuthenticatedFetchOptions());

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `Failed to fetch admin user ${userId}`);
        }
        return response.json();
    } catch (error) {
        console.error(`Error in fetchAdminUserDetails(${userId}):`, error);
        throw error;
    }
}

export async function updateAdminUser(userId: string, userData: Partial<AdminUserData>): Promise<AdminUser> {
    try {
        const response = await fetch(`${BACKEND_URL}/api/admin/admin-users/${userId}`, getAuthenticatedFetchOptions('PUT', userData));

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `Failed to update admin user ${userId}`);
        }
        return response.json();
    } catch (error) {
        console.error(`Error in updateAdminUser(${userId}):`, error);
        throw error;
    }
}

export async function deleteAdminUser(userId: string): Promise<{ message: string }> {
    try {
        const response = await fetch(`${BACKEND_URL}/api/admin/admin-users/${userId}`, getAuthenticatedFetchOptions('DELETE'));

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `Failed to delete admin user ${userId}`);
        }
        return response.json();
    } catch (error) {
        console.error(`Error in deleteAdminUser(${userId}):`, error);
        throw error;
    }
}

// --- Admin Authentication API Calls ---

export async function adminLogin(username: string, password: string): Promise<{ message: string }> {
    try {
        const response = await fetch(`${BACKEND_URL}/api/admin/login`, getAuthenticatedFetchOptions('POST', { username, password }));
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Login failed');
        }
        return response.json();
    } catch (error) {
        console.error('Error during admin login:', error);
        throw error;
    }
}

export async function adminLogout(): Promise<{ message: string }> {
    try {
        const response = await fetch(`${BACKEND_URL}/api/admin/logout`, getAuthenticatedFetchOptions('POST'));
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Logout failed');
        }
        return response.json();
    } catch (error) {
        console.error('Error during admin logout:', error);
        throw error;
    }
}

export async function checkAdminAuth(): Promise<{ message: string; admin: AdminUser }> {
    try {
        const response = await fetch(`${BACKEND_URL}/api/admin/admin-check`, getAuthenticatedFetchOptions());
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Admin check failed');
        }
        return response.json();
    } catch (error) {
        console.error('Error during admin authentication check:', error);
        throw error;
    }
}

export async function fetchAdminProfile(): Promise<AdminUser> {
    try {
        const response = await fetch(`${BACKEND_URL}/api/admin/me`, getAuthenticatedFetchOptions());
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to fetch admin profile');
        }
        return response.json();
    } catch (error) {
        console.error('Error fetching admin profile:', error);
        throw error;
    }
}


// --- User Management API Calls (These are for the general users table) ---

// NEW: Function to create a new general user
export async function createUser(userData: CreateUserData): Promise<User> {
    try {
        // Assuming your backend has an endpoint for admin to create users
        const response = await fetch(`${BACKEND_URL}/api/user/admin/users`, getAuthenticatedFetchOptions('POST', userData));

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to create user');
        }
        return response.json(); // Assuming the backend returns the created user object
    } catch (error) {
        console.error('Error in createUser:', error);
        throw error;
    }
}

// This function is kept for potentially fetching ALL users if needed, though infinite scroll uses paginated
export async function fetchUsers(): Promise<User[]> {
    try {
        const response = await fetch(`${BACKEND_URL}/api/user/admin/users`, getAuthenticatedFetchOptions());
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to fetch users');
        }
        const data = await response.json();
        return data.users;
    } catch (error) {
        console.error('Error fetching users:', error);
        throw error;
    }
}

/**
 * Fetches users with pagination.
 * @param page The page number to fetch (1-indexed).
 * @param limit The number of users per page.
 * @returns A promise that resolves to an object containing users, total count, and hasMore flag.
 */
export async function fetchUsersPaginated(page: number, limit: number): Promise<FetchUsersPaginatedResponse> {
    try {
        const response = await fetch(`${BACKEND_URL}/api/user/admin/users?page=${page}&limit=${limit}`, getAuthenticatedFetchOptions());

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Failed to fetch paginated users.");
        }

        const data = await response.json();
        // Assuming your backend returns { users: [], totalCount: Number }
        // Adjust the `hasMore` logic if your backend provides a different indicator
        const hasMore = data.users.length === limit;

        return {
            users: data.users,
            totalCount: data.totalCount, // Ensure your backend provides this
            hasMore: hasMore
        };
    } catch (error) {
        console.error("Error fetching paginated users:", error);
        throw error;
    }
}


export async function fetchUserDetails(userId: string): Promise<DetailedUser> {
    try {
        const response = await fetch(`${BACKEND_URL}/api/user/${userId}`, getAuthenticatedFetchOptions());
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `Failed to fetch user ${userId} details`);
        }
        return response.json();
    } catch (error) {
        console.error(`Error fetching user ${userId} details:`, error);
        throw error;
    }
}

export async function updateUserByAdmin(
    userId: string,
    data: {
        user_status?: 'active' | 'inactive' | 'suspended';
        user_type?: string;
        user_email?: string;
        user_username?: string;
        user_first_name?: string | null;
        user_last_name?: string | null;
        contact_phone_number?: string | null;
        organisation_name?: string | null;
        university_college?: string | null;
        user_city?: string | null;
        user_image?: string | null;
        removeUserImage?: boolean;
    }
): Promise<{ message: string, user?: User }> {
    try {
        const payload: { [key: string]: any } = {};

        // FIX: Changed 'data.status' to 'data.user_status'
        if (data.user_status !== undefined) payload.user_status = data.user_status;
        if (data.user_type !== undefined) payload.user_type = data.user_type;
        if (data.user_email !== undefined) payload.user_email = data.user_email;
        if (data.user_username !== undefined) payload.user_username = data.user_username;
        if (data.user_first_name !== undefined) payload.user_first_name = data.user_first_name;
        if (data.user_last_name !== undefined) payload.user_last_name = data.user_last_name;
        if (data.contact_phone_number !== undefined) payload.contact_phone_number = data.contact_phone_number;
        if (data.organisation_name !== undefined) payload.organisation_name = data.organisation_name;
        if (data.university_college !== undefined) payload.university_college = data.university_college;
        if (data.user_city !== undefined) payload.user_city = data.user_city;
        // The is_active field is no longer strictly necessary to send if user_status is sent and handled by backend.
        // If your backend still uses it for other reasons, keep it. Otherwise, you can remove this line.
        // if (data.is_active !== undefined) payload.is_active = data.is_active;


        if (data.user_image === null) {
            payload.removeUserImage = true;
            payload.user_image = null;
        } else if (data.user_image !== undefined) {
             payload.user_image = data.user_image;
        }

        const response = await fetch(
            `${BACKEND_URL}/api/user/${userId}`, // This route handles general user profile updates
            getAuthenticatedFetchOptions('PUT', payload)
        );

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to update user by admin');
        }
        return response.json();
    } catch (error) {
        console.error(`Error updating user ${userId} by admin:`, error);
        throw error;
    }
}

export async function deleteUser(userId: string): Promise<{ message: string }> {
    try {
        const response = await fetch(`${BACKEND_URL}/api/user/admin/users/${userId}`, getAuthenticatedFetchOptions('DELETE'));
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to delete user');
        }
        if (response.status === 204) {
             return { message: 'User deleted successfully (No Content)' };
        }
        return response.json();
    } catch (error) {
        console.error(`Error deleting user ${userId}:`, error);
        throw error;
    }
}


// --- Job Management API Calls ---

export async function fetchJobs(): Promise<Job[]> {
    try {
        const response = await fetch(`${BACKEND_URL}/api/admin/jobs`, getAuthenticatedFetchOptions());
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to fetch jobs');
        }
        return response.json();
    } catch (error) {
        console.error('Error fetching jobs:', error);
        throw error;
    }
}

export async function fetchJobDetails(jobId: string | number): Promise<DetailedJob> {
    try {
        const response = await fetch(`${BACKEND_URL}/api/admin/jobs/${jobId}`, getAuthenticatedFetchOptions());
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `Failed to fetch job ${jobId} details`);
        }
        return response.json();
    } catch (error) {
        console.error(`Error fetching job ${jobId} details:`, error);
        throw error;
    }
}

export async function updateJobStatus(jobId: string | number, status: 'active' | 'inactive' | 'expired'): Promise<{ message: string }> {
    try {
        const response = await fetch(`${BACKEND_URL}/api/admin/jobs/${jobId}/status`, getAuthenticatedFetchOptions('PUT', { status }));
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to update job status');
        }
        return response.json();
    } catch (error) {
        console.error(`Error updating job ${jobId} status:`, error);
        throw error;
    }
}

export async function deleteJob(jobId: string | number): Promise<{ message: string }> {
    try {
        const response = await fetch(`${BACKEND_URL}/api/admin/jobs/${jobId}`, getAuthenticatedFetchOptions('DELETE'));
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to delete job');
        }
        return response.json();
    } catch (error) {
        console.error(`Error deleting job ${jobId}:`, error);
        throw error;
    }
}


// --- Payment Management API Calls ---

export async function fetchPayments(): Promise<Payment[]> {
    try {
        const response = await fetch(`${BACKEND_URL}/api/admin/payments`, getAuthenticatedFetchOptions());
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to fetch payments');
        }
        return response.json();
    } catch (error) {
        console.error('Error fetching payments:', error);
        throw error;
    }
}

export async function fetchPaymentDetails(paymentId: string | number): Promise<DetailedPayment> {
    try {
        const response = await fetch(`${BACKEND_URL}/api/admin/payments/${paymentId}`, getAuthenticatedFetchOptions());
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `Failed to fetch payment ${paymentId} details`);
        }
        return response.json();
    } catch (error) {
        console.error(`Error fetching payment ${paymentId} details:`, error);
        throw error;
    }
}

export async function updatePaymentStatus(paymentId: string | number, status: 'completed' | 'pending' | 'failed' | 'refunded' | 'partially-refunded'): Promise<{ message: string }> {
    try {
        const response = await fetch(`${BACKEND_URL}/api/admin/payments/${paymentId}/status`, getAuthenticatedFetchOptions('PUT', { status }));
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to update payment status');
        }
        return response.json();
    } catch (error) {
        console.error(`Error updating payment ${paymentId} status:`, error);
        throw error;
    }
}

// Placeholder for issueRefund - needs actual implementation
export async function issueRefund(paymentId: string | number, amount: number): Promise<{ message: string }> {
    console.warn(`WARN: issueRefund function called for paymentId ${paymentId} with amount ${amount}. This is a placeholder and needs backend implementation.`);
    try {
        // Example placeholder API call - replace with your actual refund API endpoint
        const response = await fetch(`${BACKEND_URL}/api/admin/payments/${paymentId}/refund`, getAuthenticatedFetchOptions('POST', { amount }));
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to issue refund (placeholder)');
        }
        return response.json();
    } catch (error) {
        console.error(`Error issuing refund for payment ${paymentId}:`, error);
        throw error;
    }
}


// --- Refund Management API Calls ---

export async function fetchRefunds(): Promise<Refund[]> {
    try {
        const response = await fetch(`${BACKEND_URL}/api/admin/refunds`, getAuthenticatedFetchOptions());
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to fetch refunds');
        }
        return response.json();
    } catch (error) {
        console.error('Error fetching refunds:', error);
        throw error;
    }
}


// --- Report Management API Calls ---

export async function fetchReports(): Promise<Report[]> {
    try {
        const response = await fetch(`${BACKEND_URL}/api/admin/reports`, getAuthenticatedFetchOptions());
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to fetch reports');
        }
        return response.json();
    } catch (error) {
        console.error('Error fetching reports:', error);
        throw error;
    }
}

export async function updateReportStatus(reportId: string | number, status: 'pending' | 'processed' | 'resolved'): Promise<{ message: string }> {
    try {
        const response = await fetch(`${BACKEND_URL}/api/admin/reports/${reportId}/status`, getAuthenticatedFetchOptions('PUT', { status }));
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to update report status');
        }
        return response.json();
    } catch (error) {
        console.error(`Error updating report ${reportId} status:`, error);
        throw error;
    }
}

// --- Admin Stats/Dashboard API Calls ---
export async function fetchAdminStats(): Promise<AdminStats> {
    try {
        // MODIFIED: Changed the endpoint to match the backend's new analytics route
        const response = await fetch(`${BACKEND_URL}/api/admin/dashboard/analytics`, getAuthenticatedFetchOptions());
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to fetch admin stats');
        }
        return response.json();
    } catch (error) {
        console.error('Error fetching admin stats:', error);
        throw error;
    }
}

export async function fetchUsersOverTime(period: 'week' | 'month' | 'year'): Promise<ChartDataPoint[]> {
    try {
        const response = await fetch(`${BACKEND_URL}/api/admin/charts/users-over-time?period=${period}`, getAuthenticatedFetchOptions());
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `Failed to fetch users over ${period}`);
        }
        return response.json();
    } catch (error) {
        console.error(`Error fetching users over ${period}:`, error);
        throw error;
    }
}

export async function fetchJobsPostedOverTime(period: 'week' | 'month' | 'year'): Promise<ChartDataPoint[]> {
    try {
        const response = await fetch(`${BACKEND_URL}/api/admin/charts/jobs-posted-over-time?period=${period}`, getAuthenticatedFetchOptions());
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `Failed to fetch jobs posted over ${period}`);
        }
        return response.json();
    } catch (error) {
        console.error(`Error fetching jobs posted over ${period}:`, error);
        throw error;
    }
}

export async function fetchRevenueOverTime(period: 'week' | 'month' | 'year'): Promise<ChartDataPoint[]> {
    try {
        const response = await fetch(`${BACKEND_URL}/api/admin/charts/revenue-over-time?period=${period}`, getAuthenticatedFetchOptions());
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `Failed to fetch revenue over ${period}`);
        }
        return response.json();
    } catch (error) {
        console.error(`Error fetching revenue over ${period}:`, error);
        throw error;
    }
}