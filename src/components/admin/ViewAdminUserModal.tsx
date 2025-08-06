// src/components/admin/ViewAdminUserModal.tsx
"use client";

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { AdminUser } from '@/types/admin-types';
import Image from 'next/image';
import { User as UserIcon } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

interface AdminUserWithImage extends AdminUser {
    admin_image?: string;
}

interface ViewAdminUserModalProps {
  adminUser: AdminUserWithImage | null;
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
    switch (role.toLowerCase()) {
      case 'super_admin':
        return 'bg-red-600 hover:bg-red-700 text-white';
      case 'admin':
        return 'bg-purple-600 hover:bg-purple-700 text-white';
      default:
        return 'bg-gray-600 hover:bg-gray-700 text-white';
    }
  };

  const getStatusBadgeClasses = (isActive: boolean) => {
    return isActive 
      ? 'bg-green-600 hover:bg-green-700 text-white' 
      : 'bg-gray-600 hover:bg-gray-700 text-white';
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

  const getInitials = (firstName: string | undefined, lastName: string | undefined) => {
    const firstInitial = firstName?.charAt(0) || '';
    const lastInitial = lastName?.charAt(0) || '';
    return (firstInitial + lastInitial).toUpperCase();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      {/* Decreased main modal height from 540px to 500px */}
      <DialogContent className="max-w-3xl h-[500px] overflow-hidden p-6 bg-gray-900 text-gray-100 border-gray-700">
        <DialogHeader className="border-b border-gray-700 pb-4 mb-4">
          <DialogTitle className="text-3xl font-bold flex items-center gap-2">
            <UserIcon size={28} /> Admin User Details
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
            <div className="flex items-center space-x-6 p-4 rounded-lg bg-gray-800 border border-gray-700">
                {adminUser.admin_image ? (
                    <Image
                        src={adminUser.admin_image}
                        alt={`${adminUser.first_name} ${adminUser.last_name}`}
                        width={64}
                        height={64}
                        className="rounded-full object-cover shrink-0"
                    />
                ) : (
                    <div className="w-16 h-16 rounded-full bg-purple-600 flex items-center justify-center text-3xl font-bold text-white shrink-0">
                        {getInitials(adminUser.first_name, adminUser.last_name)}
                    </div>
                )}
                
                <div className="flex-grow">
                    <h3 className="text-2xl font-semibold text-white">{adminUser.first_name} {adminUser.last_name}</h3>
                    <p className="text-gray-400 text-sm">Admin ID: {adminUser.admin_id}</p>
                </div>
                <div className="flex space-x-2 shrink-0">
                    <Badge className={`px-3 py-1 text-sm font-medium ${getRoleBadgeClasses(adminUser.role)}`}>
                        {formatRoleForDisplay(adminUser.role)}
                    </Badge>
                    <Badge className={`px-3 py-1 text-sm font-medium ${getStatusBadgeClasses(adminUser.is_active)}`}>
                        {adminUser.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                </div>
            </div>

            <Tabs defaultValue="basic-info" className="w-full">
              <TabsList className="grid w-full grid-cols-3 bg-gray-800 border border-gray-700">
                <TabsTrigger 
                    value="basic-info" 
                    className="data-[state=active]:bg-gray-700 data-[state=active]:text-white text-gray-400"
                >
                    Basic Info
                </TabsTrigger>
                <TabsTrigger 
                    value="access"
                    className="data-[state=active]:bg-gray-700 data-[state=active]:text-white text-gray-400"
                >
                    Access & Permissions
                </TabsTrigger>
                <TabsTrigger 
                    value="account-history"
                    className="data-[state=active]:bg-gray-700 data-[state=active]:text-white text-gray-400"
                >
                    Account History
                </TabsTrigger>
              </TabsList>

              {/* Adjusted tab content height to fit the new modal size */}
              <TabsContent value="basic-info" className="mt-4 h-[260px] overflow-y-auto">
                <Card className="bg-gray-800 border-gray-700">
                  <CardContent className="p-6 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-400">Email</p>
                        <p className="text-gray-200">{adminUser.admin_email}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-400">First Name</p>
                        <p className="text-gray-200">{adminUser.first_name || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-400">Last Name</p>
                        <p className="text-gray-200">{adminUser.last_name || 'N/A'}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="access" className="mt-4 h-[260px] overflow-y-auto">
                <Card className="bg-gray-800 border-gray-700">
                  <CardContent className="p-6 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-400">Access Level</p>
                        <p className="text-gray-200">{adminUser.access_level || 'Standard'}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-400">Admin Roles</p>
                        <p className="text-gray-200">{adminUser.admin_roles || 'N/A'}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="account-history" className="mt-4 h-[260px] overflow-y-auto">
                <Card className="bg-gray-800 border-gray-700">
                  <CardContent className="p-6 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm font-medium text-gray-400">Created At</p>
                            <p className="text-gray-200">{formatDate(adminUser.created_at)}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-400">Last Updated</p>
                            <p className="text-gray-200">{formatDate(adminUser.updated_at)}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-400">Last Login</p>
                            <p className="text-gray-200">{formatDate(adminUser.last_login_at)}</p>
                        </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}