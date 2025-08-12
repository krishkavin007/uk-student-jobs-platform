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
      {/* Force dark mode for admin dashboard */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
            (function() {
              // Force dark mode for admin dashboard
              document.documentElement.classList.add('dark');
              document.documentElement.classList.remove('light');
              
              // Prevent theme changes from affecting admin dashboard
              const originalSetItem = localStorage.setItem;
              localStorage.setItem = function(key, value) {
                if (key === 'theme' && value === 'light') {
                  // Don't allow light theme in admin dashboard
                  return;
                }
                return originalSetItem.apply(this, arguments);
              };
            })();
          `,
        }}
      />
      {children}
    </AdminAuthProvider>
  );
}