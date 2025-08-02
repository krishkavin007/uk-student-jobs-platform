// src/app/admin-auth/AdminAuthContext.tsx
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useRouter } from 'next/navigation';

// Define the shape of an authenticated admin user
interface AdminUser {
    admin_id: string;
    username: string;
    role: string; // e.g., 'admin', 'super_admin'
}

// Define the shape of the AuthContext's value
interface AdminAuthContextType {
    adminUser: AdminUser | null;
    isLoading: boolean;
    login: (identifier: string, password: string) => Promise<{ success: boolean }>;
    logout: () => void;
    refreshAdminUser: () => Promise<void>;
    error: string | null; // For displaying login errors from the API
    isAuthenticated: boolean; // This tracks if an admin user is logged in
}

// Create the context
const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

// ⭐ CRITICAL FIX: Ensure this defaults to port 5000! ⭐
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://upbeat-swanson.217-154-37-86.plesk.page';

// Provider component that wraps your admin pages
export function AdminAuthProvider({ children }: { children: ReactNode }) { // Added 'children: ReactNode' type for clarity
    const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null); // State to hold login errors
    const router = useRouter();

    // Derived state for authentication status
    const isAuthenticated = !!adminUser; // Derive isAuthenticated from adminUser presence

// Function to check for an existing admin session (e.g., from stored JWT)
const fetchAdminUser = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    console.log("AdminAuthContext fetchAdminUser: Attempting to fetch admin user session...");

    try {
        const response = await fetch(`${BACKEND_URL}/api/admin/admin-check`, {
            credentials: 'include', // ensures cookies are sent with the request
        });

        if (response.ok) {
            const data = await response.json();

            // Correctly access the 'admin' property from the response data
            const normalizedUser: AdminUser = {
                admin_id: data.admin.admin_id, // Access data.admin directly
                username: data.admin.username,
                role: data.admin.role,
            };

            setAdminUser(normalizedUser);
            console.log("AdminAuthContext fetchAdminUser: Admin user data received and set:", normalizedUser);
        } else {
            setAdminUser(null);
            console.log("AdminAuthContext fetchAdminUser: Admin session invalid or expired.");
        }
    } catch (err) {
        console.error('AdminAuthContext fetchAdminUser: Error fetching admin user:', err);
        setAdminUser(null);
    } finally {
        setIsLoading(false);
    }
}, []);


    // useEffect hook to run fetchAdminUser on component mount
    useEffect(() => {
        console.log("AdminAuthContext useEffect: Initial session check for admin.");
        fetchAdminUser();
    }, [fetchAdminUser]); // Dependency array ensures it runs when fetchAdminUser changes (which it won't due to useCallback)

    // Login function for administrators
    const login = async (identifier: string, password: string): Promise<{ success: boolean }> => {
        setIsLoading(true);
        setError(null); // Clear any previous errors
        console.log("AdminAuthContext: Attempting admin login...");
        try {
            // Directly call the Express backend's /api/admin/login endpoint
            const response = await fetch(`${BACKEND_URL}/api/admin/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                // ⭐ FIX: Change 'identifier' to 'username' to match backend expectation ⭐
                body: JSON.stringify({ username: identifier, password }),
            });

            if (response.ok) {
                const data = await response.json();
                console.log("AdminAuthContext: Full login response data:", data);

                // The backend sets an httpOnly cookie, so we don't access the token client-side.
                // Call refreshAdminUser to fetch the user data from /api/admin/admin-check
                await refreshAdminUser(); // This will update adminUser and isAuthenticated, and set isLoading to false.

                console.log("AdminAuthContext: Admin login successful, triggering user data refresh.");
                return { success: true };
            } else {
                const errorData = await response.json(); // Parse error message from backend
                setError(errorData.error || 'Login failed');  // Set error message
                setAdminUser(null); // Clear user state on failed login
                console.error("AdminAuthContext: Admin login failed:", errorData.error);
                setIsLoading(false);
                return { success: false };
            }
        } catch (err) {
            console.error('AdminAuthContext: Error during admin login:', err);
            setError('Network error or server unreachable. Please try again.'); // Generic network error
            setAdminUser(null);
            setIsLoading(false);
            return { success: false };
        }
    };

    // Logout function for administrators
    const logout = async () => {
        setIsLoading(true);
        console.log("AdminAuthContext: Admin logout initiated. Calling backend logout endpoint.");
        try {
            const response = await fetch(`${BACKEND_URL}/api/admin/logout`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                console.log("AdminAuthContext: Backend logout successful.");
            } else {
                console.error("AdminAuthContext: Backend logout responded with an error:", response.status, response.statusText);
            }
        } catch (err) {
            console.error('AdminAuthContext: Error calling backend logout endpoint:', err);
        } finally {
            setAdminUser(null);
            setIsLoading(false);
            router.push('/admin-login');
            console.log("AdminAuthContext: Admin logout process complete, redirecting to /admin-login.");
        }
    };

    // Allows other components to manually trigger a refresh of the admin user state
    const refreshAdminUser = async () => {
        console.log("AdminAuthContext: refreshAdminUser called.");
        await fetchAdminUser();
    };

    return (
        <AdminAuthContext.Provider value={{
            adminUser,
            isLoading,
            login,
            logout,
            refreshAdminUser,
            error,
            isAuthenticated
        }}>
            {children}
        </AdminAuthContext.Provider>
    );
}

// Custom hook to easily consume the AdminAuthContext
export function useAdminAuth() {
    const context = useContext(AdminAuthContext);
    if (context === undefined) {
        throw new Error('useAdminAuth must be used within an AdminAuthProvider');
    }
    return context;
}