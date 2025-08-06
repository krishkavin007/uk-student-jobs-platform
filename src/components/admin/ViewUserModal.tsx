// src/components/admin/ViewUserModal.tsx

"use client";

import React, { useMemo, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { User } from '@/types/admin-types';
import { Separator } from '@/components/ui/separator';
import { Mail, Phone, Building, University, Calendar, User as UserIcon, Info, Loader2 } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import Image from 'next/image';

interface UserWithImage extends User {
    user_image?: string;
}

interface ViewUserModalProps {
  users: UserWithImage[];
}

export function ViewUserModal({ users }: ViewUserModalProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = searchParams.get('viewUser');
  const [isLoading, setIsLoading] = useState(true);
  
  const user = useMemo(() => {
    if (!userId) return null;
    return users.find(u => u.user_id.toString() === userId) || null;
  }, [users, userId]);
  
  const isOpen = !!userId;

  // Handle loading state - only show loading if users array is empty
  useEffect(() => {
    if (isOpen) {
      if (users.length === 0) {
        setIsLoading(true);
        // Show loading only if no users data is available
        const timer = setTimeout(() => {
          setIsLoading(false);
        }, 500);
        return () => clearTimeout(timer);
      } else {
        setIsLoading(false);
      }
    }
  }, [isOpen, userId, users.length]);

  const handleClose = () => {
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.delete('viewUser');
    router.push(`?${newSearchParams.toString()}`, { scroll: false });
  };

  const getStatusBadgeClasses = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'bg-green-600 hover:bg-green-700 text-white';
      case 'inactive':
        return 'bg-yellow-500 hover:bg-yellow-600 text-white';
      case 'suspended':
        return 'bg-red-600 hover:bg-red-700 text-white';
      default:
        return 'bg-gray-600 hover:bg-gray-700 text-white';
    }
  };

  const getTypeBadgeClasses = (userType: string) => {
    switch (userType?.toLowerCase()) {
      case 'student':
        return 'bg-blue-600 hover:bg-blue-700 text-white';
      case 'employer':
        // Corrected employer badge to a different blue to avoid conflict with 'student' badge
        return 'bg-sky-600 hover:bg-sky-700 text-white'; 
      case 'admin':
        return 'bg-purple-600 hover:bg-purple-700 text-white';
      case 'super_admin':
        return 'bg-red-600 hover:bg-red-700 text-white';
      default:
        return 'bg-gray-600 hover:bg-gray-700 text-white';
    }
  };
  
  const formatDate = (dateString?: string) => {
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

  if (!isOpen) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl h-[540px] overflow-hidden p-6 bg-gray-900 text-gray-100 border-gray-700 rounded-lg shadow-xl">
        <DialogHeader className="border-b border-gray-700 pb-4 mb-4">
          <DialogTitle className="text-3xl font-bold flex items-center gap-3 text-white">
            <UserIcon size={28} /> User Details
          </DialogTitle>
        </DialogHeader>

        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500 mx-auto mb-4" />
              <p className="text-gray-400">Loading user details...</p>
            </div>
          </div>
        )}

        {!isLoading && !user && (
          <div className="text-center text-red-500 py-12 text-lg">
            User not found. Please try again.
          </div>
        )}

        {!isLoading && user && (
          <div className="space-y-4">
            {/* User Header */}
            <div className="flex items-center space-x-6 p-4 rounded-lg bg-gray-800 border border-gray-700">
                {user.user_image ? (
                    <Image
                        src={user.user_image}
                        alt={`${user.user_first_name} ${user.user_last_name}`}
                        width={64}
                        height={64}
                        className="rounded-full object-cover"
                    />
                ) : (
                    <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center text-3xl font-bold text-white shrink-0">
                        {getInitials(user.user_first_name, user.user_last_name)}
                    </div>
                )}
                
                <div className="flex-grow">
                    <h3 className="text-2xl font-semibold text-white">{user.user_first_name} {user.user_last_name}</h3>
                    <p className="text-gray-400 text-sm">User ID: {user.user_id}</p>
                </div>
                <div className="flex space-x-2">
                    <Badge className={`px-3 py-1 text-sm font-medium ${getTypeBadgeClasses(user.user_type)}`}>
                        {user.user_type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                    </Badge>
                    <Badge className={`px-3 py-1 text-sm font-medium ${getStatusBadgeClasses(user.user_status)}`}>
                        {user.user_status?.charAt(0).toUpperCase() + user.user_status?.slice(1).toLowerCase()}
                    </Badge>
                </div>
            </div>

            {/* Tabbed Content */}
            <Tabs defaultValue="basic-info" className="w-full">
              <TabsList className="grid w-full grid-cols-2 lg:grid-cols-3 bg-gray-800 border border-gray-700">
                <TabsTrigger 
                    value="basic-info" 
                    // Updated classes for a darker active state
                    className="data-[state=active]:bg-gray-700 data-[state=active]:text-white text-gray-400"
                >
                    Basic Info
                </TabsTrigger>
                {(user.user_type === 'employer' || user.user_type === 'student') && (
                  <TabsTrigger 
                      value="org-info"
                      // Updated classes for a darker active state
                      className="data-[state=active]:bg-gray-700 data-[state=active]:text-white text-gray-400"
                  >
                    {user.user_type === 'employer' ? 'Organization' : 'University'}
                  </TabsTrigger>
                )}
                <TabsTrigger 
                    value="account-history"
                    // Updated classes for a darker active state
                    className="data-[state=active]:bg-gray-700 data-[state=active]:text-white text-gray-400"
                >
                    Account History
                </TabsTrigger>
              </TabsList>

              <TabsContent value="basic-info" className="mt-4 h-[250px] overflow-y-auto">
                <Card className="bg-gray-800 border-gray-700">
                  <CardContent className="p-6 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-400">Email</p>
                        <p className="text-white">{user.user_email}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-400">Username</p>
                        <p className="text-white">{user.user_username || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-400">Phone Number</p>
                        <p className="text-white">{user.contact_phone_number || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-400">City</p>
                        <p className="text-white">{user.user_city || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-400">Google ID</p>
                        <p className="text-white">{user.google_id || 'N/A'}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {(user.user_type === 'employer' || user.user_type === 'student') && (
                <TabsContent value="org-info" className="mt-4 h-[250px] overflow-y-auto">
                  <Card className="bg-gray-800 border-gray-700">
                    <CardContent className="p-6 space-y-4">
                      {user.user_type === 'employer' ? (
                        <div>
                          <p className="text-sm font-medium text-gray-400">Organization Name</p>
                          <p className="text-white">{user.organisation_name || 'N/A'}</p>
                        </div>
                      ) : (
                        <div>
                          <p className="text-sm font-medium text-gray-400">University/College</p>
                          <p className="text-white">{user.university_college || 'N/A'}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              )}

              <TabsContent value="account-history" className="mt-4 h-[250px] overflow-y-auto">
                <Card className="bg-gray-800 border-gray-700">
                  <CardContent className="p-6 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-400">Created At</p>
                        <p className="text-white">{formatDate(user.created_at)}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-400">Last Updated</p>
                        <p className="text-white">{formatDate(user.updated_at)}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-400">Last Login</p>
                        <p className="text-white">{formatDate(user.last_login)}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}