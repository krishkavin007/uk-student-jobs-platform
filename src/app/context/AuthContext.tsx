// app/context/AuthContext.tsx
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface User {
    user_id: string;
    user_username: string;
    user_email: string;
    google_id?: string;
    user_type: "employer" | "student";
    organisation_name?: string;
    contact_phone_number?: string;
    user_first_name?: string;
    user_last_name?: string;
    university_college?: string;
    created_at: string;
    user_image?: string;
    user_city?: string;
}

// LoginData type handles cases where the login response might directly be User
// or wrapped in an object like { user: User }
type LoginData = User | { user: User; [key: string]: unknown };

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    login: (data: LoginData) => void;
    logout: () => void;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    const fetchUser = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/auth/me', {
                credentials: 'include' // Ensures session cookies are sent
            });

            if (response.ok) {
                // --- MODIFIED CODE START ---
                // The API response is { user: User }, so we need to destructure it
                const responseData: { user: User } = await response.json();
                const userData: User = responseData.user;
                // --- MODIFIED CODE END ---

                setUser(userData);
            } else {
                setUser(null);
            }
        } catch (error) {
            console.error('AuthContext fetchUser: Error fetching user from /api/auth/me:', error);
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchUser();
    }, [fetchUser]);

   const login = async (data: LoginData) => {
        // Handle cases where 'data' might be just the User object or wrapped in { user: User }
        const userData: User = 'user' in data && data.user ? data.user : data as User;
        setUser(userData);
        setIsLoading(false);
        // Immediately fetch user data from the server to confirm session and get full details
        await fetchUser();
    };

    const logout = async () => {
        setIsLoading(true);
        try {
        const response = await fetch('/api/auth/logout', { method: 'POST' });
            if (!response.ok) {
                console.error('AuthContext: Backend logout failed:', response.statusText);
            }
        } catch (error) {
            console.error('AuthContext: Error during backend logout:', error);
        } finally {
            setUser(null);
            setIsLoading(false);
            router.push('/login');
        }
    };

    const refreshUser = async () => {
        await fetchUser();
    };

    return (
        <AuthContext.Provider value={{ user, isLoading, login, logout, refreshUser }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}