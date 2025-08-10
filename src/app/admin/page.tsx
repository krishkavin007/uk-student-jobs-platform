// src/app/admin/page.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Head from "next/head";
import { useAdminAuth } from "@/app/admin-auth/AdminAuthContext"; 
export default function AdminRedirectPage() {
  const { isLoading, isAuthenticated } = useAdminAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        router.push("/admin-dashboard");
      } else {
        router.push("/admin-login");
      }
    }
  }, [isLoading, isAuthenticated, router]);

  return (
    <>
      <Head>
        <title>Admin Redirect</title>
        <meta name="robots" content="noindex" />
      </Head>
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-950 text-gray-300">
        <p className="mb-4">Loading admin page...</p>
        {isLoading && (
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white" />
        )}
      </div>
    </>
  );
}
