// src/components/admin/ViewAdminUserModal.tsx
"use client";

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AdminUser } from '@/types/admin-types';

interface ViewAdminUserModalProps {
  adminUser: AdminUser | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ViewAdminUserModal({ adminUser, isOpen, onClose }: ViewAdminUserModalProps) {
  if (!adminUser) return null;

  const formatRoleForDisplay = (role: string) => {
    if (role === 'super_admin') {
      return 'Super Admin';
    }
    return role.charAt(0).toUpperCase() + role.slice(1);
  };

  const getRoleBadgeClasses = (role: string) => {
    switch (role) {
      case 'super_admin':
        return 'bg-purple-600 hover:bg-purple-700 text-white';
      case 'admin':
        return 'bg-blue-600 hover:bg-blue-700 text-white';
      default:
        return 'bg-gray-600 hover:bg-gray-700 text-white';
    }
  };

  const getStatusBadgeClasses = (isActive: boolean) => {
    return isActive 
      ? 'bg-green-600 hover:bg-green-700 text-white' 
      : 'bg-red-600 hover:bg-red-700 text-white';
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-6 bg-gray-900 text-gray-100 border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            Admin User Details: {adminUser.first_name} {adminUser.last_name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Basic Information */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-xl text-gray-200">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-400">Admin ID</label>
                  <p className="text-gray-200">{adminUser.admin_id}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-400">Email</label>
                  <p className="text-gray-200">{adminUser.admin_email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-400">First Name</label>
                  <p className="text-gray-200">{adminUser.first_name || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-400">Last Name</label>
                  <p className="text-gray-200">{adminUser.last_name || 'N/A'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Role & Status */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-xl text-gray-200">Role & Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-400">Role</label>
                  <div className="mt-1">
                    <Badge className={`transition-colors duration-200 ${getRoleBadgeClasses(adminUser.role)}`}>
                      {formatRoleForDisplay(adminUser.role)}
                    </Badge>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-400">Status</label>
                  <div className="mt-1">
                    <Badge className={`transition-colors duration-200 ${getStatusBadgeClasses(adminUser.is_active)}`}>
                      {adminUser.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Access & Permissions */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-xl text-gray-200">Access & Permissions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-400">Access Level</label>
                  <p className="text-gray-200">{adminUser.access_level || 'Standard'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-400">Admin Roles</label>
                  <p className="text-gray-200">{adminUser.admin_roles || 'N/A'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Timestamps */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-xl text-gray-200">Account Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-400">Created At</label>
                  <p className="text-gray-200">{formatDate(adminUser.created_at)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-400">Last Updated</label>
                  <p className="text-gray-200">{formatDate(adminUser.updated_at)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-400">Last Login</label>
                  <p className="text-gray-200">{formatDate(adminUser.last_login_at)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
} 