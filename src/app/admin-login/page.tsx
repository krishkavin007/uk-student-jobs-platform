// src/app/admin-login/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAdminAuth } from "@/app/admin-auth/AdminAuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";

export default function AdminLoginPage() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [localError, setLocalError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { login, isAuthenticated, isLoading, error: authError } = useAdminAuth();
  const router = useRouter();

  useEffect(() => {
    const rememberedIdentifier = localStorage.getItem("rememberedAdminIdentifier");
    if (rememberedIdentifier) {
      setIdentifier(rememberedIdentifier);
      setRememberMe(true);
    }
  }, []);

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
        router.push("/admin");
    }
  }, [isAuthenticated, isLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError("");
    setIsSubmitting(true);

    if (!identifier || !password) {
      setLocalError("Please enter both username/email and password.");
      setIsSubmitting(false);
      return;
    }

    if (rememberMe) {
      localStorage.setItem("rememberedAdminIdentifier", identifier);
    } else {
      localStorage.removeItem("rememberedAdminIdentifier");
    }

    const success = await login(identifier, password);
    // ⭐ CRITICAL FIX: Change `if (success)` to `if (success.success)` ⭐
    if (success.success) { // This checks the boolean 'success' property inside the object
      // If your backend still handles JWT storage client-side, it would be here.
      // However, your AdminAuthContext indicates httpOnly cookies are used,
      // so you likely don't need to store a token here.
      // localStorage.setItem("admin_jwt", success.token); // This line is likely no longer needed if using httpOnly cookies

      router.push("/admin");
    }
    setIsSubmitting(false);

    // If 'success.success' is false, 'authError' from context will already be set by the login function.
  };

  const handleGoogleLogin = () => {
    const messageBox = document.createElement('div');
    messageBox.className = 'fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50';
    messageBox.innerHTML = `
      <div class="bg-gray-800 p-6 rounded-lg shadow-xl text-white max-w-sm mx-auto text-center space-y-4">
        <h3 class="text-lg font-bold">Feature Not Implemented</h3>
        <p>Google login is not yet available in this demo. Please use email and password.</p>
        <button id="closeMessageBox" class="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md transition-colors">
          OK
        </button>
      </div>
    `;
    document.body.appendChild(messageBox);

    document.getElementById('closeMessageBox')?.addEventListener('click', () => {
      document.body.removeChild(messageBox);
    });
  };

  if (isLoading || isAuthenticated) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-950 text-gray-100">
        <p>Loading authentication status...</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-950 min-h-[110vh] relative">
      <div className="fixed inset-0 z-0 overflow-hidden">
        <div
          className="absolute top-0 left-0 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-[#4a007f] to-[#004a7f] opacity-40 blur-[100px]"
          style={{ transform: "translate(-40%, -40%)" }}
        />
        <div
          className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full bg-gradient-to-tl from-[#007f4a] to-[#4a7f00] opacity-35 blur-[90px]"
          style={{ transform: "translate(40%, 40%)" }}
        />
        <div
          className="absolute top-1/2 left-1/2 w-[450px] h-[450px] rounded-full bg-gradient-to-tr from-[#7f4a00] to-[#7f004a] opacity-5 blur-[80px]"
          style={{ transform: "translate(-50%, -50%)" }}
        />
      </div>

      <div className="relative z-10 flex flex-col md:justify-center items-center justify-start min-h-screen pt-20 px-4">
        <Card className="w-full max-w-md bg-gray-900 border border-gray-800 text-gray-100 shadow-lg">
          <CardHeader className="space-y-1">
            <div className="text-center mb-4">
              <Link href="/" className="font-bold text-2xl text-gray-100">
                Admin Panel
              </Link>
            </div>
            <CardTitle className="text-2xl font-bold text-center text-white">
              Welcome Back, Admin
            </CardTitle>
            <CardDescription className="text-center text-gray-300">
              Sign in to your administration account
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <Button
              variant="outline"
              className="w-full bg-gray-800 border-gray-700 text-gray-100 hover:bg-gray-700 hover:text-gray-50"
              onClick={handleGoogleLogin}
            >
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continue with Google
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full bg-gray-700" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-gray-900 px-2 text-gray-400">
                  Or continue with email
                </span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="identifier" className="text-gray-200">
                  Username or Email
                </Label>
                <Input
                  id="identifier"
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="Enter username or email"
                  className="bg-gray-800 border-gray-700 text-gray-100 placeholder:text-gray-500 focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-200">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter admin password"
                    className="bg-gray-800 border-gray-700 text-gray-100 placeholder:text-gray-500 focus:border-blue-500 focus:ring-blue-500 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-200 focus:outline-none"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="rememberMe"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                />
                <Label htmlFor="rememberMe" className="text-gray-300 cursor-pointer">
                  Remember me
                </Label>
              </div>

              {(localError || authError) && (
                <p className="text-red-400 text-sm text-center">{localError || authError}</p>
              )}

              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-md transition-colors"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Logging in..." : "Log In"}
              </Button>
            </form>
            <div className="h-8 md:h-2" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}