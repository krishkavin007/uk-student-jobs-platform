// app/context/AuthContext.tsx
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useRouter } from 'next/navigation';

// Define the shape of your User object
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
    user_image?: string;
}

// --- NEW: Define a type for the data passed to the login function ---
// This allows for either the full API response or just the user object
type LoginData = User | { user: User; [key: string]: unknown };

// Define the shape of the AuthContext value
interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    login: (data: LoginData) => void; // <-- CORRECTED TYPE
    logout: () => void;
    refreshUser: () => Promise<void>;
}

// Create the context with a default undefined value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// AuthProvider component to wrap your application
export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    const fetchUser = useCallback(async () => {
        setIsLoading(true);
        console.log("AuthContext fetchUser (called via useCallback): Attempting to fetch user from /api/auth/me...");
        try {
            const response = await fetch('/api/auth/me');
            if (response.ok) {
                const userData: User = await response.json();
                setUser(userData);
                console.log("AuthContext fetchUser: User data received and set:", userData);
            } else {
                setUser(null);
                console.log("AuthContext fetchUser: No user session found or session invalid.");
            }
        } catch (error) {
            console.error('AuthContext fetchUser: Error fetching user from /api/auth/me:', error);
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        console.log("AuthContext useEffect: Triggered for initial session check.");
        fetchUser();
    }, [fetchUser]);

    const login = (data: LoginData) => { // <-- CORRECTED TYPE
        // Use a type guard to check if 'user' property exists
        const userData: User = 'user' in data && data.user ? data.user : data as User;

        console.log("AuthContext: login function processed and SETTING user state:", userData);
        setUser(userData);
        setIsLoading(false);
    };

    const logout = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/logout', { method: 'POST' });
            if (!response.ok) {
                console.error('AuthContext: Backend logout failed:', response.statusText);
            }
        } catch (error) {
            console.error('AuthContext: Error during backend logout:', error);
        } finally {
            setUser(null);
            setIsLoading(false);
            router.push('/login');
            console.log("AuthContext: Logout complete, redirecting to /login.");
        }
    };

    const refreshUser = async () => {
        console.log("AuthContext: refreshUser called.");
        await fetchUser();
    };

    return (
        <AuthContext.Provider value={{ user, isLoading, login, logout, refreshUser }}>
            {children}
        </AuthContext.Provider>
    );
}

// Custom hook to easily consume the AuthContext
export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}