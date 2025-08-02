// src/app/admin-login/layout.tsx
import { AdminAuthProvider } from "@/app/admin-auth/AdminAuthContext"; 

export default function AdminLoginLayout({
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