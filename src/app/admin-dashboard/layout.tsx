// src/app/admin-dashboard/layout.tsx
import { AdminAuthProvider } from "@/app/admin-auth/AdminAuthContext";
import React from "react";

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminAuthProvider>
      {children}
    </AdminAuthProvider>
  );
}