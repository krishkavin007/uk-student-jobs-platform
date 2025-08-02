// src/app/admin/layout.tsx
import { AdminAuthProvider } from '@/app/admin-auth/AdminAuthContext'; // Make sure this path is correct for your AdminAuthContext

export default function AdminLayout({
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