// src/lib/admin-api.ts

import { AdminStats, User, Job, Payment, Refund, Report, AdminUser, ChartDataPoint } from '@/types/admin-types'; // Make sure this path is correct

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

// Helper to get authorization header
const getAuthHeader = () => {
    // Assuming your AdminAuthContext stores the token in localStorage or a similar place
    const token = localStorage.getItem('adminToken');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
};

// --- Stats & Chart Data ---
export async function fetchAdminStats(): Promise<AdminStats> {
    console.log("Fetching admin stats...");
    try {
        const response = await fetch(`${API_BASE_URL}/admin/stats`, {
            headers: getAuthHeader(),
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to fetch admin stats');
        }
        return response.json();
    } catch (error) {
        console.error("Error in fetchAdminStats:", error);
        // Return default values or rethrow if you want the calling component to handle it
        return {
            totalUsers: 0,
            totalJobs: 0,
            totalPayments: 0
        };
    }
}

export async function fetchAdminJobChartData(): Promise<ChartDataPoint[]> {
    console.log("Fetching job chart data...");
    try {
        const response = await fetch(`${API_BASE_URL}/admin/job-chart-data`, {
            headers: getAuthHeader(),
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to fetch job chart data');
        }
        return response.json();
    } catch (error) {
        console.error("Error in fetchAdminJobChartData:", error);
        return []; // Return empty array on error
    }
}

// --- User Management ---
export async function fetchUsers(): Promise<User[]> {
    console.log("Fetching users...");
    try {
        const response = await fetch(`${API_BASE_URL}/admin/users`, {
            headers: getAuthHeader(),
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to fetch users');
        }
        return response.json();
    } catch (error) {
        console.error("Error in fetchUsers:", error);
        return [];
    }
}

export async function updateUserStatus(userId: string, newStatus: string): Promise<void> {
    console.log(`Updating user ${userId} status to ${newStatus}...`);
    try {
        const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                ...getAuthHeader(),
            },
            body: JSON.stringify({ status: newStatus }),
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to update user status');
        }
        // No content expected for successful update
    } catch (error) {
        console.error("Error in updateUserStatus:", error);
        throw error; // Re-throw to be caught by the component
    }
}

export async function deleteUser(userId: string): Promise<void> {
    console.log(`Deleting user ${userId}...`);
    try {
        const response = await fetch(`${API_BASE_URL}/admin/users/${userId}`, {
            method: 'DELETE',
            headers: getAuthHeader(),
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to delete user');
        }
    } catch (error) {
        console.error("Error in deleteUser:", error);
        throw error;
    }
}

// --- Job Management ---
export async function fetchJobs(): Promise<Job[]> {
    console.log("Fetching jobs...");
    try {
        const response = await fetch(`${API_BASE_URL}/admin/jobs`, {
            headers: getAuthHeader(),
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to fetch jobs');
        }
        return response.json();
    } catch (error) {
        console.error("Error in fetchJobs:", error);
        return [];
    }
}

export async function updateJobStatus(jobId: number, newStatus: string): Promise<void> {
    console.log(`Updating job ${jobId} status to ${newStatus}...`);
    try {
        const response = await fetch(`${API_BASE_URL}/admin/jobs/${jobId}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                ...getAuthHeader(),
            },
            body: JSON.stringify({ status: newStatus }),
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to update job status');
        }
    } catch (error) {
        console.error("Error in updateJobStatus:", error);
        throw error;
    }
}

export async function deleteJob(jobId: number): Promise<void> {
    console.log(`Deleting job ${jobId}...`);
    try {
        const response = await fetch(`${API_BASE_URL}/admin/jobs/${jobId}`, {
            method: 'DELETE',
            headers: getAuthHeader(),
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to delete job');
        }
    } catch (error) {
        console.error("Error in deleteJob:", error);
        throw error;
    }
}

// --- Payment Management ---
export async function fetchPayments(): Promise<Payment[]> {
    console.log("Fetching payments...");
    try {
        const response = await fetch(`${API_BASE_URL}/admin/payments`, {
            headers: getAuthHeader(),
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to fetch payments');
        }
        return response.json();
    } catch (error) {
        console.error("Error in fetchPayments:", error);
        return [];
    }
}

export async function updatePaymentStatus(paymentId: number, newStatus: string): Promise<void> {
    console.log(`Updating payment ${paymentId} status to ${newStatus}...`);
    try {
        const response = await fetch(`${API_BASE_URL}/admin/payments/${paymentId}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                ...getAuthHeader(),
            },
            body: JSON.stringify({ status: newStatus }),
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to update payment status');
        }
    } catch (error) {
        console.error("Error in updatePaymentStatus:", error);
        throw error;
    }
}

export async function deletePayment(paymentId: number): Promise<void> {
    console.log(`Deleting payment ${paymentId}...`);
    try {
        const response = await fetch(`${API_BASE_URL}/admin/payments/${paymentId}`, {
            method: 'DELETE',
            headers: getAuthHeader(),
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to delete payment');
        }
    } catch (error) {
        console.error("Error in deletePayment:", error);
        throw error;
    }
}

// --- Refund Management ---
export async function fetchRefunds(): Promise<Refund[]> {
    console.log("Fetching refunds...");
    try {
        const response = await fetch(`${API_BASE_URL}/admin/refunds`, {
            headers: getAuthHeader(),
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to fetch refunds');
        }
        return response.json();
    } catch (error) {
        console.error("Error in fetchRefunds:", error);
        return [];
    }
}

export async function updateRefundStatus(refundId: number, newStatus: string): Promise<void> {
    console.log(`Updating refund ${refundId} status to ${newStatus}...`);
    try {
        const response = await fetch(`${API_BASE_URL}/admin/refunds/${refundId}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                ...getAuthHeader(),
            },
            body: JSON.stringify({ status: newStatus }),
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to update refund status');
        }
    } catch (error) {
        console.error("Error in updateRefundStatus:", error);
        throw error;
    }
}

export async function deleteRefund(refundId: number): Promise<void> {
    console.log(`Deleting refund ${refundId}...`);
    try {
        const response = await fetch(`${API_BASE_URL}/admin/refunds/${refundId}`, {
            method: 'DELETE',
            headers: getAuthHeader(),
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to delete refund');
        }
    } catch (error) {
        console.error("Error in deleteRefund:", error);
        throw error;
    }
}

// --- Report Management ---
export async function fetchReports(): Promise<Report[]> {
    console.log("Fetching reports...");
    try {
        const response = await fetch(`${API_BASE_URL}/admin/reports`, {
            headers: getAuthHeader(),
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to fetch reports');
        }
        return response.json();
    } catch (error) {
        console.error("Error in fetchReports:", error);
        return [];
    }
}

export async function processReport(reportId: number): Promise<void> {
    console.log(`Processing report ${reportId}...`);
    try {
        const response = await fetch(`${API_BASE_URL}/admin/reports/${reportId}/process`, {
            method: 'PUT',
            headers: getAuthHeader(),
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to process report');
        }
    } catch (error) {
        console.error("Error in processReport:", error);
        throw error;
    }
}

export async function deleteReport(reportId: number): Promise<void> {
    console.log(`Deleting report ${reportId}...`);
    try {
        const response = await fetch(`${API_BASE_URL}/admin/reports/${reportId}`, {
            method: 'DELETE',
            headers: getAuthHeader(),
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to delete report');
        }
    } catch (error) {
        console.error("Error in deleteReport:", error);
        throw error;
    }
}

// --- Admin User Management ---
export async function fetchAdminUsers(): Promise<AdminUser[]> {
  try {
    const response = await fetch('/api/admin/admin-users', {
      method: 'GET',
      credentials: 'include', // ✅ Sends httpOnly cookie
    });

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


export async function addAdminUser(username: string, password: string, role: string): Promise<void> {
    console.log(`Adding admin user ${username}...`);
    try {
        const response = await fetch(`${API_BASE_URL}/admin/admin-users`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...getAuthHeader(),
            },
            body: JSON.stringify({ username, password, role }),
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to add admin user');
        }
    } catch (error) {
        console.error("Error in addAdminUser:", error);
        throw error;
    }
}

export async function updateAdminUser(userId: string, newRole: string): Promise<void> {
    console.log(`Updating admin user ${userId} role to ${newRole}...`);
    try {
        const response = await fetch(`${API_BASE_URL}/admin/admin-users/${userId}/role`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                ...getAuthHeader(),
            },
            body: JSON.stringify({ role: newRole }),
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to update admin user');
        }
    } catch (error) {
        console.error("Error in updateAdminUser:", error);
        throw error;
    }
}

export async function deleteAdminUser(userId: string): Promise<void> {
    console.log(`Deleting admin user ${userId}...`);
    try {
        const response = await fetch(`${API_BASE_URL}/admin/admin-users/${userId}`, {
            method: 'DELETE',
            headers: getAuthHeader(),
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to delete admin user');
        }
    } catch (error) {
        console.error("Error in deleteAdminUser:", error);
        throw error;
    }
}

// --- Report Generation ---
export async function generateUserReport(): Promise<void> {
    console.log("Generating user report...");
    try {
        const response = await fetch(`${API_BASE_URL}/admin/reports/users/generate`, {
            headers: getAuthHeader(),
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to generate user report');
        }
        // You might want to handle file download here if the API sends a file
        alert('User report generation initiated/completed successfully!');
    } catch (error) {
        console.error("Error in generateUserReport:", error);
        throw error;
    }
}

export async function generateJobReport(): Promise<void> {
    console.log("Generating job report...");
    try {
        const response = await fetch(`${API_BASE_URL}/admin/reports/jobs/generate`, {
            headers: getAuthHeader(),
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to generate job report');
        }
        alert('Job report generation initiated/completed successfully!');
    } catch (error) {
        console.error("Error in generateJobReport:", error);
        throw error;
    }
}

export async function generatePaymentReport(): Promise<void> {
    console.log("Generating payment report...");
    try {
        const response = await fetch(`${API_BASE_URL}/admin/reports/payments/generate`, {
            headers: getAuthHeader(),
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to generate payment report');
        }
        alert('Payment report generation initiated/completed successfully!');
    } catch (error) {
        console.error("Error in generatePaymentReport:", error);
        throw error;
    }
}

export async function generateRefundReport(): Promise<void> {
    console.log("Generating refund report...");
    try {
        const response = await fetch(`${API_BASE_URL}/admin/reports/refunds/generate`, {
            headers: getAuthHeader(),
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to generate refund report');
        }
        alert('Refund report generation initiated/completed successfully!');
    } catch (error) {
        console.error("Error in generateRefundReport:", error);
        throw error;
    }
}